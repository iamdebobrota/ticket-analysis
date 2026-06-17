import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

const AGENT_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];

function ClickableDot({ cx, cy, fill, payload, filteredTickets, openDrillDown }) {
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      stroke="white"
      strokeWidth={1.5}
      cursor="pointer"
      onClick={(e) => {
        e.stopPropagation();
        const date = payload.date;
        const tickets = filteredTickets.filter(t => {
          const day = new Date(t.createdAt * 1000).toISOString().slice(0, 10);
          return day === date;
        });
        openDrillDown(`Activity on ${date}`, tickets);
      }}
    />
  );
}

export default function DailyActivityChart() {
  const { metrics, agents, filteredTickets, openDrillDown } = useData();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 min-h-[300px]">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Daily Activity by Agent</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={metrics.agentDailyActivity}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {agents.map((agent, i) => (
            <Line
              key={agent}
              type="monotone"
              dataKey={agent}
              stroke={AGENT_COLORS[i % AGENT_COLORS.length]}
              strokeWidth={2}
              dot={(props) => (
                <ClickableDot
                  key={`${props.cx}-${props.cy}`}
                  {...props}
                  fill={AGENT_COLORS[i % AGENT_COLORS.length]}
                  filteredTickets={filteredTickets}
                  openDrillDown={openDrillDown}
                />
              )}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
