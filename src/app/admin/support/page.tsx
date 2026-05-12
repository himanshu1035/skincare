"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  User, 
  Send, 
  X, 
  Loader2, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  'pending': { color: 'text-orange-600 bg-orange-50', icon: <Clock size={14} /> },
  'processing': { color: 'text-blue-600 bg-blue-50', icon: <Loader2 size={14} className="animate-spin" /> },
  'approved': { color: 'text-green-600 bg-green-50', icon: <CheckCircle2 size={14} /> },
  'rejected': { color: 'text-red-600 bg-red-50', icon: <X size={14} /> },
  'resolved': { color: 'text-green-700 bg-green-100', icon: <CheckCircle2 size={14} /> },
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_support_tickets')
      .select(`
        *,
        skin_user_profiles!inner (
          skin_first_name,
          skin_last_name,
          skin_email
        )
      `)
      .order('skin_created_at', { ascending: false });
    
    if (data) setTickets(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    const { error } = await supabase
      .from('skin_support_tickets')
      .update({ skin_status: newStatus, skin_updated_at: new Date().toISOString() })
      .eq('skin_id', ticketId);
    
    if (!error) {
      setTickets(tickets.map(t => t.skin_id === ticketId ? { ...t, skin_status: newStatus } : t));
      if (selectedTicket?.skin_id === ticketId) {
        setSelectedTicket({ ...selectedTicket, skin_status: newStatus });
      }
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    setIsReplying(true);
    
    const { error } = await supabase
      .from('skin_support_tickets')
      .update({ 
        skin_admin_reply: reply,
        skin_status: 'resolved',
        skin_updated_at: new Date().toISOString() 
      })
      .eq('skin_id', selectedTicket.skin_id);
    
    if (!error) {
      setTickets(tickets.map(t => t.skin_id === selectedTicket.skin_id ? { ...t, skin_admin_reply: reply, skin_status: 'resolved' } : t));
      setSelectedTicket({ ...selectedTicket, skin_admin_reply: reply, skin_status: 'resolved' });
      setReply('');
    } else {
      alert('Error sending reply: ' + error.message);
    }
    setIsReplying(false);
  };

  const filteredTickets = tickets.filter(t => {
    const fullName = `${t.skin_user_profiles.skin_first_name} ${t.skin_user_profiles.skin_last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || t.skin_subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.skin_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">Support Center</h1>
        <p className="text-text-muted text-xs mt-2 font-medium italic">Manage customer inquiries and provide premium assistance.</p>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-secondary-ivory shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by customer name or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-accent-gold outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-text-muted" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 bg-secondary-ivory/50 border-none rounded-xl px-6 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-accent-gold outline-none cursor-pointer"
          >
            <option value="all">ALL TICKETS</option>
            {Object.keys(STATUS_CONFIG).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tickets List */}
        <div className="lg:col-span-5 space-y-4">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-accent-gold" /></div>
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div 
                key={ticket.skin_id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${
                  selectedTicket?.skin_id === ticket.skin_id 
                    ? 'bg-accent-gold/5 border-accent-gold shadow-md' 
                    : 'bg-white border-secondary-ivory hover:border-text-muted'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${(STATUS_CONFIG as any)[ticket.skin_status].color}`}>
                    {ticket.skin_status.replace(/_/g, ' ')}
                  </div>
                  <p className="text-[10px] text-text-muted font-bold">{new Date(ticket.skin_created_at).toLocaleDateString()}</p>
                </div>
                <h3 className="text-sm font-black text-text-dark mb-2 uppercase tracking-tight">{ticket.skin_subject}</h3>
                <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed">{ticket.skin_message}</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-text-dark flex items-center justify-center text-white text-[10px]">
                    <User size={12} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-dark">
                    {ticket.skin_user_profiles.skin_first_name} {ticket.skin_user_profiles.skin_last_name}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-secondary-ivory">
              <p className="text-text-muted text-sm font-bold">No tickets found.</p>
            </div>
          )}
        </div>

        {/* Ticket Detail & Reply */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div 
                key={selectedTicket.skin_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm p-10 lg:sticky lg:top-8"
              >
                <header className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-text-dark tracking-tighter uppercase mb-2">{selectedTicket.skin_subject}</h2>
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-bold text-text-muted flex items-center gap-2">
                         <User size={14} /> {selectedTicket.skin_user_profiles.skin_first_name} {selectedTicket.skin_user_profiles.skin_last_name}
                       </span>
                       <span className="text-xs font-bold text-text-muted">• {selectedTicket.skin_user_profiles.skin_email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <select 
                      value={selectedTicket.skin_status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.skin_id, e.target.value)}
                      className={`appearance-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none outline-none ${(STATUS_CONFIG as any)[selectedTicket.skin_status].color}`}
                    >
                      {Object.keys(STATUS_CONFIG).map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Ticket #{selectedTicket.skin_id.slice(0,8)}</p>
                  </div>
                </header>

                <div className="space-y-10">
                  <div className="bg-secondary-ivory/30 p-8 rounded-[2rem] border border-secondary-ivory">
                    <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-4">Customer Message</p>
                    <p className="text-sm font-medium text-text-dark leading-relaxed whitespace-pre-wrap">{selectedTicket.skin_message}</p>
                  </div>

                  {selectedTicket.skin_admin_reply && (
                    <div className="bg-accent-gold/5 p-8 rounded-[2rem] border border-accent-gold/20">
                      <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] mb-4">Your Response</p>
                      <p className="text-sm font-medium text-text-dark leading-relaxed whitespace-pre-wrap">{selectedTicket.skin_admin_reply}</p>
                    </div>
                  )}

                  {!selectedTicket.skin_admin_reply && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Send Response</p>
                      <textarea 
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Write your professional response here..."
                        className="w-full h-40 bg-secondary-ivory/50 border-none rounded-[2rem] p-6 text-sm font-medium focus:ring-2 focus:ring-accent-gold outline-none resize-none"
                      />
                      <button 
                        onClick={handleSendReply}
                        disabled={isReplying || !reply.trim()}
                        className="w-full h-16 rounded-full bg-text-dark text-white font-black tracking-widest text-xs uppercase hover:bg-accent-gold transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {isReplying ? <Loader2 className="animate-spin" /> : <><Send size={18} /> SEND RESOLUTION</>}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-secondary-ivory text-center p-10">
                <div className="w-20 h-20 bg-secondary-ivory rounded-full flex items-center justify-center text-text-muted mb-8">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-2xl font-black text-text-dark mb-2">No Ticket Selected</h3>
                <p className="text-text-muted font-medium max-w-xs">Select a customer inquiry from the left to start responding.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
