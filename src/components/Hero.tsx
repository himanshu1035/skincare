import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, CheckCircle2, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Hero: React.FC = () => {
  const { addToCart, stockLeft } = useStore();

  const handleAddToCart = () => {
    addToCart({
      id: 'cosrx-snail-96',
      name: 'COSRX Advanced Snail 96 Mucin Power Essence',
      price: 25.0,
      originalPrice: 50.0,
      image: '/assets/product.png'
    });
  };

  return (
    <section style={{ padding: '60px 0', background: 'linear-gradient(180deg, var(--secondary-ivory) 0%, var(--primary-cream) 100%)' }}>
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-title { font-size: 36px !important; }
          .hero-image-container { order: -1; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
      <div className="container">
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          
          {/* Left: Product Image */}
          <motion.div 
            className="hero-image-container"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative' }}
          >
            <div className="bogo-badge-animate" style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--bogo-badge)', color: 'white', padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold', zIndex: 10, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '12px' }}>BUY 1 GET 1</span>
              <span style={{ fontSize: '20px' }}>FREE</span>
            </div>
            
            <img 
              src="/assets/product.png" 
              alt="COSRX Snail Mucin" 
              style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }} 
            />
            
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <div style={{ background: 'white', padding: '12px', borderRadius: '8px', flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--success-green)" />
                <span style={{ fontSize: '13px', fontWeight: '500' }}>1.2k sold today</span>
              </div>
              <div className="hide-mobile" style={{ background: 'white', padding: '12px', borderRadius: '8px', flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="var(--success-green)" />
                <span style={{ fontSize: '13px', fontWeight: '500' }}>In stock & Ready to ship</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>4.9/5 (12.4k Reviews)</span>
            </div>

            <h1 className="hero-title" style={{ fontSize: '48px', lineHeight: '1.1', marginBottom: '20px' }}>
              Unlock the Viral <br /> 
              <span style={{ color: 'var(--accent-gold)' }}>Glass Skin Glow</span>
            </h1>
            
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '32px' }}>
              Advanced Snail 96 Mucin Power Essence. The #1 Korean skincare secret for hydration and that legendary "slugging" glow. 
            </p>

            <div style={{ background: 'rgba(197, 160, 89, 0.1)', borderLeft: '4px solid var(--accent-gold)', padding: '20px', marginBottom: '32px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '4px' }}>LIMITED TIME OFFER</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>BUY 1 GET 1 FREE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold' }}>$25.00</span>
                <span style={{ fontSize: '20px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>$50.00</span>
                <span style={{ background: 'var(--bogo-badge)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>SAVE 50%</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleAddToCart}
              style={{ width: '100%', justifyContent: 'center', height: '64px', fontSize: '18px' }}
            >
              <ShoppingCart size={22} />
              ADD TO CART - GET 1 FREE
            </button>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Stock remaining:</span>
                <span style={{ fontWeight: 'bold', color: stockLeft < 20 ? 'var(--error-red)' : 'var(--success-green)' }}>{stockLeft} units left</span>
              </div>
              <div style={{ height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(stockLeft / 100) * 100}%` }}
                  style={{ height: '100%', background: 'var(--accent-gold)' }}
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
