'use client';

import { useEffect, useRef, useState } from 'react';
import { collectionVizzes, focusViz } from '@/lib/content/evidence-target';

type Tab = { id: string; label: string };

/**
 * Tabs across the top of a data collection read one visualization at a time.
 *
 * A link into a visualization (an observation, from a viewpoint's "Explore
 * this data") opens the collection showing only that visualization at full
 * size, with its own controls; these tabs move between the collection's other
 * visualizations, or back to the whole report. They appear only in that view,
 * and only with JavaScript: without it the report is always read whole.
 *
 * The tabs are read from the rendered collection rather than listed again
 * here, so they cannot fall out of step with what the report draws.
 */
export function VizTabs() {
  const ref = useRef<HTMLElement>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    const article = ref.current?.closest<HTMLElement>('.sv-factpage');
    if (!article) return;
    setTabs(collectionVizzes(article).map(el => ({ id: el.id, label: el.dataset.viz ?? '' })));
    const sync = () => {
      const id = article.getAttribute('data-focus');
      setFocus(id);
      // Keep the current tab in view in the row, which scrolls sideways.
      if (id) requestAnimationFrame(() => ref.current?.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(article, { attributes: true, attributeFilter: ['data-focus'] });
    return () => observer.disconnect();
  }, []);

  /** Show `id`, or with `null` the whole report, keeping the address in step without a new history entry. */
  const show = (id: string | null) => {
    const article = ref.current?.closest<HTMLElement>('.sv-factpage');
    if (!article) return;
    focusViz(article, id ? document.getElementById(id) : null);
    history.replaceState(history.state, '', id ? `#${id}` : location.pathname);
    const scroll = article.closest('.sv-modal__scroll');
    if (scroll) scroll.scrollTop = 0;
    else article.scrollIntoView({ block: 'start' });
  };

  return (
    <nav ref={ref} className="sv-viz-tabs" aria-label="Visualizations in this report" hidden={!focus}>
      <ul role="list">
        {tabs.map(tab => (
          <li key={tab.id}>
            <button type="button" aria-current={tab.id === focus || undefined} onClick={() => show(tab.id)}>{tab.label}</button>
          </li>
        ))}
        <li>
          <button type="button" className="sv-viz-tabs__all" onClick={() => show(null)}>Whole report</button>
        </li>
      </ul>
    </nav>
  );
}
