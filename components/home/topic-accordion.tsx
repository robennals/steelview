'use client';

import Link from 'next/link';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

/** How long a row takes to open; matches `.sv-row__body` in globals.css. */
const OPEN_MS = 550;

const OpenRow = createContext<{ open: string; setOpen: (slug: string) => void }>({ open: '', setOpen: () => {} });

/** The home page's topic rows, exactly one of them open. Starts with `initial` open. */
export function TopicAccordion({ initial, children }: { initial: string; children: ReactNode }) {
  const [open, setOpen] = useState(initial);
  return (
    <OpenRow.Provider value={{ open, setOpen }}>
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
 * The title is a separate, ordinary link to the topic's report, and so is the
 * row's "Read the full report" button: without JavaScript the title still
 * reaches the topic, and the toggle simply does nothing.
 */
export function TopicRow({ slug, title, href, meta, subtitle, thumbs, children }: {
  slug: string;
  title: string;
  href: string;
  /** Tags and last-updated date, above the title. */
  meta: ReactNode;
  subtitle: string;
  /** Silhouettes of the first few preview charts, shown while the row is closed. */
  thumbs: ReactNode;
  children: ReactNode;
}) {
  const { open, setOpen } = useContext(OpenRow);
  const row = useRef<HTMLElement>(null);
  const isOpen = open === slug;
  const bodyId = `topic-${slug}-preview`;

  const toggle = () => {
    if (isOpen) {
      setOpen('');
      return;
    }
    const el = row.current;
    const before = el?.getBoundingClientRect().top ?? 0;
    setOpen(slug);
    const start = performance.now();
    const hold = (now: number) => {
      if (!el) return;
      const drift = el.getBoundingClientRect().top - before;
      if (Math.abs(drift) > 0.5) window.scrollBy(0, drift);
      if (now - start < OPEN_MS + 100) requestAnimationFrame(hold);
    };
    requestAnimationFrame(hold);
  };

  return (
    <article className="sv-row" ref={row} data-open={isOpen || undefined}>
      <div className="sv-row__head">
        {/* Stretched over the whole head by CSS, under the title link. */}
        <button type="button" className="sv-row__toggle" onClick={toggle} aria-expanded={isOpen} aria-controls={bodyId}>
          <span className="sv-visually-hidden">{isOpen ? 'Hide' : 'Show'} the {title} preview</span>
        </button>
        <div className="sv-row__heading">
          {meta}
          <h2 className="sv-row__title">
            <Link href={href} className="sv-row__link">{title}</Link>
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
