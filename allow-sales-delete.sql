-- ============================================================================
-- Lenzora.lk — ALLOW DELETING SALES FROM THE ADMIN SALES PAGE
-- ============================================================================
-- Drops the delete-protection trigger on the `sales` table so the admin can
-- delete/remove individual sale entries from the Sales page whenever needed.
-- (This only affects `sales` — frames, orders & invoices stay protected.)
--
-- Run this ONCE in: Supabase Dashboard -> SQL Editor -> New query -> RUN
-- ============================================================================
DROP TRIGGER IF EXISTS prevent_sales_delete ON public.sales;

-- ============================================================================
-- Verify: should return 0 rows (no delete trigger left on sales).
--   SELECT tgname FROM pg_trigger
--   WHERE tgrelid = 'public.sales'::regclass AND tgname = 'prevent_sales_delete';
-- ============================================================================
