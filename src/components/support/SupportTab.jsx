import { useData } from '../../context/DataContext';
import KPICard from '../KPICard';
import AgentComparisonTable from './AgentComparisonTable';
import ResponseTimeByAgent from './ResponseTimeByAgent';
import DailyActivityChart from './DailyActivityChart';
import HourlyHeatmap from './HourlyHeatmap';
import TimeToCloseChart from './TimeToCloseChart';
import TicketList from './TicketList';

export default function SupportTab() {
  const { metrics } = useData();

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <KPICard
          title="Tickets with Reopens"
          value={metrics.reopenCount}
          subtitle={`${metrics.totalTickets > 0 ? ((metrics.reopenCount / metrics.totalTickets) * 100).toFixed(1) : 0}% of total`}
        />
      </div>
      <AgentComparisonTable />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResponseTimeByAgent />
        <DailyActivityChart />
        <HourlyHeatmap />
        <TimeToCloseChart />
      </div>
      <TicketList />
    </div>
  );
}
