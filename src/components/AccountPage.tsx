import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, LogOut, User, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export const AccountPage: React.FC = () => {
  const { currentUser, logout, fetchUserOrders, currency } = useStore();
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
      setOrders(data);
      setLoading(false);
    };
    loadOrders();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      <nav style={{ background: 'white', padding: '20px 0', borderBottom: '1px solid #eee' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>MY ACCOUNT</div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error-red)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <main className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
          
          {/* Order History */}
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Order History</h2>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ background: 'white', padding: '60px', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <Package size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                <p>No orders yet. Start your journey to glass skin today!</p>
                <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '24px', margin: '24px auto 0' }}>SHOP NOW</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ORDER ID</div>
                        <div style={{ fontWeight: 'bold' }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>STATUS</div>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: order.status === 'Delivered' ? 'var(--success-green)' : 'var(--accent-gold)' 
                        }}>{order.status.toUpperCase()}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                      {order.items.map((item: any) => (
                        <img key={item.id} src={item.image} style={{ width: '60px', height: '60px', borderRadius: '8px', border: '1px solid #eee' }} alt="" />
                      ))}
                    </div>

                    <div style={{ background: 'var(--secondary-ivory)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Truck size={20} color="var(--accent-gold)" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{order.trackingId ? `Tracking: ${order.trackingId}` : 'Tracking ID will be shared soon'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated Delivery: 3-5 Business Days</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{currency}{order.totalAmount.toFixed(2)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* User Details */}
          <div>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <User size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentUser.email.split('@')[0]}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Member since 2026</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #eee', paddingTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                  <Mail size={16} color="var(--text-muted)" /> {currentUser.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                  <Phone size={16} color="var(--text-muted)" /> {currentUser.mobile}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
