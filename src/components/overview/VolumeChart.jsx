import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

export default function VolumeChart() {
  const { metrics, filteredTickets, openDrillDown } = useData();

  const handleClick = (entry) => {
    const date = entry.date;
    const tickets = filteredTickets.filter(t => {
      const day = new Date(t.createdAt * 1000).toISOString().slice(0, 10);
      return day === date;
    });
    openDrillDown(`Tickets on ${date}`, tickets);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 min-h-[300px]">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Ticket Volume Over Time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={metrics.volumeByDay}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="open" stackId="a" fill="#3b82f6" name="Open" cursor="pointer" onClick={handleClick} />
          <Bar dataKey="closed" stackId="a" fill="#22c55e" name="Closed" cursor="pointer" onClick={handleClick} />
          <Bar dataKey="snoozed" stackId="a" fill="#f59e0b" name="Snoozed" cursor="pointer" onClick={handleClick} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
