import React from 'react';
import { ShoppingCart, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { toggleCart, cart, currentUser } = useStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav style={{ background: 'white', padding: '16px 0', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', textDecoration: 'none', color: 'var(--text-dark)' }}>
          COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-green)' }} />
            DERMATOLOGIST TESTED
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {currentUser ? (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)', textDecoration: 'none', fontWeight: '600' }}>
                  <User size={20} /> <span className="hide-mobile">ACCOUNT</span>
                </Link>
              </div>
            ) : (
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)', textDecoration: 'none', fontWeight: '600' }}>
                <User size={20} /> <span className="hide-mobile">LOGIN</span>
              </Link>
            )}

            <button 
              onClick={toggleCart}
              style={{ background: 'none', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent-gold)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '50%', fontWeight: 'bold' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
