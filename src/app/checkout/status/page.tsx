"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { XCircle, CheckCircle, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  const isFailed = status === 'failed' || status === 'cancelled';
  const isSuccess = status === 'success';

  return (
    <div className="container max-w-2xl text-center py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[3rem] p-12 shadow-xl border border-secondary-ivory"
      >
        {isFailed ? (
          <>
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle size={48} />
            </div>
            <h1 className="text-3xl font-bold text-red-500 mb-4">Payment Failed</h1>
            <p className="text-text-muted mb-10 leading-relaxed">
              We couldn't process your payment. This could be due to a technical error or the transaction was cancelled. 
              Don't worry, your items are still in your cart.
            </p>
            <div className="space-y-4">
              <Button size="lg" className="w-full bg-red-500 hover:bg-red-600" onClick={() => router.push('/checkout')}>
                TRY AGAIN
              </Button>
              <Button variant="ghost" size="lg" className="w-full" onClick={() => router.push('/')}>
                <ArrowLeft size={16} className="mr-2" /> RETURN TO SHOP
              </Button>
            </div>
          </>
        ) : isSuccess ? (
          <>
            <div className="w-20 h-20 bg-accent-gold/10 text-accent-gold rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={48} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-text-dark mb-4">Order Received!</h1>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Order ID: <span className="text-text-dark">#{orderId || '12345'}</span></p>
            <p className="text-sm text-text-muted mb-10 leading-relaxed font-medium">
              Thank you for your order! Your payment is currently <span className="font-bold text-text-dark underline decoration-accent-gold">Pending Manual Verification</span>. 
              Our team will verify your transaction shortly, after which your order will be officially accepted and prepared for shipping.
            </p>
            <div className="space-y-4">
              <Button size="lg" className="w-full" onClick={() => router.push('/account/orders')}>
                VIEW MY ORDERS
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => router.push('/')}>
                CONTINUE SHOPPING
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-secondary-ivory text-accent-gold rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle size={48} />
            </div>
            <h1 className="text-3xl font-bold text-text-dark mb-4">Unknown Status</h1>
            <p className="text-text-muted mb-10 leading-relaxed">
              We're not sure what happened with your transaction. Please check your account for order updates.
            </p>
            <Button size="lg" className="w-full" onClick={() => router.push('/')}>
              BACK TO HOME
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <main className="min-h-screen bg-secondary-ivory/30">
      <Navbar />
      <div className="pt-20">
        <Suspense fallback={<div className="text-center py-40">Loading status...</div>}>
          <StatusContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
