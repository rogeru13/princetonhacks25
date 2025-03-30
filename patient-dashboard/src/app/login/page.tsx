'use client';

import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-vintage-900 to-vintage-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-md mx-auto text-center">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-xl bg-brick-500 flex items-center justify-center overflow-hidden mb-4">
              <Image
                src="/manzana.png"
                alt="Manzana Logo"
                width={100}
                height={100}
                className="w-24 h-24 object-contain"
              />
            </div>
            <h1 className="text-white font-alfa-slab text-3xl">Manzana</h1>
            <p className="text-vintage-100/70 mt-2">Patient Dashboard</p>
          </div>

          {/* Login Button */}
          <a
            href="/api/auth/login"
            className="inline-block w-full px-4 py-3 text-sm font-medium text-white bg-brick-500 rounded-md hover:bg-brick-600 transition-colors"
          >
            Start My Journey
          </a>
        </div>
      </div>
    </div>
  );
} 