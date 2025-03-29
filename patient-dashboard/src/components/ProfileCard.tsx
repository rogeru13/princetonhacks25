"use client";

import { useState } from 'react';
import { PatientProfile, Gender, SmokingHistory } from '@/types/patient';

export default function ProfileCard() {
    const [profile, setProfile] = useState<PatientProfile>({
        age: 0,
        gender: 'other',
        hasHypertension: false,
        hasHeartDisease: false,
        smokingHistory: 'never'
    });

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Health Profile</h2>
            <form className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Age</label>
                        <input
                            type="number"
                            value={profile.age}
                            onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                            className="w-full rounded-xl border-purple-100 bg-white/50 p-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Gender</label>
                        <select
                            value={profile.gender}
                            onChange={(e) => setProfile({...profile, gender: e.target.value as Gender})}
                            className="w-full rounded-xl border-purple-100 bg-white/50 p-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">Medical History</label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={profile.hasHypertension}
                                onChange={(e) => setProfile({...profile, hasHypertension: e.target.checked})}
                                className="w-5 h-5 rounded border-purple-200 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Hypertension</span>
                        </label>
                        
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={profile.hasHeartDisease}
                                onChange={(e) => setProfile({...profile, hasHeartDisease: e.target.checked})}
                                className="w-5 h-5 rounded border-purple-200 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Heart Disease</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Smoking History</label>
                    <select
                        value={profile.smokingHistory}
                        onChange={(e) => setProfile({...profile, smokingHistory: e.target.value as SmokingHistory})}
                        className="w-full rounded-xl border-purple-100 bg-white/50 p-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="never">Never Smoked</option>
                        <option value="former">Former Smoker</option>
                        <option value="current">Current Smoker</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl py-3 px-4 font-medium hover:from-purple-700 hover:to-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-purple-500/20"
                >
                    Update Profile
                </button>
            </form>
        </div>
    );
} 