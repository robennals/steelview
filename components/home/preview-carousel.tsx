'use client';

import { Children, type ReactNode } from 'react';
import { useCarousel } from './use-carousel';

/**
 * A topic's preview charts, one at a time.
 *
 * Every slide is server-rendered into a horizontally scroll-snapped strip, so
 * without JavaScript each chart is still reachable by scrolling. Script adds
 * the previous/next buttons, one dot per chart, a "2 / 4" count and
 * arrow keys. Every slide has one fixed height (globals.css), so the charts
 * are all one size and nothing moves when the chart changes.
 */
export function PreviewCarousel({ name, labels, children }: { name: string; labels: string[]; children: ReactNode }) {
  const slides = Children.toArray(children);
  const { strip, index, announced, enhanced, go, onKeyDown, onScroll } = useCarousel(slides.length);

  return (
    <div className="sv-carousel" role="region" aria-roledescription="carousel" aria-label={`${name}: key charts`}>
      <div
        className="sv-carousel__strip"
        ref={strip}
        tabIndex={0}
        role="group"
        aria-label={`${name} charts. Use the left and right arrow keys to move between them.`}
        onKeyDown={onKeyDown}
        onScroll={onScroll}
      >
        {slides.map((slide, i) => (
          <div className="sv-carousel__slide" key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}: ${labels[i]}`}>
            {slide}
          </div>
        ))}
      </div>
      {enhanced && slides.length > 1 && (
        <div className="sv-carousel__controls">
          <button type="button" className="sv-carousel__step" aria-label="Previous chart" onClick={() => go(index - 1)}>‹</button>
          <div className="sv-carousel__dots">
            {labels.map((label, i) => (
              <button type="button" key={i} className="sv-carousel__dot" aria-label={`Chart ${i + 1}: ${label}`} aria-current={i === index || undefined} onClick={() => go(i)} />
            ))}
          </div>
          <p className="sv-carousel__count" aria-hidden="true">{index + 1} / {slides.length}</p>
          <p className="sv-visually-hidden" aria-live="polite">Chart {announced + 1} of {slides.length}: {labels[announced]}</p>
          <button type="button" className="sv-carousel__step" aria-label="Next chart" onClick={() => go(index + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
