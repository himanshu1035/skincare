import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings, BarChart3, ToggleLeft, ToggleRight, X } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { isBogoActive, setBogoActive } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Mock analytics
  const stats = {
    visitors: 1248,
    conversions: 86,
    freeProductsUsed: 172,
    revenue: 2150
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{ position: 'fixed', bottom: '20px', left: '20px', background: 'white', border: '1px solid #eee', padding: '10px', borderRadius: '50%', boxShadow: 'var(--shadow-md)', zIndex: 3000, opacity: 0.5 }}
      >
        <Settings size={20} />
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', maxWidth: '350px', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 3000, overflow: 'hidden', border: '1px solid #eee' }}>
      <div style={{ background: 'var(--text-dark)', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          <BarChart3 size={18} /> ADMIN DASHBOARD
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', color: 'white' }}><X size={18} /></button>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>BOGO Offer Status</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Toggle the Buy 1 Get 1 Free campaign</div>
          </div>
          <button 
            onClick={async () => {
              const nextState = !isBogoActive;
              await setBogoActive(nextState);
            }}
            style={{ background: 'none', color: isBogoActive ? 'var(--success-green)' : '#ccc' }}
          >
            {isBogoActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'var(--secondary-ivory)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>CONVERSIONS</div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{stats.conversions}</div>
          </div>
          <div style={{ background: 'var(--secondary-ivory)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>REVENUE</div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>${stats.revenue}</div>
          </div>
          <div style={{ background: 'var(--secondary-ivory)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>FREE ITEMS</div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{stats.freeProductsUsed}</div>
          </div>
          <div style={{ background: 'var(--secondary-ivory)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>CONV. RATE</div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>6.9%</div>
          </div>
        </div>

        <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Offers tracked by Facebook/TikTok Pixel automatically.
        </div>
      </div>
    </div>
  );
};
