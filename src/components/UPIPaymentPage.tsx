import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Copy, CheckCircle2, Loader2, Info, ArrowLeft, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UPIPaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, currency, submitUtr } = useStore();
  
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount || 0;
  const isDeliveryOnly = location.state?.isDeliveryOnly || false;
  
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const upiLogoUrl = "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/upi-payment-icon.png";
 
  if (!orderId) {
    navigate('/');
    return null;
  }

  // Generate UPI URI with better encoding to prevent app hijacking
  const encodedName = encodeURIComponent('COSRX INDIA');
  const upiUri = `upi://pay?pa=${settings.upiId}&pn=${encodedName}&am=${totalAmount.toFixed(2)}&cu=INR&tr=${orderId}&mode=02&purpose=00`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`;

  const isCompleted = React.useRef(false);
  
  // Handle Cancel on Back
  useEffect(() => {
    return () => {
      // If the component unmounts and we haven't shown success, mark order as failed
      if (!isCompleted.current && orderId) {
        useStore.getState().updateOrderStatus(orderId, 'Payment Failed');
      }
    };
  }, [orderId]);

  // Update ref when success modal shows
  useEffect(() => {
    if (showSuccessModal) {
      isCompleted.current = true;
    }
  }, [showSuccessModal]);

  const upiApps = [
    { 
      name: 'GPay', 
      icon: 'https://cdn.iconscout.com/icon/free/png-256/free-google-pay-2038779-1721670.png', 
      color: '#4285F4',
      scheme: `intent://pay?pa=${settings.upiId}&pn=${encodedName}&am=${totalAmount.toFixed(2)}&cu=INR&tr=${orderId}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
    },
    { 
      name: 'PhonePe', 
      icon: 'https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png', 
      color: '#5f259f',
      scheme: `phonepe://pay?pa=${settings.upiId}&pn=${encodedName}&am=${totalAmount.toFixed(2)}&cu=INR&tr=${orderId}`
    },
    { 
      name: 'Paytm', 
      icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png', 
      color: '#00BAF2',
      scheme: `paytmmp://pay?pa=${settings.upiId}&pn=${encodedName}&am=${totalAmount.toFixed(2)}&cu=INR&tr=${orderId}`
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenApp = () => {
    window.location.href = upiUri;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || utr.length < 6) {
      alert('Please enter a valid 12-digit UTR ID');
      return;
    }

    setIsSubmitting(true);
    const success = await submitUtr(orderId, utr);
    if (success) {
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/');
      }, 4000);
    } else {
      alert('Failed to submit UTR. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', padding: '20px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'white', border: 'none', padding: '12px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', marginBottom: '20px' }}
      >
        <ArrowLeft size={20} />
      </button>

      <div className="container" style={{ maxWidth: '500px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'white', borderRadius: '32px', padding: '32px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '1px solid #eee' }}>
              <img src={upiLogoUrl} alt="UPI" style={{ width: '32px' }} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{isDeliveryOnly ? 'COD Confirmation' : 'UPI Payment'}</h1>
          </div>

          <div style={{ background: '#f8f8f8', padding: '20px', borderRadius: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{isDeliveryOnly ? 'COD Confirmation Fee' : 'Amount to Pay'}</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'black' }}>{currency}{totalAmount.toFixed(2)}</div>
          </div>

          {/* Quick Pay Buttons */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: 'bold' }}>Pay Directly via App</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {upiApps.map(app => (
                <button 
                  key={app.name}
                  onClick={() => {
                    // Try app specific scheme, fallback to generic upi:// after a short delay
                    window.location.href = app.scheme;
                    setTimeout(() => {
                      window.location.href = upiUri;
                    }, 1000);
                  }}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: 'white', 
                    border: '1px solid #eee', 
                    padding: '12px', 
                    borderRadius: '16px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  <img src={app.icon} alt={app.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                  <span style={{ fontSize: '11px', fontWeight: '800' }}>{app.name}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={handleOpenApp}
              style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: '12px', background: 'black', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
            >
              <Smartphone size={18} /> OPEN ALL UPI APPS
            </button>
          </div>

          <div style={{ borderTop: '1px solid #eee', margin: '24px 0' }}></div>

          <div style={{ position: 'relative', marginBottom: '24px', background: 'white', border: '2px solid #eee', borderRadius: '24px', padding: '20px' }}>
            <img src={qrUrl} alt="Payment QR Code" style={{ width: '100%', maxWidth: '200px', margin: '0 auto', display: 'block' }} />
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#999', fontWeight: '600' }}>Or scan QR code</div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Copy Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Copy UPI ID */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: '#f9f9f9', 
                padding: '12px 16px', 
                borderRadius: '12px',
                border: '1px solid #eee'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#999', fontWeight: 'bold' }}>UPI ID</div>
                  <span style={{ fontWeight: '700', color: 'black', fontSize: '14px' }}>{settings.upiId}</span>
                </div>
                <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: copied ? 'var(--success-green)' : 'black', cursor: 'pointer' }}>
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                </button>
              </div>

              {/* Copy Amount */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: '#f9f9f9', 
                padding: '12px 16px', 
                borderRadius: '12px',
                border: '1px solid #eee'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#999', fontWeight: 'bold' }}>Amount</div>
                  <span style={{ fontWeight: '700', color: 'black', fontSize: '14px' }}>{totalAmount.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(totalAmount.toFixed(2));
                    setCopiedAmount(true);
                    setTimeout(() => setCopiedAmount(false), 2000);
                  }} 
                  style={{ background: 'none', border: 'none', color: copiedAmount ? 'var(--success-green)' : 'black', cursor: 'pointer' }}
                >
                  {copiedAmount ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', marginBottom: '16px', justifyContent: 'center' }}>
              <Info size={16} />
              <span style={{ fontSize: '12px', fontWeight: '700' }}>Submit UTR after payment</span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Enter 12-digit UTR ID" 
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: '2px solid #eee', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  textAlign: 'center'
                }} 
              />
              <button 
                className="btn-primary" 
                style={{ width: '100%', height: '56px', borderRadius: '12px', justifyContent: 'center' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'CONFIRM PAYMENT'}
              </button>
            </form>
          </div>
        </motion.div>
        
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#999', lineHeight: '1.6' }}>
          <b>Note:</b> Your order will be shipped only after manual verification of your payment. <br />
          Order ID: #{orderId.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: 'white', padding: '40px', borderRadius: '32px', textAlign: 'center', zIndex: 1, maxWidth: '400px', width: '100%' }}
            >
              <div style={{ width: '80px', height: '80px', background: '#e8f5e9', color: '#4caf50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle2 size={48} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>UTR Submitted!</h2>
              <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
                Thank you! Our team is now verifying your payment. Your order status will update within 2-4 hours.
              </p>
              <div style={{ marginTop: '24px', fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                Redirecting you to home...
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
