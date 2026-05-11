import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ChevronDown, Loader2, User as UserIcon, AtSign, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder, currency, checkUserExists, registerUser, settings, currentUser } = useStore();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setUsername(currentUser.username || '');
      setAddress(currentUser.address || '');
      setLandmark(currentUser.landmark || '');
      setCity(currentUser.city || '');
      setState(currentUser.state || '');
      setZip(currentUser.zip || '');
      setMobile(currentUser.mobile || '');
    }
  }, [currentUser]);
  
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Prepaid' | 'COD'>('Prepaid');
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (!currentUser && userExists === false && password) {
      userId = await registerUser(email, mobile, password, { firstName, lastName, username });
    }

    const success = await createOrder({ 
      email, mobile, firstName, lastName, address, landmark, city, state, zip, paymentMethod, totalAmount: finalTotal, userId: userId || currentUser?.id 
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
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <style>{`
        .input-field { width: 100%; padding: 14px 16px; border: 1.5px solid #e1e1e1; borderRadius: 8px; fontSize: 14px; transition: all 0.2s; background: #fff; }
        .input-field:focus { border-color: black; outline: none; box-shadow: 0 0 0 4px rgba(0,0,0,0.05); }
        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #1a1a1a; letter-spacing: -0.5px; }
        .payment-card { padding: 20px; border-radius: 12px; border: 1.5px solid #eee; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-start; gap: 16px; }
        .payment-card.active { border-color: black; background: #fafafa; }
        .radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .payment-card.active .radio-circle { border-color: black; }
        .radio-dot { width: 10px; height: 10px; border-radius: 50%; background: black; }
        
        @media (max-width: 992px) {
          .checkout-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .summary-column { order: -1; }
          .sticky-summary { position: static !important; }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '1100px', padding: '40px 20px' }}>
        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '60px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' }}>COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span></div>
              {currentUser ? (
                <div style={{ fontSize: '13px', color: '#666', background: '#f5f5f7', padding: '6px 12px', borderRadius: '50px' }}>
                  Logged in as <b>{currentUser.firstName}</b>
                </div>
              ) : (
                !userExists && <button onClick={() => navigate('/login')} style={{ background: 'none', color: 'black', fontWeight: '700', fontSize: '13px', textDecoration: 'underline' }}>Sign in</button>
              )}
            </div>

            <div style={{ marginBottom: '48px' }}>
              <h2 className="section-title">Contact Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" style={{ paddingLeft: '44px' }} disabled={!!currentUser} />
                </div>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input type="tel" placeholder="Phone Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-field" style={{ paddingLeft: '44px' }} disabled={!!currentUser} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '48px' }}>
              <h2 className="section-title">Shipping Address</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <UserIcon size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" style={{ paddingLeft: '44px' }} />
                  </div>
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
                </div>

                <input type="text" placeholder="House no. / Apartment / Suite" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
                <input type="text" placeholder="Landmark (Optional)" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="input-field" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
                  <div style={{ position: 'relative' }}>
                    <select className="input-field" style={{ appearance: 'none' }} value={state} onChange={(e) => setState(e.target.value)}>
                      <option value="" disabled>Select State</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
                  </div>
                  <input type="text" placeholder="ZIP Code" value={zip} onChange={(e) => setZip(e.target.value)} className="input-field" />
                </div>
              </div>

              {!currentUser && userExists === false && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '24px', padding: '24px', borderRadius: '16px', background: '#f9f9f9', border: '1px dashed #ddd' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Create your account to track orders</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <AtSign size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                      <input type="text" placeholder="Choose Username" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" style={{ paddingLeft: '44px', background: 'white' }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" style={{ background: 'white' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div style={{ marginBottom: '48px' }}>
              <h2 className="section-title">Payment Method</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={`payment-card ${paymentMethod === 'Prepaid' ? 'active' : ''}`} onClick={() => setPaymentMethod('Prepaid')}>
                  <div className="radio-circle">{paymentMethod === 'Prepaid' && <div className="radio-dot" />}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Secure Online Payment (UPI, Cards, Wallets)</div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Save {currency}{settings.prepayDiscount} with instant discount.</p>
                  </div>
                </div>

                <div className={`payment-card ${paymentMethod === 'COD' ? 'active' : ''}`} onClick={() => setPaymentMethod('COD')}>
                  <div className="radio-circle">{paymentMethod === 'COD' && <div className="radio-dot" />}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600' }}>Cash on Delivery (COD)</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Additional {currency}{settings.codCharge} handling fee applies.</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', height: '64px', fontSize: '16px', fontWeight: '800', borderRadius: '12px', background: 'black' }}
              onClick={handleCompletePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : (payNowAmount > 0 ? `PAY ${currency}${payNowAmount.toFixed(2)} & CONFIRM` : 'COMPLETE ORDER')}
            </button>
          </div>

          <div className="summary-column">
            <div className="sticky-summary" style={{ background: '#f5f5f7', padding: '32px', borderRadius: '24px', position: 'sticky', top: '40px' }}>
              <h2 className="section-title">Order Summary</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'white', border: '1px solid #eee', objectFit: 'cover' }} alt="" />
                      <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'black', color: 'white', width: '22px', height: '22px', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{item.isFree ? 'Free Gift' : 'Premium Series'}</div>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{currency}{item.isFree ? '0.00' : (item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid #ddd', paddingTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                  <span>Subtotal</span>
                  <span>{currency}{itemsTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                  <span>Shipping</span>
                  <span>{currency}{deliveryCharge.toFixed(2)}</span>
                </div>
                {paymentMethod === 'COD' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                    <span>COD Handling</span>
                    <span>{currency}{settings.codCharge.toFixed(2)}</span>
                  </div>
                )}
                {paymentMethod === 'Prepaid' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--success-green)', fontWeight: 'bold' }}>
                    <span>Online Discount</span>
                    <span>-{currency}{settings.prepayDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800', marginTop: '12px', borderTop: '1px solid #ddd', paddingTop: '20px', color: 'black' }}>
                  <span>Total</span>
                  <span>{currency}{finalTotal.toFixed(2)}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#999', marginTop: '12px', textAlign: 'center' }}>VAT & Customs duties included where applicable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 2s linear infinite; }
      `}</style>
    </div>
  );
};
