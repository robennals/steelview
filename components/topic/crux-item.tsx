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
      summary={
        <>
          <span>{crux.question}</span> <span>{KIND_LABELS[crux.kind]}</span>
        </>
      }
    >
      <Prose html={bodyHtml} />
      <dl>
        {crux.positions.map((position) => (
          <div key={position.viewpoint}>
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
