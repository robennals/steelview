'use client';

import { useEffect } from 'react';
import { decodeHash, openDetails } from './open-details';

/**
 * Opens the disclosure named by the URL hash, and every disclosure containing
 * it. Viewpoints, principles and cruxes only — a fact is addressed by its own
 * URL now, not by an anchor on this page. Two triggers are needed:
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
      openDetails(el);
      if (scroll) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    };

    const onHashChange = () => openById(decodeHash(window.location.hash.slice(1)), true);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
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
