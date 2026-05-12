"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle2, 
  X, 
  Loader2, 
  Send,
  ArrowRight,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const STATUS_MAP = {
  'pending': { color: 'text-orange-600 bg-orange-50', label: 'Under Review' },
  'processing': { color: 'text-blue-600 bg-blue-50', label: 'Processing' },
  'approved': { color: 'text-green-600 bg-green-50', label: 'Accepted' },
  'rejected': { color: 'text-red-600 bg-red-50', label: 'Rejected' },
  'resolved': { color: 'text-green-700 bg-green-100', label: 'Resolved' },
};

export default function UserSupportPage() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_support_tickets')
      .select('*')
      .eq('skin_user_id', user?.id)
      .order('skin_created_at', { ascending: false });
    
    if (data) setTickets(data);
    setLoading(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    const { data, error } = await supabase
      .from('skin_support_tickets')
      .insert({
        skin_user_id: user.id,
        skin_subject: subject,
        skin_message: message,
        skin_status: 'pending'
      })
      .select()
      .single();
    
    if (!error && data) {
      setTickets([data, ...tickets]);
      setIsCreating(false);
      setSubject('');
      setMessage('');
    } else {
      alert('Error creating ticket: ' + error?.message);
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-secondary-ivory/20">
      <Navbar />
      <div className="pt-40 pb-24">
        <div className="container max-w-4xl">
          <header className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <Link href="/account" className="inline-flex items-center gap-2 text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-4 hover:gap-3 transition-all">
                <ArrowRight className="rotate-180" size={14} /> My Profile
              </Link>
              <h1 className="text-5xl font-black tracking-tighter text-text-dark">Support Center</h1>
              <p className="text-text-muted mt-2 font-medium italic">We're here to help you with your premium skincare journey.</p>
            </div>
            {!isCreating && (
              <button 
                onClick={() => setIsCreating(true)}
                className="px-8 py-4 bg-text-dark text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl flex items-center gap-2"
              >
                <Plus size={18} /> New Ticket
              </button>
            )}
          </header>

          <AnimatePresence mode="wait">
            {isCreating ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[3rem] p-10 shadow-xl border border-secondary-ivory mb-12"
              >
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black tracking-tighter uppercase text-text-dark">Raise a Query</h2>
                  <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-secondary-ivory rounded-full transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">Subject</label>
                    <input 
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Order Delayed, Product Inquiry..."
                      className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">Message</label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      className="w-full h-40 bg-secondary-ivory/50 border-none rounded-[2rem] p-6 text-sm font-medium focus:ring-2 focus:ring-accent-gold outline-none resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 rounded-full bg-text-dark text-white font-black tracking-widest text-xs uppercase hover:bg-accent-gold transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> SUBMIT TICKET</>}
                  </button>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="space-y-6">
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => {
                const status = (STATUS_MAP as any)[ticket.skin_status] || STATUS_MAP.pending;
                return (
                  <div key={ticket.skin_id} className="bg-white rounded-[2.5rem] p-8 border border-secondary-ivory shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${status.color} bg-current/10 flex items-center justify-center`}>
                          <MessageSquare size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-text-dark uppercase tracking-tight">{ticket.skin_subject}</h3>
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Ticket #{ticket.skin_id.slice(0,8)} • {new Date(ticket.skin_created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                    
                    <div className="bg-secondary-ivory/30 p-6 rounded-2xl mb-6">
                       <p className="text-sm font-medium text-text-dark leading-relaxed whitespace-pre-wrap">{ticket.skin_message}</p>
                    </div>

                    {ticket.skin_admin_reply && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-accent-gold/5 p-8 rounded-[2rem] border border-accent-gold/20"
                      >
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-8 h-8 rounded-full bg-accent-gold text-white flex items-center justify-center">
                             <ShieldCheck size={16} />
                           </div>
                           <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em]">Official Response</p>
                        </div>
                        <p className="text-sm font-medium text-text-dark leading-relaxed whitespace-pre-wrap italic">{ticket.skin_admin_reply}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-secondary-ivory">
                <div className="w-20 h-20 bg-secondary-ivory rounded-full flex items-center justify-center text-text-muted mx-auto mb-8">
                  <Headphones size={40} />
                </div>
                <h2 className="text-3xl font-black text-text-dark mb-4">How can we help?</h2>
                <p className="text-text-muted max-w-md mx-auto font-medium mb-10">You haven't raised any tickets yet. If you have any questions about your orders or products, we're here to help.</p>
                <button 
                  onClick={() => setIsCreating(true)}
                  className="px-10 py-4 bg-text-dark text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl"
                >
                  Create Your First Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
