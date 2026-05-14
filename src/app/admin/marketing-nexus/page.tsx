"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Rocket, 
  Ticket, 
  Zap, 
  Target, 
  ImageIcon, 
  Loader2, 
  CheckCircle,
  Archive,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketingNexusPage() {
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeAssets, setActiveAssets] = useState<any[]>([]);

  // Asset Toggles
  const [enableCoupon, setEnableCoupon] = useState(false);
  const [enablePromo, setEnablePromo] = useState(false);
  const [enableCampaign, setEnableCampaign] = useState(false);
  const [enableBanner, setEnableBanner] = useState(false);

  // Common/Shared State
  const [masterTitle, setMasterTitle] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minCartValue, setMinCartValue] = useState(0);

  // Promo State
  const [promoType, setPromoType] = useState('discount');
  const [buyQty, setBuyQty] = useState(1);
  const [getQty, setGetQty] = useState(1);

  // Campaign State
  const [campaignSlug, setCampaignSlug] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');

  // Banner State
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerDesktop, setBannerDesktop] = useState('https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=2000&auto=format&fit=crop');
  const [bannerMobile, setBannerMobile] = useState('https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop');

  const supabase = createClient();

  useEffect(() => {
    fetchActiveAssets();
  }, []);

  const fetchActiveAssets = async () => {
    setLoading(true);
    // Fetch from all tables for the history view
    const [couponsRes, promosRes, campaignsRes, bannersRes] = await Promise.all([
      supabase.from('skin_coupons').select('skin_id, skin_code, skin_created_at, skin_is_active').order('skin_created_at', { ascending: false }).limit(5),
      supabase.from('skin_promotions').select('skin_id, skin_title, skin_created_at, skin_is_active').order('skin_created_at', { ascending: false }).limit(5),
      supabase.from('skin_campaigns').select('skin_id, skin_title, skin_created_at, skin_is_active').order('skin_created_at', { ascending: false }).limit(5),
      supabase.from('skin_banners').select('skin_id, skin_title, skin_created_at, skin_is_active').order('skin_created_at', { ascending: false }).limit(5)
    ]);

    const combined = [
      ...(couponsRes.data || []).map(i => ({ ...i, type: 'Coupon', title: i.skin_code })),
      ...(promosRes.data || []).map(i => ({ ...i, type: 'Promotion', title: i.skin_title })),
      ...(campaignsRes.data || []).map(i => ({ ...i, type: 'Campaign', title: i.skin_title })),
      ...(bannersRes.data || []).map(i => ({ ...i, type: 'Banner', title: i.skin_title }))
    ].sort((a, b) => new Date(b.skin_created_at).getTime() - new Date(a.skin_created_at).getTime());

    setActiveAssets(combined);
    setLoading(false);
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enableCoupon && !enablePromo && !enableCampaign && !enableBanner) {
      alert("Please enable at least one asset to deploy.");
      return;
    }

    if (!masterTitle.trim()) {
      alert("Master Title is required.");
      return;
    }

    setDeploying(true);

    try {
      let promoId = null;
      let couponId = null;
      let slug = campaignSlug || `promo-${Math.random().toString(36).substring(2, 8)}`;

      // 1. Create Coupon
      if (enableCoupon) {
        const { data: cData, error: cErr } = await supabase.from('skin_coupons').insert({
          skin_code: couponCode.toUpperCase(),
          skin_discount_type: discountType,
          skin_discount_value: discountValue,
          skin_min_cart_value: minCartValue,
          skin_is_active: true
        }).select().single();
        if (cErr) throw cErr;
        couponId = cData.skin_id;
      }

      // 2. Create Promo
      if (enablePromo) {
        const { data: pData, error: pErr } = await supabase.from('skin_promotions').insert({
          skin_title: masterTitle,
          skin_type: promoType,
          skin_buy_quantity: buyQty,
          skin_get_quantity: getQty,
          skin_min_cart_value: minCartValue,
          skin_is_active: true
        }).select().single();
        if (pErr) throw pErr;
        promoId = pData.skin_id;
      }

      // 3. Create Campaign
      if (enableCampaign) {
        const { error: campErr } = await supabase.from('skin_campaigns').insert({
          skin_title: masterTitle,
          skin_slug: slug,
          skin_description: campaignDesc,
          skin_offer_id: promoId,
          skin_coupon_id: couponId,
          skin_is_active: true
        });
        if (campErr) throw campErr;
      }

      // 4. Create Banner
      if (enableBanner) {
        const { error: bErr } = await supabase.from('skin_banners').insert({
          skin_title: masterTitle,
          skin_subtitle: bannerSubtitle,
          skin_image_desktop: bannerDesktop,
          skin_image_mobile: bannerMobile,
          skin_cta_text: 'SHOP OFFER',
          skin_link_type: enableCampaign ? 'campaign' : 'collection',
          skin_link_id: enableCampaign ? slug : '',
          skin_is_active: true,
          skin_priority: 100
        });
        if (bErr) throw bErr;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reset forms optionally
      }, 3000);
      
      fetchActiveAssets();

    } catch (error: any) {
      console.error(error);
      alert("Deployment failed: " + error.message);
    } finally {
      setDeploying(false);
    }
  };

  const ToggleCard = ({ title, icon: Icon, enabled, setEnabled, colorClass }: any) => (
    <div 
      onClick={() => setEnabled(!enabled)}
      className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${
        enabled ? `bg-white border-${colorClass} shadow-md ring-2 ring-${colorClass}/20` : 'bg-secondary-ivory/20 border-secondary-ivory hover:bg-secondary-ivory/40'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          enabled ? `bg-${colorClass}/10 text-${colorClass}` : 'bg-white text-text-muted group-hover:text-text-dark'
        }`}>
          <Icon size={24} />
        </div>
        <span className={`font-black uppercase tracking-widest text-xs transition-colors ${
          enabled ? 'text-text-dark' : 'text-text-muted group-hover:text-text-dark'
        }`}>{title}</span>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
        enabled ? `border-${colorClass} bg-${colorClass}` : 'border-gray-300 bg-white'
      }`}>
        {enabled && <CheckCircle size={14} className="text-white" />}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto px-4 md:px-8 pt-8">
      
      <header className="space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-text-dark text-white rounded-2xl flex items-center justify-center shadow-xl">
             <Rocket size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Marketing Nexus</h1>
            <p className="text-text-muted mt-2 font-medium italic">Unified Campaign Builder & Asset Deployment Center.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Builder */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleDeploy} className="bg-white rounded-[3rem] border border-secondary-ivory shadow-sm p-8 space-y-10">
            
            {/* Master Settings */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-text-dark">1. Campaign Core</h2>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Master Title (Required)</label>
                <input 
                  required
                  placeholder="e.g. Summer Skincare Blowout"
                  value={masterTitle}
                  onChange={(e) => setMasterTitle(e.target.value)}
                  className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                />
              </div>
            </div>

            {/* Modular Selection */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-text-dark flex items-center justify-between">
                <span>2. Asset Selection</span>
                <span className="text-[9px] text-text-muted normal-case font-medium italic">Select what to generate</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToggleCard title="Store Coupon" icon={Ticket} enabled={enableCoupon} setEnabled={setEnableCoupon} colorClass="blue-500" />
                <ToggleCard title="Promo Logic" icon={Zap} enabled={enablePromo} setEnabled={setEnablePromo} colorClass="orange-500" />
                <ToggleCard title="Campaign Page" icon={Target} enabled={enableCampaign} setEnabled={setEnableCampaign} colorClass="purple-500" />
                <ToggleCard title="Homepage Banner" icon={ImageIcon} enabled={enableBanner} setEnabled={setEnableBanner} colorClass="green-500" />
              </div>
            </div>

            {/* Dynamic Fields */}
            <AnimatePresence>
              {enableCoupon && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 pt-4 border-t border-secondary-ivory"><Ticket size={16}/> Coupon Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Coupon Code (e.g. SUMMER20)" value={couponCode} onChange={e=>setCouponCode(e.target.value)} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold" />
                    <select value={discountType} onChange={e=>setDiscountType(e.target.value)} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold">
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    <input type="number" placeholder="Discount Value" value={discountValue} onChange={e=>setDiscountValue(Number(e.target.value))} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold" />
                    <input type="number" placeholder="Min Cart Value (0 for none)" value={minCartValue} onChange={e=>setMinCartValue(Number(e.target.value))} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold" />
                  </div>
                </motion.div>
              )}

              {enablePromo && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-2 pt-4 border-t border-secondary-ivory"><Zap size={16}/> Promotion Logic Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select value={promoType} onChange={e=>setPromoType(e.target.value)} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold">
                      <option value="bogo">Buy X Get Y Free</option>
                      <option value="discount">Automatic Discount</option>
                    </select>
                    <input type="number" placeholder="Buy Qty" value={buyQty} onChange={e=>setBuyQty(Number(e.target.value))} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold" />
                    <input type="number" placeholder="Get Qty" value={getQty} onChange={e=>setGetQty(Number(e.target.value))} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold" />
                  </div>
                </motion.div>
              )}

              {enableCampaign && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-widest text-purple-500 flex items-center gap-2 pt-4 border-t border-secondary-ivory"><Target size={16}/> Landing Page Configuration</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <input placeholder="URL Slug (e.g. summer-sale-2026)" value={campaignSlug} onChange={e=>setCampaignSlug(e.target.value)} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold" />
                    <textarea placeholder="Campaign Description / Subtitle" value={campaignDesc} onChange={e=>setCampaignDesc(e.target.value)} className="h-24 py-4 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold resize-none" />
                  </div>
                </motion.div>
              )}

              {enableBanner && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-widest text-green-500 flex items-center gap-2 pt-4 border-t border-secondary-ivory"><ImageIcon size={16}/> Homepage Banner Configuration</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <input placeholder="Banner Subtitle" value={bannerSubtitle} onChange={e=>setBannerSubtitle(e.target.value)} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold" />
                    <input placeholder="Desktop Image URL" value={bannerDesktop} onChange={e=>setBannerDesktop(e.target.value)} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold" />
                    <input placeholder="Mobile Image URL" value={bannerMobile} onChange={e=>setBannerMobile(e.target.value)} className="h-12 bg-secondary-ivory/20 rounded-xl px-4 text-xs font-bold" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="pt-8 border-t border-secondary-ivory">
              <button 
                type="submit"
                disabled={deploying}
                className={`w-full h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                  success 
                    ? 'bg-green-500 text-white' 
                    : (!enableCoupon && !enablePromo && !enableCampaign && !enableBanner)
                      ? 'bg-secondary-ivory text-text-muted cursor-not-allowed'
                      : 'bg-text-dark text-white hover:bg-accent-gold shadow-xl shadow-text-dark/20'
                }`}
              >
                {deploying ? <Loader2 className="animate-spin" size={24} /> : success ? <><CheckCircle size={24}/> Deployed Successfully</> : <><Rocket size={24} /> Deploy Selected Assets</>}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Asset History */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-secondary-ivory/10 rounded-[3rem] p-8 border border-secondary-ivory">
            <h3 className="text-lg font-black uppercase tracking-tight italic text-text-dark mb-6 flex items-center gap-3">
              <Archive size={20} className="text-text-muted" /> Active Assets
            </h3>
            
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent-gold" size={24} /></div>
              ) : activeAssets.length > 0 ? (
                activeAssets.map((asset, idx) => (
                  <div key={`${asset.type}-${asset.skin_id}-${idx}`} className="bg-white p-4 rounded-2xl border border-secondary-ivory shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        asset.type === 'Coupon' ? 'bg-blue-50 text-blue-500' :
                        asset.type === 'Promotion' ? 'bg-orange-50 text-orange-500' :
                        asset.type === 'Campaign' ? 'bg-purple-50 text-purple-500' :
                        'bg-green-50 text-green-500'
                      }`}>
                        {asset.type}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${asset.skin_is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <p className="text-xs font-bold text-text-dark uppercase tracking-tight truncate" title={asset.title}>{asset.title}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs font-medium text-text-muted text-center italic py-10">No active assets found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
