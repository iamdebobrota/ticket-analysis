# Ticket Analysis Dashboard — UI Polish & Features Design

**Date:** 2026-06-17  
**Status:** Approved  
**Scope:** Port config, UI polish + full responsiveness, CSV export, search, rule-based insights

---

## 1. Port Configuration

Add `server.port: 5000` to `vite.config.js`. Dev server starts on `http://localhost:5000`.

**File:** `vite.config.js`

---

## 2. UI Polish & Responsiveness

Approach: Tailwind-only, no new dependencies. Improve existing components in-place.

### 2.1 Global Layout (App.jsx)

- Header: subtle shadow (`shadow-sm`), slightly larger title, blue-600 bottom border accent
- Main container: responsive padding — `p-3` on mobile, `p-6` on desktop (`sm:p-6`)
- Consistent spacing between sections

### 2.2 Filter Bar (FilterBar.jsx)

- Mobile: stacks vertically, full-width inputs
- Tablet+: wraps into rows with proper spacing
- Improved styling: focus rings, rounded corners, consistent sizing
- All inputs get `focus:ring-2 focus:ring-blue-500 focus:outline-none`

### 2.3 Tab Bar (TabBar.jsx)

- Mobile: scrollable horizontal tabs if they overflow (overflow-x-auto)
- Slightly larger touch targets on mobile

### 2.4 KPI Cards (KPICard.jsx, OverviewTab.jsx, SupportTab.jsx)

- Mobile: 1 column grid
- Tablet: 2 columns
- Desktop: 5 columns (overview) / 3 columns (support)
- Add subtle left border accent color for visual hierarchy
- Add `shadow-sm` and `hover:shadow-md` transition
- Slightly larger value font

### 2.5 Chart Containers (all chart components)

- Mobile: single column, full-width
- Desktop: 2-column grid
- Chart wrappers: consistent card styling (bg-white, rounded-lg, shadow-sm, p-4) with title headers
- Min-height on mobile to prevent chart collapse (~250px)

### 2.6 Tables (DrillDown.jsx, AgentComparisonTable.jsx, TicketList.jsx)

- Wrap in `overflow-x-auto` for horizontal scroll on mobile
- Sticky header rows where appropriate
- Better hover states on rows

### 2.7 Product Insights (ProductInsightsTab.jsx, IssueColumn.jsx)

- Mobile: single column stack
- Tablet: 2 columns
- Desktop: 3 columns

### 2.8 Upload Zone (UploadZone.jsx)

- Mobile: reduce padding, smaller text
- Responsive padding: `p-8 sm:p-16`

---

## 3. CSV Export

### Location
- "Export CSV" button in FilterBar (right-aligned, after all filter controls)
- Also in DrillDown modal header

### Data
- Exports the currently filtered ticket set (respects all active filters including search)
- Columns: ID, Customer, Subject, Agent, Status, Category, Sentiment, Created Date, First Response Time, Resolution Time
- File named `tickets-export-YYYY-MM-DD.csv`

### Implementation
- Pure client-side: build CSV string, create Blob, trigger download via temporary `<a>` element
- New utility: `src/utils/export.js` — `exportTicketsCSV(tickets)` function
- No external libraries needed

---

## 4. Search

### Location
- First element in FilterBar
- Full-width on mobile, fixed-width (~250px) on desktop

### Behavior
- Searches across: ticket subject, customer name, initial message content
- Case-insensitive substring match
- Real-time filtering as user types, debounced at ~300ms
- Clear button (X) inside input when text is present
- Integrated into existing filter system in DataContext
- Included in active filter count badge

### Implementation
- Add `search` field to filters state in `DataContext.jsx`
- Apply search filter in the `filteredTickets` useMemo
- Search input component rendered inline in FilterBar

---

## 5. Rule-Based Insights Summary

### Location
- Collapsible banner between FilterBar and TabBar
- Shows when data is loaded

### Rules Engine
Computes these patterns from filtered data:

1. **Volume trend**: "Ticket volume up/down X% vs previous period" — compares first half vs second half of date range
2. **Slowest agent**: "Agent X has Nx the average response time" — flags agents >1.5x avg
3. **Top category spike**: "Bug reports make up X% of tickets — highest category" — when top category >35%
4. **Resolution rate alert**: "Only X% of tickets resolved" — when below 50%
5. **Sentiment drift**: "Negative sentiment at X% — above average" — when negative >30%

### Display
- Shows top 3 most notable insights as compact cards with icons
- Collapsible — click to expand/collapse, collapsed by default after first view
- Severity colors: red (alerts), amber (warnings), blue (informational)

### Implementation
- New utility: `src/utils/insights.js` — `computeInsights(filteredTickets, metrics)` function
- New component: `src/components/InsightsBanner.jsx`
- Each insight: `{ type, severity, message, icon }`

---

## Files Changed

| File | Change |
|------|--------|
| `vite.config.js` | Add server.port: 5000 |
| `src/App.jsx` | Header polish, layout spacing |
| `src/components/FilterBar.jsx` | Responsive layout, search input, export button |
| `src/components/TabBar.jsx` | Mobile scroll, touch targets |
| `src/components/KPICard.jsx` | Visual polish, accent border |
| `src/components/UploadZone.jsx` | Responsive padding |
| `src/components/DrillDown.jsx` | Table scroll, export button |
| `src/components/overview/OverviewTab.jsx` | Responsive grid breakpoints |
| `src/components/overview/VolumeChart.jsx` | Card wrapper, min-height |
| `src/components/overview/SentimentDonut.jsx` | Card wrapper, min-height |
| `src/components/overview/CategoryBarChart.jsx` | Card wrapper, min-height |
| `src/components/overview/ResponseTimeHistogram.jsx` | Card wrapper, min-height |
| `src/components/support/SupportTab.jsx` | Responsive grid breakpoints |
| `src/components/support/AgentComparisonTable.jsx` | Table scroll, sticky header |
| `src/components/support/ResponseTimeByAgent.jsx` | Card wrapper, min-height |
| `src/components/support/DailyActivityChart.jsx` | Card wrapper, min-height |
| `src/components/support/HourlyHeatmap.jsx` | Card wrapper, min-height |
| `src/components/support/TimeToCloseChart.jsx` | Card wrapper, min-height |
| `src/components/support/TicketList.jsx` | Table scroll, responsive |
| `src/components/insights/ProductInsightsTab.jsx` | Responsive grid |
| `src/components/insights/InsightsSummaryBar.jsx` | Responsive |
| `src/components/insights/IssueColumn.jsx` | Responsive cards |
| `src/context/DataContext.jsx` | Add search filter field + filtering logic |
| `src/utils/export.js` | **New** — CSV export utility |
| `src/utils/insights.js` | **New** — Rule-based insights computation |
| `src/components/InsightsBanner.jsx` | **New** — Insights display component |
