-- Marketer Profiles
CREATE TABLE IF NOT EXISTS skin_marketers (
    skin_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    skin_name TEXT NOT NULL,
    skin_email TEXT UNIQUE NOT NULL,
    skin_phone TEXT,
    skin_commission_percent DECIMAL(5,2) DEFAULT 5.00, -- Default 5%
    skin_fixed_bonus DECIMAL(10,2) DEFAULT 0.00,
    skin_default_discount DECIMAL(5,2) DEFAULT 10.00,
    skin_coupon_duration_days INTEGER DEFAULT 30,
    skin_is_one_time_use BOOLEAN DEFAULT FALSE,
    skin_code_length INTEGER DEFAULT 10,
    skin_is_active BOOLEAN DEFAULT TRUE,
    skin_permissions JSONB DEFAULT '{"can_generate_coupons": true, "view_analytics": true}'::jsonb,
    skin_created_at TIMESTAMPTZ DEFAULT NOW(),
    skin_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketer Generated Coupons
CREATE TABLE IF NOT EXISTS skin_marketer_coupons (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_marketer_id UUID REFERENCES skin_marketers(skin_id) ON DELETE CASCADE,
    skin_code TEXT UNIQUE NOT NULL, -- 10 character random code
    skin_discount_percent DECIMAL(5,2) NOT NULL,
    skin_discount_amount DECIMAL(10,2),
    skin_min_order_amount DECIMAL(10,2) DEFAULT 0,
    skin_max_usage INTEGER DEFAULT NULL,
    skin_expiry_date TIMESTAMPTZ,
    skin_is_active BOOLEAN DEFAULT TRUE,
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commission Tracking
CREATE TABLE IF NOT EXISTS skin_marketer_commissions (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_marketer_id UUID REFERENCES skin_marketers(skin_id) ON DELETE CASCADE,
    skin_order_id UUID REFERENCES skin_orders(skin_id) ON DELETE CASCADE,
    skin_coupon_id UUID REFERENCES skin_marketer_coupons(skin_id) ON DELETE SET NULL,
    skin_order_amount DECIMAL(10,2) NOT NULL,
    skin_commission_earned DECIMAL(10,2) NOT NULL,
    skin_bonus_earned DECIMAL(10,2) DEFAULT 0.00,
    skin_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'rejected'
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics / Sales Attribution
-- Global Marketer Settings
CREATE TABLE IF NOT EXISTS skin_marketer_settings (
    skin_id INTEGER PRIMARY KEY DEFAULT 1, -- Only one record
    skin_default_discount DECIMAL(5,2) DEFAULT 10.00,
    skin_coupon_duration_days INTEGER DEFAULT 30,
    skin_is_one_time_use BOOLEAN DEFAULT FALSE,
    skin_code_length INTEGER DEFAULT 10,
    skin_default_commission DECIMAL(5,2) DEFAULT 5.00,
    skin_updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT one_row CHECK (skin_id = 1)
);

-- Seed initial settings
INSERT INTO skin_marketer_settings (skin_id, skin_default_discount, skin_coupon_duration_days, skin_is_one_time_use, skin_code_length, skin_default_commission)
VALUES (1, 10.00, 30, FALSE, 10, 5.00)
ON CONFLICT (skin_id) DO NOTHING;
