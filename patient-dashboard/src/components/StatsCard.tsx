interface StatsCardProps {
    title: string;
    value: string;
    icon: string;
    trend: string;
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
    const isPositive = trend === "Normal" || trend === "Good";
    const isPending = trend === "Upcoming";
    
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
                <p className="text-2xl font-alfa-slab text-vintage-900">{value}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-vintage-100/30 to-transparent rounded-bl-full -z-10" />
        </div>
    );
} 