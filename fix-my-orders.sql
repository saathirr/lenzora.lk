-- ============================================================
-- FIX: Restore past orders on the customer dashboard (My Orders)
-- Run this ONCE in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1) Let signed-in users read orders placed with their own email
--    (covers old orders that have no user_id linked)
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (
  auth.uid() = user_id
  OR public.is_admin()
  OR lower(customer_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- 2) Backfill: link old orders to your account by matching email
UPDATE public.orders o
SET user_id = u.id
FROM auth.users u
WHERE lower(o.customer_email) = lower(u.email)
  AND o.user_id IS NULL;

-- 3) Check what you now have (replace with your email if needed):
SELECT id, customer_email, user_id, status, payment_status, amount, created_at
FROM public.orders
ORDER BY created_at DESC;
