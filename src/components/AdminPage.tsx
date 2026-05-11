import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ToggleLeft, ToggleRight, LogOut, Package, Settings, Users, ShoppingCart, Edit2, Check, X, CreditCard, Truck, DollarSign, MapPin, Phone, Mail, Star, Trash2, Plus, User as UserIcon } from 'lucide-react';

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
    isBogoActive, setBogoActive, currency, 
    product, updateProduct, fetchData, 
    fetchAllOrders, fetchAllUsers, updateOrderStatus, updateUserDetails,
    settings, updateSettings,
    reviews, fetchReviews, addReview, adminUpdateReview, adminDeleteReview
  } = useStore();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'payment' | 'orders' | 'users' | 'reviews'>('payment');

  // Review Create State
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, comment: '' });

  // Edit states
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editOrderData, setEditOrderData] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editReviewData, setEditReviewData] = useState<any>(null);

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    const init = async () => {
      await fetchData();
      if (tab === 'orders') setOrders(await fetchAllOrders());
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

  // Auto-save logic with Debounce
  const autoSaveProduct = (updates: any) => {
    // Update local store immediately for UI responsiveness
    const state = useStore.getState();
    useStore.setState({ product: state.product ? { ...state.product, ...updates } : null });
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateProduct(updates);
    }, 1000);
  };

  const autoSaveSettings = (updates: any) => {
    // Update local store immediately
    const state = useStore.getState();
    useStore.setState({ settings: { ...state.settings, ...updates } });

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateSettings(updates);
    }, 1000);
  };
  const autoSaveUser = async (id: string, updates: any) => {
    await updateUserDetails(id, updates);
    setUsers(await fetchAllUsers());
  };

  const handleCreateReview = async () => {
    await addReview(newReview);
    setNewReview({ userName: '', rating: 5, comment: '' });
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
        
        <button onClick={() => setTab('payment')} style={{ background: tab === 'payment' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CreditCard size={20} /> Payment & Pricing
        </button>
        <button onClick={() => setTab('orders')} style={{ background: tab === 'orders' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShoppingCart size={20} /> Manage Orders
        </button>
        <button onClick={() => setTab('users')} style={{ background: tab === 'users' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={20} /> Manage Users
        </button>
        <button onClick={() => setTab('reviews')} style={{ background: tab === 'reviews' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Star size={20} /> Manage Reviews
        </button>
        
        <div style={{ marginTop: 'auto' }}>
          <button onClick={() => setIsAuthenticated(false)} style={{ width: '100%', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {tab === 'payment' && product && (
          <div style={{ maxWidth: '1000px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Payment & Pricing Overhaul</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Product Pricing */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Package color="var(--accent-gold)" /> <DollarSign color="var(--accent-gold)" size={20} /> Product Prices</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#999' }}>Offer Price ({currency})</label>
                    <input type="number" value={product.price} onChange={(e) => autoSaveProduct({ price: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#999' }}>Actual Price ({currency})</label>
                    <input type="number" value={product.originalPrice} onChange={(e) => autoSaveProduct({ originalPrice: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '12px' }}>
                    <span>BOGO Campaign Active</span>
                    <button onClick={() => setBogoActive(!isBogoActive)} style={{ background: 'none', color: isBogoActive ? 'var(--success-green)' : '#ccc' }}>
                      {isBogoActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery & Discounts */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Truck color="var(--accent-gold)" /> Delivery & Online Rules</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#999' }}>Standard Delivery Charge ({currency})</label>
                    <input type="number" value={settings.deliveryCharge} onChange={(e) => autoSaveSettings({ deliveryCharge: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#999' }}>COD Extra Charge ({currency})</label>
                    <input type="number" value={settings.codCharge} onChange={(e) => autoSaveSettings({ codCharge: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#999' }}>Online Payment Discount ({currency})</label>
                    <input type="number" value={settings.prepayDiscount} onChange={(e) => autoSaveSettings({ prepayDiscount: Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#999' }}>Admin UPI ID (for QR generation)</label>
                      <input type="text" value={settings.upiId} onChange={(e) => autoSaveSettings({ upiId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#999' }}>Currency Symbol</label>
                      <select value={currency} onChange={(e) => updateCurrency(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <option value="₹">₹ (Rupee)</option>
                        <option value="$">$ (Dollar)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>Enable Cash on Delivery</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Allow users to pay after delivery</div>
                    </div>
                    <button onClick={() => autoSaveSettings({ isCodEnabled: !settings.isCodEnabled })} style={{ background: 'none', color: settings.isCodEnabled ? 'var(--success-green)' : '#ccc' }}>
                      {settings.isCodEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>Pay Delivery First (COD)</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>User must pay {currency}{settings.deliveryCharge} upfront even for COD</div>
                    </div>
                    <button onClick={() => autoSaveSettings({ payDeliveryFirst: !settings.payDeliveryFirst })} style={{ background: 'none', color: settings.payDeliveryFirst ? 'var(--success-green)' : '#ccc' }}>
                      {settings.payDeliveryFirst ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--success-green)', fontSize: '12px' }}>✓ All changes are auto-saved in real-time.</div>
          </div>
        )}

        {tab === 'reviews' && (
          <div style={{ maxWidth: '1000px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Manage Reviews</h1>
            
            {/* Review Stats Manipulation */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings color="var(--accent-gold)" /> Global Social Proof Manipulation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#999' }}>Manual Review Count (e.g. 15,000+)</label>
                  <input type="text" value={settings.displayReviewCount} onChange={(e) => autoSaveSettings({ displayReviewCount: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#999' }}>Manual Average Rating (e.g. 4.9)</label>
                  <input type="text" value={settings.displayRating} onChange={(e) => autoSaveSettings({ displayRating: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                </div>
              </div>
            </div>

            {/* Create Review */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus color="var(--accent-gold)" /> Add New Custom Review</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 2fr auto', gap: '16px', alignItems: 'end' }}>
                <input type="text" placeholder="Name" value={newReview.userName} onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
                <input type="text" placeholder="Comment" value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} />
                <button onClick={handleCreateReview} className="btn-primary" style={{ padding: '12px 24px' }}>ADD</button>
              </div>
            </div>

            {/* Review List */}
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f9f9f9' }}>
                  <tr>
                    <th style={{ padding: '20px' }}>User</th>
                    <th style={{ padding: '20px' }}>Rating</th>
                    <th style={{ padding: '20px' }}>Comment</th>
                    <th style={{ padding: '20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(review => (
                    <tr key={review.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '20px' }}>
                        {editingReview === review.id ? (
                          <input type="text" value={editReviewData.userName} onChange={(e) => setEditReviewData({ ...editReviewData, userName: e.target.value })} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eee' }} />
                        ) : review.userName}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingReview === review.id ? (
                          <select value={editReviewData.rating} onChange={(e) => setEditReviewData({ ...editReviewData, rating: Number(e.target.value) })} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eee' }}>
                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        ) : review.rating}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingReview === review.id ? (
                          <input type="text" value={editReviewData.comment} onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #eee' }} />
                        ) : review.comment}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingReview === review.id ? (
                          <button onClick={() => { adminUpdateReview(review.id, editReviewData); setEditingReview(null); }} style={{ background: 'var(--success-green)', color: 'white', padding: '8px', borderRadius: '8px' }}><Check size={16} /></button>
                        ) : (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => { setEditingReview(review.id); setEditReviewData(review); }} style={{ color: 'var(--accent-gold)' }}><Edit2 size={18} /></button>
                            <button onClick={() => adminDeleteReview(review.id)} style={{ color: '#ff4d4d' }}><Trash2 size={18} /></button>
                          </div>
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
                    <th style={{ padding: '20px' }}>User Details</th>
                    <th style={{ padding: '20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '20px' }}>
                        {editingUser === user.id ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div><label style={{fontSize: '11px'}}>First Name</label><input type="text" value={editUserData.firstName} onChange={(e) => setEditUserData({ ...editUserData, firstName: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} /></div>
                            <div><label style={{fontSize: '11px'}}>Last Name</label><input type="text" value={editUserData.lastName} onChange={(e) => setEditUserData({ ...editUserData, lastName: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} /></div>
                            <div><label style={{fontSize: '11px'}}>Email</label><input type="email" value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} /></div>
                            <div><label style={{fontSize: '11px'}}>Mobile</label><input type="tel" value={editUserData.mobile} onChange={(e) => setEditUserData({ ...editUserData, mobile: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} /></div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}><UserIcon size={16} color="#999" /> <b>{user.firstName} {user.lastName}</b></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={16} color="#999" /> {user.email}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={16} color="#999" /> {user.mobile}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingUser === user.id ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { autoSaveUser(user.id, editUserData); setEditingUser(null); }} style={{ background: 'var(--success-green)', color: 'white', padding: '8px', borderRadius: '8px' }}><Check size={16} /></button>
                            <button onClick={() => setEditingUser(null)} style={{ background: '#eee', padding: '8px', borderRadius: '8px' }}><X size={16} /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingUser(user.id); setEditUserData(user); }} style={{ color: 'var(--accent-gold)' }}><Edit2 size={18} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <th style={{ padding: '20px' }}>Order Info</th>
                    <th style={{ padding: '20px' }}>Shipping Details</th>
                    <th style={{ padding: '20px' }}>Payment</th>
                    <th style={{ padding: '20px' }}>Status & Tracking</th>
                    <th style={{ padding: '20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '20px' }}>
                        <div style={{ fontWeight: 'bold' }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><UserIcon size={14} /> {order.firstName} {order.lastName}</div>
                        <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {order.customerMobile}</div>
                        <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {order.city}, {order.state}</div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{ fontWeight: 'bold' }}>{currency}{order.totalAmount.toFixed(2)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CreditCard size={12} color="#666" />
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: order.paymentMethod === 'Prepaid' ? 'var(--success-green)' : 'var(--accent-gold)' }}>{order.paymentMethod}</span>
                        </div>
                        {order.utrId && (
                          <div style={{ fontSize: '10px', background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', marginTop: '4px', width: 'fit-content' }}>
                            <b>UTR:</b> {order.utrId}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingOrder === order.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <select value={editOrderData.status} onChange={(e) => setEditOrderData({ ...editOrderData, status: e.target.value })} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eee' }}>
                              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <input type="text" value={editOrderData.trackingId} onChange={(e) => setEditOrderData({ ...editOrderData, trackingId: e.target.value })} placeholder="Tracking ID" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eee' }} />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '50px', background: 'rgba(197,160,89,0.1)', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: 'bold', width: 'fit-content' }}>{order.status}</span>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.trackingId || 'No tracking ID'}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {editingOrder === order.id ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { updateOrderStatus(order.id, editOrderData.status, editOrderData.trackingId); setEditingOrder(null); fetchAllOrders().then(setOrders); }} style={{ background: 'var(--success-green)', color: 'white', padding: '8px', borderRadius: '8px' }}><Check size={16} /></button>
                            <button onClick={() => setEditingOrder(null)} style={{ background: '#eee', padding: '8px', borderRadius: '8px' }}><X size={16} /></button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {order.status === 'Pending Payment' && (
                              <>
                                <button onClick={() => { updateOrderStatus(order.id, 'Processing'); fetchAllOrders().then(setOrders); }} style={{ background: 'var(--success-green)', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>ACCEPT PAYMENT</button>
                                <button onClick={() => { updateOrderStatus(order.id, 'Payment Failed'); fetchAllOrders().then(setOrders); }} style={{ background: '#ff4d4d', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>REJECT</button>
                              </>
                            )}
                            <button onClick={() => { setEditingOrder(order.id); setEditOrderData(order); }} style={{ color: 'var(--accent-gold)' }}><Edit2 size={18} /></button>
                          </div>
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
