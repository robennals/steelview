'use client';

import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { TopicAccordion } from '@/components/home/topic-accordion';
import { shuffledOrder } from '@/lib/shuffle';

type ScrollPosition = { element: Element; left: number; top: number };

/** Where everything scrolled inside `root` is scrolled to. */
function scrollPositions(root: Element): ScrollPosition[] {
  return [...root.querySelectorAll('*')].flatMap(element =>
    element.scrollLeft || element.scrollTop ? [{ element, left: element.scrollLeft, top: element.scrollTop }] : []);
}

/**
 * The Viewpoints section: its heading, and the viewpoints' rows in a random
 * order, with a Shuffle button that deals them again, so that no viewpoint
 * is always the one read first.
 *
 * The page is built once, ahead of time, so the server sends the content's
 * order and the shuffle happens once the page has loaded. Without JavaScript
 * the rows stay in that order and the button is not shown.
 *
 * A row keeps its key, so it stays open when it moves. The browser, though,
 * resets the scroll position of anything inside an element that is moved, and
 * a slideshow's card is a scroll position: those are saved before each deal
 * and put back before the page is painted.
 */
export function ShuffledViewpoints({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children);
  const [order, setOrder] = useState<number[] | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const scrolled = useRef<ScrollPosition[]>([]);

  const deal = useCallback((count: number, current?: number[]) => {
    if (container.current) scrolled.current = scrollPositions(container.current);
    setOrder(shuffledOrder(count, current));
  }, []);

  useEffect(() => {
    // Deal once on load; the server's order is only what the page is built with.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    deal(rows.length);
  }, [rows.length, deal]);

  useLayoutEffect(() => {
    for (const { element, left, top } of scrolled.current) element.scrollTo({ left, top, behavior: 'instant' });
  }, [order]);

  return (
    <div ref={container}>
      <div className="sv-section__head">
        <h2 className="sv-section__title">Viewpoints</h2>
        {order && rows.length > 1 && (
          <button type="button" className="sv-section__shuffle" onClick={() => deal(rows.length, order)}>
            {/* Two crossing arrows, the usual sign for a shuffle. */}
            <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
            Shuffle
          </button>
        )}
      </div>
      <TopicAccordion initial="">{order ? order.map(i => rows[i]) : rows}</TopicAccordion>
    </div>
  );
}
