import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, LogOut, User as LucideUser, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
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
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Top Section: User Profile */}
          <div style={{ 
            background: 'white', padding: '40px', borderRadius: '32px', 
            boxShadow: 'var(--shadow-sm)', border: '1px solid #eee', 
            marginBottom: '32px', textAlign: 'center' 
          }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, #d4af37 100%)', 
              margin: '0 auto 24px', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', color: 'white', boxShadow: 'var(--shadow-lg)' 
            }}>
              <LucideUser size={40} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>
              {currentUser?.firstName || ''} {currentUser?.lastName || ''}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {currentUser?.username || currentUser?.email?.split('@')[0] || ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {currentUser?.email || ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {currentUser?.mobile || ''}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', textAlign: 'left', borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
              {/* Security Section */}
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  Security Settings
                </h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="password" 
                    placeholder="New password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }} 
                  />
                  <button 
                    onClick={handleUpdatePassword}
                    className="btn-primary" 
                    style={{ padding: '0 20px', height: '45px', fontSize: '12px' }}
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? '...' : 'UPDATE'}
                  </button>
                </div>
              </div>

              {/* Shipping Overview */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Saved Addresses
                  </h2>
                  <button 
                    onClick={() => setAddressModal({ firstName: currentUser?.firstName || '', lastName: currentUser?.lastName || '', address: '', addressLine2: '', city: '', state: '', zip: '', country: 'India', mobile: currentUser?.mobile || '', alternateMobile: '', isDefault: addresses.length === 0 })} 
                    style={{ background: 'var(--accent-gold)', border: 'none', color: 'white', fontSize: '11px', fontWeight: '900', padding: '6px 14px', borderRadius: '50px', cursor: 'pointer' }}
                  >
                    + ADD NEW
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {addresses.map(addr => (
                    <div 
                      key={addr.id} 
                      onClick={() => setAddressModal(addr)}
                      style={{ 
                        padding: '12px 16px', borderRadius: '16px', background: '#f8fafc', 
                        border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', 
                        alignItems: 'center', gap: '10px' 
                      }}
                    >
                      <MapPin size={14} color="var(--accent-gold)" />
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{addr.city}, {addr.zip}</div>
                      {addr.isDefault && <span style={{ fontSize: '8px', background: 'black', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>DEFAULT</span>}
                    </div>
                  ))}
                  {addresses.length === 0 && <span style={{ fontSize: '13px', color: '#94a3b8' }}>No addresses saved.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Address List Display (Detailed) */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {addresses.map(addr => (
                <div key={addr.id} style={{ 
                  padding: '24px', borderRadius: '24px', position: 'relative',
                  background: 'white', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ fontWeight: '800', color: 'black', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px' }}>{addr.firstName} {addr.lastName}</span>
                    {addr.isDefault && <span style={{ fontSize: '9px', background: 'black', color: 'white', padding: '3px 8px', borderRadius: '50px' }}>DEFAULT</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.7' }}>
                    {addr.address}{addr.addressLine2 && `, ${addr.addressLine2}`}<br />
                    {addr.city}, {addr.state} - {addr.zip}<br />
                    {addr.country}
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
                    {addr.mobile} {addr.alternateMobile && `| ${addr.alternateMobile}`}
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', gap: '16px', borderTop: '1px solid #f8fafc', paddingTop: '16px' }}>
                    <button onClick={() => setAddressModal(addr)} style={{ background: 'none', border: 'none', color: 'black', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>EDIT</button>
                    {!addr.isDefault && (
                      <button onClick={async () => { if(window.confirm('Delete this address?')) await deleteAddress(addr.id); }} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>DELETE</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom Section: Orders and Tracking */}
          <div style={{ 
            background: 'white', padding: '32px', borderRadius: '32px', 
            boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' 
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={22} color="var(--accent-gold)" /> Order Management
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <button 
                onClick={() => navigate('/orders')}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '24px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <ShoppingBag size={24} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
                <div style={{ fontWeight: '800', fontSize: '18px' }}>MY ORDERS</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Track & view order history</div>
              </button>
              <button 
                onClick={() => navigate('/')}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '24px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <Truck size={24} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
                <div style={{ fontWeight: '800', fontSize: '18px' }}>TRACK ORDER</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Check delivery status</div>
              </button>
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
                setIsUpdatingPassword(true); // Reusing this loading state for simplicity or add a new one
                let success = false;
                if (addressModal.id) success = await updateAddress(addressModal.id, addressModal);
                else success = await addAddress(addressModal);
                
                if (success) {
                  setAddressModal(null);
                } else {
                  alert('Failed to save address. Please ensure the database table exists.');
                }
                setIsUpdatingPassword(false);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="First Name" value={addressModal?.firstName || ''} onChange={e => setAddressModal({...addressModal, firstName: e.target.value})} className="auth-input" required />
                  <input type="text" placeholder="Last Name" value={addressModal?.lastName || ''} onChange={e => setAddressModal({...addressModal, lastName: e.target.value})} className="auth-input" required />
                </div>
                <input type="text" placeholder="Street Address (Line 1)" value={addressModal?.address || ''} onChange={e => setAddressModal({...addressModal, address: e.target.value})} className="auth-input" required />
                <input type="text" placeholder="Street Address (Line 2) - Optional" value={addressModal?.addressLine2 || ''} onChange={e => setAddressModal({...addressModal, addressLine2: e.target.value})} className="auth-input" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="City" value={addressModal?.city || ''} onChange={e => setAddressModal({...addressModal, city: e.target.value})} className="auth-input" required />
                  <input type="text" placeholder="State" value={addressModal?.state || ''} onChange={e => setAddressModal({...addressModal, state: e.target.value})} className="auth-input" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="Zip Code" value={addressModal?.zip || ''} onChange={e => setAddressModal({...addressModal, zip: e.target.value})} className="auth-input" required />
                  <input type="text" placeholder="Country" value={addressModal?.country || ''} onChange={e => setAddressModal({...addressModal, country: e.target.value})} className="auth-input" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="tel" placeholder="Mobile" value={addressModal?.mobile || ''} onChange={e => setAddressModal({...addressModal, mobile: e.target.value})} className="auth-input" required />
                  <input type="tel" placeholder="Alternate Mobile (Optional)" value={addressModal?.alternateMobile || ''} onChange={e => setAddressModal({...addressModal, alternateMobile: e.target.value})} className="auth-input" />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addressModal?.isDefault || false} onChange={e => setAddressModal({...addressModal, isDefault: e.target.checked})} />
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
