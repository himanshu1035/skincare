import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, registerUser } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) navigate('/account');
        else alert('Invalid credentials');
      } else {
        const userId = await registerUser(email, mobile, password);
        if (userId) navigate('/account');
        else alert('Registration failed');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--secondary-ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '450px' }}
      >
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to Store
        </button>

        <h1 style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
          {isLogin ? 'Login to track your orders' : 'Join the COSRX community for the glow'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #eee' }}
            />
          </div>

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #eee' }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #eee' }}
            />
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', height: '56px', fontSize: '16px', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'LOGIN' : 'CREATE ACCOUNT')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', color: 'var(--accent-gold)', fontWeight: 'bold' }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
