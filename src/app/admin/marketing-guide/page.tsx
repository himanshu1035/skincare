"use client";

import React from 'react';
import { 
  Sparkles, 
  ImageIcon, 
  Zap, 
  Ticket, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  MousePointer2,
  Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MarketingGuidePage() {
  const steps = [
    {
      title: "1. Visual Preparation (Banners)",
      description: "Every successful campaign starts with high-impact visuals. Upload banners to the homepage or specific category pages to catch the user's attention immediately.",
      link: "/admin/banners",
      icon: <ImageIcon className="text-blue-500" />,
      tips: ["Use high-resolution 1920x800 images", "Include a clear Call to Action (CTA)", "Set a start and end date for seasonal sales"]
    },
    {
      title: "2. Strategic Incentives (Coupons)",
      description: "Define your discount logic. Create percentage-based or flat-amount coupons. You can restrict usage per user or set a minimum order value.",
      link: "/admin/coupons",
      icon: <Ticket className="text-accent-gold" />,
      tips: ["Generic codes like 'WELCOME10' work best", "Set a minimum spend to protect margins", "Monitor usage in the Coupon Audit modal"]
    },
    {
      title: "3. Dynamic Logic (Promotions)",
      description: "Activate site-wide logic like 'Buy 1 Get 1 Free' or threshold-based free shipping. These promotions run automatically without codes.",
      link: "/admin/promotions",
      icon: <Zap className="text-orange-500" />,
      tips: ["Keep BOGO deals limited to specific collections", "Ensure the promo logic is visible on product cards", "Clear cache after deploying a new global promotion"]
    },
    {
      title: "4. Deployment (Campaign Pages)",
      description: "Create a dedicated landing page for your campaign. This is perfect for influencer marketing or seasonal drops where you want a custom layout.",
      link: "/admin/campaigns",
      icon: <Target className="text-purple-500" />,
      tips: ["Keep the URL slug short and memorable", "Add SEO tags to the campaign header", "Link all your banners to this page"]
    }
  ];

  return (
    <div className="space-y-12 pb-24">
      <header className="max-w-3xl">
        <div className="w-16 h-16 bg-text-dark rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8">
           <Rocket size={32} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-text-dark uppercase italic leading-none">Campaign Launch Manual</h1>
        <p className="text-text-muted mt-4 text-lg font-medium italic leading-relaxed">
          The ultimate guide to orchestrating high-conversion marketing events. Follow these stages to prepare, deploy, and monitor your store's growth.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         {steps.map((step, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white rounded-[3.5rem] border border-secondary-ivory shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
            >
               <div className="p-10 flex-1">
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-14 h-14 bg-secondary-ivory/50 rounded-2xl flex items-center justify-center">
                        {step.icon}
                     </div>
                     <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Stage {idx + 1}</span>
                  </div>
                  <h2 className="text-2xl font-black text-text-dark tracking-tighter mb-4 uppercase">{step.title}</h2>
                  <p className="text-sm font-medium text-text-muted leading-relaxed mb-8 italic">{step.description}</p>
                  
                  <div className="space-y-3">
                     <p className="text-[9px] font-black text-text-dark uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-green-500" /> Professional Tips:
                     </p>
                     {step.tips.map((tip, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2 bg-secondary-ivory/20 rounded-xl">
                           <div className="w-1 h-1 bg-text-dark rounded-full" />
                           <span className="text-[10px] font-bold text-text-muted uppercase">{tip}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <Link 
                href={step.link}
                className="p-8 bg-secondary-ivory/30 border-t border-secondary-ivory flex items-center justify-between group hover:bg-text-dark transition-all duration-500"
               >
                  <span className="text-xs font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Go to {step.title.split(' ')[2].replace(')', '')}</span>
                  <ArrowRight size={20} className="text-text-muted group-hover:text-accent-gold group-hover:translate-x-2 transition-all" />
               </Link>
            </motion.div>
         ))}
      </div>

      <section className="bg-text-dark rounded-[4rem] p-16 text-white relative overflow-hidden">
         <Sparkles className="absolute -right-20 -bottom-20 w-80 h-80 text-white/5" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
               <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-4">Ready for deployment?</h2>
               <p className="text-white/60 font-medium italic leading-relaxed">
                  Before launching, ensure you have checked your profit margins. Discounts should be strategic, not destructive. Use the Coupon Audit tool to monitor ROI in real-time.
               </p>
            </div>
            <Link 
              href="/admin/coupons"
              className="h-16 px-10 bg-accent-gold text-text-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
               Open Coupon Engine <MousePointer2 size={18} />
            </Link>
         </div>
      </section>
    </div>
  );
}
