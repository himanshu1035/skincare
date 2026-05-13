"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  Calendar,
  Gift,
  MousePointer2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateCampaignModal from '@/app/admin/campaigns/CreateCampaignModal';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_campaigns')
      .select('*, skin_promotions(*)')
      .order('skin_created_at', { ascending: false });
    
    if (data) setCampaigns(data);
    setLoading(false);
  };

  const toggleCampaignStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('skin_campaigns')
      .update({ skin_is_active: !currentStatus })
      .eq('skin_id', id);
    
    if (!error) {
      setCampaigns(campaigns.map(c => c.skin_id === id ? { ...c, skin_is_active: !currentStatus } : c));
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    const { error } = await supabase.from('skin_campaigns').delete().eq('skin_id', id);
    if (!error) setCampaigns(campaigns.filter(c => c.skin_id !== id));
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.skin_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.skin_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">Campaign Orchestrator</h1>
          <p className="text-text-muted text-xs mt-2 font-medium italic">Build dedicated landing pages and link them to global promotions.</p>
        </div>
        <button 
          onClick={() => { setSelectedCampaign(null); setIsModalOpen(true); }}
          className="px-8 py-4 bg-text-dark text-white rounded-full font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl flex items-center gap-2"
        >
          <Plus size={18} /> Design New Campaign
        </button>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-secondary-ivory shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by campaign title or slug..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-accent-gold outline-none"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-secondary-ivory rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-secondary-ivory bg-secondary-ivory/30">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Campaign & URL</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Linked Offer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Lifecycle</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-ivory">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-accent-gold" /></td></tr>
              ) : filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((camp) => (
                  <tr key={camp.skin_id} className="hover:bg-secondary-ivory/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-text-dark flex items-center justify-center text-white shadow-lg">
                          <MousePointer2 size={18} />
                        </div>
                        <div>
                          <p className="font-black text-text-dark tracking-tight uppercase">{camp.skin_title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-blue-600 font-bold">
                            <ExternalLink size={10} /> /campaign/{camp.skin_slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {camp.skin_promotions ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                          <Gift size={12} /> {camp.skin_promotions.skin_title}
                        </div>
                      ) : (
                        <span className="text-[10px] text-text-muted italic">No linked offer</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-text-dark uppercase tracking-widest">
                        <Calendar size={14} className="text-accent-gold" />
                        {camp.skin_end_date ? new Date(camp.skin_end_date).toLocaleDateString() : 'Permanent'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <button 
                         onClick={() => toggleCampaignStatus(camp.skin_id, camp.skin_is_active)}
                         className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                           camp.skin_is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                         }`}
                       >
                         {camp.skin_is_active ? <><ToggleRight size={14} /> Live</> : <><ToggleLeft size={14} /> Paused</>}
                       </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedCampaign(camp); setIsModalOpen(true); }}
                          className="p-2.5 bg-secondary-ivory/50 rounded-xl text-text-muted hover:text-accent-gold hover:bg-white hover:shadow-md transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteCampaign(camp.skin_id)}
                          className="p-2.5 bg-secondary-ivory/50 rounded-xl text-text-muted hover:text-red-500 hover:bg-white hover:shadow-md transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-text-muted font-bold italic">No campaigns found. Design your first landing page above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CreateCampaignModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          campaign={selectedCampaign}
          onSave={fetchCampaigns}
        />
      )}
    </div>
  );
}
