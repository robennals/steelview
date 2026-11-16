'use client';

import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import type { CitedClaim } from '@/lib/content/walkthrough';
import { isPlainClick, useOpenPanel } from '@/components/topic/explore-panels';
import { InfoSheet } from '@/components/topic/principle-modals';
import { Prose } from '@/components/topic/prose';

type ClaimPopupsProps = {
  /** Every cited finding, keyed by `<fact>--<observation>`, the hash its citation links to. */
  claims: Record<string, CitedClaim>;
};

/**
 * Opens a cited finding in a small pop-up when a reader taps the claim that
 * cites it: the finding, why it holds, and a way on to the data behind it.
 * A citation stays an ordinary link to the finding's report, for a new tab or
 * with no script. It listens on the document, as principle pop-ups do, rather
 * than wrapping the slideshows, so they stay server-rendered as they were.
 */
export function ClaimPopups({ claims }: ClaimPopupsProps) {
  const [active, setActive] = useState<{ claim: CitedClaim; trigger: HTMLElement } | null>(null);
  const close = useCallback(() => setActive(null), []);
  const openPanel = useOpenPanel();

  useEffect(() => {
    const onClick = (event: globalThis.MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('.sv-deck__card a.sv-cite') : null;
      // A card's "Explore this data" is a citation too, but opens the data, not a pop-up.
      if (!link || link.closest('.sv-walk__explore')) return;
      const claim = claims[decodeURIComponent(link.hash.slice(1))];
      if (!claim) return;
      event.preventDefault();
      setActive({ claim, trigger: link });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [claims]);

  const seeData = (event: MouseEvent, claim: CitedClaim) => {
    if (!claim.panel || !openPanel || !isPlainClick(event)) return;
    event.preventDefault();
    setActive(null);
    openPanel(claim.panel);
  };

  if (!active) return null;
  return (
    <InfoSheet compact eyebrow={active.claim.collection} labelledBy="sv-claim-title" trigger={active.trigger} onClose={close}>
      <h2 id="sv-claim-title" dangerouslySetInnerHTML={{ __html: active.claim.heading }} />
      <Prose html={active.claim.html} />
      <p className="sv-claim__more">
        <a className="sv-cite" href={active.claim.href} onClick={event => seeData(event, active.claim)}>See the data</a>
      </p>
    </InfoSheet>
  );
}
