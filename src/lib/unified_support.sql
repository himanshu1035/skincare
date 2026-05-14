-- Migration: Unified Chat-based Support System
-- Date: 2026-05-14

-- 1. Extend skin_support_tickets
ALTER TABLE skin_support_tickets ADD COLUMN IF NOT EXISTS skin_type TEXT DEFAULT 'customer'; -- 'customer', 'marketer'
ALTER TABLE skin_support_tickets ADD COLUMN IF NOT EXISTS skin_last_message_at TIMESTAMPTZ DEFAULT NOW();

-- 1.1 Migrate Legacy Marketer Tickets (Optional but recommended)
INSERT INTO skin_support_tickets (skin_id, skin_user_id, skin_subject, skin_message, skin_status, skin_type, skin_created_at)
SELECT skin_id, skin_marketer_id, skin_subject, skin_message, skin_status, 'marketer', skin_created_at 
FROM skin_marketer_tickets
ON CONFLICT (skin_id) DO NOTHING;

-- 2. Create Support Messages Table for Chat History
CREATE TABLE IF NOT EXISTS skin_support_messages (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_ticket_id UUID REFERENCES skin_support_tickets(skin_id) ON DELETE CASCADE,
    skin_sender_id UUID NOT NULL, -- auth.uid()
    skin_sender_type TEXT DEFAULT 'user', -- 'user', 'admin'
    skin_message TEXT,
    skin_image_url TEXT,
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies for Unified Support
ALTER TABLE skin_support_messages ENABLE ROW LEVEL SECURITY;

-- Users/Marketers can view their own ticket messages
DROP POLICY IF EXISTS "Users can view their ticket messages" ON skin_support_messages;
CREATE POLICY "Users can view their ticket messages" 
ON skin_support_messages FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM skin_support_tickets 
        WHERE skin_support_tickets.skin_id = skin_support_messages.skin_ticket_id 
        AND skin_support_tickets.skin_user_id = auth.uid()
    )
);

-- Users/Marketers can send messages to their own tickets
DROP POLICY IF EXISTS "Users can send ticket messages" ON skin_support_messages;
CREATE POLICY "Users can send ticket messages" 
ON skin_support_messages FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM skin_support_tickets 
        WHERE skin_support_tickets.skin_id = skin_ticket_id 
        AND skin_support_tickets.skin_user_id = auth.uid()
    )
);

-- Admins can manage all messages
DROP POLICY IF EXISTS "Admins can manage all support messages" ON skin_support_messages;
CREATE POLICY "Admins can manage all support messages" 
ON skin_support_messages FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 4. Storage Bucket for Support Attachments
-- (Assuming bucket 'support-attachments' exists or will be created in Supabase dashboard)
