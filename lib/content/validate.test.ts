import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTopic } from './validate';
import type { Topic, Fact, Viewpoint, Principle, Crux } from './types';

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
    citesFacts: [],
    acknowledges: [],
    setsAside: [],
    principles: [],
    body: 'The argument.',
    ...over,
  };
}

function principle(over: Partial<Principle> & { id: string }): Principle {
  return { name: 'A principle', heldBy: [], body: '', ...over };
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
      viewpoint({ id: 'one', citesFacts: ['alpha'], acknowledges: ['gamma'], principles: ['fairness'] }),
      viewpoint({ id: 'two', citesFacts: ['gamma'], acknowledges: ['alpha'], principles: ['fairness'] }),
    ],
    principles: [principle({ id: 'fairness', heldBy: ['one', 'two'] })],
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

test('rule 1: an unknown fact id in citesFacts is reported', () => {
  const t = soundTopic();
  t.viewpoints[0].citesFacts = ['nope'];
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('nope')), errors.join('\n'));
});

test('rule 1: an unknown principle id on a viewpoint is reported', () => {
  const t = soundTopic();
  t.viewpoints[0].principles = ['nope'];
  assert.ok(validateTopic(t).some((e) => e.includes('nope')));
});

test('rule 1: a crux position may not reference an unknown viewpoint', () => {
  const t = soundTopic();
  t.cruxes[0].positions[0].viewpoint = 'nope';
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('nope') && e.includes('position')), errors.join('\n'));
});

test('rule 2: citesFacts may not include a not-supported fact', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'delta', status: 'not-supported' }));
  t.viewpoints[0].citesFacts.push('delta');
  assert.ok(validateTopic(t).some((e) => e.includes('delta') && e.includes('citesFacts')));
});

test('rule 2: acknowledges may only include well-supported facts', () => {
  const t = soundTopic();
  t.facts.push(
    fact({
      id: 'delta',
      status: 'contested',
      body: 'Why it is contested.',
      sources: [
        { stance: 'supports', quote: 'q', title: 't', url: 'https://example.org/a', publisher: 'p', date: '2024' },
        { stance: 'contests', quote: 'q', title: 't', url: 'https://example.org/b', publisher: 'p', date: '2024' },
      ],
    })
  );
  t.viewpoints[0].acknowledges.push('delta');
  assert.ok(validateTopic(t).some((e) => e.includes('delta') && e.includes('acknowledges')));
});

test('rule 2: citesFacts may not include a complicated or unknown fact', () => {
  // This gate is what makes "complicated and unknown are less important"
  // true of the rendered page: a fact with either status can reach no list
  // but `setsAside`, and `setsAside` is not ranked, so it can only ever land
  // in the unranked tail. See rank-facts.ts.
  for (const status of ['complicated', 'unknown'] as const) {
    const t = soundTopic();
    t.facts.push(fact({ id: 'delta', status }));
    t.viewpoints[0].citesFacts.push('delta');
    const errors = validateTopic(t);
    assert.ok(errors.some((e) => e.includes('delta') && e.includes('citesFacts')), errors.join('\n'));
  }
});

test('rule 2: acknowledges may not include a complicated or unknown fact', () => {
  for (const status of ['complicated', 'unknown'] as const) {
    const t = soundTopic();
    t.facts.push(fact({ id: 'delta', status }));
    t.viewpoints[0].acknowledges.push('delta');
    const errors = validateTopic(t);
    assert.ok(errors.some((e) => e.includes('delta') && e.includes('acknowledges')), errors.join('\n'));
  }
});

test('rule 2: a fact may not appear twice on the same viewpoint', () => {
  const t = soundTopic();
  t.viewpoints[0].setsAside = ['alpha'];
  assert.ok(validateTopic(t).some((e) => e.includes('alpha') && e.includes('both')));
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
  t.viewpoints[0].acknowledges.push('delta');
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

test('rule 6: a viewpoint that acknowledges nothing is rejected', () => {
  const t = soundTopic();
  t.viewpoints[0].acknowledges = [];
  assert.ok(validateTopic(t).some((e) => e.includes('one') && e.includes('acknowledges')));
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
  t.principles[0].heldBy.push('three');
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('three') && e.includes('divides')), errors.join('\n'));
});

test('rule 8: a fact no viewpoint references is an orphan', () => {
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

test('rule 8: a headline fact is still an orphan if nothing references it', () => {
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

test('rule 8: a principle held by no real viewpoint is an orphan', () => {
  const t = soundTopic();
  t.principles.push(principle({ id: 'lonely', heldBy: ['ghost'] }));
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('ghost')));
  assert.ok(errors.some((e) => e.includes('lonely') && e.includes('orphan')));
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
  t.principles[0].heldBy = ['one'];
  t.cruxes = [];
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('at least 2 viewpoints')),
    errors.join('\n')
  );
});

test('rule 10: a principle heldBy that a viewpoint does not reciprocate is reported', () => {
  const t = soundTopic();
  t.viewpoints[0].principles = [];
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('fairness') && e.includes('one') && e.includes('heldBy')),
    errors.join('\n')
  );
});

test('rule 10: a viewpoint principle that a principle does not reciprocate is reported', () => {
  const t = soundTopic();
  t.principles[0].heldBy = ['two'];
  const errors = validateTopic(t);
  assert.ok(
    errors.some((e) => e.includes('one') && e.includes('fairness') && e.includes('principles')),
    errors.join('\n')
  );
});

test('every error message names the offending item', () => {
  const t = soundTopic();
  t.viewpoints[0].citesFacts = ['nope'];
  for (const error of validateTopic(t)) assert.match(error, /viewpoint |fact |principle |crux /);
});
