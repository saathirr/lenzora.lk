-- Supabase SQL Schema for Lenzora.lk
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Services table
CREATE TABLE services (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT,
  image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio table
CREATE TABLE portfolio (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (Shop) table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
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
CREATE TABLE contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for payment slips
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-slips', 'payment-slips', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment-slips bucket
CREATE POLICY "Authenticated users can upload slips"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-slips' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view slips"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-slips');

CREATE POLICY "Admin can delete slips"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'payment-slips' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cart Items table
CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Slips table
CREATE TABLE payment_slips (
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_slips ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read services" ON services FOR SELECT USING (active = true);
CREATE POLICY "Public can read portfolio" ON portfolio FOR SELECT USING (true);
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Anyone can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Profile policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin access (via admin role check)
-- Note: FOR ALL USING handles SELECT/UPDATE/DELETE, WITH CHECK handles INSERT
DROP POLICY IF EXISTS "Admin full access services" ON services;
CREATE POLICY "Admin full access services" ON services FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access portfolio" ON portfolio;
CREATE POLICY "Admin full access portfolio" ON portfolio FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access products" ON products;
CREATE POLICY "Admin full access products" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access orders" ON orders;
CREATE POLICY "Admin full access orders" ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access messages" ON contact_messages;
CREATE POLICY "Admin full access messages" ON contact_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access profiles" ON profiles;
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payment slip policies
CREATE POLICY "Users can insert own payment slips" ON payment_slips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own payment slips" ON payment_slips FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin full access payment_slips" ON payment_slips;
CREATE POLICY "Admin full access payment_slips" ON payment_slips FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Customer order policies
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SEED DATA (run after tables exist)
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
