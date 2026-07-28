BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 03: Database Triggers
--
-- 1. handle_new_user_referral — When a new row is inserted into public.users,
--    check if their Supabase auth metadata contains a `referral_code`.
--    If so, look up the referrer in the users table and insert a user_referrals
--    record, permanently linking the two users.
--
-- 2. handle_new_user_code_gen — When a new row is inserted into public.users
--    that does NOT already have a `meta->referral_code`, auto-generate a unique
--    referral code derived from their name and a random 4-digit suffix.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Auto-generate a referral code for every new user ──────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user_code_gen()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
    v_code TEXT;
    v_base TEXT;
    v_suffix TEXT;
    v_exists BOOLEAN;
BEGIN
    -- Only generate if not already set
    IF NEW.meta IS NOT NULL AND (NEW.meta->>'referral_code') IS NOT NULL AND (NEW.meta->>'referral_code') != '' THEN
        RETURN NEW;
    END IF;

    -- Build a unique code: first 6 alphanum chars of name + 4-digit random suffix
    v_base := UPPER(REGEXP_REPLACE(COALESCE(NEW.name, 'USER'), '[^A-Za-z0-9]', '', 'g'));
    v_base := SUBSTRING(v_base FROM 1 FOR 6);

    -- Retry loop for collision avoidance
    LOOP
        v_suffix := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
        v_code := v_base || v_suffix;

        SELECT EXISTS (
            SELECT 1 FROM public.users
            WHERE meta->>'referral_code' = v_code
        ) INTO v_exists;

        EXIT WHEN NOT v_exists;
    END LOOP;

    -- Write the generated code into this user's meta
    NEW.meta := jsonb_set(
        COALESCE(NEW.meta, '{}'::jsonb),
        '{referral_code}',
        to_jsonb(v_code)
    );

    RETURN NEW;
END;
$$;

-- Attach to users table BEFORE INSERT so meta is set before the row lands
DROP TRIGGER IF EXISTS trg_new_user_code_gen ON public.users;
CREATE TRIGGER trg_new_user_code_gen
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_code_gen();


-- ── 2. Create user_referrals record if a referral_code was used at signup ─────

CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
    v_ref_code TEXT;
    v_referrer_id UUID;
BEGIN
    -- Extract the referral_code from auth user metadata (passed via signUp options.data)
    -- Supabase populates raw_user_meta_data on the auth.users row.
    -- We read it back from the NEW.meta column since our users table is populated from there.

    -- Try to get it from the users.meta column first (may have been set by frontend form)
    v_ref_code := UPPER(TRIM(COALESCE(NEW.meta->>'used_referral_code', '')));

    -- If blank, try auth metadata via a cross-schema lookup
    IF v_ref_code = '' THEN
        BEGIN
            SELECT UPPER(TRIM(raw_user_meta_data->>'referral_code'))
            INTO v_ref_code
            FROM auth.users
            WHERE id = NEW.id;
        EXCEPTION WHEN OTHERS THEN
            -- Cross-schema lookup may be restricted in some setups; skip gracefully
            v_ref_code := '';
        END;
    END IF;

    IF v_ref_code IS NULL OR v_ref_code = '' THEN
        RETURN NEW;
    END IF;

    -- Prevent self-referral
    IF v_ref_code = UPPER(TRIM(COALESCE(NEW.meta->>'referral_code', ''))) THEN
        RETURN NEW;
    END IF;

    -- Look up the referrer by their referral_code in users.meta
    SELECT id INTO v_referrer_id
    FROM public.users
    WHERE UPPER(meta->>'referral_code') = v_ref_code
    LIMIT 1;

    IF v_referrer_id IS NULL THEN
        RETURN NEW;  -- Code was invalid or referrer not yet in system
    END IF;

    -- Insert the P2P referral relationship (idempotent guard via UNIQUE constraint)
    INSERT INTO public.user_referrals (referrer_user_id, referred_user_id, referral_code)
    VALUES (v_referrer_id, NEW.id, v_ref_code)
    ON CONFLICT (referred_user_id) DO NOTHING;  -- One referrer per user; ignore duplicates

    RETURN NEW;
END;
$$;

-- Attach AFTER INSERT so user row is fully visible for the JOIN
DROP TRIGGER IF EXISTS trg_new_user_referral ON public.users;
CREATE TRIGGER trg_new_user_referral
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_referral();

COMMIT;
