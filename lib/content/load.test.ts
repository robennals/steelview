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
  // beta is `complicated`, alpha and gamma are `well-supported` — facts sort
  // by status before id, so alpha and gamma sort ahead of beta.
  assert.deepEqual(
    topic.facts.map((f) => f.id),
    ['alpha', 'gamma', 'beta']
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

test('facts sort by status in editorial order, then by id within status', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'steelview-content-'));
  const dir = path.join(root, 'ordering');
  await mkdir(path.join(dir, 'facts'), { recursive: true });
  await mkdir(path.join(dir, 'viewpoints'), { recursive: true });
  await mkdir(path.join(dir, 'principles'), { recursive: true });
  await writeFile(
    path.join(dir, 'topic.md'),
    '---\ntitle: Ordering\nsubtitle: s\nlastUpdated: 2026-08-18\n---\nIntro.\n'
  );

  // One fact per status, plus a second well-supported fact to check the
  // within-status id ordering. `d1` (contested) needs both a "supports" and
  // a "contests" source plus a body to pass shape validation; the others
  // need only what their own status requires.
  const facts: Record<string, string> = {
    z1: `---\nclaim: z1\nstatus: unknown\nsources: []\n---\n`,
    a1: `---\nclaim: a1\nstatus: not-supported\nsources:\n  - stance: contests\n    quote: q\n    title: t\n    url: https://example.org/a1\n    publisher: p\n    date: "2024"\n---\n`,
    b1: `---\nclaim: b1\nstatus: well-supported\nsources:\n  - stance: supports\n    quote: q\n    title: t\n    url: https://example.org/b1\n    publisher: p\n    date: "2024"\n---\n`,
    c1: `---\nclaim: c1\nstatus: complicated\nsources: []\n---\n`,
    d1: `---\nclaim: d1\nstatus: contested\nsources:\n  - stance: supports\n    quote: q\n    title: t\n    url: https://example.org/d1\n    publisher: p\n    date: "2024"\n  - stance: contests\n    quote: q2\n    title: t2\n    url: https://example.org/d1b\n    publisher: p\n    date: "2024"\n---\nWhy the sides disagree on d1.\n`,
    b2: `---\nclaim: b2\nstatus: well-supported\nsources:\n  - stance: supports\n    quote: q\n    title: t\n    url: https://example.org/b2\n    publisher: p\n    date: "2024"\n---\n`,
  };
  await Promise.all(
    Object.entries(facts).map(([id, md]) => writeFile(path.join(dir, 'facts', `${id}.md`), md))
  );
  // Every fact must be referenced (rule 7) and `acknowledges` may only hold
  // well-supported facts (rule 2), so spread the facts across all three
  // relationships a viewpoint can have with a fact.
  await writeFile(
    path.join(dir, 'viewpoints', 'v.md'),
    '---\nname: V\nsummary: s\nacknowledges: [b1]\ncitesFacts: [b2, d1]\nsetsAside: [c1, z1, a1]\nprinciples: [p]\n---\nBody.\n'
  );
  await writeFile(path.join(dir, 'principles', 'p.md'), '---\nname: P\nheldBy: [v]\n---\n');

  const topic = await loadTopic('ordering', root);
  assert.deepEqual(
    topic.facts.map((f) => f.id),
    ['b1', 'b2', 'd1', 'c1', 'z1', 'a1']
  );
});

test('listTopicSlugs returns directory names, sorted', async () => {
  assert.deepEqual(await listTopicSlugs(FIXTURES), ['example']);
});
