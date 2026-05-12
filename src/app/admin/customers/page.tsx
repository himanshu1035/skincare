import React from 'react';
import { createClient } from '@/lib/supabase';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomerTable } from './CustomerTable';

export default async function AdminCustomersPage() {
  const supabase = createClient();
  
  const { data: customers, error } = await supabase
    .from('skin_user_profiles')
    .select(`
      *,
      skin_orders (count)
    `)
    .order('skin_created_at', { ascending: false });

  if (error) {
    console.error("Supabase Fetch Error:", error);
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-text-dark uppercase">Customer Management</h1>
          <p className="text-text-muted mt-2 font-medium italic">Control user access, update profiles, and manage credentials.</p>
        </div>
        <Button className="h-14 px-10 rounded-full font-black tracking-widest bg-text-dark hover:bg-accent-gold transition-all duration-300 shadow-xl">
          EXPORT DATA
        </Button>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-secondary-ivory">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name, email or phone..." 
            className="w-full bg-secondary-ivory/50 border-none rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-accent-gold font-bold"
          />
        </div>
      </div>

      <CustomerTable customers={customers || []} />
    </div>
  );
}
