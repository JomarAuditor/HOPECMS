--Seeding Table--
INSERT INTO modules (module_code, module_name) VALUES 
    ('Cust_Mod',  'Customer Module'), 
    ('Sales_Mod', 'Sales Module'),
    ('Prod_Mod',  'Product Module'), 
    ('Adm_Mod',   'Admin Module')
ON CONFLICT (module_code) DO NOTHING;