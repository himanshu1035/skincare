-- Fix RLS Policies for Marketer Tables
-- Date: 2026-05-14

-- 1. Enable RLS on all relevant tables
ALTER TABLE skin_marketer_upi ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_marketer_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_marketer_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_marketer_notifications ENABLE ROW LEVEL SECURITY;

-- 2. Policies for skin_marketer_upi
DROP POLICY IF EXISTS "Marketers can manage their own UPI IDs" ON skin_marketer_upi;
CREATE POLICY "Marketers can manage their own UPI IDs" 
ON skin_marketer_upi 
FOR ALL 
TO authenticated 
USING (auth.uid() = skin_marketer_id)
WITH CHECK (auth.uid() = skin_marketer_id);

-- 3. Policies for skin_marketer_withdrawals
DROP POLICY IF EXISTS "Marketers can view their own withdrawals" ON skin_marketer_withdrawals;
CREATE POLICY "Marketers can view their own withdrawals" 
ON skin_marketer_withdrawals 
FOR SELECT 
TO authenticated 
USING (auth.uid() = skin_marketer_id);

DROP POLICY IF EXISTS "Marketers can create withdrawal requests" ON skin_marketer_withdrawals;
CREATE POLICY "Marketers can create withdrawal requests" 
ON skin_marketer_withdrawals 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = skin_marketer_id);

-- 4. Policies for skin_marketer_tickets
DROP POLICY IF EXISTS "Marketers can view their own tickets" ON skin_marketer_tickets;
CREATE POLICY "Marketers can view their own tickets" 
ON skin_marketer_tickets 
FOR SELECT 
TO authenticated 
USING (auth.uid() = skin_marketer_id);

DROP POLICY IF EXISTS "Marketers can create tickets" ON skin_marketer_tickets;
CREATE POLICY "Marketers can create tickets" 
ON skin_marketer_tickets 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = skin_marketer_id);

-- 5. Policies for skin_marketer_notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON skin_marketer_notifications;
CREATE POLICY "Users can view their own notifications" 
ON skin_marketer_notifications 
FOR SELECT 
TO authenticated 
USING (auth.uid() = skin_user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON skin_marketer_notifications;
CREATE POLICY "Users can update their own notifications" 
ON skin_marketer_notifications 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = skin_user_id)
WITH CHECK (auth.uid() = skin_user_id);
