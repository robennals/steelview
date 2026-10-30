'use client';

import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { decodeHash } from './open-details';

type Tab = { id: string; label: string };

const ActiveTab = createContext('');

/** The tab the URL hash names: a tab's own id, or anything inside its panel. An unknown hash names none. */
function tabForHash(tabs: Tab[]): string | null {
  const id = decodeHash(location.hash.slice(1));
  if (!id) return tabs[0]?.id ?? null;
  if (tabs.some(tab => tab.id === id)) return id;
  return document.getElementById(id)?.closest<HTMLElement>('.sv-topic-panel')?.dataset.tab ?? null;
}

type TopicTabsProps = {
  /** The topic's own address: a hash on any other is not this page's. */
  path: string;
  tabs: Tab[];
  children: ReactNode;
};

/**
 * The topic page, one tab at a time. Every panel stays on the page and only the
 * chosen one shows, so a viewpoint can still lift a data panel into its sheet
 * from a closed tab, and a closed tab keeps its open rows. Without JavaScript
 * the panels simply follow each other (globals.css).
 *
 * The URL hash holds the tab, so Back returns to the last one, and a link to a
 * viewpoint brings up its tab. No element carries
 * a tab's id: arriving at a hash that names an element, the browser takes focus
 * off whatever a closing sheet just gave it back to.
 */
export function TopicTabs({ path, tabs, children }: TopicTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      if (location.pathname !== path) return;
      const tab = tabForHash(tabs);
      if (tab) setActive(tab);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [path, tabs]);

  // A link's target could not be scrolled to while its tab was closed, so whatever opens it hears again.
  useEffect(() => {
    if (document.getElementById(decodeHash(location.hash.slice(1)))?.closest('.sv-topic-panel')) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  }, [active]);

  const choose = (event: MouseEvent, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Keeps the router's state on the entry: Back through it would otherwise leave an open fact showing.
    history.pushState(history.state, '', `#${id}`);
    // Read from the top of the new tab, not partway down it. Animated, so it reads as the same page moving.
    const top = root.current?.getBoundingClientRect().top ?? 0;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (top < 0) window.scrollBy({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    setActive(id);
  };

  return (
    <div ref={root}>
      {tabs.length > 0 && (
        <nav className="sv-topic-tabs" aria-label="Sections of this topic">
          <ul role="list">
            {tabs.map(tab => (
              <li key={tab.id}>
                <a href={`#${tab.id}`} aria-current={tab.id === active || undefined} onClick={event => choose(event, tab.id)}>{tab.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <ActiveTab.Provider value={active}>{children}</ActiveTab.Provider>
    </div>
  );
}

export function TopicPanel({ id, children }: { id: string; children: ReactNode }) {
  const active = useContext(ActiveTab);
  return <div className="sv-topic-panel" data-tab={id} data-active={id === active || undefined}>{children}</div>;
}
