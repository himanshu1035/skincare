import React from 'react';
import { createClient } from '@/lib/supabase';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomerTable } from './CustomerTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCustomersPage() {
  const supabase = createClient();
  
  // 1. Fetch Customers and Marketers separately to prevent join errors
  const { data: customers, error: customerError } = await supabase
    .from('skin_user_profiles')
    .select('*')
    .order('skin_created_at', { ascending: false });

  const { data: allMarketers } = await supabase
    .from('skin_marketers')
    .select('skin_id');

  if (customerError) {
    console.error("Supabase Customer Fetch Error:", customerError);
  }

  // 2. Fetch ALL orders to join in-memory (Failsafe for Join Errors)
  const { data: allOrders, error: orderError } = await supabase
    .from('skin_orders')
    .select('*');

  if (orderError) {
    console.error("Supabase Orders Fetch Error:", orderError);
  }

  // 3. Join in memory and Calculate stats
  const customersWithStats = (customers || [])
    .filter(customer => !(allMarketers || []).some(m => m.skin_id === customer.skin_id)) // Remove Marketers
    .map(customer => {
      const orders = (allOrders || []).filter(o => o.skin_user_id === customer.skin_id);
      
      const totalSpent = orders
        .filter((o: any) => o.skin_payment_status === 'verified' || o.skin_status === 'delivered')
        .reduce((acc: number, o: any) => acc + (Number(o.skin_total_amount) || Number(o.skin_total) || 0), 0);
      
      const lastOrder = orders.length > 0 
        ? new Date(Math.max(...orders.map((o: any) => new Date(o.skin_created_at).getTime())))
        : null;
  
      return {
        ...customer,
        totalSpent,
        lastOrderDate: lastOrder,
        orderCount: orders.length
      };
    });

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

      <CustomerTable customers={customersWithStats || []} />
    </div>
  );
}
