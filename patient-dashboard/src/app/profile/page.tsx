"use client";

import { useState, useEffect } from 'react';
import { UserCircleIcon, BellIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { PatientProfile, Gender, SmokingHistory } from '@/types/patient';
import { supabase } from '@/lib/supabase';
import { useUser } from '@auth0/nextjs-auth0/client';
import Sidebar from '@/components/Sidebar';

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
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState('personal');
  const [profile, setProfile] = useState<PatientProfile>({
    name: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'other',
    country: '',
    hypertension: false,
    heart_disease: false,
    diabetes: false,
    pre_diabetic: false,
    obesity: false,
    asthma: false,
    family_history: false
  });
  const [saveStatus, setSaveStatus] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    async function initializePatient() {
      if (!user?.sub) return;

      try {
        // First check if this Auth0 user already has a patient record
        const { data: existingPatient, error: fetchError } = await supabase
          .from('patients')
          .select('*')
          .eq('auth0_id', user.sub)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // No patient exists for this Auth0 user, create one
          const { data: newPatient, error: createError } = await supabase
            .from('patients')
            .insert([{
              id: crypto.randomUUID(),
              auth0_id: user.sub,
              first_name: user.given_name || '',
              last_name: user.family_name || '',
              gender: 'other',
              country: '',
              dob: null,
              hypertension: false,
              heart_disease: false,
              diabetes: false,
              pre_diabetic: false,
              obesity: false,
              asthma: false,
              family_history: false
            }])
            .select()
            .single();

        if (createError) {
          console.error('Error creating patient:', createError);
          return;
        }

        setProfile({
          ...profile,
          firstName: newPatient.first_name,
          lastName: newPatient.last_name,
          gender: newPatient.gender,
          country: newPatient.country,
          dob: newPatient.dob || '',
          hypertension: newPatient.hypertension,
          heart_disease: newPatient.heart_disease,
          diabetes: newPatient.diabetes,
          pre_diabetic: newPatient.pre_diabetic,
          obesity: newPatient.obesity,
          asthma: newPatient.asthma,
          family_history: newPatient.family_history
        });
      } else if (existingPatient) {
        setProfile({
          ...profile,
          firstName: existingPatient.first_name,
          lastName: existingPatient.last_name,
          gender: existingPatient.gender,
          country: existingPatient.country,
          dob: existingPatient.dob || '',
          hypertension: existingPatient.hypertension,
          heart_disease: existingPatient.heart_disease,
          diabetes: existingPatient.diabetes,
          pre_diabetic: existingPatient.pre_diabetic,
          obesity: existingPatient.obesity,
          asthma: existingPatient.asthma,
          family_history: existingPatient.family_history
        });
      }
    } catch (error) {
      console.error('Error initializing patient:', error);
    }
  }

  initializePatient();
}, [user]);

useEffect(() => {
  // Test Supabase connection
  async function testConnection() {
    try {
      // Try to fetch tables
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .limit(1);

      console.log('Test connection results:');
      console.log('Patients data:', patients);
      console.log('Patients error:', patientsError);

      const { data: dailyReports, error: reportsError } = await supabase
        .from('daily_reports')  // Note: using new table name
        .select('*')
        .limit(1);

      console.log('Daily reports data:', dailyReports);
      console.log('Daily reports error:', reportsError);

    } catch (error) {
      console.error('Connection test error:', error);
    }
  }

  testConnection();
}, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user?.sub) return;

  try {
    console.log('Attempting to update profile for auth0_id:', user.sub);
    
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        first_name: profile.firstName,
        last_name: profile.lastName,
        gender: profile.gender,
        country: profile.country,
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : null,
        hypertension: profile.hypertension,
        heart_disease: profile.heart_disease,
        diabetes: profile.diabetes,
        pre_diabetic: profile.pre_diabetic,
        obesity: profile.obesity,
        asthma: profile.asthma,
        family_history: profile.family_history
      })
      .eq('auth0_id', user.sub);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Verify the update by fetching the updated record
    const { data: updatedPatient, error: fetchError } = await supabase
      .from('patients')
      .select('*')
      .eq('auth0_id', user.sub)
      .single();

    console.log('Updated patient record:', updatedPatient);

    setSaveStatus({
      show: true,
      message: 'Profile updated successfully',
      type: 'success'
    });

    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);

  } catch (error) {
    console.error('Error updating profile:', error);
    setSaveStatus({
      show: true,
      message: error.message || 'Failed to update profile',
      type: 'error'
    });

    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  }
};

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 bg-cream">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <a
                href="/api/auth/logout?returnTo=http://localhost:3000/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brick-600 hover:text-brick-700 bg-brick-50 hover:bg-brick-100 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Sign Out
              </a>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name || 'Profile'}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-medium text-vintage-900">{user?.name}</h2>
                  <p className="text-vintage-600">{user?.email}</p>
                </div>
              </div>

              {/* Additional profile information can go here */}
            </div>
          </div>

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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-vintage-900/70 mb-1">First Name</label>
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                          className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                          focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-vintage-900/70 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                          className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                          focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-vintage-900/70 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={profile.dob}
                        onChange={(e) => setProfile({...profile, dob: e.target.value})}
                        className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                        focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-vintage-900/70 mb-1">Country</label>
                        <input
                          type="text"
                          value={profile.country}
                          onChange={(e) => setProfile({...profile, country: e.target.value})}
                          className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                          focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-vintage-900/70 mb-1">Gender</label>
                        <select
                          value={profile.gender}
                          onChange={(e) => setProfile({...profile, gender: e.target.value})}
                          className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                          focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-vintage-900 mb-3">Health Conditions</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="hypertension"
                            checked={profile.hypertension}
                            onChange={(e) => setProfile({...profile, hypertension: e.target.checked})}
                            className="h-4 w-4 text-brick-500 focus:ring-brick-500/20 border-vintage-300 rounded"
                          />
                          <label htmlFor="hypertension" className="ml-2 text-sm text-vintage-900">Hypertension</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="heart_disease"
                            checked={profile.heart_disease}
                            onChange={(e) => setProfile({...profile, heart_disease: e.target.checked})}
                            className="h-4 w-4 text-brick-500 focus:ring-brick-500/20 border-vintage-300 rounded"
                          />
                          <label htmlFor="heart_disease" className="ml-2 text-sm text-vintage-900">Heart Disease</label>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="diabetes"
                          checked={profile.diabetes}
                          onChange={(e) => setProfile({...profile, diabetes: e.target.checked})}
                          className="h-4 w-4 text-brick-500 focus:ring-brick-500/20 border-vintage-300 rounded"
                        />
                        <label htmlFor="diabetes" className="ml-2 text-sm text-vintage-900">Diabetes</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="pre_diabetic"
                          checked={profile.pre_diabetic}
                          onChange={(e) => setProfile({...profile, pre_diabetic: e.target.checked})}
                          className="h-4 w-4 text-brick-500 focus:ring-brick-500/20 border-vintage-300 rounded"
                        />
                        <label htmlFor="pre_diabetic" className="ml-2 text-sm text-vintage-900">Pre-Diabetic</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="obesity"
                          checked={profile.obesity}
                          onChange={(e) => setProfile({...profile, obesity: e.target.checked})}
                          className="h-4 w-4 text-brick-500 focus:ring-brick-500/20 border-vintage-300 rounded"
                        />
                        <label htmlFor="obesity" className="ml-2 text-sm text-vintage-900">Obesity</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="asthma"
                          checked={profile.asthma}
                          onChange={(e) => setProfile({...profile, asthma: e.target.checked})}
                          className="h-4 w-4 text-brick-500 focus:ring-brick-500/20 border-vintage-300 rounded"
                        />
                        <label htmlFor="asthma" className="ml-2 text-sm text-vintage-900">Asthma</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="family_history"
                          checked={profile.family_history}
                          onChange={(e) => setProfile({...profile, family_history: e.target.checked})}
                          className="h-4 w-4 text-brick-500 focus:ring-brick-500/20 border-vintage-300 rounded"
                        />
                        <label htmlFor="family_history" className="ml-2 text-sm text-vintage-900">Family History</label>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-brick-500 text-white rounded-lg py-2.5 px-4 
                        hover:bg-brick-600 focus:ring-2 focus:ring-brick-500/20 
                        transition-all duration-200"
                      >
                        Save Profile
                      </button>
                    </div>
                  </form>
                )}
                {/* Add other sections as needed */}
              </div>
            </div>
          </div>
        </div>
      </main>
      {saveStatus && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform ${
            saveStatus.show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          } ${
            saveStatus.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-brick-50 text-brick-800 border border-brick-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveStatus.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{saveStatus.message}</span>
          </div>
        </div>
      )}
    </div>
  );
} 