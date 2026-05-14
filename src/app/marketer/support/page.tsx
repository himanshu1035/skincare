"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  LifeBuoy, 
  MessageSquare, 
  Plus, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Loader2,
  X,
  Send,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketerSupport() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('skin_marketer_tickets')
      .select('*')
      .eq('skin_marketer_id', session.user.id)
      .order('skin_created_at', { ascending: false });

    if (data) setTickets(data);
    setLoading(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('skin_marketer_tickets')
      .insert({
        skin_marketer_id: session?.user.id,
        skin_subject: subject,
        skin_message: message,
        skin_status: 'open'
      });

    if (error) {
      console.error('Ticket Submission Error:', error);
      alert('Failed to submit ticket: ' + error.message);
    } else {
      setSubject('');
      setMessage('');
      setIsModalOpen(false);
      fetchTickets();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Partner Support</h1>
           <p className="text-text-muted mt-2 font-medium italic">Dedicated assistance for your affiliate operations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-10 rounded-full bg-text-dark text-white font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 group"
        >
          <Plus size={18} /> Raise Ticket
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           {tickets.length > 0 ? tickets.map((ticket) => (
              <motion.div 
                key={ticket.skin_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-secondary-ivory shadow-sm overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setSelectedTicket(ticket)}
              >
                 <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${ticket.skin_status === 'open' ? 'bg-accent-gold/10 text-accent-gold' : 'bg-green-50 text-green-600'}`}>
                          <MessageSquare size={24} />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-text-dark uppercase tracking-tight italic">{ticket.skin_subject}</h3>
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                             <Clock size={12} /> {new Date(ticket.skin_created_at).toLocaleDateString()} · Ticket #{(ticket.skin_id || '').slice(0, 8)}
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
           )) : (
              <div className="bg-white rounded-[3rem] p-20 border border-secondary-ivory shadow-sm text-center">
                 <div className="w-20 h-20 bg-secondary-ivory rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted">
                    <HelpCircle size={40} />
                 </div>
                 <h2 className="text-xl font-black text-text-dark uppercase italic mb-2">No Active Inquiries</h2>
                 <p className="text-sm font-medium text-text-muted italic max-w-xs mx-auto">If you have any questions regarding payouts or technical issues, please raise a ticket.</p>
              </div>
           )}
        </div>

        <div className="space-y-8">
           <div className="bg-text-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <LifeBuoy className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 group-hover:rotate-45 transition-transform duration-1000" />
              <h3 className="text-2xl font-black uppercase tracking-widest mb-4 italic">24/7 Priority Support</h3>
              <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed italic">
                 Our specialized partner relations team is here to assist with technical integration, payout inquiries, and policy clarifications.
              </p>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full w-fit">
                 <div className="w-2 h-2 rounded-full bg-accent-gold shadow-lg shadow-accent-gold/50" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Typical Reply: &lt; 4 Hours</span>
              </div>
           </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 border border-secondary-ivory">
               <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic mb-8">Raise Support Ticket</h2>
               <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Subject</label>
                     <input 
                       required
                       placeholder="e.g. Payout Delay Inquiry"
                       value={subject}
                       onChange={(e) => setSubject(e.target.value)}
                       className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold text-text-dark outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Detailed Message</label>
                     <textarea 
                       required
                       rows={6}
                       placeholder="Describe your issue in detail..."
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       className="w-full bg-secondary-ivory/30 border-none rounded-[2rem] p-6 text-sm font-medium text-text-dark outline-none resize-none"
                     />
                  </div>
                  <button 
                    disabled={submitting}
                    className="w-full h-16 bg-text-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 flex items-center justify-center gap-3"
                  >
                     {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Ticket</>}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 border border-secondary-ivory">
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic">{selectedTicket.skin_subject}</h2>
                     <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Ticket #{(selectedTicket.skin_id || '').slice(0, 8)}</p>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="w-12 h-12 rounded-full bg-secondary-ivory flex items-center justify-center"><X size={24}/></button>
               </div>

               <div className="space-y-10">
                  <div className="flex gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-secondary-ivory flex-shrink-0 flex items-center justify-center text-text-muted">
                        <MessageSquare size={20} />
                     </div>
                     <div className="p-8 bg-secondary-ivory/30 rounded-[2.5rem] rounded-tl-none border border-secondary-ivory flex-1">
                        <p className="text-sm font-medium text-text-dark leading-relaxed italic">{selectedTicket.skin_message}</p>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-4 italic">Sent on {new Date(selectedTicket.skin_created_at).toLocaleString()}</p>
                     </div>
                  </div>

                  {selectedTicket.skin_admin_reply ? (
                    <div className="flex gap-6 flex-row-reverse">
                       <div className="w-12 h-12 rounded-2xl bg-accent-gold text-white flex-shrink-0 flex items-center justify-center">
                          <CheckCircle2 size={20} />
                       </div>
                       <div className="p-8 bg-accent-gold/5 rounded-[2.5rem] rounded-tr-none border border-accent-gold/20 flex-1">
                          <p className="text-sm font-black text-text-dark uppercase italic mb-2 tracking-tight">Admin Resolution</p>
                          <p className="text-sm font-medium text-text-dark leading-relaxed italic">{selectedTicket.skin_admin_reply}</p>
                          <p className="text-[9px] font-black text-accent-gold uppercase tracking-widest mt-4 italic">Replied on {new Date(selectedTicket.skin_updated_at).toLocaleString()}</p>
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-12 bg-blue-50 border border-blue-100 rounded-[2.5rem]">
                       <div className="text-center">
                          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Awaiting Admin Response...</p>
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
