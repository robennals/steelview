import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampView, focusOn, layerTransform, parseBox, SHAPE_ZOOM, TILE_ZOOM, visibleBox, wholeView } from './zoom';

const frame = { x: 0, y: 0, width: 600, height: 300 };

test('the whole view shows the frame at scale 1', () => {
  assert.deepEqual(wholeView({ x: 10, y: 20, width: 100, height: 50 }), { scale: 1, cx: 60, cy: 45 });
  assert.equal(layerTransform(wholeView(frame), frame, 1), 'translate(0px, 0px) scale(1)');
});

test('a view stays inside the frame and between the allowed scales', () => {
  assert.deepEqual(clampView({ scale: 0.5, cx: 0, cy: 0 }, frame, SHAPE_ZOOM), { scale: 1, cx: 300, cy: 150 });
  assert.equal(clampView({ scale: 100, cx: 300, cy: 150 }, frame, SHAPE_ZOOM).scale, SHAPE_ZOOM.max);
  // At scale 2 half the frame is visible, so the centre stays a quarter in from each edge.
  assert.deepEqual(clampView({ scale: 2, cx: 0, cy: 299 }, frame, SHAPE_ZOOM), { scale: 2, cx: 150, cy: 225 });
});

test('a country is shown with room for its neighbours', () => {
  const view = focusOn({ x: 250, y: 125, width: 40, height: 20 }, frame, SHAPE_ZOOM);
  assert.equal(view.scale, 5);
  assert.deepEqual([view.cx, view.cy], [270, 135]);
});

test('a click on a huge country still zooms in, and a dot goes as far as the map allows', () => {
  assert.equal(focusOn({ x: 300, y: 10, width: 280, height: 90 }, frame, SHAPE_ZOOM).scale, 1.8);
  assert.equal(focusOn({ x: 300, y: 100, width: 0, height: 0 }, frame, SHAPE_ZOOM).scale, SHAPE_ZOOM.max);
});

test('tiles zoom only a little: a click on any tile nudges to the same scale, and the buttons stop soon after', () => {
  for (const box of [{ x: 300, y: 150, width: 1, height: 1 }, { x: 100, y: 50, width: 200, height: 100 }]) {
    assert.equal(focusOn(box, frame, TILE_ZOOM).scale, TILE_ZOOM.minFocus);
  }
  assert.equal(clampView({ scale: 5, cx: 300, cy: 150 }, frame, TILE_ZOOM).scale, TILE_ZOOM.max);
  assert.ok(TILE_ZOOM.max <= 2);
});

test('the transform puts the view centre at the centre of the frame, in the layer\'s pixels', () => {
  assert.equal(layerTransform({ scale: 2, cx: 150, cy: 75 }, frame, 1), 'translate(0px, 0px) scale(2)');
  assert.equal(layerTransform({ scale: 2, cx: 300, cy: 150 }, frame, 3), 'translate(-900px, -450px) scale(2)');
});

test('parseBox reads a data-focus attribute', () => {
  assert.deepEqual(parseBox('1 2.5 3 4'), { x: 1, y: 2.5, width: 3, height: 4 });
});

test('the visible box is the frame divided by the scale, about the view centre', () => {
  assert.deepEqual(visibleBox(wholeView(frame), frame), frame);
  assert.deepEqual(visibleBox({ scale: 2, cx: 150, cy: 75 }, frame), { x: 0, y: 0, width: 300, height: 150 });
});
