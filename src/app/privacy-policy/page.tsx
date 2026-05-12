import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-40 pb-24">
        <div className="container max-w-4xl">
          <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <Shield size={12} /> Privacy Protection
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-text-dark mb-4">Privacy Policy</h1>
            <p className="text-text-muted font-medium italic">Last Updated: May 2026</p>
          </header>

          <div className="prose prose-neutral max-w-none space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Eye className="text-accent-gold" size={24} /> 1. Information We Collect
              </h2>
              <p className="text-text-muted leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, make a purchase, or communicate with us. This includes your name, email address, shipping address, and payment information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Lock className="text-accent-gold" size={24} /> 2. How We Use Your Data
              </h2>
              <p className="text-text-muted leading-relaxed">
                Your data is used to process orders, personalize your experience, and improve our services. We never sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <FileText className="text-accent-gold" size={24} /> 3. Data Security
              </h2>
              <p className="text-text-muted leading-relaxed">
                We implement industry-standard security measures to protect your data. All payments are processed through secure gateways, and we do not store sensitive credit card information on our servers.
              </p>
            </section>

            <div className="p-8 bg-secondary-ivory/30 rounded-[2rem] border border-secondary-ivory">
              <p className="text-sm font-medium text-text-dark leading-relaxed italic">
                Questions about our policy? Contact our data protection officer at <span className="font-bold border-b border-black">privacy@cosrxindia.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
