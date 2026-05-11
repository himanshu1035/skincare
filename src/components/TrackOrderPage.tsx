import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrackOrderPage: React.FC = () => {
  const { fetchAllOrders } = useStore();
  const [orderId, setOrderId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    setIsSearching(true);
    setError('');
    setTrackingInfo(null);

    const allOrders = await fetchAllOrders();
    const foundOrder = allOrders.find(o => 
      o.id.toLowerCase().includes(orderId.toLowerCase()) || 
      (o.trackingId && o.trackingId.toLowerCase() === orderId.toLowerCase())
    );

    if (foundOrder) {
      setTrackingInfo(foundOrder);
    } else {
      setError('Order not found. Please check your Order ID or Tracking ID.');
    }
    setIsSearching(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
          <Package size={48} color="var(--accent-gold)" style={{ marginBottom: '24px' }} />
          <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Track Your Order</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Enter your Order ID or Tracking Number to see its current status.</p>

          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <input 
              type="text" 
              placeholder="Order ID (e.g. #7A2B...)" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1.5px solid #eee' }}
            />
            <button className="btn-primary" style={{ padding: '0 32px' }}>
              {isSearching ? '...' : <Search size={20} />}
            </button>
          </form>

          {error && <p style={{ color: 'var(--error-red)', fontSize: '14px' }}>{error}</p>}

          {trackingInfo && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'left', borderTop: '1.5px solid #eee', paddingTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{trackingInfo.status}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tracking ID</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{trackingInfo.trackingId || 'Preparing for shipment'}</div>
                </div>
              </div>

              {/* Status Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <StatusItem 
                  icon={<Clock size={20} />} 
                  title="Order Placed" 
                  desc="We have received your order." 
                  active={true}
                  completed={true}
                />
                <StatusItem 
                  icon={<Package size={20} />} 
                  title="Processing" 
                  desc="Your skin treats are being packed with care." 
                  active={trackingInfo.status === 'Processing'}
                  completed={['Processing', 'Shipped', 'Delivered'].includes(trackingInfo.status)}
                />
                <StatusItem 
                  icon={<Truck size={20} />} 
                  title="Shipped" 
                  desc={trackingInfo.trackingId ? `In transit via our courier partner.` : "Waiting for shipment details."} 
                  active={trackingInfo.status === 'Shipped'}
                  completed={['Shipped', 'Delivered'].includes(trackingInfo.status)}
                />
                <StatusItem 
                  icon={<CheckCircle2 size={20} />} 
                  title="Delivered" 
                  desc="Enjoy your premium COSRX products!" 
                  active={trackingInfo.status === 'Delivered'}
                  completed={trackingInfo.status === 'Delivered'}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusItem: React.FC<{ icon: React.ReactNode, title: string, desc: string, active: boolean, completed: boolean }> = ({ icon, title, desc, active, completed }) => (
  <div style={{ display: 'flex', gap: '16px', opacity: (active || completed) ? 1 : 0.4 }}>
    <div style={{ 
      width: '40px', height: '40px', borderRadius: '12px', 
      background: active ? 'var(--accent-gold)' : (completed ? 'var(--success-green)' : '#eee'), 
      color: (active || completed) ? 'white' : '#999',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontWeight: 'bold', color: active ? 'var(--accent-gold)' : 'inherit' }}>{title}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{desc}</div>
    </div>
  </div>
);
