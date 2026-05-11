import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { QrCode, Copy, CheckCircle2, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export const UPIPaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, currency, submitUtr } = useStore();
  
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount || 0;
  
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!orderId) {
    navigate('/');
    return null;
  }

  // Generate UPI URI
  // format: upi://pay?pa=recipient@upi&pn=COSRX+INDIA&am=100.00&cu=INR
  const upiUri = `upi://pay?pa=${settings.upiId}&pn=COSRX+INDIA&am=${totalAmount.toFixed(2)}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || utr.length < 6) {
      alert('Please enter a valid UTR ID / Transaction ID');
      return;
    }

    setIsSubmitting(true);
    const success = await submitUtr(orderId, utr);
    if (success) {
      navigate('/order-success', { state: { orderId } });
    } else {
      alert('Failed to submit UTR. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '40px', background: 'black', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <QrCode size={20} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>UPI Payment</h1>
          </div>

          <div style={{ background: 'var(--secondary-ivory)', padding: '24px', borderRadius: '24px', marginBottom: '32px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Amount to Pay</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: 'black' }}>{currency}{totalAmount.toFixed(2)}</div>
          </div>

          <div style={{ position: 'relative', marginBottom: '32px', background: 'white', border: '2px solid #eee', borderRadius: '24px', padding: '20px' }}>
            <img src={qrUrl} alt="Payment QR Code" style={{ width: '100%', maxWidth: '240px', margin: '0 auto', display: 'block' }} />
            <div style={{ marginTop: '16px', fontSize: '13px', color: '#999', fontWeight: '600' }}>Scan using any UPI App (PhonePe, Google Pay, Paytm)</div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Or pay to UPI ID</div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: '#f9f9f9', 
              padding: '16px 20px', 
              borderRadius: '16px',
              border: '1px solid #eee'
            }}>
              <span style={{ fontWeight: '700', color: 'black' }}>{settings.upiId}</span>
              <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: copied ? 'var(--success-green)' : 'black', cursor: 'pointer' }}>
                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', marginBottom: '16px', justifyContent: 'center' }}>
              <Info size={16} />
              <span style={{ fontSize: '13px', fontWeight: '700' }}>After payment, enter your UTR ID below</span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="text" 
                placeholder="Enter 12-digit UTR / Ref No." 
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '18px', 
                  borderRadius: '16px', 
                  border: '2px solid #eee', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  textAlign: 'center'
                }} 
              />
              <button 
                className="btn-primary" 
                style={{ width: '100%', height: '60px', borderRadius: '16px', justifyContent: 'center' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'SUBMIT PAYMENT DETAILS'}
              </button>
            </form>
          </div>
        </motion.div>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#999', lineHeight: '1.6' }}>
          Your order will be processed once our team verifies your payment. <br />
          For any issues, contact support with your Order ID: #{orderId.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
};
