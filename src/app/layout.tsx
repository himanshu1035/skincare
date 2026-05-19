import React, { Suspense } from 'react';
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { CouponPreApplier } from '@/components/CouponPreApplier';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COSRX Official Store | Expecting Tomorrow",
  description: "Dermatologically tested skincare for all skin types. Shop the official COSRX store for Snail Mucin, Retinol, and more.",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <Suspense fallback={null}>
          <CouponPreApplier />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
