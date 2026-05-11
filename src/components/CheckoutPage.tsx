import React from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, ShieldCheck, Lock, Truck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder, currency } = useStore();
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
    <div style={{ minHeight: '100vh', background: '#f9f9f9', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', marginBottom: '32px', fontWeight: '600' }}
        >
          <ArrowLeft size={18} /> BACK TO SHOP
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
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
              <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>2. Payment</h2>
              <div style={{ border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '20px', background: 'rgba(197,160,89,0.05)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}>
                    <CreditCard size={20} /> Credit Card
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '30px', height: '20px', background: '#eee', borderRadius: '2px' }} />
                    <div style={{ width: '30px', height: '20px', background: '#eee', borderRadius: '2px' }} />
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Secure payment processing powered by Stripe.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-green)', fontSize: '14px', fontWeight: '500' }}>
                <Lock size={16} /> All transactions are secure and encrypted.
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Order Summary</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '8px', border: '1px solid #eee' }} />
                      <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--text-muted)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.isFree ? 'Free Gift' : 'Product'}</div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>{currency}{item.isFree ? '0.00' : (item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span>{currency}{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Shipping</span>
                  <span style={{ color: 'var(--success-green)', fontWeight: 'bold' }}>FREE</span>
                </div>
                {totalSavings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-green)' }}>
                    <span>Savings</span>
                    <span>-{currency}{totalSavings.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  <span>Total</span>
                  <span>{currency}{subtotal.toFixed(2)}</span>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <Truck size={16} /> FREE Global Express Shipping
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={16} /> 30-Day Money Back Guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
