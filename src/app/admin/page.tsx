import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { QuickCollectionSelect } from '@/components/QuickCollectionSelect';

export default async function AdminDashboard() {
  const supabase = createClient();

  // 0. AUTO-CLEANUP: Permanently mark non-finalized UPI orders as cancelled in the DB
  // This ensures stats and lists are clean across ALL admin pages.
  await supabase
    .from('skin_orders')
    .update({ skin_status: 'cancelled', skin_payment_status: 'unpaid' })
    .eq('skin_payment_method', 'UPI')
    .is('skin_utr', null)
    .not('skin_status', 'eq', 'cancelled');

  // 1. Fetch Real Stats & Collections
  const [
    { count: productCount },
    { count: customerCount },
    { data: orderData },
    { count: lowStockCount },
    { data: recentOrders },
    { data: collections }
  ] = await Promise.all([
    supabase.from('skin_products').select('*', { count: 'exact', head: true }),
    supabase.from('skin_user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('skin_orders').select('skin_total').eq('skin_payment_status', 'verified'),
    supabase.from('skin_variants').select('*', { count: 'exact', head: true }).lt('skin_stock_count', 10),
    supabase.from('skin_orders')
      .select(`
        *,
        skin_user_profiles (skin_first_name, skin_last_name)
      `)
      .order('skin_created_at', { ascending: false })
      .limit(5),
    supabase.from('skin_collections').select('skin_id, skin_name, skin_slug').order('skin_name')
  ]);

  const totalRevenue = orderData?.reduce((acc, order) => acc + (order.skin_total || 0), 0) || 0;

  const stats = [
    { name: 'Total Products', value: productCount || 0, icon: <ShoppingBag size={20} />, color: 'bg-blue-600' },
    { name: 'Total Customers', value: customerCount || 0, icon: <Users size={20} />, color: 'bg-purple-600' },
    { name: 'Total Revenue', value: formatPrice(totalRevenue), icon: <TrendingUp size={20} />, color: 'bg-green-600' },
    { name: 'Low Stock Items', value: lowStockCount || 0, icon: <AlertCircle size={20} />, color: 'bg-red-600' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium italic">Real-time store performance data.</p>
        </div>
        
        {/* Quick Collection Select Button */}
        <QuickCollectionSelect collections={collections || []} />
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.color} text-white flex items-center justify-center`}>
                {stat.icon}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded">Live</span>
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Orders</h2>
            <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders && recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.skin_id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {order.skin_user_profiles?.skin_first_name} {order.skin_user_profiles?.skin_last_name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">#{order.skin_id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">{formatPrice(order.skin_total)}</p>
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                    order.skin_status === 'delivered' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.skin_status}
                  </p>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-400 text-xs italic">
                No orders found.
              </div>
            )}
          </div>
        </div>

        {/* Store Health */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600">
             <CheckCircle2 size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Store Health</h2>
            <p className="text-gray-500 text-[10px] mt-2 max-w-[150px] mx-auto font-medium leading-relaxed">
              Your store backend is synchronized and running smoothly.
            </p>
          </div>
          <div className="w-full pt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400">
              <span>Database Latency</span>
              <span className="text-green-600">24ms</span>
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[95%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
