'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * One line of reader controls above a figure, however narrow the
 * window.
 *
 * Every control on the row is a dropdown holding one group of like options
 * (the categories, the sort order, the reading shown), its button showing the
 * current setting: "Category: All ▾", "Oldest first ▾". Mixing chips from one
 * group with buttons from another on a single line reads as one jumbled list,
 * so options never sit on the row loose. The one exception is a chart's
 * Graph/Table switch (`lead`), which stays as it is.
 *
 * Dropdowns that do not fit move, lowest priority (last) first, into a "More"
 * pop-up at the row's end. A search box takes no room until asked for: a
 * search icon, first on the row so it is not missed, opens it as a second
 * row under the dropdowns, which stay put.
 */

export type BarItem = {
  key: string;
  /** What the control sets: "Speaker", "Order". */
  label: string;
  /** Its current setting in a few words: "All", "2 selected", "Oldest first". */
  summary: string;
  /** Show the setting alone on the button ("Oldest first"), where it says what it sets. */
  hideLabel?: boolean;
  /** A filter that is narrowing what is shown, marked on the button that holds it. */
  active?: boolean;
  /** The dropdown's content: the control's options. */
  panel: ReactNode;
  /** A pick-one control: choosing an option closes its dropdown. */
  single?: boolean;
};

export type BarSearch = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

const GAP = 8;

type ControlBarProps = {
  /** Names the bar for assistive technology: "Filter and sort quotes". */
  label: string;
  items: BarItem[];
  /** Drawn first on the row as it is, never folded into "More": a chart's Graph/Table switch. */
  lead?: ReactNode;
  search?: BarSearch;
};

/** A figure's controls on one line; see the top of this file. */
export function ControlBar({ label, items, lead, search }: ControlBarProps) {
  const row = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  // How many items, counted from the end, live in "More".
  const [folded, setFolded] = useState(0);
  const [searching, setSearching] = useState(false);
  const searchOpen = searching || (search?.value ?? '') !== '';
  const closeSearch = () => {
    search?.onChange('');
    setSearching(false);
  };

  const signature = items.map(i => `${i.key}:${i.summary}`).join('|');
  useLayoutEffect(() => {
    const root = row.current;
    const ruler = measure.current;
    if (!root || !ruler) return;
    const fit = () => {
      const width = (key: string) => ruler.querySelector<HTMLElement>(`[data-measure="${key}"]`)?.getBoundingClientRect().width ?? 0;
      const fixed = [...(lead ? [width('lead')] : []), ...(search ? [width('search')] : [])];
      for (let n = 0; n <= items.length; n++) {
        const shown = [...fixed, ...items.slice(0, items.length - n).map(i => width(i.key)), ...(n > 0 ? [width('more')] : [])];
        if (shown.reduce((a, b) => a + b, 0) + GAP * (shown.length - 1) <= root.clientWidth) return setFolded(n);
      }
      setFolded(items.length);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    return () => observer.disconnect();
    // `signature` stands for the items: their faces are what change width.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, !!lead, !!search]);

  const shown = items.slice(0, items.length - folded);
  const more = items.slice(items.length - folded);
  const activeInMore = more.filter(i => i.active).length;

  return (
    <div className="sv-bar" role="group" aria-label={label}>
      <div className="sv-bar__row" ref={row}>
        {search && (
          <button
            type="button"
            className="sv-bar__button sv-bar__icon"
            aria-label={search.placeholder}
            title={search.placeholder}
            aria-expanded={searchOpen}
            data-active={searchOpen || undefined}
            onClick={() => (searchOpen ? closeSearch() : setSearching(true))}
          >
            <SearchIcon />
          </button>
        )}
        {lead && <div className="sv-bar__item">{lead}</div>}
        {shown.map(item => (
          <Pop key={item.key} name={`${item.label}: ${item.summary}`} face={<Face item={item} />} active={item.active} single={item.single}>
            {item.panel}
          </Pop>
        ))}
        <span className="sv-bar__end">
          {more.length > 0 && (
            <Pop name={activeInMore > 0 ? `More: ${activeInMore} set` : 'More'} face={<>More{activeInMore > 0 && <span className="sv-bar__badge">{activeInMore}</span>}</>} active={activeInMore > 0} align="end">
              {more.map(item => (
                <section key={item.key} className="sv-bar__section">
                  <h3 className="sv-bar__heading">{item.label}</h3>
                  {item.panel}
                </section>
              ))}
            </Pop>
          )}
        </span>
      </div>
      {searchOpen && search && <SearchField search={search} onClose={closeSearch} />}
      {/* Every control's button, laid out unseen, so the row can tell what fits. */}
      <div className="sv-bar__measure" ref={measure} aria-hidden="true" inert>
        {lead && <div data-measure="lead" className="sv-bar__item">{lead}</div>}
        {items.map(item => (
          <button key={item.key} type="button" data-measure={item.key} className="sv-bar__button"><Face item={item} /><Caret /></button>
        ))}
        <button type="button" data-measure="more" className="sv-bar__button">More<span className="sv-bar__badge">0</span><Caret /></button>
        <button type="button" data-measure="search" className="sv-bar__button sv-bar__icon"><SearchIcon /></button>
      </div>
    </div>
  );
}

function SearchField({ search, onClose }: { search: BarSearch; onClose: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  return (
    <div className="sv-bar__search">
      <SearchIcon />
      <input
        ref={input}
        type="search"
        aria-label={search.placeholder}
        placeholder={search.placeholder}
        value={search.value}
        onChange={event => search.onChange(event.target.value)}
        onKeyDown={event => event.key === 'Escape' && onClose()}
      />
      <button type="button" className="sv-bar__close" aria-label="Close search" onClick={onClose}>✕</button>
    </div>
  );
}

/** A button's face: "Speaker: All", the setting cut short when long; or the setting alone, kept whole. */
function Face({ item }: { item: BarItem }) {
  if (item.hideLabel) return <>{item.summary}</>;
  return (
    <>
      <span className="sv-bar__face-label">{item.label}:</span> <span className="sv-bar__summary">{item.summary}</span>
    </>
  );
}

function Caret() {
  return <span className="sv-bar__caret" aria-hidden="true">▾</span>;
}

function SearchIcon() {
  return (
    <svg className="sv-bar__search-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.4 10.4 14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

type PopProps = {
  /** Reads the button out in full ("Show as: Registered sponsors"), as its face may give only the setting. */
  name: string;
  face: ReactNode;
  children: ReactNode;
  active?: boolean;
  single?: boolean;
  align?: 'start' | 'end';
};

/** A button and the pop-up it opens, in the top layer so no scrolling box clips it. */
function Pop({ name, face, children, active, single, align = 'start' }: PopProps) {
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = pop.current;
    if (!panel) return;
    const place = (event: ToggleEvent) => {
      if (event.newState !== 'open' || !button.current) return;
      const at = button.current.getBoundingClientRect();
      const width = panel.offsetWidth;
      const left = align === 'end' ? at.right - width : at.left;
      panel.style.top = `${at.bottom + 6}px`;
      panel.style.left = `${Math.max(8, Math.min(left, innerWidth - width - 8))}px`;
    };
    const close = (event: Event) => {
      if (event.target instanceof Node && panel.contains(event.target)) return;
      if (panel.matches(':popover-open')) panel.hidePopover();
    };
    panel.addEventListener('toggle', place);
    addEventListener('scroll', close, true);
    return () => {
      panel.removeEventListener('toggle', place);
      removeEventListener('scroll', close, true);
    };
  }, [align]);
  return (
    <>
      <button type="button" ref={button} className="sv-bar__button" aria-label={name} popoverTarget={id} data-active={active || undefined}>
        {face}
        <Caret />
      </button>
      <div
        popover="auto"
        id={id}
        ref={pop}
        className="sv-bar__pop"
        onClick={single ? event => event.target instanceof Element && event.target.closest('.sv-control__option') && pop.current?.hidePopover() : undefined}
      >
        {children}
      </div>
    </>
  );
}

/** A multi-select filter's setting in a few words. */
export function chipsSummary(selected: ReadonlySet<string>, labelOf: (value: string) => string = v => v): string {
  if (selected.size === 0) return 'All';
  if (selected.size === 1) return labelOf([...selected][0]);
  return `${selected.size} selected`;
}
