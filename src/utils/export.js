function formatTime(seconds) {
  if (seconds == null) return 'N/A';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3600).toFixed(1)} hr`;
}

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = ['ID', 'Customer', 'Subject', 'Agent', 'Status', 'Category', 'Sentiment', 'Created Date', 'First Response Time', 'Resolution Time'];

export function buildCSV(tickets) {
  const rows = [HEADERS.join(',')];
  for (const t of tickets) {
    const createdDate = t.createdAt ? new Date(t.createdAt * 1000).toISOString() : 'N/A';
    rows.push([
      escapeCSV(t.id),
      escapeCSV(t.customerName),
      escapeCSV(t.title),
      escapeCSV(t.agentName),
      escapeCSV(t.state),
      escapeCSV(t.primaryCategory),
      escapeCSV(t.sentiment),
      escapeCSV(createdDate),
      escapeCSV(formatTime(t.timeToAdminReply)),
      escapeCSV(formatTime(t.timeToFirstClose)),
    ].join(','));
  }
  return rows.join('\n');
}

export function exportTicketsCSV(tickets) {
  const csv = buildCSV(tickets);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tickets-export-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
