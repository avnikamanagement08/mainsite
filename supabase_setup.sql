-- ==========================================================
-- AVANIKA.CO — SUPABASE SCHEMA SETUP SCRIPT
-- Paste this script into the Supabase SQL Editor to configure your database.
-- ==========================================================

-- 1. CREATE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    images TEXT[] DEFAULT '{}', -- Array of image URLs
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to reviews" ON public.reviews FOR INSERT WITH CHECK (true);


-- 2. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- e.g. p1, p2, p3, p4
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    stock INT DEFAULT 10 NOT NULL,
    compare_at_price NUMERIC(10, 2), -- Strikethrough RRP
    base_price_making NUMERIC(10, 2) DEFAULT 300.00 NOT NULL, -- Making charge
    gold_weight_grams NUMERIC(10, 2) DEFAULT 0.00 NOT NULL, -- Gold weight for spot prices
    is_preorder BOOLEAN DEFAULT false NOT NULL,
    is_consignment BOOLEAN DEFAULT false NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin insert access to products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow admin update access to products" ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- 3. CREATE INVENTORY / VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
    sku TEXT PRIMARY KEY, -- e.g. p1-size6-yellowgold-diamond
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    metal TEXT NOT NULL,
    stone TEXT NOT NULL,
    stock INT DEFAULT 5 NOT NULL
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Allow admin insert access to inventory" ON public.inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow public update access to inventory" ON public.inventory FOR UPDATE USING (true) WITH CHECK (true);


-- 4. CREATE RESERVATIONS (INVENTORY SOFT-LOCK) TABLE
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku TEXT NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    idempotency_key TEXT
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reservations" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to reservations" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access to reservations" ON public.reservations FOR DELETE USING (true);


-- 5. CREATE PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS public.promo_codes (
    code TEXT PRIMARY KEY, -- e.g. GOLD2026, AVANIKA10
    discount NUMERIC(10, 2) NOT NULL, -- Value (percentage or flat)
    type TEXT NOT NULL CHECK (type IN ('percent', 'flat')),
    active BOOLEAN DEFAULT true NOT NULL,
    min_cart_value NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    usage_limit INT DEFAULT 100,
    usage_count INT DEFAULT 0
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to promo_codes" ON public.promo_codes FOR SELECT USING (true);
CREATE POLICY "Allow admin insert access to promo_codes" ON public.promo_codes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow admin update access to promo_codes" ON public.promo_codes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- 6. CREATE GOLD RATES TABLE
CREATE TABLE IF NOT EXISTS public.gold_rates (
    id TEXT PRIMARY KEY DEFAULT 'spot',
    rate_per_gram NUMERIC(10, 2) DEFAULT 7200.00 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gold_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to gold_rates" ON public.gold_rates FOR SELECT USING (true);
CREATE POLICY "Allow admin update access to gold_rates" ON public.gold_rates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- 7. CREATE LOYALTY POINTS TABLE
CREATE TABLE IF NOT EXISTS public.loyalty_points (
    user_email TEXT PRIMARY KEY,
    points_pending INT DEFAULT 0 NOT NULL,
    points_credited INT DEFAULT 0 NOT NULL
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to loyalty_points" ON public.loyalty_points FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to loyalty_points" ON public.loyalty_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to loyalty_points" ON public.loyalty_points FOR UPDATE USING (true) WITH CHECK (true);


-- 8. CREATE WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select access to wishlists" ON public.wishlists FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to wishlists" ON public.wishlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access to wishlists" ON public.wishlists FOR DELETE USING (true);


-- 9. CREATE ABANDONED CARTS TABLE
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    phone TEXT,
    cart_items JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select access to abandoned_carts" ON public.abandoned_carts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to abandoned_carts" ON public.abandoned_carts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to abandoned_carts" ON public.abandoned_carts FOR UPDATE USING (true) WITH CHECK (true);


-- 10. CREATE SENT EMAILS (SIMULATED EMAIL OUTBOX) TABLE
CREATE TABLE IF NOT EXISTS public.sent_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin select access to sent_emails" ON public.sent_emails FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public insert access to sent_emails" ON public.sent_emails FOR INSERT WITH CHECK (true);


-- 11. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. AVN-2026-X839DA
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    payment_mode TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of items with variants & engraving
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) DEFAULT 0.00 NOT NULL, -- Dynamic GST/VAT
    total NUMERIC(10, 2) NOT NULL,
    delivery_status TEXT DEFAULT 'processing' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert access to orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow admin update access to orders" ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- 12. CREATE STORAGE BUCKET FOR REVIEW IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read from review-images bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "Allow anonymous upload to review-images bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'review-images');

-- Insert initial Gold Spot Rate configuration
INSERT INTO public.gold_rates (id, rate_per_gram)
VALUES ('spot', 7200.00)
ON CONFLICT (id) DO NOTHING;

-- Insert default promo code
INSERT INTO public.promo_codes (code, discount, type, active, min_cart_value)
VALUES ('GOLD2026', 15.00, 'percent', true, 1000.00)
ON CONFLICT (code) DO NOTHING;

-- 13. SEED CATALOG PRODUCTS DATA
INSERT INTO public.products (id, name, category, image, description, stock, base_price_making, gold_weight_grams)
VALUES 
('p1', 'Meera Anti-Tarnish Kundan Chandbalis', 'Earrings', 'images/earrings/1/WhatsApp Image 2026-06-11 at 9.13.35 PM.jpeg', 'Handcrafted traditional Indian Kundan Chandbalis, heavily plated in 18K yellow gold finish over a premium base alloy. Adorned with cluster CZ stones and premium faux pearls. Features our advanced anti-tarnish guard for lasting color protection. Hypoallergenic, lightweight, and perfect for ethnic celebrations.', 10, 950.00, 2.10),
('p2', 'Aura Celestial Gold Plated Hoops', 'Earrings', 'images/earrings/2/WhatsApp Image 2026-06-12 at 10.42.03 AM.jpeg', 'Minimalist, daily-wear geometric hoop earrings plated in high-shine 18K gold. Fitted with a secure click-lock latch. Fully anti-tarnish treated for lasting color protection. Waterproof, sweat-proof, and designed to match both Western and casual outfits.', 10, 600.00, 1.40),
('p3', 'Ziya Simulated Emerald Drop Jhumkas', 'Earrings', 'images/earrings/3/WhatsApp Image 2026-06-12 at 10.52.55 AM.jpeg', 'Fusion dangle jhumkas with vibrant simulated emerald drops suspended from a micro-pave cubic zirconia floral stud. Plated in 18K yellow gold base alloy. Features advanced anti-tarnish protection for lasting color. Extremely lightweight and comfortable.', 10, 850.00, 1.80),
('p4', 'Avni Royal Kundan Pearl Drops', 'Earrings', 'images/earrings/4/WhatsApp Image 2026-06-12 at 2.19.55 PM.jpeg', 'Regal drop earrings featuring hand-set Kundan stones and suspended organic shell pearls. Plated in an antique 18K yellow gold finish. Protected with an anti-tarnish barrier and designed for long-lasting wear. The perfect accessory for wedding and bridal wear.', 10, 750.00, 1.60),
('p5', 'Lumina Premium CZ Solitaire Studs', 'Earrings', 'images/earrings/5/WhatsApp Image 2026-06-12 at 2.25.32 PM.jpeg', 'Classic four-prong stud earrings holding flawless AAAAA-grade simulated cubic zirconia solitaires. Plated in premium platinum-finish base alloy. Anti-tarnish coated for lasting color protection. Versatile and timeless, ideal for office wear and special occasions.', 10, 500.00, 1.10),
('p6', 'Tara Rose Gold Starburst Dangles', 'Earrings', 'images/earrings/6/WhatsApp Image 2026-06-12 at 3.18.11 PM.jpeg', 'Elegant starburst danglers featuring pave-set CZ stone arrays that capture and reflect light. Plated in highly polished 18K rose gold. Includes premium anti-tarnish coating for lasting color protection. Hypoallergenic posts make them comfortable for sensitive ears.', 10, 750.00, 1.70)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  base_price_making = EXCLUDED.base_price_making,
  gold_weight_grams = EXCLUDED.gold_weight_grams;


-- 14. CREATE CIRCLE SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.circle_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.circle_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert access to circle_subscribers" ON public.circle_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select access to circle_subscribers" ON public.circle_subscribers FOR SELECT USING (true);
CREATE POLICY "Allow admin update access to circle_subscribers" ON public.circle_subscribers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin delete access to circle_subscribers" ON public.circle_subscribers FOR DELETE TO authenticated USING (true);

