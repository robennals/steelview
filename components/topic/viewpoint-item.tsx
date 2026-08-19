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
      summary={
        <>
          <span>{viewpoint.name}</span> <span>{viewpoint.summary}</span>
        </>
      }
    >
      <Prose html={bodyHtml} />
      <ItemChips label="Builds on" facts={resolve(viewpoint.citesFacts, factsById)} />
      <ItemChips label="Accepts, though it cuts against this view" facts={resolve(viewpoint.acknowledges, factsById)} />
      <ItemChips label="Sets aside" facts={resolve(viewpoint.setsAside, factsById)} />
      {viewpoint.principles.length > 0 && (
        <div>
          <h4>Rests on</h4>
          <ul>
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
