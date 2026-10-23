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
| **Data** | A collection of datasets and artifacts exploring one aspect of the topic, with observations, context, methods and sources. |
| **Observation** | An addressable finding about a graph or dataset, explaining what to notice and why. Usually the target of a viewpoint’s factual citation. |
| **Viewpoint** | One side of the argument, written as well as it can be written, listing the facts it cites, concedes and sets aside. |
| **Principle** | A shared perennial value that topics reference by ID. |
| **Crux** | A specific question whose resolution would move someone. |

The filename is the id. **Ids are permanent.** An id is the anchor a citation
points at (`#fact-immigration-against-the-long-run/nationality-shift`) and the URL of the fact's own
page (`/topics/uk-immigration/facts/immigration-against-the-long-run`, from
`factPath` in `lib/content/types.ts`). Renaming a file breaks every inbound
link from outside the repo, so a rename needs a redirect, not just a
find-and-replace.

Reading order is not yours to set. Fact order is derived from the viewpoints'
own rankings by `lib/content/rank-facts.ts`; viewpoint order is the explicit
`order` field. Neither responds to file order.

---

## Data

### Data Collections, Datasets and Observations

The reader-facing section is **Data**, and each popup is a **data collection**:
a set of datasets, graphs and other evidence breaking down one aspect of the
topic. An individual graph or table is a dataset or artifact within that
collection. An **observation** explains a finding in those data. Do not equate
the whole collection with a single factual assertion.

Lead with a short title, introduction and key finding, then show the data with
time, place and relevant group comparisons. Put observations next to the graph
they explain. Keep methods, useful subtleties and sources in their own expandos.
Several observations can support different viewpoints while sharing one collection.

**Cite observations by default.** When a viewpoint makes a factual assertion,
link its pill to the specific observation that supports or qualifies it. That
opens the collection, expands the observation and scrolls it into view. Link to
a graph or the collection’s lead finding when that is the actual evidence;
use a whole-collection link for a broad reference or an evidence index. Do not
create a separate collection just to make a finding clickable.

**Related Data** is for distinct collections that answer other useful questions.
A point about the same plotted data normally belongs in Observations. Existing
`supports` relationships still group smaller collections within broader ones,
with only one level of nesting. They do not make every child a separate fact
that the reader must accept.

**Compatibility terminology.** Storage and code retain `Fact`, `facts/`,
`citesFacts`, `relatedFacts`, `/facts/` URLs and `#fact-` citation syntax so
existing links and content remain valid. In technical examples below, these
legacy names refer to data collections. In product copy, use **Data**, **data
collection**, **dataset** and **observation** according to what is being named.

### Neutral Reports Must Answer All Viewpoints’ Questions

Each data report serves the topic, rather than a particular viewpoint. Its
scope is the combined set of relevant empirical questions raised by all the
viewpoints. Collect the analyses, breakdowns and comparisons needed to answer
those questions, including evidence that challenges each side’s preferred
interpretation. This shared requirement is what makes the report comprehensive.

Before considering a report complete:

- Review every viewpoint’s claims and identify the measures, time periods,
  populations and comparisons needed to examine them.
- Check that each relevant question has a visible artifact and a linked
  observation, or a clear account of unavailable evidence. Retain relevant
  breakdowns even when they weaken the report’s opening finding.
- Show changes over time, international comparisons and meaningful subgroups;
  distinguish aggregate effects from their distribution, counts from rates,
  and correlation from evidence of causation where these distinctions matter.
- Apply the same standards of sourcing, uncertainty and methodological scrutiny
  to evidence congenial to either side. Present supported conclusions plainly;
  neutrality does not mean equal weight for claims with unequal evidence.
- Revisit coverage when a viewpoint adds a substantive empirical question.
  Prefer expanding the shared report to creating a separate report designed
  around that viewpoint’s preferred conclusion.

Observations state what the evidence shows, its limits and plausible explanations.
Viewpoints make the value judgments and policy arguments. A report should not
select its graphs or headline to advance one of those arguments. Renaming a
report alone does not establish that its coverage is complete.

### Status

The existing status assesses the collection’s lead finding or explicitly
assessed claim. It is not a blanket truth rating for every dataset or observation.

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

### Titles and opening findings

`title` names the subject of the data collection in short, neutral Title Case:
“UK Immigration Trends”, “Immigration and Public Finances”, or “Asylum
Applications in the UK and Europe”. It describes the scope, not a conclusion
such as “Immigration Is Too High” or “Immigration Benefits Public Finances”.
Choose a scope the collection can actually cover: a fiscal analysis alone
should not be titled “Economic Impact of Immigration”, which also implies
coverage of wages, employment, productivity and other economic effects.

Specific factual conclusions belong in the cited opening finding and in
addressable observations beneath the relevant artifacts. A neutral title does
not require vague observations or withholding conclusions supported by data.

`claim` leads the popup with a concrete, detailed factual statement: give the
measure, population, period, numbers and essential qualifications. For example,
state both the UK asylum total and its per-person European comparison. Do not
remove qualifications needed to make a claim true, or strengthen it to serve a
viewpoint. `claimSources` lists the one-based sources supporting the lead.
For unsupported or uncertain assertions, `assessedClaim` preserves the assertion
being assessed separately from the corrective finding.

### The body and reading order

Every fact requires a body. Put the most useful evidence first:

1. **Intro and key point**, with a concrete finding and linked citations.
2. **A sequence of graphs, artifacts or data**, using different slices to supply
   time, place and group context. Each artifact is a main heading; omit umbrella
   headings that merely repeat its contents. Put its Observations and, when
   genuinely interesting, Subtleties directly beneath it in collapsed expandos.
   Keep essential qualifications visible beside the data.
3. **Related Data**, only for distinct questions that deserve their own
   evidence and treatment. Findings about the displayed data belong in that
   graph’s Observations, with viewpoint pills linking directly to the observation.
4. **Data still needed**, when a missing measurement would materially improve
   the report. Use `dataStillNeeded` in frontmatter, with a specific `measure`
   and a short explanation of why it matters. This is an explicit statement of
   what the report cannot establish, not a place for generic research wishes.
5. **One Sources expando at the end**, with footnotes opening the relevant citation.


**Graphs provide the context.** Show change over time and comparisons between
countries wherever these are meaningful. Missing comparisons need a specific,
defensible reason, documented in the chart note or an addressable Subtlety:
for example, a one-off measurement or incompatible national definitions. Country
comparison is not required for topics that cannot sensibly be sliced by country;
use the relevant groups instead. Lack of effort is not a reason. Search for data
before claiming it is unavailable, and offer the closest useful comparison with
its limits made explicit. Similarity or rarity alone does not make something
good or bad. Never substitute asylum claims for illegal entries or stocks for flows.

**Important sub-slices belong in the opening graphs.** If a slice is central to
the argument—especially if a viewpoint cites it—show it there rather than hiding
it inside a Subtlety. Link the viewpoint pill directly to its chart. A secondary
slice may stay in Subtleties until its importance warrants promotion.

**Observations and Subtleties are scannable disclosures.** Write a short `###`
summary under `## Observations` or `## Subtleties`, followed by the detail and
citations. Both render as native expandos, collapsed by default. Their stable
finding IDs let links open, scroll to and highlight a specific item. Let summary
lines wrap on narrow screens rather than truncate meaning. Observations help
readers interpret the charts; Subtleties qualify the conclusions they can draw.

Use a consistent editorial hierarchy. The article title is the largest type.
Major section labels (Observations, Subtleties, Sources) use uppercase sans-serif,
letter spacing, a dividing rule and generous space before them. Finding headings
use sentence-case serif type, larger than body text and moderately bold. Keep
paragraphs regular weight at body size; reserve bold for short emphasis. Chart
descriptions are minor subtitles: smaller, regular-weight sans-serif in secondary
text color beneath the chart title. Chart titles use sans-serif, with smaller uppercase reading
labels and quiet source credits. Never give every heading level the same style.

The design references are [LessWrong](https://www.lesswrong.com/),
[Substack](https://substack.com/) and
[Our World in Data](https://ourworldindata.org/population-growth): borrow their
attention to reading measure, whitespace and distinct editorial/chart typography.
Check long and short facts in both the popup and standalone page, on desktop and
mobile. Hierarchy must survive without relying on bold everywhere.

Long explanations of sourcing, collation, derivation and methodology belong in
an expando, normally the chart's **About this data**. This includes “derived,
not published”, denominator provenance, coverage details and calculation steps.
Keep publisher names visible below plots, and keep material interpretive caveats
visible beside affected claims. The explanation of why a curve rose or fell is
reader-facing Observations, not methodology to hide.

Every body must explain what is measured and excluded, how it compares over time
and across countries, how confident to be, and what it is commonly mistaken for.

### Addressable findings and source footnotes

One popup may contain several statistics. Give each finding a stable section ID:

```markdown
## Observations {#example--observations}

### Why arrivals fell {#example--why-arrivals-fell}

The factual explanation. [1](#source-example-1)

## Subtleties {#example--subtleties}
```

Link a pill to `#fact-example/why-arrivals-fell`; it opens the fact, scrolls the
section into view and highlights it. Keep IDs when rewriting headings. A link to
a supporting fact opens its parent article at that finding; standalone URLs
remain usable. `/finding` targets the opening finding.

Footnote-link each sourced statement or number where it appears, rather than
leaving readers to infer which reference supports it. A chart must also show a
subtle publisher name immediately below each plot, linked to its full citation.
Source numbers follow fact frontmatter order, then the series source, then each
reading's additional source. Update footnotes and `claimSources` if that order
changes. Full references, including quoted evidence, belong at the article end.

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

**Every prose figure must be sourced or reproducibly derived.**
`pnpm check:figures` checks prose numbers against topic source quotes and
validated `derivedFigures` calculations. A passing check does not establish
that the citation supports the meaning, scope or causal interpretation.

**Derived figures: quote the inputs and document the calculation.**
`derivedFigures` supports `ratio-percent`, `complement-percent` and `series-mean`.
The audit checks the arithmetic and inputs. Readers should be able to reproduce
it from the collapsed methodology explanation. For population-adjusted migration,
source the population denominator and explain its vintages there. Absolute flows
and population shares answer different questions; neither substitutes for the
other. Do not let lengthy collation notes crowd out the evidence.

**An honest gap beats a plausible number.** `religion-of-arrivals-is-not-recorded`
opens by stating that no official statistic records the religion of people
arriving in the UK, and cites the ONS FOI response saying so. The absence is
itself context: it tells the reader that any per-year figure they have seen
is either a decennial Census cross-tabulation or a count of arrivals from
Muslim-majority countries relabelled. Where a number does not exist, say that
it does not exist and say what gets substituted for it.

---

## Charts

Time series use `series`. Snapshot bars use `comparisons`, each with a stable
`id`, `title`, `description`, `unit` (`count`, `percent`, `pounds`), `valueLabel`,
numbered `sources`, and `items` containing `label` and `value`. Optional `highlight`
marks the subject country; `note` contains collapsed methodology. Values share a
zero baseline and signed values extend on the correct side of it. Label scope and
period in the visible description. Source indexes reuse the fact's citation list.

**Charts are shared product primitives, not report-specific artwork.** Use the
existing `SeriesChart` and `ComparisonChart` data shapes for every report. If a
new visual capability is genuinely needed, add it to the reusable chart component,
its schema and its tests so it works for every topic; do not add a topic-specific
renderer, CSS branch or inline SVG to one data collection. Labels for grouped bars
belong in `groupLabel` and `allGroupsLabel`, rather than being assumed by the UI.
Linked line/legend highlighting is likewise a shared `SeriesHighlight` behavior,
available to every series chart and usable with a mouse or keyboard focus.

**Every time series has years on its x-axis.** All time-series data renders
through `SeriesChart`; it derives visible year ticks from the declared coverage
and the actual dates in the source. Do not replace that axis with undated point
positions, hide it for a compact layout, or build a one-off time chart. For a
short annual run the component labels every year; for a longer run it labels
readable interval years and always names both ends of the source range.

### Selection is part of the evidence, not decoration

**A breakdown must never feel editorially selective.** For a categorical
dimension, start from the source's complete published distribution. Show the
largest source-defined categories in descending order until the residual is no
longer the largest displayed category, then put every remaining category into a
clearly named residual such as “Other non-EU+”. This prevents “Other” from
being a larger, unexplained bucket than any category the reader can inspect.
Do not elevate a smaller category because it makes a preferred story look
stronger. If the report genuinely needs a named smaller category (for example,
a distinct legal route), say why in the chart note and retain the residual so
the reader can see what was left out.

The denominator and the selection rule must be visible. A category included in
one displayed period cannot disappear from another merely because it later
falls in rank. Where the source itself publishes only a top-N table, name that
limit and make the residual the difference between its published total and every
named category; never imply that the named categories are exhaustive when they
are not. If the published top-N cannot shrink the residual below the largest
named category, show that limitation instead of inventing regional totals.

**Country comparisons must not be cherry-picked.** Use the complete set of
comparable countries supplied by the source dataset, using its own definitions,
year and denominator. If that set is too large for a compact bar chart, the
chart may emphasize the subject country and show its rank, but the full source
set must remain available in the chart's Table view. Never select only the
neighbours that flatter or discredit the subject. If a source offers several
legitimate comparator universes (for example, EU and OECD), state which one is
used and why before displaying any countries.

`#fact-example/chart-series` targets its time series;
`#fact-example/chart-country-comparison` targets a bar chart whose id is
`country-comparison`. `featuredCharts` lists supporting fact IDs whose charts
should appear among the parent's opening graphs. They render once, and citations
still point to the supporting fact's sources in the single Sources expando.


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

**Charts follow the concrete opening finding**, ahead of the detailed context
and Subtleties. Keep the graph's publisher credit visible below the plot.

**Narrate the major movements.** When a graph has an obvious spike, drop,
reversal, plateau or change of pace, explain what happened at each important
turning point in concise, dated Observations directly beneath the relevant graph.
Do not merely repeat its values. For migration, explain the expansion of study,
care and humanitarian routes behind the spike, then the recruitment slowdown and
restrictions behind the decline. Distinguish fewer arrivals from more departures;
the explanation can change between years even while the line keeps falling.

Source these explanations at the point of use. Separate a measured contribution
from a causal explanation, and a supported cause from a plausible hypothesis.
Check policy dates: a later restriction cannot explain an earlier turn. Note
lags and incomplete effects when relevant. Do not manufacture a story for every
small wiggle; if a major movement has no established explanation, say what is
unknown. Explain measurement breaks in Method Changes so readers do not mistake them for events.

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
the top of the Data section, and reordering that list reorders the page. Put
the fact your argument actually rests on first, not the one you happened to
write first.

Every empirical assertion in viewpoint prose **and summaries** should be a
linked observation pill, including non-numeric statements and key premises that are not
obviously true. Link the relevant phrase each time it appears; a list at the
bottom is not a substitute. Include essential qualifications inside the pill.
Values, preferences and purely logical reasoning remain ordinary prose.

Cite observations inline with a plain markdown link to the collection and
observation ID. The existing `#fact-` prefix remains the citation syntax:

```markdown
[immigration shifted from EU to non-EU nationals](#fact-immigration-against-the-long-run/nationality-shift)
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

Replace vague hedge stacks with precise scope and evidence status. Keep any
qualification necessary for the sentence to remain true beside the assertion.

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
| Every prose figure is quoted or has a validated derivation | `scripts/check-figures.ts`, `scripts/derived-figures.ts` |

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

**Every data collection**

- [ ] Status defended under the 90% test — not "how sure do I feel", but what
      careful examination of the evidence yields.
- [ ] If `contested`: could it have been narrowed into a well-supported core
      plus a crux? If yes, do that instead.
- [ ] If `not-supported`: is there a positive restatement that would displace
      it? If yes, write that fact instead.
- [ ] Short plain title names the point and comparison without excess numbers.
- [ ] Detailed opening finding gives scope, period, numbers and essential
      qualifications, with `claimSources`.
- [ ] Opening graphs include trends and meaningful international comparisons;
      missing comparisons have specific, defensible reasons. No Context section.
- [ ] Important sub-slices, especially those cited by viewpoints, appear in the
      opening graphs and pills link to the relevant chart.
- [ ] Each Observation and Subtlety is a short, collapsed summary with details
      and citations on expansion.
- [ ] Observations identifies important patterns, country differences and
      discontinuities; substantial movements have reasonable explanations with
      citations where available and causal uncertainty made explicit.
- [ ] Reading order: finding, each graph followed by its Observations, optional Subtleties, Sources.
- [ ] If a material measurement is unavailable, `dataStillNeeded` names the
      exact measure and why it would improve the report; absence is never
      presented as evidence of absence.
- [ ] Title, uppercase section labels, finding headings and chart labels have
      distinct roles. Body and chart descriptions use regular weight; spacing
      separates sections and bold is selective.
- [ ] Long sourcing, derivation and collation explanations are collapsed.
- [ ] Footnotes sit beside each assertion; publisher credits sit below graphs;
      full references are at the end and every link reaches the right source.
- [ ] Multiple findings have stable targets that pills scroll to and highlight.
- [ ] Body covers all four obligations — what it measures and does not; how
      it compares across time and space; how confident to be; what it is
      commonly mistaken for, stated concretely.
- [ ] Every source quote fetched and copied verbatim, with the right
      publisher and date. None written from memory.
- [ ] Every figure is quoted or has a validated derivation (`pnpm check:figures`).
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
- [ ] Every empirical assertion in prose and summaries is a pill targeting the
      relevant finding, including key non-obvious, non-numeric premises.

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

### Glossary Popups

Use `[gross arrivals](#glossary-gross-arrivals)` or
`[net migration](#glossary-net-migration)` for terminology that could interrupt a
reader. Definitions live in `lib/content/glossary.ts`; reuse the same definition
across facts. Unknown glossary IDs fail rendering. Keep each definition short,
plain and specific about the measurement; factual claims needing evidence belong
in a linked fact rather than a glossary. Explain the term without opening another
definition. The native popup works above a fact popup, dismisses on Escape or an
outside click, and has a close button. It works without JavaScript.

### Show the Parts of a Total

When a chart includes a total and component lines, show every part needed to add
up to that total. Combine minor components into a clearly named remainder if
necessary; do not leave an unexplained gap. Use the same dates, units and coverage
for every component. Explain any derived subtraction under “About this data” and
verify the sum for every period. For example, detected illegal arrivals are split
into small-boat and non-boat detected arrivals; “non-boat” here does not include
legal immigration. If components overlap, do not present them as an additive
breakdown.

### Keep Observations With Their Graph

Each graph is a main section with an h2 heading. Put its observations immediately
below it, before the next graph, inside an Observations expando that starts closed.
Each individual observation is also an expando, so readers choose how far to drill down. For a series reading with ID `people`, write
`## Observations {#my-fact--observations-people}`. For a comparison with ID
`international`, use `## Observations {#my-fact--observations-international}`.
The renderer places these groups beneath their respective charts. Keep the `###`
observation IDs stable when moving existing content, so viewpoint pills keep
opening the same evidence. Graphs can be linked as `#fact-my-fact/chart-people`.

Subtleties is optional. Omit it when the contents merely repeat the finding,
describe an obvious chart feature, or explain routine methodology. Keep necessary
measurement caveats with the graph (briefly visible if they change its meaning,
otherwise in About this data). Reserve Subtleties for a surprising, consequential
qualification worth the reader's attention.

### Keep Observations Off the Plot

Do not overlay observation circles on the plotted data. Keep vertical dashed
lines for measurement changes, with a brief key linking to their explanations.
Observations belong in the collapsed Observations group beneath the graph.
Measurement changes have their own collapsed Method Changes section beside it.
Both use expandable summaries and stable IDs for direct links. Method-change summaries identify the date and change;
they do not need matching numbers. The `series.breaks` metadata generates these
explanations automatically. Keep dashed segments along the data series where
methods change, so incompatible measurements do not appear to be a continuous trend.

### Nationality Breakdowns and Selectable Country Comparisons

If an argument distinguishes EU from non-EU immigration, expose those series in
the main charts. Keep a country's own nationals separate rather than folding
returnees into a foreign-national group. Say whether the grouping is nationality,
birthplace or previous residence; they cannot be substituted for one another.
State membership changes and EU versus EU+ (EU plus EFTA) differences visibly.
Country comparisons should use a consistent grouping and common year. Use the
same population-adjusted measure for each destination, with denominator timing
and refugee-coverage differences disclosed.

A comparison can define `groups`, a `defaultGroup` index, and a `values` array on
every item in the same group order. The default can show the slice the argument
concerns. Readers can switch groups or select All arrivals to see a stacked total;
the full table remains available without JavaScript. Components must sum to the
total. Keep unknown citizenship and statelessness identifiable. If published
rounded components do not add to the rounded total, label the adjustment and
explain it—do not quietly count it as a measured group of migrants.

Use `featuredCharts` to bring an existing supporting fact's breakdown into the
main graph sequence, including its observation groups and measurement-change explanations. Keep
one data definition and one set of source citations instead of copying numbers
into a second fact.

### Method Changes Have Their Own Section

Keep Observations focused on patterns in the data and explanations of real-world
events. Changes in measurement, definitions or coverage belong in a separate
**Method Changes** expando beneath each affected graph, after Observations and
any Subtleties. Omit this section when there are no changes to explain.

Series `breaks` automatically generate dated, individually expandable entries in
Method Changes. Keep the vertical dashed lines and their link to the relevant
explanation, without circles. Source links refer to the series source. Preserve
stable entry IDs so existing links still open the right explanation. Do not
duplicate these entries under About this data; reserve that expando for general
collation, calculations and coverage notes.

### One Data Collection Can Contain Several Observations

A statistic or trend already explained by a graph normally belongs in an
observation, not in another fact card. Viewpoint pills can link directly to that
observation. For example, the fall from the UK net-migration peak lives in the
immigration-rates fact. Preserve old URLs with redirects when merging facts.

For artifact-specific subtleties, use
`## Subtleties {#my-fact--subtleties-people}` for the `people` reading (or a
comparison's ID). Only include useful qualifications. The renderer places this
expando after that artifact's Observations. General collation notes stay in About
this data.

`relatedFacts: [another-fact-id]` adds contextual connections without claiming
that one fact supports the other, and without nesting it out of the top fact
list. Existing `supports` values remain a legacy grouping mechanism for smaller
facts presented within a broader fact; the UI calls these Related Data too.
A relationship need not be strictly supportive. Avoid creating a separate fact
when a link to an observation will do.

A nationality shift, peak, decline, or explanation of a displayed pattern is
normally an observation, even when a viewpoint cites it as a key argument. Do
not repeat it as a Related Data card. Keep a separate related fact only when
it answers a distinct question, rather than reinterpreting the same graph.

Use `additionalSeries` for further datasets owned by the same fact, each with
a unique `id` and the same fields as `series`. Each keeps its own coverage,
methods, and source. Reading IDs must be unique across the fact. Sources are
numbered in this order: fact sources, primary series and its reading sources,
then each additional series and its reading sources. Put observations under
`## Observations {#fact-id--observations-reading-id}`. A dataset does not need
a separate fact simply to appear in the graph sequence.

When an observation attributes a major movement to a particular country or
route, show that contribution separately in the opening artifacts where the
source allows. Keep the remaining category exclusive of the highlighted slice,
and show both parts when showing their total. If the slice has a shorter
published history, retain the long-run chart and add a clearly dated breakdown;
never fill unavailable earlier values with zero. Distinguish nationality from
visa route, and document coverage differences and subtraction in About this data.
