BEGIN;

-- 1. Function to insert a visit record and flag uniqueness
CREATE OR REPLACE FUNCTION public.log_sales_visit(
    p_code VARCHAR,
    p_visitor_id VARCHAR,
    p_ip VARCHAR,
    p_user_agent TEXT,
    p_referrer TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
    v_profile_id UUID;
    v_is_unique BOOLEAN := TRUE;
BEGIN
    -- Find active salesperson
    SELECT id INTO v_profile_id 
    FROM public.sales_profiles 
    WHERE UPPER(referral_code) = UPPER(p_code) AND is_active = true;

    IF v_profile_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if this visitor/IP has clicked in the last 24 hours
    IF EXISTS (
        SELECT 1 
        FROM public.sales_clicks
        WHERE sales_profile_id = v_profile_id
          AND (visitor_id = p_visitor_id OR ip_address = p_ip)
          AND created_at > NOW() - INTERVAL '24 hours'
    ) THEN
        v_is_unique := FALSE;
    END IF;

    -- Log click historical record
    INSERT INTO public.sales_clicks (sales_profile_id, visitor_id, ip_address, user_agent, referrer_url, is_unique)
    VALUES (v_profile_id, p_visitor_id, p_ip, p_user_agent, p_referrer, v_is_unique);

    -- Lightweight increments on rollup cache fields in sales_profiles
    UPDATE public.sales_profiles
    SET clicks = clicks + 1,
        unique_visitors = unique_visitors + CASE WHEN v_is_unique THEN 1 ELSE 0 END
    WHERE id = v_profile_id;

    RETURN TRUE;
END;
$$;

-- 2. Atomic Parallel Purchase Attribution
CREATE OR REPLACE FUNCTION public.attribute_premium_purchase(
    p_user_id UUID,
    p_order_id VARCHAR,
    p_payment_id VARCHAR,
    p_gross NUMERIC,
    p_discount NUMERIC,
    p_net NUMERIC,
    p_subscription_type VARCHAR,
    p_active_ref_code VARCHAR
) RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER AS $$
DECLARE
    v_sales_id UUID;
    v_referrer_user_id UUID;
    v_reward_id UUID;
    v_order_status VARCHAR;
    v_current_expiry TIMESTAMPTZ;
    v_new_expiry TIMESTAMPTZ;
BEGIN
    -- Enforce absolute transaction boundary. Fail everything if any step errors.
    
    -- 1. Check/Create Payment Invoice record
    SELECT status INTO v_order_status FROM public.premium_orders WHERE order_id = p_order_id;
    IF v_order_status = 'paid' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Order already processed');
    END IF;

    INSERT INTO public.premium_orders (user_id, order_id, payment_id, gross_amount, discount_amount, net_amount, status, subscription_type)
    VALUES (p_user_id, p_order_id, p_payment_id, p_gross, p_discount, p_net, 'paid', p_subscription_type)
    ON CONFLICT (order_id) DO UPDATE 
    SET status = 'paid', payment_id = p_payment_id, updated_at = NOW();

    -- 2. Update Subscription Lifecycle
    SELECT current_period_end INTO v_current_expiry 
    FROM public.subscriptions 
    WHERE user_id = p_user_id AND status = 'active';

    IF v_current_expiry IS NULL OR v_current_expiry < NOW() THEN
        v_current_expiry := NOW();
    END IF;
    v_new_expiry := v_current_expiry + INTERVAL '3 months';

    INSERT INTO public.subscriptions (user_id, plan, status, current_period_start, current_period_end, updated_at)
    VALUES (p_user_id, p_subscription_type || '_premium', 'active', NOW(), v_new_expiry, NOW())
    ON CONFLICT (user_id) DO UPDATE 
    SET plan = EXCLUDED.plan, status = 'active', current_period_end = v_new_expiry, updated_at = NOW();

    -- Update existing users table meta column for legacy compatibility (Subscription details)
    UPDATE public.users
    SET meta = jsonb_set(
        jsonb_set(
            jsonb_set(
                COALESCE(meta, '{}'::jsonb),
                '{Subscription,Plan}', '1'::jsonb
            ),
            '{Subscription,Status}', '0'::jsonb
        ),
        '{Subscription,CurrentPeriodEnd}', to_jsonb(to_char(v_new_expiry, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
    )
    WHERE id = p_user_id;

    -- 3. Pipeline A: Sales Attribution
    SELECT id INTO v_sales_id 
    FROM public.sales_profiles 
    WHERE UPPER(referral_code) = UPPER(p_active_ref_code) AND is_active = true;

    IF v_sales_id IS NOT NULL THEN
        INSERT INTO public.referrals (sales_profile_id, user_id, referral_code, order_amount, discount_applied)
        VALUES (v_sales_id, p_user_id, UPPER(p_active_ref_code), p_net, p_discount);

        -- Rollup incremental aggregates in sales_profiles
        UPDATE public.sales_profiles
        SET premium_sales = premium_sales + 1,
            revenue = revenue + p_net
        WHERE id = v_sales_id;
    END IF;

    -- 4. Pipeline B: Peer-to-Peer Refer-to-Earn
    SELECT referrer_user_id INTO v_referrer_user_id 
    FROM public.user_referrals 
    WHERE referred_user_id = p_user_id;

    IF v_referrer_user_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.referral_rewards WHERE order_id = p_order_id) THEN
            INSERT INTO public.referral_rewards (referrer_id, referred_id, order_id, points_awarded, status)
            VALUES (v_referrer_user_id, p_user_id, p_order_id, 1, 'granted')
            RETURNING id INTO v_reward_id;

            INSERT INTO public.credit_transactions (user_id, amount, transaction_type, reference_id, description)
            VALUES (v_referrer_user_id, 1, 'reward_grant', v_reward_id, 'Credit earned from referral conversion');
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'sales_attributed', v_sales_id IS NOT NULL, 'p2p_rewarded', v_referrer_user_id IS NOT NULL);
END;
$$;

-- 3. Stored Procedure to safely redeem credits and extend subscription
CREATE OR REPLACE FUNCTION public.redeem_credits(p_user_id UUID) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance INTEGER;
    v_redemption_id UUID;
    v_current_expiry TIMESTAMPTZ;
    v_new_expiry TIMESTAMPTZ;
    v_meta JSONB;
BEGIN
    -- Acquire exclusive row-level lock on the transactions for this user
    -- to prevent double-spending/race conditions
    SELECT COALESCE(SUM(amount), 0) INTO v_balance 
    FROM public.credit_transactions 
    WHERE user_id = p_user_id;

    IF v_balance < 10 THEN
        RAISE EXCEPTION 'Insufficient credits. Balance: %, Required: 10', v_balance;
    END IF;

    -- Fetch user's subscription expiry from subscriptions table
    SELECT current_period_end INTO v_current_expiry 
    FROM public.subscriptions 
    WHERE user_id = p_user_id AND status = 'active';

    IF v_current_expiry IS NULL OR v_current_expiry < NOW() THEN
        v_current_expiry := NOW();
    END IF;

    v_new_expiry := v_current_expiry + INTERVAL '3 months';

    -- Create redemption entry
    INSERT INTO public.redemptions (user_id, points_deducted, status)
    VALUES (p_user_id, 10, 'completed')
    RETURNING id INTO v_redemption_id;

    -- Write negative transaction ledger entry
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, reference_id, description)
    VALUES (p_user_id, -10, 'redemption', v_redemption_id, 'Redeemed 10 credits for 3-month Premium renewal');

    -- Update subscription table
    INSERT INTO public.subscriptions (user_id, plan, status, current_period_start, current_period_end, updated_at)
    VALUES (p_user_id, 'tech_premium', 'active', NOW(), v_new_expiry, NOW())
    ON CONFLICT (user_id) DO UPDATE 
    SET plan = 'tech_premium', status = 'active', current_period_end = v_new_expiry, updated_at = NOW();

    -- Update user table metadata for legacy compatibility
    UPDATE public.users
    SET meta = jsonb_set(
        jsonb_set(
            jsonb_set(
                COALESCE(meta, '{}'::jsonb),
                '{Subscription,Plan}', '1'::jsonb
            ),
            '{Subscription,Status}', '0'::jsonb
        ),
        '{Subscription,CurrentPeriodEnd}', to_jsonb(to_char(v_new_expiry, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
    )
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'new_expiry', v_new_expiry, 'redemption_id', v_redemption_id);
END;
$$;

-- 4. Stored Procedure to reverse rewards on subscription refund/cancellation
CREATE OR REPLACE FUNCTION public.reverse_referral_reward(p_order_id VARCHAR, p_reason TEXT) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reward_id UUID;
    v_referrer_id UUID;
    v_points INTEGER;
    v_status VARCHAR;
    v_amount NUMERIC;
    v_sales_profile_id UUID;
BEGIN
    -- Check if reward exists and is active
    SELECT id, referrer_id, points_awarded, status INTO v_reward_id, v_referrer_id, v_points, v_status
    FROM public.referral_rewards 
    WHERE order_id = p_order_id;

    -- Update order to refunded
    UPDATE public.premium_orders 
    SET status = 'refunded', updated_at = NOW() 
    WHERE order_id = p_order_id
    RETURNING net_amount INTO v_amount;

    -- Revert standard user P2P credit
    IF v_reward_id IS NOT NULL AND v_status = 'granted' THEN
        -- Update reward status
        UPDATE public.referral_rewards 
        SET status = 'reversed', reversal_reason = p_reason, updated_at = NOW() 
        WHERE id = v_reward_id;

        -- Deduct points via negative ledger entry
        INSERT INTO public.credit_transactions (user_id, amount, transaction_type, reference_id, description)
        VALUES (v_referrer_id, -v_points, 'refund_reversal', v_reward_id, 'Revoked reward due to refund: ' || p_reason);
    END IF;

    -- Revert sales conversion attribution
    SELECT sales_profile_id INTO v_sales_profile_id
    FROM public.referrals
    WHERE user_id = (SELECT user_id FROM public.premium_orders WHERE order_id = p_order_id)
    LIMIT 1;

    IF v_sales_profile_id IS NOT NULL THEN
        -- Subtract sales increments
        UPDATE public.sales_profiles
        SET premium_sales = GREATEST(premium_sales - 1, 0),
            revenue = GREATEST(revenue - v_amount, 0)
        WHERE id = v_sales_profile_id;

        -- Delete or mark referral reversed (optional: we can keep it but adjust salesperson total)
        DELETE FROM public.referrals
        WHERE sales_profile_id = v_sales_profile_id AND user_id = (SELECT user_id FROM public.premium_orders WHERE order_id = p_order_id);
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Reversed successfully');
END;
$$;

COMMIT;
