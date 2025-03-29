"use client";

import { useState } from 'react';

interface CheckInStatus {
    date: string;
    completed: boolean;
    glucose: number;
    hbA1c?: number;
}

// Mock data - in real app this would come from your backend
const mockCheckIns: CheckInStatus[] = [
    { date: '2024-02-01', completed: true, glucose: 120 },
    { date: '2024-02-02', completed: true, glucose: 115 },
    { date: '2024-02-03', completed: true, glucose: 125 },
    { date: '2024-02-04', completed: false, glucose: 0 },
    { date: '2024-02-05', completed: true, glucose: 118 },
];

export default function HealthCheckCalendar() {
    const [currentMonth] = useState(new Date());
    
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const getCheckInStatus = (day: number): CheckInStatus | undefined => {
        const dateStr = `2024-02-${day.toString().padStart(2, '0')}`;
        return mockCheckIns.find(checkIn => checkIn.date === dateStr);
    };

    const renderDay = (day: number) => {
        const checkIn = getCheckInStatus(day);
        const isToday = day === new Date().getDate();
        const isPast = day < new Date().getDate();

        return (
            <div
                key={day}
                className={`relative p-3 border ${isToday ? 'border-brick-500' : 'border-vintage-200'} 
                    rounded-lg bg-white hover:bg-vintage-50 transition-colors`}
            >
                <span className={`text-sm font-medium ${isToday ? 'text-brick-500' : 'text-vintage-900'}`}>
                    {day}
                </span>
                {checkIn?.completed ? (
                    <div className="mt-1.5">
                        <div className="text-xs font-medium text-sage-600 bg-sage-100 rounded-full px-2 py-0.5 inline-flex items-center">
                            ✓ Complete
                        </div>
                        <div className="mt-1 text-xs text-vintage-900/70">
                            {checkIn.glucose} mg/dL
                        </div>
                    </div>
                ) : isPast ? (
                    <div className="mt-1.5">
                        <div className="text-xs font-medium text-brick-600 bg-brick-100 rounded-full px-2 py-0.5">
                            Missed
                        </div>
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-vintage-200 mt-6">
            <div className="border-b border-vintage-200 p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-alfa-slab text-vintage-900">Health Check History</h2>
                    <div className="text-sm font-medium text-vintage-900/70">
                        February 2024
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-xs font-bold text-vintage-900/70 text-center">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDay }).map((_, index) => (
                        <div key={`empty-${index}`} />
                    ))}
                    {Array.from({ length: days }).map((_, index) => renderDay(index + 1))}
                </div>

                {/* Legend */}
                <div className="mt-6 flex gap-4 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-sage-600 border-2 border-vintage-200"></div>
                        <span className="text-xs font-bold text-vintage-900">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-brick-600 border-2 border-vintage-200"></div>
                        <span className="text-xs font-bold text-vintage-900">Missed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-vintage-200 border-2 border-vintage-200"></div>
                        <span className="text-xs font-bold text-vintage-900">Upcoming</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 