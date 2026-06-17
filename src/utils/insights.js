const SEVERITY_RANK = { red: 0, amber: 1, blue: 2 };

export function computeInsights(filteredTickets, metrics) {
  if (metrics.totalTickets === 0) return [];

  const insights = [];

  // Volume trend: compare first half vs second half of date range
  const days = metrics.volumeByDay;
  if (days.length >= 4) {
    const mid = Math.floor(days.length / 2);
    const firstHalf = days.slice(0, mid);
    const secondHalf = days.slice(mid);
    const avgFirst = firstHalf.reduce((s, d) => s + d.total, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, d) => s + d.total, 0) / secondHalf.length;
    if (avgFirst > 0) {
      const change = ((avgSecond - avgFirst) / avgFirst) * 100;
      if (Math.abs(change) >= 20) {
        const dir = change > 0 ? 'up' : 'down';
        const severity = change > 50 ? 'red' : change > 0 ? 'amber' : 'blue';
        insights.push({
          id: 'volume-trend',
          severity,
          message: `Ticket volume ${dir} ${Math.abs(Math.round(change))}% in recent period`,
          icon: change > 0 ? '↑' : '↓',
        });
      }
    }
  }

  // Slow agent: flag agents >1.5x the overall average
  const agentEntries = Object.entries(metrics.agentStats).filter(([name]) => name !== 'Unassigned');
  if (agentEntries.length >= 2) {
    const allResponseTimes = agentEntries.map(([, s]) => s.avgResponseTime).filter(v => v > 0);
    const overallAvg = allResponseTimes.reduce((s, v) => s + v, 0) / allResponseTimes.length;
    if (overallAvg > 0) {
      const slowest = agentEntries.reduce((worst, [name, s]) =>
        s.avgResponseTime > (worst?.[1]?.avgResponseTime || 0) ? [name, s] : worst
      , null);
      if (slowest && slowest[1].avgResponseTime >= overallAvg * 1.5) {
        const ratio = (slowest[1].avgResponseTime / overallAvg).toFixed(1);
        insights.push({
          id: 'slow-agent',
          severity: 'amber',
          message: `${slowest[0]} has ${ratio}x the average response time`,
          icon: '⏱',
        });
      }
    }
  }

  // Top category spike: when top category > 35%
  const catEntries = Object.entries(metrics.categoryDistribution).sort((a, b) => b[1] - a[1]);
  if (catEntries.length > 0) {
    const [topCat, topCount] = catEntries[0];
    const pct = (topCount / metrics.totalTickets) * 100;
    if (pct > 35) {
      insights.push({
        id: 'top-category',
        severity: 'blue',
        message: `${topCat} makes up ${Math.round(pct)}% of tickets — highest category`,
        icon: '📊',
      });
    }
  }

  // Resolution rate alert: when below 50%
  if (metrics.resolutionRate < 0.5) {
    insights.push({
      id: 'resolution-rate',
      severity: 'red',
      message: `Only ${Math.round(metrics.resolutionRate * 100)}% of tickets resolved`,
      icon: '⚠️',
    });
  }

  // Sentiment drift: negative > 30%
  const negPct = metrics.totalTickets > 0
    ? (metrics.sentimentDistribution.negative / metrics.totalTickets) * 100
    : 0;
  if (negPct > 30) {
    insights.push({
      id: 'sentiment-drift',
      severity: 'amber',
      message: `Negative sentiment at ${Math.round(negPct)}% — above average`,
      icon: '😟',
    });
  }

  insights.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  return insights.slice(0, 5);
}
