"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ShoppingBag, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIStrategistPage() {
  const [loading, setLoading] = useState(true);
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    // Fetch a few active products to use in dynamic recommendations
    const { data } = await supabase
      .from('skin_products')
      .select('*')
      .eq('skin_is_active', true)
      .limit(5);
      
    if (data) setProducts(data);
    setLoading(false);
  };

  // Pre-built AI Strategy Recommendations
  const getStrategies = () => {
    const defaultProduct = products.length > 0 ? products[0] : null;
    
    return [
      {
        id: 'strat-bogo-weekend',
        title: 'Weekend Clearance Drive',
        type: 'BOGO Offer',
        reasoning: 'Inventory for specific items is moving 15% slower than usual. A Buy 1 Get 1 Free offer will accelerate movement and increase AOV before the end of the month.',
        doNotRun: false,
        actionText: 'Deploy BOGO Banner & Campaign',
        icon: ShoppingBag,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        logic: {
          promoType: 'bogo',
          buyQty: 1,
          getQty: 1,
          targetProductId: defaultProduct?.skin_id,
          bannerTitle: 'Weekend Special: BOGO!',
          bannerSubtitle: 'Buy 1, Get 1 Free on all our bestsellers.'
        }
      },
      {
        id: 'strat-cart-push',
        title: 'High AOV Stimulator',
        type: 'Cart Value Promo',
        reasoning: 'Average order value has dropped to ₹1,200. Offering a free premium gift on orders over ₹2,000 will incentivize customers to add more items to their cart.',
        doNotRun: false,
        actionText: 'Deploy High-AOV Offer',
        icon: TrendingUp,
        color: 'text-green-500',
        bg: 'bg-green-50',
        logic: {
          promoType: 'cart_value',
          minCart: 2000,
          targetProductId: defaultProduct?.skin_id,
          bannerTitle: 'Free Gift Inside 🎁',
          bannerSubtitle: 'Spend ₹2,000 or more and receive a complimentary premium gift.'
        }
      },
      {
        id: 'strat-flash-sale',
        title: 'Mid-Week Flash Sale',
        type: 'Discount Promo',
        reasoning: 'Mid-week traffic is currently down 22%. Historical data shows a 48-hour flat 20% discount on entire store recovers traffic effectively.',
        doNotRun: false,
        actionText: 'Deploy Flash Sale',
        icon: Zap,
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        logic: {
          promoType: 'discount',
          discountPercent: 20,
          bannerTitle: '48-Hour Flash Sale',
          bannerSubtitle: 'Flat 20% off across the entire store. Ends soon!'
        }
      },
      {
        id: 'strat-avoid-discount',
        title: 'Halt Heavy Discounting',
        type: 'Strategy Warning',
        reasoning: 'We have run 3 major discount campaigns in the last 14 days. Running another 50% off sale right now will heavily dilute brand value and cut into margin.',
        doNotRun: true,
        actionText: 'Acknowledge',
        icon: AlertTriangle,
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        logic: null
      }
    ];
  };

  const handleDeploy = async (strategy: any) => {
    if (strategy.doNotRun) return;
    
    setDeployingId(strategy.id);
    
    try {
      const slug = `promo-${Math.random().toString(36).substring(2, 9)}`;
      
      // 1. Create Promotion
      const { data: promo, error: promoError } = await supabase
        .from('skin_promotions')
        .insert({
          skin_title: strategy.title,
          skin_description: strategy.reasoning,
          skin_type: strategy.logic.promoType,
          skin_min_cart_value: strategy.logic.minCart || 0,
          skin_buy_quantity: strategy.logic.buyQty || 0,
          skin_get_quantity: strategy.logic.getQty || 0,
          skin_discount_percent: strategy.logic.discountPercent || 0,
          skin_free_product_id: strategy.logic.targetProductId || null,
          skin_is_active: true
        })
        .select()
        .single();
        
      if (promoError) throw promoError;

      // 2. Map Target Product (if BOGO or specific item)
      if (strategy.logic.targetProductId && strategy.logic.promoType === 'bogo') {
        await supabase.from('skin_promotion_targets').insert({
          skin_promotion_id: promo.skin_id,
          skin_target_type: 'product',
          skin_target_id: strategy.logic.targetProductId
        });
      }

      // 3. Create Campaign Page
      const { data: campaign, error: campError } = await supabase
        .from('skin_campaigns')
        .insert({
          skin_title: strategy.title,
          skin_slug: slug,
          skin_description: strategy.bannerSubtitle,
          skin_offer_id: promo.skin_id,
          skin_is_active: true
        })
        .select()
        .single();

      if (campError) throw campError;

      // 4. Create Homepage Banner
      await supabase.from('skin_banners').insert({
        skin_title: strategy.logic.bannerTitle,
        skin_subtitle: strategy.logic.bannerSubtitle,
        skin_image_desktop: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=2000&auto=format&fit=crop', // Sleek placeholder
        skin_image_mobile: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop',
        skin_cta_text: 'SHOP THE OFFER',
        skin_link_type: 'campaign',
        skin_link_id: slug,
        skin_is_active: true,
        skin_priority: 100 // High priority to show first
      });

      setSuccessId(strategy.id);
      setTimeout(() => setSuccessId(null), 5000);
      
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('Failed to deploy strategy. See console for details.');
    } finally {
      setDeployingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Initializing Growth Engine...</p>
      </div>
    );
  }

  const strategies = getStrategies();

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto px-4 md:px-8 pt-8">
      
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-text-dark text-white rounded-2xl flex items-center justify-center shadow-xl">
               <BrainCircuit size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase italic">Growth Engine</h1>
              <p className="text-text-muted mt-2 font-medium italic">AI-driven marketing strategist and automated deployment nexus.</p>
            </div>
          </div>
        </div>

        {/* Market Intelligence Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-secondary-ivory shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Current Trajectory</span>
               <TrendingDown className="text-red-500" size={20} />
            </div>
            <p className="text-sm font-medium italic text-text-dark mb-2">Traffic is down 12% week-over-week.</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Recommendation: Run Flash Sale</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-secondary-ivory shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Inventory Alert</span>
               <AlertTriangle className="text-orange-500" size={20} />
            </div>
            <p className="text-sm font-medium italic text-text-dark mb-2">Sunscreen category is moving 15% slower than projected.</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Recommendation: Deploy BOGO</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-secondary-ivory shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Cart Value Status</span>
               <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-sm font-medium italic text-text-dark mb-2">AOV has slightly decreased to ₹1,200.</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Recommendation: Free Gift Tier</p>
          </div>
        </div>
      </header>

      {/* Recommended Strategies */}
      <div className="space-y-6">
        <h2 className="text-xl font-black uppercase tracking-tight italic text-text-dark">Recommended Actions</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {strategies.map((strat) => (
            <motion.div 
              key={strat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-[3rem] border shadow-sm overflow-hidden flex flex-col ${
                strat.doNotRun ? 'border-orange-200' : 'border-secondary-ivory'
              }`}
            >
               <div className="p-8 flex-1">
                  <div className="flex items-start justify-between gap-4 mb-6">
                     <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${strat.bg} ${strat.color}`}>
                           <strat.icon size={28} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-text-dark uppercase italic leading-none mb-1">{strat.title}</h3>
                           <span className="text-[9px] font-black uppercase tracking-widest text-text-muted bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                             {strat.type}
                           </span>
                        </div>
                     </div>
                  </div>
                  
                  <p className="text-sm font-medium leading-relaxed italic text-text-muted">
                    {strat.reasoning}
                  </p>

                  {!strat.doNotRun && strat.logic && (
                     <div className="mt-6 bg-secondary-ivory/20 p-4 rounded-2xl border border-secondary-ivory border-dashed">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-dark mb-2 flex items-center gap-2">
                          <Zap size={12} className="text-accent-gold" /> Auto-Generation Scope:
                        </p>
                        <ul className="text-xs font-medium italic text-text-muted space-y-1">
                           <li>• Creates 1x <strong>Promotion Rule</strong></li>
                           <li>• Creates 1x <strong>Campaign Landing Page</strong></li>
                           <li>• Pushes 1x <strong>Homepage Hero Banner</strong></li>
                        </ul>
                     </div>
                  )}
               </div>

               <div className="p-4 border-t border-secondary-ivory bg-gray-50/50">
                  <button 
                    onClick={() => handleDeploy(strat)}
                    disabled={deployingId !== null || strat.doNotRun}
                    className={`w-full h-16 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      successId === strat.id 
                        ? 'bg-green-500 text-white'
                        : strat.doNotRun 
                          ? 'bg-white border border-secondary-ivory text-text-muted hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200' 
                          : 'bg-text-dark text-white hover:bg-accent-gold shadow-xl shadow-text-dark/10'
                    }`}
                  >
                     {deployingId === strat.id ? (
                        <><Loader2 className="animate-spin" size={20} /> Deploying Campaign...</>
                     ) : successId === strat.id ? (
                        <><CheckCircle size={20} /> Deployed Live!</>
                     ) : strat.doNotRun ? (
                        <>{strat.actionText}</>
                     ) : (
                        <><ArrowRight size={20} /> {strat.actionText}</>
                     )}
                  </button>
               </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
