'use client';

import { useRef, type MouseEvent, type ReactNode } from 'react';
import { useChartStep } from '@/components/topic/observation-bar';
import { Prose } from '@/components/topic/prose';

type ChartAboutProps = { description?: ReactNode; children?: ReactNode };

/**
 * A data panel chart's description, cut to one line so it leaves the graph its
 * room, with "More" at the end of the line. Opened, it shows the whole
 * description, a list of the chart's observations and Subtleties that goes
 * straight to any of them, the chart's further text, and what "About this data"
 * says everywhere else.
 *
 * The list is of links, so that without JavaScript it still leads to each.
 */
export function ChartAbout({ description, children }: ChartAboutProps) {
  const step = useChartStep();
  const details = useRef<HTMLDetailsElement>(null);
  const observations = step?.observations ?? [];
  const more = step?.more;
  if (!description && !children && !more && observations.length === 0) return null;

  const choose = (event: MouseEvent, index: number) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    step?.show(index);
    if (details.current) details.current.open = false;
  };

  return (
    <details className="sv-chart__about" ref={details}>
      <summary>
        <span className="sv-chart__about-text">{description ?? 'About this chart'}</span>
        <span className="sv-chart__about-toggle" aria-hidden="true" />
      </summary>
      {observations.length > 0 && (
        <nav aria-label="On this chart">
          <p className="sv-chart__about-label">On this chart</p>
          <ol className="sv-chart__about-list">
            {observations.map((observation, i) => (
              <li key={observation.id}>
                <a href={observation.href} data-panel-link onClick={event => choose(event, i)}>
                  <span dangerouslySetInnerHTML={{ __html: observation.label }} />
                </a>
                {observation.subtlety && <span className="sv-chart__about-kind"> Subtlety</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {more && <Prose html={more} className="sv-chart__more" />}
      {children && <>
        <p className="sv-chart__about-label">About this data</p>
        {children}
      </>}
    </details>
  );
}
