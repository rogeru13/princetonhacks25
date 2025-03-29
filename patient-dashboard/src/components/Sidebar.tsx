"use client";

import Link from 'next/link';
import { useState } from 'react';
import { HomeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { 
    icon: <HomeIcon className="w-5 h-5" />, 
    label: "Dashboard", 
    href: "/" 
  },
  { 
    icon: <UserCircleIcon className="w-5 h-5" />, 
    label: "Profile", 
    href: "/profile" 
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-20 p-2 rounded-lg bg-brick-500 text-white shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-10
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
        bg-vintage-900 w-64 min-h-screen
      `}>
        {/* Logo Section */}
        <div className="border-b border-vintage-200/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-brick-500 flex items-center justify-center overflow-hidden">
              <Image
                src="/manzana.png"
                alt="Manzana Logo"
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
              />
            </div>
            <div>
              <h1 className="text-white font-alfa-slab text-xl">Manzana</h1>
              <p className="text-vintage-100/70 text-sm">EST. 2025</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="px-3 py-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 mb-2 text-vintage-100 hover:bg-vintage-200/10 rounded-lg transition-colors group"
            >
              <span className="group-hover:text-brick-500 transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-medium tracking-wide group-hover:text-brick-500 transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="p-4 rounded-lg bg-vintage-200/10 border border-vintage-200/20">
            <p className="text-sm text-vintage-100/70 mb-1">Next Check-up</p>
            <p className="text-vintage-100 font-medium">February 15, 2025</p>
          </div>
        </div>
      </div>
    </>
  );
} 