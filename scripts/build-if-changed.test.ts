import { test } from 'node:test';
import assert from 'node:assert/strict';
import { affectsBuild, buildFingerprint, isCurrent } from './build-if-changed';

const contents: Record<string, string> = { 'app/page.tsx': 'a', 'lib/site.ts': 'b' };
const read = (file: string) => contents[file] ?? null;
const FILES = Object.keys(contents);

test('tests, stories and docs do not change what the build produces', () => {
  for (const file of [
    'tests/index.spec.ts',
    'lib/content/load.test.ts',
    'components/topic/chart.stories.tsx',
    'docs/plan.md',
    '.github/workflows/ci.yml',
    'README.md',
  ]) {
    assert.equal(affectsBuild(file), false, file);
  }
});

test('code, content, styles and config all change what the build produces', () => {
  for (const file of [
    'app/page.tsx',
    'content/topics/uk-asylum/topic.md',
    'app/globals.css',
    'next.config.ts',
    'pnpm-lock.yaml',
  ]) {
    assert.equal(affectsBuild(file), true, file);
  }
});

test('the fingerprint follows file contents, names, deletions and the environment', () => {
  const base = buildFingerprint(FILES, read, 'v1');
  assert.equal(buildFingerprint(FILES, read, 'v1'), base);
  assert.notEqual(buildFingerprint(FILES, (f) => (f === 'lib/site.ts' ? 'c' : read(f)), 'v1'), base);
  assert.notEqual(buildFingerprint(['app/other.tsx', 'lib/site.ts'], (f) => (f === 'app/other.tsx' ? 'a' : read(f)), 'v1'), base);
  assert.notEqual(buildFingerprint(FILES, (f) => (f === 'lib/site.ts' ? null : read(f)), 'v1'), base);
  assert.notEqual(buildFingerprint(FILES, read, 'v2'), base);
});

test('moving a character between two files changes the fingerprint', () => {
  const files = ['a', 'b'];
  const first = buildFingerprint(files, (f) => (f === 'a' ? 'xy' : 'z'), '');
  const second = buildFingerprint(files, (f) => (f === 'a' ? 'x' : 'yz'), '');
  assert.notEqual(first, second);
});

test('a build is current only when both its sources and its output are the recorded ones', () => {
  const stamp = { fingerprint: 'sources', buildId: 'output' };
  assert.equal(isCurrent(stamp, 'sources', 'output'), true);
  assert.equal(isCurrent(stamp, 'edited', 'output'), false);
  // A plain `pnpm build` replaced the output without recording it.
  assert.equal(isCurrent(stamp, 'sources', 'other-output'), false);
  assert.equal(isCurrent(null, 'sources', 'output'), false);
  assert.equal(isCurrent(stamp, 'sources', null), false);
});
