"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowUpRight,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

export default function AdminWithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase
      .from('skin_marketer_withdrawals')
      .select('*, skin_marketers(skin_name, skin_email)')
      .order('skin_created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('skin_status', filter);
    }

    const { data } = await query;
    if (data) setRequests(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'declined', marketerId: string) => {
    setProcessing(true);
    
    // 1. Update request status
    const { error } = await supabase
      .from('skin_marketer_withdrawals')
      .update({ skin_status: status, skin_updated_at: new Date().toISOString() })
      .eq('skin_id', id);

    if (error) {
      console.error('Settlement Error:', error);
      alert('Failed to update settlement: ' + error.message);
    } else {
      // 2. Create notification for marketer
      const { error: notifyError } = await supabase.from('skin_marketer_notifications').insert({
        skin_user_id: marketerId,
        skin_title: `Withdrawal ${status.toUpperCase()}`,
        skin_message: status === 'approved' 
          ? `Your withdrawal request has been approved and processed.` 
          : `Your withdrawal request was declined. Please check your support tickets for details.`,
        skin_type: 'withdrawal',
        skin_link: '/marketer/withdraw'
      });

      if (notifyError) console.warn('Notification Error:', notifyError);

      await fetchRequests();
      setSelectedRequest(null);
      alert('Settlement successfully synchronized across all ledgers.');
    }
    setProcessing(false);
  };

  const filteredRequests = requests.filter(r => 
    r.skin_marketers?.skin_name.toLowerCase().includes(search.toLowerCase()) ||
    r.skin_upi_id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Auditing Financial Requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Payout Management</h1>
           <p className="text-text-muted mt-2 font-medium italic">Audit and settle pending withdrawal requests from partners.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                placeholder="Search Partner or UPI"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 bg-white border border-secondary-ivory rounded-xl pl-12 pr-6 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-accent-gold transition-all w-64 shadow-sm"
              />
           </div>
           <select 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="h-12 bg-white border border-secondary-ivory rounded-xl px-6 text-[11px] font-black uppercase tracking-widest outline-none shadow-sm"
           >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="all">All Logs</option>
           </select>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-secondary-ivory bg-secondary-ivory/10">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Partner</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Settlement ID</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Amount</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-secondary-ivory">
                  {filteredRequests.map((req) => (
                     <tr key={req.skin_id} className="hover:bg-secondary-ivory/10 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-text-dark text-white flex items-center justify-center font-black text-xs">
                                 {req.skin_marketers?.skin_name?.[0].toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-text-dark uppercase tracking-tight">{req.skin_marketers?.skin_name}</p>
                                 <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{req.skin_marketers?.skin_email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 font-black text-text-muted text-[11px] uppercase tracking-widest">
                           <div className="flex items-center gap-2">
                              <Smartphone size={14} className="text-accent-gold" /> {req.skin_upi_id}
                           </div>
                        </td>
                        <td className="px-8 py-6 font-black text-text-dark text-sm">{formatPrice(req.skin_amount)}</td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              req.skin_status === 'approved' ? 'bg-green-50 text-green-600' :
                              req.skin_status === 'declined' ? 'bg-red-50 text-red-500' :
                              'bg-blue-50 text-blue-600'
                           }`}>
                              {req.skin_status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           {req.skin_status === 'pending' ? (
                              <button 
                                onClick={() => setSelectedRequest(req)}
                                className="h-10 px-6 bg-text-dark text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-accent-gold transition-all"
                              >
                                 Settle Request
                              </button>
                           ) : (
                              <p className="text-[9px] font-black text-text-muted uppercase italic tracking-widest flex items-center justify-end gap-2">
                                 <ShieldCheck size={14} className="text-green-500" /> Settled {new Date(req.skin_updated_at).toLocaleDateString()}
                              </p>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredRequests.length === 0 && (
               <div className="py-24 text-center">
                  <div className="w-16 h-16 bg-secondary-ivory rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                     <Wallet size={32} />
                  </div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">No settlement requests found.</p>
               </div>
            )}
         </div>
      </div>

      {/* Settle Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl p-12 border border-secondary-ivory">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic leading-none">Settlement Review</h2>
                  <div className="p-3 bg-accent-gold/10 text-accent-gold rounded-2xl"><Wallet size={24} /></div>
               </div>

               <div className="space-y-8 mb-10">
                  <div className="p-8 bg-secondary-ivory/30 rounded-[2.5rem] border border-secondary-ivory">
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Payout Breakdown</p>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <p className="text-[11px] font-black text-text-dark uppercase">Amount</p>
                           <p className="text-xl font-black text-text-dark">{formatPrice(selectedRequest.skin_amount)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                           <p className="text-[11px] font-black text-text-dark uppercase">Partner</p>
                           <p className="text-xs font-black text-text-muted uppercase">{selectedRequest.skin_marketers?.skin_name}</p>
                        </div>
                        <div className="flex items-center justify-between">
                           <p className="text-[11px] font-black text-text-dark uppercase">UPI ID</p>
                           <p className="text-xs font-black text-accent-gold uppercase">{selectedRequest.skin_upi_id}</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                     <Clock className="text-blue-600 flex-shrink-0" size={20} />
                     <p className="text-[10px] font-medium text-blue-800 italic leading-relaxed">
                        Ensure you have manually transferred the amount to the provided UPI ID before marking this request as approved.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={processing}
                    onClick={() => handleUpdateStatus(selectedRequest.skin_id, 'declined', selectedRequest.skin_marketer_id)}
                    className="h-16 rounded-2xl bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                     <XCircle size={18} /> Decline Request
                  </button>
                  <button 
                    disabled={processing}
                    onClick={() => handleUpdateStatus(selectedRequest.skin_id, 'approved', selectedRequest.skin_marketer_id)}
                    className="h-16 rounded-2xl bg-text-dark text-white font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-text-dark/10 flex items-center justify-center gap-2"
                  >
                     <CheckCircle2 size={18} /> Confirm Payout
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
