interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  trendType: 'positive' | 'negative' | 'warning' | 'neutral';
}

export default function StatsCard({ title, value, trend, trendType }: StatsCardProps) {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTrendColor()}`}>
          {trend}
        </span>
      </div>
    </div>
  );
} 