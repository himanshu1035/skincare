"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  MessageSquare, 
  Plus, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
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

export default function UserSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.skin_id);
      subscribeToMessages(selectedTicket.skin_id);
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchTickets = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('skin_support_tickets')
      .select('*')
      .eq('skin_user_id', session.user.id)
      .eq('skin_type', 'customer')
      .order('skin_last_message_at', { ascending: false });

    if (data) setTickets(data);
    setLoading(false);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from('skin_support_messages')
      .select('*')
      .eq('skin_ticket_id', ticketId)
      .order('skin_created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  const subscribeToMessages = (ticketId: string) => {
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'skin_support_messages',
        filter: `skin_ticket_id=eq.${ticketId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert('Please login to raise a ticket');
      setSubmitting(false);
      return;
    }

    const { data: ticket, error } = await supabase
      .from('skin_support_tickets')
      .insert({
        skin_user_id: session?.user.id,
        skin_subject: subject,
        skin_message: message,
        skin_status: 'pending',
        skin_type: 'customer'
      })
      .select()
      .single();

    if (error) {
      alert('Failed to submit ticket: ' + error.message);
    } else {
      setSubject('');
      setMessage('');
      setIsModalOpen(false);
      fetchTickets();
      setSelectedTicket(ticket);
    }
    setSubmitting(false);
  };

  const handleSendMessage = async (e: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !imageUrl) return;

    const { data: { session } } = await supabase.auth.getSession();
    const msg = newMessage;
    setNewMessage('');

    const { error } = await supabase
      .from('skin_support_messages')
      .insert({
        skin_ticket_id: selectedTicket.skin_id,
        skin_sender_id: session?.user.id,
        skin_sender_type: 'user',
        skin_message: msg,
        skin_image_url: imageUrl
      });

    if (!error) {
      await supabase
        .from('skin_support_tickets')
        .update({ skin_last_message_at: new Date().toISOString() })
        .eq('skin_id', selectedTicket.skin_id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `support/${selectedTicket.skin_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('skin_support_attachments')
      .upload(filePath, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('skin_support_attachments')
        .getPublicUrl(filePath);
      
      await handleSendMessage(null as any, publicUrl);
    }
    setUploading(false);
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="container pt-32 pb-24">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-text-dark uppercase italic leading-none">Support Center</h1>
            <p className="text-text-muted mt-4 text-lg font-medium italic">Professional assistance for all your skincare journey needs.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-16 px-10 rounded-2xl bg-text-dark text-white font-black text-xs tracking-[0.2em] uppercase flex items-center gap-3 hover:bg-accent-gold transition-all shadow-2xl shadow-text-dark/10 group"
          >
            <Plus size={20} /> Raise New Ticket
          </button>
        </header>

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
                    className={`bg-white rounded-[3rem] border p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group ${
                      selectedTicket?.skin_id === ticket.skin_id ? 'border-text-dark ring-2 ring-text-dark/5' : 'border-secondary-ivory'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center gap-6">
                       <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center ${ticket.skin_status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                          <MessageSquare size={28} />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-text-dark uppercase tracking-tight italic">{ticket.skin_subject}</h3>
                          <p className="text-xs text-text-muted font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                             <Clock size={14} /> Last Response: {new Date(ticket.skin_last_message_at).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          ticket.skin_status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                       }`}>
                          {ticket.skin_status}
                       </span>
                       <ChevronRight size={20} className="text-text-muted group-hover:translate-x-2 transition-transform" />
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
                  You haven't raised any support tickets yet. If you have questions about your order, shipping, or products, our team is ready to assist.
                </p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-text-dark rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
               <ShieldCheck className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
               <h3 className="text-2xl font-black uppercase tracking-widest mb-6 italic">Secure & Direct</h3>
               <p className="text-white/60 text-sm font-medium mb-10 leading-relaxed italic">
                  Every ticket is handled by our dedicated dermatological support team. Track your conversation history and share attachments directly.
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

      {/* Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-16 border border-secondary-ivory">
               <h2 className="text-3xl font-black tracking-tighter text-text-dark uppercase italic mb-10 leading-none">New Resolution Thread</h2>
               <form onSubmit={handleCreateTicket} className="space-y-8">
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
                     <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Detailed Inquiry</label>
                     <textarea 
                       required
                       rows={6}
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
               <header className="p-12 border-b border-secondary-ivory flex items-center justify-between bg-secondary-ivory/20">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-text-dark rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                       <MessageSquare size={32} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black tracking-tighter text-text-dark uppercase italic leading-none">{selectedTicket.skin_subject}</h2>
                       <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                          <CheckCircle2 size={14} className={selectedTicket.skin_status === 'resolved' ? 'text-green-500' : 'text-orange-500'} />
                          Status: {selectedTicket.skin_status} · Conversation ID #{(selectedTicket.skin_id || '').slice(0, 8)}
                       </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="w-16 h-16 rounded-full bg-secondary-ivory flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><X size={36}/></button>
               </header>

               <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar bg-secondary-ivory/5">
                  <div className="flex gap-8 max-w-[80%]">
                     <div className="w-14 h-14 rounded-[2rem] bg-secondary-ivory flex-shrink-0 flex items-center justify-center text-text-muted"><User size={28} /></div>
                     <div className="p-10 bg-white rounded-[3rem] rounded-tl-none border border-secondary-ivory shadow-sm">
                        <p className="text-base font-medium text-text-dark leading-relaxed italic">{selectedTicket.skin_message}</p>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-6 italic">Inquiry submitted on {new Date(selectedTicket.skin_created_at).toLocaleString()}</p>
                     </div>
                  </div>

                  {messages.map((msg, idx) => (
                    <motion.div 
                      key={msg.skin_id || idx}
                      initial={{ opacity: 0, x: msg.skin_sender_type === 'admin' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-8 max-w-[80%] ${msg.skin_sender_type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                       <div className={`w-14 h-14 rounded-[2rem] flex-shrink-0 flex items-center justify-center ${msg.skin_sender_type === 'admin' ? 'bg-accent-gold text-text-dark' : 'bg-secondary-ivory text-text-muted'}`}>
                          {msg.skin_sender_type === 'admin' ? <ShieldCheck size={28} /> : <User size={28} />}
                       </div>
                       <div className={`p-10 rounded-[3rem] shadow-sm flex flex-col gap-6 ${
                         msg.skin_sender_type === 'admin' 
                           ? 'bg-secondary-ivory border border-secondary-ivory rounded-tl-none' 
                           : 'bg-text-dark text-white rounded-tr-none'
                       }`}>
                          {msg.skin_message && <p className="text-base font-medium leading-relaxed italic">{msg.skin_message}</p>}
                          {msg.skin_image_url && (
                            <img src={msg.skin_image_url} alt="Attachment" className="rounded-[2.5rem] max-w-full h-auto border border-white/10" />
                          )}
                          <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${msg.skin_sender_type === 'user' ? 'text-white/40 text-right' : 'text-text-muted'}`}>
                             {new Date(msg.skin_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </motion.div>
                  ))}
               </div>

               <footer className="p-12 border-t border-secondary-ivory bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-8 bg-secondary-ivory/30 p-4 rounded-[4rem] border border-secondary-ivory/50 focus-within:border-accent-gold transition-all shadow-inner">
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept="image/*"
                       onChange={handleFileUpload}
                     />
                     <button 
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       disabled={uploading}
                       className="w-16 h-16 rounded-full bg-white text-text-muted hover:text-text-dark hover:shadow-xl transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
                     >
                        {uploading ? <Loader2 className="animate-spin" size={28} /> : <Paperclip size={28} />}
                     </button>
                     <input 
                       placeholder="Share more details or reply to our response..."
                       value={newMessage}
                       onChange={(e) => setNewMessage(e.target.value)}
                       className="flex-1 bg-transparent border-none outline-none px-6 text-base font-medium text-text-dark italic"
                     />
                     <button 
                       type="submit"
                       className="w-16 h-16 rounded-full bg-text-dark text-white hover:bg-accent-gold transition-all flex items-center justify-center flex-shrink-0 shadow-2xl"
                     >
                        <Send size={28} />
                     </button>
                  </form>
               </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
