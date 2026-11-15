'use client';

import { Children, createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';
import { ChoiceGroup } from '@/components/report/controls';
import { SharedChartView } from './chart-view-toggle';
import { useChartStep } from './observation-bar';

const noSubscription = () => () => {};

/** The views of one series, the one shown, and how to choose another, for its switch. */
const Views = createContext<{ views: { id: string; label: string }[]; current: string; choose: (view: string) => void } | null>(null);

type ShowAsProps = {
  /** The series' readings, in order: one `children` element each. */
  views: { id: string; label: string }[];
  /** Drawn above the shown view: a data panel's observation bar. */
  bar?: ReactNode;
  children: ReactNode;
};

/**
 * One series' readings, one at a time: the same data in people and per head,
 * in money and in real terms. Each reading draws a `ShowAsSwitch` among its own
 * controls, so another way of reading the data is a click away rather than a
 * separate chart.
 *
 * In a data panel the view follows the observation being read, so a link to an
 * observation opens the view it is about, and choosing a view moves to its first
 * observation. Without JavaScript every view is drawn, one after another.
 */
export function ShowAs({ views, bar, children }: ShowAsProps) {
  const step = useChartStep();
  const enhanced = useSyncExternalStore(noSubscription, () => true, () => false);
  // A view the reader picked holds only while they stay on the observation they picked it at.
  const [picked, setPicked] = useState<{ view: string; at?: number }>();
  const followed = step?.observations[step.index]?.view;
  const current = (picked && picked.at === step?.index ? picked.view : undefined) ?? followed ?? views[0].id;

  const choose = (view: string) => {
    const first = step?.observations.findIndex(o => o.view === view) ?? -1;
    if (step && first >= 0 && step.observations[step.index]?.view !== view) {
      step.go(first);
      setPicked(undefined);
    } else {
      setPicked({ view, at: step?.index });
    }
  };

  return (
    <Views.Provider value={enhanced ? { views, current, choose } : null}>
      {bar}
      {/* Graph or Table is a separate choice, kept as the view changes. */}
      <SharedChartView>
        {Children.toArray(children).map((child, i) => (
          <div key={views[i].id} className="sv-show-as__view" hidden={enhanced && views[i].id !== current}>{child}</div>
        ))}
      </SharedChartView>
    </Views.Provider>
  );
}

/** The "Show as" switch of the series this sits in. Without JavaScript, or outside a `ShowAs`, nothing. */
export function ShowAsSwitch() {
  const switcher = useContext(Views);
  if (!switcher) return null;
  const { views, current, choose } = switcher;
  return (
    <div className="sv-show-as">
      {/* Named for a screen reader only: on the page it is just its buttons. */}
      <ChoiceGroup label="Show as" hideLabel choices={views.map(v => ({ value: v.id, label: v.label }))} value={current} onChange={choose} />
    </div>
  );
}
