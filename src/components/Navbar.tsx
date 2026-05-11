import React, { useState } from 'react';
import { ShoppingCart, User, Truck, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { toggleCart, cart, currentUser } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 1000 }}>
      <style>{`
        .nav-container { display: flex; justify-content: space-between; alignItems: center; height: 80px; }
        .nav-links { display: flex; gap: 32px; alignItems: center; }
        .nav-link { color: black; font-weight: 600; text-decoration: none; font-size: 14px; letter-spacing: 0.5px; transition: color 0.2s; }
        .nav-link:hover { color: var(--accent-gold); }
        .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; color: black; }
        
        @media (max-width: 992px) {
          .nav-links { display: none; }
          .mobile-menu-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      <div className="container nav-container">
        {/* Left: Hamburger (Mobile) / Links (Desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">SHOP</Link>
            <Link to="/track" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="var(--accent-gold)" /> TRACK ORDER
            </Link>
          </div>
        </div>

        {/* Center: Logo */}
        <Link to="/" style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '4px', textDecoration: 'none', color: 'black', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span>
        </Link>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {currentUser ? (
            <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'black', textDecoration: 'none', fontWeight: '700', fontSize: '13px' }}>
              <User size={20} /> <span className="hide-mobile">ACCOUNT</span>
            </Link>
          ) : (
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'black', textDecoration: 'none', fontWeight: '700', fontSize: '13px' }}>
              <User size={20} /> <span className="hide-mobile">LOGIN</span>
            </Link>
          )}

          <button 
            onClick={toggleCart}
            style={{ background: 'none', position: 'relative', display: 'flex', alignItems: 'center', border: 'none', cursor: 'pointer' }}
          >
            <ShoppingCart size={22} color="black" />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'black', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              style={{ position: 'fixed', top: '80px', left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', top: '80px', left: 0, width: '80%', maxWidth: '300px', height: 'calc(100vh - 80px)', background: 'white', zIndex: 999, padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}
            >
              <Link to="/" onClick={toggleMenu} style={{ fontSize: '18px', fontWeight: '700', color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                SHOP ALL PRODUCTS
              </Link>
              <Link to="/track" onClick={toggleMenu} style={{ fontSize: '18px', fontWeight: '700', color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Truck size={20} color="var(--accent-gold)" /> TRACK YOUR ORDER
              </Link>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '32px' }}>
                {currentUser ? (
                  <Link to="/account" onClick={toggleMenu} style={{ fontSize: '18px', fontWeight: '700', color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <User size={20} color="var(--accent-gold)" /> MY ACCOUNT
                  </Link>
                ) : (
                  <Link to="/login" onClick={toggleMenu} style={{ fontSize: '18px', fontWeight: '700', color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <User size={20} color="var(--accent-gold)" /> LOGIN / REGISTER
                  </Link>
                )}
              </div>
              <div style={{ marginTop: 'auto', padding: '20px', background: '#f9f9f9', borderRadius: '16px' }}>
                <p style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Official COSRX Partner</p>
                <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Genuine Products Only.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
