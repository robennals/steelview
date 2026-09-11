import type { FactPageData } from './fact-page';

export type FactPreview = Omit<FactPageData, 'topic'>;
const pending = new Map<string, Promise<FactPreview>>();
const loaded = new Map<string, FactPreview>();

export function cachedFact(href: string) {
  return loaded.get(href);
}

/** Deduplicate hover, background prefetch and clicks; keep results for rapid reopening. */
export function prefetchFact(href: string): Promise<FactPreview> {
  const existing = pending.get(href);
  if (existing) return existing;
  const request = fetch(`/api${href}`)
    .then(async (response) => {
      if (!response.ok) throw new Error('Unable to load fact');
      const data: FactPreview = await response.json();
      loaded.set(href, data);
      return data;
    })
    .catch((error) => {
      pending.delete(href);
      throw error;
    });
  pending.set(href, request);
  return request;
}
