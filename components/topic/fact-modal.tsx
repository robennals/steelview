'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { lastTrigger } from './cite-nav';
import { wireModalExit } from '@/lib/modal/wire-modal-exit';

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
 *
 * The route is what is open — this component does not own that state, it
 * reflects it. `<dialog>`'s own imperative `showModal`/`close` still has to
 * be driven from an effect, but the effect must survive being mounted,
 * cleaned up and mounted again without navigating anywhere: React's
 * StrictMode does exactly that on every first mount in development, and a
 * `close` *event* fired during that churn used to be read as the reader
 * asking to leave, snapping the URL back to the topic page before the reader
 * had touched anything. So `close` is no longer listened for at all — only
 * the three real exits (Escape, the backdrop, the close button) call
 * `router.back()`, directly, once, and never from a DOM event or from
 * cleanup.
 */
export function FactModal({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const leavingRef = useRef(false);

  // The element that opened this modal, captured once per modal instance
  // rather than re-read from the effect: the effect body runs again on a
  // StrictMode remount, and `lastTrigger.el` is already nulled by then, which
  // used to lose the focus-restoration target on every dev-mode open.
  const [trigger] = useState<HTMLElement | null>(() => {
    const el = lastTrigger.el;
    lastTrigger.el = null;
    return el;
  });

  const leave = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    router.back();
  }, [router]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const root = document.documentElement;

    // Escape (as `dialog`'s `cancel` event) and the initial `showModal` are
    // both wired here, in a way proven idempotent under mount -> cleanup ->
    // mount — see lib/modal/wire-modal-exit.ts and its test.
    const unwireExit = wireModalExit(dialog, leave);

    const onClick = (event: MouseEvent) => {
      // The panel does not fill the dialog, so a click that lands on the
      // dialog itself is a click on the backdrop.
      if (event.target === dialog) leave();
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

    dialog.addEventListener('click', onClick);
    dialog.addEventListener('keydown', onKeyDown);

    // Chrome inerts the page behind a modal dialog but does not stop it
    // scrolling, and on a phone that means the panel and the page moving at
    // once.
    root.classList.add('sv-modal-open');
    dialog.querySelector<HTMLElement>('.sv-modal__close')?.focus();

    return () => {
      // Deliberately does not close the dialog or navigate: this cleanup
      // runs on a StrictMode remount as well as on the real unmount that
      // follows a genuine close, and the two are indistinguishable from
      // here. The dialog element itself goes away with the component when
      // the route that renders it stops matching — that is the real close.
      unwireExit();
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('keydown', onKeyDown);
      root.classList.remove('sv-modal-open');
      if (trigger?.isConnected) trigger.focus();
    };
  }, [leave, trigger]);

  return (
    <dialog ref={dialogRef} className="sv-modal" aria-labelledby={labelledBy}>
      <div className="sv-modal__panel">
        <div className="sv-modal__bar">
          <p className="sv-modal__eyebrow">Fact</p>
          <button type="button" className="sv-modal__close" onClick={leave}>
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
