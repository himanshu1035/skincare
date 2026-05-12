import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Truck, FileText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PolicyProps {
  title: string;
  type: 'privacy' | 'shipping' | 'terms';
}

const POLICY_CONTENT = {
  privacy: {
    icon: <Shield size={32} />,
    content: `
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us when you create an account, make a purchase, or communicate with us.</p>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to send you technical notices and support messages.</p>
      
      <h2>3. Information Sharing</h2>
      <p>We do not share your personal information with third parties except as described in this policy, such as with your consent or to comply with laws.</p>
      
      <h2>4. Data Security</h2>
      <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
    `
  },
  shipping: {
    icon: <Truck size={32} />,
    content: `
      <h2>1. Shipping Rates</h2>
      <p>Shipping rates are calculated at checkout based on your location and the weight of your order. We offer standard and express shipping options.</p>
      
      <h2>2. Delivery Times</h2>
      <p>Orders are typically processed within 1-2 business days. Standard shipping takes 3-7 business days, while express shipping takes 1-3 business days.</p>
      
      <h2>3. International Shipping</h2>
      <p>We currently ship to select international locations. Customs duties and taxes may apply and are the responsibility of the customer.</p>
      
      <h2>4. Cash on Delivery (COD)</h2>
      <p>For COD orders, an additional handling fee may apply. In some cases, we may require the delivery fee to be paid upfront to confirm the order.</p>
    `
  },
  terms: {
    icon: <FileText size={32} />,
    content: `
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using our website, you agree to be bound by these terms and conditions.</p>
      
      <h2>2. Use of the Site</h2>
      <p>You may use the site only for lawful purposes and in accordance with these terms.</p>
      
      <h2>3. Intellectual Property</h2>
      <p>The content on this site, including text, graphics, logos, and images, is the property of COSRX and is protected by copyright laws.</p>
      
      <h2>4. Limitation of Liability</h2>
      <p>In no event shall COSRX be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the site.</p>
    `
  }
};

export const PolicyPage: React.FC<PolicyProps> = ({ title, type }) => {
  const navigate = useNavigate();
  const { icon, content } = POLICY_CONTENT[type];

  return (
    <div style={{ minHeight: '100vh', background: 'white', padding: '80px 20px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'none', 
            border: 'none', 
            color: '#666', 
            fontWeight: '600', 
            cursor: 'pointer',
            marginBottom: '40px'
          }}
        >
          <ChevronLeft size={20} /> BACK
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ 
            color: 'var(--accent-gold)', 
            marginBottom: '16px' 
          }}>
            {icon}
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '40px', letterSpacing: '-1px' }}>{title}</h1>
          
          <div 
            className="policy-content" 
            style={{ 
              lineHeight: '1.8', 
              color: '#333',
              fontSize: '16px'
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </motion.div>
      </div>

      <style>{`
        .policy-content h2 { font-size: 20px; font-weight: 700; margin: 40px 0 16px; color: black; }
        .policy-content p { margin-bottom: 20px; color: #666; }
      `}</style>
    </div>
  );
};
