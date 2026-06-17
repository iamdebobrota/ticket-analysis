import { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { exportTicketsCSV } from '../utils/export';

function formatTime(seconds) {
  if (seconds == null) return 'N/A';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3600).toFixed(1)} hr`;
}

const SENTIMENT_COLORS = { positive: 'text-green-600', neutral: 'text-gray-500', negative: 'text-red-600' };

const COLUMNS = [
  { key: 'customerName', label: 'Customer' },
  { key: 'title', label: 'Subject' },
  { key: 'agentName', label: 'Agent' },
  { key: 'timeToAdminReply', label: 'Response Time' },
  { key: 'state', label: 'Status' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'primaryCategory', label: 'Category' },
];

export default function DrillDown() {
  const { drillDown, closeDrillDown } = useData();
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    if (!drillDown) return;
    const onKey = (e) => { if (e.key === 'Escape') closeDrillDown(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drillDown, closeDrillDown]);

  const sorted = useMemo(() => {
    if (!drillDown) return [];
    return [...drillDown.tickets].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (aVal == null) aVal = sortDir === 'asc' ? Infinity : -Infinity;
      if (bVal == null) bVal = sortDir === 'asc' ? Infinity : -Infinity;
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [drillDown, sortField, sortDir]);

  if (!drillDown) return null;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeDrillDown}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">{drillDown.title}</h2>
            <p className="text-sm text-gray-500">{drillDown.tickets.length} ticket{drillDown.tickets.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportTicketsCSV(drillDown.tickets)}
              className="text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 transition-colors"
            >
              &#11123; CSV
            </button>
            <button onClick={closeDrillDown} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
        </div>
        <div className="overflow-auto flex-1 px-4 sm:px-6 py-4">
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No tickets in this group.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                    {COLUMNS.map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)} className="pb-2 pr-3 cursor-pointer hover:text-gray-700 whitespace-nowrap sticky top-0 bg-white">
                        {col.label} {sortField === col.key && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(ticket => (
                    <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-2 pr-3 whitespace-nowrap">{ticket.customerName}</td>
                      <td className="py-2 pr-3 max-w-[200px] truncate">{ticket.title || ticket.initialMessage?.slice(0, 50)}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{ticket.agentName || '—'}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{formatTime(ticket.timeToAdminReply)}</td>
                      <td className="py-2 pr-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ticket.state === 'closed' ? 'bg-green-100 text-green-700' :
                          ticket.state === 'open' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{ticket.state}</span>
                      </td>
                      <td className={`py-2 pr-3 ${SENTIMENT_COLORS[ticket.sentiment]}`}>{ticket.sentiment}</td>
                      <td className="py-2">{ticket.primaryCategory}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
