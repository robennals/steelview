import type { ReactNode } from 'react';

/**
 * Every expandable item on the page. Native <details> so expansion works
 * without JavaScript and gets keyboard, screen-reader, find-in-page and print
 * behaviour for free; the anchor id is on the <details> element so
 * components/topic/hash-sync.tsx can open it by id.
 *
 * The collapsed row is the primary reading mode: a reader must be able to skim
 * every claim on the page without opening anything, so the summary carries the
 * whole headline of the item and the summary target is at least 44px tall.
 */
export function Disclosure({
  anchor,
  summary,
  children,
  className,
  status,
}: {
  anchor: string;
  summary: ReactNode;
  children: ReactNode;
  /** Extra class on the <details>, for per-kind row treatment. */
  className?: string;
  /** Fact status, which drives the left-edge rule style. */
  status?: string;
}) {
  return (
    <details
      id={anchor}
      data-status={status}
      className={className ? `sv-item ${className}` : 'sv-item'}
    >
      <summary className="sv-item__summary">{summary}</summary>
      <div className="sv-item__body">{children}</div>
    </details>
  );
}
