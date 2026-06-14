import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { RESPONSE_TIME_BUCKET_ORDER, bucketResponseTime } from '../../utils/metrics';

const AGENT_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];

export default function ResponseTimeByAgent() {
  const { filteredTickets, agents, openDrillDown } = useData();

  const bucketData = RESPONSE_TIME_BUCKET_ORDER.map(bucket => {
    const entry = { bucket };
    for (const agent of agents) {
      entry[agent] = 0;
    }
    return entry;
  });

  for (const t of filteredTickets) {
    if (t.timeToAdminReply == null || !t.agentName) continue;
    const bucket = bucketResponseTime(t.timeToAdminReply);
    const row = bucketData.find(r => r.bucket === bucket);
    if (row) row[t.agentName] = (row[t.agentName] || 0) + 1;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Response Time by Agent</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={bucketData}>
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {agents.map((agent, i) => (
            <Bar
              key={agent}
              dataKey={agent}
              fill={AGENT_COLORS[i % AGENT_COLORS.length]}
              cursor="pointer"
              onClick={(entry) => {
                const bucket = entry.bucket;
                const tickets = filteredTickets.filter(t =>
                  t.agentName === agent &&
                  t.timeToAdminReply != null &&
                  bucketResponseTime(t.timeToAdminReply) === bucket
                );
                openDrillDown(`${agent} — Response Time: ${bucket}`, tickets);
              }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
