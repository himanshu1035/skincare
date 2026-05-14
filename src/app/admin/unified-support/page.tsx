"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  MessageSquare, 
  Users, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  Send, 
  X, 
  Search,
  Filter,
  Loader2,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UnifiedSupportPage() {
  const [loading, setLoading] = useState(true);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [marketerTickets, setMarketerTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'partners'>('users');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [processing, setProcessing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    setLoading(true);
    const [userRes, marketerRes] = await Promise.all([
      supabase.from('skin_support_tickets').select('*, skin_user_profiles(*)').order('skin_created_at', { ascending: false }),
      supabase.from('skin_marketer_tickets').select('*, skin_marketers(*)').order('skin_created_at', { ascending: false })
    ]);

    if (userRes.data) setUserTickets(userRes.data);
    if (marketerRes.data) setMarketerTickets(marketerRes.data);
    setLoading(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTicket) return;

    setProcessing(true);
    const table = activeTab === 'users' ? 'skin_support_tickets' : 'skin_marketer_tickets';
    
    const { error } = await supabase
      .from(table)
      .update({ 
        skin_admin_reply: reply, 
        skin_status: activeTab === 'users' ? 'resolved' : 'closed',
        skin_updated_at: new Date().toISOString() 
      })
      .eq('skin_id', selectedTicket.skin_id);

    if (!error) {
      if (activeTab === 'partners') {
        // Send notification to marketer
        await supabase.from('skin_marketer_notifications').insert({
          skin_user_id: selectedTicket.skin_marketer_id,
          skin_title: 'Support Ticket Resolved',
          skin_message: `Your inquiry regarding "${selectedTicket.skin_subject}" has been addressed.`,
          skin_type: 'support',
          skin_link: '/marketer/support'
        });
      }

      setReply('');
      fetchAllTickets();
      setSelectedTicket(null);
      alert('Resolution transmitted successfully!');
    } else {
      alert('Error: ' + error.message);
    }
    setProcessing(false);
  };

  const filteredUserTickets = userTickets.filter(t => 
    t.skin_subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.skin_user_profiles?.skin_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMarketerTickets = marketerTickets.filter(t => 
    t.skin_subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.skin_marketers?.skin_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Synchronizing Support Streams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Support Command</h1>
           <p className="text-text-muted mt-2 font-medium italic">Unified resolution center for Customers and Affiliate Partners.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                placeholder="Search All Inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 bg-white border border-secondary-ivory rounded-xl pl-12 pr-6 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-accent-gold transition-all w-64 shadow-sm"
              />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* User Tickets Stream */}
         <section className="space-y-6">
            <header className="flex items-center justify-between px-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={16} /></div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-text-dark">Customer Tickets ({filteredUserTickets.length})</h2>
               </div>
               {activeTab === 'users' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
            </header>
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
               {filteredUserTickets.map(ticket => (
                  <div 
                    key={ticket.skin_id}
                    onClick={() => { setActiveTab('users'); setSelectedTicket(ticket); }}
                    className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${
                      selectedTicket?.skin_id === ticket.skin_id && activeTab === 'users'
                        ? 'bg-blue-50/50 border-blue-200 shadow-md' 
                        : 'bg-white border-secondary-ivory hover:shadow-lg'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                           ticket.skin_status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                        }`}>{ticket.skin_status}</span>
                        <p className="text-[9px] text-text-muted font-bold uppercase">{new Date(ticket.skin_created_at).toLocaleDateString()}</p>
                     </div>
                     <h3 className="text-sm font-black text-text-dark uppercase tracking-tight mb-2">{ticket.skin_subject}</h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                        <Smartphone size={12} /> {ticket.skin_user_profiles?.skin_first_name} {ticket.skin_user_profiles?.skin_last_name}
                     </p>
                  </div>
               ))}
            </div>
         </section>

         {/* Marketer Tickets Stream */}
         <section className="space-y-6">
            <header className="flex items-center justify-between px-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-gold/10 text-accent-gold rounded-lg"><ShieldCheck size={16} /></div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-text-dark">Partner Inquiries ({filteredMarketerTickets.length})</h2>
               </div>
               {activeTab === 'partners' && <div className="w-1.5 h-1.5 bg-accent-gold rounded-full animate-pulse" />}
            </header>
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
               {filteredMarketerTickets.map(ticket => (
                  <div 
                    key={ticket.skin_id}
                    onClick={() => { setActiveTab('partners'); setSelectedTicket(ticket); }}
                    className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${
                      selectedTicket?.skin_id === ticket.skin_id && activeTab === 'partners'
                        ? 'bg-accent-gold/5 border-accent-gold/30 shadow-md' 
                        : 'bg-white border-secondary-ivory hover:shadow-lg'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                           ticket.skin_status === 'open' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                        }`}>{ticket.skin_status}</span>
                        <p className="text-[9px] text-text-muted font-bold uppercase">{new Date(ticket.skin_created_at).toLocaleDateString()}</p>
                     </div>
                     <h3 className="text-sm font-black text-text-dark uppercase tracking-tight mb-2">{ticket.skin_subject}</h3>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                        <Smartphone size={12} /> {ticket.skin_marketers?.skin_name}
                     </p>
                  </div>
               ))}
            </div>
         </section>
      </div>

      {/* Resolution Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 border border-secondary-ivory overflow-hidden">
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic leading-none">{selectedTicket.skin_subject}</h2>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                        From: {activeTab === 'users' ? 
                          `${selectedTicket.skin_user_profiles?.skin_first_name} (${selectedTicket.skin_user_profiles?.skin_email})` : 
                          `${selectedTicket.skin_marketers?.skin_name} (Partner)`
                        }
                     </p>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="w-12 h-12 rounded-full bg-secondary-ivory flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
               </div>

               <div className="space-y-8 mb-10">
                  <div className="p-8 bg-secondary-ivory/30 rounded-[2.5rem] border border-secondary-ivory">
                     <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-4">Initial Message</p>
                     <p className="text-sm font-medium text-text-dark leading-relaxed italic">{selectedTicket.skin_message}</p>
                  </div>

                  {selectedTicket.skin_admin_reply ? (
                    <div className="p-8 bg-green-50 rounded-[2.5rem] border border-green-100">
                       <p className="text-[10px] font-black text-green-700 uppercase tracking-[0.4em] mb-4">Resolution Sent</p>
                       <p className="text-sm font-medium text-green-800 leading-relaxed italic">{selectedTicket.skin_admin_reply}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReply} className="space-y-6">
                       <textarea 
                         required
                         rows={5}
                         value={reply}
                         onChange={(e) => setReply(e.target.value)}
                         placeholder="Draft your professional response..."
                         className="w-full bg-secondary-ivory/10 border-2 border-secondary-ivory rounded-[2rem] p-8 text-sm font-medium text-text-dark outline-none focus:border-accent-gold transition-all resize-none"
                       />
                       <button 
                         disabled={processing}
                         className="w-full h-18 bg-text-dark text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 flex items-center justify-center gap-3"
                       >
                          {processing ? <Loader2 className="animate-spin" size={24} /> : <><Send size={20} /> Transmit Resolution</>}
                       </button>
                    </form>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
