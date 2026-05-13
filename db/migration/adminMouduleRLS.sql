-- 1. Enable RLS on both tables
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE usermodule_rights ENABLE ROW LEVEL SECURITY;

-- 2. CREATE PROTECTION FOR THE USER TABLE
-- Logic: An ADMIN can only update rows where the target is NOT a Superadmin.
DROP POLICY IF EXISTS admin_protect_super ON public.user;
CREATE POLICY admin_protect_super ON public.user
FOR UPDATE 
TO authenticated
USING (
    user_type != 'SUPERADMIN' 
    OR 
    (SELECT user_type FROM public.user WHERE userid = auth.uid()::text) = 'SUPERADMIN'
);

-- 3. CREATE PROTECTION FOR THE RIGHTS TABLE
-- Logic: An ADMIN cannot touch rights belonging to a Superadmin.
DROP POLICY IF EXISTS rights_protect_super ON usermodule_rights;
CREATE POLICY rights_protect_super ON usermodule_rights
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user target
        WHERE target.userid = usermodule_rights.userid
        AND target.user_type != 'SUPERADMIN'
    )
    OR
    (SELECT user_type FROM public.user WHERE userid = auth.uid()::text) = 'SUPERADMIN'
);