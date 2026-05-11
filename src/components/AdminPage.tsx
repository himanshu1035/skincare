import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { BarChart3, ToggleLeft, ToggleRight, LogOut, Package, Settings, RefreshCw, Users, ShoppingCart, Edit2, Check, X, CreditCard, Truck, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CURRENCIES = [
  { label: 'US Dollar ($)', value: '$' },
  { label: 'Euro (€)', value: '€' },
  { label: 'Indian Rupee (₹)', value: '₹' },
  { label: 'British Pound (£)', value: '£' },
  { label: 'UAE Dirham (AED)', value: 'AED ' },
  { label: 'Australian Dollar (A$)', value: 'A$' }
];

export const AdminPage: React.FC = () => {
  const { 
    isBogoActive, setBogoActive, currency, updateCurrency, 
    product, updateProduct, fetchData, 
    fetchAllOrders, fetchAllUsers, updateOrderStatus, updateUserDetails,
    settings, updateSettings
  } = useStore();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'settings' | 'orders' | 'users' | 'payment'>('settings');

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [price, setPrice] = useState(0);
  const [origPrice, setOrigPrice] = useState(0);

  // Payment states
  const [codCharge, setCodCharge] = useState(0);
  const [prepayDiscount, setPrepayDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Edit states
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');

  useEffect(() => {
    fetchData();
    loadAdminData();
  }, [tab]);

  const loadAdminData = async () => {
    if (tab === 'orders') setOrders(await fetchAllOrders());
    if (tab === 'users') setUsers(await fetchAllUsers());
  };

  useEffect(() => {
    if (product) {
      setPrice(product.price);
      setOrigPrice(product.originalPrice);
    }
    if (settings) {
      setCodCharge(settings.codCharge);
      setPrepayDiscount(settings.prepayDiscount);
      setDeliveryCharge(settings.deliveryCharge);
    }
  }, [product, settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') setIsAuthenticated(true);
    else alert('Invalid credentials');
  };

  const handleUpdateOrderStatus = async (id: string) => {
    await updateOrderStatus(id, editStatus, editTracking);
    setEditingOrder(null);
    loadAdminData();
  };

  const handleUpdateUser = async (id: string) => {
    await updateUserDetails(id, { email: editEmail, mobile: editMobile });
    setEditingUser(null);
    loadAdminData();
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-ivory)' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Admin Login</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>LOGIN</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--text-dark)', color: 'white', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={28} /> SKIN ADMIN
        </div>
        
        <button onClick={() => setTab('settings')} style={{ background: tab === 'settings' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={20} /> Store Settings
        </button>
        <button onClick={() => setTab('payment')} style={{ background: tab === 'payment' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CreditCard size={20} /> Payment & Delivery
        </button>
        <button onClick={() => setTab('orders')} style={{ background: tab === 'orders' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShoppingCart size={20} /> Manage Orders
        </button>
        <button onClick={() => setTab('users')} style={{ background: tab === 'users' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={20} /> Manage Users
        </button>
        
        <div style={{ marginTop: 'auto' }}>
          <button onClick={() => setIsAuthenticated(false)} style={{ width: '100%', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {tab === 'settings' && (
          <div style={{ maxWidth: '900px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Store Settings</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Package color="var(--accent-gold)" /> Product Control</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ fontSize: '14px' }}>Sale Price ({currency})</label>
                  <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  <label style={{ fontSize: '14px' }}>Original Price ({currency})</label>
                  <input type="number" value={origPrice} onChange={(e) => setOrigPrice(Number(e.target.value))} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  <button onClick={() => updateProduct({ price, originalPrice: origPrice })} className="btn-primary" style={{ justifyContent: 'center' }}>SAVE CHANGES</button>
                </div>
              </div>

              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCw color="var(--accent-gold)" /> Campaign & Currency</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '12px' }}>
                    <span>BOGO Campaign</span>
                    <button onClick={() => setBogoActive(!isBogoActive)} style={{ background: 'none', color: isBogoActive ? 'var(--success-green)' : '#ccc' }}>
                      {isBogoActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                    </button>
                  </div>
                  <label style={{ fontSize: '14px' }}>Store Currency</label>
                  <select value={currency} onChange={(e) => updateCurrency(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'payment' && (
          <div style={{ maxWidth: '900px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Payment & Delivery</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Truck color="var(--accent-gold)" /> Delivery Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ fontSize: '14px' }}>Standard Delivery Charge ({currency})</label>
                  <input type="number" value={deliveryCharge} onChange={(e) => setDeliveryCharge(Number(e.target.value))} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '12px', marginTop: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Pay Delivery First?</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Customer pays delivery charge before COD</div>
                    </div>
                    <button onClick={() => updateSettings({ payDeliveryFirst: !settings.payDeliveryFirst })} style={{ background: 'none', color: settings.payDeliveryFirst ? 'var(--success-green)' : '#ccc' }}>
                      {settings.payDeliveryFirst ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                    </button>
                  </div>
                  <button onClick={() => updateSettings({ deliveryCharge })} className="btn-primary" style={{ justifyContent: 'center' }}>SAVE DELIVERY</button>
                </div>
              </div>

              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign color="var(--accent-gold)" /> Payment Rules</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ fontSize: '14px' }}>COD Extra Charge ({currency})</label>
                  <input type="number" value={codCharge} onChange={(e) => setCodCharge(Number(e.target.value))} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  
                  <label style={{ fontSize: '14px' }}>Prepayment Discount ({currency})</label>
                  <input type="number" value={prepayDiscount} onChange={(e) => setPrepayDiscount(Number(e.target.value))} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  
                  <button onClick={() => updateSettings({ codCharge, prepayDiscount })} className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>SAVE RULES</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Manage Orders</h1>
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f9f9f9' }}>
                  <tr>
                    <th style={{ padding: '20px' }}>Order</th>
                    <th style={{ padding: '20px' }}>Customer</th>
                    <th style={{ padding: '20px' }}>Method</th>
                    <th style={{ padding: '20px' }}>Status</th>
                    <th style={{ padding: '20px' }}>Tracking</th>
                    <th style={{ padding: '20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '20px', fontWeight: 'bold' }}>#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td style={{ padding: '20px' }}>
                        <div style={{ fontWeight: '500' }}>{order.customerEmail}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.customerMobile}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.city}, {order.state}</div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: order.paymentMethod === 'Prepaid' ? 'var(--success-green)' : 'var(--accent-gold)' }}>{order.paymentMethod}</span>
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingOrder === order.id ? (
                          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span style={{ padding: '6px 12px', borderRadius: '50px', background: 'rgba(197,160,89,0.1)', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold' }}>{order.status}</span>
                        )}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingOrder === order.id ? (
                          <input type="text" value={editTracking} onChange={(e) => setEditTracking(e.target.value)} placeholder="Tracking ID" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #eee' }} />
                        ) : (
                          <span style={{ color: order.trackingId ? 'inherit' : '#ccc' }}>{order.trackingId || 'Not assigned'}</span>
                        )}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingOrder === order.id ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleUpdateOrderStatus(order.id)} style={{ background: 'var(--success-green)', color: 'white', padding: '8px', borderRadius: '4px' }}><Check size={16} /></button>
                            <button onClick={() => setEditingOrder(null)} style={{ background: '#eee', padding: '8px', borderRadius: '4px' }}><X size={16} /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingOrder(order.id); setEditStatus(order.status); setEditTracking(order.trackingId || ''); }} style={{ background: 'none', color: 'var(--accent-gold)' }}><Edit2 size={18} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Manage Users</h1>
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f9f9f9' }}>
                  <tr>
                    <th style={{ padding: '20px' }}>Email</th>
                    <th style={{ padding: '20px' }}>Mobile</th>
                    <th style={{ padding: '20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '20px' }}>
                        {editingUser === user.id ? (
                          <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #eee' }} />
                        ) : user.email}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingUser === user.id ? (
                          <input type="tel" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #eee' }} />
                        ) : user.mobile}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingUser === user.id ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleUpdateUser(user.id)} style={{ background: 'var(--success-green)', color: 'white', padding: '8px', borderRadius: '4px' }}><Check size={16} /></button>
                            <button onClick={() => setEditingUser(null)} style={{ background: '#eee', padding: '8px', borderRadius: '4px' }}><X size={16} /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingUser(user.id); setEditEmail(user.email); setEditMobile(user.mobile); }} style={{ background: 'none', color: 'var(--accent-gold)' }}><Edit2 size={18} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
