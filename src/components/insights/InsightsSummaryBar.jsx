export default function InsightsSummaryBar({ bugCount, featureCount, uxCount, totalTickets }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
      <span className="text-gray-600">
        <span className="font-semibold text-red-600">{bugCount}</span> bug reports,{' '}
        <span className="font-semibold text-blue-600">{featureCount}</span> feature requests,{' '}
        <span className="font-semibold text-amber-600">{uxCount}</span> UX issues{' '}
        found across <span className="font-semibold">{totalTickets}</span> tickets
      </span>
    </div>
  );
}
