-- ============================================================
-- FILE: db/migration/provisionNewUserTrigger.sql
-- Trigger: provision_new_user()
-- Fires on INSERT to auth.users
-- Creates USER row (INACTIVE), seeds 4 modules + 9 rights
-- ============================================================

CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   INT;
BEGIN
  -- 1. Insert into public.user table as INACTIVE
  INSERT INTO public.user (
    auth_uid,
    email,
    record_status,
    stamp
  )
  VALUES (
    NEW.id,
    NEW.email,
    'INACTIVE',
    NOW()
  )
  RETURNING id INTO v_user_id;

  -- 2. Seed user_module (4 modules)
  INSERT INTO public.user_module (user_id, module_id, stamp)
  SELECT v_user_id, id, NOW()
  FROM public."Module"
  WHERE module_code IN ('Cust_Mod', 'Sales_Mod', 'Prod_Mod', 'Adm_Mod');

  -- 3. Seed UserModule_Rights (9 rights, some =1, admin/edit/del =0)
  INSERT INTO public."UserModule_Rights" (user_id, right_code, is_granted, stamp)
  SELECT
    v_user_id,
    r.right_code,
    CASE
      WHEN r.right_code IN ('CUST_VIEW', 'SALES_VIEW', 'SD_VIEW', 'PROD_VIEW', 'PRICE_VIEW')
        THEN 1
      ELSE 0
    END,
    NOW()
  FROM public.rights r
  WHERE r.right_code IN (
    'CUST_VIEW', 'CUST_ADD', 'CUST_EDIT', 'CUST_DEL',
    'SALES_VIEW', 'SD_VIEW',
    'PROD_VIEW', 'PRICE_VIEW',
    'ADM_USER'
  );

  RETURN NEW;
END;
$$;

-- Drop if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION provision_new_user();
