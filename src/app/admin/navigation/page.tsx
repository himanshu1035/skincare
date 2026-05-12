"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Pin, 
  PinOff, 
  Settings,
  Layout,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminNavigationPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skin_collections')
      .select('*')
      .order('skin_name');
    if (data) setCollections(data);
    setLoading(false);
  };

  const togglePin = async (id: string, currentStatus: boolean) => {
    // Limit to 5 pins
    const pinnedCount = collections.filter(c => c.skin_is_pinned).length;
    if (!currentStatus && pinnedCount >= 5) {
      alert("You can only pin up to 5 collections to the top bar.");
      return;
    }

    setUpdating(id);
    const { error } = await supabase
      .from('skin_collections')
      .update({ skin_is_pinned: !currentStatus })
      .eq('skin_id', id);

    if (error) {
      alert("Failed to update navigation: " + error.message);
    } else {
      setCollections(prev => prev.map(c => 
        c.skin_id === id ? { ...c, skin_is_pinned: !currentStatus } : c
      ));
    }
    setUpdating(null);
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-300" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Store Navigation</h1>
        <p className="text-gray-500 text-xs mt-1">Select up to 5 collections to pin to your website's top navigation bar.</p>
      </header>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">All Collections</h2>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Pinned: {collections.filter(c => c.skin_is_pinned).length} / 5
          </span>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Collection Name</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Slug</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {collections.map((col) => (
              <tr key={col.skin_id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Layout size={14} className="text-gray-300" />
                    <span className="text-sm font-bold text-gray-900">{col.skin_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">{col.skin_slug}</code>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => togglePin(col.skin_id, col.skin_is_pinned)}
                    disabled={updating === col.skin_id}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                      col.skin_is_pinned 
                        ? "bg-black text-white" 
                        : "bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black"
                    }`}
                  >
                    {updating === col.skin_id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : col.skin_is_pinned ? (
                      <><PinOff size={14} /> Unpin</>
                    ) : (
                      <><Pin size={14} /> Pin to Nav</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex gap-4">
        <Settings className="text-blue-600 shrink-0" size={20} />
        <div>
          <p className="text-xs font-bold text-blue-900 mb-1 tracking-tight">Navigation Settings</p>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Pinned collections will appear first in the top header. All other collections will be moved to the "All Collections" mega-menu dropdown.
          </p>
        </div>
      </div>
    </div>
  );
}
