"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { Lock, Phone, ShieldCheck, Mail, IndianRupee, AlertCircle, Loader2, CreditCard, MapPin, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CouponInput } from '@/components/CouponInput';

export default function CheckoutPage() {
  const { items, promoItems, getTotal, discountAmount, appliedCoupons, promoSavings, getGrandTotal, removeCoupon } = useCartStore();
  const { user } = useAuthStore();
  const { data: savedData, setData: setSavedData } = useCheckoutStore();
  
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'COD' | 'UPI'>('UPI');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Auth and Form states
  const [email, setEmail] = useState(savedData.email || user?.email || '');
  const [password, setPassword] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/collections/all');
      return;
    }
    fetchSettings();
  }, [items, router]);

  // Auto-remove prepaid only coupons if switching to COD
  useEffect(() => {
    if (paymentMethod === 'COD') {
       appliedCoupons.forEach(c => {
          if (c.skin_type === 'percent' || c.skin_type === 'percentage' || c.skin_discount_percent) {
             const val = c.skin_discount_percent || c.skin_value;
             // Logic placeholder: newTotalDiscount += (subtotal * val) / 100;
          }
          else {
             // Logic placeholder: newTotalDiscount += c.skin_value || c.skin_discount_amount || 0;
          }
          if (c.skin_is_prepaid_only) {
            removeCoupon(c.skin_code);
          }
       });
    }
  }, [paymentMethod, appliedCoupons, removeCoupon]);

  const fetchSettings = async () => {
    const [settingsRes, marketerSettingsRes] = await Promise.all([
      supabase.from('skin_settings').select('*'),
      supabase.from('skin_marketer_settings').select('skin_is_stackable_allowed').eq('skin_id', 1).single()
    ]);

    let settingsObj: any = {};
    if (settingsRes.data) {
      settingsObj = settingsRes.data.reduce((acc: any, item: any) => {
        acc[item.skin_key] = item.skin_value;
        return acc;
      }, {});
    }

    if (marketerSettingsRes.data) {
      settingsObj.marketer_coupon_stacking = marketerSettingsRes.data.skin_is_stackable_allowed ? 'yes' : 'no';
    }

    setSettings(settingsObj);
    setLoading(false);
  };

  const checkUserExists = async (emailVal: string) => {
    if (!emailVal || user) return;
    const { data } = await supabase.from('skin_user_profiles').select('skin_id').eq('skin_email', emailVal).maybeSingle();
    setIsExistingUser(!!data);
  };

  if (!isMounted || loading) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold"></div></div>;

  const total = getTotal();
  const freeThreshold = Number(settings?.free_shipping_threshold || 1000);
  const shippingPrice = Number(settings?.shipping_price || 100);
  const shipping = total >= freeThreshold ? 0 : shippingPrice;
  const codFee = paymentMethod === 'COD' ? Number(settings?.cod_handling_price || 50) : 0;
  const grandTotal = getGrandTotal() + shipping + codFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // Save for persistence
    setSavedData(data as any);

    let currentUserId = user?.id || null;

    if (!user) {
      try {
        if (isExistingUser) {
          const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            email: data.email as string,
            password: password
          });
          if (loginErr) throw new Error('Incorrect password for this account.');
          currentUserId = loginData.user.id;
        } else {
          const { data: signupData, error: signupErr } = await supabase.auth.signUp({
            email: data.email as string,
            password: password,
          });
          if (signupErr) throw signupErr;
          currentUserId = signupData.user?.id || null;
        }

      } catch (err: any) {
        alert(err.message);
        setIsSubmitting(false);
        return;
      }
    }

    // ALWAYS ensure profile exists in skin_user_profiles before order to prevent Foreign Key errors
    if (currentUserId) {
      const { error: profileSyncError } = await supabase.from('skin_user_profiles').upsert([{
        skin_id: currentUserId,
        skin_email: data.email,
        skin_first_name: data.firstName,
        skin_last_name: data.lastName,
        skin_phone: data.primaryPhone,
        skin_role: 'customer'
      }]);
      
      if (profileSyncError) {
        console.error("Profile Sync Error:", profileSyncError);
      }
    }

    const shippingAddress = `${data.street}, ${data.line2 ? data.line2 + ', ' : ''}${data.city}, ${data.state} - ${data.zip}, ${data.country}`;
    const billingAddress = isBillingSameAsShipping 
      ? shippingAddress 
      : `${data.billingStreet}, ${data.billingLine2 ? data.billingLine2 + ', ' : ''}${data.billingCity}, ${data.billingState} - ${data.billingZip}, ${data.billingCountry}`;

    const orderPayload = {
      skin_id: crypto.randomUUID(),
      skin_customer_email: data.email,
      skin_customer_mobile: data.primaryPhone,
      skin_alternate_mobile: data.alternatePhone,
      skin_first_name: data.firstName,
      skin_last_name: data.lastName,
      skin_customer_address: shippingAddress,
      skin_billing_address: billingAddress,
      skin_payment_method: paymentMethod,
      skin_total_amount: grandTotal,
      skin_items: [...items, ...promoItems],
      skin_user_id: currentUserId,
      skin_status: paymentMethod === 'COD' ? 'under_review' : 'cancelled',
      skin_shipping_charge: shipping,
      skin_cod_charge: codFee,
      skin_coupon_code: appliedCoupons.map(c => c.skin_code).join(', ') || null,
      skin_discount_amount: discountAmount,
      skin_promo_savings: promoSavings,
      skin_marketer_id: appliedCoupons.find(c => c.skin_marketer_id)?.skin_marketer_id || null, // Primary marketer
      skin_marketer_coupon_id: appliedCoupons.find(c => c.skin_marketer_id)?.skin_id || null
    };

    let { data: order, error: orderError } = await supabase.from('skin_orders').insert(orderPayload).select().single();

    // FAILSAFE: If foreign key violation occurs, retry as Guest Order to save the sale
    if (orderError && orderError.message.includes('violates foreign key constraint')) {
      console.warn("Foreign Key Violation: Retrying as Guest Order to prevent checkout failure.");
      const { data: retryData, error: retryError } = await supabase.from('skin_orders').insert({
        ...orderPayload,
        skin_user_id: null
      }).select().single();
      
      order = retryData;
      orderError = retryError;
    }

    if (orderError) {
      alert('Order Error: ' + orderError.message);
      setIsSubmitting(false);
      return;
    }

    // 4. Record Marketer Commission if applicable
    const marketerCoupons = appliedCoupons.filter(c => c.skin_marketer_id);
    for (const coupon of marketerCoupons) {
      const commissionAmount = (grandTotal * (coupon.skin_commission_percent || 0)) / 100;
      
      await supabase.from('skin_marketer_commissions').insert({
        skin_marketer_id: coupon.skin_marketer_id,
        skin_order_id: order.skin_id,
        skin_coupon_id: coupon.skin_id,
        skin_order_amount: grandTotal,
        skin_commission_earned: commissionAmount,
        skin_status: 'pending'
      });
    }

    router.push(`/checkout/payment?orderId=${order.skin_id}`);
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-secondary-ivory py-6">
        <div className="container flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-text-dark">COSRX</Link>
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest">
            <Lock size={14} /> Secure Purchase
          </div>
        </div>
      </div>

      <div className="container py-12">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3 text-text-dark">
                <div className="w-8 h-8 bg-text-dark text-white rounded-full flex items-center justify-center text-xs">1</div>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-gold transition-colors" size={16} />
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Email address" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={(e) => checkUserExists(e.target.value)}
                    className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" 
                  />
                </div>

                {!user && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 bg-accent-gold/5 p-6 rounded-2xl border border-accent-gold/20">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-gold mb-2">
                         <ShieldCheck size={14} /> {isExistingUser ? 'Welcome back! Enter password' : 'Create a secure password'}
                      </div>
                      <input 
                        type="password" 
                        placeholder="Password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" 
                      />
                   </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-gold transition-colors" size={16} />
                    <input name="primaryPhone" type="tel" placeholder="Mobile Number" required defaultValue={savedData.primaryPhone || user?.phone} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-gold transition-colors" size={16} />
                    <input name="alternatePhone" type="tel" placeholder="Alternate Mobile" defaultValue={savedData.alternatePhone} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3 text-text-dark">
                <div className="w-8 h-8 bg-text-dark text-white rounded-full flex items-center justify-center text-xs">2</div>
                Shipping Address
              </h2>
              <div className="space-y-4 text-text-dark">
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" type="text" placeholder="First Name" required defaultValue={savedData.firstName || user?.firstName} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  <input name="lastName" type="text" placeholder="Last Name" required defaultValue={savedData.lastName || user?.lastName} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                </div>
                <input name="street" type="text" placeholder="House No, Building, Street" required defaultValue={savedData.street} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                <input name="line2" type="text" placeholder="Apartment, suite, etc. (optional)" defaultValue={savedData.line2} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                <div className="grid grid-cols-3 gap-4">
                  <input name="city" type="text" placeholder="City" required defaultValue={savedData.city} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  <input name="state" type="text" placeholder="State" required defaultValue={savedData.state} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  <input name="zip" type="text" placeholder="PIN Code" required defaultValue={savedData.zip} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                </div>
                <input name="country" type="text" placeholder="Country" required defaultValue={savedData.country || "India"} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
              </div>
            </section>

            <section className="bg-secondary-ivory/10 p-6 rounded-[2rem] border border-secondary-ivory">
               <label className="flex items-center gap-4 cursor-pointer select-none">
                  <div className="relative">
                    <input type="checkbox" checked={isBillingSameAsShipping} onChange={(e) => setIsBillingSameAsShipping(e.target.checked)} className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-secondary-ivory rounded-lg bg-white peer-checked:bg-text-dark peer-checked:border-text-dark transition-all flex items-center justify-center">
                       {isBillingSameAsShipping && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-text-dark">Billing address same as shipping address</span>
               </label>
            </section>

            <section>
              <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3 text-text-dark">
                <div className="w-8 h-8 bg-text-dark text-white rounded-full flex items-center justify-center text-xs">3</div>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => setPaymentMethod('UPI')} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between group ${paymentMethod === 'UPI' ? 'border-accent-gold bg-accent-gold/5 shadow-md' : 'border-secondary-ivory hover:border-text-muted'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'UPI' ? 'bg-accent-gold text-white' : 'bg-secondary-ivory text-text-muted group-hover:bg-text-dark group-hover:text-white'}`}>
                      <CreditCard size={20} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest text-text-dark">Instant UPI</span>
                  </div>
                  {paymentMethod === 'UPI' && <CheckCircle2 className="text-accent-gold" size={20} />}
                </div>
                {settings?.cod_available === 'yes' && (
                  <div onClick={() => setPaymentMethod('COD')} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between group ${paymentMethod === 'COD' ? 'border-accent-gold bg-accent-gold/5 shadow-md' : 'border-secondary-ivory hover:border-text-muted'}`}>
                    <div className="flex items-center gap-4 text-text-dark">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'COD' ? 'bg-accent-gold text-white' : 'bg-secondary-ivory text-text-muted group-hover:bg-text-dark group-hover:text-white'}`}>
                        <IndianRupee size={20} />
                      </div>
                      <span className="font-black text-xs uppercase tracking-widest">Cash on Delivery</span>
                    </div>
                    {paymentMethod === 'COD' && <CheckCircle2 className="text-accent-gold" size={20} />}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 text-text-dark">
            <div className="bg-secondary-ivory/20 rounded-[3rem] p-8 md:p-10 sticky top-32 border border-secondary-ivory shadow-sm">
              <h2 className="text-xl font-black mb-8 uppercase tracking-tight">Order Details</h2>
              <div className="space-y-6 mb-8 max-h-[35vh] overflow-y-auto pr-4 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-24 h-24 bg-white rounded-2xl overflow-hidden shadow-inner flex-shrink-0 border border-secondary-ivory">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-text-dark text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white">{item.quantity}</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-xs font-black text-text-dark line-clamp-2 uppercase tracking-tight leading-relaxed">{item.name}</h3>
                      <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">{formatPrice(item.price)} each</p>
                    </div>
                    <div className="flex items-center font-black text-sm text-text-dark">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <CouponInput paymentMethod={paymentMethod} settings={settings} />
              </div>

              <div className="space-y-4 pt-8 border-t-2 border-dashed border-secondary-ivory">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-text-muted">
                  <span>Subtotal</span>
                  <span className="text-text-dark">{formatPrice(total)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {promoSavings > 0 && (
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-accent-gold">
                    <span>Promotional Savings</span>
                    <span>-{formatPrice(promoSavings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-text-muted">
                  <span>Shipping & Delivery</span>
                  <div className="flex items-center gap-2">
                    {shipping === 0 && <span className="line-through opacity-40">{formatPrice(shippingPrice)}</span>}
                    <span className="text-accent-gold">{shipping === 0 ? 'COMPLIMENTARY' : formatPrice(shipping)}</span>
                  </div>
                </div>
                {paymentMethod === 'COD' && (
                   <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-text-muted">
                      <span>COD Handling Fee</span>
                      <span className="text-text-dark">{formatPrice(codFee)}</span>
                   </motion.div>
                )}
                <div className="flex justify-between items-end pt-6 mt-4 border-t border-secondary-ivory">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-1">Grand Total</p>
                    <p className="text-3xl font-black text-text-dark tracking-tighter">{formatPrice(grandTotal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-accent-gold uppercase tracking-widest">Inc. of all taxes</p>
                  </div>
                </div>

                <div className="mt-8">
                  <Button type="submit" size="lg" className="w-full h-16 text-xs font-black tracking-[0.2em] shadow-2xl rounded-full bg-text-dark hover:bg-accent-gold" disabled={isSubmitting || items.length === 0}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : `COMPLETE ORDER • ${formatPrice(grandTotal)}`}
                  </Button>
                  <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mt-4">
                    Secure 256-bit SSL Encrypted Payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </main>
  );
}
