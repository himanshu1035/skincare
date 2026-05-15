-- MULTI-UPI MANAGEMENT SYSTEM
-- RUN THESE IN SUPABASE SQL EDITOR

-- 1. Create table for multiple UPI accounts
CREATE TABLE IF NOT EXISTS public.skin_upi_accounts (
    skin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skin_vpa TEXT NOT NULL UNIQUE,
    skin_name TEXT NOT NULL,
    skin_is_active BOOLEAN DEFAULT true,
    skin_created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add tracking column to orders
ALTER TABLE public.skin_orders 
ADD COLUMN IF NOT EXISTS skin_assigned_upi TEXT;

-- 3. Enable RLS
ALTER TABLE public.skin_upi_accounts ENABLE ROW LEVEL SECURITY;

-- 4. Basic Policies (Admin Only access assumed via service role or existing admin filters)
CREATE POLICY "Admin All Access" ON public.skin_upi_accounts 
FOR ALL USING (true);
