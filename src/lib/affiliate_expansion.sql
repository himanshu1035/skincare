-- Migration: Affiliate Suite Hardening & Financial Intelligence
-- Date: 2026-05-14

-- 1. Update skin_marketer_settings for Withdrawal Controls
ALTER TABLE skin_marketer_settings ADD COLUMN IF NOT EXISTS skin_min_withdrawal DECIMAL(10,2) DEFAULT 500.00;
ALTER TABLE skin_marketer_settings ADD COLUMN IF NOT EXISTS skin_tiered_rules JSONB DEFAULT '[
    {"level": "Bronze", "sales": 0, "commission": 5, "discount": 5},
    {"level": "Silver", "sales": 50, "commission": 7, "discount": 10},
    {"level": "Gold", "sales": 200, "commission": 10, "discount": 10},
    {"level": "Platinum", "sales": 500, "commission": 12, "discount": 15},
    {"level": "Diamond", "sales": 1000, "commission": 15, "discount": 15}
]'::jsonb;

-- 2. Update skin_marketers for Level Tracking
ALTER TABLE skin_marketers ADD COLUMN IF NOT EXISTS skin_level TEXT DEFAULT 'Bronze';
ALTER TABLE skin_marketers ADD COLUMN IF NOT EXISTS skin_upi_id TEXT;

-- 3. Create UPI Details Table
CREATE TABLE IF NOT EXISTS skin_marketer_upi (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_marketer_id UUID REFERENCES skin_marketers(skin_id) ON DELETE CASCADE,
    skin_upi_id TEXT NOT NULL,
    skin_is_primary BOOLEAN DEFAULT FALSE,
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS skin_marketer_withdrawals (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_marketer_id UUID REFERENCES skin_marketers(skin_id) ON DELETE CASCADE,
    skin_amount DECIMAL(10,2) NOT NULL,
    skin_upi_id TEXT NOT NULL,
    skin_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined'
    skin_admin_note TEXT,
    skin_created_at TIMESTAMPTZ DEFAULT NOW(),
    skin_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Support Tickets Table
CREATE TABLE IF NOT EXISTS skin_marketer_tickets (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_marketer_id UUID REFERENCES skin_marketers(skin_id) ON DELETE CASCADE,
    skin_subject TEXT NOT NULL,
    skin_message TEXT NOT NULL,
    skin_status TEXT DEFAULT 'open', -- 'open', 'closed'
    skin_admin_reply TEXT,
    skin_created_at TIMESTAMPTZ DEFAULT NOW(),
    skin_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Notifications Table
CREATE TABLE IF NOT EXISTS skin_marketer_notifications (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_user_id UUID NOT NULL, -- Can be marketer id or admin id
    skin_title TEXT NOT NULL,
    skin_message TEXT NOT NULL,
    skin_type TEXT DEFAULT 'info', -- 'info', 'withdrawal', 'ticket', 'level'
    skin_is_read BOOLEAN DEFAULT FALSE,
    skin_link TEXT, -- Link to the relevant page
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);
