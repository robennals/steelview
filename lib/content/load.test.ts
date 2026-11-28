import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises';
import os from 'node:os';
import { loadTopic, listTopicSlugs, ContentError } from './load';

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
  return root;
}

test('loads every item in a topic', async () => {
  const topic = await loadTopic('example', FIXTURES);
  assert.equal(topic.slug, 'example');
  assert.equal(topic.title, 'Example');
  assert.equal(topic.intro, 'The introduction to the example topic.');
  assert.equal(topic.facts.length, 3);
  assert.equal(topic.viewpoints.length, 2);
  assert.equal(topic.cruxes.length, 1);
});

test('an item id is its filename without the extension', async () => {
  const topic = await loadTopic('example', FIXTURES);
  // Headline Data follows the explicit order in topic.md.
  assert.deepEqual(
    topic.facts.map((f) => f.id),
    ['alpha', 'beta', 'gamma']
  );
});

test('frontmatter and body are both loaded', async () => {
  const topic = await loadTopic('example', FIXTURES);
  const one = topic.viewpoints.find((v) => v.id === 'one');
  assert.equal(one?.name, 'One');
  assert.equal(one?.summary, 'The first viewpoint, in a line.');
  assert.equal(one?.body, '### The argument\n\n[Alpha is higher in the first group](#fact-alpha/first-group-higher), which is why it matters now.');
  assert.deepEqual(one?.visuals?.get('The argument'), { cite: '#fact-alpha/first-group-higher', kind: 'comparison', title: 'Alpha by group' });
});

test('the example topic passes the publication check', async () => {
  await assert.doesNotReject(() => loadTopic('example', FIXTURES, { validateIntegrity: true }));
});

test('an item with no body loads with an empty string body', async () => {
  // Facts must carry a body, but the other kinds may
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

test('a viewpoint joins its text with its links file, and reports a link left in the text', async () => {
  const root = await fixtureCopy();
  const dir = path.join(root, 'example', 'viewpoints');
  await writeFile(path.join(dir, 'one.md'), '---\nname: One\ndraft: ai\n---\nLead.\n\n### A card\n\nAlpha is cited. [Beta](#fact-beta) is not.\n');
  await writeFile(
    path.join(dir, 'one.links.yaml'),
    'cards:\n  - heading: A card\n    citations:\n      - phrase: Alpha\n        href: "#fact-alpha"\n'
  );
  const one = (await loadTopic('example', root)).viewpoints.find((v) => v.id === 'one')!;
  assert.equal(one.draft, 'ai');
  assert.equal(one.summary, 'Lead.');
  assert.equal(one.body, '### A card\n\n[Alpha](#fact-alpha) is cited. [Beta](#fact-beta) is not.');
  assert.deepEqual(one.linkErrors, ['the text links [Beta](#fact-beta); citations go in one.links.yaml']);
});

test('cross-reference integrity is deferred until the publication check', async () => {
  const root = await fixtureCopy();
  const links = path.join(root, 'example', 'viewpoints', 'one.links.yaml');
  await writeFile(links, (await readFile(links, 'utf8')).replace('href: "#fact-alpha/', 'href: "#fact-ghost/'));
  await assert.doesNotReject(() => loadTopic('example', root));
  await assert.rejects(() => loadTopic('example', root, { validateIntegrity: true }), (e: Error) => {
    assert.ok(e instanceof ContentError);
    assert.equal(e.message, [
      'Topic "example" has 2 problem(s):',
      '  - viewpoint one: body links to "#fact-ghost", which is not a fact in this topic',
      "  - topic: viewpoint one cites none of the preview charts' facts — add a chart it relies on to previewCharts",
    ].join('\n'));
    return true;
  });
});

test('a links file that does not parse fails the load, naming the file', async () => {
  for (const text of ['cards: [unclosed\n', 'cards:\n  - heading: The argument\n    citations: not-a-list\n']) {
    const root = await fixtureCopy();
    await writeFile(path.join(root, 'example', 'viewpoints', 'one.links.yaml'), text);
    await assert.rejects(() => loadTopic('example', root), (e: Error) => {
      assert.ok(e instanceof ContentError, `${e.name}: ${e.message}`);
      assert.match(e.message, /one\.links\.yaml: /);
      return true;
    });
  }
});

test('a viewpoint with no links file loads unlinked, and only the publication check reports it', async () => {
  const root = await fixtureCopy();
  await rm(path.join(root, 'example', 'viewpoints', 'one.links.yaml'));
  const one = (await loadTopic('example', root)).viewpoints.find((v) => v.id === 'one')!;
  assert.equal(one.body, '### The argument\n\nAlpha is higher in the first group, which is why it matters now.');
  assert.equal(one.visuals?.size, 0);
  assert.deepEqual(one.linkErrors, ['card "The argument" has no entry in the links file']);
  assert.deepEqual(one.unverified, ['the summary has not been checked against its evidence', 'card "The argument" has not been checked against its evidence']);
  await assert.rejects(() => loadTopic('example', root, { validateIntegrity: true }), ContentError);
});

test('a topic with no cruxes directory loads with an empty cruxes array', async () => {
  const root = await tempTopicsRoot();
  const dir = path.join(root, 'bare');
  await mkdir(path.join(dir, 'facts'), { recursive: true });
  await mkdir(path.join(dir, 'viewpoints'), { recursive: true });
  await writeFile(
    path.join(dir, 'topic.md'),
    '---\ntitle: Bare\nsubtitle: s\nlastUpdated: 2026-08-18\ntags: [Example]\nfirstPublished: 2026-08-18\npreviewCharts: [{fact: a, chart: series}]\n---\nIntro.\n'
  );
  await writeFile(
    path.join(dir, 'facts', 'a.md'),
    '---\nclaim: A\nstatus: well-supported\nsources:\n  - stance: supports\n    quote: q\n    title: t\n    url: https://example.org/a\n    publisher: p\n    date: "2024"\n---\nContext for A.\n'
  );
  await writeFile(
    path.join(dir, 'viewpoints', 'v.md'),
    '---\nname: V\n---\nBody.\n'
  );
  // A topic needs at least two viewpoints.
  await writeFile(
    path.join(dir, 'viewpoints', 'v2.md'),
    '---\nname: V2\n---\nBody.\n'
  );
  const topic = await loadTopic('bare', root);
  assert.deepEqual(topic.cruxes, []);
});

test('unquoted YAML dates in source frontmatter normalize to strings, not Date or number', async () => {
  const root = await tempTopicsRoot();
  const dir = path.join(root, 'dates');
  await mkdir(path.join(dir, 'facts'), { recursive: true });
  await mkdir(path.join(dir, 'viewpoints'), { recursive: true });
  await writeFile(
    path.join(dir, 'topic.md'),
    '---\ntitle: Dates\nsubtitle: s\nlastUpdated: 2026-08-18\ntags: [Example]\nfirstPublished: 2026-08-18\npreviewCharts: [{fact: a, chart: series}]\n---\nIntro.\n'
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
    '---\nname: V\n---\nBody.\n'
  );
  // A topic needs at least two viewpoints.
  await writeFile(
    path.join(dir, 'viewpoints', 'v2.md'),
    '---\nname: V2\n---\nBody.\n'
  );
  const topic = await loadTopic('dates', root);
  const fact = topic.facts[0];
  assert.equal(fact.sources[0].date, '2024-11-28');
  assert.equal(fact.sources[1].date, '2024');
});

test('viewpoints are built in order of name, not of id', async () => {
  const root = await fixtureCopy();
  // Renamed so the names sort the other way from the ids.
  for (const [file, name] of [
    ['one.md', 'Zed'],
    ['two.md', 'Alpha'],
  ] as const) {
    const p = path.join(root, 'example', 'viewpoints', file);
    const text = await readFile(p, 'utf8');
    await writeFile(p, text.replace(/^name: .*$/m, `name: ${name}`));
  }
  const topic = await loadTopic('example', root);
  assert.deepEqual(
    topic.viewpoints.map((v) => v.id),
    ['two', 'one']
  );
});

test('a viewpoint carrying a field the format has dropped is rejected', async () => {
  const root = await fixtureCopy();
  const p = path.join(root, 'example', 'viewpoints', 'one.md');
  const text = await readFile(p, 'utf8');
  await writeFile(p, text.replace(/^name: .*$/m, '$&\norder: 1'));
  await assert.rejects(() => loadTopic('example', root), (e: Error) => {
    assert.ok(e instanceof ContentError);
    assert.match(e.message, /one\.md/);
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

