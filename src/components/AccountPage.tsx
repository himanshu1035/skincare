import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Truck, LogOut, User, Mail, Phone, MapPin, AtSign, Calendar, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AccountPage: React.FC = () => {
  const { currentUser, logout, updateUserDetails } = useStore();
  const [addressModal, setAddressModal] = useState<any | null>(null);
  const { addresses, fetchAddresses, addAddress, updateAddress, deleteAddress } = useStore();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }
    setIsUpdatingPassword(true);
    const success = await updateUserDetails(currentUser!.id, { password: newPassword });
    if (success) {
      alert('Password updated successfully!');
      setNewPassword('');
    } else {
      alert('Failed to update password');
    }
    setIsUpdatingPassword(false);
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const loadData = async () => {
      await fetchAddresses();
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
            
            {/* Left Column: Profile Quick Stats & Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'white', padding: '32px', borderRadius: '32px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={22} color="var(--accent-gold)" /> Quick Links
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <button 
                    onClick={() => navigate('/orders')}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <ShoppingBag size={24} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
                    <div style={{ fontWeight: '800', fontSize: '16px' }}>My Orders</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Track & view order history</div>
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <Truck size={24} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
                    <div style={{ fontWeight: '800', fontSize: '16px' }}>Track Order</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Fast track with ID</div>
                  </button>
                </div>
              </div>

              {/* Password Change Section (New) */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '32px', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   Security
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Want to update your password? Enter your new password below.</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                      type="password" 
                      placeholder="Enter new password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }} 
                    />
                    <button 
                      onClick={handleUpdatePassword}
                      className="btn-primary" 
                      style={{ padding: '0 24px' }}
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? '...' : 'UPDATE'}
                    </button>
                  </div>
                </div>
              </div>
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
