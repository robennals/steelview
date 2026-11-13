import type { GeoRegion, LonLat } from './types';

/**
 * Three deliberately small map projections, and a fit into a box.
 *
 * - **local**: equirectangular with longitude squeezed by the cosine of the
 *   centre latitude. At the scale of one country or region it is within a
 *   few per cent of a conformal projection, and a reader, or a test, can
 *   check it by hand.
 * - **equal-earth**: the Equal Earth projection (Šavrič, Patterson & Jenny,
 *   2018), for a continent. It is equal-area, so one large country does not
 *   out-shout the rest of a regional map.
 * - **mercator**: for the whole world. It keeps every country's shape, and
 *   gives Europe, where most of the countries a reader looks for sit, far more
 *   room than an equal-area world map does; the price is that high latitudes
 *   are drawn large. Latitudes past 85° are held at 85°, because the
 *   projection runs to infinity at the poles.
 *
 * `auto` picks local for anything up to about the size of Europe's core,
 * Equal Earth for a continent and Mercator for the whole world. No d3: the
 * formulas are a dozen lines.
 */

export type Bounds = { minLon: number; maxLon: number; minLat: number; maxLat: number };

export type ProjectionKind = 'local' | 'equal-earth' | 'mercator';

export type Projection = {
  /** [lon, lat] in degrees → [x, y] in the fitted box (y grows downward). */
  project: (point: LonLat) => [number, number];
  /** Pixels per degree of latitude near the centre — for sizing symbols consistently. */
  scale: number;
  /** The box the fitted extent actually occupies, for clipping to it. */
  frame: { x: number; y: number; width: number; height: number };
};

export type FitOptions = {
  width: number;
  height: number;
  /** Space kept clear on every side, in the same units as width/height. */
  padding?: number;
  /** Place the fitted map at this offset inside a larger drawing. */
  x?: number;
  y?: number;
  kind?: ProjectionKind | 'auto';
};

/** The bounding box of every point in every region, dots included. */
export function boundsOf(regions: GeoRegion[]): Bounds {
  const bounds = { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity };
  for (const region of regions) {
    const points = region.coordinates.flat(2);
    if (region.point) points.push(region.point);
    for (const [lon, lat] of points) {
      if (lon < bounds.minLon) bounds.minLon = lon;
      if (lon > bounds.maxLon) bounds.maxLon = lon;
      if (lat < bounds.minLat) bounds.minLat = lat;
      if (lat > bounds.maxLat) bounds.maxLat = lat;
    }
  }
  return bounds;
}

/** Local for a country or a compact region, Equal Earth once the extent is continental, Mercator once it spans the world. */
export function chooseProjection(bounds: Bounds): ProjectionKind {
  if (bounds.maxLon - bounds.minLon > 180) return 'mercator';
  return bounds.maxLon - bounds.minLon > 60 || bounds.maxLat - bounds.minLat > 45 ? 'equal-earth' : 'local';
}

const RADIANS = Math.PI / 180;
const [A1, A2, A3, A4] = [1.340264, -0.081106, 0.000893, 0.003796];
const M = Math.sqrt(3) / 2;
const MERCATOR_LIMIT = 85;

/** Equal Earth on the unit sphere: [λ, φ] in radians → [x, y] with y up. */
export function equalEarth(lambda: number, phi: number): [number, number] {
  const theta = Math.asin(M * Math.sin(phi));
  const t2 = theta * theta;
  const t6 = t2 * t2 * t2;
  const x = (lambda * Math.cos(theta)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, y];
}

/** Mercator's y on the unit sphere for a latitude in degrees, y up. */
export function mercatorY(lat: number): number {
  const held = Math.max(-MERCATOR_LIMIT, Math.min(MERCATOR_LIMIT, lat));
  return Math.log(Math.tan(Math.PI / 4 + (held * RADIANS) / 2));
}

/** The chosen projection, unscaled, with y up and the extent's centre meridian at x = 0. */
function rawProjection(kind: ProjectionKind, bounds: Bounds): (point: LonLat) => [number, number] {
  const centreLon = (bounds.minLon + bounds.maxLon) / 2;
  if (kind === 'equal-earth') return ([lon, lat]) => equalEarth((lon - centreLon) * RADIANS, lat * RADIANS);
  if (kind === 'mercator') return ([lon, lat]) => [(lon - centreLon) * RADIANS, mercatorY(lat)];
  const squeeze = Math.cos(((bounds.minLat + bounds.maxLat) / 2) * RADIANS);
  return ([lon, lat]) => [(lon - centreLon) * squeeze * RADIANS, lat * RADIANS];
}

/**
 * The projected extent of a lon/lat box. Equal Earth curves meridians, so
 * the box's edges are sampled rather than just its corners.
 */
function projectedExtent(raw: (point: LonLat) => [number, number], bounds: Bounds) {
  const xs: number[] = [];
  const ys: number[] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const lat = bounds.minLat + ((bounds.maxLat - bounds.minLat) * i) / steps;
    const lon = bounds.minLon + ((bounds.maxLon - bounds.minLon) * i) / steps;
    const edgePoints: LonLat[] = [[bounds.minLon, lat], [bounds.maxLon, lat], [lon, bounds.minLat], [lon, bounds.maxLat]];
    for (const point of edgePoints) {
      const [x, y] = raw(point);
      xs.push(x);
      ys.push(y);
    }
  }
  if (bounds.minLat < 0 && bounds.maxLat > 0) for (const lon of [bounds.minLon, bounds.maxLon]) xs.push(raw([lon, 0])[0]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/** Height ÷ width of an extent once projected — how tall a map of it should be drawn. */
export function aspectOf(bounds: Bounds, kind: ProjectionKind | 'auto' = 'auto'): number {
  const resolved = kind === 'auto' ? chooseProjection(bounds) : kind;
  const e = projectedExtent(rawProjection(resolved, bounds), bounds);
  return (e.maxY - e.minY) / (e.maxX - e.minX || 1);
}

/**
 * Fits the regions into a width×height box, centred, preserving aspect: the
 * map is never stretched to fill the box, because a stretched country is a
 * misdrawn one.
 */
export function fitProjection(regions: GeoRegion[], options: FitOptions): Projection {
  return fitBounds(boundsOf(regions), options);
}

export function fitBounds(bounds: Bounds, { width, height, padding = 0, x = 0, y = 0, kind = 'auto' }: FitOptions): Projection {
  const raw = rawProjection(kind === 'auto' ? chooseProjection(bounds) : kind, bounds);
  const e = projectedExtent(raw, bounds);
  const spanX = e.maxX - e.minX || 1;
  const spanY = e.maxY - e.minY || 1;
  const scale = Math.min((width - 2 * padding) / spanX, (height - 2 * padding) / spanY);
  const offsetX = x + (width - spanX * scale) / 2;
  const offsetY = y + (height - spanY * scale) / 2;
  return {
    scale: scale * RADIANS,
    frame: { x: offsetX, y: offsetY, width: spanX * scale, height: spanY * scale },
    project: point => {
      const [px, py] = raw(point);
      return [offsetX + (px - e.minX) * scale, offsetY + (e.maxY - py) * scale];
    },
  };
}

/**
 * Each ring cut to a lon/lat box (Sutherland–Hodgman), dropping rings that
 * fall wholly outside. A cropped map still clips its drawing to the frame;
 * this only keeps the page from carrying the part of Russia, or of North
 * Africa, that the crop would hide anyway. Pass a box a little larger than
 * the extent: the projected frame's corners reach past a curved edge.
 */
export function clipToBounds(coordinates: LonLat[][][], b: Bounds): LonLat[][][] {
  const edges: Array<{ inside: (p: LonLat) => boolean; cross: (a: LonLat, c: LonLat) => LonLat }> = [
    { inside: ([lon]) => lon >= b.minLon, cross: (a, c) => atLon(a, c, b.minLon) },
    { inside: ([lon]) => lon <= b.maxLon, cross: (a, c) => atLon(a, c, b.maxLon) },
    { inside: ([, lat]) => lat >= b.minLat, cross: (a, c) => atLat(a, c, b.minLat) },
    { inside: ([, lat]) => lat <= b.maxLat, cross: (a, c) => atLat(a, c, b.maxLat) },
  ];
  const clipRing = (ring: LonLat[]) =>
    edges.reduce((points, { inside, cross }) => {
      const out: LonLat[] = [];
      points.forEach((point, i) => {
        const previous = points[(i + points.length - 1) % points.length];
        if (inside(point)) {
          if (!inside(previous)) out.push(cross(previous, point));
          out.push(point);
        } else if (inside(previous)) out.push(cross(previous, point));
      });
      return out;
    }, ring);
  return coordinates.map(polygon => polygon.map(clipRing).filter(ring => ring.length >= 3)).filter(polygon => polygon.length > 0);
}

function atLon([x0, y0]: LonLat, [x1, y1]: LonLat, lon: number): LonLat {
  return [lon, y0 + ((y1 - y0) * (lon - x0)) / (x1 - x0)];
}

function atLat([x0, y0]: LonLat, [x1, y1]: LonLat, lat: number): LonLat {
  return [x0 + ((x1 - x0) * (lat - y0)) / (y1 - y0), lat];
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * A MultiPolygon as one SVG path. Holes are drawn as further subpaths and cut
 * out by `fill-rule: evenodd`, set on the path by the caller. A `tolerance`
 * thins each ring for a small drawing (see `thin`); rings that thin to
 * nothing are left out.
 */
export function pathFor(coordinates: LonLat[][][], projection: Projection, tolerance = 0): string {
  const parts: string[] = [];
  for (const polygon of coordinates) {
    for (const ring of polygon) {
      if (ring.length < 3) continue;
      const projected = ring.map(point => projection.project(point));
      const kept = tolerance > 0 ? thin(projected, tolerance) : projected;
      if (kept.length < 3) continue;
      parts.push(`M${kept.map(([px, py]) => `${round(px)},${round(py)}`).join('L')}Z`);
    }
  }
  return parts.join('');
}

/**
 * Drops each point closer than `tolerance` (in drawing units) to the last
 * point kept: at thumbnail size a coastline's thousand points collapse onto
 * a few dozen pixels, and drawing them all only bloats the markup.
 */
function thin(points: Array<[number, number]>, tolerance: number): Array<[number, number]> {
  const kept: Array<[number, number]> = [];
  for (const point of points) {
    const last = kept[kept.length - 1];
    if (!last || Math.hypot(point[0] - last[0], point[1] - last[1]) >= tolerance) kept.push(point);
  }
  return kept;
}

/**
 * The centre of a region's largest outline ring, by area: where a label or a
 * callout leader belongs. Area-weighted, so a coastline with many small
 * islands does not drag the point out to sea. An area drawn as a dot is
 * centred on its dot.
 */
export function centroidOf(region: GeoRegion): LonLat {
  if (region.point) return region.point;
  const best = largestRing(region);
  const a = signedArea(best);
  if (a === 0) return best[0] ?? [0, 0];
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < best.length; i++) {
    const [x0, y0] = best[i];
    const [x1, y1] = best[(i + 1) % best.length];
    const cross = x0 * y1 - x1 * y0;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  return [cx / (6 * a), cy / (6 * a)];
}

/** A region's largest outline by area: its mainland, not an island or a far-flung territory. */
function largestRing(region: GeoRegion): LonLat[] {
  let best: LonLat[] = [];
  let bestArea = 0;
  for (const polygon of region.coordinates) {
    const ring = polygon[0] ?? [];
    const area = Math.abs(signedArea(ring));
    if (area > bestArea) {
      bestArea = area;
      best = ring;
    }
  }
  return best;
}

/**
 * The box a click on this region zooms to, as "x y width height" in drawing
 * units: its mainland, so France does not take in French Guiana or the
 * United States Hawaii. An area with no outline is the point of its dot.
 */
export function focusBoxOf(region: GeoRegion, projection: Projection): string {
  const ring = largestRing(region);
  const points = (ring.length > 0 ? ring : [region.point ?? [0, 0]]).map(point => projection.project(point));
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const [x, y] = [Math.min(...xs), Math.min(...ys)];
  return [x, y, Math.max(...xs) - x, Math.max(...ys) - y].map(round).join(' ');
}

function signedArea(ring: LonLat[]): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % ring.length];
    sum += x0 * y1 - x1 * y0;
  }
  return sum / 2;
}
