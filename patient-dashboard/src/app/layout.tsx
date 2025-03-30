import type { Metadata } from "next";
import { Poppins, Alfa_Slab_One } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { headers } from 'next/headers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const alfaSlab = Alfa_Slab_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-alfa-slab',
});

export const metadata: Metadata = {
  title: "Patient Dashboard",
  description: "Track your daily health metrics",
};

function isPublicPath(path: string) {
  return path === '/login' || path.startsWith('/api/auth');
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '/';
  
  // Only show sidebar if user is authenticated (handled in page component)
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${poppins.variable} ${alfaSlab.variable} font-poppins antialiased bg-cream`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

