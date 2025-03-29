"use client";

import { useState } from 'react';
import { UserCircleIcon, BellIcon, CogIcon } from '@heroicons/react/24/outline';

interface ProfileSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: ProfileSection[] = [
  { id: 'personal', label: 'Personal Info', icon: <UserCircleIcon className="w-5 h-5" /> },
  { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <CogIcon className="w-5 h-5" /> },
];

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState('personal');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-vintage-200 overflow-hidden">
        {/* Profile Header */}
        <div className="border-b border-vintage-200 p-5">
          <h1 className="text-2xl font-alfa-slab text-vintage-900">Profile</h1>
          <p className="text-sm text-vintage-900/70 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 border-b md:border-b-0 md:border-r border-vintage-200">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors
                  ${activeSection === section.id 
                    ? 'bg-vintage-50 text-brick-600 border-r-2 border-brick-500' 
                    : 'text-vintage-900/70 hover:bg-vintage-50'
                  }`}
              >
                <span>{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeSection === 'personal' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-vintage-900/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                    focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vintage-900/70 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                    focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vintage-900/70 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                    focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                  />
                </div>
                <button
                  className="bg-brick-500 text-white rounded-lg py-2.5 px-4 font-medium
                  hover:bg-brick-600 focus:ring-2 focus:ring-brick-500/50 focus:ring-offset-2 
                  transition-all duration-200 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            )}
            {/* Add other sections as needed */}
          </div>
        </div>
      </div>
    </div>
  );
} 