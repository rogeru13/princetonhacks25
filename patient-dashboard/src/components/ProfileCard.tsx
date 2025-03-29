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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Patient Profile</h2>
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                        value={profile.gender}
                        onChange={(e) => setProfile({...profile, gender: e.target.value as Gender})}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={profile.hasHypertension}
                            onChange={(e) => setProfile({...profile, hasHypertension: e.target.checked})}
                            className="mr-2"
                        />
                        Hypertension
                    </label>
                    
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={profile.hasHeartDisease}
                            onChange={(e) => setProfile({...profile, hasHeartDisease: e.target.checked})}
                            className="mr-2"
                        />
                        Heart Disease
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Smoking History</label>
                    <select
                        value={profile.smokingHistory}
                        onChange={(e) => setProfile({...profile, smokingHistory: e.target.value as SmokingHistory})}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2"
                    >
                        <option value="never">Never</option>
                        <option value="former">Former</option>
                        <option value="current">Current</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 px-4"
                >
                    Save Profile
                </button>
            </form>
        </div>
    );
} 