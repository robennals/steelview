# Steelview — Design

Steelview presents all sides of a divisive news issue on one page: the facts
that are actually established, the strongest version of each major viewpoint,
the moral principles underneath them, and the specific reasons the sides
disagree. A reader who arrives holding one view should leave able to state the
other views in a form their holders would endorse.

Signed-in readers can comment on any individual item and suggest facts or
viewpoints that are missing. Editorial content lives in the repo as markdown;
comments live in Neon Postgres.

## Purpose

> The goal of this project is to avoid misleading arguments and ground stuff
> in context.

That is the whole of it, and everything below is machinery in its service.
The failure this site exists to prevent is not the *false* claim — false
claims are easy to catch and rare in serious argument. It is the **true claim
that misleads**: the real number on the wrong denominator, the real trend
measured from a cherry-picked start date, the real fact that only sounds
decisive because nothing is standing next to it.

Four mechanisms carry that purpose, and an author working on a new topic
should understand what each is *for*, not just what it requires:

- **[The status rubric](#the-fact-status-rubric)** stops a viewpoint being
  built on a claim that cannot bear the weight. Its centre is the instruction
  to *narrow before you contest*: a claim stated so broadly that it needs a
  `contested` badge is usually a claim someone is going to overstate.
- **[The sourcing rule](#validation)** — every fact carries at least one
  quoted source, whatever its status, and every figure asserted in prose is
  [audited against those quotes](#the-figures-audit). Nothing is presented as
  a fact on this page without a quote a reader can go and check.
- **[The context requirement](#fact)** — every fact carries a body saying what
  it measures and does not, how it compares, how confident to be, and what it
  is commonly mistaken for. A number alone is the raw material of a misleading
  argument; the body is where it is defused, at the point of use.
- **[The time-series requirement](#time-series-on-facts)** — a fact that moves
  over time should show its whole published series, not a window an author
  chose. Picking the start date is the single easiest way to mislead with
  entirely true numbers.

A fifth mechanism serves it structurally: **[fact order is derived, not
authored](#ordering)**. The Facts section shows three facts before it
collapses, so whatever picks those three is, in practice, the page's opening
argument — and handing that choice to one editor's ranking would be a
misleading argument built out of true facts and nothing else.

## Contents

- [Purpose](#purpose)
- [Stack](#stack)
- [Content model](#content-model)
- [Ordering](#ordering)
- [The fact-status rubric](#the-fact-status-rubric)
- [The figures audit](#the-figures-audit)
- [Time series on facts](#time-series-on-facts)
- [Reading experience](#reading-experience)
- [Auth](#auth)
- [Comments and moderation](#comments-and-moderation)
- [Milestones](#milestones)
- [Open questions](#open-questions)

## Stack

- **Next.js 16 App Router**, TypeScript, deployed on Vercel. Topic pages are
  statically rendered — content changes ship with a deploy.
- **Tailwind + shadcn/ui** for primitives, with a bespoke visual layer on top
  (see [Reading experience](#reading-experience)).
- **Content**: markdown files in `content/`, read at build time, validated
  with **zod**, parsed with **gray-matter**.
- **Database**: Neon Postgres via **Drizzle ORM** (`drizzle-orm/neon-http`),
  migrations via `drizzle-kit`. Used only for comments, users, and auth
  bookkeeping — never for editorial content.
- **Auth**: Auth.js v5 with the Drizzle adapter.
- **Moderation**: Claude Haiku 4.5 through `@anthropic-ai/sdk`.
- **Tests**: `node:test` via `tsx` for pure logic and content validation,
  Playwright for end-to-end flows. Both mirror acx-reviews, which the
  developer already maintains.
- **Package manager**: pnpm.

Nothing here is novel by design. The interesting parts of this project are the
content model and the reading experience; everything else should be the boring
option so it needs no attention.

## Content model

One directory per topic, one markdown file per item. Item IDs are filenames,
so a cross-reference can never point at a typo'd ID that happens to parse.

```
content/topics/uk-immigration/
  topic.md
  facts/
    net-migration-2024.md
    wage-effect-low-skill.md
  viewpoints/
    control-first.md
    openness-first.md
  principles/
    national-self-determination.md
  cruxes/
    will-integration-keep-pace.md
```

Each file is YAML frontmatter (the structured part) plus a markdown body (the
prose). Bodies are rendered with remark/rehype — no MDX, because no item needs
arbitrary JSX and MDX would invite it.

### Fact

```yaml
---
claim: Net migration to the UK exceeded 700,000 in the year to June 2024
status: well-supported     # well-supported | contested | not-supported | complicated | unknown
sources:
  - stance: supports       # supports | contests | complicates
    quote: "Long-term net migration was estimated at 728,000..."
    title: ONS long-term international migration estimates
    url: https://...
    publisher: Office for National Statistics
    date: 2024-11
---
The context. Required — see the checklist below.
```

A fact has **no `order` field**. Reading order is derived from what the
viewpoints rank; see [Ordering](#ordering).

**Headline facts and supporting facts.** An optional `supports` field carries
the id of the headline fact this fact is evidence for:

```yaml
supports: how-people-actually-arrive
```

Facts are not a flat list of equally-weighted items. Some are what the argument
is actually about — "immigration has increased significantly in recent years",
"skilled worker immigration is fiscally positive", "most immigration is due to
study and work". Others are real, checkable and uninteresting standing alone: a
contract overrun, a grant-rate movement, a route-level fiscal breakdown. Listing
both at one level makes the reader work out which items are load-bearing, which
is precisely the work this page exists to do for them.

- A fact **with** `supports` does not appear in the top-level Facts list; it
  renders inside its parent's detail, keeping its own `#fact-<id>` anchor.
- A fact **without** `supports` is a headline fact and appears in the list.
- **Depth is exactly one.** A supporting fact may not itself be supported.
  Arbitrary nesting would produce a tree nobody can hold in their head, and the
  reader benefit is a two-level structure, not a taxonomy.

The target shape is a headline list a reader can hold in their head — roughly 8
to 12 items on a topic the size of uk-immigration, which has 12 headline facts
and 20 supporting ones.

**At least one source, whatever the status.** A `complicated` or `unknown`
fact is making a claim about the evidence just as firmly as a `well-supported`
one is making a claim about the world, and an unsourced one is an assertion in
a badge. The build rejects a sourceless fact.

**The body is required, on every fact.** A claim plus a status badge is
exactly the true-but-misleading number this project exists to defuse; the body
is where it gets grounded. The build enforces that a body exists; whether it
is a *good* body is editorial judgement, against this checklist:

1. **What it measures and what it does not.** Scope and denominator. Most
   misleading immigration numbers are definitional rather than false — net
   versus gross, long-term versus all arrivals, applications versus grants,
   foreign-born versus foreign-national. Say which one this is, and say which
   one a reader may be assuming.
2. **How it compares.** The time series where one exists, and a baseline where
   one is meaningful: other countries, other categories, the historical norm.
   A number with nothing beside it can be made to mean anything.
3. **How confident to be.** Provisional status, known revisions, sample
   limits, and how much the figure has moved between releases.
4. **What it is commonly mistaken for.** Name the misleading argument this
   fact is most often recruited into, and defuse it here, at the point of use
   — not in a viewpoint, where only one side's readers will meet it.

Items 1 and 4 are what stop a fact being quoted against itself, and are the
two authors skip. Do not skip them.

### Viewpoint

```yaml
---
name: Control first
summary: One line a holder of this view would accept as fair.
order: 1                  # position in the Viewpoints section — see below
citesFacts: [net-migration-2024, wage-effect-low-skill]
acknowledges: [fiscal-contribution-net-positive]
setsAside: [benefit-tourism-scale]
principles: [national-self-determination]
---
The full argument, in the voice of its strongest advocate.
```

A viewpoint relates to a fact in exactly one of three ways:

- **`citesFacts`** — facts it rests on. Only `well-supported` or `contested`
  facts may appear here.
- **`acknowledges`** — `well-supported` facts that cut *against* it. Required
  and non-empty: a viewpoint that concedes nothing is advocacy, not a
  steelman, and the build rejects it.
- **`setsAside`** — claims a reader expects this viewpoint to make but which
  do not hold up as stated. This is where `not-supported`, `complicated`, and
  `unknown` facts live. The body should say briefly why the viewpoint does not
  lean on them; naming them is what stops a reader thinking the page ducked
  the question.

The order of `citesFacts` and of `acknowledges` is meaningful — it is this
viewpoint's own ranking of what matters, and it feeds the derived fact order
(see [Ordering](#ordering)). Put the fact the argument would open on first.

**`order` is required, and choosing it is an editorial decision.** Sorting
viewpoints by id meant a retitle silently reordered the sides and the page
opened on whichever one happened to sort first. The rule for choosing it:

> **The order must not group one side of the argument together.** It should
> alternate across the spectrum, so that no run of adjacent viewpoints reads
> as the page's own position and no side is presented as the "and also" at the
> bottom.

Prefer to open on a viewpoint that is not at either pole, so the first thing a
reader meets cannot be read as an endorsement, and then alternate. The
uk-immigration ordering is: `the-right-kind-of-immigration-not-less-of-it`
(1, hardest to place on the axis), then `too-much-too-fast-damages-the-social-fabric`
(2), `immigration-makes-britain-better-off` (3),
`a-country-should-decide-who-joins-it` (4),
`moral-duty-to-help-people-fleeing-danger` (5) — restrictive and expansive
alternating, no two adjacent on the same side.

### Principle

```yaml
---
name: National self-determination
heldBy: [control-first, openness-first]   # ordered most- to least-weight
---
```

A principle is perennial and should be statable without reference to the
topic. Most principles are held by more than one viewpoint — the viewpoints
differ on how much weight each gets, which is what makes them cruxes.

### Crux

```yaml
---
question: Will integration keep pace with arrival rates?
kind: prediction        # prediction | assumption | tradeoff | priority
divides: [control-first, openness-first]
positions:
  - viewpoint: control-first
    holds: Integration capacity is the binding constraint and is already exceeded.
  - viewpoint: openness-first
    holds: Integration lags but converges within a generation, as it has before.
---
```

### Validation

`lib/content/schema.ts` defines zod schemas; `lib/content/load.ts` reads and
validates the tree. Loading fails loudly — a bad content file breaks the build
rather than rendering a half-page. Beyond schema shape, these rules are
enforced and each has a unit test:

1. Every ID in `citesFacts`, `acknowledges`, `setsAside`, `principles`,
   `heldBy`, `divides`, and `positions[].viewpoint` resolves to a real item.
2. `citesFacts` contains only `well-supported` or `contested` facts;
   `acknowledges` contains only `well-supported` facts; a fact appears at most
   once across the three lists on any one viewpoint.
3. **Every fact has at least one source**, whatever its status.
4. **Every fact has a non-empty body.**
5. A `contested` fact has at least one `supports` **and** one `contests`
   source.
6. Every viewpoint has a non-empty `acknowledges`.
7. Every crux `divides` at least two viewpoints and gives a position for each.
8. No orphans: every **headline** fact appears in some viewpoint's
   `citesFacts`, `acknowledges`, or `setsAside`, and every principle is held by
   at least one viewpoint. A supporting fact is exempt — its parent is what
   justifies it being on the page.
9. A topic has at least one fact and at least two viewpoints.
10. `heldBy` and a viewpoint's `principles` agree in both directions.
11. A fact's `supports` resolves to another fact in the same topic, and that
    fact is itself a headline fact — no self-reference, no chains, no cycles.

Rules 3 and 4 are the sourcing rule and the context requirement from
[Purpose](#purpose), in their enforceable form. Both used to be conditional on
status — sources for `well-supported` and `not-supported`, a body for
`contested` — which left the exact gap the rules exist to close: a
`complicated` or `unknown` fact could ship as a sourceless, contextless
assertion, and those are precisely the facts a reader is least equipped to
check.

Rule 2 also does load-bearing work for ordering. Because `citesFacts` accepts
only `well-supported` or `contested` facts and `acknowledges` only
`well-supported` ones, a `complicated`, `unknown` or `not-supported` fact can
appear in no list but `setsAside` — and `setsAside` is not ranked. So those
three statuses can never reach the top of the Facts section, without the
ranking algorithm needing a special case: *complicated and unknown are less
important, because they are not claiming anything.*

Rule 8 keeps the Facts section from silting up with true-but-irrelevant
material. A fact that matters only because readers expect to hear about it
belongs in the `setsAside` list of the viewpoint that would otherwise raise
it — that is the honest place for it, and it forces someone to say out loud
which side the talking point was doing work for.

## Ordering

Reading order is a claim about importance, so on this page it is derived
rather than authored. There is no `order` on a fact.

### Fact order: diversity ranking

Implemented in `lib/content/rank-facts.ts`, with unit tests in
`rank-facts.test.ts`.

Each viewpoint gets to rank the facts *it* thinks matter, and the page shows a
set prioritised to be the facts considered most important by a **diverse** set
of views. Nothing gets its second-best fact shown before every viewpoint has
had its first.

0. **Only headline facts are ranked and listed.** A citation of a supporting
   fact counts towards its parent — a viewpoint relying on a detail is relying
   on the claim that detail supports. Where rolling up duplicates a headline
   fact the viewpoint already ranked, the earlier position stands and the
   duplicate is dropped.
1. **A viewpoint's ranking** is its `citesFacts`, in the order written, then
   its `acknowledges`, in the order written. What it argues *from* outranks
   what it concedes. Facts it only `setsAside` are not ranked by it at all —
   setting a claim aside is a statement that it does no work here.
2. **Round-robin by rank.** Round 1 places every viewpoint's 1st-ranked fact,
   round 2 every viewpoint's 2nd, and so on. No viewpoint's *k+1*th fact may
   be placed before every viewpoint's *k*th has been placed or that viewpoint
   has run out. A viewpoint with twenty ranked facts cannot bury one with
   three.
3. **A shared pick costs both viewpoints their turn.** Indexing is into the
   viewpoint's own list, not into "its highest unplaced fact". If two
   viewpoints both rank fact X first, X is placed once and *neither* may
   substitute something else into round 1. Agreeing about what matters does
   not win a side extra slots.
4. **Within a round, breadth of agreement orders the picks.** A fact chosen by
   more viewpoints in that round comes first. Ties break on the number of
   viewpoints that rank the fact at all — `citesFacts` or `acknowledges`, and
   deliberately **not** `setsAside`, which counted a viewpoint saying the claim
   does *not* hold up as a vote for showing it earlier — then on id. Deliberately **not** on file order or on a viewpoint's position in
   the section: either would permanently hand slot 1 to the same side, and
   even-handedness between viewpoints is a hard requirement, not a preference.
5. **Unranked headline facts form a tail**, ordered by status (`well-supported`,
   `contested`, `complicated`, `unknown`, `not-supported`) then id. Per rule 2
   above, every `complicated`, `unknown` and `not-supported` fact lands here.

The result does not depend on the order of the viewpoint files or the fact
files. On uk-immigration it opens on `immigration-against-the-long-run` (the
first-ranked fact of two viewpoints), then `how-people-actually-arrive` and
`skilled-worker-fiscal-gain-concentrated` — the first-ranked facts of the
technocratic and the expansive viewpoints respectively. Three facts, three
different sides' opening move.

### Viewpoint order

Explicit, required, and editorial: the `order` field, described under
[Viewpoint](#viewpoint). Sorted ascending, id as tie-break.

## The figures audit

`scripts/check-figures.ts`, run as `pnpm check:figures` and in CI.

The sourcing rule extends to prose. A figure asserted in a viewpoint, a crux
or a fact body is presented as a fact just as firmly as one in a `claim`
field, and nothing was checking it. The audit:

- scans the markdown **bodies** of every content item (not frontmatter —
  `claim` is already covered by the fact's own sources, and a crux `holds` is
  a statement of belief rather than an assertion of fact);
- extracts money (`£1,234`, `£15.3 billion`), percentage (`5.7%`) and
  comma-grouped thousands (`46,500`) patterns, and deliberately not years,
  ordinals or bare small integers — those are not figures anyone can
  cherry-pick, and matching them would bury the findings;
- reports any figure that appears in no `quote` on the same topic, normalising
  for line-wrapped quotes, thousands separators and scale words so a real
  match is not missed on formatting alone;
- **fails the build** on an unmatched figure;
- reports, **advisorily and without failing**, any fact whose `claim` carries
  a figure but which has no [time series](#time-series-on-facts).

The right fix for an unmatched figure is usually not to delete it but to add
the source that already justifies it — or, where the figure is a ratio the
author computed from two sourced numbers, to show the arithmetic in the body
so a reader can follow it from quoted inputs.

## Time series on facts

*Not built. This section specifies the next round.*

A `series` field on a fact: time-series data plus its own quoted source,
rendered as a small SVG chart in the expanded fact.

The motivation is the sharpest case of a true-but-misleading claim:

> It's very easy to give a misleading picture by cherry picking dates. Harder
> if we require always showing a time series.

Two rules make it work, and the second is the one that actually does the
anti-cherry-picking:

1. **A series carries its own source**, quoted, like any other claim on the
   page. The chart is a factual assertion and gets the same treatment as one.
2. **A series must span the full range the source publishes**, not a window
   the author chose. An author-chosen window is precisely the abuse the
   feature exists to prevent, so "show the series" without "show all of it"
   would ship the problem inside the solution. Where a source genuinely
   changes basis part-way (a definitional break, a new collection method),
   the series still runs end to end and the break is annotated rather than
   trimmed away.

Series are wanted "ideally", not always — some facts are point-in-time and
have no series to show. That is why `check-figures.ts` reports missing series
as an advisory rather than an error, and why its advisory output already reads
a `series` key from raw frontmatter: when the field lands, the advisory list
shrinks on its own with no change to the script.

## The fact-status rubric

Everything else on the page rests on the status labels, so the bar is
explicit. This section is normative for authoring and is restated in
`content/AUTHORING.md`.

**The 90% test.** A fact is `well-supported` if roughly 90% of people who
looked carefully at the evidence would agree it is established, and
`not-supported` if roughly 90% would agree the evidence runs against it.
Whether people *do* agree is irrelevant — the test is about what careful
examination of the evidence yields.

**Well-supported facts are the backbone.** Viewpoints should be built almost
entirely out of them. A page that leans on borderline claims falls apart under
exactly the scrutiny it invites.

**Narrow before you contest.** The default move on a claim that looks
contested is to narrow it until it clears the 90% bar. "Immigration lowers
wages" is contested; "immigration has a small negative effect on the wages of
prior migrants in the same occupations, and no measurable effect on native
wages in aggregate" may be well-supported. Prefer the narrow claim. A
contested fact that could have been split into a well-supported core plus a
genuinely open remainder is an authoring failure.

**`contested` is reserved and expensive.** Use it only for a claim that is
central to what the sides are actually arguing about, where the disagreement
is real and a reader needs to understand why the evidence points both ways.
Every contested fact must carry sources on both sides and a body explaining
the shape of the disagreement. If a topic has more than a handful, the facts
have not been narrowed enough.

**`complicated`, `unknown`, and `not-supported` exist mainly for "what about
X".** These are for claims a reader has heard repeatedly and expects the page
to address, but which do not hold up as stated — the claim is true only under
a definition most people do not have in mind (`complicated`), the evidence
genuinely does not settle it (`unknown`), or it is contrary to the evidence
(`not-supported`). Their job is to stop a reader thinking "they ignored X",
not to carry argumentative weight. None of these may be cited by a viewpoint
as support; they may appear only in a viewpoint's `setsAside` list, which is
also why they can never reach the top of the Facts section — see
[Ordering](#ordering). They are less important precisely because they are not
claiming anything.

The healthy shape of a topic is: mostly `well-supported`, a few `contested`
that genuinely divide the sides, and a short tail of the rest defusing
familiar talking points.

## Reading experience

One long scrolling page per topic at `/topics/[slug]`: intro → Facts →
Viewpoints → Principles → Cruxes.

**Expansion.** Every item is a collapsed row that expands in place, built on
native `<details>`/`<summary>`. That gets keyboard support, screen-reader
semantics, find-in-page, and printing correct without JavaScript. A small
client component layers on URL-hash sync so `#fact-net-migration-2024`
deep-links to an open item, and clicking a cross-reference chip scrolls to its
target and opens it.

**Facts.** The list shows headline facts only. Collapsed: the claim plus its
status. Expanded: the body, then the
sources grouped by stance — supports / contests / complicates — each showing
quote, publisher, and a dated link. The five statuses get five distinct
treatments that do not rely on color alone (a shape or label carries the
meaning too), because red/green on a politics site reads as a verdict on the
politics. After the sources come the supporting facts, each an expandable row
of its own carrying its claim, status, body and sources — so the evidence for a
claim is read inside the claim rather than beside it in the list.

**Viewpoints.** Collapsed: name and one-line summary. Expanded: the full
argument, then three chip groups — "builds on" (cited), "accepts" (cuts
against it), and "sets aside" (doesn't hold up) — and the principles it leans
on. The `acknowledges`
chips are given real visual weight rather than tucked at the bottom; they are
the evidence that the page is doing what it claims.

**Principles and cruxes** are short. A crux renders as the question, then the
positions side by side, one per viewpoint, so the disagreement is legible at a
glance.

**Visual quality is a requirement, not a finish.** The reading experience is
the product, so implementation uses the `frontend-design` skill and does not
ship the default shadcn look. Target: dense enough to feel serious, calm
enough to read, and legible on a phone, where most of this will be read.

## Auth

Ported from acx-reviews, which already solves this. Auth.js v5, Drizzle
adapter over Neon, JWT sessions, two providers:

- **Google OAuth**, with `allowDangerousEmailAccountLinking` and a `profile()`
  hook that runs the returned email through the same `normalizeEmail()` used
  by the PIN path, so one person is one user row.
- **Email PIN** — a `Credentials` provider (`id: 'pin'`) over an `email_pins`
  table: 6 digits, 10-minute expiry, 5 attempts, 60-second resend cooldown,
  hashed at rest, IP- and email-keyed rate limiting on the send endpoint.

`lib/auth/pin.ts`, `lib/auth/rate-limit.ts`, and their store interfaces port
across essentially unchanged; the store *implementations* move from libSQL to
Postgres. Email sending goes through the same `PinSender` interface with a
Resend implementation.

Auth degrades rather than crashes: when `AUTH_SECRET` or `DATABASE_URL` is
absent, the site renders signed-out and hides the auth UI, so content-only
development and preview deploys need no secrets.

**Testing.** acx-reviews' unit tests run against an in-memory libSQL database.
Postgres has no equivalent, so DB-backed tests use **pglite**
(`@electric-sql/pglite`), an in-process Postgres that Drizzle supports, with
the checked-in migrations applied per test. A `TEST_AUTH_BYPASS` credentials
provider, active only outside production builds, lets Playwright sign in
without Google or email — same as acx-reviews.

## Comments and moderation

Comments are deliberately peripheral. They cannot reply to each other and they
do not compete with the content — they are a channel for readers to point out
holes: a missing fact, a mislabeled status, a viewpoint stated in a way its
holders would reject. That design choice is what keeps moderation light: with
no threading there is nothing to flame, and comments sit below the item rather
than beside it.

### Schema

```
users, accounts, verification_tokens   -- Auth.js (Drizzle adapter)
email_pins                             -- PIN flow
rate_limits                            -- shared limiter

comments
  id, user_id, topic_slug,
  item_kind    -- 'topic' | 'fact' | 'viewpoint' | 'principle' | 'crux'
  item_id      -- null when item_kind = 'topic'
  kind         -- 'comment' | 'suggestion'
  body,
  moderation   -- 'allowed' | 'blocked' | 'flagged'
  moderation_reason, moderation_model,
  hidden_at, created_at
  index on (topic_slug, item_kind, item_id)
```

Suggestions ("this fact is missing", "this viewpoint is misstated") are the
same table with `kind = 'suggestion'`, so one submission path, one moderation
path, and one admin view serve both. `item_id` is validated against the loaded
content at write time — a comment cannot anchor to an item that does not
exist.

Comments are read at request time and rendered in a client component below
each expanded item, so topic pages stay static.

### Moderation

On submit, the body goes to **Claude Haiku 4.5** (`claude-haiku-4-5`, $1/$5
per MTok — cheap enough to run on every submission) with a rubric that blocks
only: slurs and dehumanizing language about a group, personal attacks on
another commenter or a named individual, threats, spam, and content unrelated
to the topic. It explicitly does **not** block a comment for being wrong,
one-sided, or uncomfortable — on this site that is the point. The call uses
structured output for a `{verdict, reason}` result, `effort: "low"`, and a
small `max_tokens`.

- `allowed` → posts immediately.
- `blocked` → not shown; the author sees the reason and can edit and resubmit.
- `flagged` → posts, and appears in an admin review list.

The verdict, reason, and model are stored on the row, so the classifier's
judgment can be audited later and the rubric tuned against real cases. If the
moderation call errors or times out, the comment posts as `flagged` rather
than being lost — the failure mode of a low-stakes comment box should be
letting something through, not dropping a reader's writing.

If light moderation turns out to be insufficient in practice, the tightening
options are ordered: raise the rubric's strictness, then require approval for
new accounts' first comment, then queue everything. None of these are built
now.

## Milestones

Each milestone is a separate spec and implementation plan. Only milestone 1 is
specified here in implementable detail.

**1. One topic, styling-first.** The content schema, loader, and validator;
the full topic page and its reading experience; one fully authored real topic.
No database, no auth, no comments. Deployed to Vercel. This is where the
design work happens and where the content model gets its first real test.

**2. Content system.** The second topic, a topic index page, content
validation in CI, and `content/AUTHORING.md` — the rubric above written as
working instructions for the developer and for Claude.

**3. Auth and comments.** Neon, Drizzle, Auth.js, the PIN flow, comment
submission and display, Haiku moderation.

**4. Suggestions and admin.** The suggestion form, the admin review list for
flagged items, and comment deletion.

### Choosing topics

The site's purpose is to turn the heat down on subjects people get angry
about, and to let everyone in the argument feel heard. That makes anger a
selection criterion rather than something to avoid: a topic earns its place
by being one where the disagreement is real, the sides talk past each other,
and a reader arrives already holding a position. Soft-ball topics — ones
where the evidence quietly settles it, or where nobody's identity is at stake
— prove nothing about whether this format works.

The test the format has to pass is stronger than fairness. A partisan reading
their own viewpoint should find it **better argued than the version they would
have written themselves** — resting on firmer facts than the ones they had to
hand, and reaching for the strongest available support rather than the most
familiar. Where it reads as less strident than they would put it, that should
be for a reason they would concede on reflection: it declines to lean on a
claim they thought was established but which turns out to be contested or
unsupported, or it grants a well-supported fact that cuts against them and
which they cannot honestly deny. And reading the *other* viewpoints, they
should find them recognizable rather than caricatured.

Passing that test is what earns the site the right to be trusted by people on
both sides at once, and it is much harder on hot topics — which is exactly why
the early ones should be hot.

**A topic is scoped to one argument, not one subject area.** Where the same
subject is argued in different countries from genuinely different facts, those
are separate topics: UK immigration and US immigration share a name and almost
nothing else — different numbers, different legal machinery, different
viewpoints, different cruxes. Merging them would produce facts that are true
in one place and false in the other, which is exactly the failure the status
rubric exists to prevent. Slugs are scoped accordingly (`uk-immigration`,
`us-immigration`).

**Starting topics: UK immigration, then the Israel–Gaza conflict, then what to
do about climate change.** All three are hard in different ways, and each
stresses a different part of the model: immigration is quantitative and
exercises the source and status machinery hardest; Israel–Gaza puts the most
weight on `contested` and on whether a steelman can stay recognizable to its
holders; climate splits mainly on cruxes rather than facts — discount rates,
technology forecasts, and how to weigh costs now against costs later — so it
tests whether the Cruxes section can carry a disagreement on its own. US
immigration is an obvious fourth, and a useful test of whether two topics that
share a name stay properly separate.

UK immigration goes first in milestone 1 because a quantitative topic surfaces
schema problems soonest. Swapping the first topic is cheap — it changes which
content files get authored, not any code — so this order is a recommendation,
not a commitment.

## Editorial policy

The site has no bylines and makes no claim to neutrality-by-abstention. It
makes a much more specific claim: that each viewpoint is the strongest
available version of itself. These policies are what back that claim.

**No attributed authors.** Viewpoints carry no byline. In practice one
editorial voice — a human, or a human and Claude working together from that
human's direction — drafts all of them for a topic, which is what makes it
possible to hold every viewpoint to the same standard. A page where each
viewpoint had a different author would be a debate; the point here is that one
party wrote all sides as well as they could be written, and can be judged on
whether they succeeded.

**Covering the viewpoints is an editorial duty, not a mechanism.** Nothing in
the system can guarantee the listed viewpoints span the real distribution of
opinion. Editorial makes its best attempt; readers who think a view is missing
say so in a comment; editorial adds it or explains why not. That loop is the
guarantee, and it only works if the second half actually happens — see the
comment commitment below.

**Every comment gets one of two responses.** A comment is either *factored in*
— the content changes, the comment is badged as incorporated, and the
commenter is credited as a contributor at the bottom of the topic — or it is
*answered*, with a public reply saying why not. Silence is not an option: a
site that asks people to point out its holes and then ignores them teaches
readers not to bother, and the only mechanism guaranteeing viewpoint coverage
dies with it. The reply and badge UI ship in a later milestone; the commitment
is a standing constraint on how the site is run, not a feature.

**Topics carry a `lastUpdated` date**, shown on the page. A topic whose facts
have gone stale is worse than no topic, and the date is the reader's cue to
weigh what they are reading.

## Deferred

Mechanisms whose need is established but which are not built yet. None block
milestone 1.

- **A per-topic changelog.** A returning reader should be able to see what has
  changed since they were last here — which facts were added, which statuses
  moved, which viewpoints were revised — rather than re-reading the page to
  find out. This matters more as topics accumulate revisions, so it waits
  until they have. Not in V1.
- **Editor replies and contributor credit.** The UI for the comment commitment
  above: replying to a comment, badging one as incorporated, and listing
  contributors at the foot of the topic. Milestone 4 or later.
- **Per-fact review dates.** Whether `lastUpdated` on the topic is granular
  enough, or individual facts need their own staleness signal, waits until
  there are enough topics for the answer to be observable.
