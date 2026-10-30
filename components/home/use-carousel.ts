'use client';

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type UIEvent } from 'react';

const noSubscription = () => () => {};

/**
 * The state behind a horizontally scroll-snapped strip of `count` slides: which
 * slide is showing, a `go` that scrolls to another, and the strip's key and
 * scroll handlers. `enhanced` is false in the server render and true once
 * hydrated, since controls that scroll the strip need script.
 */
export function useCarousel(count: number) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // Announced only where a move ends, not for every slide a smooth scroll passes.
  const [announced, setAnnounced] = useState(0);
  const enhanced = useSyncExternalStore(noSubscription, () => true, () => false);

  const go = (to: number) => {
    const el = strip.current;
    if (!el) return;
    const next = (to + count) % count;
    el.scrollTo({ left: next * el.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setIndex(next);
    setAnnounced(next);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
  };

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return { strip, index, announced, enhanced, go, onKeyDown, onScroll };
}
