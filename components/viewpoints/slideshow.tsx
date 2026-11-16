'use client';

import { useRef, type ReactNode } from 'react';
import { useCarousel } from '@/components/home/use-carousel';

type SlideshowProps = {
  name: string;
  /** Each card's point, for the outline and the count. */
  headings: string[];
  /** One card per heading, in order. */
  children: ReactNode[];
};

/**
 * A viewpoint, one card at a time, each card one point of the argument. On a
 * phone that is all there is, with a progress bar above and Back and Next
 * below, and a swipe moves between cards. On a wide screen the points are also
 * listed down the left.
 *
 * Every slide is server-rendered into a scroll-snapped strip, so without
 * JavaScript each is still reachable by scrolling.
 */
export function Slideshow({ name, headings, children }: SlideshowProps) {
  const count = children.length;
  const { strip, index, announced, enhanced, go, onKeyDown, onScroll } = useCarousel(count);
  const last = index === count - 1;
  const stage = useRef<HTMLDivElement>(null);

  /**
   * Move to a slide, and if the reader has scrolled down past the top of the
   * slideshow, bring its top back on screen: the next slide starts there, and
   * may be shorter than the one they were reading.
   */
  const step = (to: number) => {
    go(to);
    const el = stage.current;
    if (!el || el.getBoundingClientRect().top >= parseFloat(getComputedStyle(el).scrollMarginTop)) return;
    el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className="sv-deck" role="region" aria-roledescription="carousel" aria-label={`${name}, one slide at a time`}>
      <ol className="sv-deck__outline">
        {headings.map((heading, i) => (
          <li key={i}>
            <button type="button" className="sv-deck__outline-item" aria-current={i === index ? 'step' : undefined} disabled={!enhanced} onClick={() => go(i)}>
              <span className="sv-deck__number" aria-hidden="true">{i + 1}</span>
              <span>{heading}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="sv-deck__stage" ref={stage}>
        {enhanced && (
          <div className="sv-deck__progress" aria-hidden="true">
            {headings.map((_, i) => <span key={i} data-done={i <= index || undefined} />)}
          </div>
        )}
        <div
          className="sv-deck__strip"
          ref={strip}
          tabIndex={0}
          role="group"
          aria-label={`${name}. Use the left and right arrow keys to move between slides.`}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
        >
          {children.map((slide, i) => (
            <div className="sv-deck__slide" key={i} role="group" aria-roledescription="slide" aria-label={`Slide ${i + 1} of ${count}: ${headings[i]}`}>
              {slide}
            </div>
          ))}
        </div>
        {enhanced && <p className="sv-visually-hidden" aria-live="polite">Slide {announced + 1} of {count}: {headings[announced]}</p>}
        {enhanced && count > 1 && (
          <div className="sv-deck__controls">
            <button type="button" className="sv-deck__back" disabled={index === 0} onClick={() => step(index - 1)}>
              <span aria-hidden="true">‹</span> Back
            </button>
            <p className="sv-deck__count" aria-hidden="true">{index + 1} / {count}</p>
            <button type="button" className="sv-deck__next" disabled={last} onClick={() => step(index + 1)}>
              {last ? 'The end' : <>Next <span aria-hidden="true">›</span></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
