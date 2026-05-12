"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/useCartStore';
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
  const { clearCart } = useCartStore();
  
  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [utr, setUtr] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    if (orderId) {
      fetchData();
    } else {
      router.push('/checkout');
    }
  }, [orderId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: orderData } = await supabase.from('skin_orders').select('*').eq('skin_id', orderId).single();
    if (orderData) {
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
    
    // Update status to 'under_review' for UPI so it shows as pending in admin
    // For COD with upfront payment, it also goes under review for the handling charge
    const newStatus = 'under_review';

    const { error } = await supabase
      .from('skin_orders')
      .update({ 
        skin_status: newStatus,
        skin_payment_method: paymentMethod.toUpperCase(),
        skin_utr: utr || null,
        skin_payment_status: (amountToPayNow > 0) ? 'verified' : 'unpaid'
      })
      .eq('skin_id', orderId);

    if (!error) {
      clearCart(); // ONLY clear cart on success
      router.push(`/checkout/status?status=success&orderId=${orderId}`);
    } else {
      alert('Error: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const handleBack = async () => {
    // Mark current order as failed before going back
    if (orderId) {
      await supabase
        .from('skin_orders')
        .update({ skin_status: 'cancelled', skin_payment_status: 'failed' })
        .eq('skin_id', orderId);
    }
    router.push('/checkout');
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
    let link = upiLink;
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      // Direct Intent URLs to bypass chooser and fix bank checks
      if (app === 'gpay') {
        link = `intent://pay?pa=${upiId}&pn=${merchantName}&am=${amountToPayNow}&tr=${transactionId}&mc=5311&cu=INR#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
      } else if (app === 'phonepe') {
        link = `intent://pay?pa=${upiId}&pn=${merchantName}&am=${amountToPayNow}&tr=${transactionId}&mc=5311&cu=INR#Intent;scheme=upi;package=com.phonepe.app;end`;
      } else if (app === 'paytm') {
        link = `intent://pay?pa=${upiId}&pn=${merchantName}&am=${amountToPayNow}&tr=${transactionId}&mc=5311&cu=INR#Intent;scheme=upi;package=net.one97.paytm;end`;
      }
    } else {
      // iOS / Other handles basic upi:// scheme
      link = upiLink;
    }
    
    window.location.href = link;
  };

  const apps = [
    { id: 'gpay', name: 'Google Pay', icon: 'https://cdn.iconscout.com/icon/free/png-256/google-pay-2038779-1721670.png' },
    { id: 'phonepe', name: 'PhonePe', icon: 'https://cdn.iconscout.com/icon/free/png-256/phonepe-2038781-1721672.png' },
    { id: 'paytm', name: 'Paytm', icon: 'https://cdn.iconscout.com/icon/free/png-256/paytm-226448.png' }
  ];

  return (
    <main className="min-h-screen bg-secondary-ivory/20">
      <Navbar />
      <div className="pt-40 pb-24">
        <div className="container max-w-6xl">
          <button onClick={handleBack} className="flex items-center gap-2 text-text-muted hover:text-text-dark font-black uppercase tracking-widest text-[10px] mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Shipping Info
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <header>
                <h1 className="text-4xl font-black tracking-tighter text-text-dark">Complete Payment</h1>
                <p className="text-text-muted mt-2 font-medium italic">Secure your order via UPI or Cash on Delivery.</p>
              </header>

              <div className="space-y-4">
                <button 
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${paymentMethod === 'upi' ? 'border-accent-gold bg-white shadow-xl' : 'border-transparent bg-white/50 hover:bg-white'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'upi' ? 'bg-accent-gold text-white' : 'bg-secondary-ivory text-text-muted'}`}>
                      <Smartphone size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-text-dark uppercase tracking-widest text-[10px] mb-1">Instant Payment</p>
                      <h3 className="text-xl font-black tracking-tight">UPI / QR Code</h3>
                    </div>
                  </div>
                  {paymentMethod === 'upi' && <CheckCircle2 className="text-accent-gold" size={24} />}
                </button>

                {settings?.cod_available === 'yes' && (
                  <button 
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${paymentMethod === 'cod' ? 'border-accent-gold bg-white shadow-xl' : 'border-transparent bg-white/50 hover:bg-white'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-accent-gold text-white' : 'bg-secondary-ivory text-text-muted'}`}>
                        <CreditCard size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-text-dark uppercase tracking-widest text-[10px] mb-1">Pay on Delivery</p>
                        <h3 className="text-xl font-black tracking-tight">Cash on Delivery</h3>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <CheckCircle2 className="text-accent-gold" size={24} />}
                  </button>
                )}
              </div>

              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100">
                {amountToPayNow > 0 ? (
                  <div className="text-center space-y-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 text-accent-gold rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Zap size={12} /> Secure UPI Payment
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">
                        {paymentMethod === 'cod' ? 'Confirm Delivery' : 'Scan this QR'}
                      </h3>
                      <p className="text-sm text-text-muted font-medium">
                        {paymentMethod === 'cod' 
                          ? `Pay ${formatPrice(amountToPayNow)} to confirm your COD order.` 
                          : `Pay exactly ${formatPrice(amountToPayNow)} to secure your order.`
                        }
                      </p>
                    </div>

                    <div className="relative inline-block p-4 bg-white border-2 border-secondary-ivory rounded-[2.5rem] shadow-sm overflow-hidden group">
                       <img src={qrUrl} alt="UPI Payment QR" className="w-60 h-60 object-contain relative z-10" />
                       <div className="absolute inset-0 bg-accent-gold/5 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full blur-3xl" />
                    </div>

                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Or Click to Open App</p>
                      <div className="flex justify-center gap-6">
                        {apps.map((app) => (
                          <button 
                            key={app.id} 
                            onClick={() => openPaymentApp(app.id)}
                            className="flex flex-col items-center gap-3 group"
                          >
                            <div className="w-16 h-16 rounded-2xl bg-secondary-ivory p-3 group-hover:scale-110 transition-transform shadow-sm flex items-center justify-center">
                              <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-secondary-ivory space-y-4">
                      <div className="text-left bg-accent-gold/5 p-6 rounded-[2rem] border border-accent-gold/20">
                        <label className="text-[10px] font-black uppercase tracking-widest text-accent-gold mb-3 block">REQUIRED: Enter Transaction ID / UTR Number</label>
                        <div className="relative">
                          <ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-gold" size={18} />
                          <input 
                            type="text" 
                            value={utr}
                            required
                            onChange={(e) => setUtr(e.target.value)}
                            placeholder="Enter 12-digit UTR Number"
                            className="w-full h-14 bg-white border-2 border-accent-gold/30 rounded-2xl pl-12 pr-4 text-sm font-bold focus:border-accent-gold outline-none transition-all placeholder:text-gray-300"
                          />
                        </div>
                        <p className="text-[9px] text-text-muted mt-3 font-medium leading-relaxed italic">
                          Wait 1 minute after paying to see the UTR in your app history. You MUST enter this to confirm your order.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-6">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto">
                      <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black tracking-tight">Cash on Delivery</h3>
                      <p className="text-sm text-text-muted font-medium">You will pay <span className="font-black text-text-dark">{formatPrice(finalTotal)}</span> at your doorstep.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:sticky lg:top-40 h-fit space-y-8">
              <div className="bg-text-dark text-white rounded-[3rem] p-10 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-2xl font-black tracking-tight mb-8">Summary</h3>
                
                <div className="space-y-6 border-b border-white/10 pb-8 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60 font-medium">Total Order Value</span>
                    <span className="font-bold">{formatPrice(finalTotal)}</span>
                  </div>
                  {amountToPayNow > 0 && amountToPayNow < finalTotal && (
                    <div className="flex justify-between text-sm text-accent-gold">
                      <span className="font-medium">Balance Due at Doorstep</span>
                      <span className="font-bold">{formatPrice(finalTotal - amountToPayNow)}</span>
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
