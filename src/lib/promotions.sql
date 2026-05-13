-- Main Promotions Table
CREATE TABLE IF NOT EXISTS skin_promotions (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_title TEXT NOT NULL,
    skin_description TEXT,
    skin_type TEXT NOT NULL, -- 'bogo', 'free_gift', 'cart_value', 'quantity', 'category', 'combo'
    skin_priority INTEGER DEFAULT 0,
    skin_is_active BOOLEAN DEFAULT TRUE,
    skin_start_date TIMESTAMPTZ,
    skin_end_date TIMESTAMPTZ,
    
    -- Specific Conditions
    skin_min_cart_value DECIMAL(10,2) DEFAULT 0,
    skin_min_quantity INTEGER DEFAULT 0,
    
    -- BOGO specific (Buy X Get Y)
    skin_buy_quantity INTEGER DEFAULT 1,
    skin_get_quantity INTEGER DEFAULT 1,
    
    -- Discount logic (if not a free item)
    skin_discount_percent DECIMAL(5,2),
    skin_discount_amount DECIMAL(10,2),
    
    -- Free Item Reference (if type is free_gift or bogo_free)
    skin_free_product_id UUID REFERENCES skin_products(skin_id) ON DELETE SET NULL,
    
    skin_created_at TIMESTAMPTZ DEFAULT NOW(),
    skin_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Target Products (Which products trigger this promotion)
CREATE TABLE IF NOT EXISTS skin_promotion_targets (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_promotion_id UUID REFERENCES skin_promotions(skin_id) ON DELETE CASCADE,
    skin_target_type TEXT NOT NULL, -- 'product', 'category'
    skin_target_id UUID NOT NULL, -- product_id or category_id
    skin_is_exclusion BOOLEAN DEFAULT FALSE, -- If true, this item/category is EXCLUDED from the offer
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_skin_promotions_active ON skin_promotions(skin_is_active) WHERE skin_is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_skin_promotion_targets_promo ON skin_promotion_targets(skin_promotion_id);
