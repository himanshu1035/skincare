"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  HelpCircle,
  Paperclip,
  ShieldCheck,
  Smartphone,
  CheckCircle
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
    if (!session) return;

    // We check both tables for compatibility, but we prefer skin_support_tickets for the new system
    const { data } = await supabase
      .from('skin_support_tickets')
      .select('*')
      .eq('skin_user_id', session.user.id)
      .eq('skin_type', 'marketer')
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
    
    const { data: ticket, error } = await supabase
      .from('skin_support_tickets')
      .insert({
        skin_user_id: session?.user.id,
        skin_subject: subject,
        skin_message: message,
        skin_status: 'pending',
        skin_type: 'marketer'
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
           <p className="text-text-muted mt-2 font-medium italic">High-priority assistance for your affiliate operations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-10 rounded-full bg-text-dark text-white font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 group"
        >
          <Plus size={18} /> Raise New Inquiry
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           {tickets.length > 0 ? tickets.map((ticket) => (
              <motion.div 
                key={ticket.skin_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-[2.5rem] border shadow-sm overflow-hidden hover:shadow-xl transition-all cursor-pointer group ${
                  selectedTicket?.skin_id === ticket.skin_id ? 'border-text-dark ring-2 ring-text-dark/5' : 'border-secondary-ivory'
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                 <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${ticket.skin_status === 'pending' ? 'bg-accent-gold/10 text-accent-gold' : 'bg-green-50 text-green-600'}`}>
                          <MessageSquare size={24} />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-text-dark uppercase tracking-tight italic">{ticket.skin_subject}</h3>
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                             <Clock size={12} /> Last active: {new Date(ticket.skin_last_message_at).toLocaleString()}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          ticket.skin_status === 'pending' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
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
              <h3 className="text-2xl font-black uppercase tracking-widest mb-4 italic">Priority Lane</h3>
              <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed italic">
                 Marketers receive priority support for financial and campaign-related queries. Expect a response within 4 hours.
              </p>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full w-fit">
                 <ShieldCheck className="text-accent-gold" size={16} />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Affiliate Status: Gold</span>
              </div>
           </div>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 border border-secondary-ivory">
               <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic mb-8 leading-none">Initiate Support Inquiry</h2>
               <form onSubmit={handleCreateTicket} className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Inquiry Subject</label>
                     <input 
                       required
                       placeholder="e.g. Withdrawal Verification Issue"
                       value={subject}
                       onChange={(e) => setSubject(e.target.value)}
                       className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Context & Details</label>
                     <textarea 
                       required
                       rows={6}
                       placeholder="Provide as much detail as possible to help us resolve your issue quickly..."
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       className="w-full bg-secondary-ivory/30 border-none rounded-[2rem] p-8 text-sm font-medium text-text-dark outline-none resize-none focus:ring-2 focus:ring-accent-gold transition-all italic"
                     />
                  </div>
                  <button 
                    disabled={submitting}
                    className="w-full h-18 bg-text-dark text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all shadow-xl shadow-text-dark/10 flex items-center justify-center gap-3"
                  >
                     {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit for Review</>}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat History Overlay */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-black/60 backdrop-blur-lg" />
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="relative bg-white w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-t-[3rem] md:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-secondary-ivory">
               <header className="p-10 border-b border-secondary-ivory flex items-center justify-between bg-secondary-ivory/10">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-text-dark rounded-2xl flex items-center justify-center text-white shadow-xl">
                       <LifeBuoy size={28} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic leading-none">{selectedTicket.skin_subject}</h2>
                       <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                          <CheckCircle2 size={12} className={selectedTicket.skin_status === 'resolved' ? 'text-green-500' : 'text-blue-500'} />
                          Status: {selectedTicket.skin_status} · Ticket #{(selectedTicket.skin_id || '').slice(0, 8)}
                       </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="w-14 h-14 rounded-full bg-secondary-ivory flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><X size={32}/></button>
               </header>

               <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar bg-secondary-ivory/5">
                  <div className="flex gap-6 max-w-[85%]">
                     <div className="w-12 h-12 rounded-2xl bg-secondary-ivory flex-shrink-0 flex items-center justify-center text-text-muted"><Smartphone size={24} /></div>
                     <div className="p-8 bg-white rounded-[2.5rem] rounded-tl-none border border-secondary-ivory shadow-sm">
                        <p className="text-sm font-medium text-text-dark leading-relaxed italic">{selectedTicket.skin_message}</p>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-4 italic">Sent on {new Date(selectedTicket.skin_created_at).toLocaleString()}</p>
                     </div>
                  </div>

                  {messages.map((msg, idx) => (
                    <motion.div 
                      key={msg.skin_id || idx}
                      initial={{ opacity: 0, x: msg.skin_sender_type === 'admin' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-6 max-w-[85%] ${msg.skin_sender_type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                       <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${msg.skin_sender_type === 'admin' ? 'bg-accent-gold text-text-dark' : 'bg-secondary-ivory text-text-muted'}`}>
                          {msg.skin_sender_type === 'admin' ? <CheckCircle size={24} /> : <Smartphone size={24} />}
                       </div>
                       <div className={`p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-4 ${
                         msg.skin_sender_type === 'admin' 
                           ? 'bg-secondary-ivory border border-secondary-ivory rounded-tl-none' 
                           : 'bg-text-dark text-white rounded-tr-none'
                       }`}>
                          {msg.skin_message && <p className="text-sm font-medium leading-relaxed italic">{msg.skin_message}</p>}
                          {msg.skin_image_url && (
                            <img src={msg.skin_image_url} alt="Attachment" className="rounded-2xl max-w-full h-auto border border-white/10" />
                          )}
                          <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${msg.skin_sender_type === 'user' ? 'text-white/40 text-right' : 'text-text-muted'}`}>
                             {new Date(msg.skin_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </motion.div>
                  ))}
               </div>

               <footer className="p-10 border-t border-secondary-ivory bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-6 bg-secondary-ivory/30 p-3 rounded-[3rem] border border-secondary-ivory/50 focus-within:border-accent-gold transition-all shadow-inner">
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
                       className="w-14 h-14 rounded-full bg-white text-text-muted hover:text-text-dark hover:shadow-lg transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
                     >
                        {uploading ? <Loader2 className="animate-spin" size={24} /> : <Paperclip size={24} />}
                     </button>
                     <input 
                       placeholder="Reply to this resolution thread..."
                       value={newMessage}
                       onChange={(e) => setNewMessage(e.target.value)}
                       className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-medium text-text-dark italic"
                     />
                     <button 
                       type="submit"
                       className="w-14 h-14 rounded-full bg-text-dark text-white hover:bg-accent-gold transition-all flex items-center justify-center flex-shrink-0 shadow-xl"
                     >
                        <Send size={24} />
                     </button>
                  </form>
               </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
