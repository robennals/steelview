import { Fragment, type ReactNode } from 'react';
import { axisTickLabels, type BarScale, type Span } from './bar-layout';
import { QUALIFICATION_KEY, type Qualification } from './qualified';
import { COMPACT_PREVIEW_ITEMS } from './ranked-columns';
import { DetailRow, RowDetailHint } from './row-detail';
import type { ValueFormat } from './types';

/**
 * The rows of a horizontal bar figure, shared by BarChart, PairedBarChart
 * and SliceExplorer so a ranked list, a paired one and a sliced one read
 * identically.
 *
 * Plain HTML, not SVG: each row is a list item whose label and value are
 * real text (read in order by a screen reader, selectable, translatable),
 * and the bar itself is decoration sized in percentages, so the figure
 * reflows from a phone to a desktop column without measuring anything.
 * No hooks, so it renders on the server inside either a server or a client
 * component.
 */

export type BarSegment = Span & {
  /** Fill colour; defaults to the first series hue, or the accent when the row is highlighted. */
  color?: string;
  /** Spoken name of the segment, for the row's text equivalent. */
  name?: string;
  /**
   * The segment's series slot (1-based) when a row has several: it sets the
   * fill pattern of a bar and the shape of a dumbbell's dot, so series stay
   * apart in greyscale and to a reader who cannot tell the hues apart.
   */
  slot?: number;
  /**
   * How the source qualifies the value the segment ends at: a bound ends in
   * an open arrowhead pointing the way the true value lies, an approximation
   * in a dotted end, a range in a whisker (`whisker`). The row's printed
   * value says the same in words.
   */
  qualification?: Qualification;
  /** A range's span from `low` to `high`, drawn as a whisker beyond the bar. */
  whisker?: Span;
  /** The segment runs left of zero, so its value end is its left edge. */
  negative?: boolean;
};

/** One measure's figure in a row of several, printed on its own line with its series' mark. */
export type BarRowValue = {
  /** The series it belongs to, said to a screen reader before the figure. */
  name: string;
  slot: number;
  text: string;
  /** A dumbbell end's own label, such as its year, printed before the figure. */
  label?: string;
};

export type BarRowData = {
  key: string;
  label: ReactNode;
  /** The formatted figure shown at the end of the row. */
  valueText: string;
  /** For a row of several measures: one line per measure instead of `valueText`, in series order. */
  values?: BarRowValue[];
  highlight?: boolean;
  segments: BarSegment[];
  /** What the row's one-line label leaves out, behind the row's disclosure. Never drawn in a preview. */
  detail?: string;
};

export type BarLayout = 'single' | 'stacked' | 'grouped' | 'dumbbell';

export function BarRows({
  rows,
  scale,
  format,
  layout = 'single',
  label,
  preview = false,
}: {
  rows: BarRowData[];
  scale: BarScale;
  /** Used for the axis tick labels. */
  format?: ValueFormat;
  /**
   * 'grouped' draws each segment as its own thin bar from zero, one under
   * another; 'dumbbell' draws each segment's value end as a dot, the dots
   * joined by a line.
   */
  layout?: BarLayout;
  /** Accessible name of the list, e.g. the measure. */
  label: string;
  /**
   * A compact preview: rows spread to fill the slide, clamped to one-line
   * labels and thin bars when there are many, and no axis — every value is
   * printed on its row.
   */
  preview?: boolean;
}) {
  // The value column is sized to the longest figure in characters, so values
  // line up on their last digit without reserving room for numbers that
  // never appear.
  const textWidth = (row: BarRowData) => (row.values ? Math.max(...row.values.map(v => v.text.length + (v.label ? v.label.length + 1 : 0) + 2)) : row.valueText.length);
  const valueWidth = Math.max(3, ...rows.map(textWidth)) + 1;
  // The label column likewise shrinks to fit short labels ("2019") and caps
  // at 30% for long ones, which wrap rather than squeeze the bars.
  const labelWidth = Math.max(4, ...rows.map(row => String(row.label).length)) + 1;
  const style = { '--sv-bars-value': `${valueWidth}ch`, '--sv-bars-label': `minmax(0, min(30%, ${labelWidth}ch))` };
  // A row of paired bars takes the height of one bar per value.
  const bars = rows.reduce((sum, row) => sum + (row.values?.length ?? 1), 0);
  const dense = rows.length > 12;

  return (
    <div className="sv-bars" data-layout={layout} data-dense={dense || undefined} data-preview={preview || undefined} data-compact={(preview && bars > COMPACT_PREVIEW_ITEMS) || undefined} style={style}>
      {!preview && rows.some(row => row.detail) && <RowDetailHint />}
      <ol className="sv-bars__rows" aria-label={label}>
        {rows.map(row => {
          const cells = <BarRowCells row={row} scale={scale} layout={layout} />;
          return row.detail && !preview
            ? <li key={row.key}><DetailRow rowClass="sv-bars__row" highlight={row.highlight} summary={cells}>{row.detail}</DetailRow></li>
            : <li key={row.key} className="sv-bars__row" data-highlight={row.highlight || undefined}>{cells}</li>;
        })}
      </ol>
      {!preview && <div className="sv-bars__axis" aria-hidden="true">
        <span className="sv-bars__ticks">
          {axisTickLabels(scale.ticks, format, { dense }).map((tick, i, all) =>
            tick.label === null ? null : (
              <span
                key={tick.value}
                className="sv-bars__tick"
                data-edge={i === 0 ? 'start' : i === all.length - 1 ? 'end' : undefined}
                style={{ left: `${scale.x(tick.value)}%` }}
              >
                {tick.label}
              </span>
            ),
          )}
        </span>
      </div>}
    </div>
  );
}

/** A row's label, value and track, in a list item or a disclosure's summary alike. */
function BarRowCells({ row, scale, layout }: { row: BarRowData; scale: BarScale; layout: BarLayout }) {
  return (
    <>
      <span className="sv-bars__label">{row.label}</span>
      {row.values ? <StackedValues values={row.values} layout={layout} /> : <span className="sv-bars__value">{row.valueText}</span>}
      <span
        className="sv-bars__track"
        aria-hidden="true"
        style={layout === 'grouped' ? { '--sv-bars-count': row.segments.length } : undefined}
      >
        {layout === 'dumbbell' ? <Dumbbell segments={row.segments} /> : row.segments.map((segment, i) => (
          <Fragment key={i}>
            {/* A zero-width bar still carries its end mark: "fewer than 1" must not vanish. */}
            {(segment.width > 0 || (segment.qualification && segment.qualification !== 'exact')) && (
              <span
                className="sv-bars__bar"
                data-qualification={segment.qualification === 'exact' ? undefined : segment.qualification}
                data-negative={segment.negative || undefined}
                data-slot={segment.slot}
                style={{
                  left: `${segment.left}%`,
                  width: `${segment.width}%`,
                  ...(segment.color ? { '--sv-bar-fill': segment.color } : null),
                  ...(layout === 'grouped' ? { top: `${(i / row.segments.length) * 100}%`, height: `${100 / row.segments.length}%` } : null),
                }}
              />
            )}
            {segment.whisker && <span className="sv-bars__whisker" style={{ left: `${segment.whisker.left}%`, width: `${segment.whisker.width}%` }} />}
          </Fragment>
        ))}
        <span className="sv-bars__zero" style={{ left: `${scale.zero}%` }} />
      </span>
    </>
  );
}

/** Where a segment's value lies on the track: its right edge, or its left edge when it runs left of zero. */
function valueEnd(segment: BarSegment): number {
  return segment.negative ? segment.left : segment.left + segment.width;
}

/**
 * A dumbbell row: a dot at each segment's value, joined by a line. A range
 * is a capsule from low to high rather than a dot, since a dot at its
 * midpoint would claim a figure the source never gave; a bound or an
 * approximation marks its dot as a bar marks its end. A measure with no
 * figure has no segment, so the row shows one dot and no line.
 */
function Dumbbell({ segments }: { segments: BarSegment[] }) {
  const ends = segments.flatMap(segment => (segment.whisker ? [segment.whisker.left, segment.whisker.left + segment.whisker.width] : [valueEnd(segment)]));
  const from = Math.min(...ends);
  const to = Math.max(...ends);
  return (
    <>
      {ends.length > 1 && <span className="sv-bars__link" style={{ left: `${from}%`, width: `${to - from}%` }} />}
      {segments.map((segment, i) => (
        <span
          key={i}
          className="sv-bars__dot"
          data-slot={segment.slot}
          data-qualification={segment.qualification === 'exact' ? undefined : segment.qualification}
          data-negative={segment.negative || undefined}
          style={{
            left: `${segment.whisker ? segment.whisker.left : valueEnd(segment)}%`,
            ...(segment.whisker ? { width: `${segment.whisker.width}%` } : null),
            ...(segment.color ? { '--sv-bar-fill': segment.color } : null),
          }}
        />
      ))}
    </>
  );
}

/**
 * A row's figures for several measures, one per line in series order, each
 * after its series' mark — the bar swatch or the dumbbell dot — and its
 * series name for a screen reader, so a figure is never matched to its bar
 * by colour alone.
 */
function StackedValues({ values, layout }: { values: BarRowValue[]; layout: BarLayout }) {
  return (
    <span className="sv-bars__value" data-stacked>
      {values.map(value => (
        <span key={value.slot} className="sv-bars__value-line">
          <SeriesMark slot={value.slot} mark={layout === 'dumbbell' ? 'dot' : 'swatch'} />
          <span className="sv-visually-hidden">{value.name}: </span>
          {value.label && <span className="sv-bars__value-label">{value.label} </span>}
          {value.text}
        </span>
      ))}
    </span>
  );
}

/** A series' mark as a small icon: its bar swatch (fill and pattern) or its dumbbell dot, drawn with the rows' own classes. */
function SeriesMark({ slot, mark, color }: { slot: number; mark: 'swatch' | 'dot'; color?: string }) {
  const style = { '--sv-bar-fill': color ?? `var(--sv-series-${((slot - 1) % 8) + 1})` };
  return mark === 'dot'
    ? <i className="sv-bars__dot sv-bars__dot-icon" data-slot={slot} style={style} aria-hidden="true" />
    : <i className="sv-bars__swatch" data-slot={slot} style={{ ...style, background: 'var(--sv-bar-fill)' }} aria-hidden="true" />;
}

/**
 * The key to the end marks a qualified bar can carry — only those that
 * appear — each drawn as a small bar with the same classes as the rows, so
 * the key and the chart cannot disagree.
 */
export function BarQualificationKey({ qualifications, layout = 'single' }: { qualifications: Array<Exclude<Qualification, 'exact'>>; layout?: BarLayout }) {
  if (qualifications.length === 0) return null;
  return (
    <ul className="sv-bars__qualification-key">
      {qualifications.map(qualification => (
        <li key={qualification}>
          {layout === 'dumbbell' ? (
            <span className="sv-bars__key-track" aria-hidden="true">
              <span className="sv-bars__dot" data-qualification={qualification} style={qualification === 'range' ? { left: '20%', width: '50%' } : { left: '40%' }} />
            </span>
          ) : (
            <span className="sv-bars__key-track" aria-hidden="true">
              <span className="sv-bars__bar" data-qualification={qualification} style={{ left: 0, width: qualification === 'range' ? '45%' : '70%' }} />
              {qualification === 'range' && <span className="sv-bars__whisker" style={{ left: '45%', width: '40%' }} />}
            </span>
          )}
          {sentenceCase(QUALIFICATION_KEY[qualification])}
        </li>
      ))}
    </ul>
  );
}

function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Mark + name for each series or split value: the bar swatch, with the
 * slot's pattern, or the dumbbell dot. Identity never rests on colour
 * alone: the mark's pattern or shape differs, and the table view names
 * every cell.
 */
export function BarLegend({ items, mark = 'swatch' }: { items: Array<{ key: string; label: string; color: string; slot: number }>; mark?: 'swatch' | 'dot' }) {
  return (
    <ul className="sv-chart__legend sv-data__legend">
      {items.map(item => (
        <li key={item.key} className="sv-chart__key sv-bars__key">
          <SeriesMark slot={item.slot} mark={mark} color={item.color} />
          <span className="sv-chart__key-name">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
