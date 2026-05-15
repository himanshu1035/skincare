"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  MessageSquare, 
  Search,
  Filter,
  Loader2,
  X,
  ShieldCheck,
  User,
  Clock,
  CheckCircle,
  Archive,
  BarChart3,
  Users,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportChat } from '@/components/support/SupportChat';
import { TicketStatusBadge } from '@/components/support/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/support/TicketPriorityBadge';

const CATEGORIES = [
  'All Categories', 'Order issue', 'Payment issue', 'Coupon issue', 'Marketer issue', 
  'Commission issue', 'Technical issue', 'Product issue', 'Delivery issue', 'Refund issue', 'Other'
];

export default function AdminTicketsPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    escalated: 0,
    avgResponseTime: '2h 15m' // Mocked for now, difficult to calculate precisely without tracking first reply time
  });

  const supabase = createClient();

  useEffect(() => {
    fetchAllTickets();
    
    // Realtime subscription for ticket list updates
    const channel = supabase
      .channel('admin-tickets-sync')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'skin_tickets' 
      }, () => {
        fetchAllTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllTickets = async () => {
    setLoading(true);
    
    // Fetch tickets and join with users to get emails. Note: in Supabase, joining auth.users is restricted. 
    // Usually we join with a profile table like skin_user_profiles or skin_marketers.
    // Since this is an admin dashboard, we fetch the tickets and try to correlate if possible, 
    // or we just show the user ID if the join fails.
    
    const { data: ticketsData, error } = await supabase
      .from('skin_tickets')
      .select('*')
      .order('skin_updated_at', { ascending: false });

    if (ticketsData) {
      setTickets(ticketsData);
      
      // Calculate stats
      const total = ticketsData.length;
      const open = ticketsData.filter(t => t.skin_status === 'Open' || t.skin_status === 'Pending').length;
      const resolved = ticketsData.filter(t => t.skin_status === 'Resolved' || t.skin_status === 'Closed').length;
      const escalated = ticketsData.filter(t => t.skin_status === 'Escalated').length;
      
      setStats({
        ...stats,
        total,
        open,
        resolved,
        escalated
      });
    }
    setLoading(false);
  };

  const updateTicketStatus = async (status: string) => {
    if (!selectedTicket) return;
    
    const { error } = await supabase
      .from('skin_tickets')
      .update({ skin_status: status, skin_updated_at: new Date().toISOString() })
      .eq('skin_id', selectedTicket.skin_id);
      
    if (!error) {
      setSelectedTicket({ ...selectedTicket, skin_status: status });
      fetchAllTickets(); // Refresh background list
    }
  };

  const updateTicketPriority = async (priority: string) => {
    if (!selectedTicket) return;
    
    const { error } = await supabase
      .from('skin_tickets')
      .update({ skin_priority: priority, skin_updated_at: new Date().toISOString() })
      .eq('skin_id', selectedTicket.skin_id);
      
    if (!error) {
      setSelectedTicket({ ...selectedTicket, skin_priority: priority });
      fetchAllTickets();
    }
  };

  // Filter Logic
  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.skin_subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.skin_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.skin_status === statusFilter;
    const matchCategory = categoryFilter === 'All Categories' || t.skin_category === categoryFilter;
    const matchType = userTypeFilter === 'All' || t.skin_user_type === userTypeFilter.toLowerCase();
    const matchPriority = priorityFilter === 'All' || t.skin_priority === priorityFilter;

    return matchSearch && matchStatus && matchCategory && matchType && matchPriority;
  });

  if (loading && tickets.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Synchronizing Enterprise Support...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto px-4 md:px-8 pt-8">
      
      {/* Header & Analytics */}
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Support Command</h1>
            <p className="text-text-muted mt-2 font-medium italic">Enterprise-level ticket management & resolution nexus.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={fetchAllTickets} className="h-12 px-6 bg-white border border-secondary-ivory rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-accent-gold transition-all shadow-sm">
                Refresh Data
             </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: 'Total Tickets', value: stats.total, icon: BarChart3, color: 'text-blue-500' },
            { label: 'Requires Action', value: stats.open, icon: Clock, color: 'text-orange-500' },
            { label: 'Escalated', value: stats.escalated, icon: AlertCircle, color: 'text-red-500' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Avg Response', value: stats.avgResponseTime, icon: MessageSquare, color: 'text-purple-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-secondary-ivory shadow-sm flex items-center justify-between group hover:border-accent-gold/30 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-text-dark tracking-tighter">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-secondary-ivory/50 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="bg-white border border-secondary-ivory rounded-[3rem] shadow-sm overflow-hidden flex flex-col">
        
        {/* Advanced Filters */}
        <div className="p-6 border-b border-secondary-ivory bg-secondary-ivory/10 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              placeholder="Search Subject or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 h-12 bg-white border border-secondary-ivory rounded-xl pl-12 pr-6 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-accent-gold transition-all shadow-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-text-muted" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Filters:</span>
            </div>
            
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-12 bg-white border border-secondary-ivory rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm">
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Resolved">Resolved</option>
              <option value="Declined">Declined</option>
              <option value="Closed">Closed</option>
              <option value="Escalated">Escalated</option>
            </select>

            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="h-12 bg-white border border-secondary-ivory rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm">
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>

            <select value={userTypeFilter} onChange={e => setUserTypeFilter(e.target.value)} className="h-12 bg-white border border-secondary-ivory rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm">
              <option value="All">All Roles</option>
              <option value="Customer">Customer</option>
              <option value="Marketer">Marketer</option>
            </select>

            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-12 bg-white border border-secondary-ivory rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-ivory/5 border-b border-secondary-ivory text-[10px] font-black uppercase tracking-widest text-text-muted">
                <th className="p-6 whitespace-nowrap">Ticket Details</th>
                <th className="p-6">Role</th>
                <th className="p-6">Category</th>
                <th className="p-6">Status</th>
                <th className="p-6">Priority</th>
                <th className="p-6">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr 
                  key={ticket.skin_id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="border-b border-secondary-ivory/50 hover:bg-secondary-ivory/10 transition-colors cursor-pointer group"
                >
                  <td className="p-6">
                    <p className="text-sm font-black text-text-dark uppercase tracking-tight italic group-hover:text-accent-gold transition-colors">{ticket.skin_subject}</p>
                    <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase mt-1">ID: {ticket.skin_id.slice(0, 8)}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                      ticket.skin_user_type === 'marketer' ? 'bg-accent-gold text-text-dark' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {ticket.skin_user_type === 'marketer' ? 'Partner' : 'Customer'}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-text-dark bg-gray-50 px-3 py-1 rounded border border-gray-100">{ticket.skin_category}</span>
                  </td>
                  <td className="p-6">
                    <TicketStatusBadge status={ticket.skin_status} />
                  </td>
                  <td className="p-6">
                    <TicketPriorityBadge priority={ticket.skin_priority} />
                  </td>
                  <td className="p-6">
                    <p className="text-[10px] font-black text-text-muted tracking-widest uppercase">
                      {new Date(ticket.skin_updated_at).toLocaleDateString()}
                    </p>
                    <p className="text-[9px] font-medium text-text-muted italic">
                      {new Date(ticket.skin_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-muted font-medium italic">
                    No tickets found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Resolution Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-6xl h-[95vh] rounded-[3rem] shadow-2xl border border-secondary-ivory flex flex-col overflow-hidden">
               
               {/* Modal Header */}
               <header className="p-8 border-b border-secondary-ivory flex flex-col md:flex-row md:items-center justify-between gap-6 bg-secondary-ivory/10">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-text-dark rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                       <ShieldCheck size={28} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black tracking-tighter text-text-dark uppercase italic leading-none mb-2 pr-12 md:pr-0">
                         {selectedTicket.skin_subject}
                       </h2>
                       <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            selectedTicket.skin_user_type === 'marketer' ? 'bg-accent-gold text-text-dark' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {selectedTicket.skin_user_type === 'marketer' ? 'Partner Ticket' : 'Customer Ticket'}
                          </span>
                          <span className="text-[9px] font-black uppercase text-text-muted bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{selectedTicket.skin_category}</span>
                          <span className="text-[9px] font-black uppercase text-text-muted">ID: {(selectedTicket.skin_id || '').slice(0, 8)}</span>
                       </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="absolute top-8 right-8 md:relative md:top-0 md:right-0 w-12 h-12 rounded-full bg-white border border-secondary-ivory flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"><X size={24}/></button>
               </header>

               <div className="flex flex-1 overflow-hidden">
                  {/* Left Side: Chat Interface */}
                  <div className="flex-1 border-r border-secondary-ivory relative">
                    <SupportChat ticketId={selectedTicket.skin_id} currentUserRole="admin" />
                  </div>

                  {/* Right Side: Admin Controls */}
                  <aside className="w-80 bg-secondary-ivory/10 p-8 overflow-y-auto space-y-10 custom-scrollbar">
                    
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                        <Archive size={14} /> Update Status
                      </h4>
                      <select 
                        value={selectedTicket.skin_status}
                        onChange={(e) => updateTicketStatus(e.target.value)}
                        className="w-full h-12 bg-white border border-secondary-ivory rounded-xl px-4 text-xs font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all shadow-sm"
                      >
                        <option value="Open">Open</option>
                        <option value="Pending">Pending (Waiting on user)</option>
                        <option value="Processing">Processing</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Declined">Declined</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                        <AlertCircle size={14} /> Update Priority
                      </h4>
                      <select 
                        value={selectedTicket.skin_priority}
                        onChange={(e) => updateTicketPriority(e.target.value)}
                        className="w-full h-12 bg-white border border-secondary-ivory rounded-xl px-4 text-xs font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all shadow-sm"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                        <User size={14} /> User Details
                      </h4>
                      <div className="bg-white p-4 rounded-2xl border border-secondary-ivory shadow-sm space-y-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">User ID</p>
                        <p className="text-xs font-medium truncate italic" title={selectedTicket.skin_user_id}>{selectedTicket.skin_user_id}</p>
                        <div className="h-px bg-secondary-ivory my-2"></div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Account Type</p>
                        <p className="text-xs font-black uppercase tracking-tight text-text-dark">{selectedTicket.skin_user_type}</p>
                      </div>
                    </div>

                  </aside>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
