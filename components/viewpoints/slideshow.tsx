'use client';

import { useRef, type ReactNode } from 'react';
import { useCarousel } from '@/components/home/use-carousel';

export type SlideOutline = {
  /** The slide's name in the outline and in its count. */
  label: string;
  /** A chart slide is listed as the evidence under the text slide before it. */
  chart: boolean;
};

type SlideshowProps = {
  name: string;
  outline: SlideOutline[];
  /** One element per slide, in the outline's order. */
  children: ReactNode[];
};

/**
 * A viewpoint, one slide at a time: a slide of text, or a chart with what it
 * shows written above it. On a phone that is all there is, with a progress bar
 * above and previous and next below, and a swipe moves between slides. On a
 * wide screen the slides are also listed down the left.
 *
 * Every slide is server-rendered into a scroll-snapped strip, so without
 * JavaScript each is still reachable by scrolling.
 */
export function Slideshow({ name, outline, children }: SlideshowProps) {
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
        {outline.map((slide, i) => (
          <li key={i} data-chart={slide.chart || undefined}>
            <button type="button" className="sv-deck__outline-item" aria-current={i === index ? 'step' : undefined} disabled={!enhanced} onClick={() => go(i)}>
              {slide.chart ? <span className="sv-deck__chart-glyph" aria-hidden="true" /> : <span className="sv-deck__number" aria-hidden="true">{outline.slice(0, i + 1).filter(s => !s.chart).length}</span>}
              <span>{slide.chart && <span className="sv-visually-hidden">Chart: </span>}{slide.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="sv-deck__stage" ref={stage}>
        {enhanced && (
          <div className="sv-deck__progress" aria-hidden="true">
            {outline.map((_, i) => <span key={i} data-done={i <= index || undefined} />)}
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
            <div className="sv-deck__slide" key={i} role="group" aria-roledescription="slide" aria-label={`Slide ${i + 1} of ${count}: ${outline[i].label}`}>
              {slide}
            </div>
          ))}
        </div>
        {enhanced && <p className="sv-visually-hidden" aria-live="polite">Slide {announced + 1} of {count}: {outline[announced].label}</p>}
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
