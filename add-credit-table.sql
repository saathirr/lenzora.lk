-- Credit table: amounts customers owe the business.
-- Run this once in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS credit (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  credit_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  paid_date DATE,
  sale_id BIGINT REFERENCES sales(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS credit ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS credit ADD COLUMN IF NOT EXISTS credit_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS credit ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE IF EXISTS credit ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE IF EXISTS credit ADD COLUMN IF NOT EXISTS paid_date DATE;
ALTER TABLE IF EXISTS credit ADD COLUMN IF NOT EXISTS sale_id BIGINT REFERENCES sales(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_credit_status ON credit(status);
CREATE INDEX IF NOT EXISTS idx_credit_credit_date ON credit(credit_date DESC);

ALTER TABLE IF EXISTS credit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read credit" ON credit;
CREATE POLICY "Public can read credit" ON credit FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access credit" ON credit;
CREATE POLICY "Admin full access credit" ON credit FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DO $$
DECLARE
  _tbl regclass;
BEGIN
  SELECT to_regclass('public.credit') INTO _tbl;
  IF _tbl IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_audit_credit ON credit';
    EXECUTE 'CREATE TRIGGER trg_audit_credit AFTER INSERT OR UPDATE OR DELETE ON credit
             FOR EACH ROW EXECUTE FUNCTION public.handle_audit()';
  END IF;
END $$;