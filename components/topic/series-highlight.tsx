'use client';

import { useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from 'react';

function seriesFor(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>('[data-series]')?.dataset.series ?? null;
}

/**
 * Small client boundary around otherwise server-rendered series-chart markup.
 * A line and its legend key share a data-series value, so this component can
 * link them without making the data, SVG layout, or table client-rendered.
 */
export function SeriesHighlight({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [activeSeries, setActiveSeries] = useState<string | null>(null);

  useEffect(() => {
    for (const element of root.current?.querySelectorAll<HTMLElement>('[data-series]') ?? []) {
      if (activeSeries === null) element.removeAttribute('data-highlighted');
      else element.dataset.highlighted = element.dataset.series === activeSeries ? 'true' : 'false';
    }
  }, [activeSeries]);

  const activate = (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    setActiveSeries(seriesFor(event.target));
  };

  const deactivate = (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    setActiveSeries(seriesFor(event.relatedTarget));
  };

  return (
    <div
      ref={root}
      className="sv-chart__highlight"
      onPointerOver={activate}
      onPointerOut={deactivate}
      onFocus={activate}
      onBlur={deactivate}
    >
      {children}
    </div>
  );
}
