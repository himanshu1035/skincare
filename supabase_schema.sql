-- SKIN PRODUCTS TABLE
CREATE TABLE skin_products (
  skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skin_name TEXT NOT NULL,
  skin_price DECIMAL(10,2) NOT NULL,
  skin_original_price DECIMAL(10,2) NOT NULL,
  skin_image_url TEXT,
  skin_stock_count INTEGER DEFAULT 0,
  skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKIN CAMPAIGN SETTINGS TABLE
CREATE TABLE skin_campaign_settings (
  skin_id TEXT PRIMARY KEY, -- Use 'bogo_campaign' as id
  skin_is_active BOOLEAN DEFAULT TRUE,
  skin_expires_at TIMESTAMPTZ,
  skin_currency TEXT DEFAULT '$',
  skin_cod_charge DECIMAL(10,2) DEFAULT 0,
  skin_prepay_discount DECIMAL(10,2) DEFAULT 0,
  skin_delivery_charge DECIMAL(10,2) DEFAULT 0,
  skin_pay_delivery_first BOOLEAN DEFAULT FALSE,
  skin_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKIN USERS TABLE
CREATE TABLE skin_users (
  skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skin_email TEXT UNIQUE NOT NULL,
  skin_mobile TEXT UNIQUE NOT NULL,
  skin_password TEXT NOT NULL, -- In a real app, hash this!
  skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKIN ORDERS TABLE
CREATE TABLE skin_orders (
  skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skin_customer_email TEXT NOT NULL,
  skin_customer_mobile TEXT,
  skin_customer_address TEXT,
  skin_customer_city TEXT,
  skin_customer_state TEXT,
  skin_customer_zip TEXT,
  skin_payment_method TEXT DEFAULT 'Prepaid', -- Prepaid, COD
  skin_total_amount DECIMAL(10,2) NOT NULL,
  skin_items JSONB NOT NULL,
  skin_user_id UUID REFERENCES skin_users(skin_id),
  skin_status TEXT DEFAULT 'Processing',
  skin_tracking_id TEXT,
  skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSERT INITIAL DATA
INSERT INTO skin_products (skin_name, skin_price, skin_original_price, skin_image_url, skin_stock_count)
VALUES ('COSRX Advanced Snail 96 Mucin Power Essence', 25.00, 50.00, '/assets/product.png', 100);

INSERT INTO skin_campaign_settings (skin_id, skin_is_active, skin_expires_at)
VALUES ('bogo_campaign', TRUE, NOW() + INTERVAL '24 hours');
