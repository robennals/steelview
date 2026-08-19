# Steelview Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a deployed, statically rendered Steelview topic page — facts, viewpoints, principles, and cruxes, each expandable in place — driven by validated markdown content, with the UK immigration topic fully authored.

**Architecture:** Editorial content is markdown files on disk, one file per item, read at build time. `lib/content/` parses frontmatter with gray-matter, validates each item's shape with zod, then validates the cross-reference graph between items; any violation throws and fails the build. `app/topics/[slug]/page.tsx` is a server component that renders the loaded topic into native `<details>` disclosures, with one small client component syncing the URL hash to which disclosure is open. No database, no auth, no comments in this milestone.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, zod, gray-matter, unified/remark/rehype, `node:test` via tsx, Playwright, pnpm, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-18-steelview-design.md` — read it before starting. The fact-status rubric in that spec is normative for Task 11 and is the reason most of the validation rules exist.

## Global Constraints

- **Package manager is pnpm.** Never run `npm install` or `yarn`.
- **Next.js 16 App Router**, React 19, TypeScript strict mode, Tailwind CSS v4.
- **Unit tests are `node:test` run through tsx** — `pnpm test:unit`. Not vitest, not jest.
- **End-to-end tests are Playwright** — `pnpm test:e2e`.
- **No database, no auth, no comments, no environment variables in this milestone.** Anything requiring a secret belongs to milestone 3.
- **Content is the source of truth and invalid content must break the build.** The loader throws; it never silently skips a bad file or renders a partial topic.
- **Fact statuses** are exactly: `well-supported`, `contested`, `not-supported`, `complicated`, `unknown`.
- **Source stances** are exactly: `supports`, `contests`, `complicates`.
- **Crux kinds** are exactly: `prediction`, `assumption`, `tradeoff`, `priority`.
- **Anchor id format** is `<kind>-<itemId>`, e.g. `fact-net-migration-2024`, `viewpoint-control-first`. Kinds in anchors are singular.
- **Status must never be conveyed by color alone** — every status treatment also carries a label or shape.
- Work happens on a branch off `main`; commit after every task.

## File Structure

| Path | Responsibility |
|---|---|
| `lib/content/schema.ts` | zod schemas for each item's frontmatter. No I/O. |
| `lib/content/types.ts` | TypeScript types inferred from the schemas, plus the composed `Topic` type. |
| `lib/content/validate.ts` | Pure cross-reference validation over a loaded `Topic`. Returns error strings. |
| `lib/content/load.ts` | Filesystem reading, frontmatter parsing, calls validate. Throws `ContentError`. |
| `lib/content/markdown.ts` | Markdown string → HTML string. |
| `lib/content/__fixtures__/topics/example/` | A small valid topic used by loader tests. |
| `app/topics/[slug]/page.tsx` | Server component: loads a topic, renders all four sections. |
| `components/topic/disclosure.tsx` | Shared `<details>` wrapper carrying the anchor id. |
| `components/topic/status-badge.tsx` | Fact status presentation. |
| `components/topic/prose.tsx` | Renders pre-generated HTML from markdown. |
| `components/topic/fact-item.tsx` | One fact: claim, status, body, sources grouped by stance. |
| `components/topic/viewpoint-item.tsx` | One viewpoint: summary, argument, three chip groups, principles. |
| `components/topic/principle-item.tsx` | One principle. |
| `components/topic/crux-item.tsx` | One crux: question, kind, positions side by side. |
| `components/topic/item-chips.tsx` | Cross-reference chip list linking to anchors. |
| `components/topic/hash-sync.tsx` | Client component: opens the disclosure named by the URL hash. |
| `content/topics/uk-immigration/` | The authored topic. |

---

### Task 1: Project scaffold

**Files:**
- Create: the Next.js app at the repository root (`package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`)
- Create: `lib/smoke.ts`, `lib/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: the `pnpm dev` / `pnpm build` / `pnpm test:unit` scripts every later task uses.

- [ ] **Step 1: Scaffold the app**

Run from the repository root. `create-next-app` refuses to write into a non-empty directory, so scaffold into a temp directory and move the files in.

```bash
pnpm dlx create-next-app@latest /tmp/steelview-scaffold \
  --ts --tailwind --app --src-dir=false --eslint --turbopack \
  --import-alias "@/*" --use-pnpm --skip-install
cp -R /tmp/steelview-scaffold/. .
rm -rf /tmp/steelview-scaffold
pnpm install
```

- [ ] **Step 2: Add the runtime and test dependencies**

```bash
pnpm add zod gray-matter unified remark-parse remark-gfm remark-rehype rehype-stringify
pnpm add -D tsx @playwright/test
```

- [ ] **Step 3: Add the test scripts**

In `package.json`, add to `"scripts"`:

```json
"test:unit": "tsx --test lib/**/*.test.ts",
"test:e2e": "playwright test",
"check": "pnpm test:unit && pnpm build"
```

- [ ] **Step 4: Write a failing smoke test**

Create `lib/smoke.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greeting } from './smoke';

test('the test runner is wired up', () => {
  assert.equal(greeting(), 'steelview');
});
```

- [ ] **Step 5: Run it and watch it fail**

Run: `pnpm test:unit`
Expected: FAIL — cannot find module `./smoke`.

- [ ] **Step 6: Make it pass**

Create `lib/smoke.ts`:

```ts
export function greeting(): string {
  return 'steelview';
}
```

- [ ] **Step 7: Verify**

Run: `pnpm test:unit`
Expected: PASS, 1 test.

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with pnpm and node:test"
```

---

### Task 2: Content schemas

**Files:**
- Create: `lib/content/schema.ts`
- Create: `lib/content/types.ts`
- Test: `lib/content/schema.test.ts`

**Interfaces:**
- Consumes: zod.
- Produces:
  - `FACT_STATUSES`, `SOURCE_STANCES`, `CRUX_KINDS` — readonly string tuples.
  - `sourceSchema`, `factFrontmatterSchema`, `viewpointFrontmatterSchema`, `principleFrontmatterSchema`, `cruxPositionSchema`, `cruxFrontmatterSchema`, `topicFrontmatterSchema`.
  - Types `FactStatus`, `SourceStance`, `CruxKind`, `Source`, `Fact`, `Viewpoint`, `Principle`, `CruxPosition`, `Crux`, `Topic`.

- [ ] **Step 1: Write the failing tests**

Create `lib/content/schema.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  factFrontmatterSchema,
  viewpointFrontmatterSchema,
  principleFrontmatterSchema,
  cruxFrontmatterSchema,
  topicFrontmatterSchema,
} from './schema';

const source = {
  stance: 'supports',
  quote: 'Long-term net migration was estimated at 728,000.',
  title: 'Long-term international migration estimates',
  url: 'https://www.ons.gov.uk/example',
  publisher: 'Office for National Statistics',
  date: '2024-11',
};

test('a fact parses and defaults sources to an empty array', () => {
  const parsed = factFrontmatterSchema.parse({ claim: 'A claim', status: 'unknown' });
  assert.deepEqual(parsed.sources, []);
});

test('a fact accepts sources', () => {
  const parsed = factFrontmatterSchema.parse({ claim: 'A claim', status: 'well-supported', sources: [source] });
  assert.equal(parsed.sources[0].publisher, 'Office for National Statistics');
});

test('an unknown fact status is rejected', () => {
  const result = factFrontmatterSchema.safeParse({ claim: 'A claim', status: 'mostly-true' });
  assert.equal(result.success, false);
});

test('a source url must be http or https', () => {
  const result = factFrontmatterSchema.safeParse({
    claim: 'A claim',
    status: 'well-supported',
    sources: [{ ...source, url: 'ons.gov.uk/example' }],
  });
  assert.equal(result.success, false);
});

test('a source date accepts YYYY, YYYY-MM and YYYY-MM-DD but not prose', () => {
  for (const date of ['2024', '2024-11', '2024-11-28']) {
    assert.equal(
      factFrontmatterSchema.safeParse({ claim: 'c', status: 'well-supported', sources: [{ ...source, date }] }).success,
      true,
      date
    );
  }
  assert.equal(
    factFrontmatterSchema.safeParse({ claim: 'c', status: 'well-supported', sources: [{ ...source, date: 'Nov 2024' }] })
      .success,
    false
  );
});

test('a viewpoint defaults all four reference lists to empty arrays', () => {
  const parsed = viewpointFrontmatterSchema.parse({ name: 'Control first', summary: 'One line.' });
  assert.deepEqual(parsed.citesFacts, []);
  assert.deepEqual(parsed.acknowledges, []);
  assert.deepEqual(parsed.setsAside, []);
  assert.deepEqual(parsed.principles, []);
});

test('a principle requires at least one holder', () => {
  assert.equal(principleFrontmatterSchema.safeParse({ name: 'Fairness', heldBy: [] }).success, false);
  assert.equal(principleFrontmatterSchema.safeParse({ name: 'Fairness', heldBy: ['one'] }).success, true);
});

test('a crux requires a known kind, two viewpoints and two positions', () => {
  const valid = {
    question: 'Will integration keep pace?',
    kind: 'prediction',
    divides: ['one', 'two'],
    positions: [
      { viewpoint: 'one', holds: 'It will not.' },
      { viewpoint: 'two', holds: 'It will.' },
    ],
  };
  assert.equal(cruxFrontmatterSchema.safeParse(valid).success, true);
  assert.equal(cruxFrontmatterSchema.safeParse({ ...valid, kind: 'vibes' }).success, false);
  assert.equal(cruxFrontmatterSchema.safeParse({ ...valid, divides: ['one'] }).success, false);
});

test('a topic requires an ISO lastUpdated date', () => {
  const base = { title: 'Immigration', subtitle: 'What is actually being argued about.' };
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, lastUpdated: '2026-08-18' }).success, true);
  assert.equal(topicFrontmatterSchema.safeParse({ ...base, lastUpdated: 'August 2026' }).success, false);
});
```

- [ ] **Step 2: Run the tests and watch them fail**

Run: `pnpm test:unit`
Expected: FAIL — cannot find module `./schema`.

- [ ] **Step 3: Write the schemas**

Create `lib/content/schema.ts`:

```ts
import { z } from 'zod';

export const FACT_STATUSES = [
  'well-supported',
  'contested',
  'not-supported',
  'complicated',
  'unknown',
] as const;

export const SOURCE_STANCES = ['supports', 'contests', 'complicates'] as const;

export const CRUX_KINDS = ['prediction', 'assumption', 'tradeoff', 'priority'] as const;

// Dates are strings, not Date objects: frontmatter dates are deliberately
// imprecise ("2024-11" for a monthly release) and YAML would coerce a bare
// date into a Date in the wrong timezone.
const partialDate = z
  .string()
  .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'must be YYYY, YYYY-MM or YYYY-MM-DD');

export const sourceSchema = z.object({
  stance: z.enum(SOURCE_STANCES),
  quote: z.string().min(1),
  title: z.string().min(1),
  url: z.string().regex(/^https?:\/\/\S+$/, 'must be an http(s) URL'),
  publisher: z.string().min(1),
  date: partialDate,
});

export const factFrontmatterSchema = z.object({
  claim: z.string().min(1),
  status: z.enum(FACT_STATUSES),
  sources: z.array(sourceSchema).default([]),
});

export const viewpointFrontmatterSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  citesFacts: z.array(z.string()).default([]),
  acknowledges: z.array(z.string()).default([]),
  setsAside: z.array(z.string()).default([]),
  principles: z.array(z.string()).default([]),
});

export const principleFrontmatterSchema = z.object({
  name: z.string().min(1),
  heldBy: z.array(z.string()).min(1, 'a principle nobody holds does not belong on the page'),
});

export const cruxPositionSchema = z.object({
  viewpoint: z.string().min(1),
  holds: z.string().min(1),
});

export const cruxFrontmatterSchema = z.object({
  question: z.string().min(1),
  kind: z.enum(CRUX_KINDS),
  divides: z.array(z.string()).min(2, 'a crux divides at least two viewpoints'),
  positions: z.array(cruxPositionSchema).min(2),
});

export const topicFrontmatterSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
});
```

- [ ] **Step 4: Write the types**

Create `lib/content/types.ts`:

```ts
import { z } from 'zod';
import {
  sourceSchema,
  factFrontmatterSchema,
  viewpointFrontmatterSchema,
  principleFrontmatterSchema,
  cruxPositionSchema,
  cruxFrontmatterSchema,
  topicFrontmatterSchema,
  FACT_STATUSES,
  SOURCE_STANCES,
  CRUX_KINDS,
} from './schema';

export type FactStatus = (typeof FACT_STATUSES)[number];
export type SourceStance = (typeof SOURCE_STANCES)[number];
export type CruxKind = (typeof CRUX_KINDS)[number];

/** Every content item is its frontmatter plus an id (its filename) and its markdown body. */
export type Item<T> = T & { id: string; body: string };

export type Source = z.infer<typeof sourceSchema>;
export type CruxPosition = z.infer<typeof cruxPositionSchema>;

export type Fact = Item<z.infer<typeof factFrontmatterSchema>>;
export type Viewpoint = Item<z.infer<typeof viewpointFrontmatterSchema>>;
export type Principle = Item<z.infer<typeof principleFrontmatterSchema>>;
export type Crux = Item<z.infer<typeof cruxFrontmatterSchema>>;

export type Topic = z.infer<typeof topicFrontmatterSchema> & {
  slug: string;
  /** The markdown body of topic.md — the page's introduction. */
  intro: string;
  facts: Fact[];
  viewpoints: Viewpoint[];
  principles: Principle[];
  cruxes: Crux[];
};

/** The four kinds of item, as they appear in anchor ids: `fact-net-migration-2024`. */
export type ItemKind = 'fact' | 'viewpoint' | 'principle' | 'crux';

export function anchorFor(kind: ItemKind, id: string): string {
  return `${kind}-${id}`;
}
```

- [ ] **Step 5: Verify**

Run: `pnpm test:unit`
Expected: PASS, all schema tests green.

- [ ] **Step 6: Commit**

```bash
git add lib/content/schema.ts lib/content/types.ts lib/content/schema.test.ts
git commit -m "feat: add content frontmatter schemas and types"
```

---

### Task 3: Cross-reference validator

**Files:**
- Create: `lib/content/validate.ts`
- Test: `lib/content/validate.test.ts`

**Interfaces:**
- Consumes: `Topic`, `Fact`, `Viewpoint`, `Principle`, `Crux` from `lib/content/types.ts`.
- Produces: `validateTopic(topic: Topic): string[]` — returns one human-readable message per violation, empty array when the topic is sound.

This task implements validation rules 1–7 from the spec. Read that section before starting.

- [ ] **Step 1: Write the failing tests**

Create `lib/content/validate.test.ts`:

```ts
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
    body: '',
    ...over,
  };
}

function viewpoint(over: Partial<Viewpoint> & { id: string }): Viewpoint {
  return {
    name: 'A viewpoint',
    summary: 'One line.',
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

test('rule 4: a contested fact needs sources on both sides and a body', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'delta', status: 'contested', body: '' }));
  t.viewpoints[0].setsAside = ['delta'];
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('delta') && e.includes('contests')), errors.join('\n'));
  assert.ok(errors.some((e) => e.includes('delta') && e.includes('body')), errors.join('\n'));
});

test('rule 5: a viewpoint that acknowledges nothing is rejected', () => {
  const t = soundTopic();
  t.viewpoints[0].acknowledges = [];
  assert.ok(validateTopic(t).some((e) => e.includes('one') && e.includes('acknowledges')));
});

test('rule 6: a crux must give a position for every viewpoint it divides', () => {
  const t = soundTopic();
  t.cruxes[0].positions = [{ viewpoint: 'one', holds: 'Soon.' }];
  assert.ok(validateTopic(t).some((e) => e.includes('timing') && e.includes('two')));
});

test('rule 6: a crux may not divide an unknown viewpoint', () => {
  const t = soundTopic();
  t.cruxes[0].divides = ['one', 'nope'];
  assert.ok(validateTopic(t).some((e) => e.includes('nope')));
});

test('rule 7: a fact no viewpoint references is an orphan', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'lonely' }));
  assert.ok(validateTopic(t).some((e) => e.includes('lonely') && e.includes('orphan')));
});

test('rule 7: setsAside is enough to keep a fact from being an orphan', () => {
  const t = soundTopic();
  t.facts.push(fact({ id: 'sidelined', status: 'complicated' }));
  t.viewpoints[0].setsAside = ['sidelined'];
  assert.deepEqual(validateTopic(t), []);
});

test('rule 7: a principle held by no real viewpoint is an orphan', () => {
  const t = soundTopic();
  t.principles.push(principle({ id: 'lonely', heldBy: ['ghost'] }));
  const errors = validateTopic(t);
  assert.ok(errors.some((e) => e.includes('ghost')));
  assert.ok(errors.some((e) => e.includes('lonely') && e.includes('orphan')));
});

test('every error message names the offending item', () => {
  const t = soundTopic();
  t.viewpoints[0].citesFacts = ['nope'];
  for (const error of validateTopic(t)) assert.match(error, /viewpoint |fact |principle |crux /);
});
```

- [ ] **Step 2: Run the tests and watch them fail**

Run: `pnpm test:unit`
Expected: FAIL — cannot find module `./validate`.

- [ ] **Step 3: Write the validator**

Create `lib/content/validate.ts`:

```ts
import type { Topic } from './types';

/**
 * Check the cross-reference graph of an already-shape-valid topic. Returns one
 * message per violation rather than throwing, so a single run reports every
 * problem in a topic instead of only the first — an author fixing content
 * wants the whole list.
 *
 * Rules are numbered to match the "Validation" section of the design spec.
 */
export function validateTopic(topic: Topic): string[] {
  const errors: string[] = [];
  const factById = new Map(topic.facts.map((f) => [f.id, f]));
  const viewpointIds = new Set(topic.viewpoints.map((v) => v.id));
  const principleIds = new Set(topic.principles.map((p) => p.id));

  // Facts referenced by any viewpoint in any way, and principles claimed by a
  // real viewpoint — used for the orphan check (rule 7).
  const referencedFacts = new Set<string>();
  const heldPrinciples = new Set<string>();

  const CITABLE_STATUSES = new Set(['well-supported', 'contested']);

  for (const v of topic.viewpoints) {
    const lists: Array<[string, string[]]> = [
      ['citesFacts', v.citesFacts],
      ['acknowledges', v.acknowledges],
      ['setsAside', v.setsAside],
    ];
    const listOfFact = new Map<string, string>();

    for (const [listName, ids] of lists) {
      for (const id of ids) {
        const f = factById.get(id);
        if (!f) {
          // rule 1
          errors.push(`viewpoint ${v.id}: ${listName} references unknown fact "${id}"`);
          continue;
        }
        referencedFacts.add(id);

        // rule 2 — one relationship per fact per viewpoint
        const previous = listOfFact.get(id);
        if (previous) {
          errors.push(`viewpoint ${v.id}: fact "${id}" appears in both ${previous} and ${listName}`);
        } else {
          listOfFact.set(id, listName);
        }

        // rule 2 — status gates
        if (listName === 'citesFacts' && !CITABLE_STATUSES.has(f.status)) {
          errors.push(
            `viewpoint ${v.id}: citesFacts may not include "${id}" (status ${f.status}) — only well-supported or contested facts can be built on; put it in setsAside instead`
          );
        }
        if (listName === 'acknowledges' && f.status !== 'well-supported') {
          errors.push(
            `viewpoint ${v.id}: acknowledges may only include well-supported facts, but "${id}" is ${f.status}`
          );
        }
      }
    }

    // rule 5
    if (v.acknowledges.length === 0) {
      errors.push(
        `viewpoint ${v.id}: acknowledges is empty — a viewpoint that concedes nothing is advocacy, not a steelman`
      );
    }

    // rule 1
    for (const id of v.principles) {
      if (!principleIds.has(id)) errors.push(`viewpoint ${v.id}: references unknown principle "${id}"`);
    }
  }

  for (const f of topic.facts) {
    // rule 3
    if ((f.status === 'well-supported' || f.status === 'not-supported') && f.sources.length === 0) {
      errors.push(`fact ${f.id}: status ${f.status} requires at least one source`);
    }
    // rule 4
    if (f.status === 'contested') {
      if (!f.sources.some((s) => s.stance === 'supports')) {
        errors.push(`fact ${f.id}: a contested fact needs at least one "supports" source`);
      }
      if (!f.sources.some((s) => s.stance === 'contests')) {
        errors.push(`fact ${f.id}: a contested fact needs at least one "contests" source`);
      }
      if (f.body.trim().length === 0) {
        errors.push(`fact ${f.id}: a contested fact needs a body explaining the shape of the disagreement`);
      }
    }
  }

  for (const p of topic.principles) {
    for (const id of p.heldBy) {
      // rule 1
      if (!viewpointIds.has(id)) {
        errors.push(`principle ${p.id}: heldBy references unknown viewpoint "${id}"`);
      } else {
        heldPrinciples.add(p.id);
      }
    }
  }

  for (const c of topic.cruxes) {
    const positioned = new Set(c.positions.map((p) => p.viewpoint));
    for (const id of c.divides) {
      // rule 1
      if (!viewpointIds.has(id)) {
        errors.push(`crux ${c.id}: divides references unknown viewpoint "${id}"`);
        continue;
      }
      // rule 6
      if (!positioned.has(id)) {
        errors.push(`crux ${c.id}: no position given for viewpoint "${id}"`);
      }
    }
    for (const p of c.positions) {
      if (!viewpointIds.has(p.viewpoint)) {
        errors.push(`crux ${c.id}: position references unknown viewpoint "${p.viewpoint}"`);
      } else if (!c.divides.includes(p.viewpoint)) {
        errors.push(`crux ${c.id}: gives a position for "${p.viewpoint}", which it does not list in divides`);
      }
    }
  }

  // rule 7
  for (const f of topic.facts) {
    if (!referencedFacts.has(f.id)) {
      errors.push(
        `fact ${f.id}: orphan — no viewpoint cites, acknowledges or sets it aside, so it does no work on the page`
      );
    }
  }
  for (const p of topic.principles) {
    if (!heldPrinciples.has(p.id)) {
      errors.push(`principle ${p.id}: orphan — no real viewpoint holds it`);
    }
  }

  return errors;
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `pnpm test:unit`
Expected: PASS, all validator tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/content/validate.ts lib/content/validate.test.ts
git commit -m "feat: validate the cross-reference graph of a topic"
```

---

### Task 4: Content loader

**Files:**
- Create: `lib/content/load.ts`
- Create: fixture files under `lib/content/__fixtures__/topics/example/`
- Test: `lib/content/load.test.ts`

**Interfaces:**
- Consumes: `validateTopic` from `./validate`, all schemas from `./schema`, all types from `./types`.
- Produces:
  - `CONTENT_ROOT` — absolute path to `content/topics`.
  - `class ContentError extends Error`
  - `loadTopic(slug: string, root?: string): Promise<Topic>`
  - `listTopicSlugs(root?: string): Promise<string[]>`

- [ ] **Step 1: Create the test fixture — a small, valid topic**

Create `lib/content/__fixtures__/topics/example/topic.md`:

```markdown
---
title: Example
subtitle: A fixture topic used by the loader tests.
lastUpdated: 2026-08-18
---
The introduction to the example topic.
```

Create `lib/content/__fixtures__/topics/example/facts/alpha.md`:

```markdown
---
claim: Alpha is established
status: well-supported
sources:
  - stance: supports
    quote: Alpha is established.
    title: A study of alpha
    url: https://example.org/alpha
    publisher: Example Institute
    date: 2024-03
---
```

Create `lib/content/__fixtures__/topics/example/facts/gamma.md`:

```markdown
---
claim: Gamma is established
status: well-supported
sources:
  - stance: supports
    quote: Gamma is established.
    title: A study of gamma
    url: https://example.org/gamma
    publisher: Example Institute
    date: 2024-04
---
```

Create `lib/content/__fixtures__/topics/example/facts/beta.md`:

```markdown
---
claim: Beta is true only under a narrow definition
status: complicated
sources:
  - stance: complicates
    quote: Beta depends on how you count.
    title: A note on beta
    url: https://example.org/beta
    publisher: Example Institute
    date: 2024-05
---
Beta is often asserted, but only holds under a definition most people do not have in mind.
```

Create `lib/content/__fixtures__/topics/example/viewpoints/one.md`:

```markdown
---
name: One
summary: The first viewpoint, in a line.
citesFacts: [alpha]
acknowledges: [gamma]
setsAside: [beta]
principles: [fairness]
---
The full argument for viewpoint one.
```

Create `lib/content/__fixtures__/topics/example/viewpoints/two.md`:

```markdown
---
name: Two
summary: The second viewpoint, in a line.
citesFacts: [gamma]
acknowledges: [alpha]
principles: [fairness]
---
The full argument for viewpoint two.
```

Create `lib/content/__fixtures__/topics/example/principles/fairness.md`:

```markdown
---
name: Fairness
heldBy: [one, two]
---
Both viewpoints appeal to fairness; they disagree about what it requires.
```

Create `lib/content/__fixtures__/topics/example/cruxes/timing.md`:

```markdown
---
question: Does the effect arrive soon or late?
kind: prediction
divides: [one, two]
positions:
  - viewpoint: one
    holds: Soon, and that is why it matters now.
  - viewpoint: two
    holds: Late, and by then other things will have changed.
---
```

- [ ] **Step 2: Write the failing tests**

Create `lib/content/load.test.ts`:

```ts
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

test('listTopicSlugs returns directory names, sorted', async () => {
  assert.deepEqual(await listTopicSlugs(FIXTURES), ['example']);
});
```

- [ ] **Step 3: Run the tests and watch them fail**

Run: `pnpm test:unit`
Expected: FAIL — cannot find module `./load`.

- [ ] **Step 4: Write the loader**

Create `lib/content/load.ts`:

```ts
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { z } from 'zod';
import {
  factFrontmatterSchema,
  viewpointFrontmatterSchema,
  principleFrontmatterSchema,
  cruxFrontmatterSchema,
  topicFrontmatterSchema,
} from './schema';
import { validateTopic } from './validate';
import type { Topic, Item } from './types';

export const CONTENT_ROOT = path.join(process.cwd(), 'content', 'topics');

/**
 * Thrown for any content problem: a missing file, frontmatter that does not
 * match its schema, or a cross-reference violation. Content problems must fail
 * the build rather than render a partial page, so nothing catches this.
 */
export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentError';
  }
}

function formatIssues(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
}

/**
 * Read every `.md` file in `dir`, validate its frontmatter, and return items
 * sorted by id. A missing directory yields no items — a topic with no cruxes
 * is legal, a topic with a malformed crux is not.
 */
async function readItems<T>(dir: string, schema: z.ZodType<T>): Promise<Array<Item<T>>> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  const files = names.filter((n) => n.endsWith('.md')).sort();
  return Promise.all(
    files.map(async (file) => {
      const full = path.join(dir, file);
      const { data, content } = matter(await readFile(full, 'utf8'));
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new ContentError(`${full}: ${formatIssues(parsed.error)}`);
      }
      return { ...parsed.data, id: path.basename(file, '.md'), body: content.trim() };
    })
  );
}

export async function loadTopic(slug: string, root: string = CONTENT_ROOT): Promise<Topic> {
  const dir = path.join(root, slug);
  const topicFile = path.join(dir, 'topic.md');

  let raw: string;
  try {
    raw = await readFile(topicFile, 'utf8');
  } catch {
    throw new ContentError(`No topic.md found for topic "${slug}" (looked in ${dir})`);
  }

  const { data, content } = matter(raw);
  const parsed = topicFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new ContentError(`${topicFile}: ${formatIssues(parsed.error)}`);
  }

  const topic: Topic = {
    ...parsed.data,
    slug,
    intro: content.trim(),
    facts: await readItems(path.join(dir, 'facts'), factFrontmatterSchema),
    viewpoints: await readItems(path.join(dir, 'viewpoints'), viewpointFrontmatterSchema),
    principles: await readItems(path.join(dir, 'principles'), principleFrontmatterSchema),
    cruxes: await readItems(path.join(dir, 'cruxes'), cruxFrontmatterSchema),
  };

  const errors = validateTopic(topic);
  if (errors.length > 0) {
    throw new ContentError(`Topic "${slug}" has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
  }

  return topic;
}

export async function listTopicSlugs(root: string = CONTENT_ROOT): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `pnpm test:unit`
Expected: PASS. If the `import.meta.dirname` line fails, confirm `tsconfig.json` has `"module": "esnext"` and `"moduleResolution": "bundler"` — `create-next-app` sets both.

- [ ] **Step 6: Commit**

```bash
git add lib/content/load.ts lib/content/load.test.ts lib/content/__fixtures__
git commit -m "feat: load and validate a topic from markdown files"
```

---

### Task 5: Markdown rendering

**Files:**
- Create: `lib/content/markdown.ts`
- Test: `lib/content/markdown.test.ts`

**Interfaces:**
- Consumes: unified, remark-parse, remark-gfm, remark-rehype, rehype-stringify.
- Produces: `renderMarkdown(md: string): Promise<string>` — markdown in, HTML string out. Returns `''` for empty input.

- [ ] **Step 1: Write the failing tests**

Create `lib/content/markdown.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from './markdown';

test('renders paragraphs', async () => {
  assert.equal(await renderMarkdown('Hello there.'), '<p>Hello there.</p>');
});

test('renders emphasis and links', async () => {
  const html = await renderMarkdown('An *emphasised* [link](https://example.org).');
  assert.match(html, /<em>emphasised<\/em>/);
  assert.match(html, /<a href="https:\/\/example\.org">link<\/a>/);
});

test('renders GFM tables', async () => {
  const html = await renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |');
  assert.match(html, /<table>/);
});

test('empty input renders an empty string', async () => {
  assert.equal(await renderMarkdown(''), '');
  assert.equal(await renderMarkdown('   \n  '), '');
});

test('raw HTML in content is escaped, not passed through', async () => {
  const html = await renderMarkdown('<script>alert(1)</script>');
  assert.doesNotMatch(html, /<script>/);
});
```

- [ ] **Step 2: Run the tests and watch them fail**

Run: `pnpm test:unit`
Expected: FAIL — cannot find module `./markdown`.

- [ ] **Step 3: Write the renderer**

Create `lib/content/markdown.ts`:

```ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// remark-rehype drops raw HTML nodes unless rehype-raw is added. That is the
// behaviour we want: content is authored in this repo, but escaping raw HTML
// keeps a copy-pasted quote from silently injecting markup into the page.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

export async function renderMarkdown(md: string): Promise<string> {
  if (!md.trim()) return '';
  const file = await processor.process(md);
  return String(file).trim();
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `pnpm test:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/content/markdown.ts lib/content/markdown.test.ts
git commit -m "feat: render item markdown bodies to HTML"
```

---

### Task 6: Fixture topic page renders

This task puts an end-to-end page on screen with plain, unstyled markup. Task 10 does the design pass; do not spend time on visual polish here.

**Files:**
- Create: `app/topics/[slug]/page.tsx`
- Create: `components/topic/disclosure.tsx`
- Create: `components/topic/prose.tsx`
- Create: `content/topics/example/` (copy of the test fixture, so there is something to render before the real topic exists)
- Test: `tests/topic-page.spec.ts`, `playwright.config.ts`

**Interfaces:**
- Consumes: `loadTopic`, `listTopicSlugs` from `lib/content/load`; `renderMarkdown` from `lib/content/markdown`; `anchorFor` from `lib/content/types`.
- Produces:
  - `<Disclosure anchor={string} summary={ReactNode}>{children}</Disclosure>`
  - `<Prose html={string} />`
  - the route `/topics/[slug]`, statically generated for every slug from `listTopicSlugs()`.

- [ ] **Step 1: Copy the fixture into real content**

```bash
mkdir -p content/topics
cp -R lib/content/__fixtures__/topics/example content/topics/example
```

- [ ] **Step 2: Configure Playwright**

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 3: Write the failing end-to-end test**

Create `tests/topic-page.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('the topic page shows all four sections', async ({ page }) => {
  await page.goto('/topics/example');
  await expect(page.getByRole('heading', { name: 'Example', level: 1 })).toBeVisible();
  for (const section of ['Facts', 'Viewpoints', 'Principles', 'Cruxes']) {
    await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible();
  }
});

test('a fact is collapsed until it is expanded', async ({ page }) => {
  await page.goto('/topics/example');
  const alpha = page.locator('#fact-alpha');
  await expect(alpha).toBeVisible();
  await expect(alpha.getByText('A study of alpha')).toBeHidden();
  await alpha.getByText('Alpha is established').click();
  await expect(alpha.getByText('A study of alpha')).toBeVisible();
});

test('a viewpoint lists the facts it builds on and accepts', async ({ page }) => {
  await page.goto('/topics/example');
  const one = page.locator('#viewpoint-one');
  await one.getByText('The first viewpoint, in a line.').click();
  await expect(one.getByRole('link', { name: 'Alpha is established' })).toBeVisible();
  await expect(one.getByRole('link', { name: 'Gamma is established' })).toBeVisible();
});
```

- [ ] **Step 4: Run it and watch it fail**

Run: `pnpm exec playwright install --with-deps chromium` (first time only), then `pnpm test:e2e`
Expected: FAIL — `/topics/example` 404s.

- [ ] **Step 5: Write the shared presentation components**

Create `components/topic/disclosure.tsx`:

```tsx
import type { ReactNode } from 'react';

/**
 * Every expandable item on the page. Native <details> so expansion works
 * without JavaScript and gets keyboard, screen-reader, find-in-page and print
 * behaviour for free; the anchor id is on the <details> element so
 * components/topic/hash-sync.tsx can open it by id.
 */
export function Disclosure({
  anchor,
  summary,
  children,
}: {
  anchor: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <details id={anchor} className="border-b">
      <summary className="cursor-pointer py-3">{summary}</summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}
```

Create `components/topic/prose.tsx`:

```tsx
/**
 * Renders HTML produced by lib/content/markdown.ts. The HTML comes from
 * markdown in this repository, and renderMarkdown escapes raw HTML, so there
 * is no untrusted input on this path.
 */
export function Prose({ html }: { html: string }) {
  if (!html) return null;
  return <div className="prose-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
```

- [ ] **Step 6: Write the page**

Create `app/topics/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { loadTopic, listTopicSlugs } from '@/lib/content/load';
import { renderMarkdown } from '@/lib/content/markdown';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from '@/components/topic/disclosure';
import { Prose } from '@/components/topic/prose';

export async function generateStaticParams() {
  return (await listTopicSlugs()).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await listTopicSlugs()).includes(slug)) notFound();

  const topic = await loadTopic(slug);

  // Render every markdown body once, here, so the components stay synchronous.
  const intro = await renderMarkdown(topic.intro);
  const bodies = new Map<string, string>();
  for (const item of [...topic.facts, ...topic.viewpoints, ...topic.principles, ...topic.cruxes]) {
    bodies.set(item.id, await renderMarkdown(item.body));
  }

  return (
    <main>
      <h1>{topic.title}</h1>
      <p>{topic.subtitle}</p>
      <p>Last updated {topic.lastUpdated}</p>
      <Prose html={intro} />

      <h2>Facts</h2>
      {topic.facts.map((fact) => (
        <Disclosure key={fact.id} anchor={anchorFor('fact', fact.id)} summary={<>{fact.claim} — {fact.status}</>}>
          <Prose html={bodies.get(fact.id) ?? ''} />
          <ul>
            {fact.sources.map((source, i) => (
              <li key={i}>
                <q>{source.quote}</q>{' '}
                <a href={source.url}>{source.title}</a>, {source.publisher}, {source.date} ({source.stance})
              </li>
            ))}
          </ul>
        </Disclosure>
      ))}

      <h2>Viewpoints</h2>
      {topic.viewpoints.map((viewpoint) => (
        <Disclosure
          key={viewpoint.id}
          anchor={anchorFor('viewpoint', viewpoint.id)}
          summary={<>{viewpoint.name} — {viewpoint.summary}</>}
        >
          <Prose html={bodies.get(viewpoint.id) ?? ''} />
          {(
            [
              ['Builds on', viewpoint.citesFacts],
              ['Accepts', viewpoint.acknowledges],
              ['Sets aside', viewpoint.setsAside],
            ] as const
          ).map(([label, ids]) =>
            ids.length === 0 ? null : (
              <p key={label}>
                {label}:{' '}
                {ids.map((id) => {
                  const fact = topic.facts.find((f) => f.id === id);
                  return (
                    <a key={id} href={`#${anchorFor('fact', id)}`}>
                      {fact?.claim ?? id}
                    </a>
                  );
                })}
              </p>
            )
          )}
        </Disclosure>
      ))}

      <h2>Principles</h2>
      {topic.principles.map((principle) => (
        <Disclosure key={principle.id} anchor={anchorFor('principle', principle.id)} summary={principle.name}>
          <Prose html={bodies.get(principle.id) ?? ''} />
        </Disclosure>
      ))}

      <h2>Cruxes</h2>
      {topic.cruxes.map((crux) => (
        <Disclosure key={crux.id} anchor={anchorFor('crux', crux.id)} summary={crux.question}>
          <Prose html={bodies.get(crux.id) ?? ''} />
          <dl>
            {crux.positions.map((position) => (
              <div key={position.viewpoint}>
                <dt>{topic.viewpoints.find((v) => v.id === position.viewpoint)?.name ?? position.viewpoint}</dt>
                <dd>{position.holds}</dd>
              </div>
            ))}
          </dl>
        </Disclosure>
      ))}
    </main>
  );
}
```

- [ ] **Step 7: Run the tests and verify they pass**

Run: `pnpm test:e2e`
Expected: PASS, 3 tests.

Run: `pnpm test:unit && pnpm build`
Expected: both succeed.

- [ ] **Step 8: Commit**

```bash
git add app components content playwright.config.ts tests
git commit -m "feat: render a topic page from loaded content"
```

---

### Task 7: Deep linking and hash sync

**Files:**
- Create: `components/topic/hash-sync.tsx`
- Modify: `app/topics/[slug]/page.tsx` — mount `<HashSync />`
- Test: `tests/deep-link.spec.ts`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `<HashSync />` — a client component rendering nothing, which opens the `<details>` named by the URL hash and by any in-page anchor click.

- [ ] **Step 1: Write the failing tests**

Create `tests/deep-link.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('loading a fact anchor opens that fact', async ({ page }) => {
  await page.goto('/topics/example#fact-alpha');
  await expect(page.locator('#fact-alpha')).toHaveAttribute('open', '');
  await expect(page.locator('#fact-alpha').getByText('A study of alpha')).toBeVisible();
});

test('clicking a cross-reference chip opens the fact it points at', async ({ page }) => {
  await page.goto('/topics/example');
  const one = page.locator('#viewpoint-one');
  await one.getByText('The first viewpoint, in a line.').click();
  await one.getByRole('link', { name: 'Gamma is established' }).click();
  await expect(page.locator('#fact-gamma')).toHaveAttribute('open', '');
});

test('other items stay closed', async ({ page }) => {
  await page.goto('/topics/example#fact-alpha');
  await expect(page.locator('#fact-beta')).not.toHaveAttribute('open', '');
});
```

- [ ] **Step 2: Run them and watch the first two fail**

Run: `pnpm test:e2e tests/deep-link.spec.ts`
Expected: FAIL — the targeted `<details>` is not open.

- [ ] **Step 3: Write the client component**

Create `components/topic/hash-sync.tsx`:

```tsx
'use client';

import { useEffect } from 'react';

/**
 * Opens the disclosure named by the URL hash. Two triggers are needed:
 * `hashchange` covers back/forward navigation and pasted links, but does not
 * fire when a link points at the hash the page is already on — so in-page
 * anchor clicks are handled directly as well.
 */
export function HashSync() {
  useEffect(() => {
    const openById = (id: string, scroll: boolean) => {
      if (!id) return;
      const el = document.getElementById(id);
      if (!(el instanceof HTMLDetailsElement)) return;
      el.open = true;
      if (scroll) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const onHashChange = () => openById(decodeURIComponent(window.location.hash.slice(1)), true);

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      openById(decodeURIComponent(anchor.hash.slice(1)), false);
    };

    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}
```

- [ ] **Step 4: Mount it on the page**

In `app/topics/[slug]/page.tsx`, add the import and render it as the first child of `<main>`:

```tsx
import { HashSync } from '@/components/topic/hash-sync';
```

```tsx
    <main>
      <HashSync />
      <h1>{topic.title}</h1>
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `pnpm test:e2e`
Expected: PASS, 6 tests across both spec files.

- [ ] **Step 6: Commit**

```bash
git add components/topic/hash-sync.tsx app/topics tests/deep-link.spec.ts
git commit -m "feat: deep-link to an item and open it"
```

---

### Task 8: Extract the item components

The page component from Task 6 holds all four item layouts inline. Split them before the design pass, so Task 10 edits one focused file per item type.

**Files:**
- Create: `components/topic/status-badge.tsx`, `components/topic/item-chips.tsx`, `components/topic/fact-item.tsx`, `components/topic/viewpoint-item.tsx`, `components/topic/principle-item.tsx`, `components/topic/crux-item.tsx`
- Modify: `app/topics/[slug]/page.tsx` — use them
- Test: the existing Playwright specs must still pass unchanged.

**Interfaces:**
- Consumes: types from `lib/content/types`, `Disclosure`, `Prose`.
- Produces:
  - `<StatusBadge status={FactStatus} />`
  - `<ItemChips label={string} facts={Fact[]} />`
  - `<FactItem fact={Fact} bodyHtml={string} />`
  - `<ViewpointItem viewpoint={Viewpoint} bodyHtml={string} factsById={Map<string, Fact>} principlesById={Map<string, Principle>} />`
  - `<PrincipleItem principle={Principle} bodyHtml={string} />`
  - `<CruxItem crux={Crux} bodyHtml={string} viewpointsById={Map<string, Viewpoint>} />`

This is a refactor: behaviour must not change. The Playwright specs from Tasks 6 and 7 are the safety net — run them before and after.

- [ ] **Step 1: Confirm the safety net is green before touching anything**

Run: `pnpm test:e2e`
Expected: PASS, 6 tests. If not, stop and fix before refactoring.

- [ ] **Step 2: Write `status-badge.tsx`**

```tsx
import type { FactStatus } from '@/lib/content/types';

const LABELS: Record<FactStatus, string> = {
  'well-supported': 'Well supported',
  contested: 'Contested',
  'not-supported': 'Not supported',
  complicated: 'Complicated',
  unknown: 'Unknown',
};

/**
 * Status must never be carried by colour alone — a reader with any form of
 * colour blindness, or reading a printout, must get the same information. The
 * text label is the primary channel; Task 10 adds a second, non-colour visual
 * channel on top of it.
 */
export function StatusBadge({ status }: { status: FactStatus }) {
  return <span data-status={status}>{LABELS[status]}</span>;
}
```

- [ ] **Step 3: Write `item-chips.tsx`**

```tsx
import type { Fact } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';

/** A labelled row of links to facts elsewhere on the page. Renders nothing when empty. */
export function ItemChips({ label, facts }: { label: string; facts: Fact[] }) {
  if (facts.length === 0) return null;
  return (
    <div>
      <h4>{label}</h4>
      <ul>
        {facts.map((fact) => (
          <li key={fact.id}>
            <a href={`#${anchorFor('fact', fact.id)}`}>{fact.claim}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Write `fact-item.tsx`**

```tsx
import type { Fact, SourceStance } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';
import { StatusBadge } from './status-badge';

const STANCE_HEADINGS: Record<SourceStance, string> = {
  supports: 'Supporting',
  contests: 'Contesting',
  complicates: 'Complicating',
};

const STANCE_ORDER: SourceStance[] = ['supports', 'contests', 'complicates'];

export function FactItem({ fact, bodyHtml }: { fact: Fact; bodyHtml: string }) {
  return (
    <Disclosure
      anchor={anchorFor('fact', fact.id)}
      summary={
        <>
          <span>{fact.claim}</span> <StatusBadge status={fact.status} />
        </>
      }
    >
      <Prose html={bodyHtml} />
      {STANCE_ORDER.map((stance) => {
        const sources = fact.sources.filter((s) => s.stance === stance);
        if (sources.length === 0) return null;
        return (
          <section key={stance}>
            <h4>{STANCE_HEADINGS[stance]}</h4>
            {sources.map((source, i) => (
              <figure key={`${stance}-${i}`}>
                <blockquote>{source.quote}</blockquote>
                <figcaption>
                  <a href={source.url} target="_blank" rel="noreferrer noopener">
                    {source.title}
                  </a>
                  , {source.publisher}, {source.date}
                </figcaption>
              </figure>
            ))}
          </section>
        );
      })}
    </Disclosure>
  );
}
```

- [ ] **Step 5: Write `viewpoint-item.tsx`**

```tsx
import type { Fact, Principle, Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';
import { ItemChips } from './item-chips';

function resolve(ids: string[], byId: Map<string, Fact>): Fact[] {
  // Ids are guaranteed to resolve — validateTopic rejects unknown references —
  // but filter defensively so a future loader change can never crash the page.
  return ids.map((id) => byId.get(id)).filter((f): f is Fact => f !== undefined);
}

export function ViewpointItem({
  viewpoint,
  bodyHtml,
  factsById,
  principlesById,
}: {
  viewpoint: Viewpoint;
  bodyHtml: string;
  factsById: Map<string, Fact>;
  principlesById: Map<string, Principle>;
}) {
  return (
    <Disclosure
      anchor={anchorFor('viewpoint', viewpoint.id)}
      summary={
        <>
          <span>{viewpoint.name}</span> <span>{viewpoint.summary}</span>
        </>
      }
    >
      <Prose html={bodyHtml} />
      <ItemChips label="Builds on" facts={resolve(viewpoint.citesFacts, factsById)} />
      <ItemChips label="Accepts, though it cuts against this view" facts={resolve(viewpoint.acknowledges, factsById)} />
      <ItemChips label="Sets aside" facts={resolve(viewpoint.setsAside, factsById)} />
      {viewpoint.principles.length > 0 && (
        <div>
          <h4>Rests on</h4>
          <ul>
            {viewpoint.principles.map((id) => (
              <li key={id}>
                <a href={`#${anchorFor('principle', id)}`}>{principlesById.get(id)?.name ?? id}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Disclosure>
  );
}
```

- [ ] **Step 6: Write `principle-item.tsx` and `crux-item.tsx`**

`components/topic/principle-item.tsx`:

```tsx
import type { Principle } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';

export function PrincipleItem({ principle, bodyHtml }: { principle: Principle; bodyHtml: string }) {
  return (
    <Disclosure anchor={anchorFor('principle', principle.id)} summary={principle.name}>
      <Prose html={bodyHtml} />
    </Disclosure>
  );
}
```

`components/topic/crux-item.tsx`:

```tsx
import type { Crux, Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from './disclosure';
import { Prose } from './prose';

const KIND_LABELS = {
  prediction: 'Different predictions',
  assumption: 'Different assumptions',
  tradeoff: 'Different trade-offs',
  priority: 'Different priorities',
} as const;

export function CruxItem({
  crux,
  bodyHtml,
  viewpointsById,
}: {
  crux: Crux;
  bodyHtml: string;
  viewpointsById: Map<string, Viewpoint>;
}) {
  return (
    <Disclosure
      anchor={anchorFor('crux', crux.id)}
      summary={
        <>
          <span>{crux.question}</span> <span>{KIND_LABELS[crux.kind]}</span>
        </>
      }
    >
      <Prose html={bodyHtml} />
      <dl>
        {crux.positions.map((position) => (
          <div key={position.viewpoint}>
            <dt>
              <a href={`#${anchorFor('viewpoint', position.viewpoint)}`}>
                {viewpointsById.get(position.viewpoint)?.name ?? position.viewpoint}
              </a>
            </dt>
            <dd>{position.holds}</dd>
          </div>
        ))}
      </dl>
    </Disclosure>
  );
}
```

- [ ] **Step 7: Rewrite the page to use them**

Replace the body of `app/topics/[slug]/page.tsx` below the data loading with:

```tsx
  const factsById = new Map(topic.facts.map((f) => [f.id, f]));
  const principlesById = new Map(topic.principles.map((p) => [p.id, p]));
  const viewpointsById = new Map(topic.viewpoints.map((v) => [v.id, v]));

  return (
    <main>
      <HashSync />
      <header>
        <h1>{topic.title}</h1>
        <p>{topic.subtitle}</p>
        <Prose html={intro} />
        <p>Last updated {topic.lastUpdated}</p>
      </header>

      <section>
        <h2>Facts</h2>
        {topic.facts.map((fact) => (
          <FactItem key={fact.id} fact={fact} bodyHtml={bodies.get(fact.id) ?? ''} />
        ))}
      </section>

      <section>
        <h2>Viewpoints</h2>
        {topic.viewpoints.map((viewpoint) => (
          <ViewpointItem
            key={viewpoint.id}
            viewpoint={viewpoint}
            bodyHtml={bodies.get(viewpoint.id) ?? ''}
            factsById={factsById}
            principlesById={principlesById}
          />
        ))}
      </section>

      <section>
        <h2>Principles</h2>
        {topic.principles.map((principle) => (
          <PrincipleItem key={principle.id} principle={principle} bodyHtml={bodies.get(principle.id) ?? ''} />
        ))}
      </section>

      <section>
        <h2>Cruxes</h2>
        {topic.cruxes.map((crux) => (
          <CruxItem key={crux.id} crux={crux} bodyHtml={bodies.get(crux.id) ?? ''} viewpointsById={viewpointsById} />
        ))}
      </section>
    </main>
  );
```

Add the four component imports at the top of the file and delete the now-unused `Disclosure` import.

- [ ] **Step 8: Verify behaviour is unchanged**

Run: `pnpm test:e2e`
Expected: PASS, 6 tests — the same tests, unmodified.

Run: `pnpm test:unit && pnpm build`
Expected: both succeed.

- [ ] **Step 9: Commit**

```bash
git add components/topic app/topics
git commit -m "refactor: extract one component per item kind"
```

---

### Task 9: Topic index and site shell

**Files:**
- Modify: `app/page.tsx` — list the topics
- Modify: `app/layout.tsx` — site metadata and shell
- Test: `tests/index.spec.ts`

**Interfaces:**
- Consumes: `listTopicSlugs`, `loadTopic`.
- Produces: `/` listing every topic with a link to its page.

- [ ] **Step 1: Write the failing test**

Create `tests/index.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('the home page links to each topic', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: /Example/ });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/topics\/example$/);
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test:e2e tests/index.spec.ts`
Expected: FAIL — the default Next.js starter page has no such link.

- [ ] **Step 3: Write the home page**

Replace `app/page.tsx` with:

```tsx
import Link from 'next/link';
import { listTopicSlugs, loadTopic } from '@/lib/content/load';

export default async function HomePage() {
  const slugs = await listTopicSlugs();
  const topics = await Promise.all(slugs.map((slug) => loadTopic(slug)));

  return (
    <main>
      <h1>Steelview</h1>
      <p>The strongest version of every side of an argument, and the facts underneath it.</p>
      <ul>
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link href={`/topics/${topic.slug}`}>{topic.title}</Link>
            <p>{topic.subtitle}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 4: Set the site metadata**

In `app/layout.tsx`, replace the exported `metadata` with:

```tsx
export const metadata: Metadata = {
  title: { default: 'Steelview', template: '%s — Steelview' },
  description: 'The strongest version of every side of an argument, and the facts underneath it.',
};
```

And in `app/topics/[slug]/page.tsx`, add:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await loadTopic(slug);
  return { title: topic.title, description: topic.subtitle };
}
```

- [ ] **Step 5: Verify**

Run: `pnpm test:e2e`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add app tests/index.spec.ts
git commit -m "feat: add the topic index and site metadata"
```

---

### Task 10: Design pass

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`, and every file under `components/topic/`
- Test: existing Playwright specs must still pass; add `tests/appearance.spec.ts`

**Interfaces:**
- Consumes: everything from Tasks 6–9. No new interfaces; this task changes presentation only.

**REQUIRED SUB-SKILL: use the `frontend-design` skill for this task.** The reading experience is the product; the default shadcn/Tailwind starter look is not acceptable output here.

Design requirements, all testable by eye:

1. **Legible on a phone first.** Most readers arrive from a link on a phone. Long-form reading measure, generous line height, tap targets at least 44px.
2. **The five fact statuses are distinguishable without colour.** Each carries its text label plus a second non-colour channel (weight, border treatment, an icon shape). Verify by viewing the page in greyscale.
3. **Avoid red/green as the primary status axis.** On a politics site a red badge reads as a verdict on the politics rather than on the evidence.
4. **`acknowledges` carries real visual weight** inside a viewpoint — it is the page's evidence that it is doing what it claims, so it must not look like a footnote.
5. **A crux's positions read side by side** on a wide screen and stack on a narrow one.
6. **Collapsed rows are scannable.** A reader should be able to skim all the claims without expanding anything.
7. **Dark mode works**, via `prefers-color-scheme`.

- [ ] **Step 1: Invoke the frontend-design skill and do the design pass**

Work through the components; keep markup semantics (headings, `<details>`, `<figure>`/`<blockquote>`, `<dl>`) intact — the Playwright specs and the accessibility story both depend on them.

- [ ] **Step 2: Add an appearance regression test**

Create `tests/appearance.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('the topic page renders at phone width without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/example');
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

test('every fact status is announced in text, not colour alone', async ({ page }) => {
  await page.goto('/topics/example');
  await expect(page.locator('#fact-alpha').getByText('Well supported')).toBeVisible();
  await expect(page.locator('#fact-beta').getByText('Complicated')).toBeVisible();
});
```

- [ ] **Step 3: Verify**

Run: `pnpm test:e2e`
Expected: PASS, 9 tests.

- [ ] **Step 4: Look at it**

Run `pnpm dev` and open `/topics/example` at 390px and at desktop width, in both light and dark mode, and in greyscale. Check every design requirement above by eye. Fix what fails.

- [ ] **Step 5: Commit**

```bash
git add app components tests/appearance.spec.ts
git commit -m "feat: design the topic reading experience"
```

---

### Task 11: Author the UK immigration topic

**Files:**
- Create: `content/topics/uk-immigration/topic.md` and its `facts/`, `viewpoints/`, `principles/`, `cruxes/` directories
- Delete: `content/topics/example/` (the fixture copy; the fixture under `lib/content/__fixtures__/` stays)
- Modify: the Playwright specs, which currently target `example`

**Interfaces:**
- Consumes: the schemas and validation rules. No code changes.

This is the editorial task, and it is the point of the milestone. **Read the "The fact-status rubric" and "Choosing topics" sections of the spec before writing anything** — they are normative, and the validator only enforces the mechanical half of them.

Scope: **UK immigration policy**, roughly 2020 to now. A narrower scope makes
the facts checkable; "immigration" in the abstract does not. US immigration is
a separate topic for a later milestone — the two share a name and almost
nothing else, and merging them would produce facts that are true in one
country and false in the other.

Required minimums: at least 8 facts, at least 3 viewpoints, at least 3 principles, at least 3 cruxes.

- [ ] **Step 1: Research the facts, with real sources**

Use WebSearch and WebFetch. Every source needs a real URL, a real verbatim quote from that page, the publishing organisation, and a date. **Do not write a quote from memory** — fetch the page and copy it. A fabricated citation on a site whose entire premise is honest sourcing is the worst possible defect.

Prefer primary and statistical sources (ONS, Home Office, OBR, Migration Advisory Committee, peer-reviewed economics) over commentary.

- [ ] **Step 2: Apply the rubric before assigning a status**

For each candidate fact, in order:

1. Can it be narrowed until roughly 90% of people who looked at the evidence carefully would call it established? If so, narrow it and tag `well-supported`. **This is the default move and most facts should end here.**
2. If it cannot be narrowed and it is genuinely central to the disagreement, tag `contested` — and then it needs sources on both sides and a body explaining why the evidence points both ways.
3. If it is a claim readers expect to hear but which does not hold up as stated, tag `complicated`, `unknown`, or `not-supported`, and make sure a viewpoint sets it aside.

If more than about three facts end up `contested`, they have not been narrowed enough. Go back to step 1.

- [ ] **Step 3: Write the topic file**

Create `content/topics/uk-immigration/topic.md`:

```markdown
---
title: Immigration
subtitle: What the UK argument is actually about, and where it genuinely divides.
lastUpdated: 2026-08-18
---
A short, calm introduction: what this page covers, what it deliberately leaves out, and how to read the fact statuses.
```

- [ ] **Step 4: Write the facts**

One file per fact in `content/topics/uk-immigration/facts/`. Filenames are the ids: lowercase, hyphenated, descriptive of the claim rather than of a source (`net-migration-2024.md`, not `ons-figures.md`).

Follow this shape exactly — this is a real example of the required form, with the source fields filled from a page you actually fetched:

```markdown
---
claim: Net migration to the UK peaked at around 900,000 in the year to June 2023 and fell sharply thereafter
status: well-supported
sources:
  - stance: supports
    quote: "REPLACE WITH A VERBATIM QUOTE FROM THE FETCHED PAGE"
    title: Long-term international migration, provisional
    url: https://www.ons.gov.uk/REPLACE-WITH-THE-REAL-URL
    publisher: Office for National Statistics
    date: 2025-05
---
Optional: what this figure counts and what it does not — students, dependants, returning citizens — since almost every disagreement about the number is really a disagreement about the definition.
```

- [ ] **Step 5: Write the viewpoints**

At least three, in `content/topics/uk-immigration/viewpoints/`. Each is written in the voice of its strongest advocate, and each must satisfy the steelman test: **someone who holds this view reads it and finds it fair; someone who holds a different one reads it and finds it recognisable rather than a caricature.**

Every viewpoint needs a non-empty `acknowledges` listing well-supported facts that cut against it. If you cannot find any, the viewpoint is written as advocacy — rewrite it.

- [ ] **Step 6: Write the principles and cruxes**

Principles are perennial and should be statable without mentioning immigration. Most are held by more than one viewpoint; the disagreement is about weight.

Cruxes are the payoff section: each names one specific reason the sides diverge, with a position for each side it divides. A crux that just restates a viewpoint is not a crux — it should be something that, if resolved, would actually move someone.

- [ ] **Step 7: Validate**

Run: `pnpm build`
Expected: the build succeeds. If content is invalid, `ContentError` lists every problem with the item id — fix them all and rerun.

- [ ] **Step 8: Point the tests at the real topic and drop the fixture copy**

```bash
rm -rf content/topics/example
```

Update `tests/topic-page.spec.ts`, `tests/deep-link.spec.ts`, `tests/index.spec.ts` and `tests/appearance.spec.ts` to use `/topics/uk-immigration` and real item ids from the content you just wrote. The assertions stay the same in kind: sections render, an item expands, a chip opens its target, no horizontal overflow at 390px, statuses are announced in text.

- [ ] **Step 9: Verify**

Run: `pnpm test:unit && pnpm test:e2e && pnpm build`
Expected: all pass.

- [ ] **Step 10: Read the page as a partisan**

This is the milestone's actual acceptance test, and the bar is higher than
fairness. Read the whole page twice — once as someone who wants much less
immigration, once as someone who wants much more — and each time ask:

1. **Is my own viewpoint better argued than the version I would have written?**
   Does it rest on firmer facts than the ones I had to hand? If it reads as
   merely adequate, it is not finished.
2. **Where it is less strident than I would put it, is that for a reason I
   would concede?** The only acceptable reasons are that it declines to lean
   on something I thought was established but which is actually contested or
   unsupported, or that it grants a well-supported fact I cannot honestly
   deny. If it is softer for any other reason, it has been watered down rather
   than steelmanned — restore the force of the argument.
3. **Are the other viewpoints recognisable rather than caricatured?**

Revise until all three hold from both directions. If a viewpoint cannot be
made stronger than its partisans' own version, the research in Step 1 was not
deep enough — go back to it rather than settling.

- [ ] **Step 11: Commit**

```bash
git add content tests
git commit -m "content: author the UK immigration topic"
```

---

### Task 12: Deploy

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: everything.
- Produces: a live URL.

- [ ] **Step 1: Add CI**

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
```

`pnpm test:e2e` builds the app, so a content or type error fails CI.

- [ ] **Step 2: Verify CI passes locally first**

Run: `pnpm install --frozen-lockfile && pnpm test:unit && pnpm test:e2e`
Expected: all pass.

- [ ] **Step 3: Write the README**

Replace `README.md` with a short document covering: what Steelview is (one paragraph, drawn from the spec's opening), the commands (`pnpm dev`, `pnpm test:unit`, `pnpm test:e2e`, `pnpm build`), where content lives and the one-file-per-item convention, and a pointer to `docs/superpowers/specs/2026-08-18-steelview-design.md` for the fact-status rubric.

- [ ] **Step 4: Deploy**

Run: `pnpm dlx vercel@latest link` then `pnpm dlx vercel@latest --prod`

No environment variables are required in this milestone.

- [ ] **Step 5: Check the deployed site**

Open the production URL on a phone-sized viewport. Confirm: the home page lists UK immigration, the topic page renders, an item expands, a deep link to a fact opens it, and the source links resolve to real pages.

- [ ] **Step 6: Commit**

```bash
git add .github README.md
git commit -m "chore: add CI and project README"
```

---

## Definition of done

- `pnpm test:unit`, `pnpm test:e2e`, and `pnpm build` all pass.
- The UK immigration topic is live, with every source link resolving to a real page carrying the quoted text.
- Deep links to individual facts and viewpoints work.
- Deliberately breaking a cross-reference in a content file fails the build with a message naming the item.
- The page reads fairly from both directions (Task 11, Step 10).
