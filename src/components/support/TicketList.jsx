import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';

function formatTime(seconds) {
  if (seconds == null) return 'N/A';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3600).toFixed(1)} hr`;
}

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleString();
}

const SENTIMENT_COLORS = { positive: 'text-green-600', neutral: 'text-gray-500', negative: 'text-red-600' };

const PAGE_SIZE = 20;

export default function TicketList() {
  const { filteredTickets } = useData();
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sorted = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (aVal == null) aVal = sortDir === 'asc' ? Infinity : -Infinity;
      if (bVal == null) bVal = sortDir === 'asc' ? Infinity : -Infinity;
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredTickets, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const pageTickets = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const columns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'title', label: 'Subject' },
    { key: 'agentName', label: 'Agent' },
    { key: 'timeToAdminReply', label: 'Response Time' },
    { key: 'state', label: 'Status' },
    { key: 'sentiment', label: 'Sentiment' },
    { key: 'primaryCategory', label: 'Category' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Tickets ({sorted.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="pb-2 pr-3 cursor-pointer hover:text-gray-700"
                >
                  {col.label} {sortField === col.key && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageTickets.map(ticket => (
              <React.Fragment key={ticket.id}>
                <tr
                  onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                  className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                >
                  <td className="py-2 pr-3">{ticket.customerName}</td>
                  <td className="py-2 pr-3 max-w-[200px] truncate">{ticket.title || ticket.initialMessage?.slice(0, 50)}</td>
                  <td className="py-2 pr-3">{ticket.agentName || '—'}</td>
                  <td className="py-2 pr-3">{formatTime(ticket.timeToAdminReply)}</td>
                  <td className="py-2 pr-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ticket.state === 'closed' ? 'bg-green-100 text-green-700' :
                      ticket.state === 'open' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {ticket.state}
                    </span>
                  </td>
                  <td className={`py-2 pr-3 ${SENTIMENT_COLORS[ticket.sentiment]}`}>{ticket.sentiment}</td>
                  <td className="py-2">{ticket.primaryCategory}</td>
                </tr>
                {expandedId === ticket.id && (
                  <tr>
                    <td colSpan={7} className="p-4 bg-gray-50">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium">C</div>
                          <div>
                            <div className="text-xs text-gray-400">{ticket.customerName} &middot; {formatDate(ticket.createdAt)}</div>
                            <div className="text-sm text-gray-700 mt-1">{ticket.initialMessage}</div>
                          </div>
                        </div>
                        {ticket.parts
                          .filter(p => p.partType === 'comment' && p.text)
                          .map((part, i) => {
                            const isAgent = part.authorType === 'admin';
                            return (
                              <div key={i} className={`flex gap-3 ${isAgent ? 'flex-row-reverse text-right' : ''}`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                  isAgent ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {isAgent ? 'A' : 'C'}
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400">{part.authorName} &middot; {formatDate(part.createdAt)}</div>
                                  <div className="text-sm text-gray-700 mt-1">{part.text}</div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, sorted.length)} of {sorted.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setCurrentPage(1); setExpandedId(null); }}
              disabled={safeCurrentPage === 1}
              className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white"
            >
              First
            </button>
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setExpandedId(null); }}
              disabled={safeCurrentPage === 1}
              className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => { setCurrentPage(item); setExpandedId(null); }}
                    className={`px-2 py-1 text-xs rounded border ${
                      item === safeCurrentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); setExpandedId(null); }}
              disabled={safeCurrentPage === totalPages}
              className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white"
            >
              Next
            </button>
            <button
              onClick={() => { setCurrentPage(totalPages); setExpandedId(null); }}
              disabled={safeCurrentPage === totalPages}
              className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
