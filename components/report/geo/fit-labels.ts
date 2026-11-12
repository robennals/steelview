import { parseBox, type Box } from './zoom';

/**
 * Which names show, and at what size, worked out in the browser after every
 * zoom and resize: the server cannot know how wide a name is set. Kept apart
 * from MapReadout, which calls it, so the rules are in one place. A name too
 * big for its place is tried smaller before it gives way.
 *
 * - A tile shows its full name when the name fits inside it, wrapping between
 *   words but never breaking one, at full size or a smaller one; otherwise its
 *   code.
 * - A name on the real shapes is placed as a street map places it: the
 *   largest countries first, each name centred inside its country, and shown
 *   at the largest size that keeps clear of every name already placed. It may
 *   run past its country's edge, but not far: never more than twice the
 *   country's width, and never past the edge of what the zoom shows.
 */

/** The sizes a tile's name is tried at, largest first, as `data-label` values. */
const TILE_SIZES = ['name', 'name-small'];
/** The sizes a country's name is tried at, as `data-label` values and as a share of the largest (11px, 9px, 7.5px; see maps.css). */
const SHAPE_SIZES: Array<[string, number]> = [['large', 1], ['medium', 9 / 11], ['small', 7.5 / 11]];
/** How far a name may reach, as a multiple of its country's width. */
const MAX_REACH = 2;
/** The clear space kept between two names, in screen pixels. */
const NAME_GAP = 4;

function fitTileNames(root: Element) {
  // Every tile tries each size in one pass, written before any is read, so each pass costs one layout.
  let trying = [...root.querySelectorAll<HTMLElement>('.sv-tile-map__tile')];
  for (const size of TILE_SIZES) {
    for (const tile of trying) tile.dataset.label = size;
    trying = trying.filter(tile => {
      const name = tile.querySelector<HTMLElement>('.sv-tile-map__name');
      return !(name !== null && name.clientHeight > 0 && name.scrollWidth <= name.clientWidth && name.scrollHeight <= name.clientHeight);
    });
  }
  for (const tile of trying) delete tile.dataset.label;
}

const overlaps = (a: Box, b: Box, gap: number) =>
  a.x < b.x + b.width + gap && b.x < a.x + a.width + gap && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;

const inside = (inner: Box, outer: Box) =>
  inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;

function placeCountryNames(root: Element, scale: number, visible: Box) {
  const labels = [...root.querySelectorAll<SVGTextElement>('.sv-geo-map__label')];
  // Measured once at the largest size; a smaller size is the same box shrunk about its centre.
  for (const label of labels) label.dataset.label = SHAPE_SIZES[0][0];
  const candidates = labels.flatMap(label => {
    const area = root.querySelector<SVGPathElement>(`path.sv-geo-map__region[data-region="${label.dataset.labelFor}"]`);
    const box = label.getBBox();
    const centre = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2);
    if (!area?.dataset.focus || box.width === 0 || !area.isPointInFill(centre)) {
      delete label.dataset.label;
      return [];
    }
    const country = parseBox(area.dataset.focus);
    return [{ label, box, centre, country, size: country.width * country.height }];
  });

  const placed: Box[] = [];
  const gap = NAME_GAP / scale;
  for (const { label, box, centre, country } of candidates.sort((a, b) => b.size - a.size)) {
    const fit = SHAPE_SIZES.map(([name, share]) => {
      const [width, height] = [box.width * share, box.height * share];
      return { name, box: { x: centre.x - width / 2, y: centre.y - height / 2, width, height } };
    }).find(({ box: shrunk }) => shrunk.width <= country.width * MAX_REACH && inside(shrunk, visible) && !placed.some(other => overlaps(shrunk, other, gap)));
    if (fit) {
      label.dataset.label = fit.name;
      placed.push(fit.box);
    } else delete label.dataset.label;
  }
}

/** `visible` is the part of the drawing the zoom shows, in its own units. */
export function fitLabels(root: Element, scale: number, visible: Box) {
  fitTileNames(root);
  placeCountryNames(root, scale, visible);
}
