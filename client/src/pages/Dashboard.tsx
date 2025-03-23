import WeatherSummary from '@/components/dashboard/WeatherSummary';
import TasksSummary from '@/components/dashboard/TasksSummary';
import FieldsSummary from '@/components/dashboard/FieldsSummary';
import CropsSummary from '@/components/dashboard/CropsSummary';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <WeatherSummary />
      <TasksSummary />
      <FieldsSummary />
      <CropsSummary />
    </div>
  );
}
