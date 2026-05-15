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

  // 3. Calculate commission (Consistent with Checkout Logic: % of the DISCOUNT provided)
  const subtotal = Number(order.skin_total_amount) + Number(order.skin_discount_amount || 0); // Estimate original subtotal
  
  let marketerDiscount = 0;
  if (order.skin_marketer_coupon_id) {
    // We'd ideally need the specific coupon details here, but for fallback we'll use the record's logic
    // Since we now record at checkout, this fallback is less critical but should be consistent
    const couponPercent = Number(marketer.skin_commission_percent || 0); 
    // Assuming the discount amount recorded in order is the base for calculation
    marketerDiscount = Number(order.skin_discount_amount || 0); 
  }

  const commissionEarned = (marketerDiscount * (marketer.skin_commission_percent || 0)) / 100;

  const orderAmount = Number(order.skin_total_amount);
  const fixedBonus = Number(marketer.skin_fixed_bonus || 0);

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
