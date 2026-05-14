"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, Mail, Lock, ArrowRight, Loader2, Globe, Zap, BarChart3, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MarketerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Verify if they are a marketer
    const { data: profile } = await supabase
      .from('skin_marketers')
      .select('*')
      .eq('skin_id', data.user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      setError('Access Denied. This account is not authorized for the Marketer Workspace.');
      setLoading(false);
      return;
    }

    if (!profile.skin_is_active) {
      await supabase.auth.signOut();
      setError('Account Restricted. Your account has been deactivated by the administrator.');
      setLoading(false);
      return;
    }

    router.push('/marketer/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 md:p-12 overflow-hidden">
      {/* Background Accents */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-gold blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-text-dark blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl h-[85vh] bg-white rounded-[3.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.15)] border border-secondary-ivory flex flex-col md:flex-row overflow-hidden relative z-10"
      >
        {/* Left Side: Brand & Value Prop (Management Style) */}
        <div className="hidden md:flex w-[45%] bg-text-dark p-16 flex-col justify-between relative overflow-hidden">
           {/* Geometric Pattern Overlay */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
           
           <div className="relative z-10">
              <Link href="/" className="text-2xl font-black text-white tracking-tighter uppercase italic border-b-2 border-accent-gold pb-1 inline-block">COSRX PARTNER</Link>
              <div className="mt-20 space-y-6">
                 <h1 className="text-5xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
                    Administrative <br />
                    <span className="text-accent-gold">Marketing Console</span>
                 </h1>
                 <p className="text-white/50 text-sm font-medium italic max-w-sm">
                    Access the centralized operations desk for authorized COSRX brand partners.
                 </p>
              </div>
           </div>

           <div className="relative z-10 space-y-8">
              {[
                { icon: <BarChart3 size={20} />, label: 'Conversion Intel', desc: 'Real-time sale attribution' },
                { icon: <Users size={20} />, label: 'Audience Insight', desc: 'Detailed redemption analytics' },
                { icon: <ShieldCheck size={20} />, label: 'Protected Access', desc: 'Enterprise-grade security' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent-gold shrink-0 border border-white/10">
                      {item.icon}
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">{item.label}</p>
                      <p className="text-[9px] text-white/40 font-bold uppercase mt-1">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="relative z-10 pt-12 border-t border-white/10">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">© 2026 COSRX GLOBAL PARTNERSHIP UNIT</p>
           </div>
        </div>

        {/* Right Side: Login Form (Clean Management Interface) */}
        <div className="flex-1 p-12 md:p-24 flex flex-col justify-center bg-white">
           <div className="max-w-md w-full mx-auto">
              <header className="mb-12">
                 <div className="w-16 h-16 rounded-3xl bg-secondary-ivory flex items-center justify-center text-text-dark mb-8 border border-secondary-ivory">
                    <ShieldCheck size={32} />
                 </div>
                 <h2 className="text-4xl font-black text-text-dark tracking-tighter uppercase italic leading-none mb-4">Secure Portal</h2>
                 <p className="text-text-muted text-xs font-bold uppercase tracking-widest italic">Identity verification required to enter workspace.</p>
              </header>

              <form onSubmit={handleLogin} className="space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Professional Email</label>
                       <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                          <input 
                            required 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter authorized email"
                            className="w-full h-16 bg-secondary-ivory/40 border border-transparent rounded-2xl pl-14 pr-6 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold focus:bg-white transition-all shadow-sm"
                          />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Secure Password</label>
                       <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                          <input 
                            required 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-16 bg-secondary-ivory/40 border border-transparent rounded-2xl pl-14 pr-6 text-sm font-bold text-text-dark outline-none focus:ring-2 focus:ring-accent-gold focus:bg-white transition-all shadow-sm"
                          />
                       </div>
                    </div>
                 </div>

                 {error && (
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                         <ShieldCheck size={16} />
                      </div>
                      <p className="text-[10px] font-black text-red-600 uppercase leading-relaxed">{error}</p>
                   </motion.div>
                 )}

                 <div className="pt-4">
                    <button 
                      disabled={loading}
                      className="w-full h-16 bg-text-dark text-white rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase hover:bg-accent-gold transition-all shadow-2xl shadow-text-dark/20 flex items-center justify-center gap-4 group"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                          Establish Connection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                 </div>
              </form>

              <footer className="mt-12 text-center">
                 <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.3em]">
                    Internal Tool · <Link href="/support" className="text-accent-gold hover:underline">Help & Governance</Link>
                 </p>
              </footer>
           </div>
        </div>
      </motion.div>
    </main>
  );
}
