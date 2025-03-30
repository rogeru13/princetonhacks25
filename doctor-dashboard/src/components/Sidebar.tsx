"use client";

import Link from 'next/link';
import { useState } from 'react';
import { HomeIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';
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
    icon: <UsersIcon className="w-5 h-5" />, 
    label: "Patients", 
    href: "/patients" 
  },
  { 
    icon: <ChartBarIcon className="w-5 h-5" />, 
    label: "Analytics", 
    href: "/analytics" 
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-20 p-2 rounded-lg bg-blue-600 text-white shadow-lg"
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
        bg-gray-900 w-64 min-h-screen
      `}>
        {/* Logo Section */}
        <div className="border-b border-gray-200/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden">
              <Image
                src="/manzana.png"
                alt="Manzana Logo"
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Manzana MD</h1>
              <p className="text-gray-400 text-sm">Doctor Portal</p>
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
              className="flex items-center gap-3 px-4 py-3 mb-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <span className="group-hover:text-blue-500 transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-medium tracking-wide group-hover:text-blue-500 transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
} 