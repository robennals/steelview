'use client';

import { useCallback, useEffect, useState } from 'react';
import type { QuotedSource } from '@/lib/content/walkthrough';
import { InfoSheet } from '@/components/topic/info-sheet';
import { QuoteText } from '@/components/topic/quote-text';

type SourcePopupsProps = {
  /** The sources behind each cited finding, keyed by `<fact>--<section>`, the key its marker carries. */
  sources: Record<string, QuotedSource[]>;
};

/**
 * Opens a claim's sources in a small pop-up when a reader taps its footnote
 * marker: each source's own words, the passages the finding rests on picked
 * out, and a link to the source itself. Nothing of ours is in it. It listens
 * on the document, as principle pop-ups do, rather than wrapping the
 * slideshows, so they stay server-rendered as they were.
 */
export function SourcePopups({ sources }: SourcePopupsProps) {
  const [active, setActive] = useState<{ quoted: QuotedSource[]; trigger: HTMLElement } | null>(null);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const marker = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-sources]') : null;
      const quoted = marker?.dataset.sources && sources[marker.dataset.sources];
      if (!marker || !quoted) return;
      event.preventDefault();
      setActive({ quoted, trigger: marker });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [sources]);

  if (!active) return null;
  return (
    <InfoSheet compact eyebrow={active.quoted.length === 1 ? 'Source' : 'Sources'} labelledBy="sv-sources-title" trigger={active.trigger} onClose={close}>
      <h2 id="sv-sources-title" className="sv-visually-hidden">What the sources say</h2>
      {active.quoted.map(source => (
        <figure key={source.url + source.quote.map(part => part.text).join('')} className="sv-source">
          <blockquote cite={source.url} data-highlighted={source.quote.some(part => part.key) || undefined}>
            <QuoteText parts={source.quote} />
          </blockquote>
          <figcaption>
            <a href={source.url} target="_blank" rel="noreferrer noopener">{source.title}</a>
            <span> · {source.publisher}, {source.date}</span>
          </figcaption>
        </figure>
      ))}
    </InfoSheet>
  );
}
