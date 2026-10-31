'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { decodeHash } from '@/components/topic/open-details';

/** How long a row takes to open; matches `.sv-row__body` in globals.css. */
const OPEN_MS = 550;

type Accordion = {
  open: string;
  setOpen: (slug: string) => void;
  /** Starts holding one row's head still, or gliding it to `to` pixels below the window's top, cancelling any hold already running. `settled` runs if the hold reaches its end. */
  hold: (row: HTMLElement, settled?: () => void, to?: number) => void;
};

const OpenRow = createContext<Accordion>({ open: '', setOpen: () => {}, hold: () => {} });

/** Whether the row a component sits in is open, so a row's body can load what it shows only once it is. */
const RowIsOpen = createContext(false);

/** A step a row's thumbnail asked for. A new object each time, so asking for the same step twice still moves there. */
type StepRequest = { step: number };

type StepControl = { request: StepRequest | null; openAt: (step: number) => void };

const RowStep = createContext<StepControl>({ request: null, openAt: () => {} });

const noSubscription = () => () => {};

export function useRowIsOpen(): boolean {
  return useContext(RowIsOpen);
}

/** The step the row's walkthrough was last asked to show, if any. */
export function useStepRequest(): StepRequest | null {
  return useContext(RowStep).request;
}

/** One thumbnail of a closed walkthrough row: a button opening the row at that step, not at its first. */
export function RowThumb({ step, children }: { step: number; children: ReactNode }) {
  const { openAt } = useContext(RowStep);
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false);
  return <button type="button" className="sv-walk__thumb" disabled={!hydrated} onClick={() => openAt(step)}>{children}</button>;
}

/** The home page's topic rows, exactly one of them open. Starts with `initial` open. */
export function TopicAccordion({ initial, children }: { initial: string; children: ReactNode }) {
  const [open, setOpen] = useState(initial);
  const stopHolding = useRef<() => void>(() => {});

  // Scroll in step with the transition so the clicked head stays where it was
  // clicked. A second click, or the reader scrolling, ends the hold.
  const hold = useCallback((row: HTMLElement, settled?: () => void, to?: number) => {
    stopHolding.current();
    const before = row.getBoundingClientRect().top;
    const end = to ?? before;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let frame = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
    };
    const step = (now: number) => {
      // Eases out, and steers by where the row is now: a row closing above it moves it mid-glide.
      const left = reducedMotion ? 0 : (1 - Math.min(1, (now - start) / (OPEN_MS + 100))) ** 3;
      const drift = row.getBoundingClientRect().top - (end + (before - end) * left);
      if (Math.abs(drift) > 0.5) window.scrollBy(0, drift);
      if (now - start < OPEN_MS + 100) frame = requestAnimationFrame(step);
      else {
        stop();
        settled?.();
      }
    };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    stopHolding.current = stop;
    frame = requestAnimationFrame(step);
  }, []);

  return (
    <OpenRow.Provider value={{ open, setOpen, hold }}>
      <div className="sv-rows">{children}</div>
    </OpenRow.Provider>
  );
}

/**
 * One topic row. Clicking anywhere on its head opens the row's preview —
 * closing whichever row was open, in the same transition — and clicking an
 * open row's head closes it again. Opening scrolls the page frame by frame to
 * hold the clicked head where the reader clicked it, so nothing jumps.
 *
 * Given an `href`, the title is a separate, ordinary link to the topic's
 * report, and so is the row's "Read the full report" button: without
 * JavaScript the title still reaches the topic, and the toggle simply does
 * nothing. Without one, the title is plain text and opens the row like the
 * rest of the head.
 *
 * Given an `anchor`, the row is that link target: a URL hash naming it, or a
 * click on an in-page link to it, opens the row and scrolls it into view.
 */
export function TopicRow({ slug, anchor, title, href, meta, subtitle, thumbs, className, children }: {
  slug: string;
  /** The row's id, so a link to `#<anchor>` opens it. */
  anchor?: string;
  title: string;
  href?: string;
  /** Tags and last-updated date, above the title. */
  meta: ReactNode;
  subtitle: string;
  /** Silhouettes of the first few preview charts, shown while the row is closed. */
  thumbs: ReactNode;
  /** Added to the row's own class, for rows laid out differently from a topic's. */
  className?: string;
  children: ReactNode;
}) {
  const { open, setOpen, hold } = useContext(OpenRow);
  const row = useRef<HTMLElement>(null);
  const toggleButton = useRef<HTMLButtonElement>(null);
  const [request, setRequest] = useState<StepRequest | null>(null);
  const isOpen = open === slug;
  // Without JavaScript a walkthrough row cannot open, so its body stays reachable (globals.css).
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false);
  const bodyId = `topic-${slug}-preview`;

  useEffect(() => {
    if (!anchor) return;
    const reveal = (hash: string) => {
      if (decodeHash(hash) !== anchor) return;
      setOpen(slug);
      if (row.current) hold(row.current, undefined, parseFloat(getComputedStyle(row.current).scrollMarginTop) || 0);
    };
    const onHashChange = () => reveal(location.hash.slice(1));
    // `hashchange` does not fire for a link to the hash the page is already on.
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (link instanceof HTMLAnchorElement) reveal(link.hash.slice(1));
    };
    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('click', onClick);
    };
  }, [anchor, slug, setOpen, hold]);

  const toggle = () => {
    if (isOpen) {
      setOpen('');
      return;
    }
    if (row.current) hold(row.current);
    setOpen(slug);
  };

  const openAt = (step: number) => {
    // The thumbnails vanish as the row opens, and the keyboard focus must not go with them.
    toggleButton.current?.focus({ preventScroll: true });
    // Once open, bring the chart on screen: the thumbnail may have been near the bottom of it.
    const reveal = () => {
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      row.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    };
    if (row.current) hold(row.current, reveal);
    setOpen(slug);
    setRequest({ step });
  };

  return (
    <article id={anchor} className={className ? `sv-row ${className}` : 'sv-row'} ref={row} data-open={isOpen || undefined}>
      <RowStep.Provider value={{ request, openAt }}>
        <div className="sv-row__head">
          {/* Stretched over the whole head by CSS, under the title link. */}
          <button type="button" className="sv-row__toggle" ref={toggleButton} onClick={toggle} aria-expanded={isOpen} aria-controls={bodyId}>
            <span className="sv-visually-hidden">{isOpen ? 'Hide' : 'Show'} the {title} preview</span>
          </button>
          <div className="sv-row__heading">
            {meta}
            <h2 className="sv-row__title">
              {href ? <Link href={href} className="sv-row__link">{title}</Link> : title}
            </h2>
            <p className="sv-row__subtitle">{subtitle}</p>
          </div>
          {thumbs}
          <span className="sv-row__chevron" aria-hidden="true" />
        </div>
        <div className="sv-row__body" id={bodyId} inert={hydrated && !isOpen}>
          <div className="sv-row__inner"><RowIsOpen.Provider value={isOpen}>{children}</RowIsOpen.Provider></div>
        </div>
      </RowStep.Provider>
    </article>
  );
}
