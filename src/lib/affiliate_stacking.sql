ALTER TABLE skin_marketer_settings ADD COLUMN IF NOT EXISTS skin_is_stackable_allowed BOOLEAN DEFAULT false;
ALTER TABLE skin_marketer_settings ADD COLUMN IF NOT EXISTS skin_min_checkout_value DECIMAL(10,2) DEFAULT 0.00;
