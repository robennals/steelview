'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { FactModal } from './fact-modal';
import { revealEvidence } from '@/lib/content/evidence-target';
import { lastTrigger } from './cite-nav';
import { FactArticle } from './fact-article';
import { cachedFact, prefetchFact } from '@/lib/content/fact-preview-cache';

type Preview = { href: string; id: string; claim: string };

function PreviewBody({ slug, preview }: { slug: string; preview: Preview }) {
  const [data, setData] = useState(() => cachedFact(preview.href));
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    prefetchFact(preview.href).then(
      (result) => { if (current) setData(result); },
      () => { if (current) setFailed(true); }
    );
    return () => { current = false; };
  }, [preview.href, attempt]);

  if (data) return <FactArticle {...data} slug={slug} variant="modal" headingId="sv-modal-title" />;
  return (
    <article className="sv-factpage" data-variant="modal" aria-busy={!failed}>
      <h2 className="sv-factpage__claim" id="sv-modal-title">{preview.claim}</h2>
      {failed ? (
        <p role="alert">Couldn’t load this data collection. <button type="button" onClick={() => {
          setFailed(false);
          setAttempt((value) => value + 1);
        }}>Try again</button></p>
      ) : <p role="status">Loading data…</p>}
    </article>
  );
}

/** Open locally; prefetch article data after the initial page has loaded. */
export function InstantFacts({ slug, previews, children }: {
  slug: string;
  previews: Preview[];
  children: ReactNode;
}) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const preview = previews.find(({ href }) => href === active?.split('#')[0]);

  useEffect(() => {
    const restore = () => {
      lastTrigger.el = triggerRef.current;
      setActive(previews.some(({ href }) => href === location.pathname) ? location.pathname + location.hash : null);
    };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [previews]);

  useEffect(() => {
    let cancelled = false;
    let next = 0;
    const worker = async () => {
      while (!cancelled && next < previews.length) {
        const { href } = previews[next++];
        try { await prefetchFact(href); } catch { /* Click or hover retries failures. */ }
      }
    };
    const start = () => { for (let i = 0; i < 3; i++) void worker(); };
    // Keep background data out of the initial document's critical request path.
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', start);
    };
  }, [previews]);

  const warm = (target: EventTarget) => {
    const link = target instanceof Element ? target.closest('a[href]') : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    const url = new URL(link.href);
    if (url.origin === location.origin && previews.some(({ href }) => href === url.pathname)) {
      void prefetchFact(url.pathname).catch(() => {});
    }
  };

  const close = useCallback(() => {
    setActive(null);
    window.history.back();
  }, []);

  const open = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    if (link.hasAttribute('download') || link.hasAttribute('data-fact-expand')) return;
    if (link.target && link.target !== '_self') return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.search) return;
    if (!previews.some(({ href }) => href === url.pathname)) return;

    event.preventDefault();
    event.stopPropagation();
    // Preserve the original topic trigger when following another fact in the sheet.
    if (!active) {
      triggerRef.current = link;
      lastTrigger.el = link;
    }
    // One history entry per sheet: following evidence keeps Close returning to the topic.
    if (active) window.history.replaceState(null, '', url.pathname + url.hash);
    else window.history.pushState(null, '', url.pathname + url.hash);
    setActive(url.pathname + url.hash);
    if (active === url.pathname + url.hash) {
      const dialog = link.closest<HTMLElement>('dialog');
      if (dialog) revealEvidence(dialog, url.hash);
    }
  };

  return (
    <div data-instant-facts onClickCapture={open}
      onPointerOver={(event) => warm(event.target)} onFocusCapture={(event) => warm(event.target)}>
      {children}
      {preview && (
        <FactModal labelledBy="sv-modal-title" href={active ?? preview.href} onClose={close}>
          <PreviewBody key={preview.href} slug={slug} preview={preview} />
        </FactModal>
      )}
    </div>
  );
}
