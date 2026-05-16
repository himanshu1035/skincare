# COSRX Platform - End-to-End QA Testing Guide

This document outlines a step-by-step process to thoroughly test the COSRX e-commerce platform. It is designed to help you verify that all features work, data is saved/displayed correctly, and complex mathematical logic (discounts, commissions) is accurate.

---

## Phase 1: The Customer Journey (Front-End & Checkout)

### 1. Product Browsing & Cart
*   [ ] **Action:** Open the website on both Desktop and a Mobile device.
*   [ ] **Verify (UI):** The homepage hero banner blends correctly with the collection section. Product pages show the correct orientation and unique images.
*   [ ] **Action:** Add a standard product and a BOGO (Buy One Get One) product to the cart.
*   [ ] **Verify (Calculations):** The cart subtotal accurately reflects the base prices. For BOGO, ensure the system handles the pricing logic as you intended.

### 2. Coupon Engine & Discount Logic
*   [ ] **Action:** Proceed to checkout and apply a Marketer Coupon Code.
*   [ ] **Verify (Calculations):** 
    *   The discount amount is instantly calculated and displayed in the right-side order summary.
    *   If multiple coupons are allowed, ensure the percentage discount is calculated against the **original subtotal**, not the previously discounted value.
    *   Check that BOGO items are either included or excluded from the discount calculation based on your strict rules.

### 3. Guest Checkout & Deferred Registration
*   [ ] **Action:** Complete the checkout process as a "Guest" (a user who is not logged in).
*   [ ] **Action:** Fill in the Name, Email, and Mobile Number for delivery.
*   [ ] **Action:** Complete the payment process (simulate a successful UPI or Card transaction).
*   [ ] **Verify (Data Persistence):** 
    *   Open your Supabase Dashboard -> `skin_user_profiles` table.
    *   Confirm a new row was created for this user.
    *   Confirm their `skin_first_name`, `skin_last_name`, `skin_phone` (mobile number), and `skin_email` are perfectly saved and match the checkout details.

---

## Phase 2: The Affiliate Ecosystem (Marketer Panel)

### 1. Commission Generation
*   [ ] **Action:** Log in to the Marketer Panel using the account whose coupon was used in Phase 1.
*   [ ] **Verify (Calculations):**
    *   Go to the Overview Dashboard.
    *   Check the **Pending Payout** metric. It should have increased by the exact commission amount from the Phase 1 sale.
    *   *Calculation Check:* If the order was ₹1000, the coupon gave ₹100 off (Subtotal = ₹900). If the marketer tier is 10%, their commission should be exactly ₹90.

### 2. Tier Progression & Targets
*   [ ] **Verify (Data Display):** On the Marketer Overview page, look at the "Next Tier Reward" section. Verify it shows the correct required sales to level up and accurately displays the upcoming commission percentage.

### 3. Withdrawals
*   [ ] **Action:** Submit a withdrawal request from the Marketer Panel.
*   [ ] **Verify (Database):** Check the `skin_marketer_withdrawals` table in Supabase to ensure the request is logged with a `pending` status.

---

## Phase 3: The Administrative Command Center

### 1. Order Verification & Financial Sync
*   [ ] **Action:** Log in to the Admin Panel. Navigate to Orders.
*   [ ] **Action:** Find the order placed in Phase 1 and mark its payment status as **Verified / Approved**.
*   [ ] **Verify (Database Sync):**
    *   Switch back to the Marketer Panel (or check the DB).
    *   The commission from that order should automatically move from **Pending** to **Approved**.
    *   The Marketer's **Wallet Balance** and **Total Earned** metrics should instantly increase.

### 2. Customer Management Resiliency
*   [ ] **Action:** Navigate to the Customers section in the Admin Panel.
*   [ ] **Action:** Click "Edit" on the customer created in Phase 1. Change their phone number or name and hit Save.
*   [ ] **Verify (Error Handling):** The update should succeed without throwing a "Server Components render" crash.
*   [ ] **Verify (Data Persistence):** Refresh the page and ensure the new details are actively saved in the database.

### 3. Payout Management
*   [ ] **Action:** Navigate to the Marketer Payouts section.
*   [ ] **Action:** Approve the withdrawal request created in Phase 2.
*   [ ] **Verify (Calculations):**
    *   The Admin dashboard should reflect the payout.
    *   The Marketer's "Wallet Balance" must decrease by the exact payout amount.
    *   The Marketer's "Total Paid" metric must increase.
    *   The "Withdrawal History" on the Marketer overview should show the new paid transaction.

### 4. Mobile Layout
*   [ ] **Action:** Shrink your browser window to a mobile width (or open on a phone).
*   [ ] **Verify (UI):** Open the hamburger menu. Verify you can access all admin features seamlessly without horizontal scrolling breaking the data tables.

---

## Phase 4: Unified Live Support System

### 1. Ticket Creation & Admin Sync
*   [ ] **Action:** Log in as a Customer or Marketer. Open the Support/Tickets page.
*   [ ] **Action:** Create a new ticket with a subject, category, and initial message.
*   [ ] **Verify (Real-Time):** Have the Admin Panel open in a separate window. The new ticket should appear in the Admin queue **instantly** without refreshing the page.

### 2. Real-Time Chat Engine
*   [ ] **Action:** Open the specific ticket chat on both the User screen and the Admin screen side-by-side.
*   [ ] **Action:** Send a message as the User.
*   [ ] **Verify (Optimistic UI):** The message should appear instantly on the User's screen.
*   [ ] **Verify (Real-Time Sync):** The message should appear instantly on the Admin's screen without a refresh.
*   [ ] **Action:** Send an "Internal Note" as the Admin.
*   [ ] **Verify (Security):** The note should appear on the Admin screen (highlighted yellow), but it **must not** appear on the User's screen.

---

## Summary of Critical Database Tables to Monitor
While testing, keep your Supabase Dashboard open and monitor these tables to ensure data lands exactly where expected:

1.  `skin_user_profiles`: Check for accurate capture of Name, Email, and Phone during guest checkout.
2.  `skin_orders`: Check total amounts and applied discount exact values.
3.  `skin_marketer_commissions`: Watch the `skin_status` column transition from `pending` to `approved` upon admin order verification.
4.  `skin_ticket_messages`: Verify that chat logs are saving correctly and that `skin_is_internal_note` is properly flagged.
