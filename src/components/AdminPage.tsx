import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { BarChart3, ToggleLeft, ToggleRight, Save, LogOut, Package, Settings, RefreshCw } from 'lucide-react';
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
  const { isBogoActive, setBogoActive, currency, updateCurrency, product, updateProduct, fetchData } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Form states
  const [price, setPrice] = useState(0);
  const [origPrice, setOrigPrice] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (product) {
      setPrice(product.price);
      setOrigPrice(product.originalPrice);
    }
  }, [product]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleUpdatePricing = async () => {
    setIsUpdating(true);
    await updateProduct({ price, originalPrice: origPrice });
    setIsUpdating(false);
    alert('Pricing updated site-wide!');
  };

  const handleCurrencyChange = async (newVal: string) => {
    setIsUpdating(true);
    await updateCurrency(newVal);
    setIsUpdating(false);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-ivory)' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Admin Login</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee' }} 
            />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>LOGIN</button>
            <button type="button" onClick={() => navigate('/')} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '14px' }}>Back to Store</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--secondary-ivory)' }}>
      <nav style={{ background: 'var(--text-dark)', color: 'white', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '20px' }}>
            <Settings size={24} /> SKIN ADMIN
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => fetchData()} style={{ background: 'none', color: 'white' }}><RefreshCw size={18} /></button>
            <button onClick={() => setIsAuthenticated(false)} style={{ background: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Campaign & Currency */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <BarChart3 color="var(--accent-gold)" />
              <h2 style={{ fontSize: '18px' }}>Campaign & Currency</h2>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'var(--secondary-ivory)', borderRadius: '8px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>BOGO Offer</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status: {isBogoActive ? 'ACTIVE' : 'INACTIVE'}</div>
              </div>
              <button 
                onClick={() => setBogoActive(!isBogoActive)}
                style={{ background: 'none', color: isBogoActive ? 'var(--success-green)' : '#ccc' }}
              >
                {isBogoActive ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>Select Store Currency</label>
              <select 
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #eee', appearance: 'none', background: 'white' }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Management */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Package color="var(--accent-gold)" />
              <h2 style={{ fontSize: '18px' }}>Product Pricing</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Sale Price ({currency})</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Original Price ({currency})</label>
                <input 
                  type="number" 
                  value={origPrice}
                  onChange={(e) => setOrigPrice(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }} 
                />
              </div>
              <button 
                onClick={handleUpdatePricing}
                className="btn-primary" 
                style={{ justifyContent: 'center', gap: '8px', opacity: isUpdating ? 0.7 : 1 }}
                disabled={isUpdating}
              >
                <Save size={18} /> {isUpdating ? 'UPDATING...' : 'UPDATE PRICING'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
