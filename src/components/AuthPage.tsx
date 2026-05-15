"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Phone, ArrowLeft, Loader2, User as UserIcon, AtSign, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    if (currentUser) {
      router.replace('/account');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
          username: profile?.skin_username,
          phone: profile?.skin_phone,
        });

        router.push('/account');
      } else {
        const fullName = `${firstName} ${lastName}`.trim();
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: fullName,
              username: fullName,
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
              skin_username: fullName,
              skin_phone: phone,
              skin_role: 'customer'
            }]);

          setUser({
            id: data.user.id,
            email: data.user.email!,
            firstName,
            lastName,
            username: fullName,
            phone,
          });

          router.push('/account');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-text-dark rounded-2xl flex items-center justify-center text-white">
            <Lock size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-text-dark tracking-tighter uppercase">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-widest text-center">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-secondary-ivory/20 py-8 px-4 shadow-xl border border-secondary-ivory sm:rounded-[2.5rem] sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">First Name</label>
                  <input name="firstName" type="text" required className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">Last Name</label>
                  <input name="lastName" type="text" required className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input name="email" type="email" required className="w-full bg-white border border-secondary-ivory rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input name="phone" type="tel" required className="w-full bg-white border border-secondary-ivory rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required 
                  className="w-full bg-white border border-secondary-ivory rounded-xl pl-12 pr-12 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-xs font-black uppercase tracking-widest text-white bg-text-dark hover:bg-accent-gold transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 border-t border-secondary-ivory pt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black text-text-dark uppercase tracking-widest hover:text-accent-gold">
              {isLogin ? 'New here? Create an Account' : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
