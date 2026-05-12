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
  }, []);

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
    const updates = Object.entries(settings).map(([key, value]) => ({
      skin_key: key,
      skin_value: value,
      skin_updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('skin_settings')
      .upsert(updates);

    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      alert("Settings saved successfully!");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center text-gray-400">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 text-xs mt-1">Configure your shipping and payment logistics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <Truck className="text-blue-600" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Shipping Rates</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Flat Shipping Price (₹)</label>
              <input 
                type="number"
                value={settings.shipping_price}
                onChange={(e) => setSettings({ ...settings, shipping_price: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Free Shipping Threshold (₹)</label>
              <input 
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Announcement Bar Text</label>
              <textarea 
                value={settings.announcement_text}
                onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none font-bold min-h-[80px]"
                placeholder="e.g. FREE SHIPPING ON ORDERS OVER ₹1000"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">UPI Payment Config</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UPI ID (VPA)</label>
                  <input 
                    type="text"
                    value={settings.upi_id}
                    onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none font-bold"
                    placeholder="e.g. yourname@okaxis"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Merchant Name</label>
                  <input 
                    type="text"
                    value={settings.upi_name}
                    onChange={(e) => setSettings({ ...settings, upi_name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none font-bold"
                    placeholder="e.g. COSRX INDIA"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COD Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <Banknote className="text-green-600" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Cash on Delivery</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">COD Available</label>
              <select 
                value={settings.cod_available}
                onChange={(e) => setSettings({ ...settings, cod_available: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="yes">YES - ACTIVE</option>
                <option value="no">NO - DISABLED</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">COD Handling Price (₹)</label>
              <input 
                type="number"
                value={settings.cod_handling_price}
                onChange={(e) => setSettings({ ...settings, cod_handling_price: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pre-pay Handling for COD</label>
              <select 
                value={settings.prepay_handling_for_cod}
                onChange={(e) => setSettings({ ...settings, prepay_handling_for_cod: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="yes">YES - MUST PRE-PAY</option>
                <option value="no">NO - PAY AT DELIVERY</option>
              </select>
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
