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

**Process.** The stages a human and an agent go through to produce a topic —
outline, candidate data, reports, viewpoints — are in
[`WORKFLOW.md`](WORKFLOW.md). This document is the standard each stage's
output must meet.

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
| **Viewpoint** | One side of the argument, written as well as it can be written: a short lead, then headed sections whose claims add up to its title, in plain language, citing inline the observations it rests on and concedes. |
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

Readers do not see it on a fact: the fact list and fact page show the claim
and the data, not a status label. It still decides the order of facts nobody
has ranked, and a `claimCheck` figure still shows its own verdict.

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

`claim` leads the popup with a **brief overview**: two or three short
sentences saying what the report covers and what it mainly finds, specific
enough to be checkable but without a list of figures. The figures appear in
the charts directly below it. Do not remove qualifications needed to make the
overview true, or strengthen it to serve a viewpoint. `claimSources` lists the
one-based sources supporting the lead.
For unsupported or uncertain assertions, `assessedClaim` preserves the assertion
being assessed separately from the corrective finding.

### Readability

A report is read on a screen, often on a phone, by someone checking one claim.
It has to be easy to take in at a glance.

- **No paragraph longer than four lines** at reading width — about 60 words.
  Split it, or turn it into a short list.
- **Statistics live in the visualizations.** A number belongs in a chart,
  table or key-figure display, where it sits beside its comparisons. Prose
  says what to notice in the chart, not what its values are. State a figure
  in prose only when it is the point of the sentence and is shown nowhere
  else — and then one or two per paragraph at most. If a finding needs
  several numbers, it needs a chart.
- **Dated events go on the timeline.** When a law, policy or event bears on a
  movement in a series, add it to the series' `events`: it appears as a
  numbered marker under the chart, with its details one click away. Do not
  narrate the sequence of changes in a block of text.
- **Observations are short.** A summary heading, then one to three short
  sentences and their footnotes. Longer qualifications go in Subtleties or
  About this data, both collapsed.

### The body and reading order

Every fact requires a body. Put the most useful evidence first:

1. **A brief overview** (the `claim`), with linked citations.
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
`pnpm check:figures` checks prose numbers against source quotes and
validated `derivedFigures` calculations. A fact's figures must be in that
fact's own sources; a viewpoint's, crux's or the topic intro's must be in the
sources of the facts it cites (inline `#fact-` links); a shared principle's
may be anywhere on the topic. Money in `£`, `$` or `€` and percentages written
`%`, "percent" or "per cent" are all checked, and the forms match each other
("1.4 percent" matches a quoted "1.4%", "1.0%" matches "1%"). A range's scale
word applies to both ends ("$2–3 billion" matches a quoted "$2 billion" and
"$3 billion"). When a quote is a table of bare numbers whose unit the source
gives in a heading, set `quoteUnit: $` or `quoteUnit: '%'` on that source; the
check then reads those numbers in that unit. A quote's spelled-out small
percentage ("one percent") matches its digits, and a thousands group set with
a non-breaking space ("1 000") is one number, so keep that space when quoting.
Never spell out a figure in prose to get past the check: source it, or leave
it out. A passing check
does not establish that the citation supports the meaning, scope or causal
interpretation.

**Every chart value must be traceable too.** `pnpm check:figures` also
audits the numbers charts draw: each `series` point must be in its reading's
`source` quote (else the series `source`), each `comparisons` value — and
each group value of a grouped comparison — in the quotes of the sources the
comparison cites, or be a verified `derivedFigures` entry on the same fact.
Values read from a table no quote can hold go through `valuesFrom` on the
reading or comparison, naming the table ("EAVS 2024 Overview Table 1"); the
check then counts them as resting on that table. The chart-value audit is
advisory for now: it lists untraced values and exits 0, and
`pnpm check:figures --strict-values` fails on them.

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
existing `SeriesChart` and `ComparisonChart` data shapes, and the [`figures`](#figures)
kinds, for every report. If a
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

**Comparable measures from sources with different ranges share one axis.**
Give a line its own `coverage` when its source publishes a different range
from the others — Brent daily from May 1987 beside WTI from 1986, or Amnesty's
Iran count beside IHRNGO's from 2008. That line must then run the whole of its
own range, and the series `coverage` must be exactly the union of the lines'
ranges, so the axis is never stretched past the data. The legend names the
line's range ("Brent (from May 1987)"), and the table marks the years outside
it "—". Do not split such measures into separate charts to avoid the rule.

**A dense series can focus on a short period without dropping the rest.**
Daily Brent has over 9,000 points across 39 years, so a six-month shock is a
sliver of the plot. Add `focus` with a `from` date, an optional `to` (it
defaults to `coverage.to`) and a `label` for the switch ("Last 12 months").
The chart then draws a small strip of the full range with the window
outlined, says in words which period the plot shows, and draws the window at
readable scale; a switch shows the full range instead, and the table still
holds every value. The window must lie inside the coverage and hold at least
two points of some line. Events outside it stay in the numbered key, marked
"(outside the period shown)". `focus` is for reading the recent past
closely, never for hiding the rest: the coverage rule is unchanged.

**A series carries its own quoted source**, in the same shape as a fact's
sources, because a chart is a factual assertion like any other. A reading
that rests on a different dataset — a derived denominator — carries a second
source of its own.

**Events are marked, not narrated.** The `events` array on a series takes a
period, a short label, an optional one-sentence note and the number of the
fact citation that dates it. Each event becomes a numbered marker on a strip
under the chart, lined up with the time axis. An event marks when something
happened; it does not claim the movement beside it was caused by it — that
claim, if the evidence supports one, belongs in an observation with its
source. A change in how the data was *measured* is a break, not an event.

**Definitional discontinuities are marked, not smoothed.** The `breaks` array
takes a period, a short label and a note in the source's own terms.
`immigration-against-the-long-run` marks three: LTIM replacing IPS-alone in
1991, administrative data backdated to 2012, and the June 2021 method change.
The line still runs through them; the reader is told what changed.

**Estimates and forecasts are drawn, not dropped.** When a source mixes
history with estimates, provisional values or forecasts, run the series to
the source's end and give each such point a `status`: `estimate`,
`provisional` or `forecast` (absent means measured). Estimates and provisional
values are dotted with hollow markers; forecasts sit in a shaded zone labelled
Forecast; the table adds "(est.)", "(prov.)" or "(forecast)". Forecasts must be
a line's last points, and a series with any forecast needs a `coverage.note`
naming the forecast's vintage ("EIA STEO, October 2026").

**When measurement stops, say so on the chart.** If a series ends because
nobody has measured since — not because the source ends — add
`notMeasuredSince` with a short `label` (48 characters at most), a `note` in
the source's terms, the numbered `source` that says so, and optionally `until`
(it defaults to the topic's `lastUpdated`, and may not be later). The chart
hatches the gap from the last point to `until`, writes a key line under the
plot, and adds a Method Changes entry the key line links to. Events may fall
inside the band.

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

### Home-page preview charts

Each topic's row on the home page opens onto a carousel of a few of its
charts, listed in `previewCharts` in `topic.md` as `fact` and `chart` pairs
(`chart` is `series`, an `additionalSeries` id or a `comparisons` id). Each
slide is one chart: for a series with several readings, add `reading` to name
the one the slide draws (default: the first). The full chart, a click away,
still draws every reading, and holds everything a slide leaves out — a slide
is only the chart's title and the graph. The
carousel is the first evidence many readers see, so choosing it is choosing
what the topic looks like — and a carousel that mostly backs one side has
failed however good it looks. Choose by these rules:

1. **The first chart shows the magnitude of the issue** — whether this is a
   big or a small problem — before anything about its nature, whichever
   viewpoint its data happens to help.
2. **Every viewpoint is represented by at least one chart that is among its
   strongest evidence.** One chart can represent several viewpoints; add no
   extra chart when one already serves.
3. **Prefer charts that also give a good overview of the topic**, even over a
   slightly stronger but narrower chart.
4. **Keep the set small** — about four.

The carousel never labels a chart as evidence for a viewpoint: a chart usually
bears on several. The build checks the mechanical half of rule 2 — every
viewpoint must cite, inline, the fact behind at least one preview chart — and
leaves "strongest", magnitude and overview to you.

`uk-immigration` opens on `immigration-against-the-long-run`, read as a
share of the population since 1964 (`reading: share-of-population`), which is
what makes the magnitude legible. Then the modelled lifetime fiscal
contribution by visa route (`immigration-economy-and-public-finances` /
`lifetime-by-route`), government investment against the OECD
(`immigration-housing-and-public-services` / `investment`), grants of
settlement (`settlement-and-migrant-status` / `series`) and the foreign-born
share since 1951 (`integration-outcomes` / `series`). Five charts, because
seven viewpoints lean on five distinct bodies of evidence; between them they
cover all seven.

### Figures

A fact can place any component from the report library — tables, key figures,
timelines, maps, bars, estimate ranges, quotes, claim checks, caveats — by
listing it in `figures`. The list is also the fact's **reading order**: its
entries render in the order written, interleaved with the fact's series and
comparisons and with sections of its body. A fact without `figures` renders
as before: series, additional series, featured charts, comparisons, then the
body.

**Kinds.** Each entry has a `kind`. Four kinds place things the fact already
has; the rest draw a component (see Storybook for each one's look):

| Kind | Renders |
| --- | --- |
| `series` | the fact's `series`, or one `additionalSeries` by `id` |
| `comparison` | one `comparisons` entry, by `id` |
| `featured` | the charts of one supporting fact named in `featuredCharts` (`fact: <id>`) |
| `section` | the body section headed `## … {#<fact>--<id>}`, moved to this place |
| `dataTable` | a sortable table; a cell may be `{ value, sources }` to footnote it |
| `keyFigures` | one to six headline numbers, each with a `period` and its own `source`; `qualifier: more than` for a bound |
| `timeline` | dated events in `categories`, each with its own `source` |
| `periodTimeline` | spans per row, with point `events`; a period with no `to` is still in force and runs to the topic's `lastUpdated` |
| `tileMap` | US states, European countries or UK regions as equal tiles (`map: us-states`, `europe-countries`, `uk-regions`), shaded by a number or by a category |
| `geoMap` | true-shape outlines (`regions: world`, `europe`, `uk-itl1`), shaded by a number or by a category, with optional enlarged `insets` for small areas |
| `barChart` | ungrouped bars in any format, dollars included |
| `compositionBar` | the parts of a whole, one bar per row; a row from another counter cites its own `source` |
| `estimateRange` | estimates with ranges; omit `high` for "at least", `low` for "at most", `estimate` for range only; `nullValue: null` for costs |
| `scatterPlot` | two measures per area plotted against each other, every point labelled (`label`, one to four characters) and named; optional `groups` and `highlight` |
| `quoteComparison` | two to four answers to one `question` |
| `pullQuote` | one quote set apart |
| `claimCheck` | a well-known claim, quoted, set against the evidence, with a link to the fact that sets it out |
| `caveatList` | what the figures above do not show |

Every component figure takes `id`, `title`, a one-sentence `description` (the
visible orientation and the screen-reader text), `sources`, an optional `note`
for About this data, and an optional `valuesFrom`. The quote, claim and caveat
kinds have their own shapes; `lib/content/__fixtures__/figure-examples.md` has
a worked example of every kind.

```yaml
figures:
  - kind: comparison
    id: senate-votes
  - kind: dataTable
    id: federal-laws        # its "## Observations {#…--observations-federal-laws}" attaches here
    title: Federal voting laws and bills on registration and ID, 1965–2026
    description: The federal laws in force on registration and ID, and the main bills since 2021.
    caption: One row per law, bill or ruling
    columns:
      - { key: year, label: Year, format: text }
      - { key: measure, label: 'Law, bill or ruling', rowHeader: true }
      - { key: status, label: Status, sortable: false }
    defaultSort: { key: year, direction: ascending }
    rows:
      - year: '2025'
        measure: SAVE Act (Republican)
        status: { value: 'Passed House, 220–208, 10 Apr 2025', sources: [24] }
  - kind: section
    id: freedom-to-vote-act-provisions
```

**Once present, `figures` places every chart.** Each `series`,
`additionalSeries`, `comparisons` and `featuredCharts` entry must be
referenced exactly once, so a chart can never silently drop to the end of a
report. Body sections that no `section` entry names, and that are not a
figure's Observations or Subtleties, render after the last figure.

**Sources are the fact's own numbered citations**, exactly as for
`comparisons`: `sources: [5]` is the fact's fifth citation. A figure's
source line lists its `sources` and every item-level citation (a key
figure's, an event's, a table cell's, an estimate's, a composition row's, a
quote's), deduplicated, in ascending order, each a link to the quoted
reference. Every figure but a `caveatList` needs at least one citation.

**Observations attach by id.** A component figure's DOM id is
`<fact>--chart-<id>`, so viewpoints cite it as `#fact-<fact>/chart-<id>`.
`## Observations {#<fact>--observations-<id>}` and
`## Subtleties {#<fact>--subtleties-<id>}` render inside the figure's frame,
after its source line and before About this data, as they do for a
comparison. A `section` entry's id takes Observations the same way.

**Numbers stay traceable.** `asPublished` on a value gives the figure in the
source's own words ("more than 7,200", "8.8%"); `check:figures` looks for that
text in the quote instead of the number. `valuesFrom` on a figure — and on a
series reading or a comparison — names the published table its values are read
from when no quote can hold them all ("EAVS 2024 Overview Table 1"); it is
shown in About this data.

**Quotes are verbatim.** A `quoteComparison` or `pullQuote` text, or a
`claimCheck` claim, must appear in its cited source's `quote`. Mark an
omission with "…"; each fragment between omissions is checked on its own,
ignoring case, curly quotes and spacing.

**A map shows a number or a category, never both.** A numeric map gives
`data` (area id → number, or `{ value, asPublished }`) and `valueLabel`, with
optional `format`, `scale`, `steps`, `domain` or `breaks`. A categorical map
shows a rule or status per area — the ID rule each state enforces — without
coding it as a number, which would imply a false order:

```yaml
  - kind: tileMap
    id: voter-id-rules
    title: ID asked of voters at the polls, by state, 2026
    description: The rule each state enforces when a voter arrives at the polls.
    map: us-states
    areaLabel: State
    categoryLabel: ID asked of voters at the polls
    sources: [2]
    categories:              # two to six, in legend order
      - { id: strict-photo, label: Strict photo ID, mark: SP }   # mark: 1–3 characters printed on each tile
      - { id: none, label: No document requested, mark: "—" }
    areas:                   # area id → category, or { category, note }
      AR: { category: strict-photo, note: A free voter ID card is issued on request }
      GA: strict-photo
      CA: none
```

Category ids and marks are unique, and every area names one of the
`categories`. A `geoMap` takes the same two encodings; its area ids are the
outlines' own (ISO two-letter country codes for `world` and `europe`, slugs
such as `london` for `uk-itl1`).

**A map with gaps says why.** A `tileMap` or `geoMap` area with no datum or
category reads "No data"; unexplained, a gap looks like a selection, so a map
that leaves out any area of its preset needs a `note` saying why. A world map
of a dozen countries therefore always has a note.

**A scatter plot's points are named and checked.** Each point has a unique
slug `id`, a short `label` printed beside it, a `name` for the readout and
table, `x` and `y`, and optionally a `group` (one of `groups`), a `note`, and
`xAsPublished`/`yAsPublished` for `check:figures`. An axis `domain`, if given,
must cover every point, and `highlight` names point ids.

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
- A country should have a meaningful say over who joins it
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

### Write an argument someone can follow

A viewpoint is a short persuasive essay in plain English. Its job is to make
the opening proposition compelling. The data report holds the detailed evidence;
the viewpoint explains why that evidence gives someone a reason to act.

**A viewpoint is a tree: a lead, then a sequence of headed sections whose
headings add up to the title.** Open with one or two sentences stating the
belief or choice being defended, and the principle behind it where one does the
work. Then give four to six sections, each headed with an `###` heading. Each
heading is one claim in the argument, stated as a sentence the holder would say
— "Iran had brought itself within reach of a bomb", not "The nuclear
programme". Read in order without the text beneath them, the headings should
make the whole case: someone who accepted every heading should accept the
title. A reader skimming the headings gets the argument; a reader who doubts
one reads the section beneath it.

```markdown
A regime with Iran's record could not be allowed the one weapon that would put
it beyond punishment. …

### Iran had brought itself within reach of a bomb

Iran is [the only state without nuclear weapons enriching uranium to 60%](#fact-…), …

### Iran had not earned the benefit of the doubt
…
```

Under each heading, write one or two short paragraphs of ordinary prose — no
bullet lists. The paragraphs give the evidence for that heading's claim and
explain why it supports it. Deal with the strongest relevant difficulty in the
section it bears on, rather than collecting objections at the end. The last
section states the policy or judgment the earlier sections support, and its
heading says what that is. A sequence of unrelated true headings is not an
argument, however good its citations. `us-iran-war` is the model.

**Write so a middle-school reader can follow every sentence.** Many readers
find long or complicated sentences hard, and a viewpoint that loses them has
failed however good its argument. In practice:

- **One idea per sentence.** Aim for about 10–15 words, and split anything
  over about 20. Prefer two sentences to one joined by "and", "which" or a dash.
- **Say who did what.** "Iran has attacked its enemies for decades", not "a
  regime with Iran's record". Avoid nouns standing in for actions or
  histories ("its record", "the capability", "leverage").
- **Everyday words.** "Overthrow", not "imposed regime change"; "rebuild",
  not "reconstitute"; "cleaned up", not "sanitised". Explain a term the
  argument needs the first time it appears: "Sanctions are limits on a
  country's trade and money."
- **Name sources plainly.** A reader may not know an acronym, and some
  mislead ("ISIS" here is a nuclear-research institute). Write "a leading
  group of nuclear experts" or "experts at two US research groups" in the
  viewpoint; the report names them in full.
- **Read it aloud.** If a sentence needs a second reading, rewrite it.

**Every sentence must earn its place in the argument.** Short is not enough;
each sentence should carry something the argument needs, and say it in as few
words as possible.

- **Claim first, then why.** Open a section with the sentence that makes its
  point, then give the facts that support it. "US intelligence judged Iran
  was probably less than a week from enough uranium for a bomb. That is
  because Iran had already done most of the hard work" — then the evidence.
- **Say why a fact matters.** A figure means nothing until the reader knows
  what it is measured against. Before "Iran enriches uranium to 60%", say
  what enrichment is, that it is the hardest step towards a bomb, and what
  power plants and bombs need. A stock "more than doubled" needs its period
  inside the pill: "in the seven months before the strikes".
- **Name what matters, not a stand-in for it.** "Hid the evidence", not
  "cleaned up the sites"; "worked best long before a country was close to a
  bomb", not "the things that made past strikes work". If a phrase makes the
  reader ask "meaning what?", replace it with the answer from the report.
- **State the real stake.** Name the consequence the holder actually fears.
  The danger of an Iranian bomb is not that "no one could punish it"; it is
  that other countries would fear striking back, so Iran could attack more
  freely, and that it might one day use the bomb.
- **Answer the reader's obvious question.** If a reader would ask "is there an
  innocent reason for this?", the section should answer it, with evidence.
- **Connect each sentence to the one before.** Within a paragraph, each
  sentence should follow from the last. Split two unrelated facts into two
  sentences rather than joining them with "and".

Use familiar words and concrete consequences. Prefer “contributes more in taxes
than it receives in public spending” to “fiscally positive”. Explain the step
from evidence to conclusion: a projected tax contribution gives a reason to
welcome a worker; it does not, by itself, settle every immigration policy.
A principle supplies a value judgment, not empirical proof.

**Use numbers only when the number matters to the reasoning.** In a viewpoint,
“arrivals remain much higher than in the 1990s” will usually do more useful work
than a string of annual totals. Keep the exact measure, dates, denominators and
comparisons in the linked report. Retain a number when a threshold, magnitude
or comparison is necessary to understand the conclusion. “Large” and “small”
are still factual claims: they need a defensible baseline and evidence.

Keep qualifications that change the meaning beside the claim: “projected”,
“among lower-paid workers”, “in England and Wales”. Move methodological detail
that does not change the argument into the report. Never simplify a projection
into a certainty, a correlation into a cause, or one subgroup into everyone.
For legal claims, distinguish an obligation to hear a claim from an obligation
to grant protection; everyday wording must preserve the actual scope of the law.

Aim initially for about 300–450 words across four to six sections. These are
editing defaults, not quotas. Use fewer words when they suffice. Six sections
is a ceiling: past it, the headings read as a list of points rather than an
argument, so merge the claims that make the same step. Use `###` headings only,
never bold mini-headings or nested levels. The summary should give the central
reason and direction in one or two natural sentences, rather than compressing
the evidence inventory.

### Concessions and an independent voice

**Could this be published standalone, elsewhere, unchanged?** Do not mention
other viewpoints, the site, the data presentation or the act of steelmanning.
Delete phrases such as “this argument must concede”, “the evidence should be
stated honestly”, “neither side should claim” and “the moral case should be
stated openly”. Make the case itself.

**Mark a concession as a concession, and say why it does not stop the
argument.** A fact that cuts against the viewpoint must never read as though
it supports it. Open the sentence with "While", state the fact (with its year
when the date matters), then give the reason it does not change the
conclusion — ideally backed by evidence:

> While [US intelligence judged in 2025 that Iran was not building a
> bomb](#fact-…), [it warned that pressure to build one was probably
> growing](#fact-…).

rather than

> US intelligence also judged that Iran was not building a bomb. But that
> only described what Iran intended at the time.

The second leaves the reader unsure which side the fact is on and answers it
with assertion, not evidence. Keep the rebuttal in the same sentence or the
one straight after, so the concession is never left standing alone.

Integrate a real concession where it affects the proposed choice. Explain how
the policy responds, or why the benefit is still worth the cost. For example:

> Immigration adds to housing pressure where building cannot respond.
> Welcoming more people therefore carries a responsibility to provide more
> homes and infrastructure.

Link the factual premise to its observation in the finished version. Do not
append a catalogue of every possible objection. Frontmatter is an evidence
index; its existence does not require every listed item to become a paragraph.
A concession should sharpen the decision, not dissolve the viewpoint into a
neutral report. The final section should follow from the reasons given.

### A repeatable writing workflow

Use this sequence when asked to create or improve viewpoints on any topic:

1. **Define the real disagreement.** Identify propositions people would actually
   defend. Give each a distinct central reason, not merely different adjectives
   for the same conclusion. Check that titles do not promise an unsupported
   historical or causal claim.
2. **Sketch the argument as headings.** For each proposition, write the four
   to six claims that together establish it: central value → factual premises
   → why those premises matter → strongest relevant cost or objection →
   response → conclusion. Each claim becomes a section heading. Read the
   headings alone: do they add up to the title? Pick the existing shared
   principles that actually do work. Do not force every principle into every essay.
3. **Draft for reading.** Under each heading, write a short prose paragraph or
   two using the best available evidence, with qualitative factual phrases
   where exact numbers add little. Read it without the links: does it still
   make a coherent, persuasive case? Remove any section whose deletion makes no
   difference to the conclusion.
4. **Revise for force and honesty.** Check that each section supports its
   heading, each heading supports the title, and concessions lead somewhere.
   Read aloud for jargon, cumbersome sentences, repeated caveats and statistics
   that interrupt the thought. Revise the summary after the body.
5. **Audit the evidence.** Inventory every empirical premise, including those
   in the title and summary. Map each to a specific **Observation** in a neutral
   data report, or mark it `#needed` for the research queue. Check each
   observation against real, credible sources.
   Prefer official statistics, primary research and authoritative legal texts
   as appropriate. Check scope, date, comparison and uncertainty. A plausible
   phrase or a resolving link is not proof of support. Expand the shared report,
   narrow the claim or remove it when support is missing; never invent support
   to preserve a pleasing argument.
6. **Wire and review.** Link factual phrases to those observations and value
   phrases to shared principles. Align frontmatter, preserving permanent IDs.
   Check rendered reading flow and that pills open the intended observation
   or principle modal. Run the content checks, then reread the essay as prose.

**An explicitly requested argument-first pass may stop before the full evidence
audit.** Keep useful existing links and mark unresolved empirical premises with
`#needed`; do not present them as verified. Avoid adding speculative facts just
to make an argument sound stronger. The later audit is required before calling a
new topic fully sourced. It must preserve readable prose rather than turn the
essay back into a string of source notes.

The finished evidence chain is: **viewpoint claim → report Observation → credible
source or dataset**. Graph and whole-report links are useful navigation, but an
empirical argument needs an observation that actually states its premise. A
missing observation is work to finish in the report, not permission to bury the
premise in a chart or leave it supported only by an external link.

### Citations and data order

Viewpoint frontmatter contains only `name`, `summary` and `order`. There are
no `citesFacts`, `acknowledges`, `setsAside` or viewpoint-level `principles`
lists. The prose itself shows what the argument builds on, concedes or sets
aside through inline citations.

`topic.md` contains `dataOrder`: the explicit order of headline Data
collections on the page. List every headline collection once, by filename ID.
Supporting collections belong under their parent and are not included. Data
order is an editorial decision about reading flow, not a reward for whichever
viewpoint happens to cite something first.

Every empirical assertion in viewpoint prose **and summaries** should be a
linked observation pill, including non-numeric statements and key premises that are not
obviously true. Link the relevant phrase each time it appears; a list at the
bottom is not a substitute. Include essential qualifications inside the pill.
Values, preferences and purely logical reasoning remain ordinary prose.

**Keep pill text to the point the argument needs.** The pill opens the report,
which holds the exact figures, dates, sources and method, so the pill does not
need to restate them. Write the claim as the argument uses it:

> [Official estimates of the war's cost have nearly doubled](#fact-…)

rather than

> [Official estimates of the war's cost have risen from about \$25 billion to \$47.1 billion](#fact-…)

Keep a qualification inside the pill when dropping it would change what the
claim says: whose assessment it is ("in ISW/CTP's assessment"), how firm it is
("reportedly", "by one minimum count"), or which sample it describes ("in
GAMAAN's online survey"). Check every paraphrase against the observation it
links to: "nearly doubled" must be true of the report's figures, and a
paraphrase must not shift a date, scope or comparison.

### Research-needed citations

An argument-first draft may contain an empirical premise that deserves research
but does not yet have a report. Mark the exact claim with a `#needed` link:

```markdown
[integration succeeds at different rates](#needed)
```

The mark is for the research queue, not for readers: the page renders the
claim as plain prose, with no link, pill or popup. It is never styled as a data
citation, so an unverified premise cannot be mistaken for evidence, and it is
not counted as a fact citation or a viewpoint relationship.

Also list the claim, exactly as its link text reads, in the viewpoint's
`researchNeeded` frontmatter. That list is where the research queue is read
from, since nothing on the page shows it:

```yaml
researchNeeded:
  - "integration succeeds at different rates"
```

`pnpm check:integrity` fails if a `#needed` mark is missing from the list, or
the list names a claim no mark in the body carries. Remove both together once
a data report supports the claim and the link points at it instead.

Use it for a concrete empirical claim that a future data report could confirm,
qualify or disprove. Link the claim itself, not a vague sentence such as “more
research is needed.” Do not use it for values, policy preferences, logic, or a
fact already supported by an observation. It is a research queue: when evidence
is found, replace it with the appropriate `#fact-...` observation link. When
evidence cuts the other way or
cannot be found, rewrite or remove the premise.

Cite observations inline with a plain markdown link to the collection and
observation ID. The existing `#fact-` prefix remains the citation syntax:

```markdown
[immigration shifted from EU to non-EU nationals](#fact-immigration-against-the-long-run/nationality-shift)
```

The build checks that the id resolves. Links render as the Data collection's
own URL, so a citation works without JavaScript.

### Principle pills

When a shared principle supplies a reason for the conclusion, link a short,
natural phrase at the point where it is applied:

```markdown
Giving [priority to the worst off](#principle-priority-to-the-worst-off)
means being willing to devote resources to people in grave danger.
```

List that ID in the viewpoint's `principles` and in the topic's `principles`.
These links render as clickable pills opening a modal with the shared principle.
Use the shared name or a faithful short phrase, not a sentence that smuggles in
an empirical prediction. The surrounding prose must explain the application;
the pill alone does not make the argument. Link where useful, normally once
per principle, rather than decorating every mention of a value.

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

Most cruxes are a trade-off between values, a different prediction, or a
different assumption about something the data cannot answer. The last kind
comes straight out of the evidence work: when a report has to say "no good
data exists" on a question the viewpoints answer differently, and the answer
would change which of them has the better case, that gap is a crux. Naming it
tells the reader exactly what evidence would settle part of the argument. A
gap whose answer would not swing the balance is not a crux; record it as
`dataStillNeeded` instead.

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
alone on its own line, doing emphasis rather than work. Short sentences are
not the problem: a viewpoint should be written in them. The problem is a
sentence that carries no information.

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

**5. Precision in the wrong place.** A report needs exact quantities and their
context; a viewpoint usually needs the meaning of the comparison.

> Viewpoint: Annual arrivals remain far above the levels typical of the 1990s,
> even after falling sharply from their recent peak.
>
> Linked report: Give the annual totals, historical baseline, population-adjusted
> comparison, dates and sources in the relevant Observation and graph.

Do not strip useful precision from reports, and do not import every report
number into the argument. Keep a number in the viewpoint only when the reader
needs it to understand the reason being offered.

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
| Series lines span the declared coverage (or the line's own `coverage`) exactly, end to end; the series coverage is the union of its lines' | `lib/content/validate.ts`, `seriesErrors` |
| Series points strictly ascending, no repeats | `lib/content/validate.ts:267` |
| Series breaks fall inside the declared coverage | `lib/content/validate.ts:296` |
| Forecast points are each line's tail, and need a `coverage.note` | `lib/content/validate.ts`, `seriesErrors` |
| A series `focus` lies inside the coverage, runs forwards and holds two points of some line | `lib/content/validate.ts`, `seriesErrors` |
| A `notMeasuredSince` band ends after the last point and not after `lastUpdated`, and cites a real source | `lib/content/validate.ts`, `seriesErrors` |
| Inline `#fact-` citations resolve, and a viewpoint only cites facts it lists | `lib/content/validate.ts:325` |
| Figure shapes: known `kind`, slug ids, `currency` only with unit `currency`, ≥2 table columns, a tile map's `data` and `valueLabel` | `lib/content/schema.ts` (`figureSchema`) |
| Figure ids are unique and do not reuse a series, reading or comparison id | `lib/content/validate.ts` (`figureErrors`, F1) |
| Every figure citation is one of the fact's numbered sources, and every figure but a caveat list has one | `lib/content/validate.ts` (F2, F5) |
| Once present, `figures` places every series, comparison and featured chart exactly once, and names nothing that does not exist | `lib/content/validate.ts` (F3) |
| A `section` figure names an h2 in the body | `lib/content/validate.ts` (F4) |
| Table columns, rows, sort and highlight agree; numeric columns hold numbers | `lib/content/validate.ts` (F6) |
| Timeline categories exist and periods run forwards; period-timeline events fall on its axis | `lib/content/validate.ts` (F7) |
| At most six key figures | `lib/content/validate.ts` (F8) |
| Tile-map areas belong to the preset, breaks ascend, and a gap is explained in `note` | `lib/content/validate.ts` (F9) |
| Bars fit `domainMax`; composition rows use known categories and total more than zero; estimates run low ≤ estimate ≤ high inside `domain` | `lib/content/validate.ts` (F10) |
| Quotes and claim-check claims appear verbatim in their cited source's quote | `lib/content/validate.ts` (F11) |
| A claim check's evidence names a fact in the topic, and a section on it | `lib/content/validate.ts` (F12) |
| Every prose figure is quoted in a source the item may use (its own, or its cited facts') or has a validated derivation | `scripts/check-figures.ts`, `scripts/derived-figures.ts` |
| A topic has at least one unique tag and at least one preview chart | `lib/content/schema.ts` |
| Preview charts (and any named `reading`) resolve, appear once, and every viewpoint cites the fact behind one | `lib/content/validate.ts` (`previewChartErrors`) |

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
- **An untraced chart value is an advisory, not an error, unless
  `--strict-values` is given.** `check:figures` lists it and exits 0.

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
- [ ] Opening is a brief overview of two or three short sentences, with
      `claimSources`; its figures are in the charts below it.
- [ ] No paragraph longer than four lines. Numbers sit in charts, tables or
      key figures, not recited in prose; dated events are `events` on the
      series, not narrated.
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
- [ ] A one- or two-sentence lead, then four to six `###` sections; the
      headings alone add up to the title, and the last states the conclusion.
- [ ] Sections are short prose paragraphs, not bullet lists, and each
      advances the argument for its heading.
- [ ] Pill text states the point the argument needs; exact figures, dates and
      sources stay in the report unless the reasoning depends on them.
- [ ] Plain English a middle-school reader can follow: short sentences, one
      idea each, everyday words, sources named plainly; no statistics
      inventory or methodological detours.
- [ ] Exact numbers appear only where necessary to understand the reasoning.
- [ ] The conclusion follows from the reasons, with a concrete choice or judgment.
- [ ] Applied principles are inline pills, listed in frontmatter, opening the right modal.
- [ ] Each empirical premise maps to a report Observation backed by credible evidence;
      otherwise it is marked `#needed` and explicitly queued for research.
- [ ] Where it is milder than a partisan would put it, that traces to
      something they would concede.
- [ ] Could be published standalone elsewhere, unchanged. No sentence refers
      to this page, to other viewpoints, or to what people commonly get
      wrong.
- [ ] Concessions land in the flow of the argument, open with "While", and
      say straight away why they do not change the conclusion. They cite the
      counter-point that contextualises them. No "what this view concedes"
      section.
- [ ] `citesFacts` is ordered deliberately — first entry is the fact the
      argument actually rests on.
- [ ] Every fact it leans on is in one of its three lists.
- [ ] Every empirical assertion in prose and summaries is a pill targeting the
      relevant finding, or is marked `#needed` (shown as plain prose) until the
      evidence audit is complete.

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

- [ ] At most about seven combined reports, plus an optional Other facts
      report. Each is read as a whole; viewpoints citing the same area point
      to different observations in the same report.
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

Name both dimensions of the breakdown table. `itemLabel` says what each bar is
("Country", "Method") and heads the table's first column; without it the column
reads "Category". `groupLabel` says what the groups are ("nationality", "whether
an ID check would reach it") and goes in the table's caption, "{title}, by
{groupLabel}".

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
