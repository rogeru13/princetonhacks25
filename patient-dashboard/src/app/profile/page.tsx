"use client";

import { useState, useEffect } from 'react';
import { UserCircleIcon, BellIcon, CogIcon } from '@heroicons/react/24/outline';
import { PatientProfile, Gender, SmokingHistory } from '@/types/patient';
import { supabase } from '@/lib/supabase';

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
  const [user, setUser] = useState(null);
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
    family_history: false,
    smokingHistory: 'never'
  });

  const PATIENT_ID = "14a799bc-2bfd-48b1-a96e-ac394bce8114"; // New test ID

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

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

  useEffect(() => {
    // Load the patient data
    async function loadPatient() {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', PATIENT_ID)
          .single();
        
        console.log('Patient data structure:', data);
        
        if (data) {
          // Update the profile state with John Harvard's existing data
          setProfile({
            ...profile,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            gender: data.gender || 'other',
            country: data.country || '',
            dob: data.dob || ''
          });
        }
        
      } catch (error) {
        console.error('Error loading patient:', error);
      }
    }
    
    loadPatient();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Updating patient with ID:', PATIENT_ID);
      console.log('Profile data:', {
        first_name: profile.firstName,
        last_name: profile.lastName,
        gender: profile.gender,
        country: profile.country,
        dob: profile.dob
      });

      // Update the existing patient record
      const { data: updatedPatient, error: updateError } = await supabase
        .from('patients')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          gender: profile.gender,
          country: profile.country,
          dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : null
        })
        .eq('id', PATIENT_ID)
        .select();

      console.log('Update response:', { data: updatedPatient, error: updateError });
      
      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Verify the update worked
      const { data: verifyData, error: verifyError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', PATIENT_ID)
        .single();
      
      console.log('Verification data:', verifyData);
      
      if (verifyError) {
        console.error('Verification error:', verifyError);
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message || 'Unknown error'}`);
    }
  };

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
  );
} 