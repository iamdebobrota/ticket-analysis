import { useData } from '../../context/DataContext';
import KPICard from '../KPICard';
import VolumeChart from './VolumeChart';
import SentimentDonut from './SentimentDonut';
import CategoryBarChart from './CategoryBarChart';
import ResponseTimeHistogram from './ResponseTimeHistogram';

function formatTime(seconds) {
  if (seconds == null || seconds === 0) return 'N/A';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3600).toFixed(1)} hr`;
}

export default function OverviewTab() {
  const { metrics } = useData();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <KPICard
          title="Total Tickets"
          value={metrics.totalTickets}
          subtitle={`${metrics.stateBreakdown.open} open, ${metrics.stateBreakdown.closed} closed, ${metrics.stateBreakdown.snoozed} snoozed`}
          accent="border-l-blue-500"
        />
        <KPICard
          title="Avg First Response"
          value={formatTime(metrics.avgResponseTime)}
          accent="border-l-emerald-500"
        />
        <KPICard
          title="Resolution Rate"
          value={`${(metrics.resolutionRate * 100).toFixed(0)}%`}
          accent="border-l-violet-500"
        />
        <KPICard
          title="Customer Satisfaction"
          value={metrics.ratedCount > 0 ? metrics.avgRating.toFixed(1) : 'N/A'}
          subtitle={`${metrics.ratedCount} rated`}
          accent="border-l-amber-500"
        />
        <KPICard
          title="Daily Volume"
          value={`${metrics.dailyVolume.toFixed(0)}/day`}
          accent="border-l-sky-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VolumeChart />
        <SentimentDonut />
        <CategoryBarChart />
        <ResponseTimeHistogram />
      </div>
    </div>
  );
}
