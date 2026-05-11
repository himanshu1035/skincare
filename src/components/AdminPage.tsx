import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { 
  ToggleLeft, ToggleRight, LogOut, Package, Settings, Users, 
  ShoppingCart, Edit2, Check, X, CreditCard, Truck, 
  DollarSign, MapPin, Phone, Mail, Star, Trash2, 
  Plus, User as UserIcon, LayoutDashboard, Search, 
  Filter, MoreVertical, ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ORDER_STATUSES = [
  "Processing",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned"
];

export const AdminPage: React.FC = () => {
  const { 
    isBogoActive, setBogoActive, currency, updateCurrency,
    product, updateProduct, fetchData, 
    fetchAllOrders, fetchAllUsers, updateOrderStatus,
    adminUpdateOrder, deleteOrder, adminUpdateUser, deleteUser,
    settings, updateSettings,
    reviews, fetchReviews, addReview, adminUpdateReview, adminDeleteReview
  } = useStore();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'dashboard' | 'payments' | 'orders' | 'users' | 'reviews' | 'settings'>('dashboard');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Edit Modals
  const [editModal, setEditModal] = useState<{ type: 'user' | 'order', data: any } | null>(null);
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, comment: '' });

  useEffect(() => {
    const init = async () => {
      await fetchData();
      if (tab === 'dashboard' || tab === 'orders' || tab === 'payments') setOrders(await fetchAllOrders());
      if (tab === 'users') setUsers(await fetchAllUsers());
      if (tab === 'reviews') await fetchReviews();
    };
    init();
  }, [tab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') setIsAuthenticated(true);
    else alert('Invalid credentials');
  };

  const saveTimeoutRef = useRef<any>(null);

  const autoSaveProduct = (updates: any) => {
    const state = useStore.getState();
    useStore.setState({ product: state.product ? { ...state.product, ...updates } : null });
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => { updateProduct(updates); }, 1000);
  };

  const autoSaveSettings = (updates: any) => {
    const state = useStore.getState();
    useStore.setState({ settings: { ...state.settings, ...updates } });
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => { updateSettings(updates); }, 1000);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    const success = await adminUpdateOrder(editModal.data.id, editModal.data);
    if (success) {
      setOrders(await fetchAllOrders());
      setEditModal(null);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    const success = await adminUpdateUser(editModal.data.id, editModal.data);
    if (success) {
      setUsers(await fetchAllUsers());
      setEditModal(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
      setUsers(await fetchAllUsers());
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(id);
      setOrders(await fetchAllOrders());
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin} 
          style={{ background: 'white', padding: '48px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', background: 'black', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Admin Portal</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Please sign in to continue</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px' }} />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '56px', borderRadius: '12px', fontSize: '16px', fontWeight: '900' }}>SIGN IN</button>
          </div>
        </motion.form>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerMobile?.includes(searchTerm)
  );

  const pendingPayments = orders.filter(o => o.status === 'Pending Payment');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      {/* Modern Sidebar */}
      <aside style={{ width: '280px', background: '#0f172a', color: 'white', padding: '32px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ fontWeight: '900', fontSize: '22px', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '1px' }}>
          <div style={{ background: 'var(--accent-gold)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
            <Package size={20} />
          </div>
          COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span> ADMIN
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'payments', label: 'Payment Verification', icon: CreditCard, count: pendingPayments.length },
            { id: 'orders', label: 'Order Management', icon: ShoppingCart },
            { id: 'users', label: 'User Database', icon: Users },
            { id: 'reviews', label: 'Social Proof', icon: Star },
            { id: 'settings', label: 'Store Settings', icon: Settings }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setTab(item.id as any)} 
              style={{ 
                background: tab === item.id ? 'rgba(255,255,255,0.1)' : 'none', 
                color: tab === item.id ? 'white' : '#94a3b8', 
                padding: '14px 16px', 
                borderRadius: '12px', 
                textAlign: 'left', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              <item.icon size={20} color={tab === item.id ? 'var(--accent-gold)' : 'inherit'} /> 
              {item.label}
              {item.count ? (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px' }}>{item.count}</span>
              ) : null}
            </button>
          ))}
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <button onClick={() => setIsAuthenticated(false)} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '14px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            <LogOut size={20} /> Logout Session
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '40px', minWidth: 0 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Manage your store operations and customers</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={async () => { setOrders(await fetchAllOrders()); setUsers(await fetchAllUsers()); await fetchData(); }}
              style={{ padding: '12px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}
            >
              <RefreshCw size={18} />
            </button>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '300px', fontSize: '14px', outline: 'none' }} 
              />
            </div>
            <button style={{ padding: '12px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}><Filter size={20} /></button>
          </div>
        </div>

        {tab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { label: 'Total Revenue', value: `${currency}${(orders.reduce((a, b) => a + b.totalAmount, 0)).toLocaleString()}`, icon: DollarSign, color: '#10b981' },
              { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: '#6366f1' },
              { label: 'Pending Payments', value: pendingPayments.length, icon: AlertCircle, color: '#f59e0b' },
              { label: 'Total Users', value: users.length, icon: Users, color: '#ec4899' }
            ].map(stat => (
              <div key={stat.label} style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: `${stat.color}15`, color: stat.color, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'payments' && (
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Verification Queue</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Order / Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Amount / Method</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>UTR / Reference</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(order.createdAt).toLocaleString()}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '800', fontSize: '15px' }}>{currency}{order.totalAmount.toFixed(2)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--success-green)', fontWeight: 'bold' }}>{order.paymentMethod}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '900', display: 'inline-block' }}>
                        {order.utrId || 'NO UTR SUBMITTED'}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={async () => { await updateOrderStatus(order.id, 'Processing'); setOrders(await fetchAllOrders()); }} 
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                        >
                          CONFIRM PAYMENT
                        </button>
                        <button 
                          onClick={async () => { await updateOrderStatus(order.id, 'Payment Failed'); setOrders(await fetchAllOrders()); }} 
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                        >
                          REJECT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Order</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Address</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '700' }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{currency}{order.totalAmount.toFixed(2)}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><UserIcon size={14} color="#94a3b8" /> {order.firstName} {order.lastName}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {order.customerMobile}</div>
                    </td>
                    <td style={{ padding: '20px 24px', maxWidth: '250px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{order.customerAddress}, {order.city}, {order.state}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '800',
                        background: order.status === 'Delivered' ? '#dcfce7' : '#fef3c7',
                        color: order.status === 'Delivered' ? '#166534' : '#92400e'
                      }}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setEditModal({ type: 'order', data: order })} style={{ padding: '8px', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteOrder(order.id)} style={{ padding: '8px', borderRadius: '8px', background: '#fef2f2', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'users' && (
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>User</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Joined</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{user.firstName[0]}</div>
                        <div>
                          <div style={{ fontWeight: '700' }}>{user.firstName} {user.lastName}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {user.id.slice(0, 6)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} color="#94a3b8" /> {user.email}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color="#94a3b8" /> {user.mobile}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '13px' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setEditModal({ type: 'user', data: user })} style={{ padding: '8px', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteUser(user.id)} style={{ padding: '8px', borderRadius: '8px', background: '#fef2f2', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'settings' && product && (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
             {/* Global Pricing */}
             <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><DollarSign size={20} /> Pricing & Currency</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Offer Price ({currency})</label>
                      <input type="number" value={product.price} onChange={(e) => autoSaveProduct({ price: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Original Price ({currency})</label>
                      <input type="number" value={product.originalPrice} onChange={(e) => autoSaveProduct({ originalPrice: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Active Currency</label>
                    <select value={currency} onChange={(e) => updateCurrency(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <option value="₹">Indian Rupee (₹)</option>
                      <option value="$">US Dollar ($)</option>
                    </select>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>BOGO Campaign</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Buy 1 Get 1 Free offers</div>
                    </div>
                    <button onClick={() => setBogoActive(!isBogoActive)} style={{ background: 'none', border: 'none', color: isBogoActive ? '#10b981' : '#cbd5e1', cursor: 'pointer' }}>
                      {isBogoActive ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                    </button>
                  </div>
                </div>
             </div>

             {/* Payment & Logistics */}
             <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Truck size={20} /> Logistics & Payments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Recipient UPI ID</label>
                    <input type="text" value={settings.upiId} onChange={(e) => autoSaveSettings({ upiId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Delivery Fee</label>
                      <input type="number" value={settings.deliveryCharge} onChange={(e) => autoSaveSettings({ deliveryCharge: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>COD Extra Fee</label>
                      <input type="number" value={settings.codCharge} onChange={(e) => autoSaveSettings({ codCharge: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>Accept COD</div>
                    </div>
                    <button onClick={() => autoSaveSettings({ isCodEnabled: !settings.isCodEnabled })} style={{ background: 'none', border: 'none', color: settings.isCodEnabled ? '#10b981' : '#cbd5e1', cursor: 'pointer' }}>
                      {settings.isCodEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                    </button>
                  </div>
                </div>
             </div>
           </div>
        )}

        {tab === 'reviews' && (
          <div style={{ maxWidth: '1000px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} /> Add New Custom Review</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 2fr auto', gap: '16px', alignItems: 'end' }}>
                <div><label style={{fontSize: '11px', fontWeight: 'bold'}}>User Name</label><input type="text" placeholder="e.g. Sarah J." value={newReview.userName} onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} /></div>
                <div><label style={{fontSize: '11px', fontWeight: 'bold'}}>Rating</label>
                  <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div><label style={{fontSize: '11px', fontWeight: 'bold'}}>Comment</label><input type="text" placeholder="Share the glow..." value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} /></div>
                <button onClick={async () => { await addReview(newReview); setNewReview({ userName: '', rating: 5, comment: '' }); await fetchReviews(); }} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }}>POST REVIEW</button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Rating</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Comment</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(review => (
                    <tr key={review.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '700' }}>{review.userName}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(star => <Star key={star} size={12} fill={star <= review.rating ? 'var(--accent-gold)' : 'none'} color="var(--accent-gold)" />)}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>"{review.comment}"</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            onClick={async () => { 
                              const newComment = window.prompt('Edit review comment:', review.comment);
                              if (newComment) {
                                await adminUpdateReview(review.id, { comment: newComment });
                                await fetchReviews();
                              }
                            }} 
                            style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', color: '#64748b', cursor: 'pointer' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button onClick={async () => { if(window.confirm('Delete this review?')) { await adminDeleteReview(review.id); await fetchReviews(); } }} style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={16} />
                          </button>
                          <button style={{ background: 'none', border: 'none', padding: '8px', color: '#94a3b8', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modern Modals for Editing */}
      <AnimatePresence>
        {editModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', zIndex: 1, position: 'relative' }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px' }}>Edit {editModal.type === 'user' ? 'User Details' : 'Order Details'}</h2>
              
              <form onSubmit={editModal.type === 'user' ? handleUpdateUser : handleUpdateOrder}>
                {editModal.type === 'user' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold'}}>First Name</label><input type="text" value={editModal.data.firstName} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, firstName: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} /></div>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold'}}>Last Name</label><input type="text" value={editModal.data.lastName} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, lastName: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{fontSize: '12px', fontWeight: 'bold'}}>Email</label><input type="email" value={editModal.data.email} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, email: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{fontSize: '12px', fontWeight: 'bold'}}>Mobile</label><input type="tel" value={editModal.data.mobile} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, mobile: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} /></div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: 'span 2' }}><label style={{fontSize: '12px', fontWeight: 'bold'}}>Street Address</label><input type="text" value={editModal.data.customerAddress} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, customerAddress: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} /></div>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold'}}>City</label><input type="text" value={editModal.data.city} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, city: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} /></div>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold'}}>State</label><input type="text" value={editModal.data.state} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, state: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} /></div>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold'}}>Zip Code</label><input type="text" value={editModal.data.zip} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, zip: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} /></div>
                    <div><label style={{fontSize: '12px', fontWeight: 'bold'}}>Status</label>
                      <select value={editModal.data.status} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, status: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{fontSize: '12px', fontWeight: 'bold'}}>Tracking ID</label><input type="text" value={editModal.data.trackingId || ''} onChange={(e) => setEditModal({...editModal, data: {...editModal.data, trackingId: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} /></div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', height: '52px', borderRadius: '12px', gap: '8px' }}>
                    <Check size={18} /> SAVE CHANGES
                  </button>
                  <button type="button" onClick={() => setEditModal(null)} style={{ flex: 1, background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <X size={18} /> CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
