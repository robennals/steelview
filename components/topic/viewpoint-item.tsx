import type { Fact, Principle, Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';
import { ItemChips } from './item-chips';

function resolve(ids: string[], byId: Map<string, Fact>): Fact[] {
  // Ids are guaranteed to resolve — validateTopic rejects unknown references —
  // but filter defensively so a future loader change can never crash the page.
  return ids.map((id) => byId.get(id)).filter((f): f is Fact => f !== undefined);
}

/**
 * Every viewpoint is styled identically. No ordinal, no accent, no "primary"
 * treatment: the moment one side looks more important than another, the page
 * stops being a place a partisan will trust.
 */
export function ViewpointItem({
  viewpoint,
  bodyHtml,
  factsById,
  principlesById,
}: {
  viewpoint: Viewpoint;
  bodyHtml: string;
  factsById: Map<string, Fact>;
  principlesById: Map<string, Principle>;
}) {
  return (
    <Disclosure
      anchor={anchorFor('viewpoint', viewpoint.id)}
      className="sv-viewpoint"
      summary={
        <>
          <span className="sv-item__claim">{viewpoint.name}</span>{' '}
          <span className="sv-item__note">{viewpoint.summary}</span>
        </>
      }
    >
      <Prose html={bodyHtml} />
      <ItemChips
        relation="builds"
        label="Builds on"
        facts={resolve(viewpoint.citesFacts, factsById)}
      />
      <ItemChips
        relation="accepts"
        label="Accepts, though it cuts against this view"
        facts={resolve(viewpoint.acknowledges, factsById)}
      />
      <ItemChips
        relation="aside"
        label="Sets aside"
        facts={resolve(viewpoint.setsAside, factsById)}
      />
      {viewpoint.principles.length > 0 && (
        <div className="sv-tags">
          <h4 className="sv-chips__label">Rests on</h4>
          <ul className="sv-tags__list">
            {viewpoint.principles.map((id) => (
              <li key={id}>
                <a href={`#${anchorFor('principle', id)}`}>{principlesById.get(id)?.name ?? id}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Disclosure>
  );
}
