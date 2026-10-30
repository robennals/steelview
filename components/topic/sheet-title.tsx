'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const noSubscription = () => () => {};
const slot = () => document.querySelector('.sv-modal__title-slot');

type SheetTitleProps = { id: string; label?: string; children: ReactNode };

/**
 * A fact's title, in the bar of the sheet it is open in, where it stays in view
 * and takes no room from the data. The sheet's bar stays mounted while its
 * article changes, so the title is sent up to it. Outside a sheet it stays put.
 */
export function SheetTitle({ id, label, children }: SheetTitleProps) {
  const target = useSyncExternalStore(noSubscription, slot, () => null);
  const title = <h2 className="sv-modal__title" id={id} aria-label={label}>{children}</h2>;
  return target ? createPortal(title, target) : title;
}
