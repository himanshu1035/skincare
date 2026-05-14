-- ==========================================
-- CRITICAL: DATABASE FRESH START SCRIPT
-- ==========================================
-- This script will delete ALL data from your store.
-- WARNING: This is IRREVERSIBLE.
-- ==========================================

-- 1. Support System
TRUNCATE skin_ticket_messages CASCADE;
TRUNCATE skin_tickets CASCADE;

-- 2. Marketer / Affiliate System
TRUNCATE skin_marketer_notifications CASCADE;
TRUNCATE skin_marketer_commissions CASCADE;
TRUNCATE skin_marketer_withdrawals CASCADE;
TRUNCATE skin_marketer_coupons CASCADE;
TRUNCATE skin_marketer_upi CASCADE;
TRUNCATE skin_marketers CASCADE;

-- 3. Ecommerce / Order System
TRUNCATE skin_order_status_history CASCADE;
TRUNCATE skin_order_items CASCADE;
TRUNCATE skin_orders CASCADE;
TRUNCATE skin_coupons CASCADE;

-- 4. User Profiles & Addresses
TRUNCATE skin_user_addresses CASCADE;
TRUNCATE skin_user_profiles CASCADE;

-- 5. Authentication (Optional but Recommended for Fresh Start)
-- NOTE: Deleting from auth.users will log everyone out.
-- If you want to keep your own admin account, DO NOT run the line below.
-- Instead, run it with a filter for your specific admin ID.

-- DELETE FROM auth.users WHERE id != 'YOUR_ADMIN_ID_HERE';

-- To delete EVERYONE including yourself (Fresh Start):
-- DELETE FROM auth.users;

-- ==========================================
-- HOW TO RUN:
-- 1. Copy this script.
-- 2. Go to your Supabase Dashboard.
-- 3. Open 'SQL Editor'.
-- 4. Paste and click 'Run'.
-- ==========================================
