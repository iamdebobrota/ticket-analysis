import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { getBucket } from '../../utils/categorizer';
import InsightsSummaryBar from './InsightsSummaryBar';
import IssueColumn from './IssueColumn';

export default function ProductInsightsTab() {
  const { filteredTickets, overrideCategory } = useData();

  const { bugs, featureRequests, uxProblems } = useMemo(() => {
    const bugs = [];
    const featureRequests = [];
    const uxProblems = [];

    for (const t of filteredTickets) {
      const bucket = getBucket(t.primaryCategory);
      if (bucket === 'bugs') bugs.push(t);
      else if (bucket === 'feature-requests') featureRequests.push(t);
      else if (bucket === 'ux-problems') uxProblems.push(t);
    }

    return { bugs, featureRequests, uxProblems };
  }, [filteredTickets]);

  return (
    <div>
      <InsightsSummaryBar
        bugCount={bugs.length}
        featureCount={featureRequests.length}
        uxCount={uxProblems.length}
        totalTickets={filteredTickets.length}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <IssueColumn title="Bugs" tickets={bugs} color="text-red-600" onOverride={overrideCategory} />
        <IssueColumn title="Feature Requests" tickets={featureRequests} color="text-blue-600" onOverride={overrideCategory} />
        <IssueColumn title="UX Problems" tickets={uxProblems} color="text-amber-600" onOverride={overrideCategory} />
      </div>
    </div>
  );
}
