import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { ProductSection } from './ProductSection';
import { CartDrawer } from './CartDrawer';
import { useStore } from '../store/useStore';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const { addToCart, fetchData, product, reviews, settings } = useStore();

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Mobile-First Trust Badges */}
        <section style={{ borderTop: '1px solid #f5f5f7', borderBottom: '1px solid #f5f5f7', background: '#fafafa', padding: '24px 0' }}>
          <div className="container">
            <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <style>{`
                .trust-item { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; }
                .trust-icon { width: 44px; height: 44px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                .trust-text { font-size: 10px; font-weight: 800; color: #333; letter-spacing: 0.5px; }
                
                @media (max-width: 768px) {
                  .trust-grid { gap: 8px !important; }
                  .trust-text { font-size: 8px !important; }
                  .trust-icon { width: 36px !important; height: 36px !important; }
                }
              `}</style>
              <div className="trust-item">
                <div className="trust-icon"><Truck size={18} color="var(--accent-gold)" /></div>
                <span className="trust-text">FREE SHIPPING</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon"><ShieldCheck size={18} color="var(--accent-gold)" /></div>
                <span className="trust-text">SECURE PAY</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon"><RefreshCw size={18} color="var(--accent-gold)" /></div>
                <span className="trust-text">30D REFUND</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon"><Award size={18} color="var(--accent-gold)" /></div>
                <span className="trust-text">100% GENUINE</span>
              </div>
            </div>
          </div>
        </section>

        <ProductSection />

        {/* Community Reviews */}
        <section id="reviews" style={{ padding: '80px 0', background: '#f5f5f7' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>The COSRX Community</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
                </div>
                <span style={{ fontSize: '20px', fontWeight: '900' }}>{settings.displayRating || '4.9'}</span>
                <span style={{ color: '#999', fontSize: '14px' }}>({settings.displayReviewCount || '12.4k'} total reviews)</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {reviews.map((review, i) => (
                <motion.div 
                  key={review.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}
                >
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "var(--accent-gold)" : "none"} color="var(--accent-gold)" />)}
                  </div>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginBottom: '24px', fontWeight: '500' }}>"{review.comment}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>{review.userName[0]}</div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '14px' }}>{review.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--success-green)', fontWeight: '700' }}>VERIFIED GLOW-GETTER</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: 'black', color: 'white', padding: '80px 0 40px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '60px', marginBottom: '60px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '4px', marginBottom: '24px' }}>COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span></div>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>The global leader in minimalist, high-performance skincare. Direct from the source.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '2px', marginBottom: '32px' }}>CUSTOMER CARE</h4>
              <ul style={{ listStyle: 'none', color: '#666', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li><Link to="/shipping-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Shipping Policy</Link></li>
                <li><Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link></li>
                <li style={{ opacity: 0.1 }}><Link to="/admin" style={{ color: 'inherit' }}>Admin</Link></li>
              </ul>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '2px', marginBottom: '32px' }}>JOIN THE CLUB</h4>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '24px' }}>Sign up for exclusive BOGO deals and first access to new drops.</p>
              <div style={{ display: 'flex', gap: '8px', maxWidth: '300px', margin: '0 auto' }}>
                <input type="email" placeholder="Email" style={{ background: '#1a1a1a', border: '1px solid #333', padding: '12px 16px', borderRadius: '8px', color: 'white', flex: 1, fontSize: '14px' }} />
                <button style={{ background: 'white', color: 'black', padding: '12px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '13px' }}>JOIN</button>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #222', paddingTop: '40px', textAlign: 'center', fontSize: '11px', color: '#444', letterSpacing: '1px' }}>
            © 2026 COSRX GLOBAL PARTNERS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

      {/* Floating Mobile CTA - App-like Feel */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', zIndex: 900 }}
      >
        <button 
          onClick={handleAddToCart}
          disabled={!product}
          style={{ width: '100%', height: '64px', background: 'black', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', cursor: 'pointer' }}
        >
          <ShoppingCart size={20} />
          {product ? (settings.codCharge === 0 ? 'ORDER NOW - CASH ON DELIVERY' : 'ADD TO CART - BOGO FREE') : 'LOADING...'}
        </button>
      </motion.div>

      <CartDrawer />
    </div>
  );
};
