# Home page: topic previews — design

**Summary.** The home page becomes a short tagline above a stack of
full-width topic rows. The first topic starts open, showing a carousel of
that topic's key charts, its viewpoints as one line each, and a button to read
the full report. The other rows are slim, with small chart previews on the
right; clicking one opens it while the open row closes, in one smooth motion.
Which charts a topic previews is chosen by an editorial rule — the first chart
shows how big the issue is, and every viewpoint is represented by at least one
of the strong charts it relies on — and the build checks the part of that rule
a machine can check.

Prototype the owner approved: `.superpowers/brainstorm/*/content/accordion-magnitude-v2.html`
(gitignored scratch; regenerate with `/tmp/claude-501/gen_accordion.py` if
lost). The prototype's charts are hand-drawn SVG; the real build must not be
(see [Charts](#charts)).

## Why

The current home page is a plain list of titles; hovering restyles only the
title. The owner wants a first-time visitor to:

- get, in one line, what Steelview is, with a link to more;
- feel this is a professional, trustworthy publication, not a hobby project
  and not something pushing a position;
- be able to dip into a topic quickly and see whether it is interesting
  before committing to the full report.

## Goals

- **Tagline and one link, nothing more, above the topics.** "Every side of
  the argument, at its strongest." and a "What is Steelview?" link.
- **Full-width topic rows, first one open.** The open row shows: last-updated
  date, title, subtitle, a chart carousel, the topic's viewpoints
  (name only, one line each, truncated with an ellipsis if needed), a "Read the
  full report" button, and counts (viewpoints · disagreements · facts, where
  disagreements is the number of cruxes). *(Builder's call: there is no region
  field in the topic schema, so the prototype's "United Kingdom" kicker is
  dropped rather than adding one.)*
- **Collapsed rows** show title, subtitle, and thumbnails of the first
  three preview charts, each with its short label.
- **Opening a row closes the open one in the same smooth transition**
  (≈0.5 s, height animated, never a jump). The clicked row's heading stays
  where it was on screen while the row above shrinks.
- **Carousel**: previous/next buttons, one dot per chart, a "2 / 4 · label"
  count, arrow keys when focused, and swipe on touch.
- **Balanced chart selection**, as an editorial rule plus a build check (below).

## Non-goals

- No topic images or photos.
- No labels tying a chart to a viewpoint ("evidence for X"). A chart often
  bears on several viewpoints.
- No new headline prose written for the home page. Slide text comes from
  existing, already-audited content (see [Slide text](#slide-text)).
- No "coming soon" rows for draft topics. Only published topics
  (`content/topics/`) appear, as today. *(Builder's call, made in
  conversation; the owner did not object.)*

## Anti-goals — failure even if it works

- **A carousel that argues one side.** If the previewed charts mostly back
  one or two viewpoints, the page has failed, however good it looks.
- **Charts that break the site's chart rules** in `content/AUTHORING.md` §Charts:
  a time series without years on its x-axis, a series showing only one of its
  readings, a trimmed range, a cherry-picked country subset, or a one-off
  renderer.
- **Layout jumps** when a row opens or closes.
- **A page that needs JavaScript to reach a topic.**

## Chart selection rule

Each topic lists the charts its home-page preview shows, in order, in
`topic.md`:

```yaml
previewCharts:
  - fact: immigration-against-the-long-run
    chart: series
  - fact: how-people-actually-arrive
    chart: arrival-reasons
  - fact: skilled-worker-fiscal-gain-concentrated
    chart: earnings-concentration
  - fact: asylum-claims-in-historical-and-european-context
    chart: asylum-per-person
```

`chart` is `series`, an `additionalSeries` id, or a `comparisons` id — the
same ids the topic page already uses for `#fact-<id>/chart-<chart>` targets.

The rule, in the owner's words, condensed:

1. **The first chart shows the magnitude of the issue** — whether this is a big
   or a small problem — before anything about its nature, irrespective of which
   viewpoint its data helps.
2. **Every viewpoint is represented by at least one chart that is among its
   strongest evidence.** One chart can represent several viewpoints; no extra
   chart is needed when one already serves.
3. **Prefer charts that also give a good overview of the topic**, even over a
   slightly stronger but narrower chart.
4. **Keep the set small** — about four.

What the build checks (add to `lib/content/validate.ts`, and to the table in
AUTHORING.md §What the build enforces):

- `previewCharts` is required and non-empty for every published topic;
- each entry's `fact` exists in the topic and its `chart` resolves on that fact;
- no entry repeats;
- **every viewpoint cites, inline (`#fact-…`), the fact behind at least one
  preview chart.** This is the machine-checkable half of rule 2. Whether the
  chart is among the viewpoint's *strongest* evidence, and rules 1 and 3, stay
  editorial judgement.

Write the rule into `content/AUTHORING.md` as a new subsection under §Charts,
"Home-page preview charts", with the UK selection below as the worked example.

### The UK selections

Main rebuilt UK immigration (and added UK asylum) during this work, so the
selections were redone against the new reports; the current lists, with the
reasoning, are in `content/topics/uk-immigration/topic.md`,
`content/topics/uk-asylum/topic.md` and AUTHORING.md's worked example.

## Charts

Preview charts **must render through the shared `SeriesChart` and
`ComparisonChart` components**, per AUTHORING.md: "do not add a topic-specific
renderer, CSS branch or inline SVG". Add a compact **preview presentation** to
each shared component (a prop, with tests) rather than a new renderer:

- **Series preview**: same layout code (`lib/chart/series-chart.ts`), years on
  the x-axis, every reading drawn (for the long-run fact that is both the
  count and the share-of-population reading — the share reading is what makes
  magnitude legible, the count keeps it honest) in **one slide**; the carousel
  takes the height of its tallest slide so nothing jumps between slides. Drops
  observations. Keeps the publisher credit and the collapsed "About this data"
  disclosure, because notes carry honesty warnings. *(Builder's calls.)*
- **Comparison preview**: full item set (never a subset). For dense charts
  (more than 12 items) a compact form that keeps every item, emphasizes the
  highlighted item and states its rank, as AUTHORING.md allows. Keeps the
  publisher credit and the chart's `note` as a collapsed disclosure (some
  notes are honesty warnings, e.g. `arrival-reasons`: "Shares do not sum to
  100%"). No group controls.
- **Each slide links to the full chart on the topic page**
  (`/topics/<slug>#fact-<id>/chart-<chart>` or whatever the topic page's
  existing chart targets resolve to), where the table view and methodology
  live.
- **Thumbnails** in collapsed rows are decorative previews of the same data
  (`aria-hidden`), drawn from the same layout code at thumbnail size. If the
  shared layout cannot produce a legible thumbnail without a new renderer,
  show the chart's short label only and say so in the PR.

## Slide text

Each slide shows, from existing content only:

- a short label: the fact's `title`;
- a headline: the chart's own `title` (comparison `title`, or series `title`);
- a note: the chart's `description`.

No new prose is written for the home page, so no new figure needs auditing by
`check:figures`. *(Builder's call: the prototype's hand-written headlines,
such as "Arrivals in 2025 equalled 1.2% of the UK's population", are dropped
because they would be unaudited figures.)*

## Behaviour

- **Without JavaScript**: every row's heading is a real link to its topic page.
  The first row is rendered open server-side; its slides are a horizontally
  scrollable, scroll-snapped strip, so every chart is reachable. Collapsed rows
  stay collapsed.
- **With JavaScript**: clicking a collapsed row's heading opens it in place
  instead of navigating (the heading stays a link for middle-click and
  modifier-click). The row is a disclosure: `aria-expanded` on the control,
  focus stays on it. The carousel buttons, dots and arrow keys enhance the
  scroll strip.
- **Reduced motion**: transitions drop to instant under
  `prefers-reduced-motion`.
- **Phones**: rows stack their contents (carousel above the viewpoints);
  thumbnails hide below a sensible width; swipe moves the carousel.
- **Hover**: a collapsed row lifts slightly and its title takes the accent
  colour — the whole row responds, not just the title (the original complaint).

## Visual style

From the approved prototype: a warm off-white page; white rows with a 1 px
border, 16 px radius and real padding; a soft shadow on the open row; modern
sans-serif headings with tight letter-spacing; a serif for subtitles; one blue
accent for charts and links; dark primary button. Viewpoint markers use a
fixed palette by viewpoint `order`.

Fonts: see [Owner decisions](#owner-decisions-29-oct-2026).

The masthead drops to the wordmark alone; the prototype's "Topics / Method /
About" links pointed at pages that do not exist. *(Builder's call.)*

## Testing

Four topics are published, so row switching is tested against real content.

- Unit: `previewCharts` schema and the new validation rules, including a
  viewpoint with no preview chart failing the build; the preview presentation
  props of both chart components.
- E2E (`tests/index.spec.ts`, real content): the first topic is open; its
  carousel moves between charts; the topic link still navigates with
  JavaScript disabled.
- Row switching: opening another row closes the first; the clicked row's top
  stays within a few pixels.
- Visual: before/after screenshots of the home page for the PR.

## Owner feedback on the first build (29 Oct 2026)

- **One chart per slide.** A series with several readings previews one of
  them, named by `reading` in `previewCharts` (UK: `share-of-population`); the
  full chart still draws every reading.
- **The graph takes most of the slide, with just a title at the top.** A
  slide is the chart's title (a link to the full chart) and the plot or bars;
  a line key only where there are several lines, and a single subject's rank
  on a long column strip. Units, the reading's name, the source, descriptions,
  method keys and notes all stay on the full chart.
- **Long charts are clamped to the fixed height**, not given a taller slide:
  over six bars become thin one-line rows; over twelve, with one or no
  highlighted item and no negatives, a sorted column strip.
- **Every chart the same height,** with the carousel about as tall as the
  viewpoint list and report button beside it. Series previews use a short,
  wide `preview` geometry so their type stays readable.
- **Clicking a row's head toggles it**, so a second click closes it and no row
  need be open. Only the title and "Read the full report" open the report.

## Owner decisions (29 Oct 2026)

1. **Fonts change site-wide** to the prototype's: Inter Tight (headings), Inter
   (interface), Source Serif 4 (reading text), replacing Newsreader and IBM Plex
   Sans everywhere so the topic pages match the home page. Fonts can change
   again later, so keep them defined in one place (`app/fonts.ts` and the
   `--font-*` tokens).
2. **About page**: the builder drafts a first `/about` page from the README's
   opening; the owner revises it later. "What is Steelview?" links there.
3. **Topic tags**: each topic carries tags such as `UK`, `USA`, `Voting`,
   shown on its row. They exist so readers can later drill down to other topics
   in the same category; filtering is not built now, so tags render as plain
   labels, not links. New required `tags` field in `topic.md` (at least one).

## Preview selections for the other published topics

Main now publishes three more topics. Builder's editorial picks under the rule
(owner to review in the PR); each viewpoint's inline citations are satisfied:

**The US war with Iran** — tags `USA`, `Foreign policy`
1. `human-and-financial-costs-of-the-war` / `us-deaths-earlier-wars` — magnitude, against Iraq and Afghanistan
2. `iran-nuclear-programme` / `series` — enriched-uranium stock
3. `iran-government-and-its-people` / `ihrngo-executions-series`
4. `decisions-law-and-diplomacy` / `series` — House votes to end the war

**Voting by mail in the US** — tags `USA`, `Voting`
1. `mail-voting-use-and-effects` / `eavs-mode` — magnitude: how ballots were cast
2. `mail-ballot-rejection-and-signature-checks` / `series`
3. `ballot-deadlines-and-counting-speed` / `hours-to-count`
4. `secret-ballot-and-postal-voting-abroad` / `idea-postal-voting`

**Voter ID and citizenship checks in the US** — tags `USA`, `Voting`
1. `non-citizens-on-voter-rolls` / `registrants-found` — magnitude of what the checks target
2. `burdens-of-id-and-citizenship-rules` / `documents-held` — magnitude of who lacks documents
3. `opinion-and-confidence-in-elections` / `series` — support for photo ID by party
4. `voter-id-rules-in-the-us-and-abroad` / `series` — states asking for ID, 1950–2026

**UK immigration** — tags `UK`, `Immigration`; **UK asylum** — tags `UK`, `Asylum`; see above.

## Left to the builder

Component structure, CSS organisation within the existing `globals.css`
conventions, exact animation easing, the thumbnail technique (within the
shared-renderer constraint), and the phone breakpoint.
