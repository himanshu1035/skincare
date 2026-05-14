"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  CheckCircle,
  Flag,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

export default function UnifiedSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchAllTickets();
  }, [statusFilter]);

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

  const fetchAllTickets = async () => {
    setLoading(true);
    let query = supabase
      .from('skin_support_tickets')
      .select('*, skin_user_profiles(*)');

    if (statusFilter !== 'all') {
      query = query.eq('skin_status', statusFilter);
    }

    const { data } = await query.order('skin_last_message_at', { ascending: false });
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

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !imageUrl) return;

    const msg = newMessage;
    setNewMessage('');

    const { error } = await supabase
      .from('skin_support_messages')
      .insert({
        skin_ticket_id: selectedTicket.skin_id,
        skin_sender_id: '00000000-0000-0000-0000-000000000000', // Admin ID Placeholder
        skin_sender_type: 'admin',
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

  const updateTicketStatus = async (status: string) => {
    setProcessing(true);
    const { error } = await supabase
      .from('skin_support_tickets')
      .update({ skin_status: status, skin_updated_at: new Date().toISOString() })
      .eq('skin_id', selectedTicket.skin_id);
    
    if (!error) {
      setSelectedTicket({ ...selectedTicket, skin_status: status });
      fetchAllTickets();
    }
    setProcessing(false);
  };

  const filteredTickets = tickets.filter(t => 
    t.skin_subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.skin_user_profiles?.skin_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Resolution Nexus</h1>
           <p className="text-text-muted mt-1 font-medium italic">Advanced multi-channel support orchestration.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                placeholder="Search Subjects or Emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 bg-white border border-secondary-ivory rounded-xl pl-12 pr-6 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-accent-gold transition-all w-64 shadow-sm"
              />
           </div>
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="h-12 bg-white border border-secondary-ivory rounded-xl px-6 text-[11px] font-black uppercase tracking-widest outline-none shadow-sm"
           >
              <option value="all">All Threads</option>
              <option value="pending">Pending</option>
              <option value="open">Open</option>
              <option value="processing">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="finished">Finished</option>
           </select>
        </div>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden">
         {/* Ticket List */}
         <aside className="w-96 bg-white border border-secondary-ivory rounded-[3rem] overflow-hidden flex flex-col shadow-sm">
            <div className="p-6 border-b border-secondary-ivory bg-secondary-ivory/10">
               <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Active Conversations ({filteredTickets.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
               {loading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent-gold" /></div>
               ) : filteredTickets.map(ticket => (
                  <button 
                    key={ticket.skin_id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-6 rounded-[2rem] border transition-all text-left group relative ${
                      selectedTicket?.skin_id === ticket.skin_id 
                        ? 'bg-text-dark text-white border-text-dark shadow-xl' 
                        : 'bg-white border-secondary-ivory hover:border-text-dark/20 hover:shadow-md'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                          selectedTicket?.skin_id === ticket.skin_id 
                            ? 'bg-white/10 text-accent-gold' 
                            : 'bg-secondary-ivory text-text-muted'
                        }`}>
                           {ticket.skin_status}
                        </span>
                        <p className={`text-[8px] font-bold uppercase ${selectedTicket?.skin_id === ticket.skin_id ? 'text-white/40' : 'text-text-muted'}`}>
                           {new Date(ticket.skin_last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                     <h3 className="text-[11px] font-black uppercase tracking-tight line-clamp-1 mb-1">{ticket.skin_subject}</h3>
                     <p className={`text-[9px] font-medium italic ${selectedTicket?.skin_id === ticket.skin_id ? 'text-white/60' : 'text-text-muted'}`}>
                        {ticket.skin_user_profiles?.skin_email || 'Anonymous Partner'}
                     </p>
                  </button>
               ))}
            </div>
         </aside>

         {/* Chat Interface */}
         <main className="flex-1 bg-white border border-secondary-ivory rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl relative">
            {selectedTicket ? (
               <>
                  <header className="p-8 border-b border-secondary-ivory flex items-center justify-between bg-secondary-ivory/10">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-text-dark rounded-2xl flex items-center justify-center text-white font-black text-sm">
                           {selectedTicket.skin_user_profiles?.skin_first_name?.[0] || 'P'}
                        </div>
                        <div>
                           <h2 className="text-lg font-black text-text-dark uppercase italic tracking-tight leading-none">{selectedTicket.skin_subject}</h2>
                           <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                              ID: {selectedTicket.skin_id.slice(0, 8)} · Type: {selectedTicket.skin_type || 'Customer'}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => updateTicketStatus('processing')} className="h-10 px-4 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                           <Clock size={14} /> Processing
                        </button>
                        <button onClick={() => updateTicketStatus('resolved')} className="h-10 px-4 bg-green-50 text-green-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center gap-2">
                           <CheckCircle size={14} /> Resolve
                        </button>
                        <button onClick={() => updateTicketStatus('finished')} className="h-10 px-4 bg-text-dark text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-accent-gold transition-all flex items-center gap-2">
                           <Archive size={14} /> Archive
                        </button>
                     </div>
                  </header>

                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-secondary-ivory/5">
                     <div className="flex justify-center mb-10">
                        <div className="px-6 py-2 bg-white rounded-full border border-secondary-ivory text-[9px] font-black text-text-muted uppercase tracking-[0.2em] shadow-sm">
                           Conversation Initiated on {new Date(selectedTicket.skin_created_at).toLocaleDateString()}
                        </div>
                     </div>

                     {/* First message from ticket subject/body if legacy, or just show history */}
                     <div className="flex gap-4 max-w-[80%]">
                        <div className="w-10 h-10 rounded-xl bg-secondary-ivory flex-shrink-0 flex items-center justify-center text-text-muted"><MessageSquare size={18} /></div>
                        <div className="bg-white p-6 rounded-[2rem] rounded-tl-none border border-secondary-ivory shadow-sm">
                           <p className="text-sm font-medium text-text-dark italic leading-relaxed">{selectedTicket.skin_message}</p>
                        </div>
                     </div>

                     {messages.map((msg, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: msg.skin_sender_type === 'admin' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={msg.skin_id || idx} 
                          className={`flex gap-4 max-w-[80%] ${msg.skin_sender_type === 'admin' ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                           <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.skin_sender_type === 'admin' ? 'bg-accent-gold text-text-dark' : 'bg-secondary-ivory text-text-muted'}`}>
                              {msg.skin_sender_type === 'admin' ? <ShieldCheck size={18} /> : <Users size={18} />}
                           </div>
                           <div className={`p-6 rounded-[2rem] shadow-sm flex flex-col gap-3 ${
                             msg.skin_sender_type === 'admin' 
                               ? 'bg-text-dark text-white rounded-tr-none' 
                               : 'bg-white text-text-dark border border-secondary-ivory rounded-tl-none'
                           }`}>
                              {msg.skin_message && <p className="text-sm font-medium leading-relaxed italic">{msg.skin_message}</p>}
                              {msg.skin_image_url && (
                                <img src={msg.skin_image_url} alt="Attachment" className="rounded-2xl max-w-full h-auto border border-white/10" />
                              )}
                              <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${msg.skin_sender_type === 'admin' ? 'text-white/40 text-right' : 'text-text-muted'}`}>
                                 {new Date(msg.skin_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </motion.div>
                     ))}
                  </div>

                  <footer className="p-8 border-t border-secondary-ivory bg-white">
                     <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-secondary-ivory/30 p-2 rounded-[2.5rem] border border-secondary-ivory/50 focus-within:border-accent-gold transition-all">
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
                          className="w-12 h-12 rounded-full bg-white text-text-muted hover:text-text-dark hover:shadow-md transition-all flex items-center justify-center flex-shrink-0"
                        >
                           {uploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                        </button>
                        <input 
                          placeholder="Type your resolution or response..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium text-text-dark"
                        />
                        <button 
                          type="submit"
                          className="w-12 h-12 rounded-full bg-text-dark text-white hover:bg-accent-gold transition-all flex items-center justify-center flex-shrink-0 shadow-lg"
                        >
                           <Send size={20} />
                        </button>
                     </form>
                  </footer>
               </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
                  <div className="w-24 h-24 bg-secondary-ivory/50 rounded-full flex items-center justify-center text-text-muted mb-8">
                     <MessageSquare size={48} />
                  </div>
                  <h2 className="text-2xl font-black text-text-dark uppercase italic mb-4 tracking-tighter">Support Command Hub</h2>
                  <p className="text-sm font-medium text-text-muted italic max-w-sm">Select a thread from the nexus on the left to begin resolution. You can track history, share attachments, and manage lifecycle.</p>
               </div>
            )}
         </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
