import { getNextCheckupDate, formatCheckupDate } from '@/utils/dateUtils';

export default function UpcomingAppointments() {
  // Define PATIENT_ID
  const PATIENT_ID = "14a799bc-2bfd-48b1-a96e-ac394bce8114";
  
  // Get the next check-up date
  const nextCheckup = getNextCheckupDate(PATIENT_ID);
  const formattedDate = nextCheckup.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });
  const daysUntil = formatCheckupDate(nextCheckup);
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-vintage-200 p-5">
      <h2 className="text-xl font-alfa-slab text-vintage-900 mb-4">Upcoming Appointments</h2>
      
      <div className="border-l-4 border-blue-500 pl-4 py-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-vintage-900">Check-up with Dr. Smith</h3>
            <p className="text-sm text-vintage-600">{formattedDate}</p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {daysUntil}
          </span>
        </div>
      </div>
    </div>
  );
} 