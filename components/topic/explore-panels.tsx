'use client';

import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import type { PanelTarget } from '@/lib/content/markdown';
import { showPanelStep } from '@/lib/content/evidence-target';
import { wireModalExit } from '@/lib/modal/wire-modal-exit';
import { decodeHash } from './open-details';
import { Prose } from './prose';

type Explore = {
  shown: PanelTarget | null;
  /** The collection whose charts a reader is about to want. */
  wanted: string | null;
  want: (fact: string) => void;
  open: (shown: PanelTarget) => void;
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

/** Marks the history entry a sheet added, with the observation it opened at. */
const SHEET_ENTRY = 'svExploreSheet';

/**
 * The topic page's data panels, which a viewpoint can open in a sheet. Opening
 * adds a history entry, so Back closes the sheet as it does a fact's.
 *
 * Arriving at a chart's or observation's address — from a home-page chart, a
 * shared link or a link on the page — opens it in its sheet over the report.
 * The address moves off the entry the reader arrived on, onto a new one for
 * the sheet, so Back closes the sheet onto the report rather than leaving the
 * page.
 *
 * The sheet knows its own entry by a mark in its history state, not by the
 * observation in the address, so a reload of that entry reopens the sheet
 * without adding another.
 */
export function ExplorePanels({ panels, children }: { panels: string[]; children: ReactNode }) {
  const [shown, setShown] = useState<PanelTarget | null>(null);
  const [wanted, want] = useState<string | null>(null);

  // Coming back from a fact opened over the sheet lands on the sheet's own entry.
  useEffect(() => {
    const onPopState = () => setShown(open => (open && history.state?.[SHEET_ENTRY] === open.observation ? open : null));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const open = useCallback((next: PanelTarget) => {
    // A reload of the sheet's own entry is already its entry.
    if (history.state?.[SHEET_ENTRY] !== next.observation) {
      history.pushState({ ...history.state, [SHEET_ENTRY]: next.observation }, '', `#${next.observation}`);
    }
    setShown(next);
  }, []);
  const leave = useCallback(() => history.back(), []);

  useEffect(() => {
    const openAddressed = () => {
      const observation = decodeHash(location.hash.slice(1));
      const fact = panels.find(id => observation.startsWith(`${id}--`));
      const selector = `[data-chart-anchor="${CSS.escape(observation)}"], [data-observation="${CSS.escape(observation)}"]`;
      if (!fact || !document.querySelector(selector)) return;
      if (history.state?.[SHEET_ENTRY] !== observation) history.replaceState(history.state, '', location.pathname + location.search);
      open({ fact, observation });
    };
    openAddressed();
    window.addEventListener('hashchange', openAddressed);
    return () => window.removeEventListener('hashchange', openAddressed);
  }, [panels, open]);

  const explore = useMemo(() => ({ shown, wanted, want, open, leave }), [shown, wanted, open, leave]);

  return <ExploreContext.Provider value={explore}>{children}</ExploreContext.Provider>;
}

export const isPlainClick = (event: MouseEvent) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

type ExploreLinkProps = PanelTarget & { href: string };

/**
 * "Explore this data" under a viewpoint step: opens the collection's own data
 * panel in a sheet at once, since the panel is already on the page. Its charts
 * start loading as the reader reaches for the link. It is still a link to the
 * observation, for a new tab or with no script.
 */
export function ExploreLink({ fact, observation, href }: ExploreLinkProps) {
  const explore = useContext(ExploreContext);
  const onClick = (event: MouseEvent) => {
    if (!explore || !isPlainClick(event)) return;
    event.preventDefault();
    explore.open({ fact, observation });
  };
  return (
    <div className="prose-body sv-walk__explore">
      <p><a className="sv-cite" href={href} data-panel-link onClick={onClick} onPointerEnter={() => explore?.want(fact)} onFocus={() => explore?.want(fact)}>Explore this data</a></p>
    </div>
  );
}

/** The panel a rendered citation opens, from the data `renderMarkdown` gave it. */
function citedPanel(target: EventTarget): PanelTarget | null {
  const link = target instanceof Element ? target.closest<HTMLAnchorElement>('a[data-panel-fact]') : null;
  const { panelFact: fact, panelObservation: observation } = link?.dataset ?? {};
  return fact && observation ? { fact, observation } : null;
}

type ExploreProseProps = { html: string; className: string };

/**
 * A viewpoint step's prose, whose citations open their collections' data panels
 * as "Explore this data" does. They arrive as raw HTML, so are handled here for
 * the whole of it. Each is still a link to the report, for a new tab or with no
 * script.
 */
export function ExploreProse({ html, className }: ExploreProseProps) {
  const explore = useContext(ExploreContext);
  const onClick = (event: MouseEvent) => {
    const cited = citedPanel(event.target);
    if (!cited || !explore || !isPlainClick(event)) return;
    event.preventDefault();
    explore.open(cited);
  };
  const onIntent = (event: SyntheticEvent) => {
    const cited = citedPanel(event.target);
    if (cited) explore?.want(cited.fact);
  };
  return <div onClick={onClick} onPointerOver={onIntent} onFocus={onIntent}><Prose html={html} className={className} /></div>;
}

/**
 * A viewpoint step's chart column — the chart and its "Explore this data" —
 * where a click anywhere follows that link, the chart's title included. A
 * link of its own, a legend's definition and the sources row still do their
 * own thing. A zoom-in pointer and an expand mark in its corner say a click
 * shows it larger (globals.css). The mark is decoration: "Explore this data"
 * is the control a keyboard or screen reader uses.
 */
export function ExplorableChart({ children }: { children: ReactNode }) {
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('a, .sv-glossary, .sv-chart__sources')) return;
    const explore = event.currentTarget.querySelector<HTMLAnchorElement>('.sv-walk__explore a');
    if (!explore) return;
    event.preventDefault();
    explore.click();
  };
  return (
    <div className="sv-walk__chart sv-walk__chart--explorable" onClick={onClick}>
      <span className="sv-walk__expand" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" />
        </svg>
      </span>
      {children}
    </div>
  );
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

type PanelSheetProps = {
  title: string;
  observation: string;
  leave: () => void;
  /** Whether the panel is in the sheet yet. The home page fetches it as the sheet opens. */
  loaded?: boolean;
  children: ReactNode;
};

/**
 * The sheet around a data panel, open at one chart and observation from the
 * first frame the panel is in it. A topic page's sheets, and the home page's.
 */
export function PanelSheet({ title, observation, leave, loaded = true, children }: PanelSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement;
    const unwireExit = wireModalExit(dialog, leave);
    document.documentElement.classList.add('sv-modal-open');
    dialog.querySelector<HTMLElement>('.sv-modal__close')?.focus();

    return () => {
      unwireExit();
      document.documentElement.classList.remove('sv-modal-open');
      // The page is inert until the dialog closes, and cannot take focus before.
      dialog.close();
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [leave]);

  // Straight to the chart holding the observation, with nothing to scroll past.
  useLayoutEffect(() => {
    if (loaded && dialogRef.current) showPanelStep(dialogRef.current, observation);
  }, [loaded, observation]);

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
          <article className="sv-factpage sv-factpanel">
            <ShownObservation.Provider value={observation}>{children}</ShownObservation.Provider>
          </article>
        </div>
      </div>
    </dialog>
  );
}
