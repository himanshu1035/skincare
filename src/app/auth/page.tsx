"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'password' | 'magic'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const supabase = createClient();

  // Automatic Login after Email Verification Redirect
  useEffect(() => {
    const handleAuthStateChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch full profile to sync with store
        const { data: profile } = await supabase
          .from('skin_user_profiles')
          .select('*')
          .eq('skin_id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: profile?.skin_first_name,
          lastName: profile?.skin_last_name,
          phone: profile?.skin_phone,
        });

        router.push('/account');
      }
    };

    handleAuthStateChange();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('skin_user_profiles')
          .select('*')
          .eq('skin_id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: profile?.skin_first_name,
          lastName: profile?.skin_last_name,
          phone: profile?.skin_phone,
        });
        router.push('/account');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, setUser, router]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      setSuccess('Check your email! We sent you a secure sign-in link.');
    }
    setIsLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    if (authMethod === 'magic' && isLogin) {
      return handleMagicLink(e);
    }

    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;

    try {
      if (isLogin) {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        const { data: profile } = await supabase
          .from('skin_user_profiles')
          .select('*')
          .eq('skin_id', data.user.id)
          .single();

        setUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: profile?.skin_first_name,
          lastName: profile?.skin_last_name,
          phone: profile?.skin_phone,
        });

        router.push('/account');
      } else {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: phone
            }
          }
        });

        if (signupError) throw signupError;

        if (data.user) {
          await supabase
            .from('skin_user_profiles')
            .upsert([{
              skin_id: data.user.id,
              skin_email: email,
              skin_first_name: firstName,
              skin_last_name: lastName,
              skin_phone: phone,
              skin_role: 'customer'
            }]);

          setSuccess('Account created! Please check your email and click the verification link to activate your account.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary-ivory/30">
      <Navbar />
      
      <div className="pt-40 pb-24 flex items-center justify-center">
        <div className="container max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-secondary-ivory relative overflow-hidden"
          >
            {/* Status Messages */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            {success && (
              <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 size={18} /> {success}
              </div>
            )}

            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-text-dark mb-4 tracking-tighter">
                {isLogin ? 'Welcome Back' : 'Join COSRX'}
              </h1>
              
              {isLogin && (
                <div className="flex bg-secondary-ivory/50 p-1 rounded-2xl mb-6">
                  <button 
                    type="button"
                    onClick={() => setAuthMethod('password')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMethod === 'password' ? 'bg-white shadow-sm text-text-dark' : 'text-text-muted'}`}
                  >
                    Password
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAuthMethod('magic')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMethod === 'magic' ? 'bg-white shadow-sm text-text-dark' : 'text-text-muted'}`}
                  >
                    Magic Link
                  </button>
                </div>
              )}

              <p className="text-text-muted text-sm font-medium">
                {authMethod === 'magic' && isLogin 
                  ? 'We will email you a secure link to sign in instantly.' 
                  : isLogin 
                    ? 'Access your orders and personalized skincare.' 
                    : 'Experience the viral skincare miracle today.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <input name="firstName" type="text" className="w-full bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium" placeholder="John" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Last Name</label>
                    <input name="lastName" type="text" className="w-full bg-secondary-ivory/50 border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium" placeholder="Doe" required />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input name="email" type="email" className="w-full bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium" placeholder="hello@example.com" required />
                </div>
              </div>

              {(authMethod === 'password' || !isLogin) && (
                <>
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input name="phone" type="tel" className="w-full bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium" placeholder="+91" required />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <input 
                        name="password"
                        type={showPassword ? 'text' : 'password'} 
                        className="w-full bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-12 py-4 text-sm focus:ring-2 focus:ring-accent-gold outline-none font-medium" 
                        placeholder="••••••••" 
                        required 
                        minLength={6}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-[10px] font-black uppercase tracking-widest text-accent-gold hover:underline">Forgot password?</button>
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-16 mt-4 font-black tracking-widest text-xs rounded-full bg-text-dark hover:bg-accent-gold border-none shadow-xl transition-all" 
                disabled={isLoading}
              >
                {isLoading ? 'PLEASE WAIT...' : isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
              </Button>

              <div className="text-center pt-8 border-t border-secondary-ivory">
                <p className="text-sm text-text-muted font-medium">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="font-black text-text-dark hover:text-accent-gold transition-colors underline underline-offset-4"
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
