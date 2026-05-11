import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Truck, LogOut, User, Mail, Phone, MapPin, AtSign, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AccountPage: React.FC = () => {
  const { currentUser, logout, fetchUserOrders, currency } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressModal, setAddressModal] = useState<any | null>(null);
  const { addresses, fetchAddresses, addAddress, updateAddress, deleteAddress } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const loadData = async () => {
      const data = await fetchUserOrders();
      setOrders(data);
      await fetchAddresses();
      setLoading(false);
    };
    loadData();
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
                            <Link to={`/track?id=${order.trackingId || order.id}`} style={{ fontSize: '12px', color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="var(--accent-gold)" /> Saved Addresses
                    </h4>
                    <button 
                      onClick={() => setAddressModal({ firstName: currentUser.firstName, lastName: currentUser.lastName, address: '', city: '', state: '', zip: '', mobile: currentUser.mobile, isDefault: addresses.length === 0 })} 
                      style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      + ADD NEW
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {addresses.map(addr => (
                      <div key={addr.id} style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', background: '#f9f9f9', padding: '16px', borderRadius: '12px', position: 'relative' }}>
                        <div style={{ fontWeight: 'bold', color: 'black', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {addr.firstName} {addr.lastName}
                          {addr.isDefault && <span style={{ fontSize: '10px', background: 'var(--accent-gold)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>DEFAULT</span>}
                        </div>
                        {addr.address}<br />
                        {addr.city}, {addr.state} - {addr.zip}<br />
                        T: {addr.mobile}
                        
                        <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                          <button onClick={() => setAddressModal(addr)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>EDIT</button>
                          {!addr.isDefault && (
                            <button onClick={() => deleteAddress(addr.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>DELETE</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {addresses.length === 0 && (
                      <p style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>No saved addresses yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Address Form Modal */}
      <AnimatePresence>
        {addressModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>{addressModal.id ? 'Edit Address' : 'Add New Address'}</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (addressModal.id) await updateAddress(addressModal.id, addressModal);
                else await addAddress(addressModal);
                setAddressModal(null);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="First Name" value={addressModal.firstName} onChange={e => setAddressModal({...addressModal, firstName: e.target.value})} className="auth-input" required />
                  <input type="text" placeholder="Last Name" value={addressModal.lastName} onChange={e => setAddressModal({...addressModal, lastName: e.target.value})} className="auth-input" required />
                </div>
                <input type="text" placeholder="Street Address" value={addressModal.address} onChange={e => setAddressModal({...addressModal, address: e.target.value})} className="auth-input" required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="City" value={addressModal.city} onChange={e => setAddressModal({...addressModal, city: e.target.value})} className="auth-input" required />
                  <input type="text" placeholder="State" value={addressModal.state} onChange={e => setAddressModal({...addressModal, state: e.target.value})} className="auth-input" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="Zip Code" value={addressModal.zip} onChange={e => setAddressModal({...addressModal, zip: e.target.value})} className="auth-input" required />
                  <input type="tel" placeholder="Mobile" value={addressModal.mobile} onChange={e => setAddressModal({...addressModal, mobile: e.target.value})} className="auth-input" required />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addressModal.isDefault} onChange={e => setAddressModal({...addressModal, isDefault: e.target.checked})} />
                  Set as default address
                </label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>SAVE ADDRESS</button>
                  <button type="button" onClick={() => setAddressModal(null)} style={{ flex: 1, background: '#eee', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>CANCEL</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 2s linear infinite; }
        .container { max-width: 1200px; margin: 0 auto; width: 100%; }
      `}</style>
    </div>
  );
};
