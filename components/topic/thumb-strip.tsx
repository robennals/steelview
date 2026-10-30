'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type ThumbStripProps = {
  /** Thumbnails, as `<li>`s, enough to fill the widest line. */
  thumbs: ReactNode[];
  /** How many there are in all, which can be more than `thumbs`. */
  total: number;
};

/**
 * A closed row's thumbnails, on one line at any width. CSS decides how many
 * columns fit; this reads that and shows as many thumbnails as there are
 * columns, or if some will not fit, one fewer and a last tile counting the rest.
 * Without JavaScript the line is simply cut off at the edge.
 */
export function ThumbStrip({ thumbs, total }: ThumbStripProps) {
  const list = useRef<HTMLOListElement>(null);
  const [columns, setColumns] = useState(thumbs.length);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const measure = () => {
      // An open row hides its thumbnails, which leaves nothing to measure.
      if (el.clientWidth > 0) setColumns(getComputedStyle(el).gridTemplateColumns.split(' ').length);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shown = Math.min(thumbs.length, total <= columns ? total : columns - 1);
  return (
    <ol className="sv-row__thumbs sv-walk__thumbs" ref={list} aria-hidden="true">
      {thumbs.slice(0, shown)}
      {shown < total && (
        <li>
          <div className="sv-row__thumb sv-walk__more">+{total - shown} more</div>
        </li>
      )}
    </ol>
  );
}
