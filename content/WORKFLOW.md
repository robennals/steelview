# How a Steelview topic gets written

A topic is written by a human editor and an agent working in seven stages.
The human names the topic; the agent drafts how each side would argue it, and
the human corrects that draft; the agent finds the evidence, rewrites each
side's case to rest on what the evidence actually shows, and assembles it
into a few combined reports; the two write the viewpoints together.

| # | Stage | Who leads | Output | Gate before moving on |
| --- | --- | --- | --- | --- |
| 1 | [Choose the topic](#1-choose-the-topic) | Human | `content/drafts/<slug>/outline.md` (top section) | — |
| 2 | [Outline the viewpoints](#2-outline-the-viewpoints) | Agent drafts, human critiques | `outline.md` (viewpoints) | **Human signs off the viewpoint set** |
| 3 | [Find candidate data](#3-find-candidate-data) | Agent | `content/drafts/<slug>/candidate-data.md` | — |
| 4 | [Revise the outline and plan the reports](#4-revise-the-outline-and-plan-the-reports) | Agent | `outline.md` (revised), `candidate-data.md` (report plan) | **Human reviews the revised outline, candidates and report plan** |
| 5 | [Build the data reports](#5-build-the-data-reports) | Agent | `content/topics/<slug>/facts/*.md` | Figure checks pass; human skims the reports |
| 6 | [Write the viewpoints](#6-write-the-viewpoints) | Both | `viewpoints/`, `cruxes/` | Human is happy with every viewpoint |
| 7 | [Publish](#7-publish) | Agent, human approves | PR | Checklist and checks pass |

[`AUTHORING.md`](AUTHORING.md) says what each finished item must look like.
This document says how to get there. Where they seem to disagree about the
finished content, `AUTHORING.md` wins.

**Working files live in `content/drafts/<slug>/`.** The loader only reads
`content/topics/`, so drafts never break the build. They stay after
publication as the record of what was considered and dropped.

---

## 1. Choose the topic

**The human names the topic.** The agent may suggest some, but does not pick.

The top of `outline.md` records:

- **Slug and title.** One argument, one country, one legal system
  (see [The shape of a topic](AUTHORING.md#the-shape-of-a-topic)). "US voting
  rules" is a topic; "elections" is a subject area.
- **What is being argued about**, in two or three sentences: the decision or
  question people are actually fighting over right now.
- **Scope boundaries**: what is deliberately excluded and why, so neither
  side's favourite adjacent argument quietly takes over the page.

## 2. Outline the viewpoints

**The agent writes the outline; the human critiques it.** An agent that has
read how each side argues produces a fuller first draft than a blank page, and
a human finds what is wrong with a draft faster than they write one.

For each viewpoint, the outline gives:

- **A short stable id** — `nuclear`, `regime-change`, `war-powers` — used in
  every draft file instead of a number, so references survive reordering and
  redrafting. It normally becomes the viewpoint's filename in stage 6.
- **Title**: a proposition someone would say aloud
  ([Titles](AUTHORING.md#titles)).
- **Its arguments**, four to six, each as its holder would make it, in a
  sentence or two. Each opens with a one-line claim that becomes a section
  heading in stage 6, so the claims read alone should add up to the title
  ([Write an argument someone can follow](AUTHORING.md#write-an-argument-someone-can-follow)).
- **The empirical claims under each argument**: what would have to be true
  about the world for the argument to work. These become the questions the
  data must answer. Write them as questions with a measure in them — "Has
  in-person voter impersonation been common enough to change outcomes?" — not
  as conclusions.
- **The context each question needs**, listed under it. A true number can
  still mislead if it is shown alone, so for every question name what a
  reader would have to see beside the answer to judge it fairly:
  - **the longer run** — the same measure over the full period the source
    publishes, not just the window the argument is about;
  - **comparators** — other countries, states or groups measured the same way;
  - **the denominator or base rate** — fraud cases against ballots cast,
    deaths against population, a cost against the budget;
  - **the rest of the record** — if the question is about one kind of bad
    behaviour, the other kinds that bear on the same judgement, and the
    counter-record where one exists;
  - **the counterfactual** — what was happening or likely to happen without
    the policy or event: was the trend already moving, was another path open?
  - **the mechanism** — how the thing actually happened, case by case, and
    whether the rule being argued over would have touched it. A remedy is
    only as good as its fit to how the problem really occurs: if past voter
    fraud was mostly done by officials or by mail, a polling-place ID check
    would not have stopped it, and people often assume otherwise.

  "Searched, none found" is an acceptable answer for a context item, with
  what was searched; the gap then goes to 3d.

  Context is researched in stage 3 alongside the question itself. It is what
  makes a report broad rather than built around one side's preferred number.
- **What it would probably concede.** A first guess at the well-supported facts
  that cut against it.
- **Principles** it rests on, from `content/principles/` where one fits.

**The agent critiques its own first draft before showing it**, using the
list below, and redrafts. A separate agent pass, or a fresh session, critiques
better than the drafting session does, because it is not defending its own
choices. The critique covers:

- **Missing viewpoints**: positions real people argue at length that the set
  does not cover, with an example of someone arguing each.
- **Viewpoints that are categories**, not views anyone would say aloud.
- **Weak arguments**: where a viewpoint's holders have a stronger argument
  than the one listed, name it.
- **Claims that are really values**, which need no data, and **values that
  are really claims**, which do.
- **Factual errors in the outline itself**, with a source. A live topic's
  timeline is the usual casualty: an argument built on a wrong date or a
  superseded event has to change before data is gathered for it.
- **Principles that do not exist** in `content/principles/`, with the
  nearest existing one or a proposal for a new shared principle.

The redrafted outline ends with a short `## Revision notes` section listing,
by number, what the critique changed and what it raised but the agent chose not
to change, with the reason — so the human can overrule either.

**The human then critiques the outline**: missing views, arguments a real
holder would make better, framings that are off. The agent redrafts again.
**Gate: the human signs off the viewpoint set.** Adding a viewpoint later is
allowed but means returning to stage 3 for its claims.

**New principles are written at this stage**, not later, when a viewpoint
rests on a value no shared principle captures. Follow
[Principles](AUTHORING.md#principles): the name and body must stand alone on a
page about another issue.

## 3. Find candidate data

**The agent researches every empirical question in the outline** and writes
`candidate-data.md`. It does not write fact files yet. The point of this stage
is a cheap, reviewable picture of what evidence exists before any effort goes
into building charts.

`candidate-data.md` has three parts here (3a, 3b, 3d); the report plan (3c)
is added in stage 4.

**3a. Question index.** Every empirical question from the outline, one row
each, with the viewpoint(s) it serves, the candidate datasets that address
it and those that supply its context, and the claim's **likely status** under the [90% test](AUTHORING.md#status)
— with how it could be narrowed to pass. A question with no candidate is
listed with what was searched. Questions raised by an accepted critique point
(a new viewpoint, a stronger argument) are researched too, marked with the
critique number.

**3b. Candidate datasets.** For each:

- **Source**: publisher, title, URL, date of the latest release.
- **What it measures**, and what it excludes.
- **Coverage**: the full time range published, and whether a country or
  state comparison exists in the same source. "Range not yet checked" is an
  acceptable answer here; stage 5 must settle it.
- **Shape**: a time series, a cross-country or cross-state comparison, a
  one-off snapshot, or a legal or event record (what a law says, what a court
  ruled, a dated timeline). A historical case — a fraud prosecution, a purge,
  a disputed election — records its outcome and the date that outcome is as
  of, since indictments get dismissed and convictions overturned. Snapshot-only and record-only evidence is flagged
  now, because it cannot carry a trend chart and the report must say why.
- **Slices available**: the breakdowns a viewpoint might cite (by state, by
  group, by type).
- **What it shows**, in a sentence, with a headline figure and the date the
  figure is **as of**. Every figure carries one of two marks:
  - **read** — seen on a named, fetched page, with its URL;
  - ***unverified*** — from a search snippet, a secondary report or memory.

  Neither mark is a quote. Stage 4 fetches and copies every figure verbatim
  whatever its mark; summarising fetch tools paraphrase, so a verbatim quote
  comes from the raw page or document.
- **Which viewpoints it helps and which it hurts.** Every dataset is described
  in terms of what it does to each side, not only the side that found it.

**3d. Problems for the human.** Claims in the outline the evidence does not
support, viewpoints left with little data behind them, places where no good
data exists, and sources whose reliability is itself disputed.

**Rules for this stage**

- **Look for evidence against each viewpoint as hard as evidence for it.**
  For every viewpoint, list at least one candidate that cuts against it.
- **Prefer primary sources**: statistical agencies, official records, peer-
  reviewed studies and the datasets behind news stories, over the stories.
- **Prefer series to snapshots**, and the source's own comparator set to a
  hand-picked one ([Charts](AUTHORING.md#charts)).
- **Partisan sources are leads, not evidence.** An advocacy group's report is
  a good way to find what a side cites; trace each number to its origin.
- **Do not polish.** Unverified figures are fine here if they are marked so.
- **Blocked sources are listed, not skipped.** When a primary site refuses
  automated fetching, try a plain download (`curl`), then an archived copy,
  then the same data from another official mirror, and list what is still
  blocked in 3d so the human can download it by hand.
- **Research split across parallel agents is merged and de-duplicated**
  before the file is reviewed: one candidate per dataset, with every question
  it serves listed on it.
- **Never send the user's email address, name or credentials to any
  service**, including research APIs that ask for a contact email to unlock
  open-access copies. A paywalled source the agent cannot reach without them
  goes on the blocked list.

## 4. Revise the outline and plan the reports

Two jobs, both done by the agent once the research is in, and reviewed by the
human together.

### 4a. Rewrite each viewpoint's case against the evidence

The outline was written before anyone looked hard at the data. The research
will have strengthened some arguments, weakened others, and turned up better
evidence than the outline asked for. Because every viewpoint is a steelman,
**each one now gets rebuilt so that everything it asserts is well supported**:

- **Drop or narrow** arguments the evidence does not support, rather than
  keeping them in weakened form.
- **Turn decisive open questions into cruxes.** A gap in 3d becomes a crux
  candidate only if it sits on a real tension between viewpoints — if one
  answer would leave a viewpoint standing and the other would knock out an
  argument it relies on. Many gaps do not pass that test: the missing data
  would be nice to have but would not swing the balance, and those stay in 3d
  or in the report's `dataStillNeeded`. A question that more research could
  answer is a research task; the crux is what each side is trying to protect
  while the answer is unknown. A viewpoint may still argue from its assumption
  on a crux, but says it is one.
- **Add** the strongest arguments the data makes available that the outline
  missed — for every viewpoint, including the ones the data mostly hurts.
- **Update the concessions** to the well-supported findings that cut against
  each viewpoint, now that they are known. For each, note why it does not
  stop the argument, and the evidence for that reason; stage 6 turns the pair
  into a "While …" sentence
  ([Concessions](AUTHORING.md#concessions-and-an-independent-voice)).
- **Re-check that the arguments still add up.** Each argument's one-line claim
  becomes a section heading in stage 6, so read the claims alone: if they no
  longer establish the title, fix the argument now, or the title.
- **Re-check the balance.** If one viewpoint has lost most of its empirical
  support, say so plainly; it may rest on values the data cannot touch, which
  is a legitimate position, but its outline should then argue from those
  values rather than from facts it no longer has.

Record what changed, per viewpoint, in the outline's Revision notes.

**Crux candidates are listed in the outline from stage 2 on**, each labelled
with its kind and the viewpoint ids it divides. Cruxes come in three kinds
([Cruxes](AUTHORING.md#cruxes)), and a topic will usually have all three:

- **a tension between principles** — the viewpoints weigh the same goods
  differently (`tradeoff`, or `priority` when one principle simply comes
  first);
- **different predictions** about what a policy or event will cause
  (`prediction`);
- **missing data** — a question the data cannot yet answer (`assumption`),
  from the open questions in 3d whose answer would decide between viewpoints.

### 4b. Plan the combined reports

Group the candidates into **at most about seven combined reports**, plus an
optional final **Other facts** report for well-sourced items that fit nowhere
else. Add the plan to `candidate-data.md` as part 3c.

A combined report presents one core area of the topic in full context. It is
meant to be **read as a whole**, not mined for a single number: it slices the
same subject in several directions — over time, against comparators, by
subgroup, by the rest of the record — so a reader who arrives for one figure
meets the figures beside it. When several viewpoints make claims about the
same area, **they point to different observations in the same report**, and a
reader following any of their links sees the others' evidence on the way.

Each report in the plan:

- has a neutral scope title
  ([Titles and opening findings](AUTHORING.md#titles-and-opening-findings));
- lists its artifacts (charts and tables) in reading order, each with the
  direction it slices the data;
- lists the observations, and **which viewpoint points at which observation**
  — a report that only one viewpoint cites is probably too narrow, or part of
  another report;
- is **broad enough to hold the slices that best justify every viewpoint**
  that touches its subject. If two viewpoints want different cuts of the same
  data, both cuts go in one report; a report built around one side's preferred
  conclusion is a sign of a missing slice in a broader one
  ([Neutral reports](AUTHORING.md#neutral-reports-must-answer-all-viewpoints-questions)).

**Gate: the human reviews the revised outline and `candidate-data.md`
together.** They mark candidates to keep or drop, approve or regroup the
reports, accept or reverse the outline changes, and decide each problem in
3d. Record the decisions in the file so stage 5 works from them.

**If the review splits the topic** — as happens when one argument turns out
to be two — the outline is split first, each viewpoint keeps its id, and
`candidate-data.md` is divided by tagging each candidate with the topic or
topics it serves before the report plans are redone.

## 5. Build the data reports

**The agent turns each approved report into a fact file** under
`content/topics/<slug>/facts/`, following `AUTHORING.md` exactly: verbatim
quoted sources, full-range series, the source's comparator set, observations
beneath each chart, method changes, sources at the end.

**Every chart value is audited against its source** before the gate.
`pnpm check:figures` lists every `series` point and `comparisons` value
that is not in a quote the chart cites, not a verified derivation, and not
on a table the reading or comparison names in `valuesFrom`; the list is
advisory until `--strict-values` becomes the default, and a named table is
only as good as someone having read it. An agent that did not build the
report re-fetches each chart's source data and confirms every value, or the
inputs and arithmetic of a derived one, and makes sure the chart's quote or
note names the table the values come from. In the first trial topic this
caught a published figure entered wrongly and a chart built from levels the
source never published.

**Readability is checked before the gate**, against
[Readability](AUTHORING.md#readability): a one-sentence overview at the top,
no paragraph longer than four lines, statistics shown in the charts rather than
recited in prose, dated events as numbered markers on the timeline, and a title
on every chart that [says what it covers and where](AUTHORING.md#charts). Look
at each report rendered, on a narrow screen as well as a wide one; a wall of
text is easy to miss in the markdown and obvious on the page.

Reports are independent, so **one agent per report can build them in
parallel** from a shared brief (see [Brief for a report
builder](#brief-for-a-report-builder)). Each returns its observation ids
grouped by the viewpoints they serve, what it dropped or could not verify,
blocked sources and any decisive gaps; collect those in
`content/drafts/<slug>/stage5-results.md`, which stage 6 links from.
Quotes come from the raw page (`curl`), never from a summarising fetch tool.

Then the agent runs a **coverage check** and writes the result at the bottom
of `candidate-data.md`: every question in the stage-3 index maps to a named
observation (`report-id/observation-id`), or to a `dataStillNeeded` entry
saying what is missing. A question that maps to nothing is either answered or
explicitly given up, with the human told which.

Run `pnpm check:figures`. `pnpm check:integrity` cannot pass yet, because no
viewpoint lists the facts; run it after stage 6.

**If building a report changes what the evidence shows** — a figure is
weaker once quoted, a slice cuts the other way — repeat 4a for the
viewpoints that relied on it before writing them.

**Gate: the human skims the reports** — especially the opening findings and
statuses — before viewpoints are written on top of them. A wrong status found
now costs one file; found later it costs every viewpoint that cites it.

**Known rendering limits** (until the shared components change):

- an observation group not tied to a visual needs the literal heading
  `## Observations {#<fact-id>--observations-<slug>}` to render as expandos,
  and is missing from the topic page's walkthrough, so give it a
  [figure](AUTHORING.md#figures) with the same id wherever one would honestly
  show it;
- a rule or status per area (a rule per state or country) is a categorical
  `tileMap` or `geoMap` figure; a categorical table with more than one
  column per area is a `dataTable` figure. Policy dates on a series go in
  its `events`;
- a fact file reaches the component library through `figures`
  ([AUTHORING.md, Figures](AUTHORING.md#figures)), which also sets the
  reading order. `GeoMap` (kind `geoMap`) and `ScatterPlot` (kind
  `scatterPlot`) are figure kinds; `QuoteBrowser`, `SliceExplorer` and
  `SmallMultiples` are not yet, so a report plan that needs one says so at
  stage 4b;

## 6. Write the viewpoints

**The agent drafts each viewpoint** from its outline and the observations
that now exist, with every empirical assertion a pill to an observation. A
viewpoint is read as a walkthrough of charts
([Lead with the data](AUTHORING.md#lead-with-the-data)), so choose each step's
chart before writing its text. Each viewpoint is a short lead, then one `###`
section per outline argument: the heading is the argument's one-line claim, and
beneath it two or three short sentences say what to notice in the chart and why
it matters, with no bullet lists. The section's first chart-backed citation
picks the chart, so cite the observation that shows the claim first. Write in
short, plain sentences a middle-school reader can follow. Pill text states the
point the argument needs and leaves exact figures, dates and sources to the
chart and the report. The
human and agent then edit together, one viewpoint at a time, until the
holder of that view would find it better argued than their own version
([The bar](AUTHORING.md#the-bar)).

- **Review the headings first.** Read each viewpoint's headings alone before
  its text: if they do not add up to the title, fix the argument before the
  prose.
- **Review each step's chart.** Step through each viewpoint on the topic page.
  A chart that does not show its step's claim means reordering the citations,
  choosing another observation, or going back to stage 5 for the chart it needs.
- **Leave definitions to the legend.** Where a step would define a term its
  chart draws, give the chart's line a `glossary` entry instead.
- **The agent proposes; the human decides** on every change of argument.
  Pure wording fixes against the [prose style](AUTHORING.md#prose-style)
  rules the agent can just make.
- **A new empirical claim goes back to stage 5.** If a viewpoint needs a
  fact that no report has, add the slice to the broadest report that covers
  its subject rather than creating a report for that viewpoint.
- **Cruxes are drafted after the viewpoints settle**, because they depend on
  where the viewpoints actually ended up disagreeing. Each names a tension and
  stops, without arguing the evidence or resolving it
  ([Cruxes](AUTHORING.md#cruxes)). Principles were written
  in stage 2; adjust them here only if a viewpoint's final form rests on a
  different value.
- **Order last.** Set each viewpoint's `order` so the sides alternate, and
  list the headline reports in `topic.md`'s `dataOrder` in the order a reader
  should meet them. Viewpoint frontmatter is only `name`, `summary` and
  `order` ([Citations and data order](AUTHORING.md#citations-and-data-order)):
  what a viewpoint builds on, concedes or sets aside shows in its inline
  observation links.

**Gate: the human is happy with every viewpoint**, read side by side —
first its headings alone, then stepped through on the page with each chart.
Check readability as for reports: look at each viewpoint rendered, and read it
aloud for sentences that need a second reading.

## 7. Publish

The agent runs the [Checklist](AUTHORING.md#checklist) and every command it
names, sets `lastUpdated`, adds the topic to `dataOrder` as wanted, and opens
a PR whose description lists the editorial decisions made along the way. The
human approves and merges.

---

## Keeping a topic current

A topic about a live event — a war, a pending law — goes stale fast. When the
facts move, rerun stage 3 for the changed questions only, repeat 4a for the
viewpoints they touch, update the affected reports, then reread every
viewpoint that cites them. A viewpoint whose
argument the news has overtaken is rewritten, not patched.

---

## Brief for a report builder

What each stage-5 agent is told, beyond the report's entry in 3c:

- **Read first, in full:** this document's stages 3–5; `AUTHORING.md`;
  `lib/content/schema.ts`; one or two existing combined reports as worked
  examples; the topic's outline and `candidate-data.md` (its review
  decisions, the report's 3c entry, the candidates it lists, and 3d).
- **Write one file**, `content/topics/<slug>/facts/<report-id>.md`, and
  touch nothing else: no other report, outline, principle, viewpoint, shared
  code (including the glossary) or commit. Glossary terms wanted are listed
  in the reply.
- **Verbatim or not at all.** Fetch every quote with `curl`; extract PDFs to
  text; never take a figure from memory or from the candidate file. A figure
  that cannot be confirmed at source is dropped or stated as unconfirmed.
- **One observation per planned finding**, for every viewpoint the plan
  lists, including the findings against each, worded neutrally.
- **Readable at a glance:** a two- or three-sentence overview; paragraphs of
  four lines at most; numbers in charts, not recited in prose; laws and
  policy changes as `events` on the series they bear on.
- **Context and gaps:** the longer run, comparators, denominators, the rest
  of the record and the mechanism, as the plan asks; material gaps go in
  `dataStillNeeded`, and only gaps that would change which viewpoint has the
  better case are reported as crux candidates.
- **Chart values come from the source's data**, each confirmed at source;
  name the table in the chart's quote or note, and say how any derived value
  was calculated. A level the source does not publish is not read off its
  chart image — but check the page's chart data tables (often in the page
  text below or beside the chart) before concluding it is unpublished.
- **One quote, one page.** A chart's source quote comes from the page its
  URL names. When a series joins two releases, quote one and name the other
  in the chart note, with its own citation.
- **Checks:** `heavy run -- pnpm check:figures` and `heavy run -- pnpm
  test:unit`, fixing only the agent's own file; other builders' files may be
  mid-edit.
- **Reply:** file and status; observation ids by viewpoint; dropped and
  unverified items; blocked sources; decisive gaps; glossary terms; anything
  in this document or `AUTHORING.md` that got in the way.
