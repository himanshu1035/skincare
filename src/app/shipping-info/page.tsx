import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Truck, ShieldCheck, Clock, Package } from 'lucide-react';

export default function ShippingInfoPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="container pt-32 pb-24 flex-1">
        <header className="mb-16">
          <h1 className="text-5xl font-black tracking-tighter text-text-dark uppercase italic leading-none">Shipping & Delivery</h1>
          <p className="text-text-muted mt-4 text-lg font-medium italic">Global logistics for premium skincare.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section className="space-y-8">
            <div className="bg-secondary-ivory/30 p-10 rounded-[3rem] border border-secondary-ivory">
              <div className="flex items-center gap-4 mb-6 text-accent-gold">
                <Truck size={32} />
                <h2 className="text-2xl font-black uppercase tracking-tight italic">Delivery Timeline</h2>
              </div>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">01</div>
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest text-text-dark">Metro Cities</p>
                    <p className="text-sm text-text-muted mt-1 italic font-medium">Delivery within 2-4 business days.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">02</div>
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest text-text-dark">Other Regions</p>
                    <p className="text-sm text-text-muted mt-1 italic font-medium">Delivery within 5-7 business days.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-text-dark p-12 rounded-[3.5rem] text-white shadow-2xl">
               <h3 className="text-2xl font-black uppercase tracking-widest mb-6 italic">Tracking Protocol</h3>
               <p className="text-white/60 text-sm font-medium mb-10 leading-relaxed italic">
                  Once your order is dispatched, a tracking ID will be shared via Email and SMS. You can also monitor your order status in the "My Orders" section.
               </p>
               <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Courier Partners: <span className="text-accent-gold">BlueDart, Delhivery, XpressBees</span>
               </div>
            </div>
          </section>

          <section className="space-y-12 py-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-accent-gold uppercase tracking-[0.4em]">Service Standards</h3>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: <Clock />, title: "Dispatched in 24h", text: "Orders are processed and handed over to logistics within 24 hours." },
                  { icon: <ShieldCheck />, title: "Insured Transit", text: "Every shipment is covered by premium transit insurance." },
                  { icon: <Package />, title: "Tamper-Proof", text: "Products are shipped in eco-friendly, tamper-evident packaging." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="text-text-dark pt-1">{item.icon}</div>
                    <div>
                      <p className="font-black uppercase text-sm tracking-tight">{item.title}</p>
                      <p className="text-sm text-text-muted mt-1 font-medium italic">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
