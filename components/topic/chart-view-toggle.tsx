'use client';

import { useState, type ReactNode } from 'react';

/** Shared graph/table switcher for chart primitives. */
export function ChartViewToggle({
  label,
  graph,
  table,
}: {
  label: string;
  graph: ReactNode;
  table: ReactNode;
}) {
  const [view, setView] = useState<'graph' | 'table'>('graph');

  return (
    <div className="sv-chart__view">
      <div className="sv-chart__view-controls" role="group" aria-label={`${label} display`}>
        <button type="button" aria-pressed={view === 'graph'} onClick={() => setView('graph')}>Graph</button>
        <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button>
      </div>
      {view === 'graph' ? graph : table}
      {/* The switch needs script, but every value must stay readable without
          it, so a no-JS reader gets the table as a collapsed disclosure. */}
      <noscript>
        <details className="sv-chart__data">
          <summary className="sv-chart__data-summary">Show the numbers</summary>
          {table}
        </details>
      </noscript>
    </div>
  );
}
