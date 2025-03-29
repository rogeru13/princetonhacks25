interface StatsCardProps {
    title: string;
    value: string;
    icon: string;
    trend: string;
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
    const isPositive = trend.startsWith('+');
    
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
                <span className="text-2xl">{icon}</span>
                <span className={`text-sm font-medium tracking-wide ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {trend}
                </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium tracking-wide uppercase">{title}</h3>
            <p className="text-2xl font-semibold mt-1 tracking-tight">{value}</p>
        </div>
    );
} 