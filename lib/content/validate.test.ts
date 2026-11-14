import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compositionSumError, evidenceErrors, validateTopic } from './validate';
import type { Topic, Fact, Viewpoint, Principle, Crux, Series, FigureKind, FigureOf } from './types';
import { figureExamplesFact, figureExamplesTopic } from './__fixtures__/figure-examples';
import { factSources } from './sources';
import { US_STATE_TILES } from '../../components/report/geo/tiles';

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
    shortName: 'A view',
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
    title: 'A question?',
    tension: 'Two good things pull apart.',
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
    firstPublished: '2026-08-18',
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

test('a crux may not have a body', () => {
  const t = soundTopic();
  t.cruxes[0].body = 'A long argument about which should win.';
  assert.ok(validateTopic(t).some((e) => e.includes('a crux has no body')));
});

test('a tension stays short and carries no figures or links', () => {
  const t = soundTopic();
  t.cruxes[0].tension = 'word '.repeat(46);
  assert.ok(validateTopic(t).some((e) => e.includes('tension is over 45 words')));
  t.cruxes[0].tension = 'Nearly 60% agree.';
  assert.ok(validateTopic(t).some((e) => e.includes('figures or links')));
  t.cruxes[0].tension = 'As [shown](#fact-alpha).';
  assert.ok(validateTopic(t).some((e) => e.includes('figures or links')));
});

test('a position in a crux stays short', () => {
  const t = soundTopic();
  t.cruxes[0].positions[0].holds = 'word '.repeat(26);
  assert.ok(validateTopic(t).some((e) => e.includes('is over 25 words')));
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
  t.viewpoints[0].body = 'As [shown here](#fact-nope), the sides differ.';
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('viewpoint one') && e.includes('#fact-nope')),
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

test('a viewpoint lists every claim it marks #needed', () => {
  const t = soundTopic();
  t.viewpoints[0].body = 'It holds that [trust takes time](#needed).';
  t.viewpoints[0].researchNeeded = ['trust takes time'];
  assert.deepEqual(validateTopic(t), []);
});

test('a #needed mark missing from researchNeeded is reported', () => {
  const t = soundTopic();
  t.viewpoints[0].body = 'It holds that [trust takes time](#needed).';
  assert.deepEqual(validateTopic(t), [
    `viewpoint ${t.viewpoints[0].id}: "trust takes time" is marked #needed but missing from researchNeeded`,
  ]);
});

test('a researchNeeded claim with no #needed mark is reported', () => {
  const t = soundTopic();
  t.viewpoints[0].researchNeeded = ['trust takes time'];
  assert.deepEqual(validateTopic(t), [
    `viewpoint ${t.viewpoints[0].id}: researchNeeded lists "trust takes time", which no #needed link in the body marks`,
  ]);
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

test('rule 13 does not apply to fact or principle bodies', () => {
  const t = soundTopic();
  t.facts[0].body = 'Compare [gamma](#fact-gamma).';
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
    events: [{ period: '2001', label: 'law takes effect', sources: [] }],
  });
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('event at "2001"') && e.includes('outside the declared coverage')),
    errors.join('\n')
  );
});

test('rule 14: an event inside the final year of a year-precision coverage is accepted', () => {
  const t = topicWithSeries({
    events: [{ period: '1993-03', label: 'law takes effect', sources: [] }],
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
  topic.facts[0].body = '### Context {#alpha--context}\n\nMeasured. [1](#source-alpha-1)';
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

test('two charts in one report may not share a title', () => {
  const topic = soundTopic();
  const chart = (id: string, title: string) => ({ id, title, description: 'd', unit: 'count' as const, valueLabel: 'People', sources: [1], items: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] });
  topic.facts[0].comparisons = [chart('first', 'Arrivals'), chart('second', 'Departures')];
  assert.ok(!validateTopic(topic).some(e => e.includes('two charts are titled')));
  topic.facts[0].comparisons = [chart('first', 'Arrivals'), chart('second', 'Arrivals')];
  assert.ok(validateTopic(topic).some(e => e.includes('two charts are titled "Arrivals"')));
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
  const extra = { id: 'nationality', ...series(), title: 'Arrivals by nationality' };
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

test('the fixture claim check points at evidence the fixture itself holds, with no stub fact beside it', () => {
  const topic = figureExamplesTopic();
  assert.deepEqual(topic.facts.map(f => f.id), ['figure-examples']);
  assert.equal(figureOf(topic.facts[0], 'claimCheck').evidence?.fact, 'figure-examples');
});

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
  figureOf(fact, 'timeline').events[0].sources = [99];
  assert.ok(hasError(topic, `figure court-record: cites source 99, but the fact has ${factSources(fact).length}`));
});

test('F2: every number in an item\'s `sources` is checked, not only the first', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'timeline').events[0].sources = [3, 98];
  figureOf(fact, 'keyFigures').figures[0].sources = [11, 97];
  figureOf(fact, 'periodTimeline').rows[0].periods[0].sources = [2, 96];
  const errors = validateTopic(topic);
  for (const n of [98, 97, 96]) assert.ok(errors.some(e => e.includes(`cites source ${n}, but the fact has ${factSources(fact).length}`)), `source ${n}`);
});

test('a series event citing an unknown source is reported', () => {
  const { topic, fact } = figuresTopic();
  fact.series!.events = [{ period: '2020', label: 'Law', sources: [1, 95] }];
  assert.ok(hasError(topic, 'series event "Law" cites unknown source 95'));
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

test('F4: a section figure names an h2 or h3 in the body, not an Observations or Subtleties item', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'section').id = 'no-such-section';
  assert.ok(hasError(topic, 'figure no-such-section: no body section headed'));
  // The fixture places "### … {#figure-examples--audit-method}" as well as an h2.
  assert.ok(fact.figures?.some(f => f.kind === 'section' && f.id === 'audit-method'));
  figureOf(fact, 'section').id = 'older-law';
  assert.ok(hasError(topic, 'figure older-law: "{#figure-examples--older-law}" heads an item under Observations or Subtleties'));
});

test('every group in a body must attach to a chart, and text before the first group fails too', () => {
  const { topic, fact } = figuresTopic();
  const group = (kind: string, id: string) => `\n\n## ${kind === 'subtleties' ? 'Subtleties' : 'Observations'} {#figure-examples--${kind}-${id}}\n\n### An item {#figure-examples--item-${kind}-${id}}\n\nText.`;
  fact.figures?.push({ kind: 'section', id: 'observations-placed' });
  fact.body += [
    // Attached: a reading, a comparison, a figure, a section entry, and a group a section entry places whole.
    group('observations', 'rejected-share'),
    group('observations', 'senate-votes'),
    group('subtleties', 'court-record'),
    group('observations', 'audit-method'),
    group('observations', 'placed'),
  ].join('');
  assert.deepEqual(validateTopic(topic), []);

  fact.body += [group('observations', 'federal-law'), group('subtleties', 'series'), group('observations', 'rejected-share-total')].join('');
  const errors = validateTopic(topic);
  assert.equal(errors.length, 3, errors.join('\n'));
  assert.ok(hasError(topic, '--observations-federal-law}" sits on no chart, so no slide shows it — address it to a series reading, comparison, figure or placed section of this fact; did you mean "federal-laws"?'));
  assert.ok(hasError(topic, '--subtleties-series}" sits on no chart'));
  assert.ok(hasError(topic, '--observations-rejected-share-total}" sits on no chart, so no slide shows it — address it to a series reading, comparison, figure or placed section of this fact; did you mean "rejected-share"?'));

  fact.body = 'An opening.\n\n' + fact.body;
  assert.ok(hasError(topic, 'the body has text before its first "##" group'));
});

test('a section that moved to a chart keeps its anchor, and must name a real chart', () => {
  const { topic, fact } = figuresTopic();
  fact.movedAnchors = { 'old-section': 'rejected-share' };
  assert.deepEqual(validateTopic(topic), []);
  fact.movedAnchors = { 'old-section': 'no-such-chart' };
  assert.ok(hasError(topic, 'moved anchor "old-section" names "no-such-chart"'));
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

test('F6: a card layout names real columns, apart from the title', () => {
  const { topic, fact } = figuresTopic();
  const table = figureOf(fact, 'dataTable');
  table.leadColumn = 'effect';
  assert.ok(hasError(topic, 'figure federal-laws: leadColumn needs a layout'));
  table.layout = 'timeline';
  assert.ok(!hasError(topic, 'figure federal-laws: leadColumn'));
  table.leadColumn = 'missing';
  table.dateColumn = 'measure';
  assert.ok(hasError(topic, 'leadColumn "missing" is not a column'));
  assert.ok(hasError(topic, 'dateColumn "measure" is the row header'));
  table.leadColumn = 'year';
  table.dateColumn = 'year';
  assert.ok(hasError(topic, 'leadColumn and dateColumn must differ'));
});

test('F7: timeline categories exist and periods run forwards', () => {
  const { topic, fact } = figuresTopic();
  const timeline = figureOf(fact, 'timeline');
  timeline.events[0].category = 'nope';
  timeline.events[2].endDate = '2020';
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
  const map = figureOf(fact, 'map', 'rejection-by-state');
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

test('F9: the US territories are areas of us-states, and count as gaps only once a figure names one', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'map', 'rejection-by-state');
  map.note = undefined;
  map.data = Object.fromEntries(US_STATE_TILES.map(tile => [tile.id, 1]));
  assert.ok(!hasError(topic, `figure ${map.id}: has no data`), 'all 50 states and DC leave no gap');
  map.data = { ...map.data, PR: 1.4 };
  assert.ok(!hasError(topic, '"PR" is not an area'));
  assert.ok(hasError(topic, `figure ${map.id}: has no data for GU, MP, AS, VI — say why in \`note\``));
});

test('F9, map: an inset must enlarge an area the map draws', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'map', 'rejection-by-state');
  map.insets = [{ regionIds: ['DC'] }];
  assert.ok(!hasError(topic, 'inset area'));
  map.insets = [{ regionIds: ['GU'] }];
  assert.ok(hasError(topic, 'figure rejection-by-state: inset area "GU" is not an area of us-states'), 'a territory the figure does not name is not drawn');
});

test('F10: a row label stays one short title, in a bar chart, a comparison and an estimate range', () => {
  const { topic, fact } = figuresTopic();
  const long = 'A label that has grown a period, a sample size and a coverage note far past a title';
  figureOf(fact, 'barChart').items[0].label = long;
  figureOf(fact, 'estimateRange').estimates[0].label = long;
  fact.comparisons![0].items[0].label = long;
  assert.equal(validateTopic(topic).filter(error => error.includes('is over 60 characters')).length, 3);
});

test('F10: bars fit their axis, compositions their categories, estimates their order', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'barChart').domainMax = 1;
  const composition = figureOf(fact, 'compositionBar');
  composition.rows[0].values = { civilian: 0, nope: 0 };
  const estimates = figureOf(fact, 'estimateRange');
  estimates.estimates[0] = { ...estimates.estimates[0], low: 40, high: 30 };
  estimates.estimates[2] = { label: 'Empty', sources: [16] };
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
  const compared = figureOf(fact, 'quotes', 'damage-claims');
  compared.quotes[0].text = 'buried and we’re watching it';
  assert.deepEqual(validateTopic(topic), []);
  pull.quote.text = 'Absentee ballots are the largest source of voter fraud.';
  assert.ok(hasError(topic, 'figure carter-baker: "absentee ballots are the largest source of voter fraud." is not in the quote of source 21'));
  figureOf(fact, 'claimCheck').claim = 'Half of mail-in voters cheated';
  assert.ok(hasError(topic, 'figure one-in-five: "half of mail-in voters cheated" is not in the quote of source 22'));
});

test('F11: a quote citing several sources need only appear in one of them', () => {
  const { topic, fact } = figuresTopic();
  const pull = figureOf(fact, 'pullQuote');
  pull.quote.sources = [24, 21];
  assert.deepEqual(validateTopic(topic), []);
  pull.quote.text = 'Absentee ballots are the largest source of voter fraud.';
  assert.ok(hasError(topic, 'is not in the quote of any of sources 24, 21'));
});

test('F11: every quote of a long quotes figure is verbatim, the non-English one in its own words', () => {
  const { topic, fact } = figuresTopic();
  const quotes = figureOf(fact, 'quotes', 'postal-secrecy');
  quotes.quotes[0].text = 'With postal voting, public control of how the vote is cast is reduced';
  assert.ok(hasError(topic, 'figure postal-secrecy: "with postal voting, public control of how the vote is cast is reduced" is not in the quote of source 32'));
});

test('quotes: a stance names one of the figure\'s categories, and every category has a quote', () => {
  const { topic, fact } = figuresTopic();
  const quotes = figureOf(fact, 'quotes', 'postal-secrecy');
  quotes.quotes[2].stance = 'nope';
  assert.ok(hasError(topic, 'figure postal-secrecy: quote by "Sir Eric Pickles\'s review" has unknown stance "nope"'));
  assert.ok(hasError(topic, 'figure postal-secrecy: category "review" has no quote'));
  quotes.categories?.push({ id: 'court', label: 'Again' });
  assert.ok(hasError(topic, 'figure postal-secrecy: category ids must be unique'));
  const pair = figureOf(fact, 'quotes', 'damage-claims');
  pair.quotes[0].stance = 'court';
  assert.ok(hasError(topic, 'figure damage-claims: quote by "Pete Hegseth" has stance "court", but the figure has no `categories`'));
});

test('F10: a paired bar chart gives every series in every row, and only a dumbbell of two labels its ends', () => {
  const { topic, fact } = figuresTopic();
  const paired = figureOf(fact, 'barChart', 'hours-to-count');
  paired.items[0].values = { y2020: 73 };
  assert.ok(hasError(topic, 'figure hours-to-count: row "Arizona" has no value for "y2024" — give `null` where the source publishes none'));
  paired.items[0].values = { y2020: null, y2024: null };
  assert.ok(hasError(topic, 'row "Arizona" has no values'));
  paired.items[1].values = { y2020: 159, y2024: 51, y2028: 1 };
  assert.ok(hasError(topic, 'row "Nevada" has a value for "y2028", which is not a series'));
  paired.items[2].labels = { y2020: '2020' };
  assert.ok(hasError(topic, 'row "Pennsylvania" labels its ends, which only a dumbbell has'));
  paired.domainMax = 100;
  assert.ok(hasError(topic, 'figure hours-to-count: domainMax must be at least every value'));
  const dumbbell = figureOf(fact, 'barChart', 'pre-vra-registration');
  dumbbell.series?.push({ key: 'third', label: 'Third' });
  assert.ok(hasError(topic, 'figure pre-vra-registration: a dumbbell joins two measures, but the chart has 3 series'));
  dumbbell.items[0].labels = { earlier: '1958', nope: '1964' };
  assert.ok(hasError(topic, 'row "Alabama" labels "nope", which is not a series'));
});

test('slice explorer: rows name every dimension\'s value once, measures are numbers, and the defaults exist', () => {
  const { topic, fact } = figuresTopic();
  const slices = figureOf(fact, 'sliceExplorer');
  slices.rows.push({ vote: 'House, 15 Sep 2026', party: 'Republican', position: 'Yes', members: 7 });
  slices.rows.push({ vote: 'House, 15 Sep 2026', party: 'Green', position: 'Yes', members: 'many', extra: 1 });
  slices.rows.push({ party: 'Republican', position: 'No', members: 1 });
  const errors = validateTopic(topic);
  const has = (text: string) => assert.ok(errors.some(e => e.includes(text)), text);
  has('figure war-powers-votes: row 11 repeats the combination vote "House, 15 Sep 2026", party "Republican", position "Yes", so it would be counted twice');
  has('row 12 has party "Green", which is not one of its values');
  has('row 12 measure "members" must be a number');
  has('row 12 has key "extra", which is not a dimension or measure');
  has('row 13 has no "vote"');
});

test('slice explorer: a dimension that may not be combined is never a split, and its default is one value', () => {
  const { topic, fact } = figuresTopic();
  const slices = figureOf(fact, 'sliceExplorer');
  slices.defaultSplit = 'vote';
  assert.ok(hasError(topic, 'figure war-powers-votes: defaultSplit "vote" may not be combined, so it cannot split a bar'));
  slices.defaultSplit = 'party';
  assert.ok(hasError(topic, 'defaultSplit "party" is also the breakdown'));
  slices.defaultSplit = 'position';
  slices.defaultFilters = { vote: ['House, 15 Sep 2026', 'Senate, 24 Sep 2026'] };
  assert.ok(hasError(topic, 'defaultFilters vote picks 2 values of a dimension that may not be combined — pick one'));
  slices.defaultFilters = { party: ['Independent'] };
  assert.ok(hasError(topic, 'its default view draws no bars'), 'independents have no House row, and House is the first roll call');
  slices.defaultFilters = { party: ['Independent'], vote: ['Senate, 24 Sep 2026'] };
  slices.defaultMeasure = 'senators';
  assert.ok(hasError(topic, 'defaultMeasure "senators" is not a measure'));
  slices.defaultMeasure = undefined;
  slices.dimensions[1].values?.push('Green');
  assert.ok(hasError(topic, 'dimension "party" lists "Green", which no row has'));
});

test('small multiples: every panel runs across the whole published range, its own if it has one', () => {
  const { topic, fact } = figuresTopic();
  const multiples = figureOf(fact, 'smallMultiples');
  multiples.panels[1].points = multiples.panels[1].points.slice(1);
  assert.ok(hasError(topic, 'figure chokepoint-traffic: panel "Bab el-Mandeb": starts at "2026-07" but the coverage runs from "2026-06" — show the whole published range'));
  multiples.panels[4].points = multiples.panels[4].points.slice(0, 2);
  assert.ok(hasError(topic, 'panel "Kerch Strait": ends at "2026-08" but its own coverage runs to "2026-09"'));
  multiples.panels[2].points = [...multiples.panels[2].points].reverse();
  assert.ok(hasError(topic, 'panel "Suez Canal": points must run forwards in time, with no repeats'));
  multiples.panels[3].name = 'Suez Canal';
  assert.ok(hasError(topic, 'panel names must be unique'));
  multiples.panels[4].coverage = { from: '2026-05', to: '2026-09' };
  assert.ok(hasError(topic, 'its own coverage 2026-05–2026-09 runs outside the figure\'s 2026-06–2026-09'));
});

test('small multiples: when every panel has its own coverage the figure\'s is their union', () => {
  const { topic, fact } = figuresTopic();
  const multiples = figureOf(fact, 'smallMultiples');
  for (const panel of multiples.panels) panel.coverage ??= { from: '2026-06', to: '2026-09' };
  multiples.coverage = { from: '2026-06', to: '2026-10' };
  assert.ok(hasError(topic, 'coverage 2026-06–2026-10 must be the union of its panels\' ranges, 2026-06–2026-09'));
});

test('F6: a date column holds partial dates', () => {
  const { topic, fact } = figuresTopic();
  const table = figureOf(fact, 'dataTable');
  table.columns[0].format = 'date';
  assert.deepEqual(validateTopic(topic), []);
  table.rows[0].year = '2025-13';
  assert.ok(hasError(topic, 'column "year" is a date column, so "2025-13" must be YYYY, YYYY-MM or YYYY-MM-DD'));
});

test('F7: an approximate timeline date is placed at its year for the end-before-start check', () => {
  const { topic, fact } = figuresTopic();
  const event = figureOf(fact, 'timeline').events[0];
  event.date = 'c. 1984';
  event.endDate = '1985';
  assert.deepEqual(validateTopic(topic), []);
  event.date = '1990s';
  assert.ok(hasError(topic, 'ends before it starts'));
});

test('F10: a composition row adds up to its stated total, or to 100 for percentages, within rounding', () => {
  const { topic, fact } = figuresTopic();
  const composition = figureOf(fact, 'compositionBar');
  composition.rows[0].total = 3636;
  assert.deepEqual(validateTopic(topic), []);
  composition.rows[0].total = 3640;
  assert.ok(hasError(topic, 'row "HRANA, 7 Apr" sums to 3636, not 3640 — more than rounding (±1.5) can explain'));
  composition.rows[0].total = undefined;
  composition.unit = 'percent';
  composition.rows = [{ label: 'Thirds', values: { civilian: 33.3, military: 33.3, unclassified: 33.3 }, sources: [12] }];
  // 99.9 is within three parts' rounding at one decimal (±0.15).
  assert.deepEqual(validateTopic(topic), []);
  composition.rows[0].values.unclassified = 33.1;
  assert.ok(hasError(topic, 'row "Thirds" sums to 99.7, not 100 — more than rounding (±0.15) can explain'));
});

test('the composition tolerance is half a unit in each part\'s own last place', () => {
  assert.equal(compositionSumError([33, 33.5, 33.6], 100), undefined); // 100.1, within 0.5 + 0.05 + 0.05
  assert.match(compositionSumError([50, 48], 100) ?? '', /sums to 98, not 100/); // 98, beyond 0.5 + 0.5
  assert.equal(compositionSumError([1, 2], undefined), undefined);
  assert.equal(compositionSumError([{ value: 40, qualifier: 'about' }, { low: 55, high: 65 }], 100), undefined);
});

test('F8: a key figure qualifies its value in one place', () => {
  const { topic, fact } = figuresTopic();
  const audit = figureOf(fact, 'keyFigures').figures[0];
  audit.value = { value: 7200, qualifier: 'more than' };
  assert.ok(hasError(topic, '"signatures re-examined" gives its qualifier or wording beside a qualified value'));
  audit.qualifier = undefined;
  audit.asPublished = undefined;
  assert.deepEqual(validateTopic(topic), []);
});

test('F10: a range\'s high end counts for domainMax, and a composition part may not be negative', () => {
  const { topic, fact } = figuresTopic();
  const bars = figureOf(fact, 'barChart', 'deaths-by-region');
  bars.domainMax = 150;
  bars.items = bars.items.map(item => (item.label === 'East' ? item : { ...item, value: 10 }));
  assert.deepEqual(validateTopic(topic), []);
  bars.domainMax = 70;
  assert.ok(hasError(topic, "domainMax must be at least every value, a range's high end included"));
  bars.domainMax = undefined;
  figureOf(fact, 'compositionBar').rows[0].values.civilian = { low: -1, high: 2 };
  assert.ok(hasError(topic, 'row "HRANA, 7 Apr" has a negative part'));
});

test('F12: a claim check\'s evidence is a fact, and its section exists', () => {
  const { topic, fact } = figuresTopic();
  const check = figureOf(fact, 'claimCheck');
  check.evidence = { fact: 'figure-examples', section: 'nope' };
  assert.ok(hasError(topic, 'unknown section "nope" in fact "figure-examples"'));
  check.evidence = { fact: 'nope' };
  assert.ok(hasError(topic, 'evidence names "nope", which is not a fact in this topic'));
});

/* ------------------------------- 4.1 and 4.2: categorical maps, geo maps, scatter plots */

test('F1, F2, F5: the categorical tile map, geo map and scatter plot are held to the shared rules', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'map', 'voter-id-rules').id = 'federal-laws';
  figureOf(fact, 'map', 'postal-voting').sources = [99];
  figureOf(fact, 'scatterPlot').sources = [];
  assert.ok(hasError(topic, 'figure federal-laws: id "federal-laws" is already used'));
  assert.ok(hasError(topic, 'figure postal-voting: cites source 99'));
  assert.ok(hasError(topic, 'figure count-speed: cites no source'));
});

test('F9, categorical: category ids are unique', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'map', 'voter-id-rules');
  map.categories![1] = { ...map.categories![1], id: 'strict-photo' };
  assert.ok(hasError(topic, 'figure voter-id-rules: category ids must be unique'));
});

test('F9, categorical: category marks are unique', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'map', 'voter-id-rules');
  map.categories![1] = { ...map.categories![1], mark: 'SP' };
  assert.ok(hasError(topic, 'figure voter-id-rules: category marks must be unique'));
});

test('F9, categorical: every assignment names a category, bare or with a note', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'map', 'voter-id-rules');
  map.areas = { ...map.areas, GA: 'nope', AR: { category: 'also-nope', note: 'n' } };
  assert.ok(hasError(topic, '"GA" has unknown category "nope"'));
  assert.ok(hasError(topic, '"AR" has unknown category "also-nope"'));
});

test('F9, categorical: area ids belong to the preset', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'map', 'voter-id-rules');
  map.areas = { ...map.areas, XX: 'none' };
  assert.ok(hasError(topic, 'figure voter-id-rules: "XX" is not an area of us-states'));
});

test('F9, categorical: an area with no category needs a note saying why', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'map', 'voter-id-rules');
  delete map.areas!.VT;
  assert.ok(hasError(topic, 'figure voter-id-rules: has no data for VT — say why in `note`'));
  map.note = 'Vermont is not yet coded.';
  assert.ok(!hasError(topic, 'figure voter-id-rules: has no data'));
});

test('F9, geo map: area, highlight and inset ids belong to the preset', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'map', 'postal-voting');
  map.areas = { ...map.areas, ZZ: 'all' };
  map.highlight = ['XX'];
  map.insets = [{ regionIds: ['YY'] }];
  assert.ok(hasError(topic, 'figure postal-voting: "ZZ" is not an area of world'));
  assert.ok(hasError(topic, 'figure postal-voting: highlight "XX" is not an area of world'));
  assert.ok(hasError(topic, 'figure postal-voting: inset area "YY" is not an area of world'));
});

test('F9, geo map: a gap needs a note, and a long list of gaps is shortened', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'map', 'postal-voting').note = undefined;
  const error = validateTopic(topic).find(e => e.includes('figure postal-voting: has no data'));
  assert.ok(error, 'expected a missing-note error');
  assert.match(error, /and \d+ more — say why in `note`/);
});

test('F9, numeric map on real shapes: the tile map\'s numeric rules apply', () => {
  const { topic, fact } = figuresTopic();
  const map = figureOf(fact, 'map', 'postal-voting');
  Object.assign(map, {
    preset: 'uk-regions',
    categoryLabel: undefined,
    categories: undefined,
    areas: undefined,
    highlight: [],
    insets: undefined,
    valueLabel: 'Share',
    data: { london: 1, 'not-a-region': 2 },
    breaks: [0, 2, 1],
    domain: [5, 1],
  });
  assert.ok(hasError(topic, 'figure postal-voting: "not-a-region" is not an area of uk-regions'));
  assert.ok(hasError(topic, 'figure postal-voting: breaks must be strictly ascending'));
  assert.ok(hasError(topic, 'figure postal-voting: domain must run from low to high'));
});

test('scatter plot: point ids are unique', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'scatterPlot').points[1].id = 'az';
  assert.ok(hasError(topic, 'figure count-speed: point ids must be unique'));
});

test('scatter plot: group ids are unique', () => {
  const { topic, fact } = figuresTopic();
  const plot = figureOf(fact, 'scatterPlot');
  plot.groups = [...plot.groups!, { id: 'mostly-mail', label: 'Again' }];
  assert.ok(hasError(topic, 'figure count-speed: group ids must be unique'));
});

test('scatter plot: every point\'s group exists', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'scatterPlot').points[0].group = 'nope';
  assert.ok(hasError(topic, 'figure count-speed: point "az" has unknown group "nope"'));
  figureOf(fact, 'scatterPlot').groups = undefined;
  assert.ok(hasError(topic, 'point "nv" has unknown group "mostly-mail"'));
});

test('scatter plot: a domain runs upwards and covers every point', () => {
  const { topic, fact } = figuresTopic();
  const plot = figureOf(fact, 'scatterPlot');
  plot.x.domain = [0, 30];
  plot.y.domain = [200, 0];
  assert.ok(hasError(topic, 'figure count-speed: point "nc" falls outside the x domain'));
  assert.ok(hasError(topic, 'figure count-speed: y domain must run from low to high'));
  plot.x.domain = [0, 35];
  plot.y.domain = [0, 150];
  assert.ok(!hasError(topic, 'figure count-speed:'));
});

test('scatter plot: highlight ids are point ids', () => {
  const { topic, fact } = figuresTopic();
  figureOf(fact, 'scatterPlot').highlight = ['tx'];
  assert.ok(hasError(topic, 'figure count-speed: highlight "tx" is not a point'));
});

test('a figure\'s replaced anchors are link targets, and may not clash with another id', () => {
  const { topic, fact } = figuresTopic();
  topic.viewpoints[0].body = 'See [the laws](#fact-figure-examples/federal-laws-list).';
  assert.deepEqual(validateTopic(topic), []);
  figureOf(fact, 'barChart').replaces = ['federal-laws-list', 'chart-federal-laws', 'older-law'];
  assert.ok(hasError(topic, 'figure wa-by-race: replaces "federal-laws-list", which another figure already replaces'));
  assert.ok(hasError(topic, 'figure wa-by-race: replaces "chart-federal-laws", which is the id of a chart or figure'));
  assert.ok(hasError(topic, 'figure wa-by-race: replaces "older-law", which is still an anchor in the body'));
});

test('a viewpoint may cite a component figure by its chart id', () => {
  const { topic } = figuresTopic();
  topic.viewpoints[0].body = 'See [the rates](#fact-figure-examples/chart-wa-by-race).';
  assert.deepEqual(validateTopic(topic), []);
  topic.viewpoints[0].body = 'See [the rates](#fact-figure-examples/chart-nope).';
  assert.ok(hasError(topic, 'unknown section "chart-nope"'));
});

/* ------------------------------------------------ 4.4: per-line coverage */

/** A second line whose source starts later, covering 1992–1993 only. */
function laterLine(points = [{ period: '1992', value: 1 }, { period: '1993', value: 2 }]) {
  return { name: 'Later source', coverage: { from: '1992', to: '1993' }, points };
}

test('a line with its own coverage may start later than the series', () => {
  const t = topicWithSeries();
  t.facts[0].series!.readings[0].lines.push(laterLine());
  assert.deepEqual(validateTopic(t), []);
});

test('a line that stops short of its own coverage fails, naming that coverage', () => {
  const t = topicWithSeries();
  t.facts[0].series!.readings[0].lines.push(laterLine([{ period: '1992', value: 1 }, { period: '1992-06', value: 2 }]));
  const errors = validateTopic(t);
  assert.ok(errors.some(e => e.includes('line "Later source"') && e.includes('its source publishes to "1993"')), errors.join('\n'));
});

test('a series coverage wider than the union of its lines fails', () => {
  const t = topicWithSeries({ coverage: { from: '1989', to: '1993' } });
  const lines = t.facts[0].series!.readings[0].lines;
  lines[0].coverage = { from: '1990', to: '1993' };
  lines.push(laterLine());
  const errors = validateTopic(t);
  assert.ok(errors.some(e => e.includes('must be the union') && e.includes('1990–1993')), errors.join('\n'));
});

test('a line coverage outside the series coverage fails', () => {
  const t = topicWithSeries();
  t.facts[0].series!.readings[0].lines.push({ ...laterLine([{ period: '1992', value: 1 }, { period: '1995', value: 2 }]), coverage: { from: '1992', to: '1995' } });
  const errors = validateTopic(t);
  assert.ok(errors.some(e => e.includes('runs outside the series coverage')), errors.join('\n'));
});

/* ------------------------------------- 4.6: estimated and forecast points */

test('a measured point after a forecast fails', () => {
  const t = topicWithSeries({ coverage: { from: '1990', to: '1993', note: 'Forecast from the 2024 vintage.' } });
  const points = t.facts[0].series!.readings[0].lines[0].points;
  points[2].status = 'forecast';
  const errors = validateTopic(t);
  assert.ok(errors.some(e => e.includes('point "1993" is not a forecast but follows one')), errors.join('\n'));
  points[3].status = 'forecast';
  points[1].status = 'estimate';
  assert.deepEqual(validateTopic(t), []);
});

test('a forecast without a coverage note naming its vintage fails', () => {
  const t = topicWithSeries();
  t.facts[0].series!.readings[0].lines[0].points[3].status = 'forecast';
  const errors = validateTopic(t);
  assert.ok(errors.some(e => e.includes('no coverage.note')), errors.join('\n'));
});

/* ------------------------------------------ 4.5: "not measured since" band */

test('a "not measured since" band that ends before the last point fails', () => {
  const t = topicWithSeries({ notMeasuredSince: { label: 'Not verified', note: 'Access ended.', until: '1992', source: 1 } });
  const errors = validateTopic(t);
  assert.ok(errors.some(e => e.includes('not after the last point')), errors.join('\n'));
});

test('a "not measured since" band may not end after the topic was last updated, and cites a real source', () => {
  const t = topicWithSeries({ notMeasuredSince: { label: 'Not verified', note: 'Access ended.', until: '2027', source: 9 } });
  const errors = validateTopic(t);
  assert.ok(errors.some(e => e.includes('after the topic was last updated')), errors.join('\n'));
  assert.ok(errors.some(e => e.includes('unknown source 9')), errors.join('\n'));
});

test('an event inside a "not measured since" band passes; its end defaults to lastUpdated', () => {
  const t = topicWithSeries({
    notMeasuredSince: { label: 'Not verified', note: 'Access ended.', source: 1 },
    events: [{ period: '2001', label: 'verification stops', sources: [] }],
  });
  assert.deepEqual(validateTopic(t), []);
});

/* ---------------------------------------------------- 4.3: focus window */

test('a focus window inside the coverage passes; one reaching outside it fails', () => {
  assert.deepEqual(validateTopic(topicWithSeries({ focus: { from: '1992', label: 'Last two years' } })), []);
  const errors = validateTopic(topicWithSeries({ focus: { from: '1989', to: '1992', label: 'Window' } }));
  assert.ok(errors.some(e => e.includes('focus 1989–1992 runs outside the declared coverage')), errors.join('\n'));
});

test('a focus window must run forwards and hold two points of some line', () => {
  const backwards = validateTopic(topicWithSeries({ focus: { from: '1993', to: '1992', label: 'Window' } }));
  assert.ok(backwards.some(e => e.includes('is not before its end')), backwards.join('\n'));
  const empty = validateTopic(topicWithSeries({ focus: { from: '1992-03', to: '1992-09', label: 'Window' } }));
  assert.ok(empty.some(e => e.includes('fewer than two points')), empty.join('\n'));
});

function previewedTopic(): Topic {
  const t = soundTopic();
  t.facts[0].series = undefined;
  t.facts[0].comparisons = [{ id: 'shares', title: 'Shares', description: 'd', unit: 'percent', valueLabel: 'v', sources: [1], items: [{ label: 'a', value: 1 }, { label: 'b', value: 2 }] }];
  t.viewpoints[0].body = 'See [the shares](#fact-alpha).';
  t.viewpoints[1].body = 'See [the shares](#fact-alpha).';
  t.previewCharts = [{ fact: 'alpha', chart: 'shares' }];
  return t;
}

test('preview charts: a sound selection produces no errors', () => {
  assert.deepEqual(validateTopic(previewedTopic()), []);
});

test('preview charts: each must resolve to a chart on a fact in the topic', () => {
  const t = previewedTopic();
  t.previewCharts = [{ fact: 'alpha', chart: 'shares' }, { fact: 'alpha', chart: 'nope' }, { fact: 'missing', chart: 'series' }];
  const errors = validateTopic(t);
  assert.ok(errors.includes('topic: preview chart alpha/nope does not resolve to a chart or figure'), errors.join('\n'));
  assert.ok(errors.includes('topic: preview chart missing/series does not resolve to a chart or figure'), errors.join('\n'));
});

test('preview charts: the same chart may not be listed twice', () => {
  const t = previewedTopic();
  t.previewCharts = [{ fact: 'alpha', chart: 'shares' }, { fact: 'alpha', chart: 'shares' }];
  assert.ok(validateTopic(t).includes('topic: preview chart alpha/shares is listed twice'));
});

test('preview charts: every viewpoint must cite the fact behind at least one of them', () => {
  const t = previewedTopic();
  t.viewpoints[1].body = 'No citations at all.';
  assert.ok(validateTopic(t).includes('topic: viewpoint two cites none of the preview charts\' facts — add a chart it relies on to previewCharts'));
});

test('preview charts: a named reading must exist on that series, and only a series has readings', () => {
  const t = previewedTopic();
  const series: Series = { title: 's', description: 'd', periodLabel: 'Year', coverage: { from: '2020', to: '2021' }, breaks: [], events: [], source: t.facts[0].sources[0], readings: [{ id: 'people', label: 'People', unit: 'count', valueLabel: 'v', lines: [{ name: 'a', points: [{ period: '2020', value: 1 }, { period: '2021', value: 2 }] }] }] };
  t.facts[0].series = series;
  t.previewCharts = [{ fact: 'alpha', chart: 'series', reading: 'share' }, { fact: 'alpha', chart: 'shares', reading: 'people' }];
  const errors = validateTopic(t);
  assert.ok(errors.includes('topic: preview chart alpha/series has no reading "share"'), errors.join('\n'));
  assert.ok(errors.includes('topic: preview chart alpha/shares is not a series, so it cannot name a reading'), errors.join('\n'));
});

const markedFact = (observationMarks: Fact['observationMarks']) => fact({
  id: 'f',
  observationMarks,
  series: series(),
  comparisons: [{ id: 'c', title: 'C', description: 'd', valueLabel: 'v', unit: 'count', sources: [1], items: [{ label: 'UK', value: 1 }] }],
  body: '## Observations {#f--observations-people}\n\n### Up {#f--up}\n\nText.\n\n## Observations {#f--observations-c}\n\n### Low {#f--low}\n\nText.\n',
});

const markErrors = (observationMarks: Fact['observationMarks']) =>
  validateTopic({ ...soundTopic(), facts: [markedFact(observationMarks)] }).filter(error => error.includes('observation mark'));

test('a mark that lands on its chart passes', () => {
  assert.deepEqual(markErrors({ up: { lines: ['Immigration'], from: '1990', to: '1992' }, low: { rows: ['UK'] } }), []);
  assert.deepEqual(markErrors({ up: { at: '1992' } }), []);
});

test('every observation on a chart that can show marks must say what it picks out', () => {
  const errors = (marks: Fact['observationMarks']) => evidenceErrors({ ...soundTopic(), viewpoints: [], cruxes: [], facts: [markedFact(marks)] });
  assert.equal(errors(undefined).length, 2);
  assert.deepEqual(errors({ up: { at: '1992' }, low: { whole: true } }), []);
});

test('a linked fact must be an observation of a chart that picks out where it is seen', () => {
  const errors = (link: string, marks: Fact['observationMarks']) => evidenceErrors({
    ...soundTopic(),
    cruxes: [],
    viewpoints: [{ ...soundTopic().viewpoints[0], summary: 'S', body: `### A step\n\n[Up](${link}).` }],
    facts: [markedFact({ low: { rows: ['UK'] }, ...marks })],
  }).filter(error => error.startsWith('viewpoint'));
  assert.deepEqual(errors('#fact-f/up', { up: { at: '1992' } }), []);
  assert.match(errors('#fact-f/up', { up: { whole: true } })[0], /picks out no part of its chart/);
  assert.match(errors('#fact-f', {})[0], /is not an observation of a chart/);
  assert.match(errors('#fact-f/chart-c', {})[0], /is not an observation of a chart/);
});

/** A row each kind that takes marks would name, from the figure fixture's example of it. */
function firstRow(figure: ReturnType<typeof figureExamplesFact>['figures'] extends (infer F)[] | undefined ? F : never): string | undefined {
  switch (figure.kind) {
    case 'barChart': return figure.items[0].label;
    case 'compositionBar': return figure.rows[0].label;
    case 'estimateRange': return figure.estimates[0].label;
    case 'smallMultiples': return figure.panels[0].name;
    case 'timeline': return figure.events[0].title;
    case 'periodTimeline': return figure.rows[0].label;
    case 'quotes': return figure.quotes[0].speaker;
    case 'map': return Object.keys(figure.areas ?? figure.data ?? {})[0];
    default: return undefined;
  }
}

test('a mark can name a row of every kind of figure that takes them, and only a real one', () => {
  const example = figureExamplesFact();
  const figures = example.figures!.flatMap(figure => { const row = firstRow(figure); return row && 'id' in figure && figure.id ? [{ id: figure.id, kind: figure.kind, row }] : []; });
  assert.deepEqual([...new Set(figures.map(f => f.kind))].sort(), ['barChart', 'compositionBar', 'estimateRange', 'map', 'periodTimeline', 'quotes', 'smallMultiples', 'timeline']);
  const body = figures.map(({ id }) => `## Observations {#${example.id}--observations-${id}}\n\n### Seen {#${example.id}--seen-${id}}\n\nText.`).join('\n\n');
  const errors = (marks: Fact['observationMarks']) => validateTopic(figureExamplesTopic({ ...example, body: `${example.body}\n\n${body}`, observationMarks: marks })).filter(error => error.includes('observation mark'));
  assert.deepEqual(errors(Object.fromEntries(figures.map(f => [`seen-${f.id}`, { rows: [f.row] }]))), []);
  for (const f of figures) assert.match(errors({ [`seen-${f.id}`]: { rows: ['No such row'] } })[0], /names "No such row", which is not a row/, f.kind);
});

test('a mark must name what is on its chart', () => {
  assert.match(markErrors({ gone: { lines: ['Immigration'] } })[0], /"gone" is not an observation or subtlety of a chart/);
  assert.match(markErrors({ up: { lines: ['B'] } })[0], /names "B", which is not a line of people/);
  assert.match(markErrors({ up: { from: '1989' } })[0], /period 1989 is outside the series/);
  assert.match(markErrors({ up: { from: '1992', to: '1990' } })[0], /from before to/);
  assert.match(markErrors({ up: { at: '1980' } })[0], /at 1980 is not a point/);
  assert.match(markErrors({ up: { rows: ['UK'] } })[0], /is a line chart/);
  assert.match(markErrors({ low: { rows: ['France'] } })[0], /names "France", which is not a row of c/);
  assert.match(markErrors({ low: { lines: ['Immigration'] } })[0], /its chart has rows/);
});

/** The figure fixture with every viewpoint citing its fact, so a preview of any of its figures covers them all. */
function previewedFigures(previewCharts: Topic['previewCharts']): Topic {
  const t = figureExamplesTopic();
  for (const v of t.viewpoints) v.body = 'See [the figures](#fact-figure-examples).';
  t.previewCharts = previewCharts;
  return t;
}

test('preview charts: a graph-like figure of every previewable kind may be previewed', () => {
  const ids = ['wa-by-race', 'hours-to-count', 'war-powers-votes', 'chokepoint-traffic', 'deaths-by-counter', 'cost-estimates', 'count-speed', 'rejection-by-state', 'postal-voting', 'court-record', 'war-periods', 'audit-recheck'];
  assert.deepEqual(validateTopic(previewedFigures(ids.map(chart => ({ fact: 'figure-examples', chart })))), []);
});

test('preview charts: a text figure is rejected, naming its kind', () => {
  const t = previewedFigures(['federal-laws', 'damage-claims', 'carter-baker', 'one-in-five', 'detected-is-a-floor'].map(chart => ({ fact: 'figure-examples', chart })));
  const errors = validateTopic(t);
  for (const [id, kind] of [['federal-laws', 'dataTable'], ['damage-claims', 'quotes'], ['carter-baker', 'pullQuote'], ['one-in-five', 'claimCheck'], ['detected-is-a-floor', 'caveatList']]) {
    assert.ok(errors.some(e => e.startsWith(`topic: preview chart figure-examples/${id} is a ${kind} figure, which has no graph to preview`)), errors.join('\n'));
  }
});

test('preview charts: a body section placed by figures is not a figure a slide can draw', () => {
  const errors = validateTopic(previewedFigures([{ fact: 'figure-examples', chart: 'freedom-to-vote-act-provisions' }]));
  assert.ok(errors.includes('topic: preview chart figure-examples/freedom-to-vote-act-provisions does not resolve to a chart or figure'), errors.join('\n'));
});

test('preview charts: a figure has no readings to name', () => {
  const errors = validateTopic(previewedFigures([{ fact: 'figure-examples', chart: 'wa-by-race', reading: 'people' }]));
  assert.ok(errors.includes('topic: preview chart figure-examples/wa-by-race is not a series, so it cannot name a reading'), errors.join('\n'));
});

test('preview charts: a previewed figure counts its fact towards every viewpoint citing it', () => {
  const t = previewedFigures([{ fact: 'figure-examples', chart: 'wa-by-race' }]);
  t.viewpoints[1].body = 'Cites no fact.';
  assert.deepEqual(validateTopic(t), ['topic: viewpoint two cites none of the preview charts\' facts — add a chart it relies on to previewCharts']);
});
