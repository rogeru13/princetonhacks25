"use client";

import { useState, useEffect } from 'react';
import { TrophyIcon, FireIcon, GiftIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

interface Reward {
  id: number;
  title: string;
  description: string;
  daysRequired: number;
  icon: React.ReactNode;
  achieved: boolean;
}

export default function HealthRewards() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now()); // Track when data changes
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      title: "Getting Started",
      description: "Log your health metrics for 3 consecutive days",
      daysRequired: 3,
      icon: <FireIcon className="w-5 h-5" />,
      achieved: false
    },
    {
      id: 2,
      title: "Week Champion",
      description: "Complete a 7-day streak of daily logs",
      daysRequired: 7,
      icon: <TrophyIcon className="w-5 h-5" />,
      achieved: false
    },
    {
      id: 3,
      title: "Consistency Master",
      description: "Log your health metrics for 14 consecutive days",
      daysRequired: 14,
      icon: <GiftIcon className="w-5 h-5" />,
      achieved: false
    },
    {
      id: 4,
      title: "30-Day Challenge",
      description: "Complete a full month of daily health tracking",
      daysRequired: 30,
      icon: <TrophyIcon className="w-5 h-5" />,
      achieved: false
    }
  ]);
  
  // Use the patient ID from your component
  const PATIENT_ID = "14a799bc-2bfd-48b1-a96e-ac394bce8114";
  
  // Set up a subscription to listen for changes to daily_reports
  useEffect(() => {
    const subscription = supabase
      .channel('daily_reports_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'daily_reports',
          filter: `patient_id=eq.${PATIENT_ID}`
        }, 
        (payload) => {
          console.log('Change received!', payload);
          setLastUpdate(Date.now()); // Trigger a recalculation
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [PATIENT_ID]);
  
  // Calculate streak whenever lastUpdate changes
  useEffect(() => {
    calculateStreak();
  }, [PATIENT_ID, lastUpdate]); // Add lastUpdate as a dependency
  
  // Add this effect to listen for the custom event
  useEffect(() => {
    const handleMetricsUpdated = () => {
      console.log('Metrics updated event received');
      // Recalculate streak
      calculateStreak();
    };
    
    window.addEventListener('metrics-updated', handleMetricsUpdated);
    
    return () => {
      window.removeEventListener('metrics-updated', handleMetricsUpdated);
    };
  }, []);
  
  // Move calculateStreak outside the useEffect so it can be called from the event handler
  const calculateStreak = async () => {
    try {
      // Fetch all daily reports for this patient, ordered by date
      const { data, error } = await supabase
        .from('daily_reports')
        .select('date')
        .eq('patient_id', PATIENT_ID)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching daily reports:', error);
        return;
      }
      
      if (!data || data.length === 0) {
        setCurrentStreak(0);
        setLongestStreak(0);
        return;
      }
      
      // Sort dates in descending order (newest first)
      const dates = data.map(report => new Date(report.date)).sort((a, b) => b.getTime() - a.getTime());
      
      // Calculate current streak
      let streak = 1;
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if the most recent log is from today or yesterday
      const mostRecentDate = dates[0];
      mostRecentDate.setHours(0, 0, 0, 0);
      
      const timeDiff = today.getTime() - mostRecentDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      // If the most recent log is older than yesterday, streak is broken
      if (dayDiff > 1) {
        setCurrentStreak(0);
      } else {
        // Calculate streak by checking consecutive days
        for (let i = 1; i < dates.length; i++) {
          const currentDate = dates[i-1];
          const prevDate = dates[i];
          
          // Calculate difference in days
          const diffTime = currentDate.getTime() - prevDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
          
          // If the difference is exactly 1 day, continue the streak
          if (diffDays === 1) {
            streak++;
          } else if (diffDays > 1) {
            // Break in the streak
            break;
          }
        }
        
        setCurrentStreak(streak);
      }
      
      // Calculate longest streak
      let maxStreak = 1;
      let currentMaxStreak = 1;
      
      for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i-1]);
        const prevDate = new Date(dates[i]);
        
        // Calculate difference in days
        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
        
        if (diffDays === 1) {
          currentMaxStreak++;
          maxStreak = Math.max(maxStreak, currentMaxStreak);
        } else if (diffDays > 1) {
          currentMaxStreak = 1;
        }
      }
      
      setLongestStreak(Math.max(maxStreak, streak));
      
      // Update rewards based on longest streak
      setRewards(prevRewards => 
        prevRewards.map(reward => ({
          ...reward,
          achieved: reward.daysRequired <= Math.max(maxStreak, streak)
        }))
      );
      
      console.log('Streak calculation complete:', { currentStreak: streak, longestStreak: Math.max(maxStreak, streak) });
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-vintage-200 p-5">
      <h2 className="text-xl font-alfa-slab text-vintage-900 mb-4">Health Rewards</h2>
      
      <div className="flex items-center justify-between mb-6 p-4 bg-vintage-50 rounded-lg">
        <div>
          <p className="text-sm text-vintage-900/70">Current Streak</p>
          <p className="text-2xl font-bold text-brick-600">{currentStreak} days</p>
        </div>
        <div>
          <p className="text-sm text-vintage-900/70">Longest Streak</p>
          <p className="text-2xl font-bold text-brick-600">{longestStreak} days</p>
        </div>
        <div className="flex items-center">
          <FireIcon className="w-6 h-6 text-brick-500 mr-2" />
          <div>
            <p className="text-sm text-vintage-900/70">30-Day Challenge</p>
            <div className="w-32 h-2 bg-vintage-200 rounded-full mt-1">
              <div 
                className="h-2 bg-brick-500 rounded-full" 
                style={{ width: `${Math.min(100, (currentStreak / 30) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-vintage-900/70 mt-1">{currentStreak}/30 days</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {rewards.map(reward => (
          <div 
            key={reward.id}
            className={`flex items-center p-3 rounded-lg border ${
              reward.achieved 
                ? 'border-green-200 bg-green-50' 
                : 'border-vintage-200'
            }`}
          >
            <div className={`p-2 rounded-full mr-3 ${
              reward.achieved 
                ? 'bg-green-100 text-green-600' 
                : 'bg-vintage-100 text-vintage-600'
            }`}>
              {reward.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-vintage-900">{reward.title}</h3>
              <p className="text-sm text-vintage-900/70">{reward.description}</p>
            </div>
            <div className="ml-4">
              {reward.achieved ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Achieved
                </span>
              ) : (
                <span className="text-sm text-vintage-900/70">{reward.daysRequired - currentStreak > 0 ? `${reward.daysRequired - currentStreak} days left` : 'Complete today!'}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 