import Link from 'next/link';
import type { Fact } from '@/lib/content/types';
import { factPath } from '@/lib/content/types';
import { StatusBadge } from './status-badge';

/**
 * The link that is a fact row: its claim, then its status.
 *
 * The whole row is the link. Every fact is a real page now, so the row does
 * not need to be a control that reveals something — it needs to be what it
 * always was semantically, a reference to a fact, and the honest markup for
 * that is an anchor. With JavaScript it is intercepted into the modal over
 * this page; without it, it loads the fact's page. Either way the reader gets
 * the same fact, and a crawler gets a link it can follow.
 */
function FactRowLink({ slug, fact }: { slug: string; fact: Fact }) {
  return (
    <Link className="sv-item__summary sv-factrow" href={factPath(slug, fact.id)}>
      <span className="sv-item__claim">{fact.claim}</span> <StatusBadge status={fact.status} />
    </Link>
  );
}

/**
 * The Facts list: headline claims, each with the facts that are evidence for
 * it named underneath.
 *
 * The nesting is kept even though every fact now has a page of its own,
 * because the shape of the argument — which detail is evidence for which claim
 * — is itself a fact about the topic, and a reader should be able to see it
 * without a round trip. What no longer happens here is the *reading*: a fact's
 * context, chart and sources are on the fact's page, or in the modal over this
 * one, not expanded inside the list.
 */
export function FactList({
  slug,
  facts,
  supportingByParent,
}: {
  slug: string;
  facts: Fact[];
  supportingByParent: Map<string, Fact[]>;
}) {
  return (
    <ol className="sv-factlist">
      {facts.map((fact) => {
        const children = supportingByParent.get(fact.id) ?? [];
        return (
          <li key={fact.id} className="sv-item sv-fact" data-status={fact.status}>
            <FactRowLink slug={slug} fact={fact} />
            {children.length > 0 && (
              <div className="sv-factlist__children">
                <p className="sv-factlist__childlabel">
                  Supporting {children.length === 1 ? 'fact' : 'facts'}
                </p>
                <ol className="sv-factlist__childlist">
                  {children.map((child) => (
                    <li
                      key={child.id}
                      className="sv-item sv-subfact"
                      data-status={child.status}
                    >
                      <FactRowLink slug={slug} fact={child} />
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
