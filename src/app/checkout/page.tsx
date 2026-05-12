"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { Lock, Phone, ShieldCheck, Mail, IndianRupee, AlertCircle, Loader2, CreditCard, MapPin, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const { items, getTotal } = useCartStore();
  const { user, setUser } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'COD' | 'UPI'>('UPI');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Auth during checkout states
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Billing Address States
  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('skin_settings').select('*');
    if (data) {
      const settingsObj = data.reduce((acc: any, item: any) => {
        acc[item.skin_key] = item.skin_value;
        return acc;
      }, {});
      setSettings(settingsObj);
    }
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
  const grandTotal = total + shipping + codFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    let currentUserId = user?.id || null;

    // 1. Instant Auth if not logged in
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

          if (currentUserId) {
            await supabase.from('skin_user_profiles').upsert([{
              skin_id: currentUserId,
              skin_email: data.email,
              skin_first_name: data.firstName,
              skin_last_name: data.lastName,
              skin_phone: data.primaryPhone,
              skin_role: 'customer'
            }]);
          }
        }
      } catch (err: any) {
        alert(err.message);
        setIsSubmitting(false);
        return;
      }
    }

    // 2. Prepare Billing Data
    const shippingAddress = `${data.street}, ${data.line2 ? data.line2 + ', ' : ''}${data.city}, ${data.state} - ${data.zip}, ${data.country}`;
    const billingAddress = isBillingSameAsShipping 
      ? shippingAddress 
      : `${data.billingStreet}, ${data.billingLine2 ? data.billingLine2 + ', ' : ''}${data.billingCity}, ${data.billingState} - ${data.billingZip}, ${data.billingCountry}`;

    // 3. Create Order
    const { data: order, error: orderError } = await supabase.from('skin_orders').insert({
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
      skin_items: items,
      skin_user_id: currentUserId,
      skin_status: 'pending',
      skin_shipping_charge: shipping,
      skin_cod_charge: codFee
    }).select().single();

    if (orderError) {
      alert('Order Error: ' + orderError.message);
      setIsSubmitting(false);
      return;
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
            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-text-dark text-white rounded-full flex items-center justify-center text-xs">1</div>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-gold transition-colors" size={16} />
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Email address for order updates" 
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
                    <input name="primaryPhone" type="tel" placeholder="Mobile Number" required defaultValue={user?.phone} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-gold transition-colors" size={16} />
                    <input name="alternatePhone" type="tel" placeholder="Alternate Mobile (Optional)" className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-text-dark text-white rounded-full flex items-center justify-center text-xs">2</div>
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" type="text" placeholder="First Name" required defaultValue={user?.firstName} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  <input name="lastName" type="text" placeholder="Last Name" required defaultValue={user?.lastName} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                </div>
                <input name="street" type="text" placeholder="House No, Building, Street" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                <input name="line2" type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                <div className="grid grid-cols-3 gap-4">
                  <input name="city" type="text" placeholder="City" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  <input name="state" type="text" placeholder="State" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  <input name="zip" type="text" placeholder="PIN Code" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                </div>
                <input name="country" type="text" placeholder="Country" required defaultValue="India" className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
              </div>
            </section>

            {/* Billing Address Toggle */}
            <section className="bg-secondary-ivory/10 p-6 rounded-[2rem] border border-secondary-ivory">
               <label className="flex items-center gap-4 cursor-pointer select-none">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={isBillingSameAsShipping} 
                      onChange={(e) => setIsBillingSameAsShipping(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-secondary-ivory rounded-lg bg-white peer-checked:bg-text-dark peer-checked:border-text-dark transition-all flex items-center justify-center">
                       {isBillingSameAsShipping && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-text-dark">Billing address same as shipping address</span>
               </label>

               <AnimatePresence>
                  {!isBillingSameAsShipping && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 pt-8 border-t border-secondary-ivory space-y-4"
                    >
                      <h3 className="text-sm font-black uppercase tracking-widest text-text-muted mb-4">Billing Details</h3>
                      <input name="billingStreet" type="text" placeholder="Billing House No, Street" className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                      <div className="grid grid-cols-3 gap-4">
                        <input name="billingCity" type="text" placeholder="City" className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                        <input name="billingState" type="text" placeholder="State" className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                        <input name="billingZip" type="text" placeholder="PIN" className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                      </div>
                      <input name="billingCountry" type="text" placeholder="Country" defaultValue="India" className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                    </motion.div>
                  )}
               </AnimatePresence>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-text-dark text-white rounded-full flex items-center justify-center text-xs">3</div>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setPaymentMethod('UPI')} 
                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between group ${paymentMethod === 'UPI' ? 'border-accent-gold bg-accent-gold/5 shadow-md' : 'border-secondary-ivory hover:border-text-muted'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'UPI' ? 'bg-accent-gold text-white' : 'bg-secondary-ivory text-text-muted group-hover:bg-text-dark group-hover:text-white'}`}>
                      <CreditCard size={20} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Instant UPI</span>
                  </div>
                  {paymentMethod === 'UPI' && <CheckCircle2 className="text-accent-gold" size={20} />}
                </div>

                {settings?.cod_available === 'yes' && (
                  <div 
                    onClick={() => setPaymentMethod('COD')} 
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between group ${paymentMethod === 'COD' ? 'border-accent-gold bg-accent-gold/5 shadow-md' : 'border-secondary-ivory hover:border-text-muted'}`}
                  >
                    <div className="flex items-center gap-4">
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

            <div className="pt-8">
              <Button type="submit" size="lg" className="w-full h-16 text-xs font-black tracking-[0.2em] shadow-2xl rounded-full bg-text-dark hover:bg-accent-gold" disabled={isSubmitting || items.length === 0}>
                {isSubmitting ? 'SECURELY PROCESSING...' : `FINALIZE PURCHASE • ${formatPrice(grandTotal)}`}
              </Button>
            </div>
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-5">
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

              <div className="space-y-4 pt-8 border-t-2 border-dashed border-secondary-ivory">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-text-muted">
                  <span>Subtotal</span>
                  <span className="text-text-dark">{formatPrice(total)}</span>
                </div>
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
              </div>

              <div className="mt-10 p-6 bg-white/50 rounded-2xl border border-secondary-ivory flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <ShieldCheck size={20} />
                 </div>
                 <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-tight">
                    Your transaction is encrypted and protected with industry-standard security.
                 </p>
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
