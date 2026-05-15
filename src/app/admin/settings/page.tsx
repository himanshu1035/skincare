"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Save, Loader2, Settings as SettingsIcon, Truck, Banknote, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    shipping_price: '0',
    cod_handling_price: '0',
    prepay_handling_for_cod: 'no',
    cod_available: 'yes',
    free_shipping_threshold: '1000',
    announcement_text: 'FREE SHIPPING ON ORDERS OVER ₹1000',
    upi_id: 'merchant@upi',
    upi_name: 'COSRX STORE'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
    fetchAdminConfig();
  }, []);

  const [adminConfig, setAdminConfig] = useState({
    username: '',
    password: ''
  });

  const fetchAdminConfig = async () => {
    const { data } = await supabase.from('skin_admin_config').select('*');
    if (data) {
      const config = data.reduce((acc: any, item: any) => {
        acc[item.skin_key.replace('admin_', '')] = item.skin_value;
        return acc;
      }, {});
      setAdminConfig(config);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('skin_settings').select('*');
    if (data) {
      const settingsObj = data.reduce((acc: any, item: any) => {
        acc[item.skin_key] = item.skin_value;
        return acc;
      }, {});
      setSettings((prev: any) => ({ ...prev, ...settingsObj }));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save Store Settings
      const updates = Object.entries(settings)
        .filter(([key]) => !['upi_id', 'upi_name'].includes(key)) // Remove legacy UPI keys
        .map(([key, value]) => ({
          skin_key: key,
          skin_value: value,
          skin_updated_at: new Date().toISOString()
        }));

      await supabase.from('skin_settings').upsert(updates);

      // 2. Save Admin Config
      const adminUpdates = [
        { skin_key: 'admin_username', skin_value: adminConfig.username },
        { skin_key: 'admin_password', skin_value: adminConfig.password }
      ];
      await supabase.from('skin_admin_config').upsert(adminUpdates);

      alert("Settings and Admin Credentials saved successfully!");
    } catch (err: any) {
      alert("Error saving: " + err.message);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center text-gray-400">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black text-text-dark tracking-tighter uppercase">Store Settings</h1>
        <p className="text-text-muted text-xs mt-2 font-medium italic">Configure logistics and administrative access.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Section */}
        <div className="bg-white border border-secondary-ivory rounded-[2.5rem] p-10 space-y-8 shadow-sm">
          <div className="flex items-center gap-4 pb-6 border-b border-secondary-ivory/50">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Truck size={24} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-dark">Shipping Rates</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Flat Shipping Price (₹)</label>
              <input 
                type="number"
                value={settings.shipping_price}
                onChange={(e) => setSettings({ ...settings, shipping_price: e.target.value })}
                className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Free Shipping Threshold (₹)</label>
              <input 
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Announcement Text</label>
              <textarea 
                value={settings.announcement_text}
                onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                className="w-full bg-secondary-ivory/30 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none min-h-[100px]"
                placeholder="FREE SHIPPING ON ORDERS OVER ₹1000"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Access Section */}
        <div className="bg-white border border-accent-gold/20 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
          <div className="flex items-center gap-4 pb-6 border-b border-accent-gold/10">
            <div className="w-12 h-12 bg-accent-gold/10 text-accent-gold rounded-2xl flex items-center justify-center shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-dark">Admin Access</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Admin Username</label>
              <input 
                type="text"
                value={adminConfig.username}
                onChange={(e) => setAdminConfig({ ...adminConfig, username: e.target.value })}
                className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none"
                placeholder="admin"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Admin Password</label>
              <input 
                type="password"
                value={adminConfig.password}
                onChange={(e) => setAdminConfig({ ...adminConfig, password: e.target.value })}
                className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none"
                placeholder="••••••••"
              />
            </div>

            <div className="p-4 bg-accent-gold/5 rounded-2xl border border-accent-gold/10">
              <p className="text-[9px] font-bold text-accent-gold uppercase tracking-widest leading-relaxed">
                <AlertTriangle size={10} className="inline mr-1" />
                Updating these will change your login credentials for the admin panel immediately.
              </p>
            </div>
          </div>
        </div>

        {/* COD Section */}
        <div className="bg-white border border-secondary-ivory rounded-[2.5rem] p-10 space-y-8 shadow-sm">
          <div className="flex items-center gap-4 pb-6 border-b border-secondary-ivory/50">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Banknote size={24} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-dark">Cash on Delivery</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">COD Status</label>
              <select 
                value={settings.cod_available}
                onChange={(e) => setSettings({ ...settings, cod_available: e.target.value })}
                className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-accent-gold outline-none appearance-none cursor-pointer"
              >
                <option value="yes">YES - ACTIVE</option>
                <option value="no">NO - DISABLED</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">COD Handling Fee (₹)</label>
              <input 
                type="number"
                value={settings.cod_handling_price}
                onChange={(e) => setSettings({ ...settings, cod_handling_price: e.target.value })}
                className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Review Logistics</p>
            <p className="text-[10px] text-gray-500 mt-1">Ensure these prices align with your courier partners.</p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="h-12 px-10 bg-black text-white rounded-lg text-xs font-bold flex items-center gap-3 hover:bg-gray-800 transition-all shadow-lg"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          SAVE ALL SETTINGS
        </Button>
      </div>
    </div>
  );
}
