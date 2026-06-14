import { useData } from '../../context/DataContext';

function formatTime(seconds) {
  if (seconds == null || seconds === 0) return 'N/A';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3600).toFixed(1)} hr`;
}

export default function AgentComparisonTable() {
  const { metrics } = useData();
  const agents = Object.entries(metrics.agentStats).filter(([name]) => name !== 'Unassigned');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Agent Comparison</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
            <th className="pb-2 pr-4">Agent</th>
            <th className="pb-2 pr-4">Tickets</th>
            <th className="pb-2 pr-4">Avg Response</th>
            <th className="pb-2 pr-4">Avg Resolve</th>
            <th className="pb-2 pr-4">Replies/Ticket</th>
            <th className="pb-2">Closed Rate</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(([name, stats]) => (
            <tr key={name} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium">{name}</td>
              <td className="py-2 pr-4">{stats.ticketCount}</td>
              <td className="py-2 pr-4">{formatTime(stats.avgResponseTime)}</td>
              <td className="py-2 pr-4">{formatTime(stats.avgResolveTime)}</td>
              <td className="py-2 pr-4">{stats.repliesPerTicket.toFixed(1)}</td>
              <td className="py-2">{(stats.closedRate * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
