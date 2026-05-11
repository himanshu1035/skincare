import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, Lock, CreditCard, CheckCircle2, Truck, MapPin, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder, currency, checkUserExists, registerUser, settings } = useStore();
  const navigate = useNavigate();
  
  // Contact States
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [userExists, setUserExists] = useState<boolean | null>(null);

  // Address States
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<'Prepaid' | 'COD'>('Prepaid');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user exists
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email.includes('@') && mobile.length >= 10) {
        const exists = await checkUserExists(email, mobile);
        setUserExists(exists);
      } else {
        setUserExists(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [email, mobile]);

  const itemsTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharge = settings.deliveryCharge;
  const codCharge = paymentMethod === 'COD' ? settings.codCharge : 0;
  const prepayDiscount = paymentMethod === 'Prepaid' ? settings.prepayDiscount : 0;
  
  const finalTotal = itemsTotal + deliveryCharge + codCharge - prepayDiscount;
  const payNowAmount = (paymentMethod === 'COD' && settings.payDeliveryFirst) ? deliveryCharge : (paymentMethod === 'Prepaid' ? finalTotal : 0);

  const handleCompletePurchase = async () => {
    if (!email || !mobile || !address || !city || !state || !zip) {
      alert('Please fill in all details');
      return;
    }

    if (userExists === false && !password) {
      alert('Please set a password to create your account');
      return;
    }

    setIsProcessing(true);

    let userId = null;
    if (userExists === false) {
      userId = await registerUser(email, mobile, password);
      if (!userId) {
        alert('Failed to create account. Please try again.');
        setIsProcessing(false);
        return;
      }
    }

    const success = await createOrder({ 
      email, 
      mobile, 
      address, 
      city, 
      state, 
      zip, 
      paymentMethod, 
      totalAmount: finalTotal,
      userId 
    });

    if (success) {
      alert(paymentMethod === 'COD' && settings.payDeliveryFirst 
        ? `Order placed! Please pay ${currency}${deliveryCharge.toFixed(2)} delivery charge to confirm.` 
        : 'Order placed successfully!');
      navigate('/');
    } else {
      alert('Failed to place order. Please try again.');
    }
    setIsProcessing(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', marginBottom: '32px', fontWeight: '600' }}>
          <ArrowLeft size={18} /> BACK TO SHOP
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. Contact */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={24} color="var(--accent-gold)" /> 1. Contact Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee' }} />
                <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee' }} />
              </div>

              {userExists === false && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(197,160,89,0.05)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--accent-gold)', marginTop: '20px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '14px', marginBottom: '8px' }}>NEW CUSTOMER? CREATE PASSWORD</div>
                  <input type="password" placeholder="Set Account Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--accent-gold)' }} />
                </motion.div>
              )}
            </div>

            {/* 2. Shipping */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={24} color="var(--accent-gold)" /> 2. Shipping Address</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" placeholder="House No, Street, Landmark" value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee' }} />
                  <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee' }} />
                  <input type="text" placeholder="ZIP Code" value={zip} onChange={(e) => setZip(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee' }} />
                </div>
              </div>
            </div>

            {/* 3. Payment */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><CreditCard size={24} color="var(--accent-gold)" /> 3. Payment Method</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button 
                  onClick={() => setPaymentMethod('Prepaid')}
                  style={{ 
                    padding: '24px', borderRadius: '16px', border: paymentMethod === 'Prepaid' ? '2px solid var(--accent-gold)' : '1px solid #eee',
                    background: paymentMethod === 'Prepaid' ? 'rgba(197,160,89,0.05)' : 'white', textAlign: 'left', position: 'relative'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Pay Online</div>
                  <div style={{ fontSize: '12px', color: 'var(--success-green)', fontWeight: 'bold' }}>Save {currency}{settings.prepayDiscount} instantly</div>
                  {paymentMethod === 'Prepaid' && <CheckCircle2 size={20} style={{ position: 'absolute', top: '12px', right: '12px' }} color="var(--accent-gold)" />}
                </button>

                <button 
                  onClick={() => setPaymentMethod('COD')}
                  style={{ 
                    padding: '24px', borderRadius: '16px', border: paymentMethod === 'COD' ? '2px solid var(--accent-gold)' : '1px solid #eee',
                    background: paymentMethod === 'COD' ? 'rgba(197,160,89,0.05)' : 'white', textAlign: 'left', position: 'relative'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Cash on Delivery</div>
                  <div style={{ fontSize: '12px', color: 'var(--error-red)' }}>+{currency}{settings.codCharge} COD Charge</div>
                  {paymentMethod === 'COD' && <CheckCircle2 size={20} style={{ position: 'absolute', top: '12px', right: '12px' }} color="var(--accent-gold)" />}
                </button>
              </div>

              {paymentMethod === 'COD' && settings.payDeliveryFirst && (
                <div style={{ marginTop: '20px', background: '#fff9e6', border: '1px solid #ffe58f', padding: '16px', borderRadius: '12px', fontSize: '13px', display: 'flex', gap: '10px' }}>
                  <Truck size={20} color="#faad14" />
                  <div>
                    <strong>Pay Delivery First:</strong> To prevent fake orders, please pay the delivery charge of <strong>{currency}{settings.deliveryCharge}</strong> now. The rest can be paid as COD.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Order Summary</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '12px', border: '1px solid #eee' }} />
                      <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--text-dark)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>{item.name}</div>
                    <div style={{ fontWeight: 'bold' }}>{currency}{item.isFree ? '0.00' : (item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Items Subtotal</span>
                  <span>{currency}{itemsTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Delivery Charge</span>
                  <span>{currency}{deliveryCharge.toFixed(2)}</span>
                </div>
                {paymentMethod === 'COD' && settings.codCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--error-red)' }}>
                    <span>COD Extra Charge</span>
                    <span>+{currency}{settings.codCharge.toFixed(2)}</span>
                  </div>
                )}
                {paymentMethod === 'Prepaid' && settings.prepayDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-green)', fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Percent size={14} /> Prepaid Discount</span>
                    <span>-{currency}{settings.prepayDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 'bold', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  <span>Total</span>
                  <span>{currency}{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '32px', height: '64px', fontSize: '18px' }}
                onClick={handleCompletePurchase}
                disabled={isProcessing}
              >
                {isProcessing ? 'PROCESSING...' : (payNowAmount > 0 ? `PAY ${currency}${payNowAmount.toFixed(2)}` : 'PLACE ORDER')}
              </button>

              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Lock size={14} /> 256-bit Secure Encryption
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
