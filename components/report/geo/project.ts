import type { GeoRegion, LonLat } from './types';

/**
 * Two deliberately small map projections, and a fit into a box.
 *
 * - **local**: equirectangular with longitude squeezed by the cosine of the
 *   centre latitude. At the scale of one country or region it is within a
 *   few per cent of a conformal projection, and a reader, or a test, can
 *   check it by hand.
 * - **equal-earth**: the Equal Earth projection (Šavrič, Patterson & Jenny,
 *   2018), for continents and the world. It is equal-area, which is what a
 *   choropleth needs: on a Mercator map Russia and Canada out-shout every
 *   shaded country near the equator.
 *
 * `auto` picks local for anything up to about the size of Europe's core and
 * Equal Earth beyond. No d3: the formulas are a dozen lines.
 */

export type Bounds = { minLon: number; maxLon: number; minLat: number; maxLat: number };

export type ProjectionKind = 'local' | 'equal-earth';

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

/** The bounding box of every point in every region. */
export function boundsOf(regions: GeoRegion[]): Bounds {
  const bounds = { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity };
  for (const region of regions) {
    for (const polygon of region.coordinates) {
      for (const ring of polygon) {
        for (const [lon, lat] of ring) {
          if (lon < bounds.minLon) bounds.minLon = lon;
          if (lon > bounds.maxLon) bounds.maxLon = lon;
          if (lat < bounds.minLat) bounds.minLat = lat;
          if (lat > bounds.maxLat) bounds.maxLat = lat;
        }
      }
    }
  }
  return bounds;
}

/** Local for a country or a compact region; Equal Earth once the extent is continental. */
export function chooseProjection(bounds: Bounds): ProjectionKind {
  return bounds.maxLon - bounds.minLon > 60 || bounds.maxLat - bounds.minLat > 45 ? 'equal-earth' : 'local';
}

const RADIANS = Math.PI / 180;
const [A1, A2, A3, A4] = [1.340264, -0.081106, 0.000893, 0.003796];
const M = Math.sqrt(3) / 2;

/** Equal Earth on the unit sphere: [λ, φ] in radians → [x, y] with y up. */
export function equalEarth(lambda: number, phi: number): [number, number] {
  const theta = Math.asin(M * Math.sin(phi));
  const t2 = theta * theta;
  const t6 = t2 * t2 * t2;
  const x = (lambda * Math.cos(theta)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, y];
}

/** The chosen projection, unscaled, with y up and the extent's centre meridian at x = 0. */
function rawProjection(kind: ProjectionKind, bounds: Bounds): (point: LonLat) => [number, number] {
  const centreLon = (bounds.minLon + bounds.maxLon) / 2;
  if (kind === 'equal-earth') return ([lon, lat]) => equalEarth((lon - centreLon) * RADIANS, lat * RADIANS);
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

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * A MultiPolygon as one SVG path. Holes are drawn as further subpaths and cut
 * out by `fill-rule: evenodd`, set on the path by the caller.
 */
export function pathFor(coordinates: LonLat[][][], projection: Projection): string {
  const parts: string[] = [];
  for (const polygon of coordinates) {
    for (const ring of polygon) {
      if (ring.length < 3) continue;
      const points = ring.map(point => projection.project(point)).map(([px, py]) => `${round(px)},${round(py)}`);
      parts.push(`M${points.join('L')}Z`);
    }
  }
  return parts.join('');
}

/**
 * The centre of a region's largest outline ring, by area: where a label or a
 * callout leader belongs. Area-weighted, so a coastline with many small
 * islands does not drag the point out to sea.
 */
export function centroidOf(region: GeoRegion): LonLat {
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

function signedArea(ring: LonLat[]): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % ring.length];
    sum += x0 * y1 - x1 * y0;
  }
  return sum / 2;
}
