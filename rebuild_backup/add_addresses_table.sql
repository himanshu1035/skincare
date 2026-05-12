CREATE TABLE IF NOT EXISTS skin_addresses (
  skin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skin_user_id UUID REFERENCES skin_users(skin_id) ON DELETE CASCADE,
  skin_first_name TEXT,
  skin_last_name TEXT,
  skin_address TEXT,
  skin_landmark TEXT,
  skin_city TEXT,
  skin_state TEXT,
  skin_zip TEXT,
  skin_mobile TEXT,
  skin_is_default BOOLEAN DEFAULT false,
  skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_skin_addresses_user_id ON skin_addresses(skin_user_id);
