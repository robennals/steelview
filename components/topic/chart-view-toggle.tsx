'use client';

import { useState, type ReactNode } from 'react';

type View = 'graph' | 'alternate' | 'table';

/**
 * Shared graph/table switcher for chart primitives. A figure with two
 * drawings of the same data — a map's real shapes and its tiles — passes the
 * second as `alternate`, and the switch gains a button for it before Table.
 */
export function ChartViewToggle({
  label,
  graph,
  table,
  graphLabel = 'Graph',
  alternate,
}: {
  label: string;
  /** The view shown first, and the one rendered on the server. */
  graph: ReactNode;
  table: ReactNode;
  /** The first button's name, e.g. "Map". */
  graphLabel?: string;
  alternate?: { label: string; graph: ReactNode };
}) {
  const [view, setView] = useState<View>('graph');

  return (
    <div className="sv-chart__view">
      <div className="sv-chart__view-controls" role="group" aria-label={`${label} display`}>
        <button type="button" aria-pressed={view === 'graph'} onClick={() => setView('graph')}>{graphLabel}</button>
        {alternate && <button type="button" aria-pressed={view === 'alternate'} onClick={() => setView('alternate')}>{alternate.label}</button>}
        <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button>
      </div>
      {view === 'graph' ? graph : view === 'alternate' ? alternate?.graph : table}
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
