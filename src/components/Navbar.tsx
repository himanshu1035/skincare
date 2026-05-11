import React, { useState, useEffect } from 'react';
import { ShoppingBag, Timer, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Navbar: React.FC = () => {
  const { cart, toggleCart, offerExpiresAt } = useStore();
  const [timeLeft, setTimeLeft] = useState('');

  const cartCount = cart.filter(item => !item.isFree).reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = offerExpiresAt - now;
      
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        clearInterval(timer);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      
      setTimeLeft(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [offerExpiresAt]);

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%' }}>
      {/* Promo Banner */}
      <div style={{ background: 'var(--text-dark)', color: 'white', padding: '8px 0', textAlign: 'center', fontSize: '13px', letterSpacing: '0.05em', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Zap size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
          FLASH SALE: BUY 1 GET 1 FREE ENDS IN
        </span>
        <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontVariantNumeric: 'tabular-nums' }}>
          {timeLeft}
        </span>
      </div>

      {/* Main Nav */}
      <div className="glass" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px', fontFamily: 'var(--font-heading)' }}>
          COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={18} />
            <span>Dermatologist Tested</span>
          </div>
          
          <button 
            onClick={toggleCart}
            style={{ background: 'none', position: 'relative', padding: '8px' }}
          >
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--bogo-badge)', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
