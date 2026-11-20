/**
 * Turn a data panel to the step `id` names or holds, at once, and return that
 * step. The panel's scroll position is what says which step is showing. A
 * source sits on every chart that cites it, so one the reader's chart cites
 * stays on that chart.
 */
export function showPanelStep(root: Element, id: string): HTMLElement | null {
  const target = CSS.escape(id);
  const slides = Array.from(root.querySelectorAll(`[data-observation="${target}"], [data-chart-anchor="${target}"], [data-source-id="${target}"], [id="${target}"]`))
    .flatMap(found => found.closest<HTMLElement>('.sv-walk__slide') ?? []);
  const strip = slides[0]?.parentElement;
  if (!strip) return null;
  const index = (slide: HTMLElement) => Array.from(strip.children).indexOf(slide);
  const showing = Math.round(strip.scrollLeft / strip.clientWidth);
  const slide = slides.find(candidate => index(candidate) === showing) ?? slides[0];
  strip.scrollLeft = index(slide) * strip.clientWidth;
  return slide;
}
