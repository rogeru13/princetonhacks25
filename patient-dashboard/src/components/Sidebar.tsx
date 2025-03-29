"use client";

import Link from 'next/link';
import { useState } from 'react';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: "📊", label: "Dashboard", href: "/" },
  { icon: "👤", label: "Profile", href: "/profile" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-20 bg-purple-500 text-white p-2 rounded-lg"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-10
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
        bg-gradient-to-b from-purple-600 via-purple-500 to-purple-400 
        text-white w-64 min-h-screen p-4
      `}>
        <div className="flex items-center gap-3 mb-12 p-2">
          <span className="text-2xl font-bold tracking-tight">WD</span>
          <span className="font-medium text-sm tracking-wider uppercase">Health Dashboard</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)} // Close menu when clicking a link on mobile
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
} 