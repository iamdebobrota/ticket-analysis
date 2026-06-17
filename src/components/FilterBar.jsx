import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { exportTicketsCSV } from '../utils/export';

export default function FilterBar() {
  const { filters, updateFilter, clearFilters, agents, allCategories, fileNames, filteredTickets } = useData();
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => updateFilter('search', searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput, updateFilter]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const activeCount = [
    filters.dateRange.start || filters.dateRange.end ? 1 : 0,
    filters.agent !== 'all' ? 1 : 0,
    filters.states.length > 0 ? 1 : 0,
    filters.sourceFile !== 'all' ? 1 : 0,
    filters.category !== 'all' ? 1 : 0,
    filters.search ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleDateChange = (field, value) => {
    const ts = value ? Math.floor(new Date(value).getTime() / 1000) : null;
    updateFilter('dateRange', { ...filters.dateRange, [field]: ts });
  };

  const handleStateToggle = (state) => {
    const current = filters.states;
    const next = current.includes(state) ? current.filter(s => s !== state) : [...current, state];
    updateFilter('states', next);
  };

  return (
    <div className="mb-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col gap-3">
        {/* Search row */}
        <div className="relative w-full sm:w-64">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">&#128269;</span>
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg pl-8 pr-8 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              &#10005;
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase">From</label>
            <input
              type="date"
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase">To</label>
            <input
              type="date"
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={filters.agent}
            onChange={(e) => updateFilter('agent', e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Agents</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <div className="flex items-center gap-1">
            {['open', 'closed', 'snoozed'].map(state => (
              <button
                key={state}
                onClick={() => handleStateToggle(state)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  filters.states.includes(state)
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={filters.sourceFile}
            onChange={(e) => updateFilter('sourceFile', e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Files</option>
            {fileNames.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs px-2 py-1.5 text-red-600 hover:text-red-800 transition-colors"
            >
              Clear all ({activeCount})
            </button>
          )}

          <div className="ml-auto">
            <button
              onClick={() => exportTicketsCSV(filteredTickets)}
              className="text-xs sm:text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 transition-colors flex items-center gap-1.5"
            >
              <span>&#11123;</span> Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
