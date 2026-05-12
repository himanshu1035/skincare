import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Gavel, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-40 pb-24">
        <div className="container max-w-4xl">
          <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <Gavel size={12} /> Legal Framework
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-text-dark mb-4">Terms of Service</h1>
            <p className="text-text-muted font-medium italic">Effective Date: May 2026</p>
          </header>

          <div className="prose prose-neutral max-w-none space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Scale className="text-accent-gold" size={24} /> 1. Agreement to Terms
              </h2>
              <p className="text-text-muted leading-relaxed">
                By accessing our website and making purchases, you agree to be bound by these terms. If you do not agree with any part of these terms, you are prohibited from using this site.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <AlertCircle className="text-accent-gold" size={24} /> 2. Shipping & Delivery
              </h2>
              <p className="text-text-muted leading-relaxed">
                Delivery times are estimates and not guarantees. We are not responsible for delays caused by logistics partners, customs, or incorrect address information provided by the customer.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <CheckCircle2 className="text-accent-gold" size={24} /> 3. Returns & Refunds
              </h2>
              <p className="text-text-muted leading-relaxed">
                Due to the hygiene-sensitive nature of skincare products, we only accept returns for items that arrived damaged or defective. Claims must be made within 48 hours of delivery with proof of damage.
              </p>
            </section>

            <div className="bg-text-dark text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <p className="text-sm font-bold leading-relaxed relative z-10">
                 COSRX Official Store reserves the right to modify these terms at any time. Your continued use of the site after changes constitutes acceptance of the new terms.
               </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
