import type { Crux, Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { TopicAccordion, TopicRow } from '@/components/home/topic-accordion';

const KIND_LABELS = {
  tradeoff: 'Tension between principles',
  priority: 'Tension between principles',
  prediction: 'Different predictions',
  assumption: 'Missing data',
} as const;

type CruxRowsProps = {
  cruxes: Crux[];
  viewpointsById: Map<string, Viewpoint>;
};

/**
 * The cruxes as rows, none open at first. Closed, a row is what kind of crux
 * it is, what is at issue and why it divides people; open, it shows where each
 * side stands.
 *
 * The positions are columns of equal width and identical styling, so neither
 * side is given the floor.
 */
export function CruxRows({ cruxes, viewpointsById }: CruxRowsProps) {
  return (
    <TopicAccordion initial="">
      {cruxes.map((crux) => (
        <TopicRow
          key={crux.id}
          slug={crux.id}
          anchor={anchorFor('crux', crux.id)}
          className="sv-row--crux"
          title={crux.title}
          subtitle={crux.tension}
          meta={<p className="sv-row__meta"><span className="sv-tag">{KIND_LABELS[crux.kind]}</span></p>}
          thumbs={null}
        >
          <dl className="sv-positions">
            {crux.positions.map((position) => (
              <div key={position.viewpoint} className="sv-position">
                <dt>
                  <a href={`#${anchorFor('viewpoint', position.viewpoint)}`}>
                    {viewpointsById.get(position.viewpoint)?.shortName ?? position.viewpoint}
                  </a>
                </dt>
                <dd>{position.holds}</dd>
              </div>
            ))}
          </dl>
        </TopicRow>
      ))}
    </TopicAccordion>
  );
}
