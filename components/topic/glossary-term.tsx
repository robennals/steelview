'use client';

import { useId, type ReactNode } from 'react';
import { glossary } from '@/lib/content/glossary';

type GlossaryTermProps = { term: string; children: ReactNode };

/**
 * A term that opens its shared definition, for places outside rendered prose
 * (prose gets the same markup from `rehypeGlossary`). A client component only
 * for `useId`: the same chart can be drawn twice on one page, and each copy's
 * popup needs an id of its own.
 */
export function GlossaryTerm({ term, children }: GlossaryTermProps) {
  const id = useId();
  const entry = glossary[term];
  return (
    <span className="sv-glossary">
      <button type="button" className="sv-glossary__term" popoverTarget={id} aria-haspopup="dialog">{children}</button>
      <span id={id} popover="auto" role="dialog" aria-label={entry.title} className="sv-glossary__popup">
        <strong>{entry.title}</strong>
        <span className="sv-glossary__definition">{entry.definition}</span>
        <button type="button" popoverTarget={id} popoverTargetAction="hide" className="sv-glossary__close" aria-label="Close definition">×</button>
      </span>
    </span>
  );
}
