-- ============================================================================
-- Lenzora.lk — STATIC SALES HISTORY BACKUP
-- ============================================================================
-- Purpose: Export ALL current sales-history records (sales, orders, frames,
--          payment_slips, invoices, invoice_items) as plain INSERT statements
--          that you can save as a static .sql file and re-import anytime.
--
-- HOW TO USE:
--   1) Supabase Dashboard -> SQL Editor -> New query
--   2) Paste this WHOLE file and click RUN.
--   3) The result will be a block of INSERT statements (one per table) that
--      contain every current row. Copy that whole output and save it, e.g.
--      `sales-history-backup-<date>.sql`.
--   4) If your data ever gets deleted, run the saved backup file to restore it.
--
-- To BACK UP ................ run this whole file, copy the output, save it.
-- To RESTORE ................ run the saved backup file (the INSERT blocks).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- STEP 0: Count current rows so you know how much you are backing up.
-- ---------------------------------------------------------------------------
SELECT 'sales' AS table_name, count(*) FROM public.sales
UNION ALL SELECT 'orders',            count(*) FROM public.orders
UNION ALL SELECT 'frames',            count(*) FROM public.frames
UNION ALL SELECT 'payment_slips',     count(*) FROM public.payment_slips
UNION ALL SELECT 'invoices',          count(*) FROM public.invoices
UNION ALL SELECT 'invoice_items',     count(*) FROM public.invoice_items
ORDER BY table_name;

-- ---------------------------------------------------------------------------
-- STEP 1: Generate static INSERT statements for every current row.
--         (Copy the text in the result grid for each table.)
-- ---------------------------------------------------------------------------

------------------------ sales ------------------------
SELECT 'INSERT INTO public.sales (id, item_name, amount, notes, created_at) VALUES (' ||
  quote_nullable(id::text)                || ', ' ||
  quote_nullable(item_name)               || ', ' ||
  quote_nullable(amount::text)            || ', ' ||
  quote_nullable(notes)                   || ', ' ||
  quote_nullable(created_at::text)        ||
  ') ON CONFLICT (id) DO NOTHING;' AS stmt
FROM public.sales
ORDER BY id;

------------------------ orders ------------------------
SELECT 'INSERT INTO public.orders (id, customer_name, customer_email, customer_phone, service_id, product_id, details, amount, status, created_at, user_id, payment_status, payment_slip_id, items) VALUES (' ||
  quote_nullable(id::text)            || ', ' ||
  quote_nullable(customer_name)       || ', ' ||
  quote_nullable(customer_email)      || ', ' ||
  quote_nullable(customer_phone)      || ', ' ||
  quote_nullable(service_id::text)    || ', ' ||
  quote_nullable(product_id::text)    || ', ' ||
  quote_nullable(details)             || ', ' ||
  quote_nullable(amount::text)        || ', ' ||
  quote_nullable(status)              || ', ' ||
  quote_nullable(created_at::text)    || ', ' ||
  quote_nullable(user_id::text)       || ', ' ||
  quote_nullable(payment_status)      || ', ' ||
  quote_nullable(payment_slip_id::text) || ', ' ||
  COALESCE(items::text, '[]')         ||
  ') ON CONFLICT (id) DO NOTHING;' AS stmt
FROM public.orders
ORDER BY id;

------------------------ frames ------------------------
SELECT 'INSERT INTO public.frames (id, frame_size, price, cost, profit, image_url, description, category, active, notes, created_at) VALUES (' ||
  quote_nullable(id::text)         || ', ' ||
  quote_nullable(frame_size)       || ', ' ||
  quote_nullable(price::text)      || ', ' ||
  quote_nullable(cost::text)       || ', ' ||
  quote_nullable(profit::text)     || ', ' ||
  quote_nullable(image_url)        || ', ' ||
  quote_nullable(description)      || ', ' ||
  quote_nullable(category)         || ', ' ||
  quote_nullable(active::text)     || ', ' ||
  quote_nullable(notes)            || ', ' ||
  quote_nullable(created_at::text) ||
  ') ON CONFLICT (id) DO NOTHING;' AS stmt
FROM public.frames
ORDER BY id;

------------------------ payment_slips ------------------------
SELECT 'INSERT INTO public.payment_slips (id, order_id, user_id, slip_url, bank_name, account_no, account_holder, uploaded_at) VALUES (' ||
  quote_nullable(id::text)           || ', ' ||
  quote_nullable(order_id::text)     || ', ' ||
  quote_nullable(user_id::text)      || ', ' ||
  quote_nullable(slip_url)           || ', ' ||
  quote_nullable(bank_name)          || ', ' ||
  quote_nullable(account_no)         || ', ' ||
  quote_nullable(account_holder)     || ', ' ||
  quote_nullable(uploaded_at::text)  ||
  ') ON CONFLICT (id) DO NOTHING;' AS stmt
FROM public.payment_slips
ORDER BY id;

------------------------ invoices ------------------------
SELECT 'INSERT INTO public.invoices (id, invoice_number, issue_date, due_date, from_name, from_tagline, from_email, from_phone, from_address, customer_name, customer_email, customer_phone, customer_address, discount_percent, tax_percent, subtotal, total, notes, status, order_id, created_at, updated_at) VALUES (' ||
  quote_nullable(id::text)              || ', ' ||
  quote_nullable(invoice_number)        || ', ' ||
  quote_nullable(issue_date::text)      || ', ' ||
  quote_nullable(due_date::text)        || ', ' ||
  quote_nullable(from_name)             || ', ' ||
  quote_nullable(from_tagline)          || ', ' ||
  quote_nullable(from_email)            || ', ' ||
  quote_nullable(from_phone)            || ', ' ||
  quote_nullable(from_address)          || ', ' ||
  quote_nullable(customer_name)         || ', ' ||
  quote_nullable(customer_email)        || ', ' ||
  quote_nullable(customer_phone)        || ', ' ||
  quote_nullable(customer_address)      || ', ' ||
  quote_nullable(discount_percent::text) || ', ' ||
  quote_nullable(tax_percent::text)     || ', ' ||
  quote_nullable(subtotal::text)        || ', ' ||
  quote_nullable(total::text)           || ', ' ||
  quote_nullable(notes)                 || ', ' ||
  quote_nullable(status)                || ', ' ||
  quote_nullable(order_id::text)        || ', ' ||
  quote_nullable(created_at::text)      || ', ' ||
  quote_nullable(updated_at::text)      ||
  ') ON CONFLICT (id) DO NOTHING;' AS stmt
FROM public.invoices
ORDER BY id;

------------------------ invoice_items ------------------------
SELECT 'INSERT INTO public.invoice_items (id, invoice_id, position, description, quantity, rate, amount) VALUES (' ||
  quote_nullable(id::text)          || ', ' ||
  quote_nullable(invoice_id::text)  || ', ' ||
  quote_nullable(position::text)    || ', ' ||
  quote_nullable(description)       || ', ' ||
  quote_nullable(quantity::text)    || ', ' ||
  quote_nullable(rate::text)        || ', ' ||
  quote_nullable(amount::text)      ||
  ') ON CONFLICT (id) DO NOTHING;' AS stmt
FROM public.invoice_items
ORDER BY id;

-- ============================================================================
-- IMPORTANT NOTES
-- ----------------------------------------------------------------------------
-- * Every INSERT uses "ON CONFLICT (id) DO NOTHING" so re-running a backup is
--   safe and will never create duplicates.
-- * The restore re-inserts with the ORIGINAL ids, which keeps foreign keys
--   (orders -> payment_slips, invoices -> orders, invoice_items -> invoices)
--   pointing at the correct rows.
-- * If a table no longer exists because it was dropped, run this file after
--   re-creating it (supabase-schema.sql) first.
-- ============================================================================
