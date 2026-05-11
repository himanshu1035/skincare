import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, XCircle, RotateCcw, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrackOrderPage: React.FC = () => {
  const { fetchAllOrders } = useStore();
  const [orderId, setOrderId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setOrderId(id);
      performTrack(id);
    }
  }, []);

  const performTrack = async (id: string) => {
    setIsSearching(true);
    setError('');
    setTrackingInfo(null);

    const allOrders = await fetchAllOrders();
    const foundOrder = allOrders.find(o => 
      o.id.toLowerCase().includes(id.toLowerCase()) || 
      (o.trackingId && o.trackingId.toLowerCase() === id.toLowerCase())
    );

    if (foundOrder) {
      setTrackingInfo(foundOrder);
    } else {
      setError('Order not found. Please check your Order ID or Tracking ID.');
    }
    setIsSearching(false);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    performTrack(orderId);
  };

  const isCancelled = trackingInfo?.status === 'Cancelled';
  const isReturned = trackingInfo?.status === 'Returned';

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
              placeholder="Order ID or Tracking ID" 
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: isCancelled ? 'var(--error-red)' : (isReturned ? 'var(--text-muted)' : 'var(--accent-gold)') 
                  }}>
                    {trackingInfo.status.toUpperCase()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tracking ID</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{trackingInfo.trackingId || 'Preparing...'}</div>
                </div>
              </div>

              {/* Intelligence: Show special cards for Cancelled/Returned */}
              {isCancelled && (
                <div style={{ padding: '20px', background: 'rgba(255,0,0,0.05)', borderRadius: '16px', border: '1px solid rgba(255,0,0,0.1)', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <XCircle size={32} color="var(--error-red)" />
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--error-red)' }}>Order Cancelled</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>This order was cancelled. Please contact support for any queries.</div>
                  </div>
                </div>
              )}

              {isReturned && (
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.05)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <RotateCcw size={32} color="#666" />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Order Returned</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>The order has been successfully returned to our warehouse.</div>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              {!isCancelled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <StatusItem 
                    icon={<Clock size={20} />} 
                    title="Order Placed" 
                    desc="We have received your order." 
                    completed={true}
                  />
                  <StatusItem 
                    icon={<Box size={20} />} 
                    title="Processing" 
                    desc="Your order is being prepared." 
                    active={trackingInfo.status === 'Processing'}
                    completed={['Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned'].includes(trackingInfo.status)}
                  />
                  <StatusItem 
                    icon={<Truck size={20} />} 
                    title="Shipped" 
                    desc="Your package has been handed to the courier." 
                    active={trackingInfo.status === 'Shipped'}
                    completed={['Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned'].includes(trackingInfo.status)}
                  />
                  <StatusItem 
                    icon={<MapPin size={20} />} 
                    title="In Transit" 
                    desc="Your package is moving towards your city." 
                    active={trackingInfo.status === 'In Transit'}
                    completed={['In Transit', 'Out for Delivery', 'Delivered', 'Returned'].includes(trackingInfo.status)}
                  />
                  <StatusItem 
                    icon={<Truck size={20} />} 
                    title="Out for Delivery" 
                    desc="Our delivery partner is on their way to you." 
                    active={trackingInfo.status === 'Out for Delivery'}
                    completed={['Out for Delivery', 'Delivered', 'Returned'].includes(trackingInfo.status)}
                  />
                  <StatusItem 
                    icon={<CheckCircle2 size={20} />} 
                    title="Delivered" 
                    desc="Order successfully delivered!" 
                    active={trackingInfo.status === 'Delivered'}
                    completed={['Delivered', 'Returned'].includes(trackingInfo.status)}
                  />
                  
                  {isReturned && (
                    <StatusItem 
                      icon={<RotateCcw size={20} />} 
                      title="Returned" 
                      desc="Item returned to warehouse." 
                      active={true}
                      completed={true}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusItem: React.FC<{ icon: React.ReactNode, title: string, desc: string, active?: boolean, completed?: boolean }> = ({ icon, title, desc, active, completed }) => (
  <div style={{ display: 'flex', gap: '16px', opacity: (active || completed) ? 1 : 0.3 }}>
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
