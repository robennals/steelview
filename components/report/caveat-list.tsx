import { SourceCredits } from './figure';
import type { SourceCredit } from './types';

export type Caveat = {
  /** The measurement that is missing or that this figure does not capture. */
  measure: string;
  /** Why it matters to a reader of this figure. */
  why: string;
  /** Where the gap is documented, shown after `why`. */
  sources?: SourceCredit[];
};

export type CaveatListProps = {
  items: Caveat[];
  /** "Data still needed", "What this does not show", "Not measured here". */
  heading?: string;
  id?: string;
  headingLevel?: 2 | 3;
};

/**
 * The limits of a report, stated as plainly as its findings: each gap named,
 * with why it matters.
 *
 * Kept as its own section rather than folded into the prose, so an absence of
 * data is never read as a finding — and so a reader can see at a glance what
 * would change the picture. Same look as the fact page's "Data still needed".
 */
export function CaveatList({ items, heading = 'Data still needed', id, headingLevel = 3 }: CaveatListProps) {
  if (items.length === 0) return null;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section className="sv-caveats" id={id} aria-labelledby={headingId} aria-label={headingId ? undefined : heading}>
      <Heading className="sv-caveats__heading" id={headingId}>{heading}</Heading>
      <ul className="sv-caveats__list">
        {items.map(item => (
          <li key={item.measure} className="sv-caveats__item">
            <strong className="sv-caveats__measure">{item.measure}</strong>
            <span className="sv-caveats__why">
              {item.why}
              {item.sources && <SourceCredits sources={item.sources} />}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
