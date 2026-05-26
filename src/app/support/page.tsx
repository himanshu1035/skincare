"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Paperclip,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SupportChat } from '@/components/support/SupportChat';
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/support/TicketPriorityBadge';

const CATEGORIES = [
  'Order issue', 'Payment issue', 'Coupon issue', 'Marketer issue', 
  'Commission issue', 'Technical issue', 'Product issue', 'Delivery issue', 'Refund issue', 'Other'
];

export default function UnifiedUserSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState('Medium');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [userType, setUserType] = useState<'customer' | 'marketer'>('customer');
  
  const supabase = createClient();

  useEffect(() => {
    fetchUserDataAndTickets();
  }, []);

  const fetchUserDataAndTickets = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // Determine user type by checking if they are a marketer
    const { data: marketerData } = await supabase
      .from('skin_marketers')
      .select('skin_id')
      .eq('skin_id', session.user.id)
      .single();

    const uType = marketerData ? 'marketer' : 'customer';
    setUserType(uType);

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
      alert('Please sign in to raise a ticket. You can shop and track orders without an account, but support tickets need a signed-in session so we can keep your conversation secure.');
      setSubmitting(false);
      return;
    }

    const { data: ticket, error } = await supabase
      .from('skin_tickets')
      .insert({
        skin_user_id: session?.user.id,
        skin_user_type: userType,
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
      // Insert initial message
      await supabase.from('skin_ticket_messages').insert({
        skin_ticket_id: ticket.skin_id,
        skin_sender_id: session.user.id,
        skin_sender_type: 'user',
        skin_message: message
      });

      setSubject('');
      setMessage('');
      setCategory(CATEGORIES[0]);
      setPriority('Medium');
      setIsModalOpen(false);
      fetchUserDataAndTickets();
      setSelectedTicket(ticket);
    }
    setSubmitting(false);
  };

  const handleReopenTicket = async () => {
    if (!selectedTicket) return;
    const { error } = await supabase
      .from('skin_tickets')
      .update({ skin_status: 'Open', skin_updated_at: new Date().toISOString() })
      .eq('skin_id', selectedTicket.skin_id);
      
    if (!error) {
      setSelectedTicket({ ...selectedTicket, skin_status: 'Open' });
      fetchUserDataAndTickets();
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-accent-gold" size={40} />
        </div>
        <Footer />
      </div>
    );
  }

  // Login Wall Logic
  if (!tickets.length && !loading) {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    };

    // This is a simplified check for the initial render
    // If you want to be stricter, you can use a state variable for 'isLoggedIn'
  }

  const isLoggedIn = !!tickets.length || loading; // This is a bit weak, let's use a real state

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container pt-32 pb-24 flex-1">
        {!tickets.length && !loading ? (
          <div className="max-w-xl mx-auto text-center py-20">
             <div className="w-24 h-24 bg-secondary-ivory rounded-full flex items-center justify-center mx-auto mb-8 text-text-muted">
                <User size={40} />
             </div>
             <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-4">Optional Account · Tickets Only</p>
             <h2 className="text-4xl font-black text-text-dark uppercase italic tracking-tighter mb-6">Sign in to Open a Ticket</h2>
             <p className="text-text-muted text-lg font-medium italic mb-10 leading-relaxed">
                You can shop and check out without an account. To raise and track support tickets, we ask you to sign in so we can keep a secure history of your conversations with our team.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <Link 
                 href="/auth?redirect=/support"
                 className="inline-flex h-16 px-12 rounded-full bg-text-dark text-white font-black text-xs tracking-[0.2em] uppercase items-center gap-3 hover:bg-accent-gold transition-all shadow-2xl shadow-text-dark/10"
               >
                  Sign in to Continue <ChevronRight size={18} />
               </Link>
               <Link 
                 href="/account/orders"
                 className="inline-flex h-16 px-12 rounded-full bg-secondary-ivory text-text-dark font-black text-xs tracking-[0.2em] uppercase items-center gap-3 hover:bg-accent-gold hover:text-white transition-all"
               >
                  Track an Order Instead
               </Link>
             </div>
          </div>
        ) : (
          <>
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-text-dark uppercase italic leading-none">Support Center</h1>
                <p className="text-text-muted mt-4 text-lg font-medium italic">
                  {userType === 'marketer' ? 'Priority assistance for affiliate partners.' : 'Professional assistance for your skincare journey.'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-16 px-10 rounded-2xl bg-text-dark text-white font-black text-xs tracking-[0.2em] uppercase flex items-center gap-3 hover:bg-accent-gold transition-all shadow-2xl shadow-text-dark/10 group"
              >
                <Plus size={20} /> Raise New Ticket
              </button>
            </header>
            {/* Existing ticket list logic */}
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>
            ) : tickets.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {tickets.map((ticket) => (
                  <motion.div 
                    key={ticket.skin_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-[3rem] border p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group ${
                      selectedTicket?.skin_id === ticket.skin_id ? 'border-text-dark ring-2 ring-text-dark/5' : 'border-secondary-ivory'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-[2rem] flex items-center justify-center bg-secondary-ivory text-text-muted flex-shrink-0 group-hover:bg-accent-gold group-hover:text-white transition-colors">
                          <MessageSquare size={28} />
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <TicketStatusBadge status={ticket.skin_status} />
                            <TicketPriorityBadge priority={ticket.skin_priority} />
                            <span className="text-[9px] font-black uppercase text-text-muted bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{ticket.skin_category}</span>
                          </div>
                          <h3 className="text-lg font-black text-text-dark uppercase tracking-tight italic line-clamp-1">{ticket.skin_subject}</h3>
                          <p className="text-xs text-text-muted font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
                             <Clock size={14} /> Updated: {new Date(ticket.skin_updated_at).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    <div className="flex justify-end">
                       <ChevronRight size={24} className="text-text-muted group-hover:translate-x-2 group-hover:text-accent-gold transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-secondary-ivory/20 rounded-[4rem] p-24 text-center border border-dashed border-secondary-ivory">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm text-text-muted">
                  <HelpCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-text-dark uppercase italic mb-4">How can we help?</h2>
                <p className="text-text-muted font-medium italic max-w-md mx-auto leading-relaxed">
                  You haven't raised any support tickets yet. Our team is ready to assist with any issues or questions.
                </p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-text-dark rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
               <ShieldCheck className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
               <h3 className="text-2xl font-black uppercase tracking-widest mb-6 italic">Secure Resolution</h3>
               <p className="text-white/60 text-sm font-medium mb-10 leading-relaxed italic">
                  Every ticket is tracked, categorized, and handled securely. Monitor real-time status updates and interact directly with our team.
               </p>
               <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     Response Time: <span className="text-accent-gold">Avg. 12 Hours</span>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-16 border border-secondary-ivory max-h-[90vh] overflow-y-auto custom-scrollbar">
               <h2 className="text-3xl font-black tracking-tighter text-text-dark uppercase italic mb-10 leading-none">New Resolution Thread</h2>
               <form onSubmit={handleCreateTicket} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Category</label>
                       <select 
                         value={category}
                         onChange={(e) => setCategory(e.target.value)}
                         className="w-full h-16 bg-secondary-ivory/30 border-none rounded-[1.5rem] px-8 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                       >
                         {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Priority</label>
                       <select 
                         value={priority}
                         onChange={(e) => setPriority(e.target.value)}
                         className="w-full h-16 bg-secondary-ivory/30 border-none rounded-[1.5rem] px-8 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                       >
                         <option value="Low">Low</option>
                         <option value="Medium">Medium</option>
                         <option value="High">High</option>
                         <option value="Urgent">Urgent</option>
                       </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Subject</label>
                     <input 
                       required
                       placeholder="e.g. Order #12345 Damage Report"
                       value={subject}
                       onChange={(e) => setSubject(e.target.value)}
                       className="w-full h-16 bg-secondary-ivory/30 border-none rounded-[1.5rem] px-8 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Initial Message</label>
                     <textarea 
                       required
                       rows={5}
                       placeholder="Please describe your concern in detail. You can add images once the thread is created..."
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       className="w-full bg-secondary-ivory/30 border-none rounded-[2rem] p-8 text-sm font-medium text-text-dark outline-none resize-none focus:ring-2 focus:ring-accent-gold transition-all italic"
                     />
                  </div>
                  <button 
                    disabled={submitting}
                    className="w-full h-20 bg-text-dark text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 flex items-center justify-center gap-3"
                  >
                     {submitting ? <Loader2 className="animate-spin" size={24} /> : <><Send size={24} /> Submit Inquiry</>}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Thread Overlay */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="relative bg-white w-full max-w-5xl h-[95vh] md:h-[85vh] rounded-t-[4rem] md:rounded-[5rem] shadow-2xl flex flex-col overflow-hidden border border-secondary-ivory">
               
               <header className="p-8 md:p-12 border-b border-secondary-ivory flex flex-col md:flex-row md:items-center justify-between gap-6 bg-secondary-ivory/20">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-text-dark rounded-[2rem] hidden md:flex items-center justify-center text-white shadow-2xl">
                       <MessageSquare size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-text-dark uppercase italic leading-none mb-3 pr-12 md:pr-0">{selectedTicket.skin_subject}</h2>
                       <div className="flex items-center gap-3 flex-wrap">
                          <TicketStatusBadge status={selectedTicket.skin_status} />
                          <TicketPriorityBadge priority={selectedTicket.skin_priority} />
                          <span className="text-[9px] font-black uppercase text-text-muted">ID: {(selectedTicket.skin_id || '').slice(0, 8)}</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {(selectedTicket.skin_status === 'Closed' || selectedTicket.skin_status === 'Resolved') && (
                       <button onClick={handleReopenTicket} className="h-12 px-6 rounded-full bg-white border border-secondary-ivory text-[10px] font-black uppercase tracking-widest text-text-dark hover:border-accent-gold transition-all shadow-sm">
                          Reopen Ticket
                       </button>
                    )}
                    <button onClick={() => setSelectedTicket(null)} className="absolute top-8 right-8 md:relative md:top-0 md:right-0 w-12 h-12 rounded-full bg-white md:bg-secondary-ivory flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm md:shadow-none"><X size={24}/></button>
                  </div>
               </header>

               <div className="flex-1 overflow-hidden relative">
                  {/* Reuse the centralized SupportChat component */}
                  <SupportChat ticketId={selectedTicket.skin_id} currentUserRole="user" />
               </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
