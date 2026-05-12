import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, ArrowLeft, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export const OrdersPage: React.FC = () => {
  const { currentUser, fetchUserOrders, currency } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const loadOrders = async () => {
      const data = await fetchUserOrders();
      // Sort newest first
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
      setLoading(false);
    };
    loadOrders();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: 'white', padding: '20px 0', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/account')} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '800' }}>My Orders</h1>
        </div>
      </nav>

      <main className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Loader2 className="animate-spin" size={40} color="var(--accent-gold)" />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <ShoppingBag size={64} color="#e2e8f0" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>No orders yet</h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>Your shopping bag is empty. Start your glow journey today!</p>
            <button className="btn-primary" onClick={() => navigate('/')}>CONTINUE SHOPPING</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  background: 'white', 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  border: (order.status === 'Cancelled' || order.status === 'Payment Failed') ? '2px solid #fee2e2' : '1px solid #e2e8f0'
                }}
              >
                <div style={{ 
                  padding: '20px 24px', 
                  background: (order.status === 'Cancelled' || order.status === 'Payment Failed') ? '#fef2f2' : '#fff',
                  borderBottom: '1px solid #f1f5f9', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Order #{order.id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                  </div>
                  <div style={{ 
                    padding: '6px 14px', 
                    borderRadius: '50px', 
                    fontSize: '11px', 
                    fontWeight: '900',
                    background: (order.status === 'Cancelled' || order.status === 'Payment Failed') ? '#ef4444' : (order.status === 'Delivered' ? '#10b981' : '#f59e0b'),
                    color: 'white',
                    boxShadow: (order.status === 'Cancelled' || order.status === 'Payment Failed') ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none'
                  }}>
                    {order.status.toUpperCase()}
                  </div>
                </div>

                <div style={{ padding: '24px', opacity: (order.status === 'Cancelled' || order.status === 'Payment Failed') ? 0.7 : 1 }}>
                  {(order.status === 'Cancelled' || order.status === 'Payment Failed') && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
                      {order.status === 'Cancelled' ? 'THIS ORDER WAS CANCELLED' : 'PAYMENT FAILED / ABANDONED'}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '12px' }}>
                    {order.items.map((item: any) => (
                      <div key={item.id} style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={item.image} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '1px solid #f1f5f9' }} alt="" />
                        <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'black', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      {order.status !== 'Payment Failed' && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '12px' }}>
                            <Truck size={16} />
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{order.trackingId || 'Processing Shipment'}</span>
                          </div>
                          <Link to={`/track?id=${order.trackingId || order.id}`} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            fontSize: '13px', 
                            fontWeight: '700', 
                            color: 'var(--accent-gold)', 
                            textDecoration: 'none' 
                          }}>
                            Track Package <ChevronRight size={16} />
                          </Link>
                        </>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>TOTAL AMOUNT</div>
                      <div style={{ fontSize: '24px', fontWeight: '900' }}>{currency}{order.totalAmount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 2s linear infinite; }
        .container { max-width: 1200px; margin: 0 auto; width: 100%; }
      `}</style>
    </div>
  );
};
