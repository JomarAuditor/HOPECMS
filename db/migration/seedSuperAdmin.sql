-- 1. Insert into user table
INSERT INTO "user" (userId, username, email, user_type, record_status, stamp)
VALUES (
  'PASTE_UID_HERE',
  'user',
  'user@neu.edu.ph',
  'SUPERADMIN',
  'ACTIVE',
  'SEEDED-SUPERADMIN'
);

-- 2. Map to all 4 modules (rights_value = 1)
INSERT INTO user_module VALUES ('PASTE_UID_HERE','Cust_Mod',1);
INSERT INTO user_module VALUES ('PASTE_UID_HERE','Sales_Mod',1);
INSERT INTO user_module VALUES ('PASTE_UID_HERE','Prod_Mod',1);
INSERT INTO user_module VALUES ('PASTE_UID_HERE','Adm_Mod',1);

-- 3. Grant all 9 rights (right_value = 1)
INSERT INTO UserModule_Rights VALUES ('PASTE_UID_HERE','CUST_VIEW',1);
INSERT INTO UserModule_Rights VALUES ('PASTE_UID_HERE','CUST_ADD',1);
INSERT INTO UserModule_Rights VALUES ('PASTE_UID_HERE','CUST_EDIT',1);
INSERT INTO UserModule_Rights VALUES ('PASTE_UID_HERE','CUST_DEL',1);
INSERT INTO UserModule_Rights VALUES ('PASTE_UID_HERE','SALES_VIEW',1);
INSERT INTO UserModule_Rights VALUES ('PASTE_UID_HERE','SD_VIEW',1);
INSERT INTO UserModule_Rights VALUES ('PASTE_UID_HERE','PROD_VIEW',1);
INSERT INTO UserModule_Rights VALUES ('PASTE_UID_HERE','PRICE_VIEW',1);
INSERT INTO UserModule_Rights VALUES ('PASTE_UID_HERE','ADM_USER',1);