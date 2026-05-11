import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Truck, LogOut, User, Mail, Phone, MapPin, AtSign, Calendar, ChevronRight, Loader2 } from 'lucide-react';
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
    <div style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      {/* Premium Header */}
      <nav style={{ background: 'white', padding: '24px 0', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', textDecoration: 'none', color: 'black' }}>
            COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span>
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'rgba(255,0,0,0.05)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d', padding: '8px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: '600' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="container" style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Dashboard Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Hello, {currentUser.firstName || currentUser.username || 'Glow Getter'}!</h1>
            <p style={{ color: 'var(--text-muted)' }}>Welcome to your premium dashboard. Manage your orders and profile below.</p>
          </div>

          <div className="account-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
            <style>{`
              @media (max-width: 992px) {
                .account-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
            
            {/* Left Column: Orders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={20} color="var(--accent-gold)" /> Order History
              </h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 className="animate-spin" color="var(--accent-gold)" />
                </div>
              ) : orders.length === 0 ? (
                <div style={{ background: 'white', padding: '60px 24px', borderRadius: '24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Package size={32} color="#ccc" />
                  </div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No orders found</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto 24px' }}>Looks like you haven't started your glass skin journey yet.</p>
                  <button className="btn-primary" onClick={() => navigate('/')} style={{ margin: '0 auto' }}>START SHOPPING</button>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}
                  >
                    <div style={{ padding: '24px', borderBottom: '1px solid #f5f5f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>ORDER #{order.id.slice(0, 8).toUpperCase()}</div>
                        <div style={{ fontSize: '13px', color: '#666' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '50px', background: 'rgba(197,160,89,0.1)', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: 'bold' }}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto' }}>
                        {order.items.map((item: any) => (
                          <div key={item.id} style={{ flexShrink: 0, position: 'relative' }}>
                            <img src={item.image} style={{ width: '70px', height: '70px', borderRadius: '12px', border: '1px solid #eee', objectFit: 'cover' }} alt="" />
                            {item.quantity > 1 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'black', color: 'white', width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>}
                          </div>
                        ))}
                      </div>

                      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Truck size={20} color="var(--accent-gold)" />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{order.trackingId || 'Preparing for shipment'}</div>
                            <Link to={`/track?id=${order.id}`} style={{ fontSize: '12px', color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                              Track Order <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#999' }}>Total Paid</div>
                          <div style={{ fontSize: '20px', fontWeight: '800' }}>{currency}{order.totalAmount.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Right Column: Profile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee', position: 'sticky', top: '100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-gold) 0%, #d4af37 100%)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: 'var(--shadow-lg)' }}>
                    <User size={32} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{currentUser.firstName} {currentUser.lastName}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', color: 'var(--accent-gold)', fontWeight: '600' }}>
                    <AtSign size={14} /> {currentUser.username || currentUser.email.split('@')[0]}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 0', borderTop: '1px solid #f5f5f7', borderBottom: '1px solid #f5f5f7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} color="#666" /></div>
                    <div style={{ fontSize: '14px' }}>{currentUser.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={16} color="#666" /></div>
                    <div style={{ fontSize: '14px' }}>{currentUser.mobile}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={16} color="#666" /></div>
                    <div style={{ fontSize: '14px' }}>Member since 2026</div>
                  </div>
                </div>

                <div style={{ paddingTop: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="var(--accent-gold)" /> Saved Shipping Address
                  </h4>
                  {currentUser.address ? (
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', background: '#f9f9f9', padding: '16px', borderRadius: '12px' }}>
                      <b>{currentUser.firstName} {currentUser.lastName}</b><br />
                      {currentUser.address}<br />
                      {currentUser.landmark && <>{currentUser.landmark}<br /></>}
                      {currentUser.city}, {currentUser.state} - {currentUser.zip}
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>No saved address yet. Your address will be saved after your first purchase.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 2s linear infinite; }
        .container { max-width: 1200px; margin: 0 auto; width: 100%; }
      `}</style>
    </div>
  );
};
