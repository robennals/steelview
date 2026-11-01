import type { ReactNode } from 'react';

/**
 * A chart row with more to say than its one-line title: the whole row is the
 * `<summary>` of a native `<details>`, so it opens by click, by keyboard and
 * with no JavaScript, and the extra words sit under it at full width. Only the
 * body may hold links, since a link nested in a summary cannot be reached
 * reliably.
 *
 * The row keeps its own layout class on the summary, so it lines up with
 * neighbouring rows that have no detail. The marker is drawn by CSS on the
 * row's label, in the gap beside its track, so it shifts neither.
 */
export function DetailRow({ rowClass, highlight, summary, children }: {
  /** The layout class of the row, the same one a row with no detail carries. */
  rowClass: string;
  highlight?: boolean;
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <details className="sv-row-detail">
      <summary className={rowClass} data-highlight={highlight || undefined}>{summary}</summary>
      <div className="sv-row-detail__body">{children}</div>
    </details>
  );
}

/** Says once, above the rows, how to read a row's detail. For a chart with at least one `DetailRow`. */
export function RowDetailHint() {
  return <p className="sv-row-detail__hint">Select a row for its details</p>;
}
