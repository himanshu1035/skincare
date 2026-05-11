import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Award, Heart, ShieldCheck } from 'lucide-react';

export const ProductSection: React.FC = () => {
  const benefits = [
    "Deeply hydrates without heaviness",
    "Fades dark spots & acne scars",
    "Improves skin texture & elasticity",
    "Soothes irritated and sensitive skin",
    "100% Cruelty-free & Paraben-free"
  ];

  return (
    <section style={{ padding: '80px 0', background: 'white' }}>
      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .benefits-title { font-size: 24px !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>Real Results, Real Glow</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            See why over 1 million people have switched to COSRX Snail Mucin for their daily hydration needs.
          </p>
        </div>

        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          
          {/* Before/After Visual */}
          <div style={{ position: 'relative' }}>
            <img 
              src="/assets/before-after.png" 
              alt="Before and After Results" 
              style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }} 
            />
            <div style={{ position: 'absolute', bottom: '-20px', left: '20px', right: '20px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-md)', display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--accent-gold)' }}>98%</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Felt Hydrated</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--accent-gold)' }}>92%</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Saw Texture Improvement</div>
              </div>
            </div>
          </div>

          {/* Benefits Content */}
          <div>
            <h3 className="benefits-title" style={{ fontSize: '28px', marginBottom: '24px' }}>Why You'll Love It</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {benefits.map((benefit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'var(--secondary-ivory)', padding: '4px', borderRadius: '50%' }}>
                    <Check size={16} color="var(--success-green)" />
                  </div>
                  <span style={{ fontWeight: '500' }}>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <Award size={32} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Global Best Seller</div>
              </div>
              <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <ShieldCheck size={32} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Hypoallergenic</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
