"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AccountPage as AccountComponent } from '@/components/AccountPage';

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32">
        <AccountComponent />
      </div>
      <Footer />
    </main>
  );
}
