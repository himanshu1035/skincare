-- PERFORMANCE INDEXES FOR SKINCARE ECOMMERCE
-- RUN THESE IN SUPABASE SQL EDITOR

-- 1. Optimize Product Lookups & Collections
CREATE INDEX IF NOT EXISTS idx_skin_products_slug ON public.skin_products(skin_slug);
CREATE INDEX IF NOT EXISTS idx_skin_products_category ON public.skin_products(skin_category_id);
CREATE INDEX IF NOT EXISTS idx_skin_products_in_stock ON public.skin_products(skin_in_stock) WHERE skin_in_stock = true;

-- 2. Optimize Order Management (Admin)
CREATE INDEX IF NOT EXISTS idx_skin_orders_status ON public.skin_orders(skin_status);
CREATE INDEX IF NOT EXISTS idx_skin_orders_user ON public.skin_orders(skin_user_id);
CREATE INDEX IF NOT EXISTS idx_skin_orders_created_at ON public.skin_orders(skin_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skin_orders_payment_method ON public.skin_orders(skin_payment_method);

-- 3. Optimize Collection Lookups
CREATE INDEX IF NOT EXISTS idx_skin_collections_slug ON public.skin_collections(skin_slug);

-- 4. Optimize Promotion Performance
CREATE INDEX IF NOT EXISTS idx_skin_promotions_active ON public.skin_promotions(skin_is_active) WHERE skin_is_active = true;
CREATE INDEX IF NOT EXISTS idx_skin_promotion_targets_promo ON public.skin_promotion_targets(skin_promotion_id);

-- 5. Optimize Affiliate Performance
CREATE INDEX IF NOT EXISTS idx_skin_marketers_user ON public.skin_marketers(skin_user_id);
CREATE INDEX IF NOT EXISTS idx_skin_coupons_code ON public.skin_coupons(skin_code);
