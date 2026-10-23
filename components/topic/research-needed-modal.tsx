'use client';

import { useCallback, useEffect, useState } from 'react';
import { FactModal } from './fact-modal';
import { lastTrigger } from './cite-nav';

/** Turns an explicitly unresolved empirical premise into an honest research cue. */
export function ResearchNeededModal() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[href="#needed"]') : null;
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      event.preventDefault();
      lastTrigger.el = link;
      setOpen(true);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  if (!open) return null;
  return (
    <FactModal kind="Research needed" labelledBy="sv-research-needed-title" href="#needed" onClose={close}>
      <h2 id="sv-research-needed-title">Research needed</h2>
      <p>Research needed to see if this is true.</p>
      <p>This claim is part of the argument, but it does not yet have a supporting data report.</p>
    </FactModal>
  );
}
