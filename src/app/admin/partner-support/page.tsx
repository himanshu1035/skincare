"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Loader2,
  ChevronRight,
  ShieldCheck,
  User,
  Clock,
  Send,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPartnerSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [processing, setProcessing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    setLoading(true);
    let query = supabase
      .from('skin_marketer_tickets')
      .select('*, skin_marketers(skin_name, skin_email)')
      .order('skin_created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('skin_status', filter);
    }

    const { data } = await query;
    if (data) setTickets(data);
    setLoading(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setProcessing(true);
    
    // 1. Update ticket with reply and close it
    const { error } = await supabase
      .from('skin_marketer_tickets')
      .update({ 
        skin_admin_reply: reply, 
        skin_status: 'closed',
        skin_updated_at: new Date().toISOString() 
      })
      .eq('skin_id', selectedTicket.skin_id);

    if (!error) {
      // 2. Create notification for marketer
      await supabase.from('skin_marketer_notifications').insert({
        skin_user_id: selectedTicket.skin_marketer_id,
        skin_title: 'Support Ticket Resolved',
        skin_message: `Your inquiry regarding "${selectedTicket.skin_subject}" has been addressed.`,
        skin_type: 'support',
        skin_link: '/marketer/support'
      });

      setReply('');
      fetchTickets();
      setSelectedTicket(null);
    }
    setProcessing(false);
  };

  const filteredTickets = tickets.filter(t => 
    t.skin_marketers?.skin_name.toLowerCase().includes(search.toLowerCase()) ||
    t.skin_subject.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Loading Partner Inquiries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Partner Relations</h1>
           <p className="text-text-muted mt-2 font-medium italic">Address technical and operational inquiries from your affiliate network.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                placeholder="Search Inquiries..."
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
              <option value="open">Open Cases</option>
              <option value="closed">Resolved</option>
              <option value="all">Full Archive</option>
           </select>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
         {filteredTickets.map((ticket) => (
            <motion.div 
              key={ticket.skin_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-secondary-ivory shadow-sm overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => setSelectedTicket(ticket)}
            >
               <div className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-8">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${ticket.skin_status === 'open' ? 'bg-accent-gold/10 text-accent-gold' : 'bg-green-50 text-green-600'}`}>
                        <MessageSquare size={24} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest">#{ticket.skin_id.slice(0, 8)}</span>
                           <h3 className="text-lg font-black text-text-dark uppercase tracking-tight italic">{ticket.skin_subject}</h3>
                        </div>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-3">
                           <User size={12} className="text-text-dark" /> {ticket.skin_marketers?.skin_name} · <Clock size={12} /> {new Date(ticket.skin_created_at).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        ticket.skin_status === 'open' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                     }`}>
                        {ticket.skin_status}
                     </span>
                     <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            </motion.div>
         ))}
         {filteredTickets.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-secondary-ivory">
               <div className="w-20 h-20 bg-secondary-ivory rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted">
                  <ShieldCheck size={40} />
               </div>
               <h2 className="text-xl font-black text-text-dark uppercase italic mb-2">Workspace Clear</h2>
               <p className="text-sm font-medium text-text-muted italic">No partner inquiries require immediate resolution.</p>
            </div>
         )}
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
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Inquiry from {selectedTicket.skin_marketers?.skin_name}</p>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="w-12 h-12 rounded-full bg-secondary-ivory flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
               </div>

               <div className="space-y-10 mb-10">
                  <div className="flex gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-secondary-ivory flex-shrink-0 flex items-center justify-center text-text-muted">
                        <User size={20} />
                     </div>
                     <div className="p-8 bg-secondary-ivory/30 rounded-[2.5rem] rounded-tl-none border border-secondary-ivory flex-1 shadow-inner">
                        <p className="text-sm font-medium text-text-dark leading-relaxed italic">{selectedTicket.skin_message}</p>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-4 italic">Received on {new Date(selectedTicket.skin_created_at).toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="w-full h-px bg-secondary-ivory" />

                  {selectedTicket.skin_status === 'open' ? (
                    <form onSubmit={handleReply} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Resolution Response</label>
                          <textarea 
                            required
                            rows={5}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Draft your response to the partner..."
                            className="w-full bg-secondary-ivory/10 border-2 border-secondary-ivory rounded-[2rem] p-8 text-sm font-medium text-text-dark outline-none focus:border-accent-gold transition-all resize-none"
                          />
                       </div>
                       <button 
                         disabled={processing}
                         className="w-full h-18 bg-text-dark text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 flex items-center justify-center gap-3"
                       >
                          {processing ? <Loader2 className="animate-spin" size={24} /> : <><Send size={20} /> Transmit Resolution</>}
                       </button>
                    </form>
                  ) : (
                    <div className="flex gap-6 flex-row-reverse">
                       <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex-shrink-0 flex items-center justify-center">
                          <CheckCircle2 size={20} />
                       </div>
                       <div className="p-8 bg-green-50 rounded-[2.5rem] rounded-tr-none border border-green-100 flex-1">
                          <p className="text-sm font-black text-green-700 uppercase italic mb-2 tracking-tight">Administrative Resolution</p>
                          <p className="text-sm font-medium text-green-800 leading-relaxed italic">{selectedTicket.skin_admin_reply}</p>
                          <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-4 italic">Closed on {new Date(selectedTicket.skin_updated_at).toLocaleString()}</p>
                       </div>
                    </div>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
