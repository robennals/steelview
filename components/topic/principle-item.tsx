import type { Principle } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';

export function PrincipleItem({ principle, bodyHtml }: { principle: Principle; bodyHtml: string }) {
  return (
    <Disclosure
      anchor={anchorFor('principle', principle.id)}
      className="sv-principle"
      summary={<span className="sv-item__claim">{principle.name}</span>}
    >
      <Prose html={bodyHtml} />
    </Disclosure>
  );
}
