"use client";

import { getNextCheckupDate, formatCheckupDate } from '@/utils/dateUtils';

export default function SidebarCheckupNotification() {
  // Define PATIENT_ID
  const PATIENT_ID = "14a799bc-2bfd-48b1-a96e-ac394bce8114";
  
  // Get the next check-up date
  const nextCheckup = getNextCheckupDate(PATIENT_ID);
  const formattedDate = nextCheckup.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <div className="bg-vintage-900/80 text-white p-4 rounded-lg">
      <h3 className="text-sm font-medium text-vintage-200">Next Check-up</h3>
      <p className="text-white">{formattedDate}</p>
    </div>
  );
} 