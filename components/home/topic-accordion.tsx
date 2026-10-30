'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { decodeHash } from '@/components/topic/open-details';

/** How long a row takes to open; matches `.sv-row__body` in globals.css. */
const OPEN_MS = 550;

type Accordion = {
  open: string;
  setOpen: (slug: string) => void;
  /** Starts holding one row's head still, cancelling any hold already running. */
  hold: (row: HTMLElement) => void;
};

const OpenRow = createContext<Accordion>({ open: '', setOpen: () => {}, hold: () => {} });

/** The home page's topic rows, exactly one of them open. Starts with `initial` open. */
export function TopicAccordion({ initial, children }: { initial: string; children: ReactNode }) {
  const [open, setOpen] = useState(initial);
  const stopHolding = useRef<() => void>(() => {});

  // Scroll in step with the transition so the clicked head stays where it was
  // clicked. A second click, or the reader scrolling, ends the hold.
  const hold = (row: HTMLElement) => {
    stopHolding.current();
    const before = row.getBoundingClientRect().top;
    const start = performance.now();
    let frame = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
    };
    const step = (now: number) => {
      const drift = row.getBoundingClientRect().top - before;
      if (Math.abs(drift) > 0.5) window.scrollBy(0, drift);
      if (now - start < OPEN_MS + 100) frame = requestAnimationFrame(step);
      else stop();
    };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    stopHolding.current = stop;
    frame = requestAnimationFrame(step);
  };

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
  const isOpen = open === slug;
  const bodyId = `topic-${slug}-preview`;

  useEffect(() => {
    if (!anchor) return;
    const reveal = (hash: string) => {
      if (decodeHash(hash) !== anchor) return;
      setOpen(slug);
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      row.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
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
  }, [anchor, slug, setOpen]);

  const toggle = () => {
    if (isOpen) {
      setOpen('');
      return;
    }
    if (row.current) hold(row.current);
    setOpen(slug);
  };

  return (
    <article id={anchor} className={className ? `sv-row ${className}` : 'sv-row'} ref={row} data-open={isOpen || undefined}>
      <div className="sv-row__head">
        {/* Stretched over the whole head by CSS, under the title link. */}
        <button type="button" className="sv-row__toggle" onClick={toggle} aria-expanded={isOpen} aria-controls={bodyId}>
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
      <div className="sv-row__body" id={bodyId} inert={!isOpen}>
        <div className="sv-row__inner">{children}</div>
      </div>
    </article>
  );
}
