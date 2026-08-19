import type { FactStatus } from '@/lib/content/types';
import { Glyph, type GlyphShape } from './glyph';

const LABELS: Record<FactStatus, string> = {
  'well-supported': 'Well supported',
  contested: 'Contested',
  'not-supported': 'Not supported',
  complicated: 'Complicated',
  unknown: 'Unknown',
};

const SHAPES: Record<FactStatus, GlyphShape> = {
  'well-supported': 'solid',
  contested: 'split',
  'not-supported': 'struck',
  complicated: 'quartered',
  unknown: 'open',
};

/**
 * Status must never be carried by colour alone — a reader with any form of
 * colour blindness, or reading a printout, must get the same information.
 *
 * Four channels, in order of importance:
 *   1. the text label, always rendered;
 *   2. a geometric glyph, distinct in shape (see glyph.tsx);
 *   3. the weight of the label;
 *   4. the rule down the left edge of the row, whose *style* — solid, double,
 *      dashed, dotted, hairline — differs per status (see globals.css).
 * Colour never varies by hue, only in strength within one neutral ink.
 */
export function StatusBadge({ status }: { status: FactStatus }) {
  return (
    <span className="sv-status" data-status={status}>
      <Glyph shape={SHAPES[status]} />
      {LABELS[status]}
    </span>
  );
}
