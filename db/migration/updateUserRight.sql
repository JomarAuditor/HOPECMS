--Grant super admin to 9 rights--
INSERT INTO user_rights(custno, CUST_VIEW, CUST_ADD, CUST_EDIT, CUST_DEL, SALES_VIEW, SD_VIEW, PROD_VIEW, PRICE_VIEW, ADM_USER)
VALUES(
  'jcesperanza@neu.edu.ph',
  1,1,1,1,
  1,1,
  1,1,
  1
)
ON CONFLICT (custno) DO UPDATE SET
CUST_VIEW = 1, CUST_ADD = 1,
CUST_EDIT = 1, CUST_DEL = 1,
SALES_VIEW = 1, SD_VIEW = 1,
PROD_VIEW = 1, PRICE_VIEW =1,
ADM_USER = 1;