--check the tables of HOPECMS
SELECT COUNT(*) AS customer_count FROM customer;
SELECT COUNT(*) AS product_count FROM product;
SELECT COUNT(*) AS sales_count FROM sales;       
SELECT COUNT(*) AS detail_count FROM salesDetail;
SELECT COUNT(*) AS pricehist_count FROM priceHist;

--check the customer table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'customer'
ORDER BY ordinal_position;

-- Verify check Rights and modules
SELECT * FROM Module;
SELECT * FROM rights;

--Verify SUPERADMIN
SELECT u.email, u.user_type, u.record_status,
       COUNT(umr.rightCode) AS rights_granted
FROM "user" u
JOIN UserModule_Rights umr ON umr.userId = u.userId AND umr.right_value = 1
WHERE u.email = 'user@neu.edu.ph'
GROUP BY u.email, u.user_type, u.record_status;
-- Expected: rights_granted = 9