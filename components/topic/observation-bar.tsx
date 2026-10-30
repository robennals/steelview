'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react';
import type { DataStep } from '@/lib/content/walkthrough';
import { ShownObservation } from './explore-panels';
import { Prose } from './prose';

const noSubscription = () => () => {};

type Observation = DataStep['observations'][number];

/** Which of a step's observations is shown, shared with the bar inside its chart. */
const Step = createContext<{
  observations: Observation[];
  index: number;
  open: boolean;
  go: (to: number) => void;
  toggle: () => void;
} | null>(null);

type ObservationStepProps = { observations: Observation[]; children: ReactNode };

/**
 * The observations made about one chart, one at a time: the same data can
 * support several findings, and a reader steps through them over it. The chart
 * arrives after its step, so this holds the reader's place while `ObservationBar`
 * is drawn first in the step and then inside the chart.
 */
export function ObservationStep({ observations, children }: ObservationStepProps) {
  // Opened in a sheet at one of these observations, start there.
  const shown = useContext(ShownObservation);
  const [index, setIndex] = useState(() => Math.max(0, observations.findIndex(o => o.id === shown)));
  const [open, setOpen] = useState(false);
  const step = useMemo(() => ({
    observations,
    index,
    open,
    go: (to: number) => {
      setIndex((to + observations.length) % observations.length);
      setOpen(false);
    },
    toggle: () => setOpen(was => !was),
  }), [observations, index, open]);
  return <Step.Provider value={step}>{children}</Step.Provider>;
}

/** Picks out `observation`'s part of the chart in `root`, and lets the rest recede. */
function markChart(root: Element, observation?: Observation) {
  const mark = observation?.mark;
  for (const element of root.querySelectorAll<HTMLElement | SVGElement>('[data-mark]')) {
    element.toggleAttribute('data-mark-shown', element.dataset.mark === observation?.id);
  }
  for (const element of root.querySelectorAll<HTMLElement | SVGElement>('[data-series]')) {
    element.toggleAttribute('data-mark-dimmed', Boolean(mark?.lines && !mark.lines.includes(element.dataset.series ?? '')));
  }
  for (const element of root.querySelectorAll<HTMLElement>('[data-row]')) {
    const picked = mark?.rows?.includes(element.dataset.row ?? '');
    element.toggleAttribute('data-mark-picked', Boolean(picked));
    element.toggleAttribute('data-mark-dimmed', Boolean(mark?.rows && !picked));
  }
}

/**
 * The shown observation as one line, between a chart's title and its graph:
 * its claim, which opens to its reasoning when clicked. Without JavaScript every
 * observation is shown in full, one after another. Outside a step, nothing.
 */
export function ObservationBar() {
  const step = useContext(Step);
  const ref = useRef<HTMLDivElement>(null);
  const enhanced = useSyncExternalStore(noSubscription, () => true, () => false);
  const shown = enhanced ? step?.observations[step.index] : undefined;

  // The chart can redraw under the mark, as when a table is sorted, so it is reapplied.
  useEffect(() => {
    const root = ref.current?.closest('.sv-walk__step');
    if (!root) return;
    const apply = () => markChart(root, shown);
    apply();
    const redraws = new MutationObserver(apply);
    redraws.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-row'] });
    return () => redraws.disconnect();
  }, [shown]);

  if (!step || step.observations.length === 0) return null;
  const { observations, index, open, go, toggle } = step;
  const many = observations.length > 1;

  // Anywhere in the bubble toggles it, apart from its own controls and links, or
  // when the click ended a text selection. The claim's button is the keyboard's way in.
  const onBubbleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('a, button')) return;
    if (!window.getSelection()?.isCollapsed) return;
    toggle();
  };

  const controls = many && enhanced && (
    <div className="sv-observe__controls">
      <button type="button" className="sv-observe__step" aria-label="Previous observation" onClick={() => go(index - 1)}>‹</button>
      <p className="sv-observe__count">{index + 1} of {observations.length}</p>
      <button type="button" className="sv-observe__step" aria-label="Next observation" onClick={() => go(index + 1)}>›</button>
    </div>
  );

  return (
    <div ref={ref} className="sv-observe" data-toggles={enhanced || undefined} aria-live={many && enhanced ? 'polite' : undefined} onClick={enhanced ? onBubbleClick : undefined}>
      {observations.map((observation, i) => {
        const current = i === index;
        return (
          <div key={observation.id} className="sv-observe__item" data-observation={observation.id} data-open={(current && open) || !enhanced || undefined} hidden={enhanced && !current}>
            <div className="sv-observe__head">
              {current && controls}
              <h4 className="sv-observe__heading">
                {enhanced && current
                  ? (
                    <button type="button" className="sv-observe__toggle" aria-expanded={open} onClick={toggle}>
                      <span className="sv-observe__claim">{observation.heading}</span>
                      <span className="sv-observe__more" aria-hidden="true">{open ? 'Less ▴' : 'More ▾'}</span>
                    </button>
                  )
                  : <span className="sv-observe__claim">{observation.heading}</span>}
              </h4>
            </div>
            <div className="sv-observe__body" hidden={enhanced && !(current && open)}>
              <Prose html={observation.html} className="sv-walk__prose" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
