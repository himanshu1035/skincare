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
  Rocket,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MarketingGuidePage() {
  const steps = [
    {
      title: "1. The AI Strategist",
      description: "Don't know what campaign to run? The Growth Engine analyzes your store's performance and inventory in real-time, suggesting the exact promotions you need to recover traffic or boost AOV.",
      link: "/admin/ai-strategist",
      icon: <BrainCircuit className="text-accent-gold" />,
      tips: ["Check the dashboard every Monday morning", "Pay attention to Strategy Warnings to protect margins", "Use the 1-Click deploy for instant setups"]
    },
    {
      title: "2. The Marketing Nexus",
      description: "Ready to build your own campaign? The Marketing Nexus is our unified campaign builder. You no longer need to jump between 4 different pages. Build coupons, logic, pages, and banners all from one screen.",
      link: "/admin/marketing-nexus",
      icon: <Rocket className="text-blue-500" />,
      tips: ["Toggle only the modules you need", "The Master Title links all your assets together", "Keep URL slugs short and memorable"]
    }
  ];

  return (
    <div className="space-y-12 pb-24">
      <header className="max-w-3xl">
        <div className="w-16 h-16 bg-text-dark rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8">
           <Sparkles size={32} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-text-dark uppercase italic leading-none">Campaign Launch Manual</h1>
        <p className="text-text-muted mt-4 text-lg font-medium italic leading-relaxed">
          The ultimate guide to orchestrating high-conversion marketing events. We have completely unified the marketing experience to save you time.
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
                     <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Path {idx + 1}</span>
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
                  <span className="text-xs font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Go to {step.title.split(' ')[1]} {step.title.split(' ')[2]}</span>
                  <ArrowRight size={20} className="text-text-muted group-hover:text-accent-gold group-hover:translate-x-2 transition-all" />
               </Link>
            </motion.div>
         ))}
      </div>

      <section className="bg-text-dark rounded-[4rem] p-16 text-white relative overflow-hidden">
         <Target className="absolute -right-20 -bottom-20 w-80 h-80 text-white/5" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
               <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-4">Understanding Modular Deployment</h2>
               <p className="text-white/60 font-medium italic leading-relaxed mb-6">
                  In the new Marketing Nexus, you don't have to create a full campaign every time. Need a simple store coupon? Just toggle "Store Coupon" and leave the rest off.
               </p>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-gold">
                     <Ticket size={16} /> 1. Configure
                  </div>
                  <ArrowRight size={14} className="text-white/40" />
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-gold">
                     <Zap size={16} /> 2. Toggle Assets
                  </div>
                  <ArrowRight size={14} className="text-white/40" />
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-gold">
                     <Rocket size={16} /> 3. Deploy
                  </div>
               </div>
            </div>
            <Link 
              href="/admin/marketing-nexus"
              className="h-16 px-10 bg-accent-gold text-text-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
               Open Nexus <MousePointer2 size={18} />
            </Link>
         </div>
      </section>
    </div>
  );
}
