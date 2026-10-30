import type { ReactNode } from 'react';

type ChartAboutProps = { description: string; children?: ReactNode };

/**
 * A data panel chart's description, cut to one line so it leaves the graph its
 * room, with "More" at the end of the line. Opened, it shows the whole
 * description and what "About this data" says everywhere else.
 */
export function ChartAbout({ description, children }: ChartAboutProps) {
  return (
    <details className="sv-chart__about">
      <summary>
        <span className="sv-chart__about-text">{description}</span>
        <span className="sv-chart__about-toggle" aria-hidden="true" />
      </summary>
      {children}
    </details>
  );
}
