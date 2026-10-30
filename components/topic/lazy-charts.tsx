'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRowIsOpen } from '@/components/home/topic-accordion';
import { useChartsWanted } from './explore-panels';

const Charts = createContext<ReactNode[] | null>(null);

type LazyChartsProps = {
  /** The collection these charts belong to, which a viewpoint can open without its row. */
  fact?: string;
  /** Fetches the row's charts, in step order, drawn on the server. */
  load: () => Promise<ReactNode[]>;
  children: ReactNode;
};

/**
 * A row's charts, fetched when the row first opens rather than sent with the
 * page. A topic page has a hundred or so of them, nearly all in rows a reader
 * never opens, and each is drawn at several shapes; sending them all made the
 * page many megabytes. The steps' text is still in the page, for readers and
 * crawlers alike: only the charts wait. Once fetched, a row keeps them.
 */
export function LazyCharts({ fact = '', load, children }: LazyChartsProps) {
  const wanted = useChartsWanted(fact);
  const rowOpen = useRowIsOpen();
  const open = rowOpen || wanted;
  const [charts, setCharts] = useState<ReactNode[] | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (!open || requested.current) return;
    requested.current = true;
    // A failed fetch leaves the spaces empty and tries again next time the row opens.
    load().then(setCharts, () => { requested.current = false; });
  }, [open, load]);

  return <Charts.Provider value={charts}>{children}</Charts.Provider>;
}

type LazyChartProps = {
  index: number;
  /** The step's text, kept in the page while the chart that will carry it waits. */
  children?: ReactNode;
};

/** One step's chart, or until its row's charts arrive its text over a space of the same size. */
export function LazyChart({ index, children }: LazyChartProps) {
  const charts = useContext(Charts);
  return charts?.[index] ?? <>{children}<div className="sv-walk__chart-loading" aria-hidden="true" /></>;
}
