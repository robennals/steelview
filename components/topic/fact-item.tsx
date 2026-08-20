import type { Fact, SourceStance } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';
import { SeriesChart } from './series-chart';
import { StatusBadge } from './status-badge';
import { Glyph, type GlyphShape } from './glyph';

const STANCE_HEADINGS: Record<SourceStance, string> = {
  supports: 'Supporting',
  contests: 'Contesting',
  complicates: 'Complicating',
};

// The same glyph family as the fact statuses, so a reader learns one alphabet.
const STANCE_SHAPES: Record<SourceStance, GlyphShape> = {
  supports: 'solid',
  contests: 'split',
  complicates: 'quartered',
};

const STANCE_ORDER: SourceStance[] = ['supports', 'contests', 'complicates'];

/** A fact and its rendered markdown body, paired because the page renders bodies up front. */
export type BodiedFact = { fact: Fact; bodyHtml: string };

function Sources({ fact }: { fact: Fact }) {
  return (
    <>
      {STANCE_ORDER.map((stance) => {
        const sources = fact.sources.filter((s) => s.stance === stance);
        if (sources.length === 0) return null;
        return (
          <section key={stance} className="sv-stance">
            <h4 className="sv-stance__head">
              <Glyph shape={STANCE_SHAPES[stance]} />
              {STANCE_HEADINGS[stance]}
            </h4>
            {sources.map((source, i) => (
              <figure key={`${stance}-${i}`} className="sv-source">
                <blockquote>{source.quote}</blockquote>
                <figcaption>
                  <a href={source.url} target="_blank" rel="noreferrer noopener">
                    {source.title}
                  </a>
                  , {source.publisher}, {source.date}
                </figcaption>
              </figure>
            ))}
          </section>
        );
      })}
    </>
  );
}

/** The collapsed row of any fact: its claim, then its status. */
function FactSummary({ fact }: { fact: Fact }) {
  return (
    <>
      <span className="sv-item__claim">{fact.claim}</span> <StatusBadge status={fact.status} />
    </>
  );
}

/**
 * Everything a reader sees once a headline fact is open: its context, its
 * sources, then the facts that are evidence for it.
 *
 * Kept separate from the `<details>` wrapper on purpose. The next round
 * replaces inline expansion with a modal, and that should be a swap of what
 * holds this — not a rewrite of what a fact looks like when it is open.
 */
export function FactDetail({
  fact,
  bodyHtml,
  supporting = [],
}: {
  fact: Fact;
  bodyHtml: string;
  supporting?: BodiedFact[];
}) {
  return (
    <>
      <Prose html={bodyHtml} />
      {/*
       * The series sits between the body and the sources: the body says what
       * the number measures, the chart says what it has done over the whole
       * range the source publishes, and the quotes then back both. A chart
       * placed after the sources would be read as an appendix, when it is the
       * answer to "compared to what?" that the claim above it invites.
       */}
      {fact.series && <SeriesChart factId={fact.id} series={fact.series} />}
      <Sources fact={fact} />
      {supporting.length > 0 && (
        /*
         * Supporting facts live here rather than in the top-level list
         * because they are not claims in their own right — a contract
         * overrun or a grant-rate movement is evidence for a larger claim and
         * says little standing alone. Each keeps its own `#fact-<id>` anchor:
         * those are permanent addresses and a cross-reference chip may point
         * at one, so hash-sync opens this parent on the way (it walks the
         * ancestor <details> chain).
         */
        <section className="sv-supporting">
          <h4 className="sv-supporting__head">
            Supporting {supporting.length === 1 ? 'fact' : 'facts'}
          </h4>
          {supporting.map(({ fact: child, bodyHtml: childBody }) => (
            <Disclosure
              key={child.id}
              anchor={anchorFor('fact', child.id)}
              className="sv-subfact"
              status={child.status}
              summary={<FactSummary fact={child} />}
            >
              <FactDetail fact={child} bodyHtml={childBody} />
            </Disclosure>
          ))}
        </section>
      )}
    </>
  );
}

export function FactItem({
  fact,
  bodyHtml,
  supporting = [],
}: {
  fact: Fact;
  bodyHtml: string;
  supporting?: BodiedFact[];
}) {
  return (
    <Disclosure
      anchor={anchorFor('fact', fact.id)}
      className="sv-fact"
      status={fact.status}
      summary={<FactSummary fact={fact} />}
    >
      <FactDetail fact={fact} bodyHtml={bodyHtml} supporting={supporting} />
    </Disclosure>
  );
}
