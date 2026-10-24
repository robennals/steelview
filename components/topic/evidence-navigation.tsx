'use client';
import { useEffect, useRef } from 'react';
import { revealEvidence } from '@/lib/content/evidence-target';

/**
 * Native fragments on the standalone article, including nested evidence.
 * Inside a sheet, FactModal handles every in-page link instead.
 */
export function EvidenceNavigation() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const article = ref.current?.closest('article');
    if (!article || article.closest('dialog')) return;
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest('[data-evidence-link]') : null;
      const hash = link?.getAttribute('href');
      if (!hash?.startsWith('#')) return;
      event.preventDefault();
      event.stopPropagation();
      if (location.hash !== hash) history.pushState(null, '', hash);
      revealEvidence(article, hash);
    };
    article.addEventListener('click', onClick);
    const reveal = () => revealEvidence(article, location.hash);
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => { window.removeEventListener('hashchange', reveal); article.removeEventListener('click', onClick); };
  }, []);
  return <span ref={ref} hidden />;
}
