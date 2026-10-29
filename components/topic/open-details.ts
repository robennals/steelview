/**
 * Shared by every script that opens a disclosure because a link named it:
 * HashSync on topic pages, and DetailsTarget inside an event strip.
 */

// `decodeURIComponent` throws `URIError` on a malformed escape (e.g. a hash
// ending `#%zz`). A page whose premise is that it works without JavaScript
// must not be destroyed *by* its JavaScript — an uncaught throw here, with no
// app/error.tsx, would replace already-delivered static HTML with Next's
// default error boundary. Fall back to the raw hash, which is a safe no-op
// for `getElementById` if it doesn't match a real id.
export function decodeHash(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Open `el` and every `<details>` containing it.
 *
 * The Facts section collapses everything past the first few into a
 * <details> group, so the target may sit inside one or more closed
 * ancestors. Opening only the target would leave a link into the collapsed
 * group scrolling to something the reader cannot see, so open the whole chain
 * outwards. Outermost first, so the target's own position is settled before
 * anything measures it.
 */
export function openDetails(el: HTMLDetailsElement): void {
  const chain: HTMLDetailsElement[] = [el];
  let ancestor: Element | null | undefined = el.parentElement?.closest('details');
  while (ancestor instanceof HTMLDetailsElement) {
    chain.push(ancestor);
    ancestor = ancestor.parentElement?.closest('details');
  }
  for (const details of chain.reverse()) details.open = true;
}
