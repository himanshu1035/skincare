import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--secondary-ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          maxWidth: '500px', 
          width: '100%', 
          background: 'white', 
          padding: '48px', 
          borderRadius: '32px', 
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center'
        }}
      >
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(76, 175, 80, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          color: 'var(--success-green)'
        }}>
          <CheckCircle size={48} />
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', color: 'black' }}>Order Confirmed!</h1>
        <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
          Thank you for your purchase. Your premium skincare routine is being prepared for shipment.
        </p>

        {orderId && (
          <div style={{ 
            background: '#f5f5f7', 
            padding: '20px', 
            borderRadius: '16px', 
            marginBottom: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Order ID</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'black' }}>#{orderId.slice(0, 8).toUpperCase()}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div style={{ textAlign: 'left', padding: '16px', borderRadius: '16px', border: '1px solid #eee' }}>
            <Package size={20} style={{ color: 'var(--accent-gold)', marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: '700' }}>Processing</div>
            <div style={{ fontSize: '11px', color: '#999' }}>1-2 business days</div>
          </div>
          <div style={{ textAlign: 'left', padding: '16px', borderRadius: '16px', border: '1px solid #eee' }}>
            <Truck size={20} style={{ color: 'var(--accent-gold)', marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: '700' }}>Express Shipping</div>
            <div style={{ fontSize: '11px', color: '#999' }}>3-5 business days</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => navigate('/')} 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', height: '56px', borderRadius: '16px' }}
          >
            CONTINUE SHOPPING <ShoppingBag size={18} style={{ marginLeft: '8px' }} />
          </button>
          <button 
            onClick={() => navigate('/track')} 
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              color: '#666', 
              fontWeight: '600', 
              fontSize: '14px', 
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            Track your order <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
