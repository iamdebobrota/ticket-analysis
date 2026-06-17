import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

const COLORS = { positive: '#22c55e', neutral: '#9ca3af', negative: '#ef4444' };

export default function SentimentDonut() {
  const { metrics, filteredTickets, openDrillDown } = useData();
  const data = Object.entries(metrics.sentimentDistribution).map(([name, value]) => ({ name, value }));

  const handleClick = (entry) => {
    const sentiment = entry.name;
    const tickets = filteredTickets.filter(t => t.sentiment === sentiment);
    openDrillDown(`Sentiment: ${sentiment}`, tickets);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 min-h-[300px]">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label cursor="pointer" onClick={handleClick}>
            {data.map(entry => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
