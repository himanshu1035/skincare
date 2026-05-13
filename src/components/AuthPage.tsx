import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Phone, ArrowLeft, Loader2, User as UserIcon, AtSign } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, registerUser, currentUser } = useStore();
  const router = useRouter();

  React.useEffect(() => {
    if (currentUser) {
      router.replace('/account');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) router.replace('/account');
        else alert('Invalid credentials');
      } else {
        const userId = await registerUser(email, mobile, password, { 
          firstName, 
          lastName, 
          username 
        });
        if (userId) router.replace('/account');
        else alert('Registration failed');
      }
    } catch (err) {
      alert('An error occurred');
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
        <p className="mt-2 text-center text-sm text-text-muted font-medium italic">
          {isLogin ? 'Sign in to access your dashboard' : 'Join our premium skincare community'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-secondary-ivory/20 py-8 px-4 shadow-xl border border-secondary-ivory sm:rounded-[2.5rem] sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white border border-secondary-ivory rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-secondary-ivory rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-secondary-ivory rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-white border border-secondary-ivory rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-text-dark uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-secondary-ivory rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent-gold outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-xs font-black uppercase tracking-widest text-white bg-text-dark hover:bg-accent-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-gold transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-ivory"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-text-muted font-bold uppercase tracking-widest">
                  {isLogin ? 'New to COSRX?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-4 px-4 border-2 border-text-dark rounded-xl text-xs font-black uppercase tracking-widest text-text-dark hover:bg-text-dark hover:text-white transition-all"
              >
                {isLogin ? 'Create an Account' : 'Sign In instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
