"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Lock, Shield, Loader2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { updateCustomer, deleteCustomer } from './actions';
import { useRouter } from 'next/navigation';

interface CustomerEditModalProps {
  customer: any;
  onClose: () => void;
}

export const CustomerEditModal = ({ customer, onClose }: CustomerEditModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: customer.skin_first_name || '',
    lastName: customer.skin_last_name || '',
    email: customer.skin_email || '',
    phone: customer.skin_phone || '',
    password: '',
    role: customer.skin_role || 'customer'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await updateCustomer(customer.skin_id, formData);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || 'Failed to update customer');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('CRITICAL: Delete this user permanently? This cannot be undone.')) return;
    setLoading(true);
    try {
      await deleteCustomer(customer.skin_id);
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-dark/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-secondary-ivory"
      >
        <div className="p-8 md:p-12">
          <header className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-text-dark">Edit User Account</h2>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Management for #{customer.skin_id.slice(0, 8)}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-secondary-ivory flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <X size={20} />
            </button>
          </header>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
              <Shield size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Last Name</label>
                <input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Email (Supabase Auth)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Access Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full h-14 bg-secondary-ivory/50 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none appearance-none cursor-pointer">
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-accent-gold/5 rounded-[2rem] border border-accent-gold/20">
               <label className="text-[10px] font-black uppercase tracking-widest text-accent-gold mb-3 block">Change User Password (Direct Override)</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-gold" size={16} />
                  <input 
                    type="text" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter new password (leave blank to keep current)" 
                    className="w-full h-14 bg-white border border-accent-gold/20 rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent-gold outline-none" 
                  />
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" size="lg" className="flex-1 h-16 rounded-full font-black tracking-widest text-xs shadow-xl" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> SAVE CHANGES</>}
              </Button>
              <button 
                type="button"
                onClick={handleDelete}
                className="h-16 px-8 rounded-full border-2 border-red-100 text-red-500 font-black text-xs tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                disabled={loading}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
