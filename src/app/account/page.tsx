"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight,
  LogOut,
  Mail,
  Phone,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function AccountPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && !user) {
        router.push('/auth');
        return;
      }
      
      setIsCheckingAuth(false);
      
      try {
        setLoading(true);
        await ensureUserProfile();
        setIsProfileReady(true);
        await fetchAddresses();
      } catch (err: any) {
        // Use warn to avoid scary Turbopack overlay
        console.warn("Init warning:", err);
        if (err.message?.includes('relation "skin_addresses"')) {
           setDbError("Database Setup Required: Please run the SQL commands for 'skin_addresses' in your Supabase Editor.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [user, router]);

  const ensureUserProfile = async () => {
    const authId = (await supabase.auth.getUser()).data.user?.id || user?.id;
    if (!authId) return;
    
    const { data: profile } = await supabase
      .from('skin_user_profiles')
      .select('skin_id')
      .eq('skin_id', authId)
      .maybeSingle();

    if (!profile) {
      const authUser = (await supabase.auth.getUser()).data.user;
      await supabase.from('skin_user_profiles').upsert({
        skin_id: authId,
        skin_email: authUser?.email || user?.email || '',
        skin_first_name: user?.firstName || 'Guest',
        skin_last_name: user?.lastName || 'User',
        skin_role: 'customer'
      }, { onConflict: 'skin_id' });
    }
  };

  const fetchAddresses = async () => {
    const authId = (await supabase.auth.getUser()).data.user?.id || user?.id;
    if (!authId) return;

    const { data, error } = await supabase
      .from('skin_addresses')
      .select('*')
      .eq('skin_user_id', authId)
      .order('skin_created_at', { ascending: false });
    
    if (error) {
       console.warn("Addresses fetch suppressed error:", error);
       if (error.message?.includes('relation "skin_addresses"')) {
          setDbError("Addresses table not found. Please run the provided SQL schema.");
       }
       return;
    }

    if (data) {
      setAddresses(data.map(addr => ({
        id: addr.skin_id,
        fullName: `${addr.skin_first_name} ${addr.skin_last_name}`,
        street: addr.skin_address,
        line2: addr.skin_address_line2,
        city: addr.skin_city,
        state: addr.skin_state,
        postalCode: addr.skin_zip,
        country: addr.skin_country,
        phone: addr.skin_mobile,
        isDefault: addr.skin_is_default
      })));
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const authId = (await supabase.auth.getUser()).data.user?.id || user?.id;
    if (!authId) return;
    
    setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const supabaseData = {
      skin_first_name: data.fullName.toString().split(' ')[0] || 'Guest',
      skin_last_name: data.fullName.toString().split(' ').slice(1).join(' ') || 'User',
      skin_address: data.street,
      skin_address_line2: data.line2 || '',
      skin_city: data.city,
      skin_state: data.state,
      skin_zip: data.zip || '',
      skin_country: 'India',
      skin_mobile: data.phone,
      skin_user_id: authId,
      skin_is_default: addresses.length === 0
    };
    
    let res;
    if (editingAddress?.id && editingAddress.id !== '1') {
      res = await supabase.from('skin_addresses').update(supabaseData).eq('skin_id', editingAddress.id);
    } else {
      res = await supabase.from('skin_addresses').insert({
        ...supabaseData,
        skin_id: crypto.randomUUID()
      });
    }

    if (res.error) {
       alert("Error: " + res.error.message);
    } else {
      setIsAddressModalOpen(false);
      fetchAddresses();
    }
    setIsSaving(false);
  };

  if (isCheckingAuth) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-accent-gold" size={40} /></div>;

  return (
    <main className="min-h-screen bg-secondary-ivory/30">
      <Navbar />
      
      <div className="pt-32 pb-24">
        <div className="container max-w-5xl">
          
          {dbError && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4">
               <AlertTriangle className="text-red-600 shrink-0 mt-1" size={24} />
               <div className="flex-1">
                  <p className="font-black text-sm uppercase tracking-widest text-red-700">Action Required: Database Schema Missing</p>
                  <p className="text-xs font-medium text-red-600 mt-1 leading-relaxed">{dbError}</p>
               </div>
               <button onClick={() => window.location.reload()} className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors"><RefreshCw size={18} /></button>
            </motion.div>
          )}

          <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-secondary-ivory mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-accent-gold flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-accent-gold/20">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-black text-text-dark mb-2 tracking-tighter">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Mail size={14} className="text-accent-gold" /> {user?.email}</div>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-accent-gold" /> {user?.phone}</div>
                </div>
              </div>
              <Button variant="ghost" onClick={logout} className="text-red-500 hover:bg-red-50 rounded-2xl h-12 px-6 font-black text-[10px] tracking-widest uppercase">
                <LogOut size={16} className="mr-2" /> Logout
              </Button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-secondary-ivory">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-xl font-black flex items-center gap-3 text-text-dark">
                      <MapPin size={22} className="text-accent-gold" /> Shipping Addresses
                    </h2>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Manage your delivery locations</p>
                  </div>
                  <button 
                    onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
                    className="p-3 bg-secondary-ivory text-text-dark rounded-full hover:bg-accent-gold hover:text-white transition-all shadow-sm"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-accent-gold" size={32} /></div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="group p-6 rounded-[2rem] border border-secondary-ivory hover:border-accent-gold transition-all duration-500 relative bg-white hover:shadow-xl shadow-accent-gold/5">
                        {addr.isDefault && (
                          <div className="absolute top-6 right-6 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-accent-gold bg-accent-gold/5 px-2 py-1 rounded-full">
                            <CheckCircle2 size={10} /> Default
                          </div>
                        )}
                        <div className="mb-6">
                          <p className="text-sm font-black text-text-dark uppercase tracking-tight">{addr.fullName}</p>
                          <p className="text-xs text-text-muted mt-2 font-medium leading-relaxed italic">
                            {addr.street}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-[10px] font-black text-accent-gold mt-4 uppercase tracking-[0.2em]">{addr.phone}</p>
                        </div>
                        <div className="flex items-center gap-6 pt-6 border-t border-secondary-ivory/50">
                          <button onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }} className="text-[10px] font-black uppercase tracking-widest text-text-dark hover:text-accent-gold transition-colors flex items-center gap-2"><Edit2 size={12} /> Edit</button>
                          <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('skin_addresses').delete().eq('skin_id', addr.id); fetchAddresses(); } }} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors flex items-center gap-2"><Trash2 size={12} /> Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-secondary-ivory/30 rounded-[2rem] border border-dashed border-secondary-ivory">
                     <MapPin size={40} className="mx-auto text-secondary-ivory mb-4" />
                     <p className="text-sm font-bold text-text-muted">No addresses saved yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-secondary-ivory h-full">
                <h2 className="text-xl font-black mb-10 flex items-center gap-3 text-text-dark">
                  <ShoppingBag size={22} className="text-accent-gold" /> Account Links
                </h2>
                
                <div className="space-y-4">
                  <Link href="/account/orders" className="flex items-center justify-between p-6 rounded-2xl bg-secondary-ivory/50 hover:bg-secondary-ivory transition-all group border border-transparent hover:border-accent-gold/20 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-accent-gold group-hover:bg-accent-gold group-hover:text-white transition-all"><ShoppingBag size={20} /></div>
                      <div>
                        <p className="text-sm font-black text-text-dark uppercase tracking-tight">Order History</p>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-1">Track & Manage</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddressModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
              <div className="p-10">
                <h3 className="text-2xl font-black text-text-dark mb-10 tracking-tight">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                <form className="space-y-6" onSubmit={handleSaveAddress}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Full Name</label>
                      <input name="fullName" type="text" className="w-full bg-secondary-ivory/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm focus:border-accent-gold focus:bg-white outline-none transition-all font-bold" defaultValue={editingAddress?.fullName} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Phone Number</label>
                      <input name="phone" type="tel" className="w-full bg-secondary-ivory/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm focus:border-accent-gold focus:bg-white outline-none transition-all font-bold" defaultValue={editingAddress?.phone} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Street Address</label>
                    <input name="street" type="text" className="w-full bg-secondary-ivory/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm focus:border-accent-gold focus:bg-white outline-none transition-all font-bold" placeholder="House number and street name" defaultValue={editingAddress?.street} required />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">City</label>
                      <input name="city" type="text" className="w-full bg-secondary-ivory/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm focus:border-accent-gold focus:bg-white outline-none transition-all font-bold" defaultValue={editingAddress?.city} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">State</label>
                      <input name="state" type="text" className="w-full bg-secondary-ivory/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm focus:border-accent-gold focus:bg-white outline-none transition-all font-bold" defaultValue={editingAddress?.state} required />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10">
                    <button type="submit" disabled={isSaving} className="flex-1 bg-text-dark text-white rounded-2xl h-16 font-black text-xs tracking-widest uppercase hover:bg-accent-gold transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'SAVE ADDRESS'}
                    </button>
                    <button type="button" className="flex-1 bg-secondary-ivory text-text-dark rounded-2xl h-16 font-black text-xs tracking-widest uppercase hover:bg-gray-200 transition-all" onClick={() => setIsAddressModalOpen(false)}>CANCEL</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
