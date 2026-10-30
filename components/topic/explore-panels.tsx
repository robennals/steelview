'use client';

import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { wireModalExit } from '@/lib/modal/wire-modal-exit';

type Shown = { fact: string; observation: string };

type Explore = {
  shown: Shown | null;
  /** The collection whose charts a reader is about to want. */
  wanted: string | null;
  want: (fact: string) => void;
  open: (shown: Shown) => void;
  leave: () => void;
};

const ExploreContext = createContext<Explore | null>(null);

/** The observation a panel's sheet was opened at, for the cycler that holds it. */
export const ShownObservation = createContext<string | null>(null);

/** Whether a collection's charts are wanted before its row is open. */
export function useChartsWanted(fact: string): boolean {
  const explore = useContext(ExploreContext);
  return explore?.wanted === fact || explore?.shown?.fact === fact;
}

/**
 * The topic page's data panels, which a viewpoint can open in a sheet. Opening
 * adds a history entry, so Back closes the sheet as it does a fact's.
 */
export function ExplorePanels({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<Shown | null>(null);
  const [wanted, want] = useState<string | null>(null);

  // Coming back from a fact opened over the sheet lands on the sheet's own entry.
  useEffect(() => {
    const onPopState = () => setShown(open => (open && location.hash === `#${open.observation}` ? open : null));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const open = useCallback((next: Shown) => {
    history.pushState(history.state, '', `#${next.observation}`);
    setShown(next);
  }, []);
  const leave = useCallback(() => history.back(), []);
  const explore = useMemo(() => ({ shown, wanted, want, open, leave }), [shown, wanted, open, leave]);

  return <ExploreContext.Provider value={explore}>{children}</ExploreContext.Provider>;
}

type ExploreLinkProps = { fact: string; observation: string; href: string };

/**
 * "Explore this data" under a viewpoint step: opens the collection's own data
 * panel in a sheet at once, since the panel is already on the page. Its charts
 * start loading as the reader reaches for the link. It is still a link to the
 * observation, for a new tab or with no script.
 */
export function ExploreLink({ fact, observation, href }: ExploreLinkProps) {
  const explore = useContext(ExploreContext);
  const onClick = (event: MouseEvent) => {
    if (!explore || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    explore.open({ fact, observation });
  };
  return (
    <div className="prose-body sv-walk__explore">
      <p><a className="sv-cite" href={href} data-panel-link onClick={onClick} onPointerEnter={() => explore?.want(fact)} onFocus={() => explore?.want(fact)}>Explore this data</a></p>
    </div>
  );
}

/**
 * A viewpoint step's chart, where any click follows the step's "Explore this
 * data", the chart's title included. A legend's definition still opens.
 */
export function ExplorableChart({ children }: { children: ReactNode }) {
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('.sv-glossary')) return;
    const explore = event.currentTarget.closest('.sv-walk__chart')?.querySelector<HTMLAnchorElement>('.sv-walk__explore a');
    if (!explore) return;
    event.preventDefault();
    explore.click();
  };
  return <div className="sv-slide sv-slide--explorable" onClick={onClick}>{children}</div>;
}

type PanelHostProps = { fact: string; title: string; children: ReactNode };

/**
 * Where a collection's data panel sits: in its row, or while a viewpoint has it
 * open, in a sheet. It is the one panel either way, moved rather than copied.
 */
export function PanelHost({ fact, title, children }: PanelHostProps) {
  const explore = useContext(ExploreContext);
  const shown = explore?.shown?.fact === fact ? explore.shown : null;
  if (!shown || !explore) return children;
  return createPortal(
    <PanelSheet title={title} observation={shown.observation} leave={explore.leave}>{children}</PanelSheet>,
    document.body,
  );
}

type PanelSheetProps = { title: string; observation: string; leave: () => void; children: ReactNode };

/** The sheet around a data panel, open at one observation from its first frame. */
function PanelSheet({ title, observation, leave, children }: PanelSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement;
    const unwireExit = wireModalExit(dialog, leave);
    document.documentElement.classList.add('sv-modal-open');
    dialog.querySelector<HTMLElement>('.sv-modal__close')?.focus();

    // Straight to the chart holding the observation, with nothing to scroll past.
    const slide = dialog.querySelector(`[data-observation="${CSS.escape(observation)}"]`)?.closest('.sv-walk__slide');
    const strip = slide?.parentElement;
    if (slide && strip) strip.scrollLeft = Array.from(strip.children).indexOf(slide) * strip.clientWidth;

    return () => {
      unwireExit();
      document.documentElement.classList.remove('sv-modal-open');
      // The page is inert until the dialog closes, and cannot take focus before.
      dialog.close();
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [leave, observation]);

  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (event.target === dialog) leave();
    // A method note is an in-sheet jump. Followed natively it would change the
    // address, and the sheet closes when the address stops being its own.
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    const target = link && dialog.querySelector(`#${CSS.escape(link.hash.slice(1))}`);
    if (!link || !target) return;
    event.preventDefault();
    for (let el: Element | null = target; el && el !== dialog; el = el.parentElement) {
      if (el instanceof HTMLDetailsElement) el.open = true;
    }
    target.scrollIntoView({ block: 'nearest' });
  };

  return (
    <dialog ref={dialogRef} className="sv-modal" aria-labelledby={titleId} onClick={onClick}>
      <div className="sv-modal__panel" data-wide>
        <div className="sv-modal__bar">
          <h2 className="sv-modal__title" id={titleId}>{title}</h2>
          <button type="button" className="sv-modal__close" onClick={leave}>
            <span className="sv-modal__close-label">Close</span>
            <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <div className="sv-modal__scroll">
          <article className="sv-factpage sv-factpanel" data-variant="modal">
            <ShownObservation.Provider value={observation}>{children}</ShownObservation.Provider>
          </article>
        </div>
      </div>
    </dialog>
  );
}
