import type { Metadata } from "next";
import { Poppins, Alfa_Slab_One } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${poppins.variable} ${alfaSlab.variable} font-poppins antialiased bg-cream`}>
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 bg-cream">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
