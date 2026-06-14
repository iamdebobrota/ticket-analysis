import React from 'react';
import { useData } from '../../context/DataContext';

export default function HourlyHeatmap() {
  const { metrics, filteredTickets, openDrillDown } = useData();
  const data = metrics.hourlyHeatmapData;
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleCellClick = (dayIdx, hour, day) => {
    const tickets = filteredTickets.filter(t => {
      const d = new Date(t.createdAt * 1000);
      return d.getUTCDay() === dayIdx && d.getUTCHours() === hour;
    });
    openDrillDown(`${day} ${hour}:00 UTC`, tickets);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Hourly Activity Heatmap (UTC)</h3>
      <div className="overflow-x-auto">
        <div className="inline-grid gap-px" style={{ gridTemplateColumns: `60px repeat(24, 1fr)` }}>
          <div />
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="text-[10px] text-gray-400 text-center">{i}</div>
          ))}
          {days.map((day, dayIdx) => (
            <React.Fragment key={day}>
              <div className="text-xs text-gray-500 flex items-center">{day}</div>
              {Array.from({ length: 24 }, (_, hour) => {
                const cell = data.find(d => d.dayIndex === dayIdx && d.hour === hour);
                const count = cell?.count || 0;
                const intensity = count / maxCount;
                const bg = count === 0 ? '#f3f4f6' : `rgba(59, 130, 246, ${0.15 + intensity * 0.85})`;
                return (
                  <div
                    key={`${dayIdx}-${hour}`}
                    title={`${day} ${hour}:00 — ${count} tickets`}
                    className="w-5 h-5 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-400"
                    style={{ backgroundColor: bg }}
                    onClick={() => handleCellClick(dayIdx, hour, day)}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
