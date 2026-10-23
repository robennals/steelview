import type { Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';

/**
 * Every viewpoint is styled identically. No ordinal, no accent, no "primary"
 * treatment: the moment one side looks more important than another, the page
 * stops being a place a partisan will trust.
 */
export function ViewpointItem({
  viewpoint,
  bodyHtml,
}: {
  viewpoint: Viewpoint;
  bodyHtml: string;
}) {
  return (
    <Disclosure
      anchor={anchorFor('viewpoint', viewpoint.id)}
      className="sv-viewpoint"
      summary={<span className="sv-item__claim">{viewpoint.name}</span>}
    >
      <Prose html={bodyHtml} />
    </Disclosure>
  );
}
