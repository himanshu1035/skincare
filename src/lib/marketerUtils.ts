import { createClient } from '@/lib/supabase';

export async function recordMarketerCommission(orderId: string) {
  const supabase = createClient();

  // 1. Check if commission already exists for this order
  const { data: existing } = await supabase
    .from('skin_marketer_commissions')
    .select('skin_id')
    .eq('skin_order_id', orderId)
    .maybeSingle();

  if (existing) return; // Prevent duplicates

  // 2. Fetch order details
  const { data: order, error: orderError } = await supabase
    .from('skin_orders')
    .select('*, skin_marketers(*)')
    .eq('skin_id', orderId)
    .single();

  if (orderError || !order || !order.skin_marketer_id) return;

  const marketer = order.skin_marketers;
  if (!marketer) return;

  // 3. Calculate commission (Consistent with Checkout Logic: % of Order Total)
  const orderAmount = Number(order.skin_total_amount);
  const commissionPercent = Number(marketer.skin_commission_percent || 0);
  const fixedBonus = Number(marketer.skin_fixed_bonus || 0);

  const commissionEarned = (orderAmount * commissionPercent) / 100;

  // 4. Record in skin_marketer_commissions
  await supabase
    .from('skin_marketer_commissions')
    .insert({
      skin_marketer_id: order.skin_marketer_id,
      skin_order_id: orderId,
      skin_coupon_id: order.skin_marketer_coupon_id,
      skin_order_amount: orderAmount,
      skin_commission_earned: commissionEarned,
      skin_bonus_earned: fixedBonus,
      skin_status: 'approved' 
    });
}

export async function approveMarketerCommission(orderId: string) {
  const supabase = createClient();
  
  // Update existing pending commission to approved
  const { error } = await supabase
    .from('skin_marketer_commissions')
    .update({ skin_status: 'approved' })
    .eq('skin_order_id', orderId)
    .eq('skin_status', 'pending');

  if (error) {
    console.error("Error approving marketer commission:", error);
    // FALLBACK: If no pending record exists, try recording it fresh
    await recordMarketerCommission(orderId);
  }
}
