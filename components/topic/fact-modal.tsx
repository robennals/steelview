'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { revealEvidence } from '@/lib/content/evidence-target';
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

/** Accessible sheet shared by instant topic previews and intercepted routes. */
export function FactModal({ labelledBy, children, href, onClose }: {
  labelledBy: string;
  children: ReactNode;
  href: string;
  onClose?: () => void;
}) {
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
    if (onClose) onClose();
    else router.back();
  }, [router, onClose]);

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
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-fact-expand]') : null;
      // A same-URL fragment link is only an in-document jump in browsers.
      // Expand must reload the canonical page, including its evidence fragment.
      if (link && link.href === location.href && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        location.reload();
      }
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
      // here. The dialog element goes away when its owner dismisses it.
      unwireExit();
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('keydown', onKeyDown);
      root.classList.remove('sv-modal-open');
      if (trigger?.isConnected) trigger.focus();
    };
  }, [leave, trigger]);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.querySelector('.sv-modal__scroll')?.scrollTo(0, 0);
    dialog?.querySelector<HTMLElement>('.sv-modal__close')?.focus();
    if (!dialog) return;
    const reveal = () => {
      const url = new URL(href, location.href);
      if (!url.hash && url.pathname === location.pathname) url.hash = location.hash;
      dialog.querySelectorAll<HTMLAnchorElement>('a[data-fact-expand]').forEach(link => {
        if (new URL(link.href).pathname === url.pathname) link.href = url.pathname + url.hash;
      });
      return revealEvidence(dialog, url.hash);
    };
    window.addEventListener('hashchange', reveal);
    // An uncached article arrives after the sheet opens.
    const observer = new MutationObserver(() => { if (reveal()) observer.disconnect(); });
    if (!reveal()) observer.observe(dialog, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', reveal);
    };
  }, [href]);

  return (
    <dialog ref={dialogRef} className="sv-modal" aria-labelledby={labelledBy}>
      <div className="sv-modal__panel">
        <div className="sv-modal__bar">
          <p className="sv-modal__eyebrow">Data</p>
          <a className="sv-modal__expand" href={href} data-fact-expand>
            Expand <span aria-hidden="true">↗</span>
          </a>
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
