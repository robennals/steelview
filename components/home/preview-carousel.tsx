'use client';

import { Children, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';

const noSubscription = () => () => {};

/**
 * A topic's preview charts, one at a time.
 *
 * Every slide is server-rendered into a horizontally scroll-snapped strip, so
 * without JavaScript each chart is still reachable by scrolling. Script adds
 * the previous/next buttons, one dot per chart, a "2 / 4 · label" count and
 * arrow keys. Every slide has the same fixed height (globals.css), so the
 * charts are all one size and nothing moves when the chart changes.
 */
export function PreviewCarousel({ name, labels, children }: { name: string; labels: string[]; children: ReactNode }) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // False in the server render and true once hydrated: the controls need script.
  const enhanced = useSyncExternalStore(noSubscription, () => true, () => false);
  const slides = Children.toArray(children);

  const go = (to: number) => {
    const el = strip.current;
    if (!el) return;
    const next = (to + slides.length) % slides.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setIndex(next);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
  };

  return (
    <div className="sv-carousel" role="region" aria-roledescription="carousel" aria-label={`${name}: key charts`}>
      <div
        className="sv-carousel__strip"
        ref={strip}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onScroll={event => {
          const el = event.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {slides.map((slide, i) => (
          <div className="sv-carousel__slide" key={labels[i]} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}: ${labels[i]}`}>
            {slide}
          </div>
        ))}
      </div>
      {enhanced && slides.length > 1 && (
        <div className="sv-carousel__controls">
          <button type="button" className="sv-carousel__step" aria-label="Previous chart" onClick={() => go(index - 1)}>‹</button>
          <div className="sv-carousel__dots">
            {labels.map((label, i) => (
              <button type="button" key={label} className="sv-carousel__dot" aria-label={`Chart ${i + 1}: ${label}`} aria-current={i === index || undefined} onClick={() => go(i)} />
            ))}
          </div>
          <p className="sv-carousel__count" aria-live="polite">{index + 1} / {slides.length} · {labels[index]}</p>
          <button type="button" className="sv-carousel__step" aria-label="Next chart" onClick={() => go(index + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
