'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useParams, usePathname, useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { topicPath } from '@/lib/content/types';
import { SHEET_TITLE_ID } from '@/lib/modal/sheet-title';
import { FactModal } from './fact-modal';

type Pending = { href: string; title: string | null; wide: boolean };

/** The fact a plain click on `link` will open in the sheet, or null. */
function pendingFor(event: MouseEvent, factsPrefix: string): Pending | null {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('data-fact-expand') || link.hasAttribute('data-panel-link')) return null;
  if ((link.target && link.target !== '_self') || link.origin !== location.origin) return null;
  if (!link.pathname.startsWith(factsPrefix) || link.pathname === location.pathname) return null;
  // A row or chip names its fact; a citation's text is a phrase from the prose.
  const title = link.dataset.factId ? null
    : (link.querySelector('.sv-item__claim') ?? link).textContent;
  // A link into one chart or observation opens the wide sheet that shows it, so
  // the sheet starts at that size rather than growing when the fact arrives.
  const wide = link.hash.includes('--') && !link.hash.startsWith('#evidence-');
  return { href: link.pathname, title, wide };
}

/** Most facts arrive within a moment; only a slow one earns a loading message. */
const SLOW_MS = 2000;

/** The sheet's body until its fact arrives: the title, if the link named it. */
function PendingArticle({ title }: { title: string | null }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <article className="sv-factpage" data-variant="modal" aria-busy="true">
      {/* The dialog is labelled by this heading, so it needs a name even blank. */}
      <h2 className="sv-factpage__claim" id={SHEET_TITLE_ID} aria-label={title ? undefined : 'Loading data'}>{title}</h2>
      {slow && <p role="status">Loading data…</p>}
    </article>
  );
}

/**
 * The fact sheet over a topic: the `@modal` slot, opened the moment a fact
 * link is clicked rather than when its route has loaded.
 *
 * The route is still what the sheet shows — `@modal/(.)facts/[factId]`
 * intercepts the navigation, and while that segment is active its article
 * fills the sheet. But the navigation waits on the server whenever the fact
 * was not prefetched (a collapsed section, a slow connection, `next dev`), and
 * a sheet that appears only then feels broken. So a click opens the sheet at
 * once with the fact's title, and the article replaces it in the same dialog
 * when it arrives. A loading message appears only if that takes a while — a
 * flash of one on every quick open is noise.
 */
export function FactSheet({ modal }: { modal: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { slug } = useParams<{ slug: string }>();
  // The active fact's id while `@modal/(.)facts/[factId]` matches, else null.
  const routed = useSelectedLayoutSegment('modal') !== null;
  const [pending, setPending] = useState<Pending | null>(null);
  // Outlives `pending`: the sheet keeps its size when the fact replaces the placeholder.
  const [wide, setWide] = useState(false);
  // A fact closed before it arrived. Its navigation cannot be called off, so
  // when it lands the sheet stays hidden and history steps back over it.
  const [abandoned, setAbandoned] = useState<string | null>(null);

  // Once a fact route is showing, nothing is pending: following a link inside
  // the open sheet loads in place. Once it has gone, nothing is abandoned.
  const [seen, setSeen] = useState({ routed, pathname });
  if (seen.routed !== routed || seen.pathname !== pathname) {
    setSeen({ routed, pathname });
    if (routed) setPending(null);
    else setAbandoned(null);
  }

  const steppedBack = useRef<string | null>(null);
  useEffect(() => {
    if (!routed || abandoned !== pathname || steppedBack.current === abandoned) return;
    steppedBack.current = abandoned;
    router.back();
  }, [routed, abandoned, pathname, router]);
  useEffect(() => {
    if (!abandoned) steppedBack.current = null;
  }, [abandoned]);

  useEffect(() => {
    const factsPrefix = `${topicPath(slug)}/facts/`;
    const onClick = (event: MouseEvent) => {
      const next = pendingFor(event, factsPrefix);
      if (!next) return;
      setAbandoned(null);
      setPending(next);
      setWide(next.wide);
    };
    // Capture phase, before `next/link` and CiteNav start the navigation.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [slug]);

  // Each branch returns the same FactModal, so the dialog opened for a
  // pending fact is the one its article arrives in.
  if (routed && abandoned === pathname) return null;
  if (routed) {
    return <FactModal labelledBy={SHEET_TITLE_ID} href={pathname} wide={wide}>{modal}</FactModal>;
  }
  if (!pending) return null;
  return (
    <FactModal labelledBy={SHEET_TITLE_ID} href={pending.href} loading wide={wide}
      onClose={() => {
        setPending(null);
        setAbandoned(pending.href);
      }}>
      <PendingArticle key={pending.href} title={pending.title} />
    </FactModal>
  );
}
