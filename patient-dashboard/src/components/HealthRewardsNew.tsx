"use client";

import { useState, useEffect } from 'react';
import { TrophyIcon, FireIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

export default function HealthRewardsNew() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalEarned, setTotalEarned] = useState(120); // Starting with $120 earned
  const [daysCompleted, setDaysCompleted] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
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
  
  // Listen for metrics-updated event
  useEffect(() => {
    const handleMetricsUpdated = () => {
      console.log('Metrics updated event received');
      calculateStreak();
    };
    
    window.addEventListener('metrics-updated', handleMetricsUpdated);
    
    return () => {
      window.removeEventListener('metrics-updated', handleMetricsUpdated);
    };
  }, []);
  
  // Calculate streak and days completed
  useEffect(() => {
    calculateStreak();
  }, [PATIENT_ID, lastUpdate]);
  
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
        setDaysCompleted(0);
        return;
      }
      
      // Set total days completed
      setDaysCompleted(data.length);
      
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
      
      // Update total earned based on progress
      // $50 for 30-day challenge progress
      const challengeProgress = Math.min(data.length, 30);
      const challengeEarnings = Math.floor((challengeProgress / 30) * 50);
      
      // $25 for weekly streak
      const weeklyStreakEarnings = streak >= 7 ? 25 : 0;
      
      // Base earnings of $70 (for previous achievements)
      const baseEarnings = 70;
      
      setTotalEarned(baseEarnings + challengeEarnings + weeklyStreakEarnings);
      
      console.log('Calculation complete:', { 
        currentStreak: streak, 
        daysCompleted: data.length,
        totalEarned: baseEarnings + challengeEarnings + weeklyStreakEarnings
      });
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };
  
  // Calculate days left in the challenge
  const daysLeft = 30 - daysCompleted > 0 ? 30 - daysCompleted : 0;
  
  // Calculate progress percentage for the progress bar
  const progressPercentage = Math.min(100, (daysCompleted / 30) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-vintage-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-vintage-900">Health Rewards</h2>
          <p className="text-sm text-vintage-600">Earn rewards for managing your health</p>
        </div>
        <div className="flex items-center bg-brick-100 text-brick-700 px-4 py-2 rounded-lg">
          <CurrencyDollarIcon className="w-5 h-5 mr-2" />
          <span className="font-bold">${totalEarned} Earned</span>
        </div>
      </div>
      
      <div className="bg-vintage-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-vintage-900">Current Challenge</h3>
          <span className="text-brick-600 font-medium">{daysLeft} days left</span>
        </div>
        
        <p className="text-vintage-700 mb-3">Log your glucose levels daily for 30 days</p>
        
        <div className="w-full h-2 bg-vintage-200 rounded-full mb-2">
          <div 
            className="h-2 bg-brick-500 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-vintage-600">{daysCompleted}/30 days</span>
          <span className="text-sm font-medium text-brick-600">Reward: $50</span>
        </div>
      </div>
      
      <h3 className="font-bold text-vintage-900 mb-3">Available Rewards</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-vintage-50 rounded-lg border border-vintage-200">
          <div className="flex items-center">
            <div className="bg-brick-100 p-2 rounded-lg mr-3">
              <TrophyIcon className="w-5 h-5 text-brick-600" />
            </div>
            <div>
              <h4 className="font-medium text-vintage-900">Maintain A1C below 7.0</h4>
              <p className="text-sm text-vintage-600">3 months challenge</p>
            </div>
          </div>
          <span className="font-bold text-brick-600">$150</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-vintage-50 rounded-lg border border-vintage-200">
          <div className="flex items-center">
            <div className="bg-brick-100 p-2 rounded-lg mr-3">
              <TrophyIcon className="w-5 h-5 text-brick-600" />
            </div>
            <div>
              <h4 className="font-medium text-vintage-900">Weekly Check-in Streak</h4>
              <p className="text-sm text-vintage-600">Log readings 7 days in a row</p>
            </div>
          </div>
          <span className="font-bold text-brick-600">$25</span>
        </div>
      </div>
    </div>
  );
} 