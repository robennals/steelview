import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/*
 * A `var(--name)` that nothing defines fails silently: the declaration is
 * dropped and the rule it was meant to draw never appears. Fact pages lost
 * the rules between their "Data still needed" items this way. So every
 * custom property the stylesheets read must be defined in a stylesheet,
 * set inline by a component, or come from one of the sources below.
 */

const ROOT = join(import.meta.dirname, '..');

const stylesheets = [
  join(ROOT, 'app/globals.css'),
  ...readdirSync(join(ROOT, 'components/report/styles'))
    .filter(file => file.endsWith('.css'))
    .map(file => join(ROOT, 'components/report/styles', file)),
];

/** Set outside the stylesheets: next/font's variables, and per-element values set inline by components. */
function definedElsewhere(): Set<string> {
  const names = new Set(['--font-newsreader', '--font-plex-sans']);
  const declarations = readFileSync(join(ROOT, 'types/react-css-properties.d.ts'), 'utf8');
  for (const [, name] of declarations.matchAll(/'(--[a-z0-9-]+)'\?:/g)) names.add(name);
  return names;
}

test('every CSS custom property read is defined somewhere', () => {
  const css = stylesheets.map(file => readFileSync(file, 'utf8')).join('\n');
  const defined = new Set([...css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map(([, name]) => name));
  for (const name of definedElsewhere()) defined.add(name);
  // Series and group colours are numbered slots, read as e.g. var(--sv-series-3).
  const isNumberedSlot = (name: string) => /^--sv-(series|group)-\d+$/.test(name);

  const undefinedNames = [...new Set([...css.matchAll(/var\((--[a-zA-Z0-9-]+)/g)].map(([, name]) => name))]
    .filter(name => !defined.has(name) && !isNumberedSlot(name));
  assert.deepEqual(undefinedNames, []);
});
