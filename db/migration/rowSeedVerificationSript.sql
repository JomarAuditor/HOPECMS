--Verification--
-- 1. ROW COUNTS
SELECT 'modules'    AS table_name, COUNT(*) AS row_count FROM modules
UNION ALL
SELECT 'rights',                   COUNT(*)              FROM rights
UNION ALL
SELECT 'customer',                 COUNT(*)              FROM customer
UNION ALL
SELECT 'user_rights',              COUNT(*)              FROM user_rights;

-- 2. VERIFY 4 MODULES
SELECT module_code, module_name FROM modules ORDER BY module_code;

-- 3. VERIFY 9 RIGHTS (with their parent module)
SELECT r.right_code, r.module_code, r.description
FROM rights r
JOIN modules m ON r.module_code = m.module_code
ORDER BY r.module_code, r.right_code;

-- 4. FK CHECK — rights with no matching module (should return 0 rows)
SELECT r.right_code, r.module_code
FROM rights r
LEFT JOIN modules m ON r.module_code = m.module_code
WHERE m.module_code IS NULL;

-- 5. FK CHECK — user_rights with no matching customer (should return 0 rows)
SELECT ur.custno
FROM user_rights ur
LEFT JOIN customer c ON ur.custno = c.custno
WHERE c.custno IS NULL;

-- 6. VERIFY SUPERADMIN user exists in customer
SELECT custno, custname, record_status, stamp
FROM customer
WHERE custno = 'jcesperanza@neu.edu.ph';

-- 7. VERIFY SUPERADMIN has ALL 9 rights = 1
SELECT
    custno,
    CUST_VIEW, CUST_ADD, CUST_EDIT, CUST_DEL,
    SALES_VIEW, SD_VIEW,
    PROD_VIEW, PRICE_VIEW,
    ADM_USER
FROM user_rights
WHERE custno = 'jcesperanza@neu.edu.ph';

-- 8. SANITY CHECK — any right not equal to 1 for SUPERADMIN (should return 0 rows)
SELECT custno FROM user_rights
WHERE custno = 'jcesperanza@neu.edu.ph'
  AND (
    CUST_VIEW   <> 1 OR CUST_ADD  <> 1 OR
    CUST_EDIT   <> 1 OR CUST_DEL  <> 1 OR
    SALES_VIEW  <> 1 OR SD_VIEW   <> 1 OR
    PROD_VIEW   <> 1 OR PRICE_VIEW <> 1 OR
    ADM_USER    <> 1
  );