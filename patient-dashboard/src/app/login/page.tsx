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
    <div className="min-h-screen bg-vintage-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center">
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
        <div className="mt-8">
          <a
            href="/api/auth/login"
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-brick-500 hover:bg-brick-600 transition-colors"
          >
            Sign in to your account
          </a>
        </div>
      </div>
    </div>
  );
} 