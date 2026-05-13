-- Banners Table
CREATE TABLE IF NOT EXISTS skin_banners (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_title TEXT NOT NULL,
    skin_subtitle TEXT,
    skin_image_desktop TEXT NOT NULL,
    skin_image_mobile TEXT,
    skin_cta_text TEXT DEFAULT 'SHOP NOW',
    skin_link_type TEXT DEFAULT 'collection', -- 'offer', 'coupon', 'product', 'collection', 'campaign', 'external'
    skin_link_id TEXT, -- uuid or slug
    skin_start_date TIMESTAMPTZ,
    skin_end_date TIMESTAMPTZ,
    skin_is_active BOOLEAN DEFAULT TRUE,
    skin_priority INTEGER DEFAULT 0,
    skin_bg_color TEXT DEFAULT '#FFFFFF',
    skin_text_color TEXT DEFAULT '#1A1A1A',
    skin_created_at TIMESTAMPTZ DEFAULT NOW(),
    skin_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns Table (for dedicated landing pages)
CREATE TABLE IF NOT EXISTS skin_campaigns (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_title TEXT NOT NULL,
    skin_slug TEXT UNIQUE NOT NULL,
    skin_description TEXT,
    skin_banner_image TEXT,
    skin_offer_id UUID REFERENCES skin_promotions(skin_id) ON DELETE SET NULL,
    skin_coupon_id UUID REFERENCES skin_coupons(skin_id) ON DELETE SET NULL,
    skin_is_active BOOLEAN DEFAULT TRUE,
    skin_start_date TIMESTAMPTZ,
    skin_end_date TIMESTAMPTZ,
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_skin_banners_active ON skin_banners(skin_is_active, skin_priority DESC);
CREATE INDEX IF NOT EXISTS idx_skin_campaigns_slug ON skin_campaigns(skin_slug);
