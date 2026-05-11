import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart } = useStore();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const originalTotal = cart.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const totalSavings = originalTotal - subtotal;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '450px', background: 'white', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}
          >
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingBag size={24} />
                <h2 style={{ fontSize: '20px' }}>Your Cart</h2>
              </div>
              <button onClick={toggleCart} style={{ background: 'none' }}><X size={24} /></button>
            </div>

            {/* Savings Highlight */}
            {totalSavings > 0 && (
              <div style={{ background: 'var(--success-green)', color: 'white', padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                🎉 YOU UNLOCKED A FREE PRODUCT! SAVED ${totalSavings.toFixed(2)}
              </div>
            )}

            {/* Cart Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                  <ShoppingBag size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Your cart is empty</p>
                  <button onClick={toggleCart} style={{ marginTop: '20px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>Start Shopping</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                      <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{item.name}</div>
                        
                        {item.isFree ? (
                          <div style={{ color: 'var(--success-green)', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            FREE <span style={{ textDecoration: 'line-through', color: '#ccc', fontWeight: 'normal', fontSize: '12px' }}>$25.00</span>
                          </div>
                        ) : (
                          <div style={{ fontWeight: 'bold' }}>${item.price.toFixed(2)}</div>
                        )}

                        {!item.isFree && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #eee', borderRadius: '4px' }}>
                              <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '4px 8px', background: 'none' }}><Minus size={14} /></button>
                              <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 'bold' }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '4px 8px', background: 'none' }}><Plus size={14} /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} style={{ color: '#ff4d4d', background: 'none' }}><Trash2 size={16} /></button>
                          </div>
                        )}
                        
                        {item.isFree && (
                          <div style={{ marginTop: '8px', fontSize: '12px', background: 'rgba(74, 103, 65, 0.1)', color: 'var(--success-green)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                            Applied Automatically
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '24px', borderTop: '1px solid #eee', background: 'var(--secondary-ivory)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link 
                  to="/checkout" 
                  onClick={toggleCart}
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  PROCEED TO CHECKOUT
                </Link>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={14} /> Free Express Shipping
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} /> Secure Checkout
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
