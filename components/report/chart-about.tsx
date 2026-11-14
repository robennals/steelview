'use client';

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { useChartStep } from '@/components/topic/observation-bar';
import { Prose } from '@/components/topic/prose';
import { usePanelSources } from '@/components/topic/sources-slot';

type ChartAboutProps = {
  /** The chart's subtitle, which is the line shown; the description then waits behind More. */
  subtitle?: string;
  description?: ReactNode;
  /** Exactly what the numbers count ("US service members killed"), which the chart has no line for. */
  measure?: string;
  children?: ReactNode;
};

/**
 * A data panel chart's one line under its title: the subtitle, or without one
 * the description cut to a line, with "More" at the end. More opens a panel
 * floating over the chart, so nothing below it moves: the description, a list
 * of the chart's observations and Subtleties that goes straight to any of them,
 * the chart's further text, what "About this data" says everywhere else, and
 * the chart's sources, so the panel needs no sources line of its own. It
 * closes on More again, Escape, or a click outside it; a link to one of its
 * sources opens it.
 *
 * The list is of links, so that without JavaScript it still leads to each.
 */
export function ChartAbout({ subtitle, description, measure, children }: ChartAboutProps) {
  const step = useChartStep();
  const details = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const observations = step?.observations ?? [];
  const more = step?.more;
  const sources = usePanelSources();

  useEffect(() => {
    if (!open) return;
    const close = () => { if (details.current) details.current.open = false; };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.current?.contains(event.target)) close();
    };
    // Heard first, and stopped there: in a sheet, Escape should close only this panel, not the sheet too.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      close();
      details.current?.querySelector('summary')?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  // Also handled here, on the panel itself, for an Escape pressed before the
  // listener above is in place, just after More was opened.
  const closeOnEscape = (event: ReactKeyboardEvent<HTMLDetailsElement>) => {
    if (event.key !== 'Escape' || !event.currentTarget.open) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.open = false;
    event.currentTarget.querySelector('summary')?.focus();
  };

  if (!description && !measure && !children && !more && !sources && observations.length === 0) {
    return subtitle ? <p className="sv-chart__subtitle">{subtitle}</p> : null;
  }

  const choose = (event: MouseEvent, index: number) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    step?.show(index);
    if (details.current) details.current.open = false;
  };

  return (
    <details className="sv-chart__about" ref={details} onToggle={event => setOpen(event.currentTarget.open)} onKeyDown={closeOnEscape}>
      <summary>
        <span className="sv-chart__about-text">{subtitle ?? description ?? 'About this chart'}</span>
        <span className="sv-chart__about-toggle" aria-hidden="true" />
      </summary>
      <div className="sv-chart__about-pop">
      {description && <p className="sv-chart__about-desc">{description}</p>}
      {measure && <p className="sv-chart__about-measure"><span className="sv-chart__about-label">Measured: </span>{measure}</p>}
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
      {sources}
      </div>
    </details>
  );
}
