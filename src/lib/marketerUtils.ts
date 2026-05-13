import { createClient } from '@/lib/supabase';

export async function recordMarketerCommission(orderId: string) {
  const supabase = createClient();

  // 1. Fetch order details
  const { data: order, error: orderError } = await supabase
    .from('skin_orders')
    .select('*, skin_marketers(*)')
    .eq('skin_id', orderId)
    .single();

  if (orderError || !order || !order.skin_marketer_id) return;

  // 2. Fetch marketer settings
  const marketer = order.skin_marketers;
  if (!marketer) return;

  // 3. Calculate commission (New Logic: Commission is % of the DISCOUNT given to user)
  const orderAmount = Number(order.skin_total_amount);
  const discountAmount = Number(order.skin_discount_amount || 0);
  const commissionPercent = Number(marketer.skin_commission_percent);
  const fixedBonus = Number(marketer.skin_fixed_bonus);

  // If commission is 5% and discount was 100, marketer gets 5
  const commissionEarned = (discountAmount * commissionPercent) / 100;
  const totalCommission = commissionEarned + fixedBonus;

  // 4. Record in skin_marketer_commissions
  const { error: commError } = await supabase
    .from('skin_marketer_commissions')
    .insert({
      skin_marketer_id: order.skin_marketer_id,
      skin_order_id: orderId,
      skin_coupon_id: order.skin_marketer_coupon_id,
      skin_order_amount: orderAmount,
      skin_commission_earned: commissionEarned,
      skin_bonus_earned: fixedBonus,
      skin_status: 'approved' // Automatically approve since payment is verified
    });

  if (commError) {
    console.error("Error recording marketer commission:", commError);
  }
}
