import ProfileCard from '@/components/ProfileCard';
import DailyMetricsCard from '@/components/DailyMetricsCard';
import StatsCard from '@/components/StatsCard';

export default function Home() {
    return (
        <div className="space-y-4 md:space-y-6 max-w-lg mx-auto md:max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:gap-6">
                <ProfileCard />
                <DailyMetricsCard />
            </div>
        </div>
    );
}
