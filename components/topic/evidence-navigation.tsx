'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { revealEvidence } from '@/lib/content/evidence-target';
import { ShownObservation } from './explore-panels';
import { decodeHash } from './open-details';

/**
 * Fragments on a report's own page: a chart or observation of its data panel,
 * or a section of the report under it, nested evidence included. A sheet has
 * no need of this: FactModal handles every in-page link there.
 *
 * The hash goes through state so that an observation is showing by the time
 * it is revealed: its cycler follows `ShownObservation` as it renders.
 */
export function EvidenceNavigation({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hash, setHash] = useState<{ value: string } | null>(null);

  useEffect(() => {
    const article = ref.current?.closest('article');
    if (!article) return;
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest('[data-evidence-link]') : null;
      const value = link?.getAttribute('href');
      if (!value?.startsWith('#')) return;
      event.preventDefault();
      event.stopPropagation();
      if (location.hash !== value) history.pushState(null, '', value);
      setHash({ value });
    };
    article.addEventListener('click', onClick);
    const follow = () => setHash({ value: location.hash });
    follow();
    window.addEventListener('hashchange', follow);
    return () => { window.removeEventListener('hashchange', follow); article.removeEventListener('click', onClick); };
  }, []);

  useEffect(() => {
    const article = ref.current?.closest('article');
    if (article && hash) revealEvidence(article, hash.value);
  }, [hash]);

  return (
    <ShownObservation.Provider value={hash && decodeHash(hash.value.slice(1))}>
      <span ref={ref} hidden />
      {children}
    </ShownObservation.Provider>
  );
}
