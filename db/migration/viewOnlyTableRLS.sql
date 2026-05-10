--RLS Views-Only table
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('sales','salesdetail','product','pricehist')
ORDER BY tablename, cmd;