'use client';

import { useCallback, useState, type MouseEvent, type ReactNode } from 'react';
import type { CitedClaim } from '@/lib/content/walkthrough';
import { isPlainClick, useOpenPanel } from '@/components/topic/explore-panels';
import { InfoSheet } from '@/components/topic/principle-modals';
import { Prose } from '@/components/topic/prose';

type ClaimPopupsProps = {
  /** Every cited finding, keyed by `<fact>--<observation>`, the hash its citation links to. */
  claims: Record<string, CitedClaim>;
  children: ReactNode;
};

/**
 * Opens a cited finding in a small pop-up when a reader taps the claim that
 * cites it: the finding, why it holds, and a way on to the data behind it.
 * A citation stays an ordinary link to the finding's report, for a new tab or
 * with no script.
 */
export function ClaimPopups({ claims, children }: ClaimPopupsProps) {
  const [active, setActive] = useState<{ claim: CitedClaim; trigger: HTMLElement } | null>(null);
  const close = useCallback(() => setActive(null), []);
  const openPanel = useOpenPanel();

  const onClick = (event: MouseEvent) => {
    if (!isPlainClick(event)) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('.sv-deck__text a.sv-cite') : null;
    const claim = link && claims[decodeURIComponent(link.hash.slice(1))];
    if (!link || !claim) return;
    event.preventDefault();
    setActive({ claim, trigger: link });
  };

  const seeData = (event: MouseEvent, claim: CitedClaim) => {
    if (!claim.panel || !openPanel || !isPlainClick(event)) return;
    event.preventDefault();
    setActive(null);
    openPanel(claim.panel);
  };

  return (
    <div onClick={onClick}>
      {children}
      {active && (
        <InfoSheet compact eyebrow={active.claim.collection} labelledBy="sv-claim-title" trigger={active.trigger} onClose={close}>
          <h2 id="sv-claim-title" dangerouslySetInnerHTML={{ __html: active.claim.heading }} />
          <Prose html={active.claim.html} />
          <p className="sv-claim__more">
            <a className="sv-cite" href={active.claim.href} onClick={event => seeData(event, active.claim)}>See the data</a>
          </p>
        </InfoSheet>
      )}
    </div>
  );
}
