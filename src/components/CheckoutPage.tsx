import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ChevronDown, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder, currency, checkUserExists, registerUser, settings } = useStore();
  const navigate = useNavigate();
  
  // Form States
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Punjab');
  const [zip, setZip] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Prepaid' | 'COD'>('Prepaid');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check user exists
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
    if (!email || !firstName || !lastName || !address || !city || !zip || !mobile) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    let userId = null;
    if (userExists === false && password) {
      userId = await registerUser(email, mobile, password);
    }

    const success = await createOrder({ 
      email, mobile, firstName, lastName, address, landmark, city, state, zip, paymentMethod, totalAmount: finalTotal, userId 
    });

    if (success) {
      alert('Order placed successfully!');
      navigate('/');
    } else {
      alert('Failed to place order.');
    }
    setIsProcessing(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'white', padding: '40px 0' }}>
      <style>{`
        .input-field { width: 100%; padding: 14px 16px; border: 1.5px solid #d9d9d9; borderRadius: 8px; fontSize: 14px; transition: border-color 0.2s; }
        .input-field:focus { border-color: var(--accent-gold); outline: none; }
        .section-title { font-size: 22px; font-weight: 700; margin-bottom: 20px; color: #1a1a1a; }
        .payment-card { padding: 20px; border-radius: 12px; border: 1.5px solid #eee; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-start; gap: 16px; }
        .payment-card.active { border-color: var(--accent-gold); background: #fffcf5; }
        .radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .payment-card.active .radio-circle { border-color: var(--accent-gold); }
        .radio-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent-gold); }
      `}</style>

      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px' }}>
          
          {/* Left Column: Form */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span></div>
              {!userExists && <button onClick={() => navigate('/login')} style={{ background: 'none', color: 'var(--accent-gold)', fontWeight: '600', textDecoration: 'underline' }}>Sign in</button>}
            </div>

            {/* Contact Section */}
            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Contact</h2>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
            </div>

            {/* Delivery Section */}
            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Delivery</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <select className="input-field" style={{ appearance: 'none' }} disabled>
                    <option>India</option>
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
                  <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
                </div>

                <input type="text" placeholder="Full Address (House no., Area, etc)" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
                <input type="text" placeholder="Landmark (optional)" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="input-field" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
                  <div style={{ position: 'relative' }}>
                    <select className="input-field" style={{ appearance: 'none' }} value={state} onChange={(e) => setState(e.target.value)}>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                  <input type="text" placeholder="PIN code" value={zip} onChange={(e) => setZip(e.target.value)} className="input-field" />
                </div>

                <div style={{ position: 'relative' }}>
                  <input type="tel" placeholder="Phone" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-field" />
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', cursor: 'help' }}>?</div>
                </div>
              </div>

              {userExists === false && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', background: '#f5f5f7' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>New here? Create a password to track your order.</p>
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" style={{ background: 'white' }} />
                </motion.div>
              )}
            </div>

            {/* Payment Section */}
            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Payment</h2>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>All transactions are secure and encrypted.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div 
                  className={`payment-card ${paymentMethod === 'Prepaid' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('Prepaid')}
                >
                  <div className="radio-circle">
                    {paymentMethod === 'Prepaid' && <div className="radio-dot" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600' }}>Pay Now - UPI, Cards, Wallets</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Get extra {currency}{settings.prepayDiscount} discount instantly on prepaying.</p>
                  </div>
                </div>

                <div 
                  className={`payment-card ${paymentMethod === 'COD' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="radio-circle">
                    {paymentMethod === 'COD' && <div className="radio-dot" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600' }}>Cash on Delivery</span>
                      <DollarSign size={16} color="#666" />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Handling charge of {currency}{settings.codCharge} applies for COD orders.</p>
                    {settings.payDeliveryFirst && (
                      <div style={{ marginTop: '12px', padding: '12px', background: '#fff9e6', borderRadius: '8px', fontSize: '11px', color: '#856404' }}>
                        Note: {currency}{settings.deliveryCharge} delivery charge must be paid online to confirm.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', height: '64px', fontSize: '18px', fontWeight: 'bold', borderRadius: '12px', letterSpacing: '1px' }}
              onClick={handleCompletePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? 'PROCESSING...' : (payNowAmount > 0 ? `PAY ${currency}${payNowAmount.toFixed(2)}` : 'PLACE ORDER')}
            </button>
          </div>

          {/* Right Column: Summary */}
          <div>
            <div style={{ background: '#f5f5f7', padding: '40px', borderRadius: '24px', position: 'sticky', top: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} style={{ width: '64px', height: '64px', borderRadius: '12px', border: '1px solid #ddd', background: 'white' }} alt="" />
                      <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#666', color: 'white', width: '22px', height: '22px', borderRadius: '50%', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{item.isFree ? 'Free Gift' : 'Premium Snail Mucin'}</div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>{currency}{item.isFree ? '0.00' : (item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderTop: '1px solid #ddd', paddingTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>{currency}{itemsTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shipping</span>
                  <span>{currency}{deliveryCharge.toFixed(2)}</span>
                </div>
                {paymentMethod === 'COD' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>COD Handling</span>
                    <span>{currency}{settings.codCharge.toFixed(2)}</span>
                  </div>
                )}
                {paymentMethod === 'Prepaid' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-green)', fontWeight: 'bold' }}>
                    <span>Prepaid Discount</span>
                    <span>-{currency}{settings.prepayDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: 'bold', marginTop: '12px', borderTop: '1px solid #ddd', paddingTop: '12px' }}>
                  <span>Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>INR</span>
                    {currency}{finalTotal.toFixed(2)}
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Including {currency}60.25 in taxes</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

