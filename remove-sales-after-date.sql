-- ============================================================================
-- Lenzora.lk — REMOVE SPECIFIC SALES (temporary, one-time cleanup)
-- ============================================================================
-- Delete sales created AFTER 24/08/2026 (the 27/08 lump-sum entries),
-- then re-enable the delete-protection so future sales stay safe.
--
-- Run this ONCE in: Supabase Dashboard -> SQL Editor -> New query -> RUN
-- ============================================================================

BEGIN;

-- 1) Temporarily disable the delete-protection trigger on sales (if it exists).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_sales_delete' AND tgrelid = 'public.sales'::regclass) THEN
    ALTER TABLE public.sales DISABLE TRIGGER prevent_sales_delete;
  END IF;
END $$;

-- 2) Delete ONLY the sales created after 24/08/2026 (the 27/08 entries).
DELETE FROM public.sales
WHERE created_at > '2026-08-24 23:59:59+00';

-- 3) Re-enable the delete-protection trigger (if it exists).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_sales_delete' AND tgrelid = 'public.sales'::regclass) THEN
    ALTER TABLE public.sales ENABLE TRIGGER prevent_sales_delete;
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- Verify: should only show sales up to 24/08/2026.
-- ============================================================================
SELECT id, item_name, amount, created_at
FROM public.sales
ORDER BY created_at DESC;
