-- ============================================================================
-- Lenzora.lk — PROTECT SALES HISTORY (BLOCK ALL DELETES)
-- ============================================================================
-- Run this ONCE in: Supabase Dashboard -> SQL Editor -> New query -> RUN
-- It makes sales, frames, orders, invoices and invoice_items permanently
-- protected: any attempt to DELETE a row raises an error, so history and
-- dashboard amounts can never be lost again.
-- ============================================================================

-- 1) Trigger function that blocks every DELETE on protected tables.
CREATE OR REPLACE FUNCTION public.prevent_revenue_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Deleting % is not allowed. Sales/financial history is protected.', TG_TABLE_NAME
    USING ERRCODE = '55000';
END;
$$ LANGUAGE plpgsql;

-- 2) Apply the guard to each financial table.
DROP TRIGGER IF EXISTS prevent_sales_delete ON public.sales;
CREATE TRIGGER prevent_sales_delete
  BEFORE DELETE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.prevent_revenue_delete();

DROP TRIGGER IF EXISTS prevent_frames_delete ON public.frames;
CREATE TRIGGER prevent_frames_delete
  BEFORE DELETE ON public.frames
  FOR EACH ROW EXECUTE FUNCTION public.prevent_revenue_delete();

DROP TRIGGER IF EXISTS prevent_orders_delete ON public.orders;
CREATE TRIGGER prevent_orders_delete
  BEFORE DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.prevent_revenue_delete();

DROP TRIGGER IF EXISTS prevent_invoices_delete ON public.invoices;
CREATE TRIGGER prevent_invoices_delete
  BEFORE DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.prevent_revenue_delete();

DROP TRIGGER IF EXISTS prevent_invoice_items_delete ON public.invoice_items;
CREATE TRIGGER prevent_invoice_items_delete
  BEFORE DELETE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.prevent_revenue_delete();

-- ============================================================================
-- Verify: this should return 1 row per table (the triggers exist).
--   SELECT tgname, tgrelid::regclass FROM pg_trigger
--   WHERE tgname LIKE 'prevent_%' ORDER BY tgrelid::regclass::text;
-- ============================================================================
