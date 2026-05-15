"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/useCartStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ArrowLeft,
  ClipboardCheck,
  Zap
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

import { Suspense } from 'react';

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();
  const { clearCart, items } = useCartStore();
  const { data: checkoutData, clearData: clearCheckoutData } = useCheckoutStore();
  
  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [utr, setUtr] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    // Redirect if cart was already cleared (order completed)
    if (items.length === 0 && !isCompleting) {
      router.push('/collections/all');
      return;
    }

    if (orderId) {
      fetchData();
    } else {
      router.push('/checkout');
    }
  }, [orderId, items.length]);

  useEffect(() => {
    // PROTECTIVE MEASURE: Mark order as cancelled if tab is closed without payment
    const handleBeforeUnload = () => {
      if (orderId && !isCompleting) {
        // We use navigator.sendBeacon for reliable fires during unload
        const url = `${window.location.origin}/api/checkout/cancel?orderId=${orderId}`;
        navigator.sendBeacon(url);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [orderId, isCompleting]);

  const fetchData = async () => {
    setLoading(true);
    const { data: orderData } = await supabase.from('skin_orders').select('*').eq('skin_id', orderId).single();
    if (orderData) {
      // If order is already cancelled or paid, don't allow payment
      // If order is already paid, don't allow double payment
      if (orderData.skin_utr) {
        router.push(`/checkout/status?status=success&orderId=${orderId}`);
        return;
      }
      setOrder(orderData);
      setPaymentMethod(orderData.skin_payment_method?.toLowerCase() === 'cod' ? 'cod' : 'upi');
    } else {
      router.push('/checkout');
      return;
    }
    const { data: settingsData } = await supabase.from('skin_settings').select('*');
    if (settingsData) {
      const settingsObj = settingsData.reduce((acc: any, item: any) => {
        acc[item.skin_key] = item.skin_value;
        return acc;
      }, {});
      setSettings(settingsObj);
    }
    setLoading(false);
  };

  const handleCompleteOrder = async () => {
    // MANDATORY UTR CHECK - FORCED whenever there is an upfront payment
    if (amountToPayNow > 0) {
      if (!utr || utr.trim().length < 6) {
        alert('REQUIRED: Please enter your 12-digit Transaction ID (UTR) from your payment app. We cannot verify your payment without it.');
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(true);
    setIsCompleting(true); // Stop the beforeunload cancel logic
    
    let currentUserId = order.skin_user_id;

    // DEFERRED SIGNUP: Create account now that payment is "submitted"
    if (!currentUserId && checkoutData.email && checkoutData.password) {
      try {
        const { data: signupData, error: signupErr } = await supabase.auth.signUp({
          email: checkoutData.email,
          password: checkoutData.password,
          options: {
            data: {
              first_name: order.skin_first_name,
              last_name: order.skin_last_name,
              phone: order.skin_customer_mobile
            }
          }
        });

        if (!signupErr && signupData.user) {
          currentUserId = signupData.user.id;
          // Create profile
          await supabase.from('skin_user_profiles').insert([{
            skin_id: currentUserId,
            skin_email: checkoutData.email,
            skin_first_name: order.skin_first_name,
            skin_last_name: order.skin_last_name,
            skin_phone: order.skin_customer_mobile,
            skin_role: 'customer'
          }]);
        }
      } catch (err) {
        console.error("Deferred signup error:", err);
      }
    }

    // Logic: If there's an upfront payment (UPI or COD Handing), it goes to 'under_review'
    // If it's pure COD with NO upfront payment, it goes straight to 'pending'
    const newStatus = amountToPayNow > 0 ? 'under_review' : 'pending';

    const { error } = await supabase
      .from('skin_orders')
      .update({ 
        skin_status: newStatus,
        skin_payment_method: paymentMethod.toUpperCase(),
        skin_utr: utr || null,
        skin_payment_status: (amountToPayNow > 0) ? 'verified' : 'unpaid',
        skin_user_id: currentUserId // Link the deferred user ID
      })
      .eq('skin_id', orderId);

    if (!error) {
      clearCart();
      clearCheckoutData();
      router.push(`/checkout/status?status=success&orderId=${orderId}`);
    } else {
      alert('Error: ' + error.message);
      setIsSubmitting(false);
      setIsCompleting(false);
    }
    setIsSubmitting(false);
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this payment? Your order will be permanently cancelled.")) return;
    
    setIsSubmitting(true);
    setIsCompleting(true); // Prevent the beforeunload listener from firing twice

    if (orderId) {
      await supabase
        .from('skin_orders')
        .update({ skin_status: 'cancelled', skin_payment_status: 'failed' })
        .eq('skin_id', orderId);
    }
    
    router.push(`/checkout/status?status=cancelled&orderId=${orderId}`);
  };

  if (!isMounted || loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>;

  const finalTotal = Number(order.skin_total_amount);
  const upiId = settings?.upi_id || 'merchant@upi';
  const merchantName = encodeURIComponent(settings?.upi_name || 'COSRX STORE');
  
  // New Logic: COD Upfront = Shipping + COD Fee (if admin enabled)
  const shippingCharge = Number(order.skin_shipping_charge || 0);
  const codCharge = Number(order.skin_cod_charge || 0);
  const totalHandlingCharges = shippingCharge + codCharge;

  const amountToPayNow = paymentMethod === 'cod' 
    ? (settings?.prepay_handling_for_cod === 'yes' ? totalHandlingCharges : 0)
    : finalTotal;

  // Standard UPI deep link with TR and MC to avoid "Amount > 2000" bank restrictions
  // MC 5311 is for Departmental Stores (Generic Retail)
  const transactionId = `TXN${orderId?.slice(0, 8)}${Date.now().toString().slice(-6)}`;
  const upiLink = `upi://pay?pa=${upiId}&pn=${merchantName}&tr=${transactionId}&mc=5311&am=${amountToPayNow}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  // Direct app handlers to avoid WhatsApp redirection and handle specific app logic
  const openPaymentApp = (app: string) => {
    // Standard params: pa (vpa), pn (name), am (amount), cu (currency)
    // We remove 'tr' and 'mc' for GPay to avoid "blank screen" bugs on personal VPAs
    const baseParams = `pa=${upiId}&pn=${merchantName}&am=${amountToPayNow}&cu=INR`;
    
    // Fallback for amount > 2000
    const manualParams = `pa=${upiId}&pn=${merchantName}&cu=INR`;
    const params = amountToPayNow > 2000 ? manualParams : baseParams;

    let link = `upi://pay?${params}`;

    if (app === 'gpay') {
      // Use the standard upi:// scheme for GPay as tez:// can be unreliable for P2P
      link = `upi://pay?${params}`;
    } else if (app === 'phonepe') {
      link = `phonepe://pay?${params}`;
    } else if (app === 'paytm') {
      link = `paytmmp://pay?${params}`;
    }
    
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      if (app === 'gpay') {
        link = `intent://pay?${params}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
      } else if (app === 'phonepe') {
        link = `intent://pay?${params}#Intent;scheme=upi;package=com.phonepe.app;end`;
      } else if (app === 'paytm') {
        link = `intent://pay?${params}#Intent;scheme=upi;package=net.one97.paytm;end`;
      }
    }
    
    window.location.href = link;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <main className="min-h-screen bg-secondary-ivory/20">
      <Navbar />
      <div className="pt-40 pb-24">
        <div className="container max-w-6xl">
          <button onClick={handleCancel} className="flex items-center gap-2 text-text-muted hover:text-red-500 font-black uppercase tracking-widest text-[10px] mb-8 transition-colors">
            <ArrowLeft size={14} /> Cancel Order & Return
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Order Summary on Left */}
            <div className="lg:sticky lg:top-40 h-fit space-y-8 order-2 lg:order-1">
              <div className="bg-text-dark text-white rounded-[3rem] p-10 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-2xl font-black tracking-tight mb-8">Summary</h3>
                
                <div className="space-y-4 border-b border-white/10 pb-8 mb-8">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-60 font-medium tracking-widest uppercase">Subtotal</span>
                    <span className="font-bold">{formatPrice(order.skin_total_amount + (order.skin_discount_amount || 0) + (order.skin_promo_savings || 0) - (order.skin_shipping_charge || 0) - (order.skin_cod_charge || 0))}</span>
                  </div>
                  
                  {order.skin_discount_amount > 0 && (
                    <div className="flex justify-between text-xs text-green-400">
                      <span className="opacity-80 font-medium tracking-widest uppercase">Coupon: {order.skin_coupon_code}</span>
                      <span className="font-bold">-{formatPrice(order.skin_discount_amount)}</span>
                    </div>
                  )}

                  {order.skin_promo_savings > 0 && (
                    <div className="flex justify-between text-xs text-accent-gold">
                      <span className="opacity-80 font-medium tracking-widest uppercase">Promotional Savings</span>
                      <span className="font-bold">-{formatPrice(order.skin_promo_savings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs">
                    <span className="opacity-60 font-medium tracking-widest uppercase">Shipping</span>
                    <span className="font-bold">{order.skin_shipping_charge > 0 ? formatPrice(order.skin_shipping_charge) : 'FREE'}</span>
                  </div>

                  {order.skin_cod_charge > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="opacity-60 font-medium tracking-widest uppercase">COD Fee</span>
                      <span className="font-bold">{formatPrice(order.skin_cod_charge)}</span>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-white/5 flex justify-between text-sm">
                    <span className="opacity-60 font-medium uppercase tracking-widest">Total Order Value</span>
                    <span className="font-bold">{formatPrice(finalTotal)}</span>
                  </div>

                  {amountToPayNow > 0 && amountToPayNow < finalTotal && (
                    <div className="flex justify-between text-sm text-accent-gold pt-2 border-t border-white/5">
                      <span className="font-bold uppercase tracking-widest text-[10px]">Balance Due at Doorstep</span>
                      <span className="font-black">{formatPrice(finalTotal - amountToPayNow)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end mb-10">
                  <div>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mb-1">
                      {amountToPayNow > 0 ? 'Pay to Confirm' : 'Due at Delivery'}
                    </p>
                    <p className="text-5xl font-black tracking-tighter">
                      {formatPrice(amountToPayNow > 0 ? amountToPayNow : finalTotal)}
                    </p>
                  </div>
                  <ShieldCheck size={40} className="opacity-20" />
                </div>

                {(!(amountToPayNow > 0 && (!utr || utr.trim().length < 6))) ? (
                  <button 
                    onClick={handleCompleteOrder}
                    disabled={isSubmitting}
                    className={`w-full py-6 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-3 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-white text-text-dark hover:bg-accent-gold hover:text-white'}`}
                  >
                    {isSubmitting ? 'VERIFYING...' : 'CONFIRM ORDER'} <ChevronRight size={18} />
                  </button>
                ) : (
                  <div className="w-full py-6 rounded-2xl bg-secondary-ivory border-2 border-dashed border-accent-gold/30 text-accent-gold text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                    Please Enter UTR to Confirm
                  </div>
                )}
              </div>

              <div className="p-8 border border-gray-100 rounded-[2rem] bg-white/50 flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-xs font-medium text-text-muted leading-relaxed italic">
                  Payment verification takes 5-10 minutes. Please keep your app open until confirmed.
                </div>
              </div>
            </div>

            {/* Payment Options on Right */}
            <div className="space-y-6 order-1 lg:order-2">
              <header>
                <h1 className="text-4xl font-black tracking-tighter text-text-dark">Complete Payment</h1>
                <p className="text-text-muted mt-2 font-medium italic italic capitalize">
                  Method: {paymentMethod === 'upi' ? 'Instant UPI / QR' : 'Cash on Delivery'}
                </p>
              </header>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
                {amountToPayNow > 0 ? (
                  <div className="text-center space-y-6">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-gold/10 text-accent-gold rounded-full text-[9px] font-black uppercase tracking-widest">
                        <Zap size={10} /> Secure UPI Payment
                      </div>
                      <h3 className="text-xl font-black tracking-tight">
                        {paymentMethod === 'cod' ? 'Confirm Delivery' : 'Scan to Pay Now'}
                      </h3>
                    </div>

                    <div className="relative inline-block p-4 bg-white border-2 border-secondary-ivory rounded-[2rem] shadow-lg overflow-hidden group">
                       <img src={qrUrl} alt="UPI Payment QR" className="w-48 h-48 object-contain relative z-10" />
                       <div className="absolute inset-0 bg-accent-gold/5 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full blur-3xl" />
                    </div>

                    {/* UPI ID Display & Copy */}
                    <div className="bg-secondary-ivory/30 p-4 rounded-2xl border border-secondary-ivory/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-0.5">Merchant UPI ID</p>
                          <p className="text-[10px] font-black text-text-dark select-all">{upiId}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(upiId, 'UPI ID')}
                          className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-text-dark hover:bg-accent-gold hover:text-white transition-all shadow-sm"
                        >
                          <ClipboardCheck size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-secondary-ivory/50">
                        <div className="text-left">
                          <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-0.5">Total Amount</p>
                          <p className="text-lg font-black text-accent-gold">{formatPrice(amountToPayNow)}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(amountToPayNow.toString(), 'Amount')}
                          className="px-3 h-8 rounded-lg bg-white flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-dark hover:bg-accent-gold hover:text-white transition-all shadow-sm"
                        >
                          Copy ₹
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-secondary-ivory space-y-4">
                      <div className="text-left bg-accent-gold/5 p-5 rounded-2xl border border-accent-gold/20">
                        <label className="text-[9px] font-black uppercase tracking-widest text-accent-gold mb-2 block">REQUIRED: Enter Transaction ID / UTR Number</label>
                        <div className="relative">
                          <ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-gold" size={16} />
                          <input 
                            type="text" 
                            value={utr}
                            required
                            onChange={(e) => setUtr(e.target.value)}
                            placeholder="Enter 12-digit UTR Number"
                            className="w-full h-12 bg-white border-2 border-accent-gold/30 rounded-xl pl-11 pr-4 text-xs font-bold focus:border-accent-gold outline-none transition-all placeholder:text-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tight">Cash on Delivery</h3>
                      <p className="text-xs text-text-muted font-medium">You will pay <span className="font-black text-text-dark">{formatPrice(finalTotal)}</span> at your doorstep.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
