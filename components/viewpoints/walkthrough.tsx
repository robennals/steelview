'use client';

import { Children, type ReactNode } from 'react';
import { useCarousel } from '@/components/home/use-carousel';

/**
 * A viewpoint's argument, one step at a time: its section headings listed down
 * the side, and the open step's prose and chart beside them.
 *
 * Like the home page carousel, every step is server-rendered into a
 * scroll-snapped strip, so without JavaScript each is still reachable by
 * scrolling. Script adds the clickable outline, previous/next buttons and
 * arrow keys. The outline is the argument in brief: read down it, the headings
 * add up to the viewpoint's title.
 */
export function Walkthrough({ name, headings, children }: { name: string; headings: string[]; children: ReactNode }) {
  const steps = Children.toArray(children);
  const { strip, index, announced, enhanced, go, onKeyDown, onScroll } = useCarousel(steps.length);
  const last = index === steps.length - 1;

  return (
    <div className="sv-walk" role="region" aria-roledescription="carousel" aria-label={`${name}: the argument, step by step`}>
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
      <div className="sv-walk__stage">
        <div
          className="sv-walk__strip"
          ref={strip}
          tabIndex={0}
          role="group"
          aria-label={`${name} steps. Use the left and right arrow keys to move between them.`}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
        >
          {steps.map((step, i) => (
            <div className="sv-walk__slide" key={i} role="group" aria-roledescription="slide" aria-label={`Step ${i + 1} of ${steps.length}: ${headings[i]}`}>
              {step}
            </div>
          ))}
        </div>
        {enhanced && steps.length > 1 && (
          <div className="sv-walk__controls">
            <button type="button" className="sv-carousel__step" aria-label="Previous step" disabled={index === 0} onClick={() => go(index - 1)}>‹</button>
            <p className="sv-carousel__count" aria-hidden="true">Step {index + 1} of {steps.length}</p>
            <p className="sv-visually-hidden" aria-live="polite">Step {announced + 1} of {steps.length}: {headings[announced]}</p>
            <button type="button" className="sv-walk__next" disabled={last} onClick={() => go(index + 1)}>
              {last ? 'End of the argument' : <>Next: {headings[index + 1]} <span aria-hidden="true">›</span></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
