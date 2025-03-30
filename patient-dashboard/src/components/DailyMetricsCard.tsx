"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DailyMetricsCard() {
    const [metrics, setMetrics] = useState({
        date: new Date().toISOString().split('T')[0],
        blood_glucose_level: '',
        bmi: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    // Use the patient ID from your component
    const PATIENT_ID = "14a799bc-2bfd-48b1-a96e-ac394bce8114";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMetrics(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
            console.log('Submitting metrics for patient:', PATIENT_ID);
            console.log('Metrics data:', metrics);

            // Generate a new UUID for this report
            const REPORT_ID = crypto.randomUUID();
            
            // First, verify the patient exists
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('id, first_name, last_name')
                .eq('id', PATIENT_ID)
                .single();
                
            console.log('Patient verification:', { data: patientData, error: patientError });
            
            if (patientError) {
                throw new Error(`Patient verification failed: ${patientError.message}`);
            }
            
            // Format the data properly
            const formattedData = {
                id: REPORT_ID,
                patient_id: PATIENT_ID,
                date: metrics.date,
                blood_glucose_level: metrics.blood_glucose_level ? parseFloat(metrics.blood_glucose_level) : null,
                bmi: metrics.bmi ? parseFloat(metrics.bmi) : null
            };
            
            console.log('Formatted data for insert:', formattedData);
            
            // Insert using the Supabase client
            const { data: insertData, error: insertError } = await supabase
                .from('daily_reports')
                .insert(formattedData)
                .select();
                
            console.log('Insert response:', { data: insertData, error: insertError });
            
            if (insertError) {
                throw new Error(`Insert failed: ${insertError.message}`);
            }
            
            // Verify the insert by fetching the record
            const { data: verifyData, error: verifyError } = await supabase
                .from('daily_reports')
                .select('*')
                .eq('id', REPORT_ID)
                .single();
                
            console.log('Verification response:', { data: verifyData, error: verifyError });
            
            if (verifyError) {
                console.warn(`Verification warning: ${verifyError.message}`);
            }
            
            // Also try a direct fetch to the API
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/daily_reports?id=eq.${REPORT_ID}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
                        }
                    }
                );
                
                const result = await response.json();
                console.log('Direct API verification:', result);
            } catch (verifyApiError) {
                console.warn('API verification warning:', verifyApiError);
            }
            
            // Dispatch an event with the new glucose data
            const metricsEvent = new CustomEvent('metrics-updated', {
                detail: {
                    bloodGlucose: metrics.blood_glucose_level ? parseFloat(metrics.blood_glucose_level) : null,
                    bmi: metrics.bmi ? parseFloat(metrics.bmi) : null,
                    date: metrics.date
                }
            });
            window.dispatchEvent(metricsEvent);
            
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            // Reset form
            setMetrics({
                date: new Date().toISOString().split('T')[0],
                blood_glucose_level: '',
                bmi: ''
            });
        } catch (err: any) {
            console.error('Error submitting metrics:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

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