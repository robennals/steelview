import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTopic } from './validate';
import type { Topic, Fact, Viewpoint, Principle, Crux, Series, FigureKind, FigureOf } from './types';
import { figureExamplesTopic } from './__fixtures__/figure-examples';

function fact(over: Partial<Fact> & { id: string }): Fact {
  return {
    claim: 'A claim',
    status: 'well-supported',
    sources: [
      {
        stance: 'supports',
        quote: 'q',
        title: 't',
        url: 'https://example.org/a',
        publisher: 'p',
        date: '2024',
      },
    ],
    body: 'What it measures, how it compares, how confident to be.',
    ...over,
  };
}

function viewpoint(over: Partial<Viewpoint> & { id: string }): Viewpoint {
  return {
    name: 'A viewpoint',
    summary: 'One line.',
    order: 1,
    body: 'The argument.',
    ...over,
  };
}

function principle(over: Partial<Principle> & { id: string }): Principle {
  return { name: 'A principle', body: '', ...over };
}

function crux(over: Partial<Crux> & { id: string }): Crux {
  return {
    question: 'A question?',
    kind: 'prediction',
    divides: [],
    positions: [],
    body: '',
    ...over,
  };
}

/** A topic that satisfies every rule; each test perturbs one thing. */
function soundTopic(): Topic {
  return {
    slug: 'example',
    title: 'Example',
    subtitle: 'Sub',
    lastUpdated: '2026-08-18',
    intro: 'Intro.',
    facts: [fact({ id: 'alpha' }), fact({ id: 'gamma' })],
    viewpoints: [
      viewpoint({ id: 'one' }),
      viewpoint({ id: 'two' }),
    ],
    principles: [principle({ id: 'fairness' })],
    cruxes: [
      crux({
        id: 'timing',
        divides: ['one', 'two'],
        positions: [
          { viewpoint: 'one', holds: 'Soon.' },
          { viewpoint: 'two', holds: 'Later.' },
        ],
      }),
    ],
  };
}

test('a sound topic produces no errors', () => {
  assert.deepEqual(validateTopic(soundTopic()), []);
});

test('rule 1: a crux position may not reference an unknown viewpoint', () => {
  const t = soundTopic();
  t.cruxes[0].positions[0].viewpoint = 'nope';
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('nope') && e.includes('position')), errors.join('\n'));
});

test('rule 3: a well-supported fact needs at least one source', () => {
  const t = soundTopic();
  t.facts[0].sources = [];
  assert.ok(validateTopic(t).some((e) => e.includes('alpha') && e.includes('source')));
});

test('rule 3: a complicated fact needs a source too — every status does', () => {
  // The old rule only covered well-supported and not-supported, so a
  // `complicated` or `unknown` fact could ship as a bare assertion in a badge.
  const t = soundTopic();
  t.facts.push(fact({ id: 'delta', status: 'complicated', sources: [] }));
  t.viewpoints[0].setsAside = ['delta'];
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('delta') && e.includes('source')), errors.join('\n'));
});

test('rule 4: every fact needs a body, whatever its status', () => {
  const t = soundTopic();
  t.facts[0].body = '   ';
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('alpha') && e.includes('body')), errors.join('\n'));
});

test('rule 4: a well-supported fact with no body is rejected, not waved through', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'delta', body: '' }));
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('delta') && e.includes('body')), errors.join('\n'));
});

test('rule 5: a contested fact needs sources on both sides', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'delta', status: 'contested', body: '' }));
  t.viewpoints[0].setsAside = ['delta'];
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('delta') && e.includes('contests')), errors.join('\n'));
  assert.ok(errors.some((e) => e.includes('delta') && e.includes('body')), errors.join('\n'));
});

test('rule 7: a crux must give a position for every viewpoint it divides', () => {
  const t = soundTopic();
  t.cruxes[0].positions = [{ viewpoint: 'one', holds: 'Soon.' }];
  assert.ok(validateTopic(t).some((e) => e.includes('timing') && e.includes('two')));
});

test('rule 7: a crux may not divide an unknown viewpoint', () => {
  const t = soundTopic();
  t.cruxes[0].divides = ['one', 'nope'];
  assert.ok(validateTopic(t).some((e) => e.includes('nope')));
});

test('rule 7: a crux may not give a position for a viewpoint it does not divide', () => {
  const t = soundTopic();
  t.cruxes[0].divides = ['one', 'two'];
  t.cruxes[0].positions.push({ viewpoint: 'three', holds: 'A third position.' });
  t.viewpoints.push(
    viewpoint({ id: 'three', citesFacts: ['alpha'], acknowledges: ['gamma'], principles: ['fairness'] })
  );
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('three') && e.includes('divides')), errors.join('\n'));
});

test.skip('rule 8: a fact no viewpoint references is an orphan', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'lonely' }));
  assert.ok(validateTopic(t).some((e) => e.includes('lonely') && e.includes('orphan')));
});

test('rule 8: setsAside is enough to keep a fact from being an orphan', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'sidelined', status: 'complicated' }));
  t.viewpoints[0].setsAside = ['sidelined'];
  assert.deepEqual(validateTopic(t), []);
});

test('rule 8: a supporting fact is exempt from the orphan rule', () => {
  // Its parent is what justifies it being on the page, and it is read inside
  // that parent — so no viewpoint has to name it.
  const t = soundTopic();
  t.facts.push(fact({ id: 'detail', supports: 'alpha' }));
  assert.deepEqual(validateTopic(t), []);
});

test.skip('rule 8: a headline fact is still an orphan if nothing references it', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'lonely-headline' }));
  t.facts.push(fact({ id: 'detail', supports: 'lonely-headline' }));
  assert.ok(
    validateTopic(t).some((e) => e.includes('lonely-headline') && e.includes('orphan')),
    'a headline fact no viewpoint uses does no work on the page'
  );
});

test('rule 11: supports must resolve to a fact in the same topic', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'detail', supports: 'no-such-fact' }));
  t.viewpoints[0].setsAside = ['detail'];
  assert.ok(
    validateTopic(t).some((e) => e.includes('detail') && e.includes('no-such-fact')),
    validateTopic(t).join('\n')
  );
});

test('rule 11: a fact may not support itself', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'detail', supports: 'detail' }));
  assert.ok(validateTopic(t).some((e) => e.includes('detail') && e.includes('supports itself')));
});

test('rule 11: the hierarchy is exactly one level deep — no chains', () => {
  // `grandchild -> child -> alpha`. Arbitrary nesting would produce a tree
  // nobody can hold in their head, so the chain is rejected rather than
  // silently flattened onto `alpha`.
  const t = soundTopic();
  t.facts.push(fact({ id: 'child', supports: 'alpha' }));
  t.facts.push(fact({ id: 'grandchild', supports: 'child' }));
  const errors = validateTopic(t);
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.ok(errors[0].includes('grandchild') && errors[0].includes('one level deep'), errors[0]);
});

test('rule 11: a two-fact cycle is rejected from both ends', () => {
  const t = soundTopic();
  t.facts = [fact({ id: 'alpha', supports: 'gamma' }), fact({ id: 'gamma', supports: 'alpha' })];
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.startsWith('fact alpha:')), errors.join('\n'));
  assert.ok(errors.some((e) => e.startsWith('fact gamma:')), errors.join('\n'));
});

test('a topic may employ a shared principle in a crux without a viewpoint claiming it', () => {
  const t = soundTopic();
  t.principles.push(principle({ id: 'care' }));
  t.cruxes[0].body = 'How does [care](#principle-care) apply?';
  assert.deepEqual(validateTopic(t), []);
});

test('rule 9: a topic needs at least 1 fact', () => {
  const t = soundTopic();
  t.facts = [];
  // Emptying facts also empties every viewpoint's fact lists, so no fact
  // rule fires — only rule 9 should be left.
  t.viewpoints.forEach((v) => {
    v.citesFacts = [];
    v.acknowledges = [];
    v.setsAside = [];
  });
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('at least 1 fact')),
    errors.join('\n')
  );
});

test('rule 9: a topic needs at least 2 viewpoints', () => {
  const t = soundTopic();
  t.viewpoints = [t.viewpoints[0]];
  t.cruxes = [];
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('at least 2 viewpoints')),
    errors.join('\n')
  );
});

test('a viewpoint can stop using a principle without changing its shared definition', () => {
  const t = soundTopic();
  t.viewpoints[0].principles = [];
  assert.deepEqual(validateTopic(t), []);
});

test('every error message names the offending item', () => {
  const t = soundTopic();
  t.viewpoints[0].citesFacts = ['nope'];
  for (const error of validateTopic(t)) assert.match(error, /viewpoint |fact |principle |crux /);
});

test('rule 12: a body linking to a fact that does not exist is reported', () => {
  const t = soundTopic();
  t.cruxes[0].body = 'As [shown here](#fact-nope), the sides differ.';
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('crux timing') && e.includes('#fact-nope')),
    errors.join('\n')
  );
});

test('rule 12: a dead citation in a fact body is reported too', () => {
  const t = soundTopic();
  t.facts[0].body = 'Compare [this](#fact-nope).';
  assert.ok(validateTopic(t).some((e) => e.includes('fact alpha') && e.includes('#fact-nope')));
});

test('rule 12: a citation of a real fact is accepted', () => {
  const t = soundTopic();
  t.principles[0].body = 'See [alpha](#fact-alpha).';
  assert.deepEqual(validateTopic(t), []);
});

test('rule 13: a viewpoint may cite a fact it lists', () => {
  const t = soundTopic();
  t.viewpoints[0].body = 'It rests on [alpha](#fact-alpha) and concedes [gamma](#fact-gamma).';
  assert.deepEqual(validateTopic(t), []);
});

test('rule 13: a viewpoint may cite a fact it only sets aside', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'delta', status: 'complicated' }));
  t.viewpoints[0].setsAside = ['delta'];
  t.viewpoints[0].body = 'It does not lean on [delta](#fact-delta).';
  assert.deepEqual(validateTopic(t), []);
});

test.skip('rule 13: a viewpoint may not cite a fact missing from all three lists', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'delta' }));
  t.viewpoints[1].setsAside = ['delta']; // referenced somewhere, so not an orphan
  t.viewpoints[0].body = 'It leans on [delta](#fact-delta).';
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('viewpoint one') && e.includes('delta') && e.includes('citesFacts')),
    errors.join('\n')
  );
});

test('rule 13: citing a supporting fact counts when its parent is listed', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'alpha-detail', supports: 'alpha' }));
  t.viewpoints[0].body = 'The detail is [here](#fact-alpha-detail).';
  assert.deepEqual(validateTopic(t), []);
});

test.skip('rule 13: citing a supporting fact whose parent is unlisted is reported', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'delta' }));
  t.facts.push(fact({ id: 'delta-detail', supports: 'delta' }));
  t.viewpoints[1].setsAside = ['delta'];
  t.viewpoints[0].body = 'The detail is [here](#fact-delta-detail).';
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('viewpoint one') && e.includes('delta-detail') && e.includes('"delta"')),
    errors.join('\n')
  );
});

test('rule 13 does not apply to fact, principle or crux bodies', () => {
  const t = soundTopic();
  t.facts[0].body = 'Compare [gamma](#fact-gamma).';
  t.cruxes[0].body = 'Compare [alpha](#fact-alpha).';
  assert.deepEqual(validateTopic(t), []);
});

/* ------------------------------------------------------- rule 14: series */

function series(over: Partial<Series> = {}): Series {
  return {
    title: 'A series',
    description: 'What it shows.',
    periodLabel: 'Year',
    coverage: { from: '1990', to: '1993' },
    breaks: [],
    events: [],
    source: {
      stance: 'supports',
      quote: 'q',
      title: 't',
      url: 'https://example.org/data.xlsx',
      publisher: 'p',
      date: '2024',
    },
    readings: [
      {
        id: 'people',
        label: 'In people',
        unit: 'count',
        valueLabel: 'People a year',
        lines: [
          {
            name: 'Immigration',
            points: [
              { period: '1990', value: 10 },
              { period: '1991', value: 20 },
              { period: '1992', value: 30 },
              { period: '1993', value: 40 },
            ],
          },
        ],
      },
    ],
    ...over,
  };
}

function topicWithSeries(over: Partial<Series> = {}): Topic {
  const t = soundTopic();
  t.facts[0].series = series(over);
  return t;
}

test('rule 14: a full-coverage series produces no errors', () => {
  assert.deepEqual(validateTopic(topicWithSeries()), []);
});

test('rule 14: a series trimmed to a window inside its declared coverage fails', () => {
  const t = topicWithSeries();
  t.facts[0].series!.readings[0].lines[0].points.shift();
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('starts at "1991"') && e.includes('publishes from "1990"')),
    errors.join('\n')
  );
});

test('rule 14: a series that stops short of its declared coverage fails', () => {
  const t = topicWithSeries();
  t.facts[0].series!.readings[0].lines[0].points.pop();
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('ends at "1992"') && e.includes('publishes to "1993"')),
    errors.join('\n')
  );
});

test('rule 14: every line of every reading is checked against the coverage', () => {
  const t = topicWithSeries();
  const reading = t.facts[0].series!.readings[0];
  reading.lines.push({
    name: 'Net migration',
    points: [
      { period: '1992', value: 1 },
      { period: '1993', value: 2 },
    ],
  });
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('line "Net migration"') && e.includes('starts at "1992"')),
    errors.join('\n')
  );
});

test('rule 14: out-of-order and repeated points are reported', () => {
  const t = topicWithSeries();
  t.facts[0].series!.readings[0].lines[0].points[2].period = '1990';
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('ascending order with no repeats')),
    errors.join('\n')
  );
});

test('rule 14: backwards coverage is reported', () => {
  const t = topicWithSeries({ coverage: { from: '1993', to: '1990' } });
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('coverage runs backwards')), errors.join('\n'));
});

test('rule 14: an event marked outside the coverage is reported', () => {
  const t = topicWithSeries({
    events: [{ period: '2001', label: 'law takes effect' }],
  });
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('event at "2001"') && e.includes('outside the declared coverage')),
    errors.join('\n')
  );
});

test('rule 14: an event inside the final year of a year-precision coverage is accepted', () => {
  const t = topicWithSeries({
    events: [{ period: '1993-03', label: 'law takes effect' }],
  });
  const errors = validateTopic(t);
  assert.ok(!errors.some((e) => e.includes('event at')), errors.join('\n'));
});

test('rule 14: a break annotated outside the coverage is reported', () => {
  const t = topicWithSeries({
    breaks: [{ period: '2001', label: 'method change', note: 'the source changed basis' }],
  });
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('break at "2001"') && e.includes('outside the declared coverage')),
    errors.join('\n')
  );
});

test('rule 14: two readings may not share an id', () => {
  const t = topicWithSeries();
  const s = t.facts[0].series!;
  s.readings.push({ ...s.readings[0] });
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('two readings with id "people"')), errors.join('\n'));
});

test('rule 14: mixed period granularity orders the way a reader would order it', () => {
  const t = topicWithSeries({
    coverage: { from: '1990', to: '1993-06' },
    readings: [
      {
        id: 'people',
        label: 'In people',
        unit: 'count',
        valueLabel: 'People a year',
        lines: [
          {
            name: 'Immigration',
            points: [
              { period: '1990', value: 1 },
              { period: '1990-06', value: 2 },
              { period: '1993-06', value: 3 },
            ],
          },
        ],
      },
    ],
  });
  assert.deepEqual(validateTopic(t), []);
});

test('evidence targets and source footnotes must resolve, including summaries', () => {
  const topic = soundTopic();
  topic.facts[0].body = '## Context {#alpha--context}\n\nMeasured. [1](#source-alpha-1)';
  topic.viewpoints[0].summary = '[finding](#fact-alpha/context)';
  assert.deepEqual(validateTopic(topic), []);
  topic.viewpoints[0].summary = '[finding](#fact-alpha/missing)';
  assert.ok(validateTopic(topic).some(error => error.includes('unknown section')));
  topic.facts[0].claimSources = [9];
  topic.facts[0].body += '\n[9](#source-alpha-9)';
  assert.ok(validateTopic(topic).some(error => error.includes('unknown lead source')));
  assert.ok(validateTopic(topic).some(error => error.includes('unknown source reference')));
});

test('comparison charts require valid citations and unique IDs', () => {
  const topic = soundTopic();
  const chart = { id: 'countries', title: 'Comparison', description: 'Same period', unit: 'count' as const, valueLabel: 'People', sources: [2], items: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] };
  topic.facts[0].comparisons = [chart, chart];
  const errors = validateTopic(topic);
  assert.ok(errors.some(e => e.includes('unknown comparison source 2')));
  assert.ok(errors.some(e => e.includes('duplicate comparison chart id countries')));
});

test('featured charts must come from supporting facts with visual evidence', () => {
  const topic = soundTopic();
  topic.facts[0].featuredCharts = ['gamma'];
  assert.ok(validateTopic(topic).some(e => e.includes('featured chart gamma')));
  topic.facts[1].supports = 'alpha';
  topic.facts[1].comparisons = [{ id: 'groups', title: 'Groups', description: 'Modelled values', unit: 'count', valueLabel: 'Count', sources: [1], items: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] }];
  topic.facts[0].body = '[The slice](#fact-gamma/chart-groups)';
  assert.ok(!validateTopic(topic).some(e => e.includes('featured chart') || e.includes('unknown section')));
});



test('comparison groups must cover every component and sum to the total', () => {
  const topic = soundTopic();
  const chart = { id: 'countries', title: 'Countries', description: 'Nationality', unit: 'count' as const, valueLabel: 'People', sources: [1], groups: ['EU', 'Non-EU'], defaultGroup: 1, items: [{ label: 'A', value: 10, values: [3, 7] }, { label: 'B', value: 20, values: [5, 15] }] };
  topic.facts[0].comparisons = [chart];
  assert.deepEqual(validateTopic(topic), []);
  chart.items[0].values = [3, 6];
  assert.ok(validateTopic(topic).some(e => e.includes('sum to the total')));
  chart.defaultGroup = 2;
  assert.ok(validateTopic(topic).some(e => e.includes('invalid default comparison group')));
});

test('related facts permit contextual connections but must resolve', () => {
  const topic = soundTopic();
  topic.facts[0].relatedFacts = [topic.facts[1].id];
  assert.deepEqual(validateTopic(topic), []);
  topic.facts[0].relatedFacts.push('missing');
  assert.ok(validateTopic(topic).some(error => error.includes('related fact missing')));
});

test('additional datasets validate their own coverage and share the fact source list', () => {
  const topic = topicWithSeries();
  const extra = { id: 'nationality', ...series() };
  extra.readings[0].id = 'nationality-arrivals';
  topic.facts[0].additionalSeries = [extra];
  topic.facts[0].claimSources = [3];
  assert.deepEqual(validateTopic(topic), []);
  extra.readings[0].lines[0].points.shift();
  assert.ok(validateTopic(topic).some(error => error.includes('starts at')));
});

test('datasets cannot reuse reading IDs, which would make observation links ambiguous', () => {
  const topic = topicWithSeries();
  topic.facts[0].additionalSeries = [{ id: 'nationality', ...series() }];
  assert.ok(validateTopic(topic).some(error => error.includes('chart IDs must be unique')));
});

/* ----------------------------------------------------- figures (F1–F12) */

/** The fixture fact's figure of `kind` (and `id`), to perturb in place. */
function figureOf<K extends FigureKind>(fact: Fact, kind: K, id?: string): FigureOf<K> {
  const found = fact.figures?.find((f): f is FigureOf<K> => f.kind === kind && (id === undefined || ('id' in f && f.id === id)));
  if (!found) throw new Error(`no ${kind} figure ${id ?? ''}`);
  return found;
}

/** A sound topic holding the figure fixture, and its fact to perturb. */
function figuresTopic() {
  const topic = figureExamplesTopic();
  return { topic, fact: topic.facts[0] };
}

const hasError = (topic: Topic, text: string) => validateTopic(topic).some(e => e.includes(text));

test('the figure fixture is sound', () => {
  assert.deepEqual(validateTopic(figureExamplesTopic()), []);
});

test('F1: a figure id may not repeat another figure, chart or reading id', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'keyFigures').id = 'federal-laws';
  assert.ok(hasError(topic, 'figure federal-laws: id "federal-laws" is already used'));
  figureOf(fact, 'keyFigures').id = 'rejected-share';
  assert.ok(hasError(topic, 'figure rejected-share: id "rejected-share" is already used'));
});

test('F2: every figure citation is one of the fact\'s numbered sources', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'timeline').events[0].source = 99;
  assert.ok(hasError(topic, 'figure court-record: cites source 99, but the fact has 27'));
});

test('F3: once present, figures place every chart exactly once and nothing else', () => {
  const { topic, fact } = figuresTopic();
  fact.figures = (fact.figures ?? []).filter(f => f.kind !== 'comparison');
  assert.ok(hasError(topic, 'figures must place comparison "senate-votes" exactly once (found 0)'));
  fact.figures.push({ kind: 'series' });
  assert.ok(hasError(topic, 'figures must place the series exactly once (found 2)'));
  fact.figures.push({ kind: 'comparison', id: 'nope' }, { kind: 'featured', fact: 'mail-ballot-privacy' });
  assert.ok(hasError(topic, 'references comparison "nope", which this fact does not have'));
  assert.ok(hasError(topic, 'references featured chart "mail-ballot-privacy", which this fact does not have in featuredCharts'));
});

test('F4: a section figure names an h2 in the body', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'section').id = 'no-such-section';
  assert.ok(hasError(topic, 'figure no-such-section: no body section headed'));
});

test('F5: every figure but a caveat list cites a source', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'barChart').sources = [];
  assert.ok(hasError(topic, 'figure wa-by-race: cites no source'));
  for (const item of figureOf(fact, 'caveatList').items) item.sources = [];
  assert.ok(!hasError(topic, 'figure detected-is-a-floor: cites no source'));
});

test('F6: a data table\'s columns, rows, sort and highlight agree', () => {
  const { topic, fact } = figuresTopic();
  const table = figureOf(fact, 'dataTable');
  table.columns.push({ key: 'count', label: 'Count', format: { unit: 'count' } }, { key: 'year', label: 'Again' });
  table.rows[0].count = 'many';
  table.rows[1].stray = 'x';
  table.defaultSort = { key: 'missing', direction: 'ascending' };
  table.highlight = ['Not a row'];
  assert.ok(hasError(topic, 'figure federal-laws: column keys must be unique'));
  assert.ok(hasError(topic, 'row 1 column "count" has a numeric format'));
  assert.ok(hasError(topic, 'row 2 has key "stray", which is not a column'));
  assert.ok(hasError(topic, 'defaultSort key "missing" is not a column'));
  assert.ok(hasError(topic, 'highlight "Not a row" is not in the row-header column'));
  table.columns[0].rowHeader = true;
  assert.ok(hasError(topic, 'at most one column may be the row header'));
});

test('F7: timeline categories exist and periods run forwards', () => {
  const { topic, fact } = figuresTopic();
  const timeline = figureOf(fact, 'timeline');
  timeline.events[0].category = 'nope';
  timeline.events[1].endDate = '2020';
  const periods = figureOf(fact, 'periodTimeline');
  periods.rows[0].periods[0].to = '2026-01';
  periods.rows[1].periods[0].category = 'nope';
  periods.events[0].period = '2025-12';
  assert.ok(hasError(topic, 'has unknown category "nope"'));
  assert.ok(hasError(topic, 'event "Assadi convicted in Antwerp" ends before it starts'));
  assert.ok(hasError(topic, 'row "Ceasefire" has a period that ends before it starts'));
  assert.ok(hasError(topic, 'row "US naval blockade" has unknown category "nope"'));
  assert.ok(hasError(topic, 'is outside the axis'));
});

test('F8: at most six key figures, each change a finite number', () => {
  const { topic, fact } = figuresTopic();
  const keyFigures = figureOf(fact, 'keyFigures');
  keyFigures.figures = Array.from({ length: 7 }, () => ({ ...keyFigures.figures[1], change: { value: Number.NaN, comparison: 'on 2016' } }));
  assert.ok(hasError(topic, 'figure audit-recheck: at most six key figures'));
  assert.ok(hasError(topic, 'has a change that is not a finite number'));
});

test('F9: a tile map uses its preset\'s areas, ascending breaks, and explains a gap', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'tileMap');
  map.data = { ...map.data, XX: 1 };
  map.highlight = ['YY'];
  map.breaks = [0, 2, 1];
  map.domain = [5, 1];
  map.note = undefined;
  assert.ok(hasError(topic, '"XX" is not an area of us-states'));
  assert.ok(hasError(topic, 'highlight "YY" is not an area of us-states'));
  assert.ok(hasError(topic, 'breaks must be strictly ascending'));
  assert.ok(hasError(topic, 'domain must run from low to high'));
  assert.ok(hasError(topic, 'say why in `note`'));
});

test('F10: bars fit their axis, compositions their categories, estimates their order', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'barChart').domainMax = 1;
  const composition = figureOf(fact, 'compositionBar');
  composition.rows[0].values = { civilian: 0, nope: 0 };
  const estimates = figureOf(fact, 'estimateRange');
  estimates.estimates[0] = { ...estimates.estimates[0], low: 40, high: 30 };
  estimates.estimates[2] = { label: 'Empty', source: 16 };
  estimates.domain = [30, 41];
  assert.ok(hasError(topic, 'figure wa-by-race: domainMax must be at least every value'));
  assert.ok(hasError(topic, 'row "HRANA, 7 Apr" has unknown category "nope"'));
  assert.ok(hasError(topic, 'row "HRANA, 7 Apr" totals zero'));
  assert.ok(hasError(topic, '"AEI" must have low ≤ estimate ≤ high'));
  assert.ok(hasError(topic, '"Empty" needs an estimate, a low or a high'));
  assert.ok(hasError(topic, '"Department of Defense" falls outside the domain'));
});

test('F11: quotes and claims are verbatim, allowing omissions, curly quotes and case', () => {
  const { topic, fact } = figuresTopic();
  const pull = figureOf(fact, 'pullQuote');
  pull.quote.text = 'ABSENTEE ballots remain … source of potential voter fraud…';
  const compared = figureOf(fact, 'quoteComparison');
  compared.quotes[0].text = 'buried and we’re watching it';
  assert.deepEqual(validateTopic(topic), []);
  pull.quote.text = 'Absentee ballots are the largest source of voter fraud.';
  assert.ok(hasError(topic, 'figure carter-baker: "absentee ballots are the largest source of voter fraud." is not in the quote of source 21'));
  figureOf(fact, 'claimCheck').claim = 'Half of mail-in voters cheated';
  assert.ok(hasError(topic, 'figure one-in-five: "half of mail-in voters cheated" is not in the quote of source 22'));
});

test('F12: a claim check\'s evidence is a fact, and its section exists', () => {
  const { topic, fact } = figuresTopic();
  const check = figureOf(fact, 'claimCheck');
  check.evidence = { fact: 'mail-ballot-privacy', section: 'nope' };
  assert.ok(hasError(topic, 'unknown section "nope" in fact "mail-ballot-privacy"'));
  check.evidence = { fact: 'nope' };
  assert.ok(hasError(topic, 'evidence names "nope", which is not a fact in this topic'));
});

test('a viewpoint may cite a component figure by its chart id', () => {
  const { topic } = figuresTopic();
  topic.viewpoints[0].body = 'See [the rates](#fact-figure-examples/chart-wa-by-race).';
  assert.deepEqual(validateTopic(topic), []);
  topic.viewpoints[0].body = 'See [the rates](#fact-figure-examples/chart-nope).';
  assert.ok(hasError(topic, 'unknown section "chart-nope"'));
});
