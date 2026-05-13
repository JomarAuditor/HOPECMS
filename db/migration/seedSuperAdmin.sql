-- ============================================================
-- seedSuperAdmin.sql
-- M3 — Database Engineer (Sprint 1, PR-02)
--
-- Promotes the project lead's auth account to SUPERADMIN with
-- all 9 rights granted.
--
-- ── ACCOUNT DETAILS ─────────────────────────────────────────
-- Email:    jcesperanza@neu.edu.ph
-- Auth UID: f5affe3e-e184-44b7-b015-343767abcc9b
--
-- ── PREREQUISITE ────────────────────────────────────────────
-- This script assumes the auth account already exists. If
-- not, create it first via:
--   Supabase Dashboard → Authentication → Users →
--   Add user → Create new user
--     Email:    jcesperanza@neu.edu.ph
--     Password: (team agreed) testpassword123
--     ✅ Auto Confirm User
--
-- ── HOW TO RUN ──────────────────────────────────────────────
-- Just paste this whole script into Supabase SQL Editor and
-- run. No edits needed. Then run verifySeeds.sql to confirm
-- rights_granted = 9.
--
-- This uses UPSERT pattern, so it's safe to run after the
-- provision_new_user trigger has already auto-inserted the
-- row as USER/INACTIVE — this script will overwrite it.
-- ============================================================

-- ── 1. Promote the user row to SUPERADMIN / ACTIVE ──
INSERT INTO "user" (userId, username, email, user_type, record_status, stamp)
VALUES (
  'f5affe3e-e184-44b7-b015-343767abcc9b',
  'jcesperanza',
  'jcesperanza@neu.edu.ph',
  'SUPERADMIN',
  'ACTIVE',
  'SEEDED-SUPERADMIN'
)
ON CONFLICT (userId) DO UPDATE SET
  user_type     = 'SUPERADMIN',
  record_status = 'ACTIVE',
  username      = EXCLUDED.username,
  email         = EXCLUDED.email,
  stamp         = 'SEEDED-SUPERADMIN';

-- ── 2. Grant all 4 modules (rights_value = 1) ──
INSERT INTO user_module VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','Cust_Mod',1)
  ON CONFLICT (userId, moduleCode) DO UPDATE SET rights_value = 1;
INSERT INTO user_module VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','Sales_Mod',1)
  ON CONFLICT (userId, moduleCode) DO UPDATE SET rights_value = 1;
INSERT INTO user_module VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','Prod_Mod',1)
  ON CONFLICT (userId, moduleCode) DO UPDATE SET rights_value = 1;
INSERT INTO user_module VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','Adm_Mod',1)
  ON CONFLICT (userId, moduleCode) DO UPDATE SET rights_value = 1;

-- ── 3. Grant all 9 rights (right_value = 1) ──
INSERT INTO UserModule_Rights VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','CUST_VIEW',1)
  ON CONFLICT (userId, rightCode) DO UPDATE SET right_value = 1;
INSERT INTO UserModule_Rights VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','CUST_ADD',1)
  ON CONFLICT (userId, rightCode) DO UPDATE SET right_value = 1;
INSERT INTO UserModule_Rights VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','CUST_EDIT',1)
  ON CONFLICT (userId, rightCode) DO UPDATE SET right_value = 1;
INSERT INTO UserModule_Rights VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','CUST_DEL',1)
  ON CONFLICT (userId, rightCode) DO UPDATE SET right_value = 1;
INSERT INTO UserModule_Rights VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','SALES_VIEW',1)
  ON CONFLICT (userId, rightCode) DO UPDATE SET right_value = 1;
INSERT INTO UserModule_Rights VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','SD_VIEW',1)
  ON CONFLICT (userId, rightCode) DO UPDATE SET right_value = 1;
INSERT INTO UserModule_Rights VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','PROD_VIEW',1)
  ON CONFLICT (userId, rightCode) DO UPDATE SET right_value = 1;
INSERT INTO UserModule_Rights VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','PRICE_VIEW',1)
  ON CONFLICT (userId, rightCode) DO UPDATE SET right_value = 1;
INSERT INTO UserModule_Rights VALUES ('f5affe3e-e184-44b7-b015-343767abcc9b','ADM_USER',1)
  ON CONFLICT (userId, rightCode) DO UPDATE SET right_value = 1;

-- ── 4. Verify (optional — also covered by verifySeeds.sql) ──
-- SELECT u.email, u.user_type, u.record_status,
--        COUNT(umr.rightCode) AS rights_granted
-- FROM "user" u
-- JOIN UserModule_Rights umr ON umr.userId = u.userId AND umr.right_value = 1
-- WHERE u.email = 'jcesperanza@neu.edu.ph'
-- GROUP BY u.email, u.user_type, u.record_status;
-- Expected: SUPERADMIN | ACTIVE | rights_granted = 9