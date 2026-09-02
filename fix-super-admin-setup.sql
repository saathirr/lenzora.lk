-- ============================================================
-- FIX: "profiles_role_check" constraint violation + PROMOTE OWNER
-- Paste this WHOLE file into the Supabase SQL editor and RUN once.
-- Replace your-owner-email@gmail.com below with your real email.
-- ============================================================

-- 1) Inspect: rows that violate the new constraint (bad/empty roles)
SELECT id, role, COALESCE(role, '<NULL>') AS role_value
FROM public.profiles
WHERE role IS NULL OR role NOT IN ('customer', 'admin', 'super_admin');

-- 2) Repair: normalize any bad/empty role to a valid 'customer'
UPDATE public.profiles
SET role = 'customer'
WHERE role IS NULL OR role NOT IN ('customer', 'admin', 'super_admin');

-- 3) Apply the constraint cleanly (now safe after the repair)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'super_admin'));

-- 4) OPTIONAL HARDENING: stop this ever recurring.
--    If full_name/phone metadata is blank, handle_new_user should
--    default role to 'customer' (it may have written '' before).
UPDATE public.profiles
SET role = 'customer'
WHERE role = '' OR role IS NULL;

-- 5) Promote the owner account to SUPER ADMIN.
--    >>> REPLACE the email below with your real account email <<<
SELECT public.grant_super_admin('your-owner-email@gmail.com');