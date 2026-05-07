--sEED SUPER ADMIN user in customer Table--
INSERT INTO customer (custno, custname, address, payterm, record_status, stamp)
VALUES (
    'jcesperanza@neu.edu.ph',
    'JC Esperanza',
    'NEU',
    NULL,
    'ACTIVE',
    'SUPERADMIN'
)
ON CONFLICT (custno) DO NOTHING; 