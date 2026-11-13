/**
 * The arithmetic of zooming a map, kept apart from the DOM. A view is a scale
 * and the point at the centre of the frame, in the units of the drawing:
 * SVG user units for the real shapes, grid cells for the tiles.
 */

export type Box = { x: number; y: number; width: number; height: number };

export type ZoomView = { scale: number; cx: number; cy: number };

/** How far a drawing zooms. */
export type ZoomLimits = {
  /** The deepest scale the buttons and clicks reach. */
  max: number;
  /** What one press of Zoom in or Zoom out multiplies the scale by. */
  step: number;
  /** The least a click zooms in: on a large area it still has to, or the click would seem to do nothing. */
  minFocus: number;
  /** The most a click zooms in. */
  maxFocus: number;
  /** The scale from which a one-cell tile has room to print its value (data-zoomed="detail"). */
  detail: number;
};

/** Real shapes: far enough to tell Luxembourg from Belgium on a world map. */
export const SHAPE_ZOOM: ZoomLimits = { max: 8, step: 1.6, minFocus: 1.8, maxFocus: 8, detail: 3 };

/**
 * Tiles: only a little. Every tile is already large enough to see and to
 * click, which is the point of the view; a click nudges towards the tile
 * rather than diving in.
 */
export const TILE_ZOOM: ZoomLimits = { max: 2, step: 1.25, minFocus: 1.5, maxFocus: 1.5, detail: 2 };

/** How many times the country's own size to show, so its neighbours are in view. */
const SURROUNDINGS = 3;

export function wholeView(frame: Box): ZoomView {
  return { scale: 1, cx: frame.x + frame.width / 2, cy: frame.y + frame.height / 2 };
}

/** The view held to the allowed scales, and kept from sliding past the frame's edges. */
export function clampView({ scale, cx, cy }: ZoomView, frame: Box, limits: ZoomLimits): ZoomView {
  const held = Math.max(1, Math.min(limits.max, scale));
  const halfWidth = frame.width / (2 * held);
  const halfHeight = frame.height / (2 * held);
  return {
    scale: held,
    cx: Math.max(frame.x + halfWidth, Math.min(frame.x + frame.width - halfWidth, cx)),
    cy: Math.max(frame.y + halfHeight, Math.min(frame.y + frame.height - halfHeight, cy)),
  };
}

/** The view centred on a box, with room around it for what lies nearby. */
export function focusOn(box: Box, frame: Box, limits: ZoomLimits): ZoomView {
  const fit = box.width === 0 && box.height === 0 ? Infinity : Math.min(frame.width / (box.width * SURROUNDINGS), frame.height / (box.height * SURROUNDINGS));
  const scale = Math.max(limits.minFocus, Math.min(limits.maxFocus, fit));
  return clampView({ scale, cx: box.x + box.width / 2, cy: box.y + box.height / 2 }, frame, limits);
}

/** The part of the drawing a view shows, in the drawing's own units. */
export function visibleBox({ scale, cx, cy }: ZoomView, frame: Box): Box {
  const [width, height] = [frame.width / scale, frame.height / scale];
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

/** The CSS transform for a view. `unit` is how many of the layer's CSS pixels one drawing unit takes. */
export function layerTransform({ scale, cx, cy }: ZoomView, frame: Box, unit: number): string {
  const x = (frame.x + frame.width / 2 - scale * cx) * unit;
  const y = (frame.y + frame.height / 2 - scale * cy) * unit;
  return `translate(${x}px, ${y}px) scale(${scale})`;
}

/** Reads a `data-focus` attribute: "x y width height". */
export function parseBox(text: string): Box {
  const [x, y, width, height] = text.split(' ').map(Number);
  return { x, y, width, height };
}
