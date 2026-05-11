import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
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
        const userId = await registerUser(email, mobile, password, { 
          firstName, 
          lastName, 
          username 
        });
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '480px' }}
      >
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', marginBottom: '32px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Back to Store
        </button>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '12px' }}>COSRX<span style={{ color: 'var(--accent-gold)' }}>.</span></div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{isLogin ? 'Welcome Back' : 'Join the Club'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isLogin ? 'Login to manage your orders and profile' : 'Create your account to unlock exclusive glow benefits'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                  <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="auth-input" style={{ paddingLeft: '48px' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="auth-input" />
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <AtSign size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                <input type="text" placeholder="Choose Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="auth-input" style={{ paddingLeft: '48px' }} />
              </div>
            </>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" style={{ paddingLeft: '48px' }} />
          </div>

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
              <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required className="auth-input" style={{ paddingLeft: '48px' }} />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="auth-input" style={{ paddingLeft: '48px' }} />
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', height: '56px', fontSize: '16px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {isLogin ? "New to COSRX? " : "Already a member? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', color: 'var(--accent-gold)', fontWeight: '700', textDecoration: 'underline' }}
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </motion.div>

      <style>{`
        .auth-input {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #eee;
          font-size: 14px;
          transition: all 0.2s;
          background: #fcfcfc;
        }
        .auth-input:focus {
          border-color: var(--accent-gold);
          background: white;
          outline: none;
          box-shadow: 0 0 0 4px rgba(197, 160, 89, 0.1);
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 2s linear infinite; }
      `}</style>
    </div>
  );
};
