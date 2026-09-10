import Link from 'next/link';
import type { Fact } from '@/lib/content/types';
import { factPath } from '@/lib/content/types';

/**
 * A labelled row of links to facts elsewhere on the page. Renders nothing when
 * empty.
 *
 * The `relation` decides the frame, and the three frames are deliberately
 * unalike: a viewpoint's three fact groups say three different things, and a
 * reader must be able to tell which is which without reading the labels.
 * `accepts` is the page's evidence that it is steelmanning rather than
 * advocating, so it is framed and raised — never a footnote.
 */
type ChipRelation = 'builds' | 'accepts' | 'aside';

export function ItemChips({
  slug,
  label,
  facts,
  relation,
}: {
  slug: string;
  label: string;
  facts: Fact[];
  relation: ChipRelation;
}) {
  if (facts.length === 0) return null;
  return (
    <div className={`sv-chips sv-chips--${relation}`}>
      <h4 className="sv-chips__label">{label}</h4>
      <ul className="sv-chips__list">
        {facts.map((fact) => (
          <li key={fact.id}>
            <Link href={factPath(slug, fact.id)}>{fact.claim}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
