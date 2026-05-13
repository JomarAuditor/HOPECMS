-- ============================================================
-- provisionNewUserTrigger.sql
-- M4 — Rights & Authentication Specialist (Sprint 1, PR-04)
--
-- Fires when a new row is inserted into auth.users (i.e. when
-- a user signs up via email/password OR completes Google OAuth
-- for the first time).
--
-- Creates the matching application-side records:
--   1. public.user  ────  USER / INACTIVE, with metadata
--   2. user_module  ────  4 rows: Cust_Mod, Sales_Mod, Prod_Mod, Adm_Mod
--   3. UserModule_Rights ── 9 rows: VIEW rights = 1, all others = 0
--
-- Per Sprint 1 Deliverables M4 spec:
--   "CUST_VIEW=1, SALES_VIEW=1, SD_VIEW=1, PROD_VIEW=1, PRICE_VIEW=1;
--    all add/edit/del/admin rights=0"
-- ============================================================

-- ── 1. Function ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username VARCHAR(50);
  v_fullname TEXT;
BEGIN
  -- Pull username/full_name from auth metadata if provided
  -- (Register.jsx sends these in options.data; Google OAuth
  -- gives us full_name from the Google profile)
  v_username := COALESCE(
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(NEW.email, '@', 1)
  );

  v_fullname := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'username',
    split_part(NEW.email, '@', 1)
  );

  -- ── (a) Insert into public.user as USER / INACTIVE ──
  INSERT INTO public."user" (userId, username, email, user_type, record_status, stamp)
  VALUES (
    NEW.id::TEXT,
    v_username,
    NEW.email,
    'USER',
    'INACTIVE',
    'PROVISIONED:' || to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  )
  ON CONFLICT (userId) DO NOTHING;

  -- ── (b) Seed 4 user_module rows (rights_value = 0 by default) ──
  -- ADMIN/SUPERADMIN will flip these as needed via Admin Module (Sprint 3)
  INSERT INTO public.user_module (userId, moduleCode, rights_value) VALUES
    (NEW.id::TEXT, 'Cust_Mod',  0),
    (NEW.id::TEXT, 'Sales_Mod', 0),
    (NEW.id::TEXT, 'Prod_Mod',  0),
    (NEW.id::TEXT, 'Adm_Mod',   0)
  ON CONFLICT (userId, moduleCode) DO NOTHING;

  -- ── (c) Seed 9 UserModule_Rights rows ──
  -- Defaults per Sprint 1 spec:
  --   VIEW rights = 1  (CUST_VIEW, SALES_VIEW, SD_VIEW, PROD_VIEW, PRICE_VIEW)
  --   All add/edit/del/admin = 0
  INSERT INTO public.UserModule_Rights (userId, rightCode, right_value) VALUES
    (NEW.id::TEXT, 'CUST_VIEW',  1),
    (NEW.id::TEXT, 'CUST_ADD',   0),
    (NEW.id::TEXT, 'CUST_EDIT',  0),
    (NEW.id::TEXT, 'CUST_DEL',   0),
    (NEW.id::TEXT, 'SALES_VIEW', 1),
    (NEW.id::TEXT, 'SD_VIEW',    1),
    (NEW.id::TEXT, 'PROD_VIEW',  1),
    (NEW.id::TEXT, 'PRICE_VIEW', 1),
    (NEW.id::TEXT, 'ADM_USER',   0)
  ON CONFLICT (userId, rightCode) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ── 2. Trigger ────────────────────────────────────────────────
-- Drop first in case of re-run during development
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.provision_new_user();

-- ── 3. Verification queries (run after a test signup) ─────────
-- SELECT userId, email, user_type, record_status FROM public."user" ORDER BY stamp DESC LIMIT 1;
-- SELECT * FROM public.user_module WHERE userId = (SELECT userId FROM public."user" ORDER BY stamp DESC LIMIT 1);
-- SELECT * FROM public.UserModule_Rights WHERE userId = (SELECT userId FROM public."user" ORDER BY stamp DESC LIMIT 1);
-- Expected: 1 user row (INACTIVE), 4 module rows (all 0), 9 rights rows (5×1 + 4×0)
