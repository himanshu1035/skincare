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
import { Lock, Phone, ShieldCheck, Mail, IndianRupee, AlertCircle, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';

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
          // Attempt Login
          const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            email: data.email as string,
            password: password
          });
          if (loginErr) throw new Error('Incorrect password for this account.');
          currentUserId = loginData.user.id;
        } else {
          // Instant Signup
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

    // 2. Create Order
    const { data: order, error: orderError } = await supabase.from('skin_orders').insert({
      skin_id: crypto.randomUUID(),
      skin_customer_email: data.email,
      skin_customer_mobile: data.primaryPhone,
      skin_alternate_mobile: data.alternatePhone,
      skin_first_name: data.firstName,
      skin_last_name: data.lastName,
      skin_customer_address: data.street,
      skin_address_line2: data.line2,
      skin_customer_city: data.city,
      skin_customer_state: data.state,
      skin_customer_zip: data.zip,
      skin_country: data.country,
      skin_payment_method: paymentMethod,
      skin_total_amount: grandTotal,
      skin_items: items,
      skin_user_id: currentUserId,
      skin_status: 'pending'
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
            <section>
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
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
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input name="primaryPhone" type="tel" placeholder="Mobile Number" required defaultValue={user?.phone} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input name="alternatePhone" type="tel" placeholder="Alternate Mobile (Optional)" className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" type="text" placeholder="First Name" required defaultValue={user?.firstName} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  <input name="lastName" type="text" placeholder="Last Name" required defaultValue={user?.lastName} className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                </div>
                <input name="street" type="text" placeholder="Street Address" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                <input name="line2" type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                <div className="grid grid-cols-3 gap-4">
                  <input name="city" type="text" placeholder="City" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  <input name="state" type="text" placeholder="State" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                  <input name="zip" type="text" placeholder="ZIP Code" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-3">
                <div onClick={() => setPaymentMethod('UPI')} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-accent-gold bg-accent-gold/5 shadow-md' : 'border-secondary-ivory'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm uppercase tracking-wider">UPI (Instant Payment)</span>
                    <ShieldCheck className="text-accent-gold" size={20} />
                  </div>
                </div>
                {settings?.cod_available === 'yes' && (
                  <div onClick={() => setPaymentMethod('COD')} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-accent-gold bg-accent-gold/5 shadow-md' : 'border-secondary-ivory'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm uppercase tracking-wider">Cash on Delivery (COD)</span>
                      <span className="text-[10px] bg-secondary-ivory px-2 py-1 rounded font-black uppercase tracking-widest text-text-muted">+{formatPrice(codFee)} Fee</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="pt-8">
              <Button type="submit" size="lg" className="w-full h-16 text-sm font-bold tracking-widest shadow-xl" disabled={isSubmitting || items.length === 0}>
                {isSubmitting ? 'SECURELY PROCESSING...' : `PLACE ORDER • ${formatPrice(grandTotal)}`}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-secondary-ivory/30 rounded-[2.5rem] p-8 md:p-10 sticky top-32 border border-secondary-ivory">
              <h2 className="text-xl font-bold mb-8">Order Summary</h2>
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-20 bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-text-dark text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg">{item.quantity}</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-text-dark line-clamp-1">{item.name}</h3>
                    </div>
                    <div className="flex items-center font-bold text-sm">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-secondary-ivory">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted font-medium">Subtotal</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted font-medium">Shipping</span>
                  <div className="flex items-center gap-2">
                    {shipping === 0 && <span className="text-text-muted line-through opacity-50">{formatPrice(shippingPrice)}</span>}
                    <span className="font-bold text-accent-gold">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg pt-4 border-t border-secondary-ivory">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-black">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
