"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip check for login page itself
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    const auth = sessionStorage.getItem('admin_auth');
    if (auth !== 'true') {
      router.replace('/admin/login');
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Fast-path for unauthorized or loading
  if (isAuthorized === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
      </div>
    );
  }

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-secondary-ivory/20 text-text-dark font-sans selection:bg-accent-gold/20">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden p-6 md:p-10 scroll-smooth">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-accent-gold" size={32} />
            </div>
          }>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
