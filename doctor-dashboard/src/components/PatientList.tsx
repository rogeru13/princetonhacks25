"use client";

import { useState, useEffect } from 'react';
import { Patient } from '@/types/patient';
import { supabase } from '@/lib/supabase';

export default function PatientList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    async function fetchPatients() {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*');
            
            if (error) throw error;
            setPatients(data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredPatients = patients.filter(patient => 
        patient.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.gender.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
                <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Age/Gender
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Health Metrics
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Risk Level
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center">
                                    Loading patients...
                                </td>
                            </tr>
                        ) : filteredPatients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {patient.id.slice(0, 8)}...
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {patient.age} years
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {patient.gender}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        BMI: {patient.bmi}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        BP: {patient.systolic_bp}/{patient.diastolic_bp}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${getRiskLevelClass(patient)}`}>
                                        {calculateRiskLevel(patient)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function calculateRiskLevel(patient: Patient): string {
    // Simple risk calculation logic
    let riskFactors = 0;
    
    if (patient.systolic_bp > 140 || patient.diastolic_bp > 90) riskFactors++;
    if (patient.bmi > 30) riskFactors++;
    if (patient.cholesterol > 200) riskFactors++;
    if (patient.smoking_status === 'current') riskFactors++;
    if (patient.diabetes) riskFactors++;

    if (riskFactors >= 3) return 'High Risk';
    if (riskFactors >= 1) return 'Medium Risk';
    return 'Low Risk';
}

function getRiskLevelClass(patient: Patient): string {
    const risk = calculateRiskLevel(patient);
    switch (risk) {
        case 'High Risk':
            return 'bg-red-100 text-red-800';
        case 'Medium Risk':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-green-100 text-green-800';
    }
} 