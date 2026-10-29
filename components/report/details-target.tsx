'use client';

import { useEffect } from 'react';
import { decodeHash, openDetails } from '@/components/topic/open-details';

/**
 * Opens a collapsed `<details>` inside one container when a link names it:
 * on load and on `hashchange` for the URL's hash, and on click for an in-page
 * link inside the container (a link to the hash already in the URL fires no
 * `hashchange`). The browser does the scrolling; this only opens. It never
 * closes an item the reader opened.
 *
 * On fact pages `revealEvidence` already does this; the island makes an
 * EventStrip's numbered markers open their key items anywhere else it is
 * rendered, Storybook included. Without JavaScript a marker still jumps to
 * its item, whose summary shows the date and label.
 */
export function DetailsTarget({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const openById = (id: string) => {
      if (!id) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement && root.contains(el)) openDetails(el);
    };

    const onHashChange = () => openById(decodeHash(window.location.hash.slice(1)));

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      openById(decodeHash(anchor.hash.slice(1)));
    };

    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    root.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      root.removeEventListener('click', onClick);
    };
  }, [rootId]);

  return null;
}
