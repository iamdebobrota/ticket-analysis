import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { RESPONSE_TIME_BUCKET_ORDER, bucketResponseTime } from '../../utils/metrics';

export default function ResponseTimeHistogram() {
  const { metrics, filteredTickets, openDrillDown } = useData();
  const data = RESPONSE_TIME_BUCKET_ORDER.map(bucket => ({
    bucket,
    count: metrics.responseTimeBuckets[bucket] || 0,
  }));

  const handleClick = (entry) => {
    const bucket = entry.bucket;
    const tickets = filteredTickets.filter(t =>
      t.timeToAdminReply != null && bucketResponseTime(t.timeToAdminReply) === bucket
    );
    openDrillDown(`Response Time: ${bucket}`, tickets);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 min-h-[300px]">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Response Time Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#0ea5e9" cursor="pointer" onClick={handleClick} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
