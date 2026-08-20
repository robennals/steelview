'use client';

import { useEffect } from 'react';
import { anchorFor } from '@/lib/content/types';

/** Fact anchors are handled by the fact panel, not here. */
const FACT_PREFIX = anchorFor('fact', '');

/**
 * Opens the disclosure named by the URL hash, and every disclosure containing
 * it. Two triggers are needed:
 * `hashchange` covers back/forward navigation and pasted links, but does not
 * fire when a link points at the hash the page is already on — so in-page
 * anchor clicks are handled directly as well.
 */
// `decodeURIComponent` throws `URIError` on a malformed escape (e.g. a hash
// ending `#%zz`). A page whose premise is that it works without JavaScript
// must not be destroyed *by* its JavaScript — an uncaught throw here, with no
// app/error.tsx, would replace already-delivered static HTML with Next's
// default error boundary. Fall back to the raw hash, which is a safe no-op
// for `getElementById` if it doesn't match a real id.
function decodeHash(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function HashSync() {
  useEffect(() => {
    const openById = (id: string, scroll: boolean) => {
      if (!id) return;
      // Facts belong to components/topic/fact-modal.tsx, which opens them in
      // the shared panel instead. Both scripts reacting to the same anchor
      // would mean expanding the fact in the list on the way to moving it out
      // of the list — one visible action too many, and a scroll to a row that
      // is about to be covered by the panel.
      if (id.startsWith(FACT_PREFIX)) return;
      const el = document.getElementById(id);
      if (!(el instanceof HTMLDetailsElement)) return;
      // The Facts section collapses everything past the first few into a
      // <details> group, so the target may sit inside one or more closed
      // ancestors. Opening only the target would leave a link into the
      // collapsed group scrolling to something the reader cannot see, so open
      // the whole chain outwards. Outermost first, so the target's own
      // position is settled before the scroll below measures it.
      const chain: HTMLDetailsElement[] = [el];
      let ancestor: Element | null | undefined = el.parentElement?.closest('details');
      while (ancestor instanceof HTMLDetailsElement) {
        chain.push(ancestor);
        ancestor = ancestor.parentElement?.closest('details');
      }
      for (const details of chain.reverse()) details.open = true;
      if (scroll) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    };

    const onHashChange = () => openById(decodeHash(window.location.hash.slice(1)), true);

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      openById(decodeHash(anchor.hash.slice(1)), false);
    };

    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}
