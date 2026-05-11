import React from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { ProductSection } from './ProductSection';
import { CartDrawer } from './CartDrawer';
import { MarketingPopups } from './MarketingPopups';
import { AdminPanel } from './AdminPanel';
import { useStore } from '../store/useStore';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { addToCart } = useStore();

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1 }}>
        <Hero />
        
        {/* Trust Badges Strip */}
        <div style={{ background: 'white', padding: '30px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
              <Truck size={20} color="var(--accent-gold)" /> FREE GLOBAL SHIPPING
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
              <ShieldCheck size={20} color="var(--accent-gold)" /> SECURE PAYMENTS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
              <RefreshCw size={20} color="var(--accent-gold)" /> 30-DAY MONEY BACK
            </div>
          </div>
        </div>

        <ProductSection />

        {/* Customer Reviews Section */}
        <section style={{ padding: '80px 0', background: 'var(--secondary-ivory)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '48px' }}>What Our Community Says</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {[
                { name: "Sarah M.", text: "This literally changed my skin overnight. The glow is insane! And the BOGO deal is such a steal.", rating: 5 },
                { name: "Jessica K.", text: "I've tried everything for my acne scars, but this is the only thing that worked. Hydrating but not oily.", rating: 5 },
                { name: "Emma R.", text: "Best Korean skincare purchase ever. I'm stocked up for months thanks to the buy 1 get 1 free offer!", rating: 5 }
              ].map((review, i) => (
                <div key={i} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', marginBottom: '16px' }}>
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
                  </div>
                  <p style={{ fontStyle: 'italic', marginBottom: '20px', color: 'var(--text-dark)' }}>"{review.text}"</p>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{review.name[0]}</div>
                    {review.name} <span style={{ color: 'var(--success-green)', fontSize: '12px', fontWeight: 'normal' }}>• Verified Buyer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: 'var(--text-dark)', color: 'white', padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '20px' }}>COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span></div>
              <p style={{ color: '#999', fontSize: '14px' }}>Premium Korean Skincare for every skin type. Built for the glow-getters.</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Shop</h4>
              <ul style={{ listStyle: 'none', color: '#999', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>Best Sellers</li>
                <li>New Arrivals</li>
                <li>BOGO Offers</li>
                <li>Gift Cards</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Support</h4>
              <ul style={{ listStyle: 'none', color: '#999', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>Shipping Policy</li>
                <li>Refund Policy</li>
                <li>Track Order</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Stay Connected</h4>
              <p style={{ color: '#999', fontSize: '14px', marginBottom: '16px' }}>Subscribe to get exclusive early access to flash sales.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Email" style={{ background: '#333', border: 'none', padding: '10px', borderRadius: '4px', color: 'white', flex: 1 }} />
                <button style={{ background: 'var(--accent-gold)', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold' }}>JOIN</button>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
            © 2026 COSRX GLOBAL. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Floating Mobile CTA */}
      <div className="mobile-sticky-cta glass">
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAddToCart}>
          <ShoppingCart size={20} /> ADD TO CART - BUY 1 GET 1 FREE
        </button>
      </div>

      <CartDrawer />
      <MarketingPopups />
      <AdminPanel />
    </div>
  );
};
