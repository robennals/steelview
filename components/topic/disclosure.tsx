import type { ReactNode } from 'react';

/**
 * Every expandable item on the page. Native <details> so expansion works
 * without JavaScript and gets keyboard, screen-reader, find-in-page and print
 * behaviour for free; the anchor id is on the <details> element so
 * components/topic/hash-sync.tsx can open it by id.
 */
export function Disclosure({
  anchor,
  summary,
  children,
}: {
  anchor: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <details id={anchor} className="border-b">
      <summary className="cursor-pointer py-3">{summary}</summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}
