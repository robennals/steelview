'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { focusedItems, isPlainClick, PanelSheet } from '@/components/topic/explore-panels';

/** A preview chart a reader opened: the data collection it belongs to, and the chart in it. */
type Shown = { slug: string; fact: string; title: string; observation: string; highlight?: string[] };

type Sheets = {
  open: (shown: Shown) => void;
  /** Starts fetching a collection's panel, as the reader reaches for one of its charts. */
  want: (slug: string, fact: string) => void;
};

const SheetsContext = createContext<Sheets | null>(null);

/** Marks the history entry a sheet added, with the chart it opened at. */
const SHEET_ENTRY = 'svPreviewSheet';

const panelKey = (slug: string, fact: string) => `${slug}/${fact}`;

type PreviewSheetsProps = {
  /**
   * Fetches a collection's panel, drawn on the server. Handed down from a
   * server component rather than imported here, so the panel's own client
   * components are part of the page the panel is drawn for.
   */
  load: (slug: string, fact: string) => Promise<ReactNode>;
  children: ReactNode;
};

/**
 * The home page's chart sheets. Clicking a preview chart opens that chart
 * alone, larger, in a sheet over the home page, as a viewpoint's chart does on
 * a topic page. Opening adds a history entry, so
 * Back closes the sheet.
 *
 * The panels are not in the page: each is fetched the first time a reader
 * reaches for one of its charts, and kept.
 */
export function PreviewSheets({ load, children }: PreviewSheetsProps) {
  const [shown, setShown] = useState<Shown | null>(null);
  const [panels, setPanels] = useState<Record<string, ReactNode>>({});
  const requested = useRef(new Set<string>());

  useEffect(() => {
    const onPopState = () => setShown(open => (open && history.state?.[SHEET_ENTRY] === open.observation ? open : null));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const want = useCallback((slug: string, fact: string) => {
    const key = panelKey(slug, fact);
    if (requested.current.has(key)) return;
    requested.current.add(key);
    // A failed fetch is tried again the next time a reader reaches for the chart.
    load(slug, fact).then(
      panel => setPanels(loaded => ({ ...loaded, [key]: panel })),
      () => { requested.current.delete(key); },
    );
  }, [load]);

  const open = useCallback((next: Shown) => {
    want(next.slug, next.fact);
    history.pushState({ ...history.state, [SHEET_ENTRY]: next.observation }, '');
    setShown(next);
  }, [want]);
  const leave = useCallback(() => history.back(), []);

  const sheets = useMemo(() => ({ open, want }), [open, want]);
  const key = shown && panelKey(shown.slug, shown.fact);
  const loaded = key !== null && key in panels;

  return (
    <SheetsContext.Provider value={sheets}>
      {children}
      {shown && createPortal(
        <PanelSheet title={shown.title} observation={shown.observation} highlight={shown.highlight} leave={leave} loaded={loaded}>
          {loaded ? panels[key] : <div className="sv-walk__chart-loading" aria-hidden="true" />}
        </PanelSheet>,
        document.body,
      )}
    </SheetsContext.Provider>
  );
}

type PreviewChartProps = Shown & { children: ReactNode };

/**
 * A preview chart, where any click opens its sheet, the chart's title
 * included. The title is still a link to the chart on the topic page, for a
 * new tab or with no script. A legend's definition still opens.
 */
export function PreviewChart({ children, ...chart }: PreviewChartProps) {
  const sheets = useContext(SheetsContext);
  const onClick = (event: MouseEvent) => {
    if (!sheets || !isPlainClick(event)) return;
    if (event.target instanceof Element && event.target.closest('.sv-glossary')) return;
    event.preventDefault();
    sheets.open({ ...chart, highlight: focusedItems(event.target, event.currentTarget) });
  };
  const want = () => sheets?.want(chart.slug, chart.fact);
  return <div className="sv-slide sv-slide--explorable" onClick={onClick} onPointerEnter={want} onFocus={want}>{children}</div>;
}
