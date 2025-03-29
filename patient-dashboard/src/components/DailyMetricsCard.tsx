"use client";

import { useState } from 'react';
import { DailyMetrics } from '@/types/patient';

export default function DailyMetricsCard() {
    const [metrics, setMetrics] = useState<DailyMetrics>({
        date: new Date().toISOString().split('T')[0],
        hbA1c_level: 0,
        blood_glucose_level: 0
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Daily Health Metrics</h2>
            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                        type="date"
                        value={metrics.date}
                        onChange={(e) => setMetrics({...metrics, date: e.target.value})}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">HbA1c Level (%)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={metrics.hbA1c_level}
                        onChange={(e) => setMetrics({...metrics, hbA1c_level: parseFloat(e.target.value)})}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Blood Glucose Level (mg/dL)</label>
                    <input
                        type="number"
                        value={metrics.blood_glucose_level}
                        onChange={(e) => setMetrics({...metrics, blood_glucose_level: parseFloat(e.target.value)})}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4"
                >
                    Submit Daily Metrics
                </button>
            </form>
        </div>
    );
} 