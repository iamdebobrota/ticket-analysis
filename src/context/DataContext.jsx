import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { parseTickets, mergeTickets } from '../utils/parser';
import { categorizeAll } from '../utils/categorizer';
import { analyzeSentimentAll } from '../utils/sentiment';
import { computeMetrics } from '../utils/metrics';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [categoryOverrides, setCategoryOverrides] = useState({});
  const [drillDown, setDrillDown] = useState(null);

  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    agent: 'all',
    states: [],
    sourceFile: 'all',
    category: 'all',
  });

  const handleFilesUploaded = useCallback(async (files) => {
    const newNames = [];
    const allParsed = [];
    for (const file of files) {
      const text = await file.text();
      const raw = JSON.parse(text);
      const parsed = parseTickets(raw, file.name);
      allParsed.push(parsed);
      newNames.push(file.name);
    }

    setTickets(prev => {
      const merged = mergeTickets(prev, ...allParsed);
      return merged;
    });
    setFileNames(prev => [...new Set([...prev, ...newNames])]);
  }, []);

  const processedTickets = useMemo(() => {
    let result = categorizeAll(tickets);
    result = analyzeSentimentAll(result);
    return result.map(t => {
      if (categoryOverrides[t.id]) {
        return { ...t, primaryCategory: categoryOverrides[t.id] };
      }
      return t;
    });
  }, [tickets, categoryOverrides]);

  const filteredTickets = useMemo(() => {
    return processedTickets.filter(t => {
      if (filters.dateRange.start && t.createdAt < filters.dateRange.start) return false;
      if (filters.dateRange.end && t.createdAt > filters.dateRange.end) return false;
      if (filters.agent !== 'all' && t.agentName !== filters.agent) return false;
      if (filters.states.length > 0 && !filters.states.includes(t.state)) return false;
      if (filters.sourceFile !== 'all' && t.sourceFile !== filters.sourceFile) return false;
      if (filters.category !== 'all' && t.primaryCategory !== filters.category) return false;
      return true;
    });
  }, [processedTickets, filters]);

  const metrics = useMemo(() => computeMetrics(filteredTickets), [filteredTickets]);

  const agents = useMemo(() => {
    const names = new Set();
    for (const t of processedTickets) {
      if (t.agentName) names.add(t.agentName);
    }
    return Array.from(names).sort();
  }, [processedTickets]);

  const allCategories = useMemo(() => {
    const cats = new Set();
    for (const t of processedTickets) {
      if (t.primaryCategory) cats.add(t.primaryCategory);
    }
    return Array.from(cats).sort();
  }, [processedTickets]);

  const overrideCategory = useCallback((ticketId, newCategory) => {
    setCategoryOverrides(prev => ({ ...prev, [ticketId]: newCategory }));
  }, []);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const openDrillDown = useCallback((title, tickets) => {
    setDrillDown({ title, tickets });
  }, []);

  const closeDrillDown = useCallback(() => {
    setDrillDown(null);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: { start: null, end: null },
      agent: 'all',
      states: [],
      sourceFile: 'all',
      category: 'all',
    });
  }, []);

  const value = {
    tickets: processedTickets,
    filteredTickets,
    metrics,
    filters,
    fileNames,
    agents,
    allCategories,
    handleFilesUploaded,
    overrideCategory,
    updateFilter,
    clearFilters,
    drillDown,
    openDrillDown,
    closeDrillDown,
    hasData: tickets.length > 0,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
