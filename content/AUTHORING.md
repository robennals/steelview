# Authoring a Steelview topic

## What this is for

The goal of this project is to avoid misleading arguments and ground stuff in
context.

Comparing across time and space makes numbers more meaningful.

Everything below is machinery serving those two sentences. Where a rule here
does not cover the case in front of you, reason from them: does this make the
argument harder to mislead with, and does it give the reader something to
compare against?

That is also the test for the rules themselves. The status rubric, the
required body, the full-range time series, the quoted source behind every
figure — each exists because a specific way of misleading with true numbers
had to be closed off. When you find yourself wanting an exception, work out
which failure the rule was closing and whether your case reopens it.

**Scope.** This document covers writing content. The content model, the page
design and the milestone plan live in
[`docs/superpowers/specs/2026-08-18-steelview-design.md`](../docs/superpowers/specs/2026-08-18-steelview-design.md);
the file layout and command list live in [`README.md`](../README.md). Where
this document and the spec disagree about authoring, this one wins.

**Enforcement.** Some rules below fail `pnpm build`. Most are editorial
judgement with nothing behind them but review. [What the build
enforces](#what-the-build-enforces) lists which is which. Read it before you
assume a mistake would have been caught.

---

## The shape of a topic

A topic is one argument, not one subject area. UK immigration and US
immigration are separate topics: different numbers, different legal
machinery, different viewpoints. Merging them produces facts that are true in
one place and false in the other.

Pick subjects people get angry about. A topic where the evidence quietly
settles it proves nothing about whether this format works. The disagreement
should be real, the sides should be talking past each other, and the reader
should arrive already holding a position.

Four kinds of item, one markdown file each. Facts, viewpoints and cruxes live
under `content/topics/<slug>/`; principles live in the shared `content/principles/`
collection:

| Kind | What it is |
| --- | --- |
| **Fact** | A claim about the world with a status label, quoted sources, and a body giving its context. |
| **Viewpoint** | One side of the argument, written as well as it can be written, listing the facts it cites, concedes and sets aside. |
| **Principle** | A shared perennial value that topics reference by ID. |
| **Crux** | A specific question whose resolution would move someone. |

The filename is the id. **Ids are permanent.** An id is the anchor a citation
points at (`#fact-net-migration-peak-and-fall`) and the URL of the fact's own
page (`/topics/uk-immigration/facts/net-migration-peak-and-fall`, from
`factPath` in `lib/content/types.ts`). Renaming a file breaks every inbound
link from outside the repo, so a rename needs a redirect, not just a
find-and-replace.

Reading order is not yours to set. Fact order is derived from the viewpoints'
own rankings by `lib/content/rank-facts.ts`; viewpoint order is the explicit
`order` field. Neither responds to file order.

---

## Facts

### Headline facts, supporting facts and counter-points

Most true statements are not interesting on their own. A contract overrun, a
grant-rate movement, a route-level fiscal breakdown — all real, all
checkable, none of them what the argument is about. They can be useful as
supporting facts for larger claims, but aren't that valuable in themselves.

So facts are two levels. A fact with no `supports` field is a **headline
fact** and appears in the top-level Facts list. A fact with
`supports: <parent-id>` is evidence for that headline claim and renders
inside it, keeping its own anchor and its own page.

Aim for **8 to 12 headline claims** — a list a reader can hold in their head.
`uk-immigration` currently runs 12 headline facts with 20 supporting ones.

Depth is exactly one: a supporting fact may not itself be supported. The
build rejects a chain.

A **counter-point** is a supporting fact that cuts *against* its parent
rather than for it — a decomposition, or a benchmark that makes the parent
prove less than it appears to. Two worked examples in `uk-immigration`:

- `skilled-worker-fiscal-gain-concentrated` says the Skilled Worker route is
  fiscally positive. Under it sits
  `care-worker-route-fiscally-negative`: care workers on the Health and Care
  visa are a net lifetime cost. The headline stands; the decomposition stops
  it being quoted as "work visas pay for themselves".
- `non-citizens-share-of-convictions-and-prisons` carries
  `deportable-offenders-living-in-the-community` underneath it, so a reader
  meeting the aggregate meets the specific complaint at the same time.

Put the counter-point where the reader meets the claim, not where one side's
readers meet it.

**Anything a viewpoint will need to lean on when conceding must be its own
fact.** A qualification buried in a paragraph cannot be cited: the citation
machinery resolves ids, and the chips on a viewpoint read the frontmatter
lists. If a viewpoint wants to say "yes, but the gain is concentrated", the
concentration has to exist as a fact with an id.

### Status

Five statuses: `well-supported`, `contested`, `not-supported`,
`complicated`, `unknown`.

**The 90% test.** A fact is `well-supported` if roughly 90% of people who
looked carefully at the evidence would agree it is established, and
`not-supported` if roughly 90% would agree the evidence runs against it.
Whether people *do* agree is irrelevant — the test is about what careful
examination yields, not about what is popular.

**Narrow before you contest.** The default move on a claim that looks
contested is to narrow it until it clears the 90% bar. "Immigration lowers
wages" is contested. What `uk-immigration` ships instead is
`wage-effects-small-and-uneven`: "Migration has not been a major determinant
of UK-born workers' wages, though the effect is mildly negative for
lower-paid workers and mildly positive for higher-paid ones" — well-supported,
and more useful to both sides than the contested version. A `contested` fact
that could have been split into a well-supported core plus a genuinely open
remainder is an authoring failure. The open remainder usually belongs in a
crux, where a live disagreement is what the section is for.

**`contested` is reserved and expensive.** Use it only where the
disagreement is central to what the sides are arguing about and a reader
needs to understand why the evidence points both ways. It costs sources on
both sides — the build requires at least one `supports` and one `contests`
source — plus a body explaining the shape of the disagreement. More than a
handful in a topic means the facts have not been narrowed enough.
`uk-immigration` currently has none, which is the healthy end of the range,
not a gap.

**Prefer an affirmative restatement to a negation.** Most `not-supported`
facts are better handled by having a well-supported fact saying the opposite.
Stating a myth in a claim line in order to deny it repeats the myth and
spends the slot on someone else's framing. Before writing `not-supported`,
try to write the positive claim that displaces it — usually the same sources
support it. `how-people-actually-arrive` does this job: "Of the 813,000
people who moved to the UK long-term in 2025, about 46,500 were detected
arriving by illegal routes — 5.7% — while study was the largest single reason
for non-EU+ arrivals at 47%". A reader who holds the opposite belief gets it
answered without seeing it restated first. `not-supported` survives for
claims with no positive restatement, and should be rare.

**`complicated`, `unknown` and `not-supported` rank lower, because they are
not claiming anything.** They exist for the "what about X" a reader has heard
repeatedly and expects the page to address: true only under a definition most
people do not hold (`complicated`), genuinely unsettled (`unknown`), or
contrary to the evidence (`not-supported`). Their job is to stop a reader
thinking the page ignored X.

The schema already encodes their rank. Only `well-supported` and `contested`
facts may appear in a viewpoint's `citesFacts`; only `well-supported` facts
may be `acknowledges`. So a non-claiming fact can only ever reach
`setsAside`, and `setsAside` is not counted by the fact ranker — which puts
these facts in the unranked tail by construction. You cannot accidentally
open a topic with a claim nobody is making. `immigration-and-local-social-trust`
(`unknown`) and `public-opinion-on-immigration` (`complicated`) both live
there.

The healthy shape of a topic is mostly `well-supported`, a few `contested`
that genuinely divide the sides, and a short tail of the rest defusing
familiar talking points.

### The claim line

The `claim` is the sentence the reader meets first and the sentence a
partisan will quote. Phrase it as **the strongest formulation that is true
and that serves the viewpoints relying on it.**

Hedges and qualifications do not belong in the claim line. They belong in the
body and in the counter-points, where a reader who wants them will find them
and a reader skimming will not be slowed by them. A claim line hedged into
safety says nothing and gets cited by nobody.

The status rubric is the safeguard on the other side. If the strongest
phrasing pushes the claim out of the 90% bar, it has gone too far — narrow it
until it clears, then stop narrowing.

**When two viewpoints want opposite emphases from one dataset, that is
usually two facts**, each true, each phrased for its use. `uk-immigration`
splits the ONS migration series exactly this way:
`immigration-against-the-long-run` leads on gross immigration against sixty
years of history, and `net-migration-peak-and-fall` leads on the fall. Both
are well-supported, both draw on the same workbook, and the restrictionist
and the liberal viewpoints cite the one that carries their argument. Neither
is a spin of the other, because each says in its body what the other says
too.

Facts nobody cites stay plainly phrased. Strength of phrasing is work done
for a viewpoint; where no viewpoint is leaning on it, that work has no
customer.

### The body

Required on every fact, whatever its status — the build rejects an empty one.
A claim plus a status badge is exactly the true-but-misleading number this
project exists to defuse.

**Format: short lead, then bullets.** Each bullet opens with a bold one-line
claim that stands alone, followed by the sentence or two backing it. Reading
only the bold lines should give the reader the fact. From
`immigration-against-the-long-run`:

> - **Gross immigration is far above any historical norm, even after two
>   years of falling.** 813,000 people moved to the UK for a year or more in
>   2025, down from the peak of 1,469,000 in the year to March 2023. …
> - **Net migration is not unusual at all.** Net migration was 171,000 in
>   2025 — "lower than the levels seen during the 2010s", in the Migration
>   Observatory's words …
> - **Gross and net give opposite sentences about the same year.** Gross is
>   at a historic high; net is back to something like a 2010s level. Which
>   one is meant has to be said.

**Four obligations.** Every body owes the reader all four:

1. **What it measures and what it does not.** Scope and denominator. Most
   misleading numbers are definitional rather than false — net versus gross,
   long-term versus all arrivals, applications versus grants, foreign-born
   versus foreign-national. Say which one this is, and say which one a reader
   may be assuming.
2. **How it compares.** Across time: the series, and where the current
   reading sits in it. Across space: comparable countries, other categories,
   the historical norm. A number with nothing beside it can be made to mean
   anything.
3. **How confident to be.** Provisional status, known revisions, sample
   limits, how much the figure has moved between releases.
   `immigration-against-the-long-run` gives this a bullet of its own —
   "**How confident to be.** ONS changed method in June 2021 and says
   comparisons across that break 'should be treated with caution'."
4. **What it is commonly mistaken for, stated concretely.** Name the
   misleading argument this fact gets recruited into and defuse it here, at
   the point of use — not in a viewpoint, where only one side's readers will
   meet it. `religion-of-arrivals-is-not-recorded` names its four:
   "**Four things the chart is not.** It is a stock measured on one day in
   2021 … It covers England and Wales only. And it records affiliation … not
   belief or practice."

Items 1 and 4 are what stop a fact being quoted against itself, and they are
the two authors skip. Do not skip them.

---

## Sourcing

### What needs a source

The sourcing rule is about the world, not about sentences. It does not mean
every assertion anywhere needs a citation — it means every claim about the
world that a reader could reasonably challenge needs one.

**The test is world versus logic.** Ask what kind of statement it is:

- **Analytic** — logic, definitions, or arithmetic on figures already cited
  elsewhere on the page. It does not need its own source, because there is
  nothing to check beyond the reasoning itself. If the reasoning is
  arithmetic, show the derivation where you make the claim (as with the
  share-of-population reading above) so a reader can follow it rather than
  take it on trust.
- **Empirical** — a claim about the world that could be false: a number, a
  trend, a fact about what has or has not been studied, a state of affairs. If
  a reader could reasonably ask "is that actually true? what is the number?",
  it needs a real fact behind it, not a sentence that merely sounds
  reasonable.

Three worked examples, all real cases from a style pass on `uk-immigration`:

- *"A shortage at a given wage is not the same thing as a shortage."*
  Analytic — it is a definitional point about what the word "shortage" means
  once a price is specified, true by the meaning of the terms. It stands on
  its own.
- *"Everyone uses the NHS from day one, whatever they pay in."* Looks like
  background colour, but it is empirical and genuinely contestable — the
  immigration health surcharge means some new arrivals do pay in specifically
  for NHS access before using it. Needs a fact.
- *"No UK study of the effect on rents exists."* Empirical: it is a claim
  about the state of a literature, not a logical point, and literatures move
  — a claim like this goes stale the day someone publishes the study. It
  needs a source, and if no source can be found to support it as current, it
  goes.

**The failure runs in both directions.** An empirical claim phrased as though
it were common sense is exactly what this rule exists to catch — "obviously
most people who come here stay" is a claim about actual retention rates
wearing the grammar of a truism. Sounding self-evident is not the same as
being analytic; check what kind of statement it is, not how confident it
sounds.

**Why the line matters.** If every sentence needs a citation, two things go
wrong, both against the point of the sourcing rule: authors pad prose with
links that carry no real evidentiary weight just to clear the bar, or they
stop writing the connective reasoning — "and therefore", "which is not the
same as" — that makes a fact comprehensible, because writing it risks
tripping the same rule. Either way the sourcing gate stops meaning anything:
a page where everything has a citation, useful or not, teaches a reader to
stop checking them.

**Nothing should be presented as a fact without a quoted source.** Every fact
carries at least one source — the build requires it whatever the status,
because a `complicated` or `unknown` fact is making a claim about the
evidence just as firmly as a `well-supported` one makes a claim about the
world.

A source is `stance` (`supports` / `contests` / `complicates`), `quote`,
`title`, `url`, `publisher` and `date`. The quote is the load-bearing field:
it is what a reader checks the claim against without leaving the page.

**Never write a quote from memory.** Fetch the page and copy verbatim,
including the publisher's own wording and punctuation. Get the publisher and
date right — a wrong date on a citation is exactly what this project is
judged on, which is why the schema validates the date shape down to the month
range rather than accepting any string.

**Every figure asserted in any prose must trace to a quote on the page.**
`pnpm check:figures` reads the markdown bodies of every fact, viewpoint,
principle and crux and fails the build if a money, percentage or thousands
figure in them appears in no `quote` anywhere in the topic. It runs in CI. It
does not check frontmatter, because claims and crux positions are covered
elsewhere; bodies are the gap, and prose is where an unsourced figure hides.

In practice this means: when you write a number into a body, either it is
already in a source quote you have, or you go and get the quote.

**Derived figures: show the derivation and quote its inputs.** The worked
example is the share-of-population reading on
`immigration-against-the-long-run`. ONS publishes no share-of-population
migration series, so the reading divides each year's flow by the ONS mid-year
population estimate, carries its own `source` for that denominator, and says
so in its note — including that the denominators for 1964–1970 come from an
older ONS vintage that differs by a few thousand where the two overlap, and
that immigration is part of why the denominator grew, so dividing by it
understates the change. A reader can reproduce the arithmetic and disagree
with the choice. That is the standard.

**An honest gap beats a plausible number.** `religion-of-arrivals-is-not-recorded`
opens by stating that no official statistic records the religion of people
arriving in the UK, and cites the ONS FOI response saying so. The absence is
itself context: it tells the reader that any per-year figure they have seen
is either a decennial Census cross-tabulation or a count of arrivals from
Muslim-majority countries relabelled. Where a number does not exist, say that
it does not exist and say what gets substituted for it.

---

## Charts

For facts about numbers, show the trend over time. It's very easy to give a
misleading picture by cherry picking dates; harder if we require always
showing a time series. In general, try to have a graph for any stat that
could reasonably vary over time. A numeric fact either carries a `series` or
records in its body why it cannot.

`pnpm check:figures` prints an advisory for every fact with a figure in its
claim and no series. Advisories do not fail the build — they are your working
list.

**The series must span the full range the source publishes**, not a window
you chose. `coverage.from` and `coverage.to` declare that range, and
`lib/content/validate.ts` fails the build unless every line begins and ends
exactly there. Trimming to a flattering window is then impossible without
also lying about what the source publishes, which is a lie a reader can check
against the cited workbook. `immigration-against-the-long-run` runs 1964 to
2025, all 62 points, because that is where the ONS method starts.

**A series carries its own quoted source**, in the same shape as a fact's
sources, because a chart is a factual assertion like any other. A reading
that rests on a different dataset — a derived denominator — carries a second
source of its own.

**Definitional discontinuities are marked, not smoothed.** The `breaks` array
takes a period, a short label and a note in the source's own terms.
`immigration-against-the-long-run` marks three: LTIM replacing IPS-alone in
1991, administrative data backdated to 2012, and the June 2021 method change.
The line still runs through them; the reader is told what changed.

**Multiple readings, not a toggle you can ship the flattering half of.** A
`series` carries one or more `readings` and the chart draws every one. The
owner asked for migration both in absolute numbers and as a share of
population, and both are needed: a raw count in a growing population is its
own misleading framing, and a share alone hides that the growth is mostly in
the numerator. `religion-of-arrivals-is-not-recorded` does the same with
share and volume, and its body says why — "Share down, volume up; the chart
carries both readings, and either one quoted alone gives the wrong picture."

**Comparing across space.** Where a stat is per-country, compare to
comparable countries. Comparator choice is the cross-sectional form of date
cherry-picking, so it gets the same discipline:

- use **the source's own comparator set**, not a subset you assembled;
- give **per head as well as absolute**, since a big country is bigger at
  everything;
- show **where the subject sits in the full distribution**, not only against
  the two neighbours that make the point.

`asylum-claims-in-historical-and-european-context` does all three in its claim
line: "Around 108,000 people claimed asylum in the UK in 2024, the highest
since records began in 1979 and just above the 2002 peak — but per head of
population that was only the seventeenth-largest intake in the EU+, at 16
claims per 10,000 residents." Time and space in one sentence, and the
position in the distribution given as a rank rather than as two flattering
neighbours.

**Charts come first in the fact detail**, before the prose. The reader who
came for the number should meet the shape of the data before they meet
anyone's account of it.

---

## Viewpoints

### Titles

A viewpoint title is a one-line proposition someone would actually say, not a
keyword label. "Open and welcoming" is a label. "Immigration makes Britain
better off, and we should welcome it" is a claim. The five in
`uk-immigration` are all propositions:

- We need the right kind of immigration, not simply less of it
- Too much immigration too fast damages the fabric of our society
- Immigration makes Britain better off, and we should welcome it
- A country should decide who joins it, and Britain never did
- We have a moral duty to help people fleeing danger

**The set should match what people actually argue**, not an analyst's
taxonomy of why they argue it. The question is not "what are the possible
positions in this space" but "what does someone say, at length, when they are
making this case". If no real person would say the title out loud, the
viewpoint is a category rather than a view.

### The bar

Fairness is not the bar. A partisan reading their own viewpoint should find
it **better argued than the version they would have written themselves** —
resting on firmer facts than the ones they had to hand, reaching for the
strongest available support rather than the most familiar. Reading the other
viewpoints, they should find them recognisable rather than caricatured.

Where a viewpoint reads as less strident than its holder would put it, that
must trace to something they would concede on reflection: it declines to lean
on a claim they thought was established but which turns out to be contested
or unsupported, or it grants a well-supported fact that cuts against them and
which they cannot honestly deny. Toning down for comfort is not one of the
permitted reasons.

**A balanced, inoffensive viewpoint is a failure.** Each must have real
argumentative force. If every viewpoint on the page sounds equally reasonable
and equally mild, nothing has been steelmanned; the page has just been
sanded.

The build enforces that `acknowledges` is non-empty, with the message "a
viewpoint that concedes nothing is advocacy, not a steelman". That is the
floor, not the target.

### No self-referential commentary

A viewpoint should read as if it could be anywhere. Not talking about other
viewpoints here, not saying "this is something people often get wrong". Just
make the argument crisply, clearly, in a data-driven and reasonable way.

**The test: could this be published standalone, elsewhere, unchanged?** If a
sentence only makes sense on this page, cut it.

**Concessions land in the flow of the argument**, not in a labelled section.
The frontmatter lists and the chips already record what the viewpoint cites,
concedes and sets aside; prose that narrates that structure is saying the
page's own furniture back to the reader. From
`immigration-makes-britain-better-off`, on housing:

> The systematic review commissioned for the Migration Advisory Committee
> puts immigration at roughly 4–6% of the total rise in UK house prices over
> three decades. This is not a rounding error and this argument does not
> pretend it is zero: more people in a place where building is blocked does
> raise prices there. But the other 94% is Britain's own doing …

The concession is inside the sentence that makes the argument. There is no
"what this view concedes" heading anywhere on the page.

**A viewpoint concedes a point while citing the counter-point that
contextualises it.** That is what the counter-point facts are for: conceding
with a link is a concession the reader can check, and it costs the viewpoint
nothing it was not already going to give up.

### Citations and lists

Four frontmatter lists:

| Field | Contains | Enforced |
| --- | --- | --- |
| `citesFacts` | Facts the viewpoint argues *from* | `well-supported` or `contested` only |
| `acknowledges` | Facts it concedes | `well-supported` only; must be non-empty |
| `setsAside` | Facts it says do no work | any status |
| `principles` | Principles it rests on | must be included in `topic.md`'s `principles` list |

A fact may appear in at most one of the three fact lists per viewpoint.

**`citesFacts` order is that viewpoint's own ranking of what matters, and it
drives the page's fact order.** `rank-facts.ts` takes each viewpoint's
`citesFacts` then `acknowledges`, in written order, and interleaves them
round-robin: every viewpoint's first-ranked fact is placed before any
viewpoint's second. So the first item in your `citesFacts` is your claim on
the top of the Facts section, and reordering that list reorders the page. Put
the fact your argument actually rests on first, not the one you happened to
write first.

Cite facts inline in prose with a plain markdown link to the anchor:

```markdown
[migration is not a major determinant of UK-born wages](#fact-wage-effects-small-and-uneven)
```

The build checks that the id resolves and, in a viewpoint, that the fact is
already in one of that viewpoint's three lists — citing a supporting fact
counts when its parent is listed. Links render as the fact's own URL, so a
citation works without JavaScript.

### Order

`order` is an explicit integer. **It must not group one side of the argument
together.** Alternate across the spectrum, so a reader scrolling meets
disagreement rather than a bloc. `uk-immigration` runs: right-kind (1),
too-much-too-fast (2), makes-Britain-better-off (3), country-should-decide
(4), moral-duty (5).

---

## Principles

A principle is an enduring ideal that some people hold sacred. Its **name and
entire body** should stand alone, unchanged, on a page about another issue.
"Democratic consent" and "Obligation to people in danger" qualify; a prescription
for a particular immigration system does not.

State the ideal plainly, then make its appeal concrete with one or two iconic
examples where readers are likely to support it: sanctuary for Jews fleeing
Hitler, democracy giving people the power to elect their own leaders, or feeding
children during a famine. Explain what makes the principle worth cherishing.
Choose recognisable, accurate examples; do not imply that an example settles the
current debate or that everyone must accept the principle.

Keep the principle focused on its positive case. Do not discuss this topic's
policies, which viewpoints hold it, exceptions, limits, or competing values in its
body. Put the difficult applications and collisions in **Cruxes**. A principle
should express a value, not disguise a disputed prediction as a moral ideal:
"Freedom to cooperate and exchange" expresses a value; "Open exchange always
makes everyone richer" asserts a consequence that belongs among empirical claims.

Define each principle once at `content/principles/<id>.md`:

```markdown
---
name: Democratic consent
---
People should have the power to choose their own leaders...
```

List the shared IDs a topic employs in `content/topics/<slug>/topic.md`:

```yaml
principles: [democratic-consent-over-membership, obligation-to-people-in-danger]
```

This list determines which principles appear on the topic page, in that order.
It defaults to empty and must contain unique IDs from the shared collection.
Each viewpoint's `principles` list must be a subset of its topic's list. A topic
may also employ a principle in a crux without a viewpoint claiming it. A shared
principle can exist before any topic uses it.

Do not create a topic-local `principles/` directory or add `heldBy` to a shared
definition; both fail loading. Viewpoint relationships belong to viewpoints,
and topic relationships belong to topics. Omission does not mean rejection of
an ideal. Future backlinks from a principle to relevant topics can be derived
from the topic lists, without duplicating them in the shared definition.

Editing a shared principle updates every topic that references it. Read its uses
before changing its meaning. Existing `#principle-<id>` links still open the
principle within the topic page.

A principle held by every viewpoint can be especially useful. State its shared
appeal here and explore disagreements over its application or priority in the
cruxes below. Keep existing filenames even when simplifying principle names,
because those IDs are permanent links.

---

## Cruxes

A crux names something that, **if resolved, would move someone**. This is where
the topic's difficult cases belong: principles collide, predictions of
consequences differ, or people hold competing hypotheses about something unknown.
Four kinds:

- `prediction`: different expectations about what a policy will cause.
- `assumption`: different hypotheses about how the world works or what is unknown.
- `tradeoff`: different judgments about how much of one good to sacrifice for another.
- `priority`: different judgments about which principle or obligation comes first.

For a collision of principles, name and link the relevant principles, give a
concrete situation in which they pull in different directions, and show how each
viewpoint resolves it. For an empirical disagreement, describe the evidence that
would distinguish the predictions or hypotheses. Be clear when evidence can
inform the stakes but cannot settle a choice between values.

A crux restating a viewpoint's conclusion is not a crux. "Is immigration good
for Britain?" is the argument, not a crux of it. "Is it the total number that
matters, or who is admitted?" is a crux, because the answer changes which
policy each side should want.

`divides` lists at least two viewpoints and every one of them needs a
`position` giving what it `holds` — the build enforces both, and enforces
that no position is given for a viewpoint not in `divides`. Write each
`holds` as that viewpoint would state it, in one or two sentences. Two of
them may reject the question's framing; say so in their position rather than
forcing them onto an axis they do not use. In
`is-it-the-number-or-the-composition`, two of the four positions open with
"Neither" and then say what they think the real variable is.

The body says why resolving it would move people, and in which direction for
whom. From that crux:

> If the fiscal and labour-market results really are driven by earnings
> rather than headcount, a numerical cap is a blunt instrument that binds
> hardest on the arrivals with the best case — and the restrictionist should
> want a threshold instead.

---

## Prose style

One failure mode has a name here: **LLM-speak**. It is prose that sounds
like insight and carries none, and it is the fastest way to lose a reader who
came to check numbers. Six forms, each with the fix.

**1. Self-referential commentary about the page, or about a claim's own
importance.**

> Before: The complicating sources matter more than they look.
>
> After: The Migration Advisory Committee's own review puts immigration at
> 4–6% of the house-price rise.

The "before" tells the reader to be impressed and gives them nothing to be
impressed by. Say the thing.

**2. Portentous standalone one-liners used for rhythm.** A short sentence
alone on its own line, doing emphasis rather than work.

> Before: The numbers are not the argument. They never were.
>
> After: Gross is at a historic high; net is back to something like a 2010s
> level. Which one is meant has to be said.

**3. "Not just X, but Y."** Also "It isn't only X — it's Y", and every other
construction whose job is to make an ordinary claim feel escalating.

> Before: This is not just a fiscal question, but a question about consent.
>
> After: The fiscal result and the consent question come apart: a route can
> pay for itself and still never have been put to anyone.

**4. Hedge stacks.** Two or more hedges on one claim, which reads as evasion
and defeats the point of the status label.

> Before: It seems likely that immigration may have had some modest effect on
> housing costs, at least in some areas.
>
> After: The MAC-commissioned review puts immigration at roughly 4–6% of the
> total rise in UK house prices over three decades.

If the claim needs that much hedging, its status is not `well-supported` and
the hedge belongs in the status field, not in the sentence.

**5. An abstract summary where the concrete number would do.**

> Before: Arrivals have risen substantially in recent years.
>
> After: 813,000 people moved to the UK for a year or more in 2025, against a
> 1990s average of about 325,000 a year.

**6. Unsourced empirical claims dressed as commentary.** The most damaging of
the six.

> Before: Every other number on this page sits inside this one, and it is
> almost never given with a baseline.
>
> After: [drop it, or source it] — e.g. the ONS release gives the
> year-on-year change and not the level, so the level has to be looked up
> separately.

"It is almost never given with a baseline", "people often assume", "the
public tends to hear this as" — each is an empirical claim about the world
with no source behind it, and each slips past the sourcing rule by not
looking like a claim. `check:figures` will not catch them, because they
contain no figure. Either find the survey and quote it, or cut the sentence.

**The general test.** Read the sentence and ask what a reader now knows that
they did not know before. If the answer is "that the author finds this
significant", cut it.

---

## What the build enforces

Run `pnpm build` (or `pnpm test:unit` for the validator alone) and
`pnpm check:figures`. Both run in CI. Everything in this table fails one of
them.

| Rule | Where |
| --- | --- |
| Frontmatter shape, field types, URL and date formats | `lib/content/schema.ts` |
| Every cross-referenced id resolves to a real item | `lib/content/validate.ts:40` and throughout |
| `citesFacts` only `well-supported` or `contested` | `lib/content/validate.ts:55` |
| `acknowledges` only `well-supported` | `lib/content/validate.ts:62` |
| A fact appears in at most one of the three lists per viewpoint | `lib/content/validate.ts:46` |
| Every fact has at least one source, whatever its status | `lib/content/validate.ts:87` |
| Every fact has a non-empty body | `lib/content/validate.ts:94` |
| A `contested` fact has both a `supports` and a `contests` source | `lib/content/validate.ts:117` |
| Fact hierarchy is exactly one level deep; no self-support | `lib/content/validate.ts:97` |
| Every viewpoint's `acknowledges` is non-empty | `lib/content/validate.ts:71` |
| Every crux divides ≥2 viewpoints and positions each one | `lib/content/validate.ts:169` |
| No orphan headline facts | `lib/content/validate.ts:193` |
| Topic principles resolve to shared definitions; viewpoints use only their topic’s listed principles | `lib/content/load.ts`, `lib/content/validate.ts` |
| Topic has ≥1 fact and ≥2 viewpoints | `lib/content/validate.ts:183` |
| Series lines span the declared coverage exactly, end to end | `lib/content/validate.ts:279` |
| Series points strictly ascending, no repeats | `lib/content/validate.ts:267` |
| Series breaks fall inside the declared coverage | `lib/content/validate.ts:296` |
| Inline `#fact-` citations resolve, and a viewpoint only cites facts it lists | `lib/content/validate.ts:325` |
| Every money / percentage / thousands figure in a body is in a quote | `scripts/check-figures.ts` |

**Everything else in this document is editorial judgement with no safety net.**
Nothing checks that a status is correct under the 90% test, that a claim is
phrased as strongly as it truly can be, that a body covers all four
obligations, that a quote was copied rather than recalled, that a series was
chosen where one was available, that comparators are the source's own, that a
viewpoint is the strongest version of itself, that concessions read in the
flow, or that the prose is free of the six patterns above. Those are caught
in review or not at all.

**Not yet implemented.** Two things this document describes have no field or
check behind them today — do not rely on the build to catch either:

- **Counter-points (`qualifies`) are not a distinct field.** This document
  describes a counter-point as a supporting fact that cuts *against* its
  parent rather than for it. There is no `qualifies` field, or any field, that
  says so. The schema has only `supports`, and nothing in it distinguishes a
  corroborating child from a contradicting one — today a contradicting fact
  can only be expressed as a plain `supports`, identically to a corroborating
  one, and neither the build nor the rendered page can tell them apart. Author
  the body so the "cuts against" relationship is clear in prose, because
  nothing else will surface it. Planned; not shipped.
- **A numeric fact without a series is an advisory, not an error.**
  `check:figures` reports it and exits 0.

---

## Checklist

Run this before opening a pull request.

**Every fact**

- [ ] Status defended under the 90% test — not "how sure do I feel", but what
      careful examination of the evidence yields.
- [ ] If `contested`: could it have been narrowed into a well-supported core
      plus a crux? If yes, do that instead.
- [ ] If `not-supported`: is there a positive restatement that would displace
      it? If yes, write that fact instead.
- [ ] Claim line is the strongest true formulation, with the hedges moved
      into the body.
- [ ] Body: short lead, then bullets, each opening with a bold standalone
      claim. Bold lines alone give the fact.
- [ ] Body covers all four obligations — what it measures and does not; how
      it compares across time and space; how confident to be; what it is
      commonly mistaken for, stated concretely.
- [ ] Every source quote fetched and copied verbatim, with the right
      publisher and date. None written from memory.
- [ ] Every figure in the body appears in a quote somewhere in the topic
      (`pnpm check:figures`).
- [ ] Numeric fact carries a series, or the body says why none exists.
- [ ] Series spans the source's full published range, marks its
      discontinuities, and carries its own source; derived readings show
      their derivation and source their denominator.
- [ ] Per-country stat compares against the source's own comparator set, per
      head as well as absolute.
- [ ] Correctly placed as headline or supporting; counter-points sit under
      the claim they qualify.

**Every viewpoint**

- [ ] Title is a proposition someone would say aloud, not a keyword label.
- [ ] A partisan would find it better argued than their own version, and
      would recognise themselves in it.
- [ ] It has real argumentative force. It is not merely inoffensive.
- [ ] Where it is milder than a partisan would put it, that traces to
      something they would concede.
- [ ] Could be published standalone elsewhere, unchanged. No sentence refers
      to this page, to other viewpoints, or to what people commonly get
      wrong.
- [ ] Concessions land in the flow of the argument, and cite the
      counter-point that contextualises them. No "what this view concedes"
      section.
- [ ] `citesFacts` is ordered deliberately — first entry is the fact the
      argument actually rests on.
- [ ] Every fact it leans on is in one of its three lists.

**Every principle**

- [ ] Name and entire body make sense without the current topic.
- [ ] Expresses an enduring value someone could hold sacred.
- [ ] Includes recognisable examples where the principle has clear appeal.
- [ ] Focuses on the positive case; applications, limits and collisions are in cruxes.
- [ ] Defined once in `content/principles/`, with no topic-specific `heldBy`.
- [ ] Referencing topics list its ID; their viewpoints use only listed principles.

**Every crux**

- [ ] Names something that would move someone, not a restatement of a
      conclusion.
- [ ] `kind` is right: prediction, assumption, tradeoff or priority.
- [ ] Each position is written as that viewpoint would state it, including
      rejecting the framing where that is the honest answer.
- [ ] Body says who would move, and which way.

**Whole topic**

- [ ] 8 to 12 headline facts. A reader can hold the list in their head.
- [ ] Status mix is mostly `well-supported`, few or no `contested`, short
      tail of the rest.
- [ ] Viewpoint set matches what people actually argue and spans the real
      distribution.
- [ ] Viewpoint `order` alternates across the spectrum and groups no side
      together.
- [ ] Principles are perennial and statable without the topic.
- [ ] Prose is free of all six LLM-speak patterns. Read it once looking only
      for those.
- [ ] `topic.md` `lastUpdated` is today.
- [ ] `pnpm build`, `pnpm lint`, `pnpm test:unit` and `pnpm check:figures`
      all pass.

---

## Policy

**No bylines.** Viewpoints carry no attributed author. One editorial voice
drafts all of them for a topic, which is what makes it possible to hold every
viewpoint to the same standard. The claim the site makes is not neutrality by
abstention; it is that one party wrote all sides as well as they could be
written, and can be judged on whether they succeeded.

**Every comment gets one of two responses.** A comment is either *factored
in* — the content changes, the comment is badged as incorporated, and the
commenter is credited — or it is *answered*, publicly, with why not. Silence
is not an option: the only mechanism guaranteeing that the viewpoint set
covers the real distribution of opinion is readers saying what is missing,
and that loop dies the first time a comment is ignored. The reply and badge
UI ship in a later milestone; the commitment holds now.

**Licensing.** Content in `content/` is CC BY 4.0 — see
[`content/LICENSE`](LICENSE), attributed to the project (no bylines), not to
an author. Quoted sources carry their own terms — quotation for this purpose
is fair dealing, and the quote, publisher, date and URL on every source are
what make that defensible. Reproduce, do not relicense. `LICENSE` at the repo
root covers the code separately (MIT).
