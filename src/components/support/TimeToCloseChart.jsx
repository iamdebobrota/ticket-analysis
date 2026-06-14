import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { CLOSE_TIME_BUCKET_ORDER, bucketCloseTime } from '../../utils/metrics';

export default function TimeToCloseChart() {
  const { metrics, filteredTickets, openDrillDown } = useData();
  const data = CLOSE_TIME_BUCKET_ORDER.map(bucket => ({
    bucket,
    count: metrics.closeTimeBuckets[bucket] || 0,
  }));

  const handleClick = (entry) => {
    const bucket = entry.bucket;
    const tickets = filteredTickets.filter(t =>
      t.timeToFirstClose != null && bucketCloseTime(t.timeToFirstClose) === bucket
    );
    openDrillDown(`Time to Close: ${bucket}`, tickets);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Time to Close Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#8b5cf6" cursor="pointer" onClick={handleClick} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
