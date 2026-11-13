import { MarkerCardPlacement } from './marker-card-placement';
import { SourceLine } from './figure';
import { formatDate } from './format';
import { toYear } from './time-axis';
import type { PartialDate, SourceCredit } from './types';

/**
 * `event` is something that happened in the world; `method` is a change in how
 * the data was measured. They are shown the same way and must never be
 * mistaken for each other, so each has its own colour, shape and name.
 */
export type MarkerKind = 'event' | 'method';

export type MarkerEvent = {
  date: PartialDate;
  label: string;
  description?: string;
  /** The citations that date it, listed in its card. */
  sources?: SourceCredit[];
  href?: string;
  kind?: MarkerKind;
};

/** A marker with its number: one sequence, in date order, across both kinds. */
export type NumberedMarker = { event: MarkerEvent; number: number };

/**
 * Markers close enough to collide, drawn as one marker that opens a choice
 * between them. Most groups hold one marker.
 */
export type MarkerGroup = { members: NumberedMarker[]; center: number };

/** A group placed on one drawing of a chart, in percent of the lane's width. */
export type PlacedGroup = {
  members: NumberedMarker[];
  left: number;
  /** Where each member's own dotted line meets the lane. */
  lines: number[];
};

const KIND_NAME: Record<MarkerKind, string> = { event: 'Event', method: 'Measurement change' };
const kindOf = (m: NumberedMarker): MarkerKind => m.event.kind ?? 'event';

/** Number markers in date order, whichever kind each is. */
export function numberMarkers(events: MarkerEvent[]): NumberedMarker[] {
  return [...events]
    .sort((a, b) => toYear(a.date) - toYear(b.date))
    .map((event, i) => ({ event, number: i + 1 }));
}

/** "4", or "2–3" for a group: its numbers run on, since it is a stretch of the date order. */
export function groupLabel(members: NumberedMarker[]): string {
  const first = members[0].number;
  const last = members[members.length - 1].number;
  return first === last ? String(first) : `${first}–${last}`;
}

/** A group's kind, or `mixed` when it holds both, which it shows by carrying both colours. */
export function groupKind(members: NumberedMarker[]): MarkerKind | 'mixed' {
  const kinds = new Set(members.map(kindOf));
  return kinds.size === 1 ? [...kinds][0] : 'mixed';
}

/**
 * Join markers that would overlap into groups. A group's marker sits midway
 * along its members, moved in from an edge until it fits, and widens as its
 * label grows ("2–3"); any two that would still touch become one, until none
 * do. So the lane never needs a second row however many events cluster at
 * one date.
 *
 * Positions and sizes are in any one unit: a drawing's own, or percent.
 */
export function groupMarkers(markers: NumberedMarker[], positions: number[], { disc, perDigit, within }: { disc: number; perDigit: number; within: [number, number] }): MarkerGroup[] {
  const width = (members: NumberedMarker[]) => disc + perDigit * (groupLabel(members).length - 1);
  const place = ({ members, from, to }: { members: NumberedMarker[]; from: number; to: number }) => {
    const half = width(members) / 2;
    return { members, center: Math.min(Math.max((from + to) / 2, within[0] + half), within[1] - half), half };
  };
  const groups = markers.map((marker, i) => ({ members: [marker], from: positions[i], to: positions[i] }));
  for (let i = 0; i < groups.length - 1;) {
    const [a, b] = [place(groups[i]), place(groups[i + 1])];
    if (a.center + a.half > b.center - b.half) {
      groups.splice(i, 2, { members: [...groups[i].members, ...groups[i + 1].members], from: groups[i].from, to: groups[i + 1].to });
      // The wider group may now reach the one before it.
      i = Math.max(0, i - 1);
    } else {
      i += 1;
    }
  }
  return groups.map(g => {
    const { members, center } = place(g);
    return { members, center };
  });
}

/** The card a group's marker opens: the marker's own card, or the choice between a group's. */
const cardId = (cardsId: string, members: NumberedMarker[]) => `${cardsId}-${groupLabel(members).replace('–', '-')}`;
const percent = (n: number) => `${Math.round(n * 1000) / 1000}%`;

/** "Jun 2013: New survey", naming a measurement change as one. */
function markerName({ event }: NumberedMarker): string {
  return `${event.kind === 'method' ? `${KIND_NAME.method}, ` : ''}${formatDate(event.date)}: ${event.label}`;
}

/**
 * The numbered markers under a chart, each hanging from the dotted line that
 * runs up through the plot at its date. A marker opens its card as a popover,
 * which the browser handles with no script: it never scrolls the page, and
 * opening one closes any other. Markers that would collide are one marker,
 * "2–3", whose card offers a choice between them.
 *
 * It marks when things happened and nothing more: a marker beside a turn in
 * the line is an invitation to look, not a claim that one caused the other.
 */
export function MarkerLane({ groups, cardsId, interactive = true }: {
  groups: PlacedGroup[];
  cardsId: string;
  /** Off in a preview, which has no cards: each marker then names its events itself. */
  interactive?: boolean;
}) {
  return (
    <div className="sv-markers">
      {/* Stems first, markers after: a group's stems meet it from under its own lines. */}
      {groups.flatMap(({ members, lines }) => members.map((m, i) => (
        <span key={`stem-${m.number}`} className="sv-markers__stem" data-kind={m.event.kind} data-marker-line={m.number} aria-hidden="true" style={{ left: percent(lines[i]) }} />
      )))}
      {groups.map(({ members, left }) => {
        const label = groupLabel(members);
        const name = members.length === 1
          ? `${label}. ${markerName(members[0])}`
          : `${label}: ${members.length} marked close together. ${members.map(m => `${m.number}. ${markerName(m)}`).join('; ')}`;
        const props = { className: 'sv-markers__marker', 'data-kind': groupKind(members), 'data-marker-line': members.map(m => m.number).join(' '), style: { left: percent(left) } };
        return interactive ? (
          <button key={label} type="button" {...props} popoverTarget={cardId(cardsId, members)} aria-haspopup="dialog" aria-label={name}>
            <span aria-hidden="true">{label}</span>
          </button>
        ) : (
          <span key={label} {...props} role="img" aria-label={name}>
            <span aria-hidden="true">{label}</span>
          </span>
        );
      })}
    </div>
  );
}

/** The number, kind and date over an item, and its label. */
function MarkerHead({ marker }: { marker: NumberedMarker }) {
  const { event, number } = marker;
  return <>
    <span className="sv-marker-card__meta">
      <span className="sv-marker-card__number" data-kind={kindOf(marker)} aria-hidden="true">{number}</span>
      <span className="sv-marker-card__kind" data-kind={kindOf(marker)}>{KIND_NAME[kindOf(marker)]}</span>
      <time dateTime={event.date}>{formatDate(event.date)}</time>
    </span>
    <span className="sv-marker-card__label">{event.label}</span>
  </>;
}

/** What an item says beyond its label. */
function MarkerBody({ event }: { event: MarkerEvent }) {
  return <>
    {event.description && <p className="sv-marker-card__desc">{event.description}</p>}
    {event.sources && event.sources.length > 0 && <SourceLine sources={event.sources} />}
    {event.href && <p className="sv-marker-card__link"><a href={event.href}>See the evidence</a></p>}
  </>;
}

/**
 * What the markers open, closed until a number is chosen: a card for each
 * marker, and for each group a card listing its markers, of which the reader
 * opens one at a time. Every drawing of a chart can group differently, so
 * `groups` holds each group any of them draws.
 *
 * With JavaScript a card sits beside its marker; without, the browser still
 * opens it, in the middle of the window. In print each marker's card is listed.
 */
export function MarkerCards({ markers, groups, cardsId }: { markers: NumberedMarker[]; groups: NumberedMarker[][]; cardsId: string }) {
  if (markers.length === 0) return null;
  const choices = [...new Map(groups.filter(g => g.length > 1).map(g => [cardId(cardsId, g), g])).entries()];
  return (
    <div className="sv-marker-cards">
      {markers.map(marker => {
        const id = cardId(cardsId, [marker]);
        return (
          <div key={id} id={id} popover="auto" role="dialog" aria-label={`${KIND_NAME[kindOf(marker)]}: ${marker.event.label}`} className="sv-marker-card" data-kind={kindOf(marker)} data-marker={marker.number}>
            <p className="sv-marker-card__head"><MarkerHead marker={marker} /></p>
            <MarkerBody event={marker.event} />
            <button type="button" className="sv-marker-card__close" popoverTarget={id} popoverTargetAction="hide" aria-label="Close">×</button>
          </div>
        );
      })}
      {choices.map(([id, members]) => (
        <div key={id} id={id} popover="auto" role="dialog" aria-label={`${members.length} marked close together`} className="sv-marker-card" data-kind={groupKind(members)} data-marker={members.map(m => m.number).join(' ')} data-group="">
          <p className="sv-marker-card__prompt">{members.length} marked close together. Choose one:</p>
          {/* One open at a time, like the cards themselves: the browser keeps a named set exclusive. */}
          {members.map(marker => (
            <details key={marker.number} name={id} className="sv-marker-choice" data-marker={marker.number}>
              <summary className="sv-marker-card__head"><MarkerHead marker={marker} /></summary>
              <div className="sv-marker-choice__body"><MarkerBody event={marker.event} /></div>
            </details>
          ))}
          <button type="button" className="sv-marker-card__close" popoverTarget={id} popoverTargetAction="hide" aria-label="Close">×</button>
        </div>
      ))}
      <MarkerCardPlacement />
    </div>
  );
}

/** Says what the two kinds of marker are, naming only the kinds this chart has. */
export function MarkerKey({ markers }: { markers: NumberedMarker[] }) {
  const has = (kind: MarkerKind) => markers.some(m => kindOf(m) === kind);
  if (markers.length === 0) return null;
  return (
    <p className="sv-marker-key">
      {has('event') && <span className="sv-marker-key__item"><i className="sv-marker-key__swatch" data-kind="event" aria-hidden="true" />Events</span>}
      {has('method') && <span className="sv-marker-key__item"><i className="sv-marker-key__swatch" data-kind="method" aria-hidden="true" />Measurement changes</span>}
      <span>Choose a number to read about it.</span>
    </p>
  );
}
