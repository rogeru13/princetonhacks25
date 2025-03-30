"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@auth0/nextjs-auth0/client';

// First, add a function to get the patient ID for the authenticated user
async function getPatientIdForUser(auth0Id: string) {
    const { data, error } = await supabase
        .from('patients')
        .select('id')
        .eq('auth0_id', auth0Id)
        .single();

    if (error) throw error;
    return data.id;
}

export default function DailyMetricsCard() {
    const { user } = useUser();
    const [metrics, setMetrics] = useState({
        date: new Date().toISOString().split('T')[0],
        blood_glucose_level: '',
        bmi: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMetrics(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.sub) return;

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            // Get the patient_id for this auth0 user
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('id')
                .eq('auth0_id', user.sub)
                .single();

            if (patientError) throw new Error('Could not find patient record');

            // Format the data properly
            const formattedData = {
                patient_id: patientData.id,
                date: metrics.date,
                blood_glucose_level: metrics.blood_glucose_level ? parseFloat(metrics.blood_glucose_level) : null,
                bmi: metrics.bmi ? parseFloat(metrics.bmi) : null
            };
            
            // Insert using the Supabase client
            const { error: insertError } = await supabase
                .from('daily_reports')
                .insert([formattedData]);
                
            if (insertError) throw insertError;
            
            // Dispatch metrics-updated event
            window.dispatchEvent(new CustomEvent('metrics-updated', {
                detail: {
                    bloodGlucose: formattedData.blood_glucose_level,
                    bmi: formattedData.bmi,
                    date: formattedData.date
                }
            }));
            
            setSuccess(true);
            // Reset form
            setMetrics({
                date: new Date().toISOString().split('T')[0],
                blood_glucose_level: '',
                bmi: ''
            });
        } catch (err) {
            console.error('Error submitting metrics:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit metrics');
        } finally {
            setLoading(false);
        }
    };

    // When fetching daily reports:
    useEffect(() => {
        async function fetchDailyMetrics() {
            if (!user?.sub) return;

            try {
                const patientId = await getPatientIdForUser(user.sub);

                const { data, error } = await supabase
                    .from('daily_reports')
                    .select('*')
                    .eq('patient_id', patientId)
                    .order('date', { ascending: false });

                if (error) throw error;
                // ... handle the data
            } catch (error) {
                console.error('Error fetching daily metrics:', error);
            }
        }

        fetchDailyMetrics();
    }, [user]);

    return (
        <div className="bg-white rounded-lg shadow-md border border-vintage-200 p-5">
            <h2 className="text-xl font-alfa-slab text-vintage-900 mb-4">Today's Health Metrics</h2>
            
            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
                    Your metrics have been saved successfully!
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-vintage-900/70 mb-1">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={metrics.date}
                        onChange={handleChange}
                        className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-vintage-900/70 mb-1">Blood Glucose (mg/dL)</label>
                        <input
                            type="number"
                            name="blood_glucose_level"
                            value={metrics.blood_glucose_level}
                            onChange={handleChange}
                            className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900"
                            placeholder="e.g., 120"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-vintage-900/70 mb-1">BMI</label>
                        <input
                            type="number"
                            name="bmi"
                            value={metrics.bmi}
                            onChange={handleChange}
                            className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900"
                            placeholder="e.g., 24.5"
                            step="0.1"
                        />
                    </div>
                </div>
                
                <button
                    type="submit"
                    className="w-full bg-brick-500 text-white rounded-lg py-2.5 px-4 
                    hover:bg-brick-600 focus:ring-2 focus:ring-brick-500/20 
                    transition-all duration-200"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Today\'s Metrics'}
                </button>
            </form>
        </div>
    );
} 