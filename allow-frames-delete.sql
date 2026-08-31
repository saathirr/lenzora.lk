-- ============================================================================
-- Lenzora.lk — ALLOW DELETING FRAMES FROM THE ADMIN SALES / FRAMES PAGE
-- ============================================================================
-- Drops the delete-protection trigger on the `frames` table so the admin can
-- delete/remove individual frame entries from the Sales page or Frames page
-- whenever needed.
-- (This only affects `frames` — orders & invoices stay protected.)
--
-- Run this ONCE in: Supabase Dashboard -> SQL Editor -> New query -> RUN
-- ============================================================================
DROP TRIGGER IF EXISTS prevent_frames_delete ON public.frames;

-- ============================================================================
-- Verify: should return 0 rows (no delete trigger left on frames).
--   SELECT tgname FROM pg_trigger
--   WHERE tgrelid = 'public.frames'::regclass AND tgname = 'prevent_frames_delete';
-- ============================================================================
