import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile, cp } from 'node:fs/promises';
import os from 'node:os';
import { loadTopic, listTopicSlugs, ContentError } from './load';

const FIXTURES = path.join(import.meta.dirname, '__fixtures__', 'topics');

/** Copy the example fixture into a temp root so a test can corrupt one file. */
async function fixtureCopy(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'steelview-content-'));
  await cp(FIXTURES, root, { recursive: true });
  return root;
}

test('loads every item in a topic', async () => {
  const topic = await loadTopic('example', FIXTURES);
  assert.equal(topic.slug, 'example');
  assert.equal(topic.title, 'Example');
  assert.equal(topic.intro, 'The introduction to the example topic.');
  assert.equal(topic.facts.length, 3);
  assert.equal(topic.viewpoints.length, 2);
  assert.equal(topic.principles.length, 1);
  assert.equal(topic.cruxes.length, 1);
});

test('an item id is its filename without the extension', async () => {
  const topic = await loadTopic('example', FIXTURES);
  assert.deepEqual(
    topic.facts.map((f) => f.id),
    ['alpha', 'beta', 'gamma']
  );
});

test('frontmatter and body are both loaded', async () => {
  const topic = await loadTopic('example', FIXTURES);
  const one = topic.viewpoints.find((v) => v.id === 'one');
  assert.equal(one?.name, 'One');
  assert.deepEqual(one?.citesFacts, ['alpha']);
  assert.equal(one?.body, 'The full argument for viewpoint one.');
});

test('a fact with no body loads with an empty string body', async () => {
  const topic = await loadTopic('example', FIXTURES);
  assert.equal(topic.facts.find((f) => f.id === 'alpha')?.body, '');
});

test('a missing topic throws ContentError naming the slug', async () => {
  await assert.rejects(() => loadTopic('nope', FIXTURES), (e: Error) => {
    assert.ok(e instanceof ContentError);
    assert.match(e.message, /nope/);
    return true;
  });
});

test('bad frontmatter throws ContentError naming the file and the field', async () => {
  const root = await fixtureCopy();
  await writeFile(
    path.join(root, 'example', 'facts', 'alpha.md'),
    '---\nclaim: Alpha\nstatus: mostly-true\n---\n'
  );
  await assert.rejects(() => loadTopic('example', root), (e: Error) => {
    assert.ok(e instanceof ContentError);
    assert.match(e.message, /alpha\.md/);
    assert.match(e.message, /status/);
    return true;
  });
});

test('a cross-reference violation throws ContentError listing every problem', async () => {
  const root = await fixtureCopy();
  await writeFile(
    path.join(root, 'example', 'viewpoints', 'one.md'),
    '---\nname: One\nsummary: s\ncitesFacts: [ghost]\nacknowledges: [gamma]\n---\nBody.\n'
  );
  await assert.rejects(() => loadTopic('example', root), (e: Error) => {
    assert.ok(e instanceof ContentError);
    assert.match(e.message, /ghost/);
    assert.match(e.message, /beta/); // beta is now an orphan too — both are reported
    return true;
  });
});

test('a topic with no cruxes directory loads with an empty cruxes array', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'steelview-content-'));
  const dir = path.join(root, 'bare');
  await mkdir(path.join(dir, 'facts'), { recursive: true });
  await mkdir(path.join(dir, 'viewpoints'), { recursive: true });
  await mkdir(path.join(dir, 'principles'), { recursive: true });
  await writeFile(
    path.join(dir, 'topic.md'),
    '---\ntitle: Bare\nsubtitle: s\nlastUpdated: 2026-08-18\n---\nIntro.\n'
  );
  await writeFile(
    path.join(dir, 'facts', 'a.md'),
    '---\nclaim: A\nstatus: well-supported\nsources:\n  - stance: supports\n    quote: q\n    title: t\n    url: https://example.org/a\n    publisher: p\n    date: "2024"\n---\n'
  );
  await writeFile(
    path.join(dir, 'viewpoints', 'v.md'),
    '---\nname: V\nsummary: s\nacknowledges: [a]\nprinciples: [p]\n---\nBody.\n'
  );
  await writeFile(path.join(dir, 'principles', 'p.md'), '---\nname: P\nheldBy: [v]\n---\n');
  const topic = await loadTopic('bare', root);
  assert.deepEqual(topic.cruxes, []);
});

test('unquoted YAML dates in source frontmatter normalize to strings, not Date or number', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'steelview-content-'));
  const dir = path.join(root, 'dates');
  await mkdir(path.join(dir, 'facts'), { recursive: true });
  await mkdir(path.join(dir, 'viewpoints'), { recursive: true });
  await mkdir(path.join(dir, 'principles'), { recursive: true });
  await writeFile(
    path.join(dir, 'topic.md'),
    '---\ntitle: Dates\nsubtitle: s\nlastUpdated: 2026-08-18\n---\nIntro.\n'
  );
  // Both dates are unquoted: a full date (YAML timestamp -> Date) and a bare
  // year (YAML int -> number). Both must come back as strings.
  await writeFile(
    path.join(dir, 'facts', 'a.md'),
    [
      '---',
      'claim: A',
      'status: well-supported',
      'sources:',
      '  - stance: supports',
      '    quote: q',
      '    title: t',
      '    url: https://example.org/a',
      '    publisher: p',
      '    date: 2024-11-28',
      '  - stance: supports',
      '    quote: q2',
      '    title: t2',
      '    url: https://example.org/a2',
      '    publisher: p',
      '    date: 2024',
      '---',
      '',
    ].join('\n')
  );
  await writeFile(
    path.join(dir, 'viewpoints', 'v.md'),
    '---\nname: V\nsummary: s\nacknowledges: [a]\nprinciples: [p]\n---\nBody.\n'
  );
  await writeFile(path.join(dir, 'principles', 'p.md'), '---\nname: P\nheldBy: [v]\n---\n');
  const topic = await loadTopic('dates', root);
  const fact = topic.facts[0];
  assert.equal(fact.sources[0].date, '2024-11-28');
  assert.equal(fact.sources[1].date, '2024');
});

test('listTopicSlugs returns directory names, sorted', async () => {
  assert.deepEqual(await listTopicSlugs(FIXTURES), ['example']);
});
