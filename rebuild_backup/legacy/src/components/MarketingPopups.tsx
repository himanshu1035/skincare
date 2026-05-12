import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Gift } from 'lucide-react';

export const MarketingPopups: React.FC = () => {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setShowExitIntent(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseOut);
    return () => document.removeEventListener('mouseleave', handleMouseOut);
  }, [hasShown]);

  return (
    <AnimatePresence>
      {showExitIntent && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000 }}
            onClick={() => setShowExitIntent(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '500px', background: 'white', borderRadius: '16px', padding: '40px', zIndex: 2001, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
          >
            <button 
              onClick={() => setShowExitIntent(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ background: 'var(--secondary-ivory)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Gift size={40} color="var(--accent-gold)" />
            </div>

            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Wait! Don't Miss Out</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '18px' }}>
              Claim your <b>BUY 1 GET 1 FREE</b> offer now and get an extra 10% OFF your first order!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} size={20} />
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '8px', border: '1px solid #eee', fontSize: '16px' }}
                />
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '56px' }}>
                SEND ME MY CODE
              </button>
              <button 
                onClick={() => setShowExitIntent(false)}
                style={{ background: 'none', color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'underline' }}
              >
                No thanks, I'll pay full price
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
