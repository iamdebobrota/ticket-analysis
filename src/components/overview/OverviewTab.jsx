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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <KPICard
          title="Total Tickets"
          value={metrics.totalTickets}
          subtitle={`${metrics.stateBreakdown.open} open, ${metrics.stateBreakdown.closed} closed, ${metrics.stateBreakdown.snoozed} snoozed`}
        />
        <KPICard
          title="Avg First Response"
          value={formatTime(metrics.avgResponseTime)}
        />
        <KPICard
          title="Resolution Rate"
          value={`${(metrics.resolutionRate * 100).toFixed(0)}%`}
        />
        <KPICard
          title="Customer Satisfaction"
          value={metrics.ratedCount > 0 ? metrics.avgRating.toFixed(1) : 'N/A'}
          subtitle={`${metrics.ratedCount} rated`}
        />
        <KPICard
          title="Daily Volume"
          value={`${metrics.dailyVolume.toFixed(0)}/day`}
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
