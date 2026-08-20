'use client';

import { useEffect, useRef } from 'react';
import { anchorFor } from '@/lib/content/types';

/** Every fact anchor on the page — headline and supporting alike — starts here. */
const FACT_PREFIX = anchorFor('fact', '');

/** The id lent to the open fact's claim so the dialog can be labelled by it. */
const TITLE_ID = 'sv-modal-title';

/**
 * Marks the supporting fact a citation actually asked for, when the panel is
 * showing its parent headline claim. The reader followed a link to one
 * specific item; without this the panel is a wall of prose in which that item
 * is indistinguishable from its siblings.
 */
const REQUESTED = 'svRequested';

/** Breathing room between the panel's sticky claim and the fact scrolled under it. */
const SCROLL_GAP = 12;

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'summary',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** See hash-sync.tsx: a malformed escape must not throw and take the page with it. */
function decodeHash(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** What the modal is holding, and everything needed to put it back. */
type OpenFact = {
  details: HTMLDetailsElement;
  /** The anchor the reader asked for — the fact itself, or one of its supporting facts. */
  hashId: string;
  /** Sits in the list where the fact was, holding its row height so the page behind does not jump. */
  placeholder: HTMLElement;
  /** Whether the fact was expanded in the list before it was borrowed. */
  wasOpen: boolean;
  /** The element that opened the modal, and gets focus back when it closes. */
  trigger: HTMLElement | null;
  /** Whether opening pushed a history entry — decides whether closing pops one. */
  pushed: boolean;
};

/**
 * One fact panel, shared by both ways of asking for one: a row in the Facts
 * list, and a citation or chip inside a viewpoint. The owner asked for the
 * same UI from both, and the way to guarantee that is for there to be only
 * one of it.
 *
 * **It moves the fact into the dialog rather than cloning it.** A clone would
 * duplicate every `id` in the document — the `#fact-…` anchors are permanent
 * addresses that deep links and cross-references depend on, and a second
 * element carrying one would make `getElementById` a coin toss — and it would
 * leave two copies of every nested supporting fact, each with its own open
 * state, to keep in step. Moving has exactly one copy of everything, so the
 * anchors keep meaning what they say and the `<details>` a reader opened
 * inside the panel is still open when the fact is back in the list.
 *
 * The static markup is untouched: every fact is still a `<details>` with its
 * claim in the `<summary>`, its body, sources and supporting facts inside.
 * With JavaScript off none of this runs: a citation is an ordinary anchor,
 * the browser takes the reader to that fact where it stands in the list, and
 * they open it with its own summary — which is exactly how the page worked
 * before this component existed.
 */
export function FactModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const host = hostRef.current;
    if (!dialog || !host) return;

    const root = document.documentElement;
    // Lets the stylesheet give fact rows the affordance of something that
    // opens a panel, but only where the script that opens it is running.
    root.dataset.svModal = 'ready';

    let current: OpenFact | null = null;
    // Set only when history navigation is what is closing the modal, so the
    // close handler does not navigate again in response to a navigation.
    let closingFromHistory = false;

    const hashFor = (id: string) => `${location.pathname}${location.search}#${id}`;

    const clearRequested = () => {
      dialog.removeAttribute('data-sv-followed');
      for (const marked of Array.from(document.querySelectorAll<HTMLElement>('[data-sv-requested]'))) {
        delete marked.dataset[REQUESTED];
        marked.removeAttribute('aria-current');
      }
    };

    /** Put the borrowed fact back exactly where and how it was. */
    const detach = (state: OpenFact) => {
      clearRequested();
      state.placeholder.parentNode?.insertBefore(state.details, state.placeholder);
      state.placeholder.remove();
      state.details.open = state.wasOpen;
      state.details.querySelector(`#${TITLE_ID}`)?.removeAttribute('id');
    };

    const openFact = (id: string, trigger: HTMLElement | null): boolean => {
      if (current && current.hashId === id) return true;

      const el = document.getElementById(id);
      if (!(el instanceof HTMLDetailsElement)) return false;

      // A citation inside the panel pointing at a supporting fact already in
      // the panel: expand it in place rather than tearing the panel apart to
      // show a piece of itself.
      if (host.contains(el)) {
        el.open = true;
        el.scrollIntoView({ block: 'nearest' });
        return true;
      }

      // A supporting fact is evidence for a headline claim and says little
      // standing alone, so the panel shows the claim it supports, with the
      // supporting fact open inside it — the same reading the list gives,
      // and the reason its anchor could always be linked to directly.
      let panelFact = el;
      let ancestor = el.parentElement?.closest('details');
      while (ancestor instanceof HTMLDetailsElement && ancestor.id.startsWith(FACT_PREFIX)) {
        panelFact = ancestor;
        ancestor = ancestor.parentElement?.closest('details');
      }

      const previous = current;
      if (previous) detach(previous);
      else clearRequested();

      const placeholder = document.createElement('div');
      placeholder.className = 'sv-fact-placeholder';
      placeholder.setAttribute('aria-hidden', 'true');
      const height = panelFact.getBoundingClientRect().height;
      if (height > 0) placeholder.style.height = `${height}px`;
      panelFact.parentNode?.insertBefore(placeholder, panelFact);

      const state: OpenFact = {
        details: panelFact,
        hashId: id,
        placeholder,
        wasOpen: panelFact.open,
        // A swap keeps the original trigger: focus should return to whatever
        // the reader left the page at, not to a link inside a closed dialog.
        trigger: previous ? previous.trigger : trigger,
        pushed: previous ? previous.pushed : location.hash !== `#${id}`,
      };
      panelFact.open = true;
      host.appendChild(panelFact);
      current = state;
      // Whether the reader asked for a fact *inside* the panel's claim rather
      // than the claim itself. The stylesheet reads it to pin the claim while
      // the panel is scrolled down to that fact.
      dialog.toggleAttribute('data-sv-followed', panelFact !== el);
      if (panelFact !== el) {
        el.open = true;
        // Both channels, because they answer different readers: the attribute
        // is what a screen reader announces as the current item, the data
        // attribute is what the stylesheet marks it with.
        el.setAttribute('aria-current', 'location');
        el.dataset[REQUESTED] = 'true';
      }

      const claim = panelFact.querySelector('.sv-item__claim');
      if (claim) {
        claim.id = TITLE_ID;
        dialog.setAttribute('aria-labelledby', TITLE_ID);
      } else {
        dialog.removeAttribute('aria-labelledby');
      }

      // A swap replaces the history entry instead of stacking one, so Back
      // always means "leave the panel" rather than "walk back through the
      // facts you looked at".
      if (previous) history.replaceState(history.state, '', hashFor(id));
      else if (state.pushed) history.pushState(null, '', hashFor(id));

      if (!dialog.open) {
        root.classList.add('sv-modal-open');
        dialog.showModal();
      }
      const scroller = host.parentElement;
      scroller?.scrollTo({ top: 0 });
      dialog.querySelector<HTMLElement>('.sv-modal__close')?.focus();
      /*
       * A deep link to a supporting fact opens its headline claim, then
       * brings the fact that was actually asked for into view. Waiting a
       * frame lets the panel lay out first, so the scroll has somewhere to go.
       *
       * `scrollIntoView({ block: 'start' })` is what this used to do, and it
       * put the supporting fact flush against the top of the scrollport —
       * which on a panel whose title is *inside* that scrollport means the
       * headline claim the fact is evidence for scrolls out of sight. A
       * supporting fact read without the claim it supports is exactly the
       * out-of-context number this page exists to prevent, so the scroll is
       * computed instead: stop with the requested fact just below the claim,
       * which is sticky and therefore stays put for the rest of the read.
       */
      if (panelFact !== el) {
        const settle = () => {
          if (current !== state || !scroller || !host.contains(el)) return;
          const claim = panelFact.querySelector<HTMLElement>(':scope > .sv-item__summary');
          const headroom = claim ? claim.getBoundingClientRect().height : 0;
          const top =
            el.getBoundingClientRect().top -
            scroller.getBoundingClientRect().top -
            headroom -
            SCROLL_GAP;
          scroller.scrollBy({ top });
        };
        requestAnimationFrame(settle);
        // The panel is set in a webfont, so its metrics — and therefore every
        // offset measured above — can still change after the first frame.
        // Settling again once the fonts have loaded costs nothing and is the
        // difference between landing on the fact and landing near it.
        document.fonts?.ready.then(settle);
      }
      return true;
    };

    const onDialogClose = () => {
      const state = current;
      current = null;
      const fromHistory = closingFromHistory;
      closingFromHistory = false;
      root.classList.remove('sv-modal-open');
      if (!state) return;

      detach(state);

      if (!fromHistory) {
        // Take the hash back off the URL, so a reader who closes the panel
        // and reloads does not get it opened again.
        if (state.pushed) history.back();
        else if (location.hash === `#${state.hashId}`) {
          history.replaceState(null, '', `${location.pathname}${location.search}`);
        }
      }

      if (state.trigger?.isConnected) state.trigger.focus();
    };

    const onDialogClick = (event: MouseEvent) => {
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
     * guarantee is worth making explicitly rather than inheriting: this is
     * the one place on the page where content is somewhere other than where
     * the document says it is.
     */
    const onDialogKeyDown = (event: KeyboardEvent) => {
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

    const onClick = (event: MouseEvent) => {
      // Leave modified clicks to the browser: a reader opening a fact in a
      // new tab wants the page at that anchor, which still works.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest('.sv-modal__close')) {
        event.preventDefault();
        dialog.close();
        return;
      }

      const link = target.closest('a[href]');
      if (link instanceof HTMLAnchorElement) {
        const href = link.getAttribute('href') ?? '';
        if (!href.startsWith('#')) return;
        const id = decodeHash(href.slice(1));
        if (!id.startsWith(FACT_PREFIX)) return;
        if (openFact(id, link)) event.preventDefault();
        return;
      }

      const summary = target.closest('summary');
      if (!summary) return;
      const details = summary.parentElement;
      if (!(details instanceof HTMLDetailsElement)) return;

      if (host.contains(details)) {
        // The panel's own fact keeps its summary as the panel's title: it
        // must not be collapsible, or the reader can empty the thing they
        // just opened. Supporting facts inside it toggle as usual.
        if (details.parentElement === host) event.preventDefault();
        return;
      }

      if (!details.id.startsWith(FACT_PREFIX)) return;
      if (openFact(details.id, summary)) event.preventDefault();
    };

    const onHashChange = () => {
      const id = decodeHash(location.hash.slice(1));
      if (id.startsWith(FACT_PREFIX) && openFact(id, null)) return;
      if (dialog.open) {
        closingFromHistory = true;
        dialog.close();
      }
    };

    // A page loaded at #fact-x opens that fact's panel straight away.
    onHashChange();

    dialog.addEventListener('close', onDialogClose);
    dialog.addEventListener('click', onDialogClick);
    dialog.addEventListener('keydown', onDialogKeyDown);
    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      dialog.removeEventListener('close', onDialogClose);
      dialog.removeEventListener('click', onDialogClick);
      dialog.removeEventListener('keydown', onDialogKeyDown);
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHashChange);
      // Never leave a fact stranded in a dialog that is going away.
      if (current) detach(current);
      current = null;
      root.classList.remove('sv-modal-open');
      delete root.dataset.svModal;
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="sv-modal">
      <div className="sv-modal__panel">
        <div className="sv-modal__bar">
          <p className="sv-modal__eyebrow">Fact</p>
          <button type="button" className="sv-modal__close">
            <span className="sv-modal__close-label">Close</span>
            <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <div className="sv-modal__scroll">
          <div className="sv-modal__body" ref={hostRef} />
        </div>
      </div>
    </dialog>
  );
}
