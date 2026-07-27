-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- 1. Table: subscriptions (Subscription Lifecycle Management)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',            -- 'free', 'tech_premium', 'non_tech_premium'
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',        -- 'active', 'expired', 'cancelled'
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_user_subscription UNIQUE (user_id) -- One subscription lifecycle tracker per user
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- 2. Table: premium_orders (Billing & Order Invoices)
CREATE TABLE IF NOT EXISTS public.premium_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    order_id VARCHAR(255) UNIQUE NOT NULL, -- Razorpay order_id
    payment_id VARCHAR(255) UNIQUE,        -- Razorpay payment_id
    gross_amount NUMERIC(10, 2) NOT NULL,  -- Original Price (e.g. 349.00)
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- (e.g. 50.00)
    net_amount NUMERIC(10, 2) NOT NULL,     -- Price Paid (e.g. 299.00)
    status VARCHAR(50) NOT NULL DEFAULT 'created', -- 'created', 'paid', 'refunded'
    subscription_type VARCHAR(50) NOT NULL,        -- 'tech', 'non-tech'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_premium_orders_order_id ON public.premium_orders(order_id);

-- 3. Table: user_referrals (Peer-to-Peer connections)
CREATE TABLE IF NOT EXISTS public.user_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    referred_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    referral_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_referred_user UNIQUE (referred_user_id),
    CONSTRAINT prevent_self_referral CHECK (referrer_user_id <> referred_user_id)
);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON public.user_referrals(referrer_user_id);

-- 4. Table: referral_rewards
CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    referred_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    order_id VARCHAR(255) NOT NULL REFERENCES public.premium_orders(order_id) ON DELETE RESTRICT,
    points_awarded INTEGER NOT NULL DEFAULT 1 CHECK (points_awarded > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'granted', -- 'granted', 'reversed'
    reversal_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_order_reward UNIQUE (order_id)
);

-- 5. Table: redemptions
CREATE TABLE IF NOT EXISTS public.redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    points_deducted INTEGER NOT NULL DEFAULT 10 CHECK (points_deducted = 10),
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Table: credit_transactions (Ledger)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'reward_grant', 'redemption', 'refund_reversal', 'manual_adjustment'
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id);

-- 7. Table: sales_clicks (Historical visitor log for Sales Partners)
CREATE TABLE IF NOT EXISTS public.sales_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_profile_id UUID NOT NULL REFERENCES public.sales_profiles(id) ON DELETE CASCADE,
    visitor_id VARCHAR(255) NOT NULL,      -- Client-side generated visitor tracker
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    referrer_url TEXT,
    is_unique BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_clicks_profile ON public.sales_clicks(sales_profile_id);
CREATE INDEX IF NOT EXISTS idx_sales_clicks_created ON public.sales_clicks(created_at);

-- 8. Alter existing tables to add required columns
ALTER TABLE public.sales_profiles 
ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_visitors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS premium_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue NUMERIC(12, 2) DEFAULT 0.00;

ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS discount_applied NUMERIC(10, 2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS order_amount NUMERIC(10, 2) DEFAULT 299.00;

COMMIT;
