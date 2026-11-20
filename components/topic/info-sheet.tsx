'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { wireModalExit } from '@/lib/modal/wire-modal-exit';

type InfoSheetProps = {
  /** What kind of thing the sheet holds, above it: "Source". */
  eyebrow: string;
  /** Sized to what it holds, and on a phone rising from the bottom, for a few lines rather than a page. */
  compact?: boolean;
  labelledBy: string;
  /** The link that opened the sheet, which gets focus back when it closes. */
  trigger: HTMLElement | null;
  onClose: () => void;
  children: ReactNode;
};

/** The sheet a claim's sources are read in, over the page that mentioned them. */
export function InfoSheet({ eyebrow, compact, labelledBy, trigger, onClose, children }: InfoSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const root = document.documentElement;
    // Escape (as `dialog`'s `cancel` event) and the initial `showModal` are
    // both wired here, in a way proven idempotent under mount -> cleanup ->
    // mount — see lib/modal/wire-modal-exit.ts and its test.
    const unwireExit = wireModalExit(dialog, onClose);
    // The panel does not fill the dialog, so a click that lands on the dialog
    // itself is a click on the backdrop.
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };
    dialog.addEventListener('click', onClick);
    // Chrome inerts the page behind a modal dialog but does not stop it
    // scrolling, and on a phone that means the panel and the page moving at
    // once.
    root.classList.add('sv-modal-open');
    dialog.querySelector<HTMLElement>('.sv-modal__close')?.focus();
    return () => {
      unwireExit();
      dialog.removeEventListener('click', onClick);
      root.classList.remove('sv-modal-open');
      // The page is inert until the dialog closes, and cannot take focus before.
      dialog.close();
      trigger?.focus();
    };
  }, [trigger, onClose]);

  return (
    <dialog ref={dialogRef} className="sv-modal" aria-labelledby={labelledBy}>
      <div className="sv-modal__panel" data-compact={compact || undefined}>
        <div className="sv-modal__bar">
          <p className="sv-modal__eyebrow">{eyebrow}</p>
          <button type="button" className="sv-modal__close" onClick={onClose}>
            <span className="sv-modal__close-label">Close</span>
            <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <div className="sv-modal__scroll">
          <div className="sv-modal__body">{children}</div>
        </div>
      </div>
    </dialog>
  );
}
