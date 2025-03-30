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
        (patient.country?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (patient.gender?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    // Rest of your existing component remains the same...
    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Your existing JSX... */}
        </div>
    );
} 