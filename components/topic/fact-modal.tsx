'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { moveSheetToEvidence, showEvidenceInSheet } from '@/lib/content/evidence-target';
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
 * The sheet a fact is read in when the reader is already on its topic page,
 * also used for a principle opened from it.
 *
 * For a fact, `FactSheet` renders it — from the click, while the fact loads,
 * and then for as long as the intercepting route `@modal/(.)facts` matches —
 * so it stays mounted while the reader follows links from one fact to another
 * inside it, and only the article in it changes.
 *
 * Once a fact has loaded, closing is always `router.back()`, whichever way
 * the reader asks for it, so the panel is one entry in their history rather
 * than a mode they can get stuck in: Back leaves it, and the URL they were on
 * returns. A sheet that is not a route, or a fact not yet loaded, has no entry
 * to go back from, and `onClose` says what closing means instead.
 */
export function FactModal({ labelledBy, children, href, loading = false, wide = false, onClose, kind = 'Data' }: {
  labelledBy: string;
  children: ReactNode;
  /** Where Expand leads — the fact's own page. Only a Data sheet shows it. */
  href: string;
  /** The article has not arrived yet; the sheet is showing a placeholder. */
  loading?: boolean;
  /** Start at the wide size, for a link that opens one chart or observation. */
  wide?: boolean;
  onClose?: () => void;
  kind?: 'Data' | 'Principle';
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const leavingRef = useRef(false);

  // The element that opened this modal, captured once per modal instance
  // rather than re-read from the effect: the effect body runs again on a
  // StrictMode remount. It is only cleared from `lastTrigger` by that effect,
  // never here — React can discard a render (a navigation that waits on a slow
  // response does), and a render that cleared it would leave the instance that
  // actually mounts with nothing to return focus to.
  const [trigger] = useState<HTMLElement | null>(() => lastTrigger.el);
  // Forward reopens the sheet with no click to return to; the fact's own link
  // on the topic page is the next best place.
  const [openedAt] = useState(href);

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
    if (lastTrigger.el === trigger) lastTrigger.el = null;

    const onClick = (event: MouseEvent) => {
      // The panel does not fill the dialog, so a click that lands on the
      // dialog itself is a click on the backdrop.
      if (event.target === dialog) leave();
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link) return;
      // A same-URL fragment link is only an in-document jump in browsers.
      // Expand must reload the canonical page, including its evidence fragment.
      if (link.hasAttribute('data-fact-expand')) {
        if (link.href === location.href) {
          event.preventDefault();
          location.reload();
        }
      } else if (link.getAttribute('href')?.startsWith('#')) {
        // A source footnote moves within the sheet without stacking history,
        // so Close still returns to the topic in one step.
        event.preventDefault();
        moveSheetToEvidence(dialog, link.hash, router);
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
      // here. The dialog element goes away when the route stops matching.
      unwireExit();
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('keydown', onKeyDown);
      root.classList.remove('sv-modal-open');
      // Without a trigger, the first link to the fact that can take focus: one
      // inside a closed row cannot.
      const linksToFact = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .filter((link) => link.pathname === openedAt && !link.closest('dialog'));
      const returnTo = trigger?.isConnected ? trigger
        : linksToFact.find((link) => !link.closest('[inert]'));
      returnTo?.focus();
    };
  }, [leave, router, trigger, openedAt]);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.querySelector('.sv-modal__scroll')?.scrollTo(0, 0);
    dialog?.querySelector<HTMLElement>('.sv-modal__close')?.focus();
    if (!dialog || loading) return;
    // A fact URL can name one section of the article, e.g. a citation's finding.
    const reveal = () => showEvidenceInSheet(dialog, location.hash);
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, [href, loading]);

  return (
    <dialog ref={dialogRef} className="sv-modal" aria-labelledby={labelledBy}>
      <div className="sv-modal__panel" data-wide={wide || undefined}>
        <div className="sv-modal__bar">
          {kind === 'Data' ? <div className="sv-modal__title-slot" /> : <p className="sv-modal__eyebrow">{kind}</p>}
          {kind === 'Data' && <a className="sv-modal__expand" href={href} data-fact-expand>
            Expand <span aria-hidden="true">↗</span>
          </a>}
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
