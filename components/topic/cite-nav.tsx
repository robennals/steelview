'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { moveSheetToEvidence } from '@/lib/content/evidence-target';

/**
 * The element that started the navigation currently on screen.
 *
 * The modal has to give focus back to whatever the reader left the page at,
 * and by the time it mounts the router has already moved focus — so the
 * trigger is recorded at click time, here, and read once when the modal opens.
 * A plain mutable box rather than React state: nothing renders from it, and a
 * state update on every click would be a re-render for no reason.
 */
export const lastTrigger: { el: HTMLElement | null } = { el: null };

/** The same-origin fact a citation points at, or null for any other link. */
function citationUrl(link: HTMLAnchorElement): URL | null {
  if (!link.dataset.factId) return null;
  if (link.target && link.target !== '_self') return null;
  const url = new URL(link.href, location.href);
  return url.origin === location.origin ? url : null;
}

/**
 * Turns inline fact citations into client-side navigations.
 *
 * Citations arrive as raw HTML from the markdown renderer, so they cannot be
 * `next/link` elements — a plain `<a>` would do a full page load and never
 * reach the intercepting route, meaning a citation would leave the topic page
 * instead of opening a fact over it. Routing them through the app router
 * instead gives them exactly the behaviour a fact row already has.
 *
 * Only citations are redirected: the listener recognises them by the
 * `data-fact-id` the renderer puts on them, and leaves every other link —
 * including `next/link`'s own — to be handled normally. Modified clicks
 * (new tab, new window, download) are left alone too, and with JavaScript off
 * none of this runs and a citation is simply a link to the fact's page.
 *
 * A `next/link` prefetches as it scrolls into view; a citation, with no
 * component to do that, is prefetched once the reader hovers or focuses it.
 * Inside an open sheet, a citation replaces the open fact rather than adding
 * a history entry, so Close returns to the topic in one step; a citation of
 * the fact already open just reveals its section.
 */
export function CiteNav() {
  const router = useRouter();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      const link = target instanceof Element ? target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;

      // Recorded for every link, not just citations: a fact row is a
      // `next/link` and still has to get focus back when its modal closes.
      lastTrigger.el = link;

      const url = citationUrl(link);
      if (!url) return;

      event.preventDefault();
      // A fact's sheet, not a data panel's, which a fact opens on top of.
      const sheet = link.closest<HTMLElement>('dialog:has(.sv-modal__expand)');
      if (sheet && url.pathname === location.pathname) moveSheetToEvidence(sheet, url.hash, router);
      else if (sheet) router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
      else router.push(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
    };

    const onIntent = (event: Event) => {
      const target = event.target;
      const link = target instanceof Element ? target.closest('a[data-fact-id]') : null;
      const url = link instanceof HTMLAnchorElement ? citationUrl(link) : null;
      if (url && url.pathname !== location.pathname) router.prefetch(url.pathname);
    };

    // Capture phase, so the trigger is recorded before `next/link` handles its
    // own click and navigates away.
    document.addEventListener('click', onClick, true);
    document.addEventListener('pointerover', onIntent);
    document.addEventListener('focusin', onIntent);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('focusin', onIntent);
    };
  }, [router]);

  return null;
}
