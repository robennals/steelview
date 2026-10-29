/**
 * Where each period's label goes on a PeriodTimeline row, decided on the
 * server from positions alone (percentages of the axis), so the graph needs
 * no measuring and a label never lands on a line of its own.
 *
 * Text widths assume the narrow rendering — a ~300px track, ~6.2px per
 * character at 11px — so a label placed for a phone also fits on a desktop.
 */

/** A bar on one row: its span along the axis, 0–100, and its label ('' for none). */
export type PeriodBar = { left: number; right: number; label: string };

/** `inside` its bar, just `right` of it, `omitted` from the graph for want of room, or `none` to place. */
export type LabelPlacement = 'inside' | 'right' | 'omitted' | 'none';

const TRACK_PX = 300;
const CHAR_PX = 6.2;

/** The share of the axis a label takes: its text plus `padding` pixels. */
function labelWidth(label: string, padding: number) {
  return ((label.length * CHAR_PX + padding) / TRACK_PX) * 100;
}

/**
 * Bars later in the list are drawn over earlier ones — stages such as
 * explore, pursue, acquire on one row overlap by design — so an earlier
 * bar's label can only use the part of it still showing: from its start to
 * the start of the next bar drawn over it. A start that is itself covered
 * leaves no room inside.
 */
function shownWidth(bars: PeriodBar[], i: number) {
  const bar = bars[i];
  const later = bars.slice(i + 1);
  if (later.some(other => other.left <= bar.left && other.right > bar.left)) return 0;
  const coveredFrom = Math.min(bar.right, ...later.filter(other => other.left > bar.left).map(other => other.left));
  return coveredFrom - bar.left;
}

/**
 * Each label goes inside its bar if it fits there; else immediately right
 * of the bar, if the bar's end is not drawn over, that stretch of the row
 * holds no bar and no other label, and it stays on the axis; else it is omitted, and the legend, the readout and
 * the table name the period instead.
 */
export function placePeriodLabels(bars: PeriodBar[]): LabelPlacement[] {
  const placedRight: Array<{ left: number; right: number }> = [];
  return bars.map((bar, i) => {
    if (bar.label === '') return 'none';
    if (shownWidth(bars, i) >= labelWidth(bar.label, 12)) return 'inside';
    const space = { left: bar.right, right: bar.right + labelWidth(bar.label, 8) };
    const overlaps = (other: { left: number; right: number }) => other.left < space.right && other.right > space.left;
    // A label beside a bar whose end is drawn over would sit beside the later bar instead, and name the wrong one.
    const endCovered = bars.slice(i + 1).some(other => other.left < bar.right && other.right >= bar.right);
    if (!endCovered && space.right <= 100 && !bars.some((other, j) => j !== i && overlaps(other)) && !placedRight.some(overlaps)) {
      placedRight.push(space);
      return 'right';
    }
    return 'omitted';
  });
}
