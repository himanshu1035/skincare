"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  MessageSquare, 
  Plus, 
  ChevronRight, 
  Clock, 
  Loader2,
  X,
  Send,
  HelpCircle,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportChat } from '@/components/support/SupportChat';
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/support/TicketPriorityBadge';

const CATEGORIES = [
  'Commission issue', 'Coupon issue', 'Marketer issue', 'Technical issue', 'Payment issue', 'Other'
];

export default function MarketerSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState('Medium');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel('marketer-tickets-sync')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'skin_tickets'
      }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('skin_tickets')
      .select('*')
      .eq('skin_user_id', session.user.id)
      .order('skin_last_reply_at', { ascending: false });

    if (data) setTickets(data);
    setLoading(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert('Session expired. Please login again.');
      setSubmitting(false);
      return;
    }

    const { data: ticket, error } = await supabase
      .from('skin_tickets')
      .insert({
        skin_user_id: session?.user.id,
        skin_user_type: 'marketer',
        skin_subject: subject,
        skin_category: category,
        skin_priority: priority,
        skin_status: 'Open'
      })
      .select()
      .single();

    if (error) {
      alert('Failed to create ticket: ' + error.message);
    } else if (ticket) {
      await supabase.from('skin_ticket_messages').insert({
        skin_ticket_id: ticket.skin_id,
        skin_sender_id: session.user.id,
        skin_sender_type: 'user',
        skin_message: message
      });

      setSubject('');
      setMessage('');
      setIsModalOpen(false);
      fetchTickets();
      setSelectedTicket(ticket);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Loading Resolution Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic leading-none">Partner Support</h1>
          <p className="text-text-muted mt-2 font-medium italic">Priority assistance for our affiliate network partners.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 rounded-full bg-text-dark text-white font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-accent-gold transition-all shadow-xl"
        >
          <Plus size={18} /> New Ticket
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {tickets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {tickets.map((ticket) => (
                <motion.div 
                  key={ticket.skin_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white p-6 rounded-[2.5rem] border transition-all cursor-pointer flex items-center justify-between group ${
                    selectedTicket?.skin_id === ticket.skin_id ? 'border-accent-gold ring-4 ring-accent-gold/5' : 'border-secondary-ivory hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-ivory flex items-center justify-center text-text-muted group-hover:bg-accent-gold group-hover:text-white transition-colors">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <TicketStatusBadge status={ticket.skin_status} />
                        <TicketPriorityBadge priority={ticket.skin_priority} />
                        <span className="text-[8px] font-black uppercase text-text-muted">{ticket.skin_category}</span>
                      </div>
                      <h3 className="text-base font-black text-text-dark uppercase tracking-tight italic line-clamp-1">{ticket.skin_subject}</h3>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-secondary-ivory group-hover:translate-x-1 group-hover:text-accent-gold transition-all" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-secondary-ivory border-dashed">
              <HelpCircle className="mx-auto text-secondary-ivory mb-6" size={48} />
              <h3 className="text-xl font-black text-text-dark uppercase italic">No Active Tickets</h3>
              <p className="text-text-muted mt-2 font-medium italic">Our priority support team is ready to help you.</p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
           <div className="bg-text-dark rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-xl">
              <ShieldCheck className="absolute -right-8 -bottom-8 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
              <h3 className="text-xl font-black uppercase tracking-widest mb-4 italic">Priority Lane</h3>
              <p className="text-white/60 text-[11px] font-medium mb-8 leading-relaxed italic">
                Affiliate partners receive priority resolution. Most tickets are handled within 12 hours.
              </p>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-accent-gold">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                Live Network Status: Normal
              </div>
           </div>
        </aside>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl p-10 border border-secondary-ivory">
               <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic mb-8">New Priority Request</h2>
               <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Category</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-14 bg-secondary-ivory/50 border-none rounded-xl px-6 text-xs font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Priority</label>
                        <select 
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full h-14 bg-secondary-ivory/50 border-none rounded-xl px-6 text-xs font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Subject</label>
                     <input 
                       required
                       value={subject}
                       onChange={(e) => setSubject(e.target.value)}
                       className="w-full h-14 bg-secondary-ivory/50 border-none rounded-xl px-6 text-xs font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold"
                       placeholder="Brief summary of your issue"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Message</label>
                     <textarea 
                       required
                       rows={4}
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       className="w-full bg-secondary-ivory/50 border-none rounded-2xl p-6 text-xs font-medium text-text-dark outline-none resize-none focus:ring-2 focus:ring-accent-gold italic"
                       placeholder="Describe your concern in detail..."
                     />
                  </div>
                  <div className="flex gap-3">
                    <button disabled={submitting} className="flex-1 h-14 bg-text-dark text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all shadow-xl">
                       {submitting ? <Loader2 className="animate-spin" /> : "Submit Ticket"}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="h-14 px-8 bg-secondary-ivory text-text-muted rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">Cancel</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Chat Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-4xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-secondary-ivory">
               <header className="p-8 border-b border-secondary-ivory flex items-center justify-between bg-secondary-ivory/20">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-text-dark rounded-2xl flex items-center justify-center text-white">
                        <MessageSquare size={24} />
                     </div>
                     <div>
                        <h2 className="text-xl font-black tracking-tight text-text-dark uppercase italic">{selectedTicket.skin_subject}</h2>
                        <div className="flex items-center gap-2 mt-1">
                           <TicketStatusBadge status={selectedTicket.skin_status} />
                           <span className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">ID: {(selectedTicket.skin_id || '').slice(0, 8)}</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X size={20}/></button>
               </header>
               <div className="flex-1 overflow-hidden">
                  <SupportChat ticketId={selectedTicket.skin_id} currentUserRole="user" />
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
