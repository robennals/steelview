/**
 * The evidence glyphs. One family of five marks, all built from the same
 * circle, distinguished by *shape* rather than by hue — so they survive
 * greyscale, colour blindness and a black-and-white printout.
 *
 * They are deliberately not a red/green traffic light: on a politics page a
 * red mark reads as a verdict on the politics rather than on the evidence.
 * Solid means the evidence is solid; hollow means it is not there.
 */
export type GlyphShape =
  /** filled disc — the evidence is solid */
  | 'solid'
  /** half-filled disc — two sides pushing against each other */
  | 'split'
  /** ring crossed by a bar — the evidence points the other way */
  | 'struck'
  /** chequered disc — true in parts, in ways that pull apart */
  | 'quartered'
  /** dashed ring — nothing firm to stand on */
  | 'open';

export function Glyph({ shape }: { shape: GlyphShape }) {
  return (
    <svg
      className="sv-glyph"
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      {shape === 'solid' && <circle cx="6" cy="6" r="5" fill="currentColor" stroke="none" />}

      {shape === 'split' && (
        <>
          <path d="M6 1 A5 5 0 0 0 6 11 Z" fill="currentColor" stroke="none" />
          <circle cx="6" cy="6" r="5" />
        </>
      )}

      {shape === 'struck' && (
        <>
          <circle cx="6" cy="6" r="5" />
          <path d="M2.5 6 H9.5" />
        </>
      )}

      {shape === 'quartered' && (
        <>
          <path d="M6 6 L6 1 A5 5 0 0 1 11 6 Z" fill="currentColor" stroke="none" />
          <path d="M6 6 L6 11 A5 5 0 0 1 1 6 Z" fill="currentColor" stroke="none" />
          <circle cx="6" cy="6" r="5" />
        </>
      )}

      {shape === 'open' && <circle cx="6" cy="6" r="5" strokeDasharray="2 2.1" />}
    </svg>
  );
}
