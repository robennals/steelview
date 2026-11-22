'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useStepRequest } from '@/components/home/topic-accordion';
import { useCarousel } from '@/components/home/use-carousel';
import { CommentGlyph } from '@/components/feedback/comment-glyph';

type SlideshowProps = {
  name: string;
  /** Each card's point, for the outline and the count. */
  headings: string[];
  /** One card per heading, in order. */
  children: ReactNode[];
  /**
   * A slide after the argument and no part of it, where readers' suggestions
   * are: set apart from the points, with a speech bubble, and never counted as one.
   */
  afterword?: { heading: string; slide: ReactNode };
};

/**
 * A viewpoint, one card at a time, each card one point of the argument. On a
 * phone that is all there is, with a progress bar above and Back and Next
 * below, and a swipe moves between cards. On a wide screen the points are also
 * listed down the left. An afterword is reached the same ways, but sits
 * outside both lists of points and outside their count.
 *
 * Every slide is server-rendered into a scroll-snapped strip, so without
 * JavaScript each is still reachable by scrolling.
 */
export function Slideshow({ name, headings, children, afterword }: SlideshowProps) {
  const points = children.length;
  const slides = afterword ? [...children, afterword.slide] : children;
  const count = slides.length;
  const { strip, index, announced, enhanced, go, onKeyDown, onScroll } = useCarousel(count);
  const last = index === count - 1;
  const inAfterword = index >= points;
  const label = (i: number) => (afterword && i === points ? `${afterword.heading}, after the argument` : `Slide ${i + 1} of ${points}: ${headings[i]}`);
  const stage = useRef<HTMLDivElement>(null);

  // Opened from a thumbnail on the closed row: start on that card.
  const request = useStepRequest();
  useEffect(() => {
    if (request) go(request.step, true);
  }, [request, go]);

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
      <div className="sv-deck__outline">
        <ol>
          {headings.map((heading, i) => (
            <li key={i}>
              <button type="button" className="sv-deck__outline-item" aria-current={i === index ? 'step' : undefined} disabled={!enhanced} onClick={() => go(i)}>
                <span className="sv-deck__number" aria-hidden="true">{i + 1}</span>
                <span>{heading}</span>
              </button>
            </li>
          ))}
        </ol>
        {afterword && (
          <div className="sv-deck__apart">
            <button type="button" className="sv-deck__afterword" aria-current={inAfterword || undefined} disabled={!enhanced} onClick={() => go(points)}>
              <CommentGlyph />
              <span>{afterword.heading}</span>
            </button>
          </div>
        )}
      </div>

      <div className="sv-deck__stage" ref={stage}>
        {enhanced && (
          // A numbered circle per point, the one showing filled; each goes to its point.
          <div className="sv-deck__points">
            <ol>
              {headings.map((heading, i) => (
                <li key={i}>
                  <button type="button" aria-label={`Point ${i + 1}: ${heading}`} aria-current={i === index ? 'step' : undefined} data-seen={i < index || undefined} onClick={() => step(i)}>
                    <span aria-hidden="true">{i + 1}</span>
                  </button>
                </li>
              ))}
            </ol>
            {afterword && (
              <div className="sv-deck__apart">
                <button type="button" className="sv-deck__afterword" aria-label={afterword.heading} aria-current={inAfterword || undefined} onClick={() => step(points)}>
                  <CommentGlyph />
                </button>
              </div>
            )}
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
          {slides.map((slide, i) => (
            <div className="sv-deck__slide" key={i} role="group" aria-roledescription="slide" aria-label={label(i)}>
              {slide}
            </div>
          ))}
        </div>
        {enhanced && <p className="sv-visually-hidden" aria-live="polite">{label(announced)}</p>}
        {enhanced && count > 1 && (
          <div className="sv-deck__controls">
            <button type="button" className="sv-deck__back" disabled={index === 0} onClick={() => step(index - 1)}>
              <span aria-hidden="true">‹</span> Back
            </button>
            <p className="sv-deck__count" aria-hidden="true">{!inAfterword && `${index + 1} / ${points}`}</p>
            {/* From the conclusion, the way on is quieter and says where it leads: the argument has ended. */}
            <button type="button" className="sv-deck__next" data-leaves-argument={(afterword && index >= points - 1) || undefined} disabled={last} onClick={() => step(index + 1)}>
              {afterword && index >= points - 1 ? <>Suggestions <span aria-hidden="true">›</span></> : last ? 'The end' : <>Next <span aria-hidden="true">›</span></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
