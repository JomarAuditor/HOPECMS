--RLS customer 
--Policy 1: SELECT 
--USER sees ACTIVE only; ADMIN/SUPERADMIN see all
  FOR SELECT TO authenticated
  USING (
    record_status = 'ACTIVE'
    OR EXISTS (
      SELECT 1 FROM public."user"
      WHERE userId = auth.uid()::text
        AND user_type IN ('ADMIN','SUPERADMIN')
    )
  );

--Policy 2: INSERT  
-- Allows SUPERADMIN and ADMIN (who have CUST_ADD right) to add customers.
CREATE POLICY cust_insert ON customer
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.UserModule_Rights
      WHERE userId     = auth.uid()::text
        AND rightCode  = 'CUST_ADD'
        AND right_value = 1
    )
  );

--Policy 3: UPDATE 
-- Covers changes to custname, address, payterm, stamp (not record_status).
-- Only rows where record_status is not being toggled.
CREATE POLICY cust_update_edit ON customer
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.UserModule_Rights
      WHERE userId     = auth.uid()::text
        AND rightCode  = 'CUST_EDIT'
        AND right_value = 1
    )
  )
  WITH CHECK (
    -- Prevent this policy from being used to change record_status
    record_status = (SELECT record_status FROM customer WHERE custno = customer.custno)
    AND EXISTS (
      SELECT 1
      FROM public.UserModule_Rights
      WHERE userId     = auth.uid()::text
        AND rightCode  = 'CUST_EDIT'
        AND right_value = 1
    )
  );

-- Policy 4: UPDATE record_status → INACTIVE (soft-delete)
-- Gated by CUST_DEL = 1 (SUPERADMIN only per rights matrix).
CREATE POLICY cust_soft_delete ON customer
  FOR UPDATE TO authenticated
  USING (
    record_status = 'ACTIVE'
    AND EXISTS (
      SELECT 1
      FROM public.UserModule_Rights
      WHERE userId     = auth.uid()::text
        AND rightCode  = 'CUST_DEL'
        AND right_value = 1
    )
  )
  WITH CHECK (
    record_status = 'INACTIVE'
    AND EXISTS (
      SELECT 1
      FROM public.UserModule_Rights
      WHERE userId     = auth.uid()::text
        AND rightCode  = 'CUST_DEL'
        AND right_value = 1
    )
  );

-- Policy 5: UPDATE record_status → ACTIVE (recovery)
-- ADMIN and SUPERADMIN only — no separate right code needed;
-- recovery is part of the ADMIN role definition.
CREATE POLICY cust_recover ON customer
  FOR UPDATE TO authenticated
  USING (
    record_status = 'INACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."user"
      WHERE userId   = auth.uid()::text
        AND user_type IN ('ADMIN','SUPERADMIN')
    )
  )
  WITH CHECK (
    record_status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM public."user"
      WHERE userId   = auth.uid()::text
        AND user_type IN ('ADMIN','SUPERADMIN')
    )
  );