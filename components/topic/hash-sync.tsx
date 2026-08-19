'use client';

import { useEffect } from 'react';

/**
 * Opens the disclosure named by the URL hash. Two triggers are needed:
 * `hashchange` covers back/forward navigation and pasted links, but does not
 * fire when a link points at the hash the page is already on — so in-page
 * anchor clicks are handled directly as well.
 */
export function HashSync() {
  useEffect(() => {
    const openById = (id: string, scroll: boolean) => {
      if (!id) return;
      const el = document.getElementById(id);
      if (!(el instanceof HTMLDetailsElement)) return;
      el.open = true;
      if (scroll) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const onHashChange = () => openById(decodeURIComponent(window.location.hash.slice(1)), true);

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      openById(decodeURIComponent(anchor.hash.slice(1)), false);
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
