'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { lastTrigger } from './cite-nav';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'summary',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * The sheet a fact is read in when the reader is already on its topic page.
 *
 * It holds a fact rendered from data by the intercepting route above it — it
 * does not borrow anything from the page behind. The previous version moved
 * the fact's `<details>` element out of the list and into the dialog, which it
 * had to do because the fact existed only as markup on the topic page; now
 * that a fact is a route, the modal and the fact's own page render the same
 * component from the same content and there is nothing to move.
 *
 * Closing is always `router.back()`, whichever way the reader asks for it, so
 * the panel is one entry in their history rather than a mode they can get
 * stuck in: Back leaves it, and the URL they were on returns.
 */
export function FactModal({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const root = document.documentElement;
    // Whatever the reader clicked to get here — read once, then released, so a
    // later navigation cannot restore focus to a stale element.
    const trigger = lastTrigger.el;
    lastTrigger.el = null;

    // Set as soon as the panel starts going away, so neither the `close` event
    // nor the effect's own teardown can ask the router to go back twice.
    let leaving = false;
    const leave = () => {
      if (leaving) return;
      leaving = true;
      router.back();
    };

    // Escape closes the dialog natively, which fires `close`; so does the
    // backdrop handler and the close button. One exit, one handler.
    const onClose = () => leave();

    const onClick = (event: MouseEvent) => {
      // The panel does not fill the dialog, so a click that lands on the
      // dialog itself is a click on the backdrop.
      if (event.target === dialog) dialog.close();
    };

    /**
     * Whether Tab can actually reach this element. The contents of a closed
     * `<details>` are still in the document and still report a layout box in
     * Chrome, but are not focusable — so a source link inside a collapsed
     * supporting fact must not be mistaken for the panel's last stop, or Tab
     * from the real last stop escapes to the browser chrome.
     */
    const reachable = (el: HTMLElement): boolean => {
      if (el.getClientRects().length === 0) return false;
      for (let node: HTMLElement | null = el; node && node !== dialog; node = node.parentElement) {
        const parent = node.parentElement;
        if (parent instanceof HTMLDetailsElement && !parent.open && node.tagName !== 'SUMMARY') {
          return false;
        }
      }
      return true;
    };

    /*
     * Chrome keeps Tab inside an open modal dialog on its own, but the
     * guarantee is worth making explicitly rather than inheriting: the page
     * behind stays mounted and interactive as far as the DOM is concerned.
     */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => reachable(el) || el === document.activeElement
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener('close', onClose);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('keydown', onKeyDown);

    if (!dialog.open) dialog.showModal();
    // Chrome inerts the page behind a modal dialog but does not stop it
    // scrolling, and on a phone that means the panel and the page moving at
    // once.
    root.classList.add('sv-modal-open');
    dialog.querySelector<HTMLElement>('.sv-modal__close')?.focus();

    return () => {
      leaving = true;
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('keydown', onKeyDown);
      root.classList.remove('sv-modal-open');
      if (dialog.open) dialog.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, [router]);

  return (
    <dialog ref={dialogRef} className="sv-modal" aria-labelledby={labelledBy}>
      <div className="sv-modal__panel">
        <div className="sv-modal__bar">
          <p className="sv-modal__eyebrow">Fact</p>
          <button
            type="button"
            className="sv-modal__close"
            onClick={() => dialogRef.current?.close()}
          >
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
