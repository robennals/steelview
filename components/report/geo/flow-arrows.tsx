import { centroidOf, type Projection } from './project';
import type { GeoRegion } from './types';

/** A point an arrow passes through or ends at: "Northern France". */
export type MapPlace = { label: string; lon: number; lat: number };

/**
 * Arrows that converge: one from each area or place in `from`, through the `via`
 * places in turn, to `to`. Where they meet they become one arrow, so the
 * shared stretch is drawn once.
 */
export type MapFlows = {
  /** What the arrows show: "Route to the UK". */
  label: string;
  /**
   * Where each arrow starts: an area, with what sets its thickness (on a
   * numeric map, the area's value), or a named place, such as a stretch of coast.
   */
  from: ({ regionId: string; weight?: number } | { place: MapPlace })[];
  via: MapPlace[];
  to: MapPlace;
};

const MAX_WIDTH = 5;
const MIN_WIDTH = 1.2;
/** How far a branch bows from a straight line, as a share of its length: enough to read as a journey, not a ruler. */
const BOW = 0.18;

type Point = [number, number];

/** A gentle curve from `a` to `b`, bowing to the left of the direction of travel. */
function curve([ax, ay]: Point, [bx, by]: Point): string {
  const [dx, dy] = [bx - ax, by - ay];
  const [cx, cy] = [(ax + bx) / 2 - dy * BOW, (ay + by) / 2 + dx * BOW];
  return `M${ax.toFixed(1)},${ay.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
}

/** The sentence a screen reader hears for the arrows, which are drawn hidden from it. */
export function flowSentence(flows: MapFlows, regions: GeoRegion[]): string {
  const names = flows.from.map(f => ('place' in f ? f.place.label : regions.find(r => r.id === f.regionId)?.name ?? f.regionId));
  const through = flows.via.length > 0 ? ` through ${flows.via.map(p => p.label).join(', then ')}` : '';
  return `${flows.label}: arrows from ${names.join(', ')}${through} to ${flows.to.label}.`;
}

/**
 * The arrows, in the projected drawing. Each branch is as thick as its area's
 * weight against the heaviest, by square root so a small one still shows; the
 * shared stretch is as thick as the heaviest. The places they start from,
 * pass through and end at are named. Decoration for a screen reader, which hears `flowSentence` instead.
 */
export function FlowArrows({ flows, regions, projection, idPrefix }: { flows: MapFlows; regions: GeoRegion[]; projection: Projection; idPrefix: string }) {
  const headId = `${idPrefix}-flow-head`;
  const max = Math.max(0, ...flows.from.map(f => ('weight' in f ? f.weight ?? 0 : 0)));
  const widthOf = (weight?: number) => (max === 0 || weight === undefined ? (MIN_WIDTH + MAX_WIDTH) / 2 : MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * Math.sqrt(weight / max));
  const stops = [...flows.via, flows.to].map(place => projection.project([place.lon, place.lat]));
  const [meet] = stops;
  // The shared stretch, place to place; with no `via` each branch is a whole arrow.
  const trunk = stops.slice(1).map((point, i) => curve(stops[i], point));
  /** Each arrow from its start; a start that is a place carries its name, to print there. */
  type Branch = { id: string; d: string; width: number; named?: { at: Point; label: string } };
  const branches = flows.from.flatMap((start): Branch[] => {
    if ('place' in start) {
      const at = projection.project([start.place.lon, start.place.lat]);
      return [{ id: start.place.label, d: curve(at, meet), width: widthOf(undefined), named: { at, label: start.place.label } }];
    }
    const region = regions.find(r => r.id === start.regionId);
    return region ? [{ id: start.regionId, d: curve(projection.project(centroidOf(region)), meet), width: widthOf(start.weight) }] : [];
  });
  const ends = flows.via.length === 0;
  const arrow = (d: string, width: number, key: string, head: boolean) => (
    <g key={key}>
      <path className="sv-geo-map__flow-halo" d={d} style={{ strokeWidth: width + 2.5 }} />
      <path className="sv-geo-map__flow" d={d} style={{ strokeWidth: width }} markerEnd={head ? `url(#${headId})` : undefined} />
    </g>
  );
  return (
    <g className="sv-geo-map__flows" aria-hidden="true">
      <defs>
        <marker id={headId} className="sv-geo-map__flow-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" />
        </marker>
      </defs>
      {branches.map(b => arrow(b.d, b.width, b.id, ends))}
      {trunk.map((d, i) => arrow(d, MAX_WIDTH, `trunk-${i}`, i === trunk.length - 1))}
      {/* A place an arrow starts from is named at its start; an area names itself. */}
      {branches.flatMap(({ id, named }) => (named ? [<text key={`from-${id}`} className="sv-geo-map__flow-label" x={named.at[0]} y={named.at[1]} dx={6} dy={4}>{named.label}</text>] : []))}
      {flows.via.map((place, i) => (
        <text key={place.label} className="sv-geo-map__flow-label" x={stops[i][0]} y={stops[i][1]} dx={-6} dy={12} textAnchor="end">{place.label}</text>
      ))}
      <text className="sv-geo-map__flow-label" x={stops[stops.length - 1][0]} y={stops[stops.length - 1][1]} dx={-6} dy={-6} textAnchor="end">{flows.to.label}</text>
    </g>
  );
}
