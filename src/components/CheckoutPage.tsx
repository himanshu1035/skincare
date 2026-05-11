import React from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, ShieldCheck, Lock, Truck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCompletePurchase = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }
    setIsProcessing(true);
    const success = await createOrder(email);
    if (success) {
      alert('Order placed successfully!');
      navigate('/');
    } else {
      alert('Failed to place order. Please try again.');
    }
    setIsProcessing(false);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalSavings = cart.reduce((acc, item) => acc + ((item.originalPrice - item.price) * item.quantity), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--secondary-ivory)' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '20px 0', borderBottom: '1px solid #eee' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <ArrowLeft size={20} /> Back
          </button>
          <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-green)', fontSize: '12px', fontWeight: 'bold' }}>
            <Lock size={14} /> SECURE CHECKOUT
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
        {/* Left: Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>1. Contact Information</h2>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '16px' }} 
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <input type="checkbox" id="offers" />
              <label htmlFor="offers">Email me with news and exclusive offers</label>
            </div>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>2. Shipping Address</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <input type="text" placeholder="First Name" style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} />
              <input type="text" placeholder="Last Name" style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} />
            </div>
            <input type="text" placeholder="Address" style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '16px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <input type="text" placeholder="City" style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} />
              <input type="text" placeholder="State" style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} />
              <input type="text" placeholder="ZIP" style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} />
            </div>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>3. Payment Information</h2>
            <div style={{ border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '20px', background: 'rgba(197, 160, 89, 0.05)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: 'bold' }}>Credit Card</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CreditCard size={20} />
                </div>
              </div>
              <input type="text" placeholder="Card Number" style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '16px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input type="text" placeholder="MM / YY" style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} />
                <input type="text" placeholder="CVC" style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <aside>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '110px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '4px', border: '1px solid #eee' }} />
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--text-muted)', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                    {item.isFree && <div style={{ fontSize: '11px', color: 'var(--success-green)' }}>FREE GIFT</div>}
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--success-green)', fontWeight: 'bold' }}>
                <span>BOGO Discount</span>
                <span>-${totalSavings.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--success-green)', fontWeight: 'bold' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '4px' }}>
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '32px', height: '56px', opacity: isProcessing ? 0.7 : 1 }}
              onClick={handleCompletePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
            </button>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <Truck size={16} color="var(--success-green)" />
                <span>Fast & Free Global Shipping</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} color="var(--success-green)" />
                <span>Money-back Guarantee</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <style>{`
        @media (max-width: 900px) {
          main { grid-template-columns: 1fr !important; }
          aside { order: -1; }
          aside > div { position: static !important; }
        }
      `}</style>
    </div>
  );
};
