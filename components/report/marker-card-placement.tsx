'use client';

import { useEffect, useRef } from 'react';

const GAP = 8;
const EDGE = 8;

/**
 * Where a card goes: under its marker so the graph stays in view, or above it
 * when the window has no room below, and always inside the window.
 */
export function cardPosition(
  marker: { top: number; bottom: number; left: number; width: number },
  card: { width: number; height: number },
  view: { width: number; height: number },
): { top: number; left: number } {
  const fitsBelow = marker.bottom + GAP + card.height <= view.height - EDGE;
  const top = fitsBelow ? marker.bottom + GAP : Math.max(EDGE, marker.top - GAP - card.height);
  const centred = marker.left + marker.width / 2 - card.width / 2;
  return { top, left: Math.max(EDGE, Math.min(centred, view.width - card.width - EDGE)) };
}

/**
 * Moves an open marker card beside the marker that opened it, keeps it there
 * as the page scrolls, and lights the marker's dotted line on the chart.
 *
 * The browser opens and closes the cards itself; this only places them, so
 * without JavaScript they still work, in the middle of the window. A chart is
 * drawn at several shapes of which one shows, so the marker is whichever
 * button for this card is on screen.
 */
export function MarkerCardPlacement() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cards = ref.current?.parentElement;
    const root = cards?.closest('[data-marker-root]');
    if (!cards || !root) return;

    const place = (card: HTMLElement) => {
      const marker = [...root.querySelectorAll(`[popovertarget="${card.id}"]`)].find(el => !card.contains(el) && el.getClientRects().length > 0);
      if (!marker) return;
      // Clear of the whole lane, so a card never covers the other numbers.
      const lane = (marker.closest('.sv-markers') ?? marker).getBoundingClientRect();
      const { left: x, width } = marker.getBoundingClientRect();
      const { top, left } = cardPosition({ top: lane.top, bottom: lane.bottom, left: x, width }, card.getBoundingClientRect(), { width: window.innerWidth, height: window.innerHeight });
      card.style.inset = `${top}px auto auto ${left}px`;
      card.style.margin = '0';
    };

    let open: HTMLElement | null = null;
    const follow = () => { if (open) place(open); };

    // Light the dotted lines of these markers ("2 3"), and the markers.
    const light = (numbers: string, on: boolean) => {
      const wanted = new Set(numbers.split(' '));
      for (const line of root.querySelectorAll<HTMLElement>('[data-marker-line]')) {
        if (line.dataset.markerLine?.split(' ').some(n => wanted.has(n))) line.toggleAttribute('data-marker-shown', on);
      }
    };

    // In a group's card, the item chosen is the one whose line stays lit;
    // with none chosen, the whole group's are.
    const onChoice = (event: Event) => {
      const choice = event.target;
      if (!(choice instanceof HTMLDetailsElement) || !choice.matches('.sv-marker-choice')) return;
      const card = choice.closest<HTMLElement>('.sv-marker-card');
      if (!card?.matches(':popover-open')) return;
      const chosen = card.querySelector<HTMLElement>('.sv-marker-choice[open]');
      light(card.dataset.marker ?? '', false);
      light(chosen?.dataset.marker ?? card.dataset.marker ?? '', true);
      place(card);
    };

    // Before the toggle, so a card never shows for a frame anywhere else. It
    // is not displayed yet, so it is displayed just long enough to measure.
    const onBeforeToggle = (event: Event) => {
      const card = event.target;
      if (!(event instanceof ToggleEvent) || !(card instanceof HTMLElement) || !card.matches('.sv-marker-card')) return;
      const opening = event.newState === 'open';
      light(card.dataset.marker ?? '', opening);
      if (opening) {
        card.style.display = 'block';
        place(card);
        card.style.removeProperty('display');
        open = card;
      } else if (open === card) {
        open = null;
      }
    };

    cards.addEventListener('beforetoggle', onBeforeToggle, true);
    cards.addEventListener('toggle', onChoice, true);
    window.addEventListener('scroll', follow, { capture: true, passive: true });
    window.addEventListener('resize', follow);
    return () => {
      cards.removeEventListener('beforetoggle', onBeforeToggle, true);
      cards.removeEventListener('toggle', onChoice, true);
      window.removeEventListener('scroll', follow, { capture: true });
      window.removeEventListener('resize', follow);
    };
  }, []);

  return <span ref={ref} hidden />;
}
