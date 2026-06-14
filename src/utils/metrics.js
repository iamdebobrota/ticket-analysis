function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

export function bucketResponseTime(seconds) {
  if (seconds < 300) return '0-5min';
  if (seconds < 900) return '5-15min';
  if (seconds < 1800) return '15-30min';
  if (seconds < 3600) return '30-60min';
  if (seconds < 7200) return '1-2hr';
  return '2hr+';
}

export function bucketCloseTime(seconds) {
  if (seconds < 3600) return '<1hr';
  if (seconds < 14400) return '1-4hr';
  if (seconds < 43200) return '4-12hr';
  if (seconds < 86400) return '12-24hr';
  if (seconds < 259200) return '1-3d';
  return '3d+';
}

export const RESPONSE_TIME_BUCKET_ORDER = ['0-5min', '5-15min', '15-30min', '30-60min', '1-2hr', '2hr+'];
export const CLOSE_TIME_BUCKET_ORDER = ['<1hr', '1-4hr', '4-12hr', '12-24hr', '1-3d', '3d+'];

export function computeMetrics(tickets) {
  const totalTickets = tickets.length;

  const stateBreakdown = { open: 0, closed: 0, snoozed: 0 };
  for (const t of tickets) {
    stateBreakdown[t.state] = (stateBreakdown[t.state] || 0) + 1;
  }

  const responseTimes = tickets.map(t => t.timeToAdminReply).filter(v => v != null);
  const avgResponseTime = mean(responseTimes);

  const resolutionRate = totalTickets > 0 ? stateBreakdown.closed / totalTickets : 0;

  const ratings = tickets.map(t => t.rating).filter(v => v != null);
  const avgRating = mean(ratings);
  const ratedCount = ratings.length;

  const sentimentDistribution = { positive: 0, neutral: 0, negative: 0 };
  for (const t of tickets) {
    sentimentDistribution[t.sentiment] = (sentimentDistribution[t.sentiment] || 0) + 1;
  }

  const categoryDistribution = {};
  for (const t of tickets) {
    const cat = t.primaryCategory || 'general-inquiry';
    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
  }

  const responseTimeBuckets = {};
  for (const b of RESPONSE_TIME_BUCKET_ORDER) responseTimeBuckets[b] = 0;
  for (const v of responseTimes) {
    const bucket = bucketResponseTime(v);
    responseTimeBuckets[bucket] = (responseTimeBuckets[bucket] || 0) + 1;
  }

  const closeTimeBuckets = {};
  for (const b of CLOSE_TIME_BUCKET_ORDER) closeTimeBuckets[b] = 0;
  const closeTimes = tickets.map(t => t.timeToFirstClose).filter(v => v != null);
  for (const v of closeTimes) {
    const bucket = bucketCloseTime(v);
    closeTimeBuckets[bucket] = (closeTimeBuckets[bucket] || 0) + 1;
  }

  const agentMap = {};
  for (const t of tickets) {
    const name = t.agentName || 'Unassigned';
    if (!agentMap[name]) {
      agentMap[name] = { tickets: [], responseTimes: [], adminReplyCount: 0 };
    }
    agentMap[name].tickets.push(t);
    if (t.timeToAdminReply != null) agentMap[name].responseTimes.push(t.timeToAdminReply);
    agentMap[name].adminReplyCount += (t.adminParts || []).length;
  }

  const agentStats = {};
  for (const [name, data] of Object.entries(agentMap)) {
    const closed = data.tickets.filter(t => t.state === 'closed').length;
    const resolveTimes = data.tickets.map(t => t.timeToFirstClose).filter(v => v != null);
    agentStats[name] = {
      ticketCount: data.tickets.length,
      avgResponseTime: mean(data.responseTimes),
      avgResolveTime: mean(resolveTimes),
      repliesPerTicket: data.tickets.length > 0 ? data.adminReplyCount / data.tickets.length : 0,
      closedRate: data.tickets.length > 0 ? closed / data.tickets.length : 0,
    };
  }

  const dateMap = {};
  for (const t of tickets) {
    const day = new Date(t.createdAt * 1000).toISOString().slice(0, 10);
    if (!dateMap[day]) dateMap[day] = { open: 0, closed: 0, snoozed: 0 };
    dateMap[day][t.state] = (dateMap[day][t.state] || 0) + 1;
  }
  const volumeByDay = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts, total: counts.open + counts.closed + counts.snoozed }));

  const days = volumeByDay.length || 1;
  const dailyVolume = totalTickets / days;

  const agentDailyMap = {};
  for (const t of tickets) {
    const name = t.agentName || 'Unassigned';
    const day = new Date(t.createdAt * 1000).toISOString().slice(0, 10);
    if (!agentDailyMap[day]) agentDailyMap[day] = {};
    agentDailyMap[day][name] = (agentDailyMap[day][name] || 0) + 1;
  }
  const agentDailyActivity = Object.entries(agentDailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, agents]) => ({ date, ...agents }));

  const hourlyMap = {};
  for (const t of tickets) {
    const d = new Date(t.createdAt * 1000);
    const hour = d.getUTCHours();
    const day = d.getUTCDay();
    const key = `${day}-${hour}`;
    hourlyMap[key] = (hourlyMap[key] || 0) + 1;
  }
  const hourlyHeatmapData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      hourlyHeatmapData.push({
        day: dayNames[day],
        dayIndex: day,
        hour,
        count: hourlyMap[`${day}-${hour}`] || 0,
      });
    }
  }

  const reopenCount = tickets.filter(t => t.countReopens > 0).length;

  return {
    totalTickets,
    stateBreakdown,
    avgResponseTime,
    resolutionRate,
    avgRating,
    ratedCount,
    dailyVolume,
    sentimentDistribution,
    categoryDistribution,
    responseTimeBuckets,
    closeTimeBuckets,
    agentStats,
    volumeByDay,
    agentDailyActivity,
    hourlyHeatmapData,
    reopenCount,
  };
}
