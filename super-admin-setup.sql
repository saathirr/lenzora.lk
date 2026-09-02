-- ============================================================
-- ONE-SHOT SUPER ADMIN SETUP — Lenzora.lk
-- Paste this ENTIRE file into Supabase SQL editor and RUN.
-- ============================================================

-- 1) Repair any bad role values
UPDATE public.profiles
SET role = 'customer'
WHERE role IS NULL OR role NOT IN ('customer', 'admin', 'super_admin');

-- 2) Drop old constraint and reapply with super_admin
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'super_admin'));

-- 3) Role helpers
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 4) Login logs
CREATE TABLE IF NOT EXISTS public.login_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  success BOOLEAN DEFAULT true,
  logged_in_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_logs_time ON public.login_logs(logged_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON public.login_logs(email);

ALTER TABLE IF EXISTS public.login_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can read all login logs" ON public.login_logs;
CREATE POLICY "Super admin can read all login logs"
  ON public.login_logs FOR SELECT
  USING (public.is_super_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can log login attempts" ON public.login_logs;
CREATE POLICY "Anyone can log login attempts"
  ON public.login_logs FOR INSERT
  WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id OR public.is_super_admin()
  );

-- 5) Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_email);

ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can read audit logs" ON public.audit_logs;
CREATE POLICY "Super admin can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_super_admin());

-- 6) Audit trigger function
CREATE OR REPLACE FUNCTION public.handle_audit()
RETURNS TRIGGER AS $$
DECLARE
  _user_id UUID;
  _email TEXT;
  _changes JSONB;
BEGIN
  _user_id := auth.uid();
  SELECT email INTO _email FROM auth.users WHERE id = _user_id;

  _changes := CASE TG_OP
    WHEN 'INSERT' THEN jsonb_build_object('new', to_jsonb(NEW))
    WHEN 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    WHEN 'DELETE' THEN jsonb_build_object('old', to_jsonb(OLD))
  END;

  INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, changes)
  VALUES (_user_id, _email, TG_OP, TG_TABLE_NAME, COALESCE(OLD.id, NEW.id)::text, _changes);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7) Attach audit triggers (skip missing tables)
DO $$
DECLARE
  t TEXT;
  _tbl regclass;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'services', 'portfolio', 'products', 'orders', 'contact_messages',
    'sales', 'site_settings', 'frames', 'frame_categories', 'frame_category_images',
    'payment_slips', 'conversations', 'messages', 'invoices', 'invoice_items',
    'profiles', 'cart_items'
  ]
  LOOP
    SELECT to_regclass(format('public.%I', t)) INTO _tbl;
    IF _tbl IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON %I', t, t);
      EXECUTE format(
        'CREATE TRIGGER trg_audit_%I AFTER INSERT OR UPDATE OR DELETE ON %I
         FOR EACH ROW EXECUTE FUNCTION public.handle_audit()',
        t, t
      );
    END IF;
  END LOOP;
END $$;

-- 8) Secure RPCs — list users
CREATE OR REPLACE FUNCTION public.list_users()
RETURNS TABLE (
  id UUID, email TEXT, full_name TEXT, phone TEXT, role TEXT, created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only the super admin can manage users' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT p.id, u.email, p.full_name, p.phone, p.role, p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY (p.role = 'super_admin') DESC, p.created_at DESC;
END $$;

-- 9) Grant admin access by email
CREATE OR REPLACE FUNCTION public.grant_admin_access(target_email TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid UUID;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only the super admin can manage admin access' USING ERRCODE = '42501';
  END IF;
  IF target_email IS NULL OR trim(target_email) = '' THEN
    RAISE EXCEPTION 'An email address is required';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(trim(target_email));
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No account found for this email';
  END IF;
  UPDATE public.profiles SET role = 'admin', updated_at = NOW() WHERE id = uid;
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, role) VALUES (uid, 'admin');
  END IF;
END $$;

-- 10) Grant super admin by email
CREATE OR REPLACE FUNCTION public.grant_super_admin(target_email TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid UUID;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only the super admin can grant super admin' USING ERRCODE = '42501';
  END IF;
  IF target_email IS NULL OR trim(target_email) = '' THEN
    RAISE EXCEPTION 'An email address is required';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(trim(target_email));
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No account found for this email';
  END IF;
  UPDATE public.profiles SET role = 'super_admin', updated_at = NOW() WHERE id = uid;
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, role) VALUES (uid, 'super_admin');
  END IF;
END $$;

-- 11) Revoke admin access by email
CREATE OR REPLACE FUNCTION public.revoke_admin_access(target_email TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID;
  current_role TEXT;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only the super admin can manage admin access' USING ERRCODE = '42501';
  END IF;
  IF target_email IS NULL OR trim(target_email) = '' THEN
    RAISE EXCEPTION 'An email address is required';
  END IF;
  SELECT p.id, p.role INTO uid, current_role
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(u.email) = lower(trim(target_email));
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No account found for this email';
  END IF;
  IF current_role = 'super_admin' THEN
    RAISE EXCEPTION 'You cannot revoke the super admin' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles SET role = 'customer', updated_at = NOW() WHERE id = uid;
END $$;

-- 12) PROMOTE mohammrdsaathir@gmail.com TO SUPER ADMIN (direct, no function call)
UPDATE public.profiles
SET role = 'super_admin', updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE lower(email) = lower('mohammrdsaathir@gmail.com')
);

-- Edge case: if no profile row exists yet for this user
INSERT INTO public.profiles (id, role, updated_at)
SELECT id, 'super_admin', NOW()
FROM auth.users
WHERE lower(email) = lower('mohammrdsaathir@gmail.com')
  AND id NOT IN (SELECT id FROM public.profiles);