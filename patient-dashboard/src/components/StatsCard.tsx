import { getNextCheckupDate, formatCheckupDate } from '@/utils/dateUtils';

interface StatsCardProps {
    title: string;
    value: string;
    icon: string;
    trend: string;
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
    const isPositive = trend === "Normal" || trend === "Good";
    const isPending = trend === "Upcoming";
    
    // Define PATIENT_ID
    const PATIENT_ID = "14a799bc-2bfd-48b1-a96e-ac394bce8114";
    
    // Only calculate for the check-up card
    let displayValue = value;
    if (title === "Next Check-up") {
        const nextCheckup = getNextCheckupDate(PATIENT_ID);
        displayValue = formatCheckupDate(nextCheckup);
    }
    
    return (
        <div className="relative overflow-hidden bg-white rounded-lg shadow-md border border-vintage-200">
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-vintage-100 text-vintage-900 text-xl">
                        {icon}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${isPositive ? 'bg-sage-100 text-sage-600' : ''} 
                        ${isPending ? 'bg-navy-100 text-navy-600' : ''} 
                        ${!isPositive && !isPending ? 'bg-brick-100 text-brick-600' : ''}
                    `}>
                        {trend}
                    </span>
                </div>
                <h3 className="text-sm font-medium text-vintage-900/70 uppercase tracking-wide mb-1">{title}</h3>
                <p className="text-2xl font-alfa-slab text-vintage-900">{displayValue}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-vintage-100/30 to-transparent rounded-bl-full -z-10" />
        </div>
    );
} 