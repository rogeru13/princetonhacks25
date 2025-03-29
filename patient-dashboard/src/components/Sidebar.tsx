"use client";

import Link from 'next/link';
import { useState } from 'react';
import { HomeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

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
            <div className="w-10 h-10 rounded-lg bg-brick-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
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