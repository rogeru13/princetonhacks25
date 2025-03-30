import type { Metadata } from "next";
import { Poppins, Alfa_Slab_One } from "next/font/google";
import "./globals.css";
import { UserProvider } from '@auth0/nextjs-auth0/client';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const alfaSlab = Alfa_Slab_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-alfa-slab',
});

export const metadata: Metadata = {
  title: "Patient Dashboard",
  description: "Monitor your health metrics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${alfaSlab.variable}`}>
      <body className="font-sans bg-cream">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

