const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'support', label: 'Support Performance' },
  { id: 'insights', label: 'Product Insights' },
];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="flex overflow-x-auto border-b border-gray-200 mb-6 -mx-1 scrollbar-hide">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
