-- Supabase SQL Schema for Lenzora.lk
-- Safe to run multiple times (idempotent)

-- Admin role check helper (admins + super admins; SECURITY DEFINER bypasses RLS -> avoids infinite-recursion policies)
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

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT,
  image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  image TEXT,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (Shop) table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  service_id BIGINT REFERENCES services(id),
  product_id BIGINT REFERENCES products(id),
  details TEXT,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Completed','Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-slips', 'payment-slips', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('frame-images', 'frame-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment-slips bucket
DROP POLICY IF EXISTS "Authenticated users can upload slips" ON storage.objects;
CREATE POLICY "Authenticated users can upload slips"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-slips' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view slips" ON storage.objects;
CREATE POLICY "Public can view slips"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-slips');

DROP POLICY IF EXISTS "Admin can delete slips" ON storage.objects;
CREATE POLICY "Admin can delete slips"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'payment-slips' AND
    public.is_admin()
  );

-- Portfolio images storage policies
DROP POLICY IF EXISTS "Admin can upload portfolio images" ON storage.objects;
CREATE POLICY "Admin can upload portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-images' AND public.is_admin());

DROP POLICY IF EXISTS "Public can view portfolio images" ON storage.objects;
CREATE POLICY "Public can view portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "Admin can delete portfolio images" ON storage.objects;
CREATE POLICY "Admin can delete portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio-images' AND
    public.is_admin()
  );

-- Site assets storage policies (logos, favicons, shared assets)
DROP POLICY IF EXISTS "Admin can upload site assets" ON storage.objects;
CREATE POLICY "Admin can upload site assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can update site assets" ON storage.objects;
CREATE POLICY "Admin can update site assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Public can view site assets" ON storage.objects;
CREATE POLICY "Public can view site assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admin can delete site assets" ON storage.objects;
CREATE POLICY "Admin can delete site assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND public.is_admin());

-- Frame images storage policies
DROP POLICY IF EXISTS "Admin can upload frame images" ON storage.objects;
CREATE POLICY "Admin can upload frame images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'frame-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can update frame images" ON storage.objects;
CREATE POLICY "Admin can update frame images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'frame-images' AND public.is_admin());

DROP POLICY IF EXISTS "Public can view frame images" ON storage.objects;
CREATE POLICY "Public can view frame images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'frame-images');

DROP POLICY IF EXISTS "Admin can delete frame images" ON storage.objects;
CREATE POLICY "Admin can delete frame images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'frame-images' AND public.is_admin());

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
-- Resilient: never blocks signup even if profile insert fails (e.g. schema mismatch)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      'customer'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'handle_new_user skipped (could not auto-create profile): %', SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profile columns for existing databases
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin'));
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Manual Sales table (admin-added daily sales)
CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  item_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Expenses table (admin-tracked business/personal expenses)
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'Other',
  notes TEXT,
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS expenses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS expenses ADD COLUMN IF NOT EXISTS expense_date DATE DEFAULT CURRENT_DATE;

-- Site Settings table (single-row website configuration)
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  site_name TEXT DEFAULT 'Lenzora',
  tagline TEXT DEFAULT 'Premium digital graphics services.',
  logo_url TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '94717336756',
  contact_email TEXT DEFAULT 'hello@lenzora.lk',
  facebook_url TEXT DEFAULT 'https://facebook.com/lenzora.lk',
  instagram_url TEXT DEFAULT 'https://instagram.com/lenzora.lk',
  announcement_enabled BOOLEAN DEFAULT false,
  announcement_text TEXT DEFAULT '',
  bank_balance NUMERIC(12,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill columns for existing databases
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Premium digital graphics services.';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT 'https://facebook.com/lenzora.lk';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT 'https://instagram.com/lenzora.lk';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS bank_balance NUMERIC(12,2) DEFAULT 0;

-- Seed default site settings (only if none exist)
INSERT INTO site_settings (id, theme, site_name, whatsapp, contact_email, announcement_enabled, announcement_text)
VALUES (1, 'light', 'Lenzora', '94717336756', 'hello@lenzora.lk', false, '')
ON CONFLICT (id) DO NOTHING;

-- Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Frames table (admin-tracked frame income/sales; profit feeds daily income)
CREATE TABLE IF NOT EXISTS frames (
  id BIGSERIAL PRIMARY KEY,
  frame_size TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  profit NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill columns for existing databases
ALTER TABLE IF EXISTS frames ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE IF EXISTS frames ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE IF EXISTS frames ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';
ALTER TABLE IF EXISTS frames ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Frame Categories table (controls customer-site Frames page categories & photos)
CREATE TABLE IF NOT EXISTS frame_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image_url TEXT DEFAULT '',
  price NUMERIC(10,2),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill columns for existing databases
ALTER TABLE IF EXISTS frame_categories ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE IF EXISTS frame_categories ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);
ALTER TABLE IF EXISTS frame_categories ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS frame_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Migrate legacy category names to the current folder set
UPDATE frame_categories SET name = '4x4 (Mini Frames)', price = 550 WHERE name = '4x4 Frames';
UPDATE frame_categories SET name = 'Customized Frames' WHERE name = 'Customize Size Frame';
DELETE FROM frame_categories WHERE name IN ('5x5 Frames', 'Graduation Frames');

-- Seed default frame folders (name, folder price). NULL price = custom quote.
INSERT INTO frame_categories (name, price, sort_order) VALUES
('A3 Frames', 2600, 1),
('A4 Frames', 1400, 2),
('A5 Frames', 1300, 3),
('6x6 Frames', 750, 4),
('4x4 (Mini Frames)', 550, 5),
('Customized Frames', NULL, 6)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  sort_order = EXCLUDED.sort_order,
  active = true;

-- Frame Category Images table (gallery of related designs inside each folder)
CREATE TABLE IF NOT EXISTS frame_category_images (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES frame_categories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  label TEXT,
  price NUMERIC(10,2),
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill columns for existing databases
ALTER TABLE IF EXISTS frame_category_images ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE IF EXISTS frame_category_images ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);
ALTER TABLE IF EXISTS frame_category_images ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS frame_category_images ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Payment Slips table
CREATE TABLE IF NOT EXISTS payment_slips (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slip_url TEXT NOT NULL,
  bank_name TEXT DEFAULT 'Amana Bank',
  account_no TEXT DEFAULT '0100510024001',
  account_holder TEXT DEFAULT 'MH.Mohamed Saathir',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add payment columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','confirmed'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_slip_id BIGINT REFERENCES payment_slips(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Invoices table (admin-created client invoices)
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  from_name TEXT DEFAULT '',
  from_tagline TEXT DEFAULT '',
  from_email TEXT DEFAULT '',
  from_phone TEXT DEFAULT '',
  from_address TEXT DEFAULT '',
  customer_name TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  discount_percent NUMERIC(5,2) DEFAULT 0 CHECK (discount_percent >= 0),
  tax_percent NUMERIC(5,2) DEFAULT 0 CHECK (tax_percent >= 0),
  subtotal NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT REFERENCES invoices(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(10,2) DEFAULT 1,
  rate NUMERIC(12,2) DEFAULT 0,
  amount NUMERIC(12,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Conversations table (for customer messaging)
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (for replies within conversations)
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  body TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraints if missing (for idempotent seed data)
DO $$
DECLARE
  rec RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_name_key') THEN
    FOR rec IN SELECT name FROM services GROUP BY name HAVING COUNT(*) > 1 LOOP
      DELETE FROM services
      WHERE name = rec.name
        AND id <> (SELECT MIN(id) FROM services WHERE name = rec.name);
    END LOOP;
    ALTER TABLE services ADD CONSTRAINT services_name_key UNIQUE (name);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_title_key') THEN
    FOR rec IN SELECT title FROM portfolio GROUP BY title HAVING COUNT(*) > 1 LOOP
      DELETE FROM portfolio
      WHERE title = rec.title
        AND id <> (SELECT MIN(id) FROM portfolio WHERE title = rec.title);
    END LOOP;
    ALTER TABLE portfolio ADD CONSTRAINT portfolio_title_key UNIQUE (title);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_name_key') THEN
    FOR rec IN SELECT name FROM products GROUP BY name HAVING COUNT(*) > 1 LOOP
      DELETE FROM products
      WHERE name = rec.name
        AND id <> (SELECT MIN(id) FROM products WHERE name = rec.name);
    END LOOP;
    ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoice_items ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "Public can read services" ON services;
CREATE POLICY "Public can read services" ON services FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public can read portfolio" ON portfolio;
CREATE POLICY "Public can read portfolio" ON portfolio FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert orders" ON orders;
CREATE POLICY "Users can insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Profile policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin access (via admin role check)
-- Note: FOR ALL USING handles SELECT/UPDATE/DELETE, WITH CHECK handles INSERT
DROP POLICY IF EXISTS "Admin full access services" ON services;
CREATE POLICY "Admin full access services" ON services FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access portfolio" ON portfolio;
CREATE POLICY "Admin full access portfolio" ON portfolio FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access products" ON products;
CREATE POLICY "Admin full access products" ON products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access orders" ON orders;
CREATE POLICY "Admin full access orders" ON orders FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access messages" ON contact_messages;
CREATE POLICY "Admin full access messages" ON contact_messages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access profiles" ON profiles;
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payment slip policies
DROP POLICY IF EXISTS "Users can insert own payment slips" ON payment_slips;
CREATE POLICY "Users can insert own payment slips" ON payment_slips FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own payment slips" ON payment_slips;
CREATE POLICY "Users can read own payment slips" ON payment_slips FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full access payment_slips" ON payment_slips;
CREATE POLICY "Admin full access payment_slips" ON payment_slips FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Sales policies (admin manage; public read for dashboard/reporting)
DROP POLICY IF EXISTS "Public can read sales" ON sales;
CREATE POLICY "Public can read sales" ON sales FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access sales" ON sales;
CREATE POLICY "Admin full access sales" ON sales FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Expenses policies (admin manage; public read for reporting)
DROP POLICY IF EXISTS "Public can read expenses" ON expenses;
CREATE POLICY "Public can read expenses" ON expenses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access expenses" ON expenses;
CREATE POLICY "Admin full access expenses" ON expenses FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Site settings policies (public read, admin update)
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access site settings" ON site_settings;
CREATE POLICY "Admin full access site settings" ON site_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Frames policies (public read for dashboard/reporting; admin manage)
DROP POLICY IF EXISTS "Public can read frames" ON frames;
CREATE POLICY "Public can read frames" ON frames FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access frames" ON frames;
CREATE POLICY "Admin full access frames" ON frames FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Invoices policies (admin-only; invoices contain private client data)
DROP POLICY IF EXISTS "Admin full access invoices" ON invoices;
CREATE POLICY "Admin full access invoices" ON invoices FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access invoice items" ON invoice_items;
CREATE POLICY "Admin full access invoice items" ON invoice_items FOR ALL
  USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND public.is_admin())
  )
  WITH CHECK (public.is_admin());

-- Frame categories policies (public read; admin manage)
ALTER TABLE IF EXISTS frame_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read frame categories" ON frame_categories;
CREATE POLICY "Public can read frame categories" ON frame_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access frame categories" ON frame_categories;
CREATE POLICY "Admin full access frame categories" ON frame_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Frame category images policies (public read; admin manage)
ALTER TABLE IF EXISTS frame_category_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read frame category images" ON frame_category_images;
CREATE POLICY "Public can read frame category images" ON frame_category_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access frame category images" ON frame_category_images;
CREATE POLICY "Admin full access frame category images" ON frame_category_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Conversation & message policies
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own conversations" ON conversations;
CREATE POLICY "Users can read own conversations" ON conversations
  FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admin full access conversations" ON conversations;
CREATE POLICY "Admin full access conversations" ON conversations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can read own messages" ON messages;
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND (customer_id = auth.uid() OR public.is_admin()))
  );

DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND (customer_id = auth.uid() OR public.is_admin()))
  );

-- Customer order policies
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (
  auth.uid() = user_id
  OR public.is_admin()
  OR lower(customer_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
);

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FINANCIAL DATA PROTECTION (no accidental deletion)
-- Blocks DELETE on sales-history / income tables so history
-- and dashboard amounts can NEVER be removed.
-- ============================================
CREATE OR REPLACE FUNCTION public.prevent_revenue_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Deleting % is not allowed. Sales/financial history is protected.', TG_TABLE_NAME
    USING ERRCODE = '55000';
END;
$$ LANGUAGE plpgsql;

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

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO services (name, description, price, category, active) VALUES
('Photo Editing', 'Professional retouching, color grading, background removal, and restoration for personal or commercial use.', 1500, 'Editing', true),
('Graphic Design', 'Eye-catching designs for print and digital banners, posters, flyers, business cards, and more.', 2500, 'Design', true),
('Brand Identity', 'Complete branding solutions including logo design, color palettes, typography, and brand guidelines.', 8000, 'Branding', true),
('Video Editing', 'Short-form content, Instagram Reels, TikToks, promos, and event highlight edits.', 3000, 'Video', true),
('Social Media Graphics', 'Engaging visuals for Instagram, Facebook, LinkedIn, and TikTok that drive engagement.', 1000, 'Social', true),
('UI/UX Design', 'Modern, user-friendly website and app mockups with clean aesthetics and smooth flows.', 15000, 'Design', true)
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, active) VALUES
('Social Media Pack', '5 custom Instagram post designs.', 2500, 10, true),
('Logo Package', '3 logo concepts with revisions.', 8000, 5, true),
('Photo Retouch (10)', 'Professional retouching for 10 images.', 5000, 20, true),
('Business Card Design', 'Front & back design, print-ready.', 3000, 15, true),
('Brand Identity Kit', 'Logo, palette, typography, mockups.', 15000, 3, true),
('Reel Edit (1 min)', '1-minute Instagram Reel edit.', 4000, 10, true)
ON CONFLICT DO NOTHING;

INSERT INTO portfolio (title, image, category) VALUES
('Social Media Post', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=600&fit=crop', 'Graphic Design'),
('Brand Identity Pack', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=600&fit=crop', 'Branding'),
('Flyer Design', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=600&fit=crop', 'Graphic Design'),
('Color Grading', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=600&fit=crop', 'Photo Editing'),
('Instagram Template', 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=600&fit=crop', 'Social Media'),
('Logo Design', 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&h=600&fit=crop', 'Branding'),
('Portrait Retouch', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', 'Photo Editing'),
('Business Card', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=600&fit=crop', 'Graphic Design')
ON CONFLICT DO NOTHING;

-- ============================================
-- SUPER ADMIN SYSTEM + SECURITY / AUDIT TRAIL
--   super_admin role, login_logs, audit_logs, secure RPCs
-- ============================================
-- Promote the owner after first deploy:
--   SELECT public.grant_super_admin('owner@lenzora.lk');

-- Login logs (who logged in, when, from what device)
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

-- Audit log (who changed what)
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

-- Generic trigger recording every change + who did it
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

-- Attach audit triggers to all business tables (skips missing tables safely)
DO $$
DECLARE
  t TEXT;
  _tbl regclass;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'services', 'portfolio', 'products', 'orders', 'contact_messages',
    'sales', 'expenses', 'site_settings', 'frames', 'frame_categories', 'frame_category_images',
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

-- Secure RPCs (email-based access management; super admin only)
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
