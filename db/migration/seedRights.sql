--Seed 9 Rights--
INSERT INTO rights (right_code, module_code, description) VALUES
  ('CUST_VIEW',  'Cust_Mod',  'View Customer'),
  ('CUST_ADD',   'Cust_Mod',  'Add Customer'),
  ('CUST_EDIT',  'Cust_Mod',  'Edit Customer'),
  ('CUST_DEL',   'Cust_Mod',  'Delete Customer'),
  ('SALES_VIEW', 'Sales_Mod', 'View Sales'),
  ('SD_VIEW',    'Sales_Mod', 'View Sales Detail'),
  ('PROD_VIEW',  'Prod_Mod',  'View Product'),
  ('PRICE_VIEW', 'Prod_Mod',  'View Price History'),
  ('ADM_USR',     'Adm_Mod',  'Admin User Management')
ON CONFLICT (right_code) DO NOTHING;