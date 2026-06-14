import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import UploadZone from './components/UploadZone';
import FilterBar from './components/FilterBar';
import TabBar from './components/TabBar';
import OverviewTab from './components/overview/OverviewTab';
import SupportTab from './components/support/SupportTab';
import ProductInsightsTab from './components/insights/ProductInsightsTab';
import DrillDown from './components/DrillDown';

function Dashboard() {
  const { hasData } = useData();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold">Ticket Analysis Dashboard</h1>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <UploadZone />
        {hasData && (
          <>
            <FilterBar />
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'support' && <SupportTab />}
            {activeTab === 'insights' && <ProductInsightsTab />}
          </>
        )}
      </main>
      <DrillDown />
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
}

export default App;
