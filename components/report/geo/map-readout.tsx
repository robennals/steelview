'use client';

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { fitLabels } from './fit-labels';
import { clampView, focusOn, layerTransform, parseBox, SHAPE_ZOOM, visibleBox, wholeView, type Box, type ZoomLimits, type ZoomView } from './zoom';

type Active = { region: string; text: string } | null;

/** A pointer dragged further than this, in pixels, moves the map rather than clicking what is under it. */
const DRAG_THRESHOLD = 4;
/** A readout with no drawing to zoom: its view never leaves scale 1. */
const NO_FRAME: Box = { x: 0, y: 0, width: 1, height: 1 };

function activeFor(target: EventTarget | null): Active {
  if (!(target instanceof Element)) return null;
  const element = target.closest<HTMLElement | SVGElement>('[data-readout]');
  if (!element?.dataset.region || !element.dataset.readout) return null;
  return { region: element.dataset.region, text: element.dataset.readout };
}

function zoomableArea(target: EventTarget | null): HTMLElement | SVGElement | null {
  return target instanceof Element ? target.closest<HTMLElement | SVGElement>('[data-focus]') : null;
}

/** How many of the layer's own CSS pixels one drawing unit takes: an SVG's are its user units, a grid's are cells. */
function layerUnit(layer: HTMLElement | SVGElement, frame: Box): number {
  return layer instanceof HTMLElement ? layer.offsetWidth / frame.width : 1;
}

/** How many screen pixels one drawing unit takes at scale 1. */
function screenUnit(layer: HTMLElement | SVGElement, frame: Box): number {
  return layer instanceof SVGGraphicsElement ? (layer.ownerSVGElement?.getScreenCTM()?.a ?? 1) : layerUnit(layer, frame);
}

/**
 * The one client boundary around an otherwise server-rendered map. Every area
 * carries its own sentence in `data-readout` ("London: 40.6%"), written on the
 * server with the same formatter as the table; this island moves that
 * sentence into the line under the map and marks every drawing of the same
 * area (the main map and any inset) as active.
 *
 * The readout is a live region, so a keyboard user tabbing through the areas
 * hears each value without the map needing per-area tooltips.
 *
 * Given a `frame`, it also zooms, for tiles and real shapes alike. Clicking an area, or
 * pressing Enter on it, moves to the box in its `data-focus`, with its
 * neighbours in view; the buttons zoom in and out, Escape or "Whole map" goes
 * back, and once zoomed the map can be dragged. All of it transforms the
 * `data-zoom-layer` element by hand, so the markup stays as the server wrote
 * it, and without script the map is simply whole and the controls hidden.
 */
export function MapReadout({
  hint,
  frame = NO_FRAME,
  limits = SHAPE_ZOOM,
  children,
}: {
  hint: string;
  /** The drawing's own box, in the units of `data-focus`. Without one there is no zooming. */
  frame?: Box;
  /** How far the drawing zooms: TILE_ZOOM for tiles, which need little. */
  limits?: ZoomLimits;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Active>(null);
  const [view, setView] = useState<ZoomView>(() => wholeView(frame));
  const drag = useRef<{ x: number; y: number; from: ZoomView; moved: boolean } | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    for (const element of root.current?.querySelectorAll<HTMLElement | SVGElement>('[data-region]') ?? []) {
      if (active && element.dataset.region === active.region) element.dataset.active = 'true';
      else delete element.dataset.active;
    }
  }, [active]);

  useEffect(() => {
    const element = root.current;
    const layer = element?.querySelector<HTMLElement | SVGElement>('[data-zoom-layer]');
    if (!element || !layer) return;
    element.style.setProperty('--sv-map-zoom', String(view.scale));
    const place = () => {
      layer.style.transform = layerTransform(view, frame, layerUnit(layer, frame));
      fitLabels(element, view.scale, visibleBox(view, frame));
    };
    // Patterns are data, not ground: their dots and lines keep their size on screen as the map grows.
    for (const pattern of element.querySelectorAll('pattern')) {
      pattern.setAttribute('patternTransform', `scale(${1 / view.scale}) ${pattern.dataset.baseTransform ?? ''}`.trim());
    }
    if (view.scale > 1) element.dataset.zoomed = view.scale >= limits.detail ? 'detail' : 'true';
    else delete element.dataset.zoomed;
    place();
    // A grid is laid out in pixels, so a resize moves where a cell falls.
    const observer = new ResizeObserver(place);
    observer.observe(element);
    return () => observer.disconnect();
  }, [view, frame, limits]);

  const enter = (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    const next = activeFor(event.target);
    if (next) setActive(next);
  };
  const leave = (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
    setActive(activeFor(event.relatedTarget));
  };

  const zoomBy = (factor: number) => setView(current => clampView({ ...current, scale: current.scale * factor }, frame, limits));
  const showWhole = () => setView(wholeView(frame));

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    const focus = zoomableArea(event.target)?.dataset.focus;
    if (focus) setView(focusOn(parseBox(focus), frame, limits));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') showWhole();
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const focus = zoomableArea(event.target)?.dataset.focus;
    if (!focus) return;
    event.preventDefault();
    setView(focusOn(parseBox(focus), frame, limits));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragged.current = false;
    if (view.scale === 1 || !(event.target instanceof Element) || !event.target.closest('[data-zoom-stage]')) return;
    drag.current = { x: event.clientX, y: event.clientY, from: view, moved: false };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    const element = root.current;
    const layer = element?.querySelector<HTMLElement | SVGElement>('[data-zoom-layer]');
    if (!current || !element || !layer) return;
    const [dx, dy] = [event.clientX - current.x, event.clientY - current.y];
    if (!current.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      current.moved = true;
      element.dataset.dragging = 'true';
      element.setPointerCapture(event.pointerId);
    }
    const perUnit = screenUnit(layer, frame) * current.from.scale;
    setView(clampView({ ...current.from, cx: current.from.cx - dx / perUnit, cy: current.from.cy - dy / perUnit }, frame, limits));
  };

  const onPointerUp = () => {
    dragged.current = drag.current?.moved ?? false;
    drag.current = null;
    if (root.current) delete root.current.dataset.dragging;
  };

  return (
    <div
      ref={root}
      className="sv-map__interactive"
      onPointerOver={enter}
      onPointerOut={leave}
      onFocus={enter}
      onBlur={leave}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
      <div className="sv-map__footer">
        <p className="sv-map__readout" aria-live="polite" data-idle={active ? undefined : 'true'}>
          {active ? active.text : hint}
        </p>
        {frame !== NO_FRAME && (
          <div className="sv-map__zoom" role="group" aria-label="Map zoom">
            <button type="button" aria-label="Zoom in" disabled={view.scale >= limits.max} onClick={() => zoomBy(limits.step)}>+</button>
            <button type="button" aria-label="Zoom out" disabled={view.scale <= 1} onClick={() => zoomBy(1 / limits.step)}>−</button>
            <button type="button" disabled={view.scale <= 1} onClick={showWhole}>Whole map</button>
          </div>
        )}
      </div>
    </div>
  );
}
