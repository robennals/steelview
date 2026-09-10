import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankFacts, sortViewpoints, headlineFacts, supportingFactsByParent } from './rank-facts';
import type { Fact, FactStatus, Viewpoint } from './types';

function fact(id: string, status: FactStatus = 'well-supported', supports?: string): Fact {
  return {
    id,
    claim: id,
    status,
    ...(supports === undefined ? {} : { supports }),
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
    body: 'Context.',
  };
}

function viewpoint(
  id: string,
  over: Partial<Viewpoint> = {}
): Viewpoint {
  return {
    id,
    name: id,
    summary: 's',
    order: 1,
    citesFacts: [],
    acknowledges: [],
    setsAside: [],
    principles: [],
    body: 'The argument.',
    ...over,
  };
}

/** Rank `facts` (given as ids, all well-supported unless stated) and return ids. */
function order(factSpec: Array<string | [string, FactStatus]>, viewpoints: Viewpoint[]): string[] {
  const facts = factSpec.map((f) => (typeof f === 'string' ? fact(f) : fact(f[0], f[1])));
  return rankFacts(facts, viewpoints).map((f) => f.id);
}

test('a viewpoint ranks what it cites first, then what it acknowledges', () => {
  assert.deepEqual(
    order(
      ['a', 'b', 'c'],
      [viewpoint('only', { citesFacts: ['c', 'b'], acknowledges: ['a'] })]
    ),
    ['c', 'b', 'a']
  );
});

test('facts a viewpoint only sets aside are not ranked by it', () => {
  // `x` is set aside by the only viewpoint that mentions it, so it falls to
  // the tail behind every fact some viewpoint actually ranked.
  assert.deepEqual(
    order(
      ['a', 'x'],
      [viewpoint('only', { citesFacts: ['a'], setsAside: ['x'] })]
    ),
    ['a', 'x']
  );
});

test('round-robin: no viewpoint gets a second fact before every viewpoint has had a first', () => {
  // `big` ranks five facts, `small` ranks one. `small`'s single fact must
  // land in round 1, not after all five of `big`'s.
  const ids = order(
    ['b1', 'b2', 'b3', 'b4', 'b5', 's1'],
    [
      viewpoint('big', { citesFacts: ['b1', 'b2', 'b3', 'b4'], acknowledges: ['b5'] }),
      viewpoint('small', { acknowledges: ['s1'] }),
    ]
  );
  assert.deepEqual(ids.slice(0, 2).sort(), ['b1', 's1']);
  assert.deepEqual(ids, ['b1', 's1', 'b2', 'b3', 'b4', 'b5']);
});

test('a viewpoint that ranks far more facts cannot bury a viewpoint that ranks few', () => {
  const ids = order(
    ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 's1', 's2'],
    [
      viewpoint('big', {
        citesFacts: ['b1', 'b2', 'b3', 'b4', 'b5'],
        acknowledges: ['b6'],
      }),
      viewpoint('small', { citesFacts: ['s1'], acknowledges: ['s2'] }),
    ]
  );
  // Both of `small`'s facts are in the first four, even though `big` ranks six.
  assert.ok(ids.indexOf('s1') < 4 && ids.indexOf('s2') < 4, ids.join(','));
  assert.deepEqual(ids, ['b1', 's1', 'b2', 's2', 'b3', 'b4', 'b5', 'b6']);
});

test('a shared first pick costs both viewpoints their round-1 turn', () => {
  // Both viewpoints rank `shared` first. It is placed once, and neither may
  // substitute its own second fact into round 1 — so round 1 is `shared`
  // alone, and `a2`/`b2` wait for round 2.
  const ids = order(
    ['shared', 'a2', 'b2'],
    [
      viewpoint('a', { citesFacts: ['shared'], acknowledges: ['a2'] }),
      viewpoint('b', { citesFacts: ['shared'], acknowledges: ['b2'] }),
    ]
  );
  assert.deepEqual(ids, ['shared', 'a2', 'b2']);
});

test('within a round, a fact more viewpoints pick comes first', () => {
  // Round 1: `wide` is picked by two viewpoints, `narrow` by one. `wide`
  // leads even though `narrow` sorts earlier by id.
  const ids = order(
    ['wide', 'narrow'],
    [
      viewpoint('a', { citesFacts: ['wide'], acknowledges: ['narrow'] }),
      viewpoint('b', { citesFacts: ['wide'], acknowledges: ['narrow'] }),
      viewpoint('c', { citesFacts: ['narrow'], acknowledges: ['wide'] }),
    ]
  );
  assert.deepEqual(ids, ['wide', 'narrow']);
});

test('a within-round tie breaks on how many viewpoints rank the fact, then on id', () => {
  // Round 1 is a shared pick of `x`. In round 2, `p` and `q` are each picked
  // by exactly one viewpoint, so breadth within the round ties. A third
  // viewpoint acknowledges `q`, giving it three ranking viewpoints to `p`'s
  // two — so `q` leads, even though `p` sorts earlier by id and would win a
  // pure id tie-break.
  const ids = order(
    ['x', 'p', 'q'],
    [
      viewpoint('a', { citesFacts: ['x', 'p'], acknowledges: ['q'] }),
      viewpoint('b', { citesFacts: ['x', 'q'], acknowledges: ['p'] }),
      viewpoint('c', { acknowledges: ['x', 'q'] }),
    ]
  );
  assert.deepEqual(ids, ['x', 'q', 'p']);
});

/**
 * `setsAside` says a claim does not hold up as stated and does no work for
 * this viewpoint. Counting it in the tie-break boosted exactly the facts the
 * sides agree are not load-bearing, which is the opposite of what the tie-break
 * is for.
 */
test('setsAside does not count towards the tie-break', () => {
  const ids = order(
    ['x', 'p', 'q'],
    [
      viewpoint('a', { citesFacts: ['x', 'p'], acknowledges: ['q'] }),
      viewpoint('b', { citesFacts: ['x', 'q'], acknowledges: ['p'] }),
      // `c` sets `q` aside. If that counted, `q` would lead round 2; it must
      // not, so the tie falls through to id and `p` leads.
      viewpoint('c', { acknowledges: ['x'], setsAside: ['q'] }),
    ]
  );
  assert.deepEqual(ids, ['x', 'p', 'q']);
});

test('the order does not depend on the order of the viewpoints or the facts', () => {
  const vps = [
    viewpoint('a', { citesFacts: ['f1', 'f2'], acknowledges: ['f3'] }),
    viewpoint('b', { citesFacts: ['f3', 'f4'], acknowledges: ['f1'] }),
    viewpoint('c', { citesFacts: ['f2'], acknowledges: ['f4'] }),
  ];
  const ids = ['f1', 'f2', 'f3', 'f4'];
  const forward = order(ids, vps);
  const reversed = order([...ids].reverse(), [...vps].reverse());
  assert.deepEqual(reversed, forward);
});

test('unranked facts form a tail, ordered by status then id', () => {
  // Nothing ranks any of these but `a`, so the rest fall to the tail in
  // status order: contested, complicated, unknown, not-supported.
  const ids = order(
    [
      'a',
      ['z-unknown', 'unknown'],
      ['m-complicated', 'complicated'],
      ['b-contested', 'contested'],
      ['c-not-supported', 'not-supported'],
      ['d-complicated', 'complicated'],
    ],
    [
      viewpoint('v', {
        acknowledges: ['a'],
        setsAside: ['z-unknown', 'm-complicated', 'b-contested', 'c-not-supported', 'd-complicated'],
      }),
    ]
  );
  assert.deepEqual(ids, [
    'a',
    'b-contested',
    'd-complicated',
    'm-complicated',
    'z-unknown',
    'c-not-supported',
  ]);
});

/**
 * The owner's rule "complicated and unknown are less important, since we
 * aren't claiming anything" needs no special case in the ranker: the
 * validator already confines those statuses to `setsAside` (only
 * well-supported or contested facts may be cited, only well-supported ones
 * acknowledged), and `setsAside` is not ranked. This pins that consequence,
 * so a future loosening of the status gates cannot quietly float an
 * unknown fact into the top three.
 */
test('a complicated, unknown or not-supported fact can never outrank a ranked fact', () => {
  const ids = order(
    [
      ['tail-complicated', 'complicated'],
      ['tail-unknown', 'unknown'],
      ['tail-not-supported', 'not-supported'],
      'zzz-ranked',
    ],
    [
      viewpoint('v', {
        acknowledges: ['zzz-ranked'],
        setsAside: ['tail-complicated', 'tail-unknown', 'tail-not-supported'],
      }),
      viewpoint('w', {
        acknowledges: ['zzz-ranked'],
        setsAside: ['tail-complicated'],
      }),
    ]
  );
  assert.equal(ids[0], 'zzz-ranked');
});

test('a fact nothing references at all still appears, in the tail', () => {
  // The validator rejects an orphan fact, but the ranker must not silently
  // drop one — a dropped fact would be invisible rather than reported.
  const ids = order(['a', 'orphan'], [viewpoint('v', { acknowledges: ['a'] })]);
  assert.deepEqual(ids, ['a', 'orphan']);
});

test('a topic with no viewpoints falls back entirely to the status tail', () => {
  assert.deepEqual(order([['b', 'contested'], ['a', 'well-supported']], []), ['a', 'b']);
});

test('sortViewpoints sorts by order, with id as tie-break', () => {
  const vps = [
    viewpoint('c', { order: 1 }),
    viewpoint('a', { order: 3 }),
    viewpoint('b', { order: 1 }),
  ];
  sortViewpoints(vps);
  assert.deepEqual(
    vps.map((v) => v.id),
    ['b', 'c', 'a']
  );
});

// ------------------------------------------------------- the fact hierarchy

/** Rank facts given as `id` or `[id, status, supports]`, returning headline ids only. */
function headlineOrder(
  factSpec: Array<string | [string, FactStatus, string?]>,
  viewpoints: Viewpoint[]
): string[] {
  const facts = factSpec.map((f) => (typeof f === 'string' ? fact(f) : fact(f[0], f[1], f[2])));
  return headlineFacts(rankFacts(facts, viewpoints)).map((f) => f.id);
}

test('a supporting fact is not ranked, and does not appear in the headline list', () => {
  assert.deepEqual(
    headlineOrder(
      ['parent', ['child', 'well-supported', 'parent']],
      [viewpoint('v', { citesFacts: ['parent'], acknowledges: ['child'] })]
    ),
    ['parent']
  );
});

test('citing a supporting fact counts towards its parent', () => {
  // `v` opens on `child`, which supports `parent`. Relying on a detail is
  // relying on the claim the detail supports, so `parent` takes round 1 —
  // ahead of `other`, which two viewpoints rank first between them.
  const ids = headlineOrder(
    ['parent', ['child', 'well-supported', 'parent'], 'other'],
    [
      viewpoint('v', { citesFacts: ['child'], acknowledges: ['other'] }),
      viewpoint('w', { citesFacts: ['parent'], acknowledges: ['other'] }),
    ]
  );
  assert.deepEqual(ids, ['parent', 'other']);
});

test('rolling up a citation onto a fact already ranked keeps the earlier position', () => {
  // `v` ranks `parent` first and `child` (which supports `parent`) second.
  // The roll-up must not spend a second turn on `parent` or displace `late`
  // from round 2.
  const ids = headlineOrder(
    ['parent', ['child', 'well-supported', 'parent'], 'late'],
    [viewpoint('v', { citesFacts: ['parent', 'child'], acknowledges: ['late'] })]
  );
  assert.deepEqual(ids, ['parent', 'late']);
});

test('an unranked headline fact still reaches the tail, but a supporting one does not', () => {
  const ids = headlineOrder(
    ['ranked', 'unranked', ['child', 'well-supported', 'unranked']],
    [viewpoint('v', { citesFacts: ['ranked'], acknowledges: ['child'] })]
  );
  // `unranked` is ranked only through its child's roll-up, so it is placed;
  // `child` is nowhere in the headline list.
  assert.deepEqual(ids, ['ranked', 'unranked']);
});

test('rankFacts returns every fact, each supporting fact after its parent', () => {
  const facts = [
    fact('parent'),
    fact('b-child', 'well-supported', 'parent'),
    fact('a-child', 'complicated', 'parent'),
    fact('other'),
  ];
  assert.deepEqual(
    rankFacts(facts, [viewpoint('v', { citesFacts: ['parent'], acknowledges: ['other'] })]).map(
      (f) => f.id
    ),
    // Children sort by status then id, so the well-supported one leads.
    ['parent', 'b-child', 'a-child', 'other']
  );
});

test('supportingFactsByParent groups children under their parent, by status then id', () => {
  const groups = supportingFactsByParent([
    fact('parent'),
    fact('z', 'well-supported', 'parent'),
    fact('a', 'unknown', 'parent'),
    fact('m', 'well-supported', 'parent'),
    fact('elsewhere'),
  ]);
  assert.deepEqual([...groups.keys()], ['parent']);
  assert.deepEqual(groups.get('parent')!.map((f) => f.id), ['m', 'z', 'a']);
});

test('a fact whose supports points at nothing is kept visible as a headline fact', () => {
  // The validator reports this; the ranker must not disappear the fact in the
  // meantime, or a content error would render as a missing fact rather than a
  // failed build.
  assert.deepEqual(
    headlineOrder(
      ['a', ['stray', 'well-supported', 'no-such-fact']],
      [viewpoint('v', { citesFacts: ['a'], acknowledges: ['stray'] })]
    ),
    ['a', 'stray']
  );
});
