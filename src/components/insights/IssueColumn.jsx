import { useState } from 'react';
import { CATEGORIES } from '../../utils/categorizer';

const SEVERITY_COLORS = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-green-100 text-green-700',
};

function getSeverity(count, avgSentiment) {
  const score = count * (1 + Math.abs(avgSentiment));
  if (score >= 10) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
}

export default function IssueColumn({ title, tickets, color, onOverride }) {
  const [expandedCluster, setExpandedCluster] = useState(null);

  const clusters = {};
  for (const t of tickets) {
    const cat = t.primaryCategory;
    if (!clusters[cat]) clusters[cat] = [];
    clusters[cat].push(t);
  }

  const clusterList = Object.entries(clusters)
    .map(([cat, items]) => {
      const avgSentiment = items.length > 0
        ? items.reduce((s, t) => s + (t.sentimentScore || 0), 0) / items.length
        : 0;
      return {
        category: cat,
        label: CATEGORIES[cat]?.label || cat,
        count: items.length,
        severity: getSeverity(items.length, avgSentiment),
        samples: items.slice(0, 3).map(t => t.initialMessage?.slice(0, 100) || ''),
        tickets: items,
      };
    })
    .sort((a, b) => b.count - a.count);

  const allCategoryKeys = ['bugs', 'feature-request', 'ux-problem', 'billing', 'quality', 'access-login', 'general-inquiry'];

  return (
    <div>
      <h3 className={`text-sm font-semibold mb-3 ${color}`}>{title} ({tickets.length})</h3>
      <div className="space-y-3">
        {clusterList.map(cluster => (
          <div key={cluster.category} className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">{cluster.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[cluster.severity]}`}>
                  {cluster.severity}
                </span>
                <span className="text-xs text-gray-400">{cluster.count} tickets</span>
              </div>
            </div>
            <div className="space-y-1 mb-2">
              {cluster.samples.map((sample, i) => (
                <p key={i} className="text-xs text-gray-500 italic truncate">&ldquo;{sample}&rdquo;</p>
              ))}
            </div>
            <button
              onClick={() => setExpandedCluster(expandedCluster === cluster.category ? null : cluster.category)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {expandedCluster === cluster.category ? 'Collapse' : `View all ${cluster.count} tickets`}
            </button>
            {expandedCluster === cluster.category && (
              <div className="mt-2 border-t border-gray-100 pt-2 space-y-2 max-h-64 overflow-y-auto">
                {cluster.tickets.map(t => (
                  <div key={t.id} className="flex items-start gap-2 text-xs">
                    <div className="flex-1">
                      <span className="font-medium">{t.customerName}:</span>{' '}
                      <span className="text-gray-600">{t.initialMessage?.slice(0, 120)}</span>
                    </div>
                    <select
                      value={t.primaryCategory}
                      onChange={(e) => onOverride(t.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-1 py-0.5 flex-shrink-0"
                    >
                      {allCategoryKeys.map(k => (
                        <option key={k} value={k}>{CATEGORIES[k]?.label || k}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {clusterList.length === 0 && (
          <p className="text-xs text-gray-400 italic">No tickets in this category</p>
        )}
      </div>
    </div>
  );
}
