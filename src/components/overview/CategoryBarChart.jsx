import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

export default function CategoryBarChart() {
  const { metrics, filteredTickets, openDrillDown } = useData();
  const data = Object.entries(metrics.categoryDistribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const handleClick = (entry) => {
    const category = entry.name;
    const tickets = filteredTickets.filter(t => t.primaryCategory === category);
    openDrillDown(`Category: ${category}`, tickets);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 min-h-[300px]">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Top Issue Categories</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" cursor="pointer" onClick={handleClick} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
