'use client';

import { useContext, useState, useSyncExternalStore } from 'react';
import { ShownObservation } from './explore-panels';
import { Prose } from './prose';

const noSubscription = () => () => {};

type ObservationCyclerProps = { observations: { id: string; heading: string; html: string }[] };

/**
 * The observations made about one chart, one at a time: the same data can
 * support several findings, and a reader steps through them beside it.
 * Without JavaScript every observation is shown, one after another.
 */
export function ObservationCycler({ observations }: ObservationCyclerProps) {
  // Opened in a sheet at one of these observations, start there.
  const shown = useContext(ShownObservation);
  const [index, setIndex] = useState(() => Math.max(0, observations.findIndex(o => o.id === shown)));
  const enhanced = useSyncExternalStore(noSubscription, () => true, () => false);
  const many = observations.length > 1;
  const go = (to: number) => setIndex((to + observations.length) % observations.length);

  return (
    <div className="sv-observe">
      {many && enhanced && (
        <div className="sv-observe__controls">
          <button type="button" className="sv-observe__step" aria-label="Previous observation" onClick={() => go(index - 1)}>‹</button>
          <p className="sv-observe__count">Observation {index + 1} of {observations.length}</p>
          <button type="button" className="sv-observe__step" aria-label="Next observation" onClick={() => go(index + 1)}>›</button>
        </div>
      )}
      <div aria-live={many && enhanced ? 'polite' : undefined}>
        {observations.map((observation, i) => (
          <div key={i} className="sv-observe__item" data-observation={observation.id} hidden={enhanced && i !== index}>
            <h4 className="sv-observe__heading">{observation.heading}</h4>
            <Prose html={observation.html} className="sv-walk__prose" />
          </div>
        ))}
      </div>
    </div>
  );
}
