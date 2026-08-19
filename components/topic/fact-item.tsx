import type { Fact, SourceStance } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';
import { StatusBadge } from './status-badge';

const STANCE_HEADINGS: Record<SourceStance, string> = {
  supports: 'Supporting',
  contests: 'Contesting',
  complicates: 'Complicating',
};

const STANCE_ORDER: SourceStance[] = ['supports', 'contests', 'complicates'];

export function FactItem({ fact, bodyHtml }: { fact: Fact; bodyHtml: string }) {
  return (
    <Disclosure
      anchor={anchorFor('fact', fact.id)}
      summary={
        <>
          <span>{fact.claim}</span> <StatusBadge status={fact.status} />
        </>
      }
    >
      <Prose html={bodyHtml} />
      {STANCE_ORDER.map((stance) => {
        const sources = fact.sources.filter((s) => s.stance === stance);
        if (sources.length === 0) return null;
        return (
          <section key={stance}>
            <h4>{STANCE_HEADINGS[stance]}</h4>
            {sources.map((source, i) => (
              <figure key={`${stance}-${i}`}>
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
    </Disclosure>
  );
}
