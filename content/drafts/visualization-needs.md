# Visualization needs across the trial topics

**Summary.** The three trial topics — US voter ID (built), US vote by mail and
the US war with Iran (researched and planned) — need three kinds of change
before their reports can be written well:

1. **Wiring.** A fact file can use only `SeriesChart`, `ComparisonChart` and
   the `EventStrip` under a series. Most of what the plans need already
   exists in the component library but cannot be reached from content.
2. **Fixes** to the components already in use, found while reading the
   voter-ID reports rendered.
3. **Six genuinely new capabilities** no component provides.

Details per report are in each topic's `candidate-data.md` under
*Visualization plan* ([vote by mail](us-vote-by-mail/candidate-data.md),
[Iran](us-iran-war/candidate-data.md)) and in the built
[voter-ID reports](../topics/us-voter-id/facts/).

---

## 1. Library components to wire into fact content

Ordered by how many reports across the three topics would use them.

| Component | Voter ID | Vote by mail | Iran | What it would carry |
| --- | --- | --- | --- | --- |
| **DataTable** | case table, country rules, error events, legal record | case records, state rules, survey quality, disputes | crackdown counts, studies, votes, inspections | Every report. Markdown tables are the stopgap today, and they render badly (see 2) |
| **KeyFigures** | headline counts in each overview | audit re-check, cure counts, IDEA counts | displacement, costs, base rates | The overview's numbers, so the overview itself can be prose-free of statistics |
| **Timeline / PeriodTimeline** | federal laws and orders, court record | case record, secret-ballot adoption, federal record | ceasefire and blockade periods, programme phases | Dated records that are not a series |
| **TileMap (US states)** | ID rule by state | mail share, rejection rate, receipt window by state | — | Needs a categorical mode for rules (see 3) |
| **QuoteComparison / PullQuote / QuoteBrowser** | — | courts on signatures; *Watson*; Carter–Baker | official statements, allied statements | What institutions said, side by side |
| **EstimateRange** | — | turnout and partisan effects | breakout estimates, costs, Iraq prewar estimates | Studies or estimates that disagree |
| **CompositionBar** | — | state rule mix per cycle | deaths by category per counter; GAMAAN preferences | Shares of a whole |
| **ClaimCheck** | — | Rasmussen–Heartland | — | A well-known claim set against what it measured |
| **SliceExplorer / SmallMultiples** | — | — | votes and polls by party; chokepoints | Many small slices |
| **GeoMap (world)** | — | IDEA postal voting by country | — | Needs the categorical mode |

**Recommendation.** Rather than wiring each component one by one, add one
generic `figures` list to the fact schema — each entry a typed union naming
the component and its props, with sources as citation numbers — rendered in
the order written. That also fixes the reading-order problem in 2, because
tables, timelines and charts would interleave as the author places them.

## 2. Fixes to components already in use

| Problem | Where it shows | Suggested fix |
| --- | --- | --- |
| **EventStrip's key is always expanded.** Five events under one chart make a 15-line block — the text block the markers were meant to replace | Voter ID R1's ID-law chart; R6's confidence charts | Render each key item as a collapsed expando (as Observations and Method Changes are), opened when its number is clicked |
| **Markdown tables render poorly.** Header cells run together ("20202022"); four-column tables wrap heavily and overflow sideways at 390px | Voter ID R2, R3, R5 | Style `.sv-prose table`, or replace with DataTable via 1 |
| **Body tables and text always render after every chart**, and series always before comparisons, so a planned reading order cannot be kept | All reports | The generic `figures` list in 1 |
| **Axis labels collide on narrow screens** ("2020" over "2026") | Voter ID R1's ID-law chart at 390px | Drop the second-last tick when it is within a label's width of the last |
| **The axis caption lowercases the period label**, breaking acronyms ("by year of ncsl count", "by november general election") | Every series chart | Use the label as written |
| **Grouped comparison tables hard-code the header "Country"** | Voter ID R5's case-methods chart | Use the chart's `groupLabel` |
| **`check:figures` misses chart values.** It audits prose only; one wrong value and one chart of unpublished levels were found by hand | All reports | Check `series` points and `comparisons` items against the chart's own source, and require a named table or a derivation for values not quoted |
| **`check:figures` treats "1.4%" and "1.4 percent" as different figures**, and accepts a figure quoted anywhere on the topic | All reports | Normalise percent forms; match against the report's own sources |

## 3. New capabilities

| Capability | Needed for | What it shows | Why no component fits |
| --- | --- | --- | --- |
| **Categorical map mode** (TileMap and GeoMap) | Voter-ID rule by state; mail verification rule by state; IDEA postal voting by country | A category per area, each with a pattern or label as well as a colour, and a table listing areas by category | Maps take a number per area on a sequential or diverging ramp; coding rules as numbers implies a false order |
| **Scatter plot** with a label per point | Mail-ballot processing lead time against hours to count, by state; mail share against rejection rate | Two measures per area, with a table view | No component plots two quantities against each other |
| **Focus window on a full-range series** | Daily Brent oil price since 1987 | The full declared range as a small context strip, with a readable window (default: the last year) | The 2026 shock is under 3% of the width at full range, and trimming the series breaks the full-range rule |
| **Per-line coverage** within one series | Brent (1987–) beside WTI (1986–); two execution counters (2008– and 1981–) | Comparable measures on one axis when sources start in different years | The validator requires every line to span the same coverage |
| **"Not measured since" band** | Iran's enriched uranium, unverified since June 2025 | A hatched span from the last point to today, with its reason | A break marks a change mid-series, and an event marks a date, not a span |
| **Forecast or provisional points** | EIA price files that mix history with estimates | Estimated or forecast points drawn dashed and labelled in the table | Today those points can only be dropped |
