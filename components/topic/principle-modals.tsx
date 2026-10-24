'use client';

import { useCallback, useEffect, useState } from 'react';
import { FactModal } from './fact-modal';
import { lastTrigger } from './cite-nav';
import { Prose } from './prose';

type Preview = { id: string; name: string; bodyHtml: string };

/** Enhance shared principle anchors while preserving their no-JS destination. */
export function PrincipleModals({ principles }: { principles: Preview[] }) {
  const [active, setActive] = useState<Preview | null>(null);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[href^="#principle-"]') : null;
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const principle = principles.find((item) => link.hash === `#principle-${item.id}`);
      if (!principle) return;
      event.preventDefault();
      lastTrigger.el = link;
      setActive(principle);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [principles]);

  if (!active) return null;
  return (
    <FactModal kind="Principle" labelledBy="sv-principle-modal-title"
      href={`#principle-${active.id}`} onClose={close}>
      <h2 id="sv-principle-modal-title">{active.name}</h2>
      <Prose html={active.bodyHtml} />
    </FactModal>
  );
}
