-- Add missing columns to skin_products
ALTER TABLE skin_products ADD COLUMN IF NOT EXISTS skin_slug TEXT UNIQUE;
ALTER TABLE skin_products ADD COLUMN IF NOT EXISTS skin_description TEXT;
ALTER TABLE skin_products ADD COLUMN IF NOT EXISTS skin_brand TEXT DEFAULT 'COSRX';
ALTER TABLE skin_products ADD COLUMN IF NOT EXISTS skin_category_id UUID;
ALTER TABLE skin_products ADD COLUMN IF NOT EXISTS skin_rating DECIMAL(3,2) DEFAULT 5.0;
ALTER TABLE skin_products ADD COLUMN IF NOT EXISTS skin_review_count INTEGER DEFAULT 0;

-- Categories Table
CREATE TABLE IF NOT EXISTS skin_categories (
  skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skin_name TEXT NOT NULL,
  skin_slug TEXT UNIQUE NOT NULL,
  skin_description TEXT,
  skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variants Table
CREATE TABLE IF NOT EXISTS skin_variants (
  skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skin_product_id UUID REFERENCES skin_products(skin_id) ON DELETE CASCADE,
  skin_title TEXT NOT NULL,
  skin_sku TEXT,
  skin_price DECIMAL(10,2) NOT NULL,
  skin_original_price DECIMAL(10,2),
  skin_stock_count INTEGER DEFAULT 0,
  skin_in_stock BOOLEAN DEFAULT TRUE,
  skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections Table
CREATE TABLE IF NOT EXISTS skin_collections (
  skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skin_name TEXT NOT NULL,
  skin_slug TEXT UNIQUE NOT NULL,
  skin_description TEXT,
  skin_image_url TEXT,
  skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection Products (Many-to-Many)
CREATE TABLE IF NOT EXISTS skin_collection_products (
  skin_collection_id UUID REFERENCES skin_collections(skin_id) ON DELETE CASCADE,
  skin_product_id UUID REFERENCES skin_products(skin_id) ON DELETE CASCADE,
  PRIMARY KEY (skin_collection_id, skin_product_id)
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS skin_user_profiles (
  skin_id UUID PRIMARY KEY, -- Matches auth.users id
  skin_email TEXT UNIQUE NOT NULL,
  skin_first_name TEXT,
  skin_last_name TEXT,
  skin_phone TEXT,
  skin_role TEXT DEFAULT 'customer', -- 'customer' or 'admin'
  skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS skin_orders (
  skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skin_user_id UUID REFERENCES skin_user_profiles(skin_id) ON DELETE SET NULL,
  skin_total DECIMAL(10,2) NOT NULL,
  skin_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  skin_payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'verified', 'failed'
  skin_payment_method TEXT, -- 'cod', 'card', 'upi'
  skin_utr TEXT UNIQUE, -- Unique Transaction Reference for verification
  skin_shipping_address TEXT,
  skin_created_at TIMESTAMPTZ DEFAULT NOW(),
  skin_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS skin_order_items (
  skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skin_order_id UUID REFERENCES skin_orders(skin_id) ON DELETE CASCADE,
  skin_product_id UUID REFERENCES skin_products(skin_id) ON DELETE SET NULL,
  skin_quantity INTEGER NOT NULL,
  skin_price DECIMAL(10,2) NOT NULL
);

-- Update skin_products to reference categories
ALTER TABLE skin_products 
ADD CONSTRAINT fk_skin_product_category 
FOREIGN KEY (skin_category_id) 
REFERENCES skin_categories(skin_id);
