import React from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  ShoppingBag,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function AdminCustomersPage() {
  const supabase = createClient();
  
  // Fetch from the correct consolidated table 'skin_user_profiles'
  const { data: customers } = await supabase
    .from('skin_user_profiles')
    .select(`
      *,
      skin_orders (count)
    `)
    .order('skin_created_at', { ascending: false });

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-text-dark">Customers</h1>
          <p className="text-text-muted mt-2 font-medium">Manage user accounts and view purchase history from the skin_user_profiles table.</p>
        </div>
        <Button className="h-14 px-10 rounded-full font-black tracking-widest bg-text-dark hover:bg-accent-gold transition-all duration-300">
          EXPORT CUSTOMER DATA
        </Button>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-secondary-ivory">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by email or phone..." 
            className="w-full bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-accent-gold"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-secondary-ivory overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary-ivory/30 border-b border-secondary-ivory">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Account</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Contact Info</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Orders</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Joined</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-ivory">
              {customers?.map((customer) => (
                <tr key={customer.skin_id} className="hover:bg-secondary-ivory/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-text-dark flex items-center justify-center text-white font-black shadow-lg">
                        {customer.skin_email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-text-dark text-sm truncate max-w-[200px]">{customer.skin_email}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">#{customer.skin_id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-xs font-bold text-text-dark">
                        <Mail size={12} className="text-text-muted" /> {customer.skin_email}
                      </p>
                      <p className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                        <Phone size={12} className="text-text-muted" /> {customer.skin_phone || 'No Mobile'}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-green-50 text-green-600 border-green-100 flex items-center gap-1.5 w-fit">
                      <Shield size={10} /> Active
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-black text-sm">
                      <ShoppingBag size={14} className="text-text-muted" /> {customer.skin_orders?.[0]?.count || 0}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                      <Calendar size={12} /> {new Date(customer.skin_created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2.5 bg-secondary-ivory/50 rounded-xl text-text-muted hover:text-accent-gold hover:bg-white hover:shadow-md transition-all">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2.5 bg-secondary-ivory/50 rounded-xl text-text-muted hover:text-text-dark hover:bg-white hover:shadow-md transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
