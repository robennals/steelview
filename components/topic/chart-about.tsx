import type { ReactNode } from 'react';

type ChartAboutProps = { description: string; children?: ReactNode };

/**
 * A data panel chart's description, cut to one line so it leaves the graph its
 * room. Clicked, it opens to the whole description and what "About this data"
 * says everywhere else.
 */
export function ChartAbout({ description, children }: ChartAboutProps) {
  return (
    <details className="sv-chart__about">
      <summary>{description}</summary>
      {children}
    </details>
  );
}
