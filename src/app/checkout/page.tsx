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
import { ChevronLeft, Lock, Info, Phone, IndianRupee, ShieldCheck, User, Key, CheckCircle2, Loader2, Mail, Send, AlertCircle, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const { items, getTotal } = useCartStore();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'COD' | 'UPI'>('UPI');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'verified' | 'new' | 'verification_sent'>('idle');
  const [password, setPassword] = useState('');
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

  const checkEmailVerification = async (val: string) => {
    if (!val || !val.includes('@') || user) {
       if (user) setEmailStatus('verified');
       return;
    }
    
    setEmailStatus('checking');
    const { data } = await supabase
      .from('skin_user_profiles')
      .select('skin_email')
      .eq('skin_email', val.toLowerCase())
      .maybeSingle();

    if (data) {
      setEmailStatus('verified');
    } else {
      setEmailStatus('new');
    }
  };

  const handleSendVerification = async () => {
    if (!password || password.length < 8) {
      alert('Please enter a password (min 8 characters) to create your account.');
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: 'Guest', // Will be updated during order creation
        }
      }
    });

    if (error) {
      alert('Verification Error: ' + error.message);
    } else {
      setEmailStatus('verification_sent');
    }
    setIsSubmitting(false);
  };

  const checkVerificationStatus = async () => {
    setIsSubmitting(true);
    // Try to sign in or check profiles again
    const { data } = await supabase
      .from('skin_user_profiles')
      .select('skin_email')
      .eq('skin_email', email.toLowerCase())
      .maybeSingle();

    if (data) {
      setEmailStatus('verified');
      alert('Email Verified! You can now proceed to payment.');
    } else {
      alert('Verification not detected yet. Please check your email and click the verification link.');
    }
    setIsSubmitting(false);
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
    if (emailStatus !== 'verified') {
      alert('Please verify your email before proceeding to payment.');
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

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
      skin_user_id: user?.id || null,
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
          <Link href="/" className="text-2xl font-bold tracking-tighter">COSRX</Link>
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest">
            <Lock size={14} /> Secure Checkout
          </div>
        </div>
      </div>

      <div className="container py-12">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-7 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Contact Information</h2>
                {!user && <p className="text-sm">Already have an account? <Link href="/auth" className="text-accent-gold underline">Log in</Link></p>}
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Email address" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailStatus('idle'); }}
                    onBlur={(e) => checkEmailVerification(e.target.value)}
                    required 
                    readOnly={emailStatus === 'verification_sent'}
                    className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {emailStatus === 'checking' && <Loader2 className="animate-spin text-accent-gold" size={16} />}
                    {emailStatus === 'verified' && <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest"><CheckCircle2 size={12} /> Verified</div>}
                    {emailStatus === 'verification_sent' && <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest"><Clock size={12} /> Awaiting Verification</div>}
                  </div>
                </div>

                {emailStatus === 'verification_sent' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="text-blue-600" size={18} />
                      <p className="text-[11px] font-bold text-blue-700">Check your inbox to verify email.</p>
                    </div>
                    <button type="button" onClick={checkVerificationStatus} className="text-[10px] font-black uppercase tracking-widest text-blue-800 hover:underline">I have verified</button>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input name="primaryPhone" type="tel" placeholder="Mobile Number" defaultValue={user?.phone} required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input name="alternatePhone" type="tel" placeholder="Alternate Mobile (Optional)" className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" type="text" placeholder="First Name" defaultValue={user?.firstName} required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" />
                  <input name="lastName" type="text" placeholder="Last Name" defaultValue={user?.lastName} required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" />
                </div>
                <input name="street" type="text" placeholder="Street Address" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" />
                <input name="line2" type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" />
                <div className="grid grid-cols-3 gap-4">
                  <input name="city" type="text" placeholder="City" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" />
                  <input name="state" type="text" placeholder="State" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" />
                  <input name="zip" type="text" placeholder="ZIP Code" required className="w-full bg-secondary-ivory/30 border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" />
                </div>
              </div>
            </section>

            <AnimatePresence>
              {(emailStatus === 'new' || emailStatus === 'verification_sent') && (
                <motion.section 
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="p-8 rounded-[2rem] border-2 border-dashed border-accent-gold bg-accent-gold/5 space-y-6 overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-accent-gold shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">Security Verification</h3>
                      <p className="text-xs text-text-muted font-medium">Verify your email to create a secure COSRX account and proceed.</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Choose Password</label>
                    <input 
                      name="password" 
                      type="password" 
                      placeholder="Min. 8 characters" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={emailStatus === 'new'}
                      readOnly={emailStatus === 'verification_sent'}
                      className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all" 
                    />
                  </div>
                  
                  {emailStatus === 'new' && (
                    <Button 
                      type="button" 
                      onClick={handleSendVerification}
                      className="w-full h-14 text-[11px] font-black tracking-[0.2em] bg-accent-gold text-white"
                      disabled={isSubmitting || !password}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} className="mr-2" /> SEND VERIFICATION EMAIL</>}
                    </Button>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

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
              {emailStatus === 'verified' ? (
                <Button type="submit" size="lg" className="w-full h-16 text-sm font-bold tracking-widest shadow-xl" disabled={isSubmitting || items.length === 0}>
                  {isSubmitting ? 'PROCESSING...' : `PROCEED TO PAYMENT • ${formatPrice(grandTotal)}`}
                </Button>
              ) : (
                <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4">
                  <AlertCircle className="text-red-600 shrink-0" size={24} />
                  <p className="text-xs font-bold text-red-700 leading-relaxed">
                    Email verification is required for new customers. Please send and verify your email above to enable the payment button.
                  </p>
                </div>
              )}
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
