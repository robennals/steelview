import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile, cp, rm } from 'node:fs/promises';
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
  // Rule 8 needs at least two viewpoints; this one carries no principle so it
  // doesn't need to appear in any heldBy.
  await writeFile(
    path.join(dir, 'viewpoints', 'v2.md'),
    '---\nname: V2\nsummary: s\nacknowledges: [a]\n---\nBody.\n'
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
  // Rule 8 needs at least two viewpoints.
  await writeFile(
    path.join(dir, 'viewpoints', 'v2.md'),
    '---\nname: V2\nsummary: s\nacknowledges: [a]\n---\nBody.\n'
  );
  await writeFile(path.join(dir, 'principles', 'p.md'), '---\nname: P\nheldBy: [v]\n---\n');
  const topic = await loadTopic('dates', root);
  const fact = topic.facts[0];
  assert.equal(fact.sources[0].date, '2024-11-28');
  assert.equal(fact.sources[1].date, '2024');
});

/**
 * Build a topic whose facts are given as `{id: [status, order?]}`, with the
 * cross-reference graph wired up so it passes validation, and return the
 * loaded fact ids in render order.
 */
async function factOrder(facts: Record<string, [string, number?]>): Promise<string[]> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'steelview-content-'));
  const dir = path.join(root, 'ordering');
  await mkdir(path.join(dir, 'facts'), { recursive: true });
  await mkdir(path.join(dir, 'viewpoints'), { recursive: true });
  await mkdir(path.join(dir, 'principles'), { recursive: true });
  await writeFile(
    path.join(dir, 'topic.md'),
    '---\ntitle: Ordering\nsubtitle: s\nlastUpdated: 2026-08-18\n---\nIntro.\n'
  );

  const ids = Object.keys(facts);
  await Promise.all(
    ids.map((id) => {
      const [status, order] = facts[id];
      const orderLine = order === undefined ? '' : `order: ${order}\n`;
      // Sources are whatever each status needs to pass validation: a
      // supports source everywhere, plus a contests source and a body for
      // `contested`, and a contests source for `not-supported`.
      const supports = `  - stance: supports\n    quote: q\n    title: t\n    url: https://example.org/${id}\n    publisher: p\n    date: "2024"\n`;
      const contests = `  - stance: contests\n    quote: q2\n    title: t2\n    url: https://example.org/${id}b\n    publisher: p\n    date: "2024"\n`;
      const sources =
        status === 'contested'
          ? supports + contests
          : status === 'not-supported'
            ? contests
            : status === 'well-supported'
              ? supports
              : '';
      const body = status === 'contested' ? `Why the sides disagree on ${id}.\n` : '';
      return writeFile(
        path.join(dir, 'facts', `${id}.md`),
        `---\nclaim: ${id}\nstatus: ${status}\n${orderLine}sources:${sources ? '\n' + sources : ' []\n'}---\n${body}`
      );
    })
  );

  // Every fact must be referenced (rule 7), `citesFacts` takes only
  // well-supported or contested facts and `acknowledges` only well-supported
  // ones (rule 2), so route each fact into the list its status allows.
  const acknowledges = ids.filter((id) => facts[id][0] === 'well-supported');
  const cites = ids.filter((id) => facts[id][0] === 'contested');
  const aside = ids.filter((id) => !acknowledges.includes(id) && !cites.includes(id));
  await writeFile(
    path.join(dir, 'viewpoints', 'v.md'),
    `---\nname: V\nsummary: s\nacknowledges: [${acknowledges}]\ncitesFacts: [${cites}]\nsetsAside: [${aside}]\nprinciples: [p]\n---\nBody.\n`
  );
  // Rule 8 needs at least two viewpoints.
  await writeFile(
    path.join(dir, 'viewpoints', 'v2.md'),
    `---\nname: V2\nsummary: s\nacknowledges: [${acknowledges}]\n---\nBody.\n`
  );
  await writeFile(path.join(dir, 'principles', 'p.md'), '---\nname: P\nheldBy: [v]\n---\n');

  const topic = await loadTopic('ordering', root);
  return topic.facts.map((f) => f.id);
}

test('an ordered fact sorts ahead of every unordered one, however well supported', async () => {
  assert.deepEqual(
    await factOrder({
      a: ['well-supported'],
      b: ['well-supported'],
      // `unknown` is last in status order, but ranked first editorially.
      z: ['unknown', 1],
    }),
    ['z', 'a', 'b']
  );
});

test('ordered facts sort by order ascending', async () => {
  assert.deepEqual(
    await factOrder({ a: ['well-supported', 3], b: ['well-supported', 1], c: ['well-supported', 2] }),
    ['b', 'c', 'a']
  );
});

test('facts sharing an order fall back to status, then to id', async () => {
  assert.deepEqual(
    await factOrder({
      // All three carry order 1, so status decides: well-supported, then
      // contested, then unknown. `a` and `b` are both well-supported, so id
      // decides between them.
      b: ['well-supported', 1],
      a: ['well-supported', 1],
      c: ['contested', 1],
      d: ['unknown', 1],
    }),
    ['a', 'b', 'c', 'd']
  );
});

test('unordered facts keep the status order they had before order existed', async () => {
  assert.deepEqual(
    await factOrder({
      z1: ['unknown'],
      a1: ['not-supported'],
      b1: ['well-supported'],
      c1: ['complicated'],
      d1: ['contested'],
      b2: ['well-supported'],
    }),
    ['b1', 'b2', 'd1', 'c1', 'z1', 'a1']
  );
});

test('a non-integer or non-positive order is rejected', async () => {
  const root = await fixtureCopy();
  await writeFile(
    path.join(root, 'example', 'facts', 'alpha.md'),
    '---\nclaim: Alpha\nstatus: well-supported\norder: 0\nsources:\n  - stance: supports\n    quote: q\n    title: t\n    url: https://example.org/a\n    publisher: p\n    date: "2024"\n---\n'
  );
  await assert.rejects(() => loadTopic('example', root), (e: Error) => {
    assert.ok(e instanceof ContentError);
    assert.match(e.message, /order/);
    return true;
  });
});

test('listTopicSlugs returns directory names, sorted', async () => {
  assert.deepEqual(await listTopicSlugs(FIXTURES), ['example']);
});

test('an unreadable item directory (e.g. a file where a directory belongs) fails the build, not silently empties the section', async () => {
  // A missing directory (ENOENT) is legal — "no cruxes" — but a file sitting
  // where `cruxes/` should be is a different, real error and must not be
  // indistinguishable from "no cruxes".
  const root = await fixtureCopy();
  await rm(path.join(root, 'example', 'cruxes'), { recursive: true });
  await writeFile(path.join(root, 'example', 'cruxes'), 'not a directory');
  await assert.rejects(() => loadTopic('example', root));
});
