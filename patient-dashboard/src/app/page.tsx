import DailyMetricsCard from '@/components/DailyMetricsCard';
import StatsCard from '@/components/StatsCard';
import HealthCheckCalendar from '@/components/HealthCheckCalendar';
import RewardsCard from '@/components/RewardsCard';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function Home() {
    return (
        <div className="space-y-4 md:space-y-6 max-w-lg mx-auto md:max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <StatsCard
                    title="Last Blood Glucose"
                    value="120 mg/dL"
                    icon="🩸"
                    trend="Normal"
                />
                <StatsCard
                    title="Latest HbA1c"
                    value="6.2%"
                    icon="📊"
                    trend="Good"
                />
                <StatsCard
                    title="Next Check-up"
                    value="3 days"
                    icon="📅"
                    trend="Upcoming"
                />
                <StatsCard
                    title="Rewards Balance"
                    value="$120"
                    icon="🏆"
                    trend="+$25 this week"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <DailyMetricsCard />
                    <HealthCheckCalendar />
                </div>
                <RewardsCard />
            </div>
        </div>
    );
}
