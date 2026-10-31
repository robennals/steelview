import type { ReactNode } from 'react';
import { ObservationBar } from '@/components/topic/observation-bar';
import { PanelSources } from '@/components/topic/sources-slot';
import { ChartAbout } from './chart-about';
import type { FigurePreview, SourceCredit } from './types';

/**
 * The frame every report component sits in: a heading that says what the
 * reader is looking at, a sentence on what it shows, in a data panel the
 * observation being shown, the component itself, the source it rests on, and
 * an optional "About this data" note.
 *
 * Same markup and classes as the topic charts (`sv-chart`), so a new
 * component placed between two existing charts is indistinguishable from
 * them in rhythm and type. The source line is not optional in spirit — a
 * figure without one is an assertion — but it is optional in the type so a
 * component can be shown on its own in a story.
 */
export function ReportFigure({
  id,
  title,
  description,
  sources,
  note,
  footer,
  headingLevel = 2,
  className,
  preview,
  panel,
  children,
}: {
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  /** Method notes, caveats, coverage: shown collapsed under "About this data". */
  note?: ReactNode;
  /** Rendered after the source line and before "About this data": a figure's Observations. */
  footer?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
  /** Draw only the linked title and the graph (see `FigurePreview`). */
  preview?: FigurePreview;
  /** Drawn in a data panel: filling it, with its description and note folded into one line. */
  panel?: boolean;
  children?: ReactNode;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const classes = ['sv-chart', 'sv-report', className].filter(Boolean).join(' ');
  if (preview) {
    // A slide sits under its topic's heading, so its title is one level down.
    return (
      <figure className={classes} id={id} data-preview>
        {title && (
          <figcaption className="sv-chart__caption">
            <h3 className="sv-graph-heading">{preview.href ? <a href={preview.href}>{title}</a> : title}</h3>
          </figcaption>
        )}
        {children && <div className="sv-chart__preview">{children}</div>}
      </figure>
    );
  }
  const noteBody = typeof note === 'string' ? <p>{note}</p> : note;
  if (panel) {
    // The step around it carries the Observations, which the bar shows one at a time.
    return (
      <figure className={classes} id={id} data-panel-chart>
        <figcaption className="sv-chart__caption">
          {title && <Heading className="sv-graph-heading">{title}</Heading>}
          <ChartAbout description={description}>{noteBody}</ChartAbout>
        </figcaption>
        <ObservationBar />
        {children}
        <PanelSources />
      </figure>
    );
  }
  return (
    <figure className={classes} id={id}>
      {(title || description) && (
        <figcaption className="sv-chart__caption">
          {title && <Heading className="sv-graph-heading">{title}</Heading>}
          {description && <p className="sv-chart__desc">{description}</p>}
        </figcaption>
      )}
      <ObservationBar />
      {children}
      {sources && sources.length > 0 && <SourceLine sources={sources} />}
      {footer}
      {note && (
        <details className="sv-chart__methodology">
          <summary>About this data</summary>
          {noteBody}
        </details>
      )}
    </figure>
  );
}

/**
 * An item's own sources, set inline after the item: "NCSL [2]; EAC [5]". Used
 * where one row, estimate or caveat rests on a different source from the
 * rest of its figure, so the reader can check that item without guessing.
 */
export function SourceCredits({ sources }: { sources: SourceCredit[] }) {
  if (sources.length === 0) return null;
  return (
    <span className="sv-item-credit">
      {sources.map((source, i) => {
        const text = source.number ? `${source.label} [${source.number}]` : source.label;
        return (
          <span key={`${source.label}-${i}`}>
            {i > 0 && '; '}
            {source.href ? <a href={source.href}>{text}</a> : text}
          </span>
        );
      })}
    </span>
  );
}

/** "Source: ONS [3]; Home Office [4]" — each one a link to its quoted reference. */
export function SourceLine({ sources, label = 'Source' }: { sources: SourceCredit[]; label?: string }) {
  return (
    <p className="sv-chart__credit">
      {sources.length > 1 ? `${label}s` : label}:{' '}
      {sources.map((source, i) => {
        const text = source.number ? `${source.label} [${source.number}]` : source.label;
        return (
          <span key={`${source.label}-${i}`}>
            {i > 0 && '; '}
            {source.href ? <a href={source.href}>{text}</a> : text}
          </span>
        );
      })}
    </p>
  );
}
