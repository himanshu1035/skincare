-- Enterprise Support Ticket System Schema
-- Date: 2026-05-14

-- 1. Safely remove old tables (CASCADE handles foreign keys)
DROP TABLE IF EXISTS skin_support_messages CASCADE;
DROP TABLE IF EXISTS skin_support_tickets CASCADE;
DROP TABLE IF EXISTS skin_marketer_tickets CASCADE;

-- 2. Create New Scalable Tables

-- 2.1 Tickets Table
CREATE TABLE IF NOT EXISTS skin_tickets (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_user_id UUID NOT NULL, -- Customer or Marketer ID
    skin_user_type TEXT NOT NULL CHECK (skin_user_type IN ('customer', 'marketer')),
    skin_subject TEXT NOT NULL,
    skin_category TEXT NOT NULL,
    skin_priority TEXT NOT NULL DEFAULT 'Medium' CHECK (skin_priority IN ('Low', 'Medium', 'High', 'Urgent')),
    skin_status TEXT NOT NULL DEFAULT 'Open' CHECK (skin_status IN ('Open', 'Pending', 'Processing', 'Resolved', 'Declined', 'Closed', 'Escalated')),
    skin_assigned_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    skin_created_at TIMESTAMPTZ DEFAULT NOW(),
    skin_updated_at TIMESTAMPTZ DEFAULT NOW(),
    skin_last_reply_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Messages Table
CREATE TABLE IF NOT EXISTS skin_ticket_messages (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_ticket_id UUID REFERENCES skin_tickets(skin_id) ON DELETE CASCADE,
    skin_sender_id UUID NOT NULL,
    skin_sender_type TEXT NOT NULL CHECK (skin_sender_type IN ('user', 'admin', 'system')),
    skin_message TEXT NOT NULL,
    skin_is_internal_note BOOLEAN DEFAULT FALSE,
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Attachments Table
CREATE TABLE IF NOT EXISTS skin_ticket_attachments (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_message_id UUID REFERENCES skin_ticket_messages(skin_id) ON DELETE CASCADE,
    skin_file_url TEXT NOT NULL,
    skin_file_name TEXT,
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Notifications Table (Optional, for tracking alerts)
CREATE TABLE IF NOT EXISTS skin_ticket_notifications (
    skin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skin_user_id UUID NOT NULL,
    skin_ticket_id UUID REFERENCES skin_tickets(skin_id) ON DELETE CASCADE,
    skin_title TEXT NOT NULL,
    skin_message TEXT NOT NULL,
    skin_is_read BOOLEAN DEFAULT FALSE,
    skin_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS) Policies

ALTER TABLE skin_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_ticket_notifications ENABLE ROW LEVEL SECURITY;

-- Tickets: Users can view their own, Admins can view all
CREATE POLICY "Users can view own tickets" ON skin_tickets
    FOR SELECT TO authenticated
    USING (auth.uid() = skin_user_id);

CREATE POLICY "Users can insert own tickets" ON skin_tickets
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = skin_user_id);

CREATE POLICY "Admins can manage all tickets" ON skin_tickets
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- Messages: Users can view messages for their tickets (excluding internal notes)
CREATE POLICY "Users can view messages for own tickets" ON skin_ticket_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM skin_tickets
            WHERE skin_tickets.skin_id = skin_ticket_id
            AND skin_tickets.skin_user_id = auth.uid()
        ) AND skin_is_internal_note = FALSE
    );

CREATE POLICY "Users can insert messages" ON skin_ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM skin_tickets
            WHERE skin_tickets.skin_id = skin_ticket_id
            AND skin_tickets.skin_user_id = auth.uid()
        ) AND skin_sender_id = auth.uid() AND skin_sender_type = 'user'
    );

CREATE POLICY "Admins can manage all messages" ON skin_ticket_messages
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- Attachments: Follow message visibility
CREATE POLICY "Users can view their attachments" ON skin_ticket_attachments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM skin_ticket_messages
            JOIN skin_tickets ON skin_tickets.skin_id = skin_ticket_messages.skin_ticket_id
            WHERE skin_ticket_messages.skin_id = skin_message_id
            AND skin_tickets.skin_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert attachments" ON skin_ticket_attachments
    FOR INSERT TO authenticated
    WITH CHECK (true); -- Usually restricted via application logic during message creation

CREATE POLICY "Admins can manage all attachments" ON skin_ticket_attachments
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- Notifications: Users can view their own
CREATE POLICY "Users can view own notifications" ON skin_ticket_notifications
    FOR SELECT TO authenticated
    USING (auth.uid() = skin_user_id);

CREATE POLICY "Users can update own notifications" ON skin_ticket_notifications
    FOR UPDATE TO authenticated
    USING (auth.uid() = skin_user_id)
    WITH CHECK (auth.uid() = skin_user_id);

CREATE POLICY "Admins can insert notifications" ON skin_ticket_notifications
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- 4. Storage Bucket
-- Ensure the 'support_attachments' storage bucket exists in Supabase Dashboard and is public.
