import React from 'react';
import { createClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  User, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  Truck,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  
  const { data: order } = await supabase
    .from('skin_orders')
    .select(`
      *,
      skin_user_profiles (*),
      skin_order_items (
        *,
        skin_products (
          skin_name,
          skin_image_url
        )
      )
    `)
    .eq('skin_id', id)
    .single();

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/admin/orders">
            <button className="w-12 h-12 rounded-full bg-white border border-secondary-ivory flex items-center justify-center text-text-muted hover:text-text-dark hover:shadow-md transition-all">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter text-text-dark">Order Details</h1>
              <span className="bg-accent-gold text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                #{order.skin_id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-text-muted font-black uppercase tracking-widest mt-2">
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.skin_created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.skin_created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none h-14 rounded-full font-black tracking-widest text-[10px] uppercase border-red-500/20 text-red-500 hover:bg-red-50">
            CANCEL ORDER
          </Button>
          <Button className="flex-1 md:flex-none h-14 rounded-full font-black tracking-widest text-[10px] uppercase bg-text-dark hover:bg-accent-gold transition-all duration-300">
            GENERATE INVOICE
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Order Items & Verification */}
        <div className="lg:col-span-2 space-y-8">
          {/* Payment Verification Card */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
                <CreditCard size={20} className="text-accent-gold" /> Payment Verification
              </h2>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                order.skin_payment_status === 'verified' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
              }`}>
                {order.skin_payment_status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Transaction ID (UTR)</p>
                <div className="bg-secondary-ivory/50 p-6 rounded-2xl border-2 border-dashed border-secondary-ivory text-center">
                  <p className="text-2xl font-black font-mono tracking-wider text-text-dark">
                    {order.skin_utr || 'NOT PROVIDED'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Button className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white border-none font-black tracking-widest text-[10px] uppercase shadow-lg shadow-green-600/20">
                  <CheckCircle2 size={16} className="mr-2" /> VERIFY PAYMENT
                </Button>
                <Button variant="ghost" className="h-14 rounded-2xl text-red-500 hover:bg-red-50 font-black tracking-widest text-[10px] uppercase">
                  <XCircle size={16} className="mr-2" /> REJECT PAYMENT
                </Button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-secondary-ivory overflow-hidden">
            <div className="p-8 border-b border-secondary-ivory">
              <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
                <Package size={20} className="text-accent-gold" /> Order Items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-secondary-ivory/30 border-b border-secondary-ivory">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Product</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Qty</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Price</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-ivory">
                  {order.skin_order_items.map((item: any) => (
                    <tr key={item.skin_id}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={item.skin_products?.skin_image_url} alt="" className="w-12 h-12 rounded-xl bg-secondary-ivory object-contain p-1" />
                          <p className="font-bold text-sm text-text-dark">{item.skin_products?.skin_name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-bold text-sm">{item.skin_quantity}</td>
                      <td className="px-8 py-6 text-right font-bold text-sm">{formatPrice(item.skin_price)}</td>
                      <td className="px-8 py-6 text-right font-black text-sm">{formatPrice(item.skin_price * item.skin_quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-secondary-ivory/10 font-black">
                  <tr>
                    <td colSpan={3} className="px-8 py-6 text-right text-text-muted uppercase tracking-widest text-[10px]">Total Amount</td>
                    <td className="px-8 py-6 text-right text-2xl text-text-dark">{formatPrice(order.skin_total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Shipping */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
            <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <User size={20} className="text-accent-gold" /> Customer
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-secondary-ivory">
                <div className="w-14 h-14 rounded-full bg-accent-gold text-white flex items-center justify-center text-xl font-black">
                  {order.skin_user_profiles?.skin_first_name?.[0]}{order.skin_user_profiles?.skin_last_name?.[0]}
                </div>
                <div>
                  <p className="font-black text-text-dark">{order.skin_user_profiles?.skin_first_name} {order.skin_user_profiles?.skin_last_name}</p>
                  <p className="text-xs text-text-muted font-bold mt-1">{order.skin_user_profiles?.skin_email}</p>
                </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <span>Phone Number</span>
                  <span className="text-text-dark">{order.skin_user_profiles?.skin_phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <span>Customer Since</span>
                  <span className="text-text-dark">{new Date(order.skin_user_profiles?.skin_created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black tracking-widest uppercase">
                VIEW PROFILE
              </Button>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-secondary-ivory space-y-8">
            <h2 className="text-xl font-black tracking-tighter text-text-dark flex items-center gap-3">
              <MapPin size={20} className="text-accent-gold" /> Shipping Address
            </h2>
            <div className="p-6 bg-secondary-ivory/30 rounded-2xl border border-secondary-ivory">
              <p className="text-sm font-bold text-text-dark leading-relaxed">
                {order.skin_shipping_address || 'No shipping address provided.'}
              </p>
            </div>
            <Button variant="ghost" className="w-full text-accent-gold font-black tracking-widest text-[10px] uppercase">
              <Truck size={16} className="mr-2" /> EDIT SHIPPING DETAILS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
