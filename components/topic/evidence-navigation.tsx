'use client';
import { useEffect, useRef } from 'react';
import { revealEvidence } from '@/lib/content/evidence-target';

/** Native fragments on the standalone article, including nested evidence. */
export function EvidenceNavigation() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const article = ref.current?.closest('article');
    if (!article) return;
    const root = article.closest<HTMLElement>('dialog') ?? article;
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest('[data-evidence-link]') : null;
      const hash = link?.getAttribute('href');
      if (!hash?.startsWith('#')) return;
      event.preventDefault();
      event.stopPropagation();
      if (root.tagName === 'DIALOG') {
        history.replaceState(null, '', hash);
        root.querySelectorAll<HTMLAnchorElement>('[data-fact-expand]').forEach(link => { link.hash = hash; });
      }
      else if (location.hash !== hash) history.pushState(null, '', hash);
      revealEvidence(root, hash);
    };
    article.addEventListener('click', onClick);
    if (article.closest('dialog')) return () => article.removeEventListener('click', onClick);
    const reveal = () => revealEvidence(article, location.hash);
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => { window.removeEventListener('hashchange', reveal); article.removeEventListener('click', onClick); };
  }, []);
  return <span ref={ref} hidden />;
}
