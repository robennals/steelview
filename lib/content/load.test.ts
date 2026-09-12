import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises';
import os from 'node:os';
import { loadTopic, loadPrinciples, listTopicSlugs, ContentError } from './load';

const FIXTURES = path.join(import.meta.dirname, '__fixtures__', 'topics');

async function tempTopicsRoot(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'steelview-content-'));
  const root = path.join(dir, 'topics');
  await mkdir(root);
  return root;
}

/** Copy the example fixture into a temp root so a test can corrupt one file. */
async function fixtureCopy(): Promise<string> {
  const root = await tempTopicsRoot();
  await cp(FIXTURES, root, { recursive: true });
  await cp(path.join(FIXTURES, '..', 'principles'), path.join(root, '..', 'principles'), { recursive: true });
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

test('an item with no body loads with an empty string body', async () => {
  // Facts must now carry a body (validation rule 4), but the other kinds may
  // legitimately be frontmatter only — the loader must not invent a body.
  const topic = await loadTopic('example', FIXTURES);
  assert.equal(topic.cruxes.find((c) => c.id === 'timing')?.body, '');
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
    '---\nname: One\nsummary: s\norder: 1\ncitesFacts: [ghost]\nacknowledges: [gamma]\n---\nBody.\n'
  );
  await assert.rejects(() => loadTopic('example', root), (e: Error) => {
    assert.ok(e instanceof ContentError);
    assert.match(e.message, /ghost/);
    assert.match(e.message, /beta/); // beta is now an orphan too — both are reported
    return true;
  });
});

test('a topic with no cruxes directory loads with an empty cruxes array', async () => {
  const root = await tempTopicsRoot();
  const dir = path.join(root, 'bare');
  await mkdir(path.join(dir, 'facts'), { recursive: true });
  await mkdir(path.join(dir, 'viewpoints'), { recursive: true });
  await mkdir(path.join(root, '..', 'principles'), { recursive: true });
  await writeFile(
    path.join(dir, 'topic.md'),
    '---\ntitle: Bare\nprinciples: [p]\nsubtitle: s\nlastUpdated: 2026-08-18\n---\nIntro.\n'
  );
  await writeFile(
    path.join(dir, 'facts', 'a.md'),
    '---\nclaim: A\nstatus: well-supported\nsources:\n  - stance: supports\n    quote: q\n    title: t\n    url: https://example.org/a\n    publisher: p\n    date: "2024"\n---\nContext for A.\n'
  );
  await writeFile(
    path.join(dir, 'viewpoints', 'v.md'),
    '---\nname: V\nsummary: s\norder: 1\nacknowledges: [a]\nprinciples: [p]\n---\nBody.\n'
  );
  // Rule 9 needs at least two viewpoints; this one uses no principles.
  await writeFile(
    path.join(dir, 'viewpoints', 'v2.md'),
    '---\nname: V2\nsummary: s\norder: 2\nacknowledges: [a]\n---\nBody.\n'
  );
  await writeFile(path.join(root, '..', 'principles', 'p.md'), '---\nname: P\n---\n');
  const topic = await loadTopic('bare', root);
  assert.deepEqual(topic.cruxes, []);
});

test('unquoted YAML dates in source frontmatter normalize to strings, not Date or number', async () => {
  const root = await tempTopicsRoot();
  const dir = path.join(root, 'dates');
  await mkdir(path.join(dir, 'facts'), { recursive: true });
  await mkdir(path.join(dir, 'viewpoints'), { recursive: true });
  await mkdir(path.join(root, '..', 'principles'), { recursive: true });
  await writeFile(
    path.join(dir, 'topic.md'),
    '---\ntitle: Dates\nprinciples: [p]\nsubtitle: s\nlastUpdated: 2026-08-18\n---\nIntro.\n'
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
      'Context for A.',
      '',
    ].join('\n')
  );
  await writeFile(
    path.join(dir, 'viewpoints', 'v.md'),
    '---\nname: V\nsummary: s\norder: 1\nacknowledges: [a]\nprinciples: [p]\n---\nBody.\n'
  );
  // Rule 9 needs at least two viewpoints.
  await writeFile(
    path.join(dir, 'viewpoints', 'v2.md'),
    '---\nname: V2\nsummary: s\norder: 2\nacknowledges: [a]\n---\nBody.\n'
  );
  await writeFile(path.join(root, '..', 'principles', 'p.md'), '---\nname: P\n---\n');
  const topic = await loadTopic('dates', root);
  const fact = topic.facts[0];
  assert.equal(fact.sources[0].date, '2024-11-28');
  assert.equal(fact.sources[1].date, '2024');
});

/**
 * Build a topic on disk from `facts` (`{id: status}`) and `viewpoints`
 * (`{id: {cites, acknowledges, setsAside}}`) and return the loaded fact ids
 * in render order. The unit tests for the ranking itself live in
 * rank-facts.test.ts; this exercises the same thing through real files, so a
 * wiring mistake in the loader cannot pass unnoticed.
 */
type VpSpec = { cites?: string[]; acknowledges?: string[]; setsAside?: string[] };

async function loadOrdered(
  facts: Record<string, string>,
  viewpoints: Record<string, VpSpec>
): Promise<string[]> {
  const root = await tempTopicsRoot();
  const dir = path.join(root, 'ordering');
  await mkdir(path.join(dir, 'facts'), { recursive: true });
  await mkdir(path.join(dir, 'viewpoints'), { recursive: true });
  await writeFile(
    path.join(dir, 'topic.md'),
    '---\ntitle: Ordering\nsubtitle: s\nlastUpdated: 2026-08-18\n---\nIntro.\n'
  );

  await Promise.all(
    Object.entries(facts).map(([id, status]) => {
      // Sources are whatever each status needs to pass validation: every fact
      // needs at least one, `contested` needs both stances, and every fact
      // needs a body.
      const supports = `  - stance: supports\n    quote: q\n    title: t\n    url: https://example.org/${id}\n    publisher: p\n    date: "2024"\n`;
      const contests = `  - stance: contests\n    quote: q2\n    title: t2\n    url: https://example.org/${id}b\n    publisher: p\n    date: "2024"\n`;
      const sources = status === 'contested' ? supports + contests : status === 'not-supported' ? contests : supports;
      return writeFile(
        path.join(dir, 'facts', `${id}.md`),
        `---\nclaim: ${id}\nstatus: ${status}\nsources:\n${sources}---\nContext for ${id}.\n`
      );
    })
  );

  await Promise.all(
    Object.entries(viewpoints).map(([id, spec], i) =>
      writeFile(
        path.join(dir, 'viewpoints', `${id}.md`),
        `---\nname: ${id}\nsummary: s\norder: ${i + 1}\ncitesFacts: [${spec.cites ?? []}]\nacknowledges: [${spec.acknowledges ?? []}]\nsetsAside: [${spec.setsAside ?? []}]\n---\nBody.\n`
      )
    )
  );

  const topic = await loadTopic('ordering', root);
  return topic.facts.map((f) => f.id);
}

test('fact order is derived from the viewpoints, round-robin by rank', async () => {
  assert.deepEqual(
    await loadOrdered(
      { a1: 'well-supported', a2: 'well-supported', b1: 'well-supported', shared: 'well-supported' },
      {
        // Both viewpoints rank `shared` first, so it takes round 1 alone and
        // costs both of them their turn; round 2 places one fact from each.
        alpha: { cites: ['shared', 'a1'], acknowledges: ['a2'] },
        beta: { cites: ['shared', 'b1'], acknowledges: ['a2'] },
      }
    ),
    ['shared', 'a1', 'b1', 'a2']
  );
});

test('facts nothing ranks fall to a tail in status order', async () => {
  assert.deepEqual(
    await loadOrdered(
      { keeper: 'well-supported', muddle: 'complicated', dunno: 'unknown', wrong: 'not-supported' },
      {
        one: { acknowledges: ['keeper'], setsAside: ['muddle', 'dunno', 'wrong'] },
        two: { acknowledges: ['keeper'], setsAside: ['muddle'] },
      }
    ),
    ['keeper', 'muddle', 'dunno', 'wrong']
  );
});

test('viewpoints render in their explicit order, not in id order', async () => {
  const root = await fixtureCopy();
  // `one` is order 1 and `two` order 2 in the fixture; swap them and the
  // section must swap too, even though the ids sort the other way.
  for (const [file, order] of [
    ['one.md', 2],
    ['two.md', 1],
  ] as const) {
    const p = path.join(root, 'example', 'viewpoints', file);
    const text = await readFile(p, 'utf8');
    await writeFile(p, text.replace(/^order: \d+$/m, `order: ${order}`));
  }
  const topic = await loadTopic('example', root);
  assert.deepEqual(
    topic.viewpoints.map((v) => v.id),
    ['two', 'one']
  );
});

test('a viewpoint with no order is rejected', async () => {
  const root = await fixtureCopy();
  const p = path.join(root, 'example', 'viewpoints', 'one.md');
  const text = await readFile(p, 'utf8');
  await writeFile(p, text.replace(/^order: \d+\n/m, ''));
  await assert.rejects(() => loadTopic('example', root), (e: Error) => {
    assert.ok(e instanceof ContentError);
    assert.match(e.message, /one\.md/);
    assert.match(e.message, /order/);
    return true;
  });
});

test('a fact may no longer carry an order — the field is gone from the model', async () => {
  const root = await fixtureCopy();
  const p = path.join(root, 'example', 'facts', 'alpha.md');
  const text = await readFile(p, 'utf8');
  await writeFile(p, text.replace('claim: Alpha is established', 'claim: Alpha is established\norder: 1'));
  const topic = await loadTopic('example', root);
  assert.equal('order' in topic.facts[0], false);
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

test('two topics resolve one shared definition and both pick up edits without leaking other principles', async () => {
  const root = await fixtureCopy();
  await cp(path.join(root, 'example'), path.join(root, 'second'), { recursive: true });
  const sharedRoot = path.join(root, '..', 'principles');
  await writeFile(path.join(sharedRoot, 'unused.md'), '---\nname: Unused\n---\nAnother ideal.\n');
  const first = await loadTopic('example', root);
  const second = await loadTopic('second', root);
  assert.deepEqual(first.principles, second.principles);
  assert.deepEqual(first.principles.map((p) => p.id), ['fairness']);
  assert.equal('heldBy' in first.principles[0], false);
  assert.equal((await loadPrinciples(sharedRoot)).length, 2);

  await writeFile(path.join(sharedRoot, 'fairness.md'), '---\nname: Equal treatment\n---\nTreat people fairly.\n');
  for (const slug of ['example', 'second']) {
    const topic = await loadTopic(slug, root);
    assert.equal(topic.principles[0].name, 'Equal treatment');
    assert.equal(topic.principles[0].body, 'Treat people fairly.');
    assert.equal(topic.principles[0].id, 'fairness');
  }
});

test('a topic reference to a missing shared principle fails with its ID and topic file', async () => {
  const root = await fixtureCopy();
  await rm(path.join(root, '..', 'principles', 'fairness.md'));
  await assert.rejects(() => loadTopic('example', root), /topic\.md: references unknown shared principle "fairness"/);
});

test('a viewpoint cannot use a catalog principle that its topic does not list', async () => {
  const root = await fixtureCopy();
  const file = path.join(root, 'example', 'topic.md');
  await writeFile(file, (await readFile(file, 'utf8')).replace('principles: [fairness]', 'principles: []'));
  await assert.rejects(() => loadTopic('example', root), /viewpoint one: references unknown principle "fairness"/);
});

test('malformed shared definitions and obsolete local definitions fail explicitly', async () => {
  const root = await fixtureCopy();
  const file = path.join(root, '..', 'principles', 'fairness.md');
  await writeFile(file, '---\nname: Fairness\nheldBy: [one]\n---\n');
  await assert.rejects(() => loadTopic('example', root), /fairness\.md:.*heldBy/);
  await writeFile(file, '---\nname: Fairness\n---\n');
  await mkdir(path.join(root, 'example', 'principles'));
  await assert.rejects(() => loadTopic('example', root), /move topic-local principles/);
});
