import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, CheckCircle2, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Hero: React.FC = () => {
  const { addToCart, stockLeft, currency, product, isBogoActive, isLoading, settings } = useStore();

  if (isLoading && !product) {
    return (
      <section style={{ padding: '100px 0', textAlign: 'center', background: 'white' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-gold)" />
      </section>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image
    });
  };

  return (
    <section style={{ background: 'white', overflow: 'hidden' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 2s linear infinite; }
        .hero-container { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center; padding: 60px 20px; }
        .mobile-rating { display: none; }
        
        @media (max-width: 992px) {
          .hero-container { grid-template-columns: 1fr !important; padding: 20px 16px 40px !important; gap: 32px !important; }
          .hero-image-container { margin: 0 -16px; border-radius: 0 !important; }
          .hero-image-container img { border-radius: 0 !important; }
          .hero-title { font-size: 32px !important; text-align: center; }
          .hero-desc { text-align: center; font-size: 16px !important; }
          .price-card { padding: 24px 16px !important; }
          .mobile-rating { display: flex !important; justify-content: center; margin-bottom: 12px; }
          .desktop-rating { display: none !important; }
          .hero-content { order: 2; }
          .hero-image-container { order: 1; }
        }
      `}</style>

      <div className="container hero-container">
        {/* Left/Order 2 on Mobile: Image */}
        <motion.div 
          className="hero-image-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative' }}
        >
          {isBogoActive && (
            <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'black', color: 'white', padding: '10px 20px', borderRadius: '50px', fontWeight: '900', zIndex: 10, fontSize: '14px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--accent-gold)" /> BUY 1 GET 1 FREE
            </div>
          )}
          
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', objectFit: 'cover' }} 
          />
          
        </motion.div>

        {/* Right/Order 1 on Mobile: Content */}
        <div className="hero-content">
          <div className="mobile-rating">
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
            </div>
            <span style={{ fontSize: '12px', marginLeft: '8px', fontWeight: '600', color: '#666' }}>
              {settings.displayRating || '4.9'}/5 ({settings.displayReviewCount || '12.4k'} Reviews)
            </span>
          </div>

          <div className="desktop-rating" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>
              {settings.displayRating || '4.9'}/5 ({settings.displayReviewCount || '12.4k'} Reviews)
            </span>
          </div>

          <h1 className="hero-title" style={{ fontSize: '56px', fontWeight: '900', lineHeight: '1', marginBottom: '20px', letterSpacing: '-1px' }}>
            Experience the <br /> 
            <span style={{ color: 'var(--accent-gold)' }}>Glass Skin</span> Power.
          </h1>
          
          <p className="hero-desc" style={{ fontSize: '18px', color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
            Transform your routine with the <b>{product.name}</b>. The holy grail of hydration for a luminous, dewy finish.
          </p>

          <div className="price-card" style={{ background: '#fcfcfc', border: '1px solid #eee', padding: '32px', borderRadius: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <span style={{ fontSize: '40px', fontWeight: '900' }}>{currency}{product.price.toFixed(2)}</span>
              <span style={{ fontSize: '24px', textDecoration: 'line-through', color: '#ccc' }}>{currency}{product.originalPrice.toFixed(2)}</span>
              <span style={{ background: 'var(--success-green)', color: 'white', padding: '6px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '900' }}>
                SAVE {Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#999', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="var(--success-green)" /> Free Shipping & 30-Day Returns included.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="btn-primary" 
              onClick={handleAddToCart}
              style={{ width: '100%', justifyContent: 'center', height: '72px', fontSize: '18px', fontWeight: '900', borderRadius: '16px', background: 'black', color: 'white' }}
            >
              <ShoppingCart size={22} style={{ marginRight: '12px' }} />
              {isBogoActive ? 'ADD TO CART - GET 1 FREE' : 'ADD TO CART NOW'}
            </button>
            <a 
              href="/orders"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', fontSize: '14px', fontWeight: '800', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'black', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <ShoppingBag size={18} style={{ marginRight: '8px' }} color="var(--accent-gold)" />
              VIEW MY ORDERS
            </a>
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', fontWeight: '700' }}>
              <span>LIMITED STOCK REMAINING</span>
              <span style={{ color: stockLeft < 20 ? 'var(--error-red)' : 'var(--success-green)' }}>{stockLeft} UNITS LEFT</span>
            </div>
            <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: `${(stockLeft / 100) * 100}%` }}
                style={{ height: '100%', background: stockLeft < 20 ? 'var(--error-red)' : 'var(--accent-gold)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
