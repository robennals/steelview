/**
 * The four marker shapes the map and timeline components use to tell
 * categories apart. Shape travels with colour so a category is still
 * identifiable in greyscale print and to a reader who cannot separate the
 * hues; each shape is sized to the same area as a circle of radius `r`, so no
 * category looks more important for being a square.
 */
export const MARKER_SHAPES = ['circle', 'square', 'diamond', 'triangle'] as const;
export type MarkerShapeName = (typeof MARKER_SHAPES)[number];

/** The shape for category slot `n` (1-based), cycling after four. */
export function shapeForSlot(slot: number): MarkerShapeName {
  return MARKER_SHAPES[(slot - 1) % MARKER_SHAPES.length];
}

const SQRT_PI = Math.sqrt(Math.PI);

/** One marker as an SVG element, centred on (cx, cy). */
export function MarkerShape({
  shape,
  cx,
  cy,
  r,
  className,
}: {
  shape: MarkerShapeName;
  cx: number;
  cy: number;
  r: number;
  className?: string;
}) {
  const round = (n: number) => Math.round(n * 100) / 100;
  if (shape === 'circle') return <circle className={className} cx={cx} cy={cy} r={r} />;
  if (shape === 'square') {
    const half = (r * SQRT_PI) / 2;
    return <rect className={className} x={round(cx - half)} y={round(cy - half)} width={round(half * 2)} height={round(half * 2)} />;
  }
  if (shape === 'diamond') {
    const d = (r * SQRT_PI) / Math.SQRT2;
    return <polygon className={className} points={[[cx, cy - d], [cx + d, cy], [cx, cy + d], [cx - d, cy]].map(p => p.map(round).join(',')).join(' ')} />;
  }
  // Equilateral triangle of the same area, its centroid on the point.
  const side = r * Math.sqrt((4 * Math.PI) / Math.sqrt(3));
  const height = (side * Math.sqrt(3)) / 2;
  return (
    <polygon
      className={className}
      points={[[cx, cy - (2 * height) / 3], [cx + side / 2, cy + height / 3], [cx - side / 2, cy + height / 3]].map(p => p.map(round).join(',')).join(' ')}
    />
  );
}

/** A marker as a small inline icon, for keys and list items set in text. */
export function MarkerIcon({ shape, className, filled = true }: { shape: MarkerShapeName; className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false" data-filled={filled}>
      <MarkerShape shape={shape} cx={8} cy={shape === 'triangle' ? 9 : 8} r={5.2} />
    </svg>
  );
}
