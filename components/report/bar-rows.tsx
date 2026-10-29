import { Fragment, type ReactNode } from 'react';
import { tickLabels, type BarScale, type Span } from './bar-layout';
import { QUALIFICATION_KEY, type Qualification } from './qualified';
import { COMPACT_PREVIEW_ITEMS } from './ranked-columns';
import type { ValueFormat } from './types';

/**
 * The rows of a horizontal bar figure, shared by BarChart and SliceExplorer
 * so a ranked list and a sliced one read identically.
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

export type BarRowData = {
  key: string;
  label: ReactNode;
  /** The formatted figure shown at the end of the row. */
  valueText: string;
  highlight?: boolean;
  segments: BarSegment[];
};

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
  /** 'grouped' draws each segment as its own thin bar from zero, one under another. */
  layout?: 'single' | 'stacked' | 'grouped';
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
  const valueWidth = Math.max(3, ...rows.map(row => row.valueText.length)) + 1;
  // The label column likewise shrinks to fit short labels ("2019") and caps
  // at 30% for long ones, which wrap rather than squeeze the bars.
  const labelWidth = Math.max(4, ...rows.map(row => String(row.label).length)) + 1;
  const style = { '--sv-bars-value': `${valueWidth}ch`, '--sv-bars-label': `minmax(0, min(30%, ${labelWidth}ch))` };

  return (
    <div className="sv-bars" data-layout={layout} data-dense={rows.length > 12 || undefined} data-preview={preview || undefined} data-compact={(preview && rows.length > COMPACT_PREVIEW_ITEMS) || undefined} style={style}>
      <ol className="sv-bars__rows" aria-label={label}>
        {rows.map(row => (
          <li key={row.key} className="sv-bars__row" data-highlight={row.highlight || undefined}>
            <span className="sv-bars__label">{row.label}</span>
            <span className="sv-bars__value">{row.valueText}</span>
            <span
              className="sv-bars__track"
              aria-hidden="true"
              style={layout === 'grouped' ? { '--sv-bars-count': row.segments.length } : undefined}
            >
              {row.segments.map((segment, i) => (
                <Fragment key={i}>
                  {/* A zero-width bar still carries its end mark: "fewer than 1" must not vanish. */}
                  {(segment.width > 0 || (segment.qualification && segment.qualification !== 'exact')) && (
                    <span
                      className="sv-bars__bar"
                      data-qualification={segment.qualification === 'exact' ? undefined : segment.qualification}
                      data-negative={segment.negative || undefined}
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
          </li>
        ))}
      </ol>
      {!preview && <div className="sv-bars__axis" aria-hidden="true">
        <span className="sv-bars__ticks">
          {tickLabels(scale.ticks, format).map((tick, i, all) =>
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

/**
 * The key to the end marks a qualified bar can carry — only those that
 * appear — each drawn as a small bar with the same classes as the rows, so
 * the key and the chart cannot disagree.
 */
export function BarQualificationKey({ qualifications }: { qualifications: Array<Exclude<Qualification, 'exact'>> }) {
  if (qualifications.length === 0) return null;
  return (
    <ul className="sv-bars__qualification-key">
      {qualifications.map(qualification => (
        <li key={qualification}>
          <span className="sv-bars__key-track" aria-hidden="true">
            <span className="sv-bars__bar" data-qualification={qualification} style={{ left: 0, width: qualification === 'range' ? '45%' : '70%' }} />
            {qualification === 'range' && <span className="sv-bars__whisker" style={{ left: '45%', width: '40%' }} />}
          </span>
          {sentenceCase(QUALIFICATION_KEY[qualification])}
        </li>
      ))}
    </ul>
  );
}

function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Swatch + name for each split value. Identity never rests on colour alone: the table view names every cell. */
export function BarLegend({ items }: { items: Array<{ key: string; label: string; color: string }> }) {
  return (
    <ul className="sv-chart__legend sv-data__legend">
      {items.map(item => (
        <li key={item.key} className="sv-chart__key sv-bars__key">
          <i className="sv-bars__swatch" style={{ background: item.color }} aria-hidden="true" />
          <span className="sv-chart__key-name">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
