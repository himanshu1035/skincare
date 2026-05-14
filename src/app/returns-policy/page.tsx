import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RefreshCcw, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="container pt-32 pb-24 flex-1">
        <header className="mb-16">
          <h1 className="text-5xl font-black tracking-tighter text-text-dark uppercase italic leading-none">Returns & Refunds</h1>
          <p className="text-text-muted mt-4 text-lg font-medium italic">Your satisfaction is our absolute priority.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-text-dark">
                <RefreshCcw size={28} />
                <h2 className="text-2xl font-black uppercase tracking-tight italic">7-Day Return Window</h2>
              </div>
              <p className="text-text-muted text-lg font-medium leading-relaxed italic border-l-4 border-accent-gold pl-8">
                We offer a hassle-free 7-day return policy for products that are damaged during transit, have manufacturing defects, or if the wrong item was delivered.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-8 bg-green-50 rounded-[2.5rem] border border-green-100">
                  <CheckCircle className="text-green-600 mb-4" size={24} />
                  <p className="font-black text-xs uppercase tracking-widest text-green-700 mb-2">Eligible Cases</p>
                  <ul className="text-[11px] font-bold text-green-600 space-y-2 uppercase">
                    <li>• Damaged Packaging</li>
                    <li>• Expired Product</li>
                    <li>• Wrong Item Shipped</li>
                    <li>• Incomplete Order</li>
                  </ul>
                </div>
                <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100">
                  <AlertTriangle className="text-red-600 mb-4" size={24} />
                  <p className="font-black text-xs uppercase tracking-widest text-red-700 mb-2">Non-Eligible Cases</p>
                  <ul className="text-[11px] font-bold text-red-600 space-y-2 uppercase">
                    <li>• Opened/Used Products</li>
                    <li>• Change of Mind</li>
                    <li>• Sale/Clearance Items</li>
                    <li>• Missing Original Labels</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-12 border-t border-secondary-ivory">
              <h3 className="text-xl font-black uppercase italic text-text-dark">The Refund Process</h3>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Initiate Request", text: "Contact us via the Support Center with images of the product." },
                  { step: "02", title: "Verification", text: "Our Quality Control team will verify the claim within 48 hours." },
                  { step: "03", title: "Pickup", text: "We will arrange a free return pickup from your address." },
                  { step: "04", title: "Reimbursement", text: "Refunds are processed to the original payment method in 5-7 days." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <span className="text-4xl font-black text-secondary-ivory group-hover:text-accent-gold transition-colors duration-500">{item.step}</span>
                    <div>
                      <p className="font-black uppercase text-sm tracking-tight text-text-dark">{item.title}</p>
                      <p className="text-sm text-text-muted mt-1 font-medium italic">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-secondary-ivory/50 p-12 rounded-[3.5rem] border border-secondary-ivory text-center">
               <HelpCircle className="mx-auto mb-6 text-text-muted" size={48} />
               <h3 className="text-xl font-black uppercase italic mb-4">Need Help?</h3>
               <p className="text-text-muted text-sm font-medium mb-8 leading-relaxed italic">
                  Not sure if your case is eligible? Our team is available 24/7 to guide you.
               </p>
               <a href="/support" className="block w-full h-14 bg-text-dark text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-accent-gold transition-all shadow-lg">
                  OPEN SUPPORT TICKET
               </a>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
