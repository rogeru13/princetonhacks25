"use client";

import { useState } from 'react';
import { DailyMetrics } from '@/types/patient';
import { supabase } from '@/lib/supabase';

export default function DailyMetricsCard() {
    const [metrics, setMetrics] = useState<DailyMetrics>({
        date: new Date().toISOString().split('T')[0],
        hbA1c_level: 0,
        blood_glucose_level: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const TEST_PATIENT_ID = '123e4567-e89b-12d3-a456-426614174000'; // Replace with the actual UUID from your test patient

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Validate inputs
            if (!metrics.hbA1c_level || !metrics.blood_glucose_level) {
                throw new Error('Please fill in all fields');
            }

            const { data, error } = await supabase
                .from('daily_metrics')
                .insert([
                    {
                        patient_id: "bb71bef5-9904-47b8-926e-3a36305bdb20", // Use the UUID from your test patient
                        date: metrics.date,
                        hba1c_level: metrics.hbA1c_level,
                        blood_glucose_level: metrics.blood_glucose_level,
                    }
                ])
                .select();

            if (error) throw error;

            setSuccess(true);
            // Reset form
            setMetrics({
                date: new Date().toISOString().split('T')[0],
                hbA1c_level: 0,
                blood_glucose_level: 0
            });

        } catch (err) {
            console.error('Error details:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-vintage-200">
            <div className="border-b border-vintage-200 p-5">
                <h2 className="text-xl font-alfa-slab text-vintage-900">Daily Health Check</h2>
            </div>
            
            <div className="p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-vintage-900/70 mb-1">Date</label>
                        <input
                            type="date"
                            value={metrics.date}
                            onChange={(e) => setMetrics({...metrics, date: e.target.value})}
                            className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                            focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-vintage-900/70 mb-1">HbA1c Level (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={metrics.hbA1c_level}
                            onChange={(e) => setMetrics({...metrics, hbA1c_level: parseFloat(e.target.value)})}
                            className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                            focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                            placeholder="Enter HbA1c level"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-vintage-900/70 mb-1">Blood Glucose Level (mg/dL)</label>
                        <input
                            type="number"
                            value={metrics.blood_glucose_level}
                            onChange={(e) => setMetrics({...metrics, blood_glucose_level: parseFloat(e.target.value)})}
                            className="w-full rounded-lg border-vintage-200 bg-vintage-50 p-2.5 text-vintage-900 
                            focus:ring-2 focus:ring-brick-500/20 focus:border-brick-500 transition-all duration-200"
                            placeholder="Enter blood glucose level"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-brick-100 text-brick-600 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 rounded-lg bg-sage-100 text-sage-600 text-sm">
                            Metrics saved successfully!
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brick-500 text-white rounded-lg py-2.5 px-4 font-medium
                        hover:bg-brick-600 focus:ring-2 focus:ring-brick-500/50 focus:ring-offset-2 
                        transition-all duration-200 shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Today\'s Metrics'}
                    </button>
                </form>
            </div>
        </div>
    );
} 