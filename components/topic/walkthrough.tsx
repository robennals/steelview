'use client';

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useStepRequest } from '@/components/home/topic-accordion';
import { useCarousel } from '@/components/home/use-carousel';

type WalkthroughProps = {
  name: string;
  headings: string[];
  /** What one step is, for its count and labels: "Step", "Chart". */
  noun: string;
  /** The last step's next button, once there is nothing after it. */
  endLabel: string;
  /** A miniature of each step. Given these, they run across the top as the way between steps, in place of the outline. */
  thumbs?: ReactNode[];
  children: ReactNode;
};

/**
 * A viewpoint's argument, or a data collection's charts, one at a time: its
 * section headings listed down the side, or its charts in miniature across the
 * top, and the open step beneath or beside them.
 *
 * Like the home page carousel, every step is server-rendered into a
 * scroll-snapped strip, so without JavaScript each is still reachable by
 * scrolling. Script adds the clickable outline or miniatures and arrow keys,
 * and, where the outline is hidden on a narrow screen, previous/next buttons.
 * The outline is the argument in brief: read down it, the headings add up to
 * the viewpoint's title.
 */
export function Walkthrough({ name, headings, noun, endLabel, thumbs, children }: WalkthroughProps) {
  const steps = Children.toArray(children);
  const { strip, index, announced, enhanced, go, onKeyDown, onScroll } = useCarousel(steps.length);
  const last = index === steps.length - 1;
  const tabs = useRef<HTMLOListElement>(null);

  // How far the miniatures can still scroll each way. Arrows appear only when
  // they do not all fit, and stop at the ends.
  const [tabsRoom, setTabsRoom] = useState({ before: false, after: false });
  const measureTabs = useCallback(() => {
    const row = tabs.current;
    if (!row) return;
    const before = row.scrollLeft > 1;
    const after = row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
    setTabsRoom(room => (room.before === before && room.after === after ? room : { before, after }));
  }, []);

  // Opened from a thumbnail on the closed row: start on that step.
  const request = useStepRequest();
  useEffect(() => {
    if (request) go(request.step, true);
  }, [request, go]);

  useEffect(() => {
    const row = tabs.current;
    if (!row) return;
    const observer = new ResizeObserver(measureTabs);
    observer.observe(row);
    return () => observer.disconnect();
  }, [measureTabs]);

  /** Bring the next miniatures into view, a whole line of them at a time. The selection stays. */
  const pageTabs = (direction: 1 | -1) => {
    const row = tabs.current;
    if (!row) return;
    const [first, second] = row.children;
    const stride = second instanceof HTMLElement && first instanceof HTMLElement ? second.offsetLeft - first.offsetLeft : row.clientWidth;
    row.scrollBy({
      left: direction * Math.max(1, Math.floor(row.clientWidth / stride)) * stride,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  // Centre the current miniature. Scrolled by hand because scrollIntoView
  // would also move the page.
  useEffect(() => {
    const row = tabs.current;
    const current = row?.children[index];
    if (!row || !current) return;
    const box = current.getBoundingClientRect();
    row.scrollTo({
      left: row.scrollLeft + box.left - row.getBoundingClientRect().left - (row.clientWidth - box.width) / 2,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [index]);

  return (
    <div className="sv-walk" data-layout={thumbs ? 'strip' : undefined} role="region" aria-roledescription="carousel" aria-label={`${name}, one ${noun.toLowerCase()} at a time`}>
      {thumbs ? (
        <div className="sv-walk__tabbar">
          {enhanced && (tabsRoom.before || tabsRoom.after) && <button type="button" className="sv-carousel__step sv-walk__tab-arrow" aria-label={`Show earlier ${noun.toLowerCase()}s`} disabled={!tabsRoom.before} onClick={() => pageTabs(-1)}>‹</button>}
          <ol className="sv-walk__tabs" ref={tabs} onScroll={measureTabs}>
            {headings.map((heading, i) => (
              <li key={i}>
                <button type="button" className="sv-walk__tab" aria-current={i === index ? 'step' : undefined} disabled={!enhanced} onClick={() => go(i)}>
                  <span className="sv-row__thumb">{thumbs[i]}</span>
                  <span className="sv-walk__tab-label">{heading}</span>
                </button>
              </li>
            ))}
          </ol>
          {enhanced && (tabsRoom.before || tabsRoom.after) && <button type="button" className="sv-carousel__step sv-walk__tab-arrow" aria-label={`Show later ${noun.toLowerCase()}s`} disabled={!tabsRoom.after} onClick={() => pageTabs(1)}>›</button>}
        </div>
      ) : (
        <ol className="sv-walk__outline">
          {headings.map((heading, i) => (
            <li key={i}>
              <button type="button" className="sv-walk__outline-step" aria-current={i === index ? 'step' : undefined} disabled={!enhanced} onClick={() => go(i)}>
                <span className="sv-walk__number" aria-hidden="true">{i + 1}</span>
                <span>{heading}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="sv-walk__stage">
        <div
          className="sv-walk__strip"
          ref={strip}
          tabIndex={0}
          role="group"
          aria-label={`${name}. Use the left and right arrow keys to move between ${noun.toLowerCase()}s.`}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
        >
          {steps.map((step, i) => (
            <div className="sv-walk__slide" key={i} role="group" aria-roledescription="slide" aria-label={`${noun} ${i + 1} of ${steps.length}: ${headings[i]}`}>
              {step}
            </div>
          ))}
        </div>
        {enhanced && steps.length > 1 && <p className="sv-visually-hidden" aria-live="polite">{noun} {announced + 1} of {steps.length}: {headings[announced]}</p>}
        {/* Only where neither outline nor miniatures show (globals.css): they would repeat them. */}
        {enhanced && steps.length > 1 && (
          <div className="sv-walk__controls">
            <button type="button" className="sv-carousel__step" aria-label={`Previous ${noun.toLowerCase()}`} disabled={index === 0} onClick={() => go(index - 1)}>‹</button>
            <p className="sv-carousel__count" aria-hidden="true">{noun} {index + 1} of {steps.length}</p>
            <button type="button" className="sv-walk__next" disabled={last} onClick={() => go(index + 1)}>
              {last ? endLabel : <>Next: {headings[index + 1]} <span aria-hidden="true">›</span></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
