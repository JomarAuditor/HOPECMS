-- ============================================================
-- seedModulesAndRights.sql
-- M3 — Database Engineer (Sprint 1, PR-02)
--
-- Seeds the 4 modules and 9 rights required by the CMS spec.
-- Must be run AFTER rightsTable.sql.
-- ============================================================

-- ── Modules (4) ───────────────────────────────────────────────
INSERT INTO Module VALUES ('Cust_Mod','Customer Module','ACTIVE','SEEDED');
INSERT INTO Module VALUES ('Sales_Mod','Sales Module','ACTIVE','SEEDED');
INSERT INTO Module VALUES ('Prod_Mod','Product Module','ACTIVE','SEEDED');
INSERT INTO Module VALUES ('Adm_Mod','Admin Module','ACTIVE','SEEDED');

-- ── Rights (9) ────────────────────────────────────────────────
INSERT INTO rights VALUES ('CUST_VIEW', 'View Customers',       1,'Cust_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('CUST_ADD',  'Add Customer',         1,'Cust_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('CUST_EDIT', 'Edit Customer',        1,'Cust_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('CUST_DEL',  'Soft Delete Customer', 1,'Cust_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('SALES_VIEW','View Sales',           1,'Sales_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('SD_VIEW',   'View Sales Detail',    1,'Sales_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('PROD_VIEW', 'View Products',        1,'Prod_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('PRICE_VIEW','View Price History',   1,'Prod_Mod','ACTIVE','SEEDED');
INSERT INTO rights VALUES ('ADM_USER',  'Admin Activate User',  1,'Adm_Mod','ACTIVE','SEEDED');
