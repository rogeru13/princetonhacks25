import Image from "next/image";
import PatientList from '@/components/PatientList';
import StatsCard from '@/components/StatsCard';

export default function DoctorDashboard() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Patients"
          value="124"
          trend="+12% from last month"
          trendType="positive"
        />
        <StatsCard 
          title="High Risk Patients"
          value="8"
          trend="2 new this week"
          trendType="negative"
        />
        <StatsCard 
          title="Pending Reviews"
          value="15"
          trend="5 urgent"
          trendType="warning"
        />
        <StatsCard 
          title="Avg. Patient Health"
          value="85%"
          trend="Stable"
          trendType="neutral"
        />
      </div>

      {/* Patient List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Patient Overview</h2>
        <PatientList />
      </div>
    </div>
  );
}
