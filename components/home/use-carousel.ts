'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type UIEvent } from 'react';

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
  // Where a move is headed. Until it lands, the slides it passes are not the
  // current one, so a second click steps on from the destination.
  const destination = useRef<number | null>(null);

  useEffect(() => {
    const el = strip.current;
    const landed = () => { destination.current = null; };
    el?.addEventListener('scrollend', landed);
    return () => el?.removeEventListener('scrollend', landed);
  }, []);

  // `jump` lands straight on the slide, without sliding past the ones between.
  const go = useCallback((to: number, jump = false) => {
    const el = strip.current;
    if (!el) return;
    const next = (to + count) % count;
    destination.current = next;
    el.scrollTo({ left: next * el.clientWidth, behavior: jump || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setIndex(next);
    setAnnounced(next);
  }, [count]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
  };

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const position = Math.round(el.scrollLeft / el.clientWidth);
    if (destination.current === position) destination.current = null;
    if (destination.current === null) setIndex(position);
  };

  return { strip, index, announced, enhanced, go, onKeyDown, onScroll };
}
