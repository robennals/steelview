import type { Fact } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';

/** A labelled row of links to facts elsewhere on the page. Renders nothing when empty. */
export function ItemChips({ label, facts }: { label: string; facts: Fact[] }) {
  if (facts.length === 0) return null;
  return (
    <div>
      <h4>{label}</h4>
      <ul>
        {facts.map((fact) => (
          <li key={fact.id}>
            <a href={`#${anchorFor('fact', fact.id)}`}>{fact.claim}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
