-- 1. Create table for Admin Credentials if it doesn't exist
CREATE TABLE IF NOT EXISTS public.skin_admin_config (
    skin_key TEXT PRIMARY KEY,
    skin_value TEXT NOT NULL,
    skin_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert default credentials (admin/admin) if not present
INSERT INTO public.skin_admin_config (skin_key, skin_value)
VALUES 
('admin_username', 'admin'),
('admin_password', 'admin')
ON CONFLICT (skin_key) DO NOTHING;

-- 3. Ensure UPI accounts table is ready
CREATE TABLE IF NOT EXISTS public.skin_upi_accounts (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_vpa TEXT NOT NULL,
    skin_name TEXT NOT NULL,
    skin_is_active BOOLEAN DEFAULT true,
    skin_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Move UPI Global Settings to skin_settings if not already there
INSERT INTO public.skin_settings (skin_key, skin_value)
VALUES 
('primary_upi_id', 'merchant@upi'),
('primary_upi_name', 'COSRX STORE')
ON CONFLICT (skin_key) DO NOTHING;
