import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { computeInsights } from '../utils/insights';

const SEVERITY_STYLES = {
  red: 'bg-red-50 border-red-200 text-red-800',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function InsightsBanner() {
  const { filteredTickets, metrics } = useData();
  const [collapsed, setCollapsed] = useState(false);

  const insights = useMemo(
    () => computeInsights(filteredTickets, metrics),
    [filteredTickets, metrics]
  );

  if (insights.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 mb-2 transition-colors"
      >
        <span className={`transition-transform ${collapsed ? '' : 'rotate-90'}`}>&#9654;</span>
        Insights ({insights.length})
      </button>
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {insights.map(insight => (
            <div
              key={insight.id}
              className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-sm ${SEVERITY_STYLES[insight.severity]}`}
            >
              <span className="flex-shrink-0 text-base leading-none mt-0.5">{insight.icon}</span>
              <span>{insight.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
