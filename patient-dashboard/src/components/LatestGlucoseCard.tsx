"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function LatestGlucoseCard() {
  const [latestGlucose, setLatestGlucose] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'Normal' | 'Warning' | 'Critical'>('Normal');
  
  // Use the patient ID from your component
  const PATIENT_ID = "14a799bc-2bfd-48b1-a96e-ac394bce8114";
  
  const fetchLatestGlucose = async (isMounted = true) => {
    if (!isMounted) return;
    
    setLoading(true);
    
    try {
      // Check if supabase is defined
      if (!supabase) {
        console.error('Supabase client is not initialized');
        return;
      }
      
      const { data, error } = await supabase
        .from('daily_reports')
        .select('blood_glucose_level')
        .eq('patient_id', PATIENT_ID)
        .order('date', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching latest glucose:', error);
        return;
      }
      
      if (isMounted && data && data.length > 0) {
        const glucoseLevel = data[0].blood_glucose_level;
        
        // Check if glucoseLevel is defined
        if (glucoseLevel !== undefined && glucoseLevel !== null) {
          setLatestGlucose(glucoseLevel);
          
          // Determine status based on blood glucose level
          if (glucoseLevel > 180) {
            setStatus('Critical');
          } else if (glucoseLevel > 140) {
            setStatus('Warning');
          } else {
            setStatus('Normal');
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    fetchLatestGlucose(isMounted);
    
    // Set up a subscription to listen for changes
    let subscription;
    try {
      if (supabase) {
        subscription = supabase
          .channel('daily_reports_changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'daily_reports',
              filter: `patient_id=eq.${PATIENT_ID}`
            }, 
            () => {
              if (isMounted) {
                fetchLatestGlucose(isMounted);
              }
            }
          )
          .subscribe();
      }
    } catch (error) {
      console.error('Error setting up subscription:', error);
    }
    
    // Listen for metrics-updated event from DailyMetricsCard
    const handleMetricsUpdated = (event) => {
      if (isMounted) {
        // If the event includes glucose data, update immediately
        if (event.detail && event.detail.bloodGlucose) {
          const glucoseLevel = Number(event.detail.bloodGlucose);
          if (!isNaN(glucoseLevel)) {
            setLatestGlucose(glucoseLevel);
            
            // Determine status based on blood glucose level
            if (glucoseLevel > 180) {
              setStatus('Critical');
            } else if (glucoseLevel > 140) {
              setStatus('Warning');
            } else {
              setStatus('Normal');
            }
            setLoading(false);
          } else {
            // If the event doesn't include glucose data, fetch from API
            fetchLatestGlucose(isMounted);
          }
        } else {
          // If the event doesn't include glucose data, fetch from API
          fetchLatestGlucose(isMounted);
        }
      }
    };
    
    window.addEventListener('metrics-updated', handleMetricsUpdated);
    
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      window.removeEventListener('metrics-updated', handleMetricsUpdated);
    };
  }, [PATIENT_ID]);
  
  // Fallback content in case of error
  if (loading) {
    return (
      <div className="relative overflow-hidden bg-white rounded-lg shadow-md border border-vintage-200">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-vintage-100 text-vintage-900 text-xl">
              🩸
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-vintage-100 text-vintage-600">
              Loading...
            </span>
          </div>
          <h3 className="text-sm font-medium text-vintage-900/70 uppercase tracking-wide mb-1">
            Last Blood Glucose
          </h3>
          <p className="text-2xl font-alfa-slab text-vintage-900">Loading...</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-vintage-100/30 to-transparent rounded-bl-full -z-10" />
      </div>
    );
  }
  
  return (
    <div className="relative overflow-hidden bg-white rounded-lg shadow-md border border-vintage-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-vintage-100 text-vintage-900 text-xl">
            🩸
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium
            ${status === 'Normal' ? 'bg-sage-100 text-sage-600' : ''} 
            ${status === 'Warning' ? 'bg-yellow-100 text-yellow-600' : ''} 
            ${status === 'Critical' ? 'bg-brick-100 text-brick-600' : ''}
          `}>
            {status}
          </span>
        </div>
        <h3 className="text-sm font-medium text-vintage-900/70 uppercase tracking-wide mb-1">
          Last Blood Glucose
        </h3>
        <p className="text-2xl font-alfa-slab text-vintage-900">
          {latestGlucose ? `${latestGlucose} mg/dL` : 'No data'}
        </p>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-vintage-100/30 to-transparent rounded-bl-full -z-10" />
    </div>
  );
} 