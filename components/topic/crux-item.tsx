import type { Crux, Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';

const KIND_LABELS = {
  prediction: 'Different predictions',
  assumption: 'Different assumptions',
  tradeoff: 'Different trade-offs',
  priority: 'Different priorities',
} as const;

/**
 * The positions are laid out as columns of equal width and identical styling,
 * side by side on a wide screen and stacked on a narrow one, so the
 * disagreement is legible at a glance and neither side is given the floor.
 *
 * Four or more positions no longer fit one row at a comfortably readable
 * width, so `sv-positions--wrap` (added purely from the position count, the
 * same structural fact every position already keys its styling to) switches
 * to a two-column grid instead of continuing to shrink every column.
 */
export function CruxItem({
  crux,
  bodyHtml,
  viewpointsById,
}: {
  crux: Crux;
  bodyHtml: string;
  viewpointsById: Map<string, Viewpoint>;
}) {
  return (
    <Disclosure
      anchor={anchorFor('crux', crux.id)}
      className="sv-crux"
      summary={
        <>
          <span className="sv-item__claim">{crux.question}</span>{' '}
          <span className="sv-crux__kind">{KIND_LABELS[crux.kind]}</span>
        </>
      }
    >
      <Prose html={bodyHtml} />
      <dl
        className={
          crux.positions.length > 3 ? 'sv-positions sv-positions--wrap' : 'sv-positions'
        }
        style={{ '--sv-position-count': crux.positions.length }}
      >
        {crux.positions.map((position) => (
          <div key={position.viewpoint} className="sv-position">
            <dt>
              <a href={`#${anchorFor('viewpoint', position.viewpoint)}`}>
                {viewpointsById.get(position.viewpoint)?.name ?? position.viewpoint}
              </a>
            </dt>
            <dd>{position.holds}</dd>
          </div>
        ))}
      </dl>
    </Disclosure>
  );
}
