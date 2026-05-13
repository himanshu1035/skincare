"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
    <main className="min-h-screen bg-secondary-ivory/20 selection:bg-accent-gold/30">
      <Navbar />
      
      <div className="pt-48 pb-32 container max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1 space-y-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.5em] mb-4 block">Official Affiliate Portal</span>
             <h1 className="text-7xl font-black tracking-tighter text-text-dark leading-[0.9] uppercase italic">
               Unlock Your <br /> <span className="text-accent-gold">Revenue Potential</span>
             </h1>
             <p className="text-text-muted mt-8 text-xl font-medium max-w-xl leading-relaxed italic">
               The enterprise-grade workspace for COSRX Brand Marketers. Generate unique offers, track conversions, and monitor your earnings in real-time.
             </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-8 pt-8">
             <div className="space-y-2">
                <ShieldCheck className="text-accent-gold" size={32} />
                <p className="text-[10px] font-black text-text-dark uppercase tracking-widest">Enterprise Security</p>
                <p className="text-[9px] text-text-muted font-bold leading-relaxed uppercase">Role-based access control and encrypted session management.</p>
             </div>
             <div className="space-y-2">
                <LogIn className="text-accent-gold" size={32} />
                <p className="text-[10px] font-black text-text-dark uppercase tracking-widest">Instant Analytics</p>
                <p className="text-[9px] text-text-muted font-bold leading-relaxed uppercase">Real-time sale attribution and commission calculation engine.</p>
             </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-secondary-ivory relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-bl-[5rem]" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tighter text-text-dark uppercase italic mb-10">Workspace Access</h2>
            
            <form onSubmit={handleLogin} className="space-y-8">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
                       <Mail size={12} /> Email Address
                    </label>
                    <input 
                      required 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                      placeholder="marketer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
                       <Lock size={12} /> Password
                    </label>
                    <input 
                      required 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 bg-secondary-ivory/30 border-none rounded-2xl px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-gold transition-all"
                      placeholder="••••••••"
                    />
                  </div>
               </div>

               {error && (
                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="text-red-500 shrink-0" size={18} />
                    <p className="text-[10px] font-bold text-red-600 uppercase leading-relaxed">{error}</p>
                 </motion.div>
               )}

               <button 
                disabled={loading}
                className="w-full h-16 bg-text-dark text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-2xl shadow-text-dark/20 flex items-center justify-center gap-3 group"
               >
                 {loading ? <Loader2 className="animate-spin" size={20} /> : (
                   <>
                     Secure Authentication <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                   </>
                 )}
               </button>
            </form>

            <div className="mt-10 text-center">
               <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                 Lost your credentials? <span className="text-accent-gold cursor-pointer hover:underline">Contact System Administrator</span>
               </p>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
