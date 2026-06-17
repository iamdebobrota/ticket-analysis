import { useData } from '../context/DataContext';

export default function FilterBar() {
  const { filters, updateFilter, clearFilters, agents, allCategories, fileNames } = useData();

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
    <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase">From</label>
        <input
          type="date"
          onChange={(e) => handleDateChange('start', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase">To</label>
        <input
          type="date"
          onChange={(e) => handleDateChange('end', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <select
        value={filters.agent}
        onChange={(e) => updateFilter('agent', e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1"
      >
        <option value="all">All Agents</option>
        {agents.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      <div className="flex items-center gap-1">
        {['open', 'closed', 'snoozed'].map(state => (
          <button
            key={state}
            onClick={() => handleStateToggle(state)}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
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
        className="text-sm border border-gray-300 rounded px-2 py-1"
      >
        <option value="all">All Files</option>
        {fileNames.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      <select
        value={filters.category}
        onChange={(e) => updateFilter('category', e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1"
      >
        <option value="all">All Categories</option>
        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-xs px-2 py-1 text-red-600 hover:text-red-800 transition-colors"
        >
          Clear all ({activeCount})
        </button>
      )}
    </div>
  );
}
