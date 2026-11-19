'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { ChoiceGroup } from '@/components/report/controls';
import { ControlBar, type BarItem } from '@/components/report/control-bar';
import { useShowAsSwitch } from './show-as';

type View = 'graph' | 'alternate' | 'table';

/** One Graph/Table choice for several drawings of the same chart. */
const SharedView = createContext<[View, (view: View) => void] | null>(null);

/**
 * Makes every `ChartViewToggle` inside it share one choice of Graph or Table:
 * the readings of a series, of which a "Show as" switch shows one at a time, so
 * switching reading keeps the reader on the graph or the table they chose.
 */
export function SharedChartView({ children }: { children: ReactNode }) {
  const state = useState<View>('graph');
  return <SharedView.Provider value={state}>{children}</SharedView.Provider>;
}

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
  const own = useState<View>('graph');
  const [view, setView] = useContext(SharedView) ?? own;
  const switcher = (
    <div className="sv-chart__view-controls" role="group" aria-label={`${label} display`}>
      <button type="button" aria-pressed={view === 'graph'} onClick={() => setView('graph')}>{graphLabel}</button>
      {alternate && <button type="button" aria-pressed={view === 'alternate'} onClick={() => setView('alternate')}>{alternate.label}</button>}
      <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button>
    </div>
  );

  const showAs = useShowAsSwitch();
  const readings: BarItem[] = showAs
    ? [{
        key: 'show-as',
        label: 'Show as',
        summary: showAs.views.find(v => v.id === showAs.current)?.label ?? '',
        hideLabel: true,
        single: true,
        panel: <ChoiceGroup label="Show as" hideLabel choices={showAs.views.map(v => ({ value: v.id, label: v.label }))} value={showAs.current} onChange={showAs.choose} />,
      }]
    : [];

  return (
    <div className="sv-chart__view">
      {/* A series with several readings adds a "Show as" dropdown beside the switch. */}
      {showAs ? <ControlBar label={`${label} controls`} lead={switcher} items={readings} /> : switcher}
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
