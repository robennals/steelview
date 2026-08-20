import Link from 'next/link';
import type { Fact } from '@/lib/content/types';
import { factPath } from '@/lib/content/types';
import { StatusBadge } from './status-badge';

/**
 * The Facts list: headline claims and nothing else.
 *
 * A row is the claim and its status — full stop. Supporting facts, bodies,
 * charts and sources all belong to the fact's own reading, which is the
 * modal or the standalone page, not this list. Naming a supporting fact's
 * claim here used to seem like a shortcut for the reader, but it put
 * unclickable text under a row that looked, and was described in its
 * accessible text, like part of a single control — a reader (or a crawler)
 * could not tell the two apart. The nesting relationship — which fact is
 * evidence for which claim — is still visible: it is on the parent fact's
 * page and in the modal, right above the supporting fact it belongs to.
 *
 * The whole row is the link, with JavaScript intercepted into the modal over
 * this page and, without it, an ordinary navigation to the fact's page.
 */
export function FactList({ slug, facts }: { slug: string; facts: Fact[] }) {
  return (
    <ol className="sv-factlist">
      {facts.map((fact) => (
        <li key={fact.id} className="sv-item sv-fact" data-status={fact.status}>
          <Link className="sv-item__summary sv-factrow" href={factPath(slug, fact.id)}>
            <span className="sv-item__claim">{fact.claim}</span> <StatusBadge status={fact.status} />
          </Link>
        </li>
      ))}
    </ol>
  );
}
