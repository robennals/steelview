# Steelview — Design

Steelview presents all sides of a divisive news issue on one page: the facts
that are actually established, the strongest version of each major viewpoint,
the moral principles underneath them, and the specific reasons the sides
disagree. A reader who arrives holding one view should leave able to state the
other views in a form their holders would endorse.

Signed-in readers can comment on any individual item and suggest facts or
viewpoints that are missing. Editorial content lives in the repo as markdown;
comments live in Neon Postgres.

## Contents

- [Stack](#stack)
- [Content model](#content-model)
- [The fact-status rubric](#the-fact-status-rubric)
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
Optional prose: what this number does and does not measure.
```

The body is optional for a plainly-established fact and expected for anything
tagged `contested` or `complicated`, where it must explain *why*.

### Viewpoint

```yaml
---
name: Control first
summary: One line a holder of this view would accept as fair.
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
3. A `well-supported` or `not-supported` fact has at least one source.
4. A `contested` fact has at least one `supports` **and** one `contests`
   source, and a non-empty body.
5. Every viewpoint has a non-empty `acknowledges`.
6. Every crux `divides` at least two viewpoints and gives a position for each.
7. No orphans: every fact appears in some viewpoint's `citesFacts`,
   `acknowledges`, or `setsAside`, and every principle is held by at least one
   viewpoint.

Rule 7 keeps the Facts section from silting up with true-but-irrelevant
material. A fact that matters only because readers expect to hear about it
belongs in the `setsAside` list of the viewpoint that would otherwise raise
it — that is the honest place for it, and it forces someone to say out loud
which side the talking point was doing work for.

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
as support; they may appear only in a viewpoint's `setsAside` list.

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

**Facts.** Collapsed: the claim plus its status. Expanded: the body, then the
sources grouped by stance — supports / contests / complicates — each showing
quote, publisher, and a dated link. The five statuses get five distinct
treatments that do not rely on color alone (a shape or label carries the
meaning too), because red/green on a politics site reads as a verdict on the
politics.

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
