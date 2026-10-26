import type { ReactNode } from 'react';
import type { FactStatus } from '@/lib/content/types';
import { StatusBadge } from '@/components/topic/status-badge';
import { SourceLine } from './figure';
import { formatDate } from './format';
import type { PartialDate, SourceCredit } from './types';

export type ClaimCheckProps = {
  /** The claim in the words it was made, verbatim. */
  claim: string;
  /** Who made it. Omit for a claim that circulates without a single author. */
  claimant?: { name: string; role?: string };
  date?: PartialDate;
  /** Where the claim was made, so a reader can check it was really said. */
  claimSource?: SourceCredit;
  status: FactStatus;
  /** One or two sentences: what the data shows. */
  finding: ReactNode;
  /** The sources the finding rests on. */
  sources?: SourceCredit[];
  /** The fact report that sets out the evidence in full. */
  evidence?: { href: string; label?: string };
  /** `compact` drops the finding's sources and tightens the type, for a list of several checks. */
  variant?: 'full' | 'compact';
  id?: string;
};

/**
 * A claim, as stated, set against what the data shows.
 *
 * The claim is quoted rather than paraphrased so the assessment is of what
 * was actually said; the status uses the site's one status alphabet (label,
 * glyph, weight and left rule — never colour alone); and the finding is in
 * plain sentences with its sources, so the verdict can be checked rather than
 * taken on trust.
 */
export function ClaimCheck({
  claim,
  claimant,
  date,
  claimSource,
  status,
  finding,
  sources,
  evidence,
  variant = 'full',
  id,
}: ClaimCheckProps) {
  const attribution = [
    claimant && (
      <span key="who">
        <cite className="sv-claim__claimant">{claimant.name}</cite>
        {claimant.role && `, ${claimant.role}`}
      </span>
    ),
    date && <time key="when" dateTime={date}>{formatDate(date)}</time>,
    claimSource && (
      <span key="where">
        {claimSource.href ? <a href={claimSource.href}>{claimSource.label}</a> : claimSource.label}
      </span>
    ),
  ].filter(Boolean);

  return (
    <article className="sv-claim" data-status={status} data-variant={variant} id={id}>
      <p className="sv-claim__label">Claim</p>
      <blockquote className="sv-claim__claim" cite={claimSource?.href}>
        <p>{claim}</p>
      </blockquote>
      {attribution.length > 0 && (
        <p className="sv-claim__attribution">
          {attribution.map((part, i) => (
            <span key={i}>
              {i > 0 && <span aria-hidden="true"> · </span>}
              {part}
            </span>
          ))}
        </p>
      )}
      <StatusBadge status={status} />
      <div className="sv-claim__finding">
        <p className="sv-claim__label">What the data shows</p>
        {typeof finding === 'string' ? <p className="sv-claim__finding-text">{finding}</p> : finding}
      </div>
      {variant === 'full' && sources && sources.length > 0 && <SourceLine sources={sources} />}
      {evidence && (
        <p className="sv-claim__evidence">
          <a href={evidence.href}>{evidence.label ?? 'See the evidence'}</a>
        </p>
      )}
    </article>
  );
}
