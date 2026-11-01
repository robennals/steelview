import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listTopicSlugs, loadTopic } from './load';
import { factSlides, resolvePreviews } from './preview';
import { headlineFacts } from './rank-facts';
import { isComponentFigure } from './types';
import { observationGroups, renderWalkthroughs, viewpointWalkthrough } from './walkthrough';

test('resolvePreviews returns the UK slides in authored order, each linked to its chart on the fact page', async () => {
  const slides = resolvePreviews(await loadTopic('uk-immigration'));
  assert.deepEqual(slides.map(s => `${s.fact.id}/${s.chart}`), [
    'immigration-against-the-long-run/series',
    'immigration-economy-and-public-finances/lifetime-by-route',
    'immigration-housing-and-public-services/investment',
    'settlement-and-migrant-status/series',
    'integration-outcomes/series',
  ]);
  assert.equal(slides[0].label, slides[0].fact.series!.title);
  assert.equal(slides[0].reading, 'share-of-population');
  assert.equal(slides[0].href, '/topics/uk-immigration/facts/immigration-against-the-long-run#immigration-against-the-long-run--chart-series');
});

test('two charts from one fact get distinct labels', async () => {
  const slides = resolvePreviews(await loadTopic('uk-asylum'));
  assert.equal(new Set(slides.map(s => s.label)).size, slides.length);
});

test('a collection of laws walks through its tables, in the order its page shows them', async () => {
  const topic = await loadTopic('uk-asylum');
  const fact = topic.facts.find(f => f.id === 'asylum-law-and-the-echr')!;
  assert.deepEqual(factSlides('uk-asylum', fact).map(s => s.chart), fact.figures!.filter(isComponentFigure).map(f => f.id));
});

test('a citation of a chart by name picks that chart for its step', async () => {
  const topic = await loadTopic('uk-asylum');
  const viewpoint = topic.viewpoints.find(v => v.id === 'tighten-within-the-echr')!;
  const charts = viewpointWalkthrough(topic, { ...viewpoint, body: '### A step\n\n[The Bill](#fact-asylum-law-and-the-echr/chart-immigration-and-asylum-bill)' }).steps.map(s => s.chart?.chart);
  assert.deepEqual(charts, ['immigration-and-asylum-bill']);
});

test('every headline data collection has something to walk through', async () => {
  for (const slug of await listTopicSlugs()) {
    const topic = await loadTopic(slug);
    for (const fact of headlineFacts(topic.facts)) {
      assert.ok(factSlides(slug, fact).length > 0, `${slug}/${fact.id} has no charts`);
    }
  }
});

test('a step\'s citations open the panel chart they belong to', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.find(f => f.id === 'immigration-housing-and-public-services')!;
  const slides = factSlides(topic.slug, fact);
  const [first, second] = [...observationGroups(fact)].filter(([, key], i, all) => all.findIndex(([, k]) => k === key) === i);
  const viewpoint = topic.viewpoints[0];
  const body = `### A step\n\n[This](#fact-${fact.id}/${first[0]}), [that](#fact-${fact.id}/${second[0]}) and [the chart](#fact-${fact.id}/chart-${slides[3].chart}).`;
  const rendered = await renderWalkthroughs({ ...topic, viewpoints: [{ ...viewpoint, body }] });
  const [step] = rendered.get(viewpoint.id)!.steps;

  assert.equal(step.panel?.observation, `${fact.id}--${first[0]}`);
  const links = [...step.html.matchAll(/data-panel-observation="([^"]*)" data-panel-slide="(\d+)"/g)];
  assert.deepEqual(links.map(([, observation]) => observation), [`${fact.id}--${first[0]}`, `${fact.id}--${second[0]}`, `${fact.id}--chart-${slides[3].chart}`]);
  assert.equal(Number(links[2][2]), 3);
  assert.notEqual(links[0][2], links[1][2]);
});

test('a citation of a subtlety opens the chart the subtlety belongs to', async () => {
  const topic = await loadTopic('us-iran-war');
  const viewpoint = topic.viewpoints[0];
  const fact = topic.facts.find(f => f.id === 'iran-nuclear-programme')!;
  const body = `### A step\n\n[Not weapons grade](#fact-${fact.id}/sixty-is-not-ninety).`;
  const rendered = await renderWalkthroughs({ ...topic, viewpoints: [{ ...viewpoint, body }] });
  const slide = factSlides(topic.slug, fact).findIndex(s => s.chart === 'sixty-percent-stock' || s.reading === 'sixty-percent');
  assert.ok(slide >= 0);
  assert.match(rendered.get(viewpoint.id)!.steps[0].html, new RegExp(`data-panel-slide="${slide}"`));
});

test('a citation with no chart in a panel still opens its report', async () => {
  const topic = await loadTopic('uk-immigration');
  const viewpoint = topic.viewpoints[0];
  const body = '### A step\n\n[Unmeasured](#fact-work-and-study-routes/exploitation-not-measured).';
  const rendered = await renderWalkthroughs({ ...topic, viewpoints: [{ ...viewpoint, body }] });
  const [step] = rendered.get(viewpoint.id)!.steps;
  assert.match(step.html, /data-fact-id="work-and-study-routes"/);
  assert.doesNotMatch(step.html, /data-panel-link/);
});
