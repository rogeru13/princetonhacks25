"use client";

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { getNextCheckupDate } from '@/utils/dateUtils';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasReport: boolean;
  status?: 'normal' | 'warning' | 'critical';
  isCheckupDay: boolean;
}

export default function HealthCheckCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [healthCheckDates, setHealthCheckDates] = useState<Record<string, { status: 'normal' | 'warning' | 'critical' }>>({});
  
  // Use the patient ID from your component
  const PATIENT_ID = "14a799bc-2bfd-48b1-a96e-ac394bce8114";
  
  // Get month name and year
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  
  // Fetch health check dates for the current month
  useEffect(() => {
    const fetchHealthCheckDates = async () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('daily_reports')
        .select('date, blood_glucose_level')
        .eq('patient_id', PATIENT_ID)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);
      
      if (error) {
        console.error('Error fetching health check dates:', error);
        return;
      }
      
      if (data) {
        const healthData: Record<string, { status: 'normal' | 'warning' | 'critical' }> = {};
        
        data.forEach(report => {
          // Determine status based on blood glucose level
          let status: 'normal' | 'warning' | 'critical' = 'normal';
          
          if (report.blood_glucose_level) {
            if (report.blood_glucose_level > 180) {
              status = 'critical';
            } else if (report.blood_glucose_level > 140) {
              status = 'warning';
            }
          }
          
          healthData[report.date] = { status };
        });
        
        console.log('Health check dates:', healthData);
        setHealthCheckDates(healthData);
      }
    };
    
    fetchHealthCheckDates();
  }, [currentDate, PATIENT_ID]);
  
  // Generate calendar days
  useEffect(() => {
    const generateCalendarDays = () => {
      const days: CalendarDay[] = [];
      
      // Get first day of the month
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      // Get last day of the month
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
      const firstDayOfWeek = firstDayOfMonth.getDay();
      
      // Add days from previous month to fill the first week
      const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i);
        const dateStr = date.toISOString().split('T')[0];
        days.push({
          date,
          isCurrentMonth: false,
          isToday: isSameDay(date, new Date()),
          hasReport: !!healthCheckDates[dateStr],
          status: healthCheckDates[dateStr]?.status,
          isCheckupDay: false
        });
      }
      
      // Add days of current month
      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        const isCheckupDay = day === getNextCheckupDate(PATIENT_ID).getDate() && 
                             date.getMonth() === getNextCheckupDate(PATIENT_ID).getMonth() && 
                             date.getFullYear() === getNextCheckupDate(PATIENT_ID).getFullYear();
        days.push({
          date,
          isCurrentMonth: true,
          isToday: isSameDay(date, new Date()),
          hasReport: !!healthCheckDates[dateStr],
          status: healthCheckDates[dateStr]?.status,
          isCheckupDay
        });
      }
      
      // Add days from next month to complete the last week
      const remainingDays = 7 - (days.length % 7);
      if (remainingDays < 7) {
        for (let day = 1; day <= remainingDays; day++) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
          const dateStr = date.toISOString().split('T')[0];
          days.push({
            date,
            isCurrentMonth: false,
            isToday: isSameDay(date, new Date()),
            hasReport: !!healthCheckDates[dateStr],
            status: healthCheckDates[dateStr]?.status,
            isCheckupDay: false
          });
        }
      }
      
      // Add isCheckupDay property
      const nextCheckupDate = getNextCheckupDate(PATIENT_ID);
      const updatedDays = days.map(day => {
        const isCheckupDay = day.date.getDate() === nextCheckupDate.getDate() && 
                             day.date.getMonth() === nextCheckupDate.getMonth() && 
                             day.date.getFullYear() === nextCheckupDate.getFullYear();
        return { ...day, isCheckupDay };
      });
      
      setCalendarDays(updatedDays);
    };
    
    generateCalendarDays();
  }, [currentDate, healthCheckDates]);
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Get status color
  const getStatusColor = (status?: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'normal':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-vintage-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-alfa-slab text-vintage-900">Health Check History</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToPreviousMonth}
            className="p-1.5 rounded-full hover:bg-vintage-100 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-vintage-900" />
          </button>
          <span className="text-sm font-medium text-vintage-900">{monthName} {year}</span>
          <button 
            onClick={goToNextMonth}
            className="p-1.5 rounded-full hover:bg-vintage-100 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-vintage-900" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-vintage-900/70 py-1">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`
              relative h-10 flex items-center justify-center text-sm rounded-md
              ${day.isCurrentMonth ? 'text-vintage-900' : 'text-vintage-400'}
              ${day.isToday ? 'bg-vintage-100' : ''}
              ${day.isCheckupDay ? 'ring-2 ring-blue-500' : ''}
            `}
          >
            {day.date.getDate()}
            {day.hasReport && (
              <div 
                className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 ${getStatusColor(day.status)} rounded-full`}
              ></div>
            )}
            {day.isCheckupDay && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-vintage-900/70">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></div>
            <span>Check-up</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-vintage-100 rounded-sm mr-1.5"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
} 