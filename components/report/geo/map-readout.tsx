'use client';

import { useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from 'react';

type Active = { region: string; text: string } | null;

function activeFor(target: EventTarget | null): Active {
  if (!(target instanceof Element)) return null;
  const element = target.closest<HTMLElement | SVGElement>('[data-readout]');
  if (!element?.dataset.region || !element.dataset.readout) return null;
  return { region: element.dataset.region, text: element.dataset.readout };
}

/**
 * The one client boundary around an otherwise server-rendered map. Every area
 * carries its own sentence in `data-readout` ("London: 40.6%"), written on the
 * server with the same formatter as the table; this island only moves that
 * sentence into the line under the map and marks every drawing of the same
 * area (the main map and any inset) as active.
 *
 * The readout is a live region, so a keyboard user tabbing through the areas
 * hears each value without the map needing per-area tooltips.
 */
export function MapReadout({ hint, children }: { hint: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Active>(null);

  useEffect(() => {
    for (const element of root.current?.querySelectorAll<HTMLElement | SVGElement>('[data-region]') ?? []) {
      if (active && element.dataset.region === active.region) element.dataset.active = 'true';
      else delete element.dataset.active;
    }
  }, [active]);

  const enter = (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    const next = activeFor(event.target);
    if (next) setActive(next);
  };
  const leave = (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    setActive(activeFor(event.relatedTarget));
  };

  return (
    <div ref={root} className="sv-map__interactive" onPointerOver={enter} onPointerOut={leave} onFocus={enter} onBlur={leave}>
      {children}
      <p className="sv-map__readout" aria-live="polite" data-idle={active ? undefined : 'true'}>
        {active ? active.text : hint}
      </p>
    </div>
  );
}
