# Visualization upgrades for the voter-ID reports

**Summary.** The seven reports use only what renders today: `series` (with
`events`), `additionalSeries`, `comparisons` and markdown tables. Twenty-one
markdown tables and a few bulleted figure lists are stopgaps. This note lists,
for each, the figure kind it should become once the components in the
[fact-report visualizations spec](../../../docs/superpowers/specs/2026-10-29-fact-report-visualizations.md)
(PR #17, branch `bb/fact-visualization-spec-thr_2svsdu69zv`) land, and the
data it needs. Items are ordered by how much the change would improve the
report. Every target keeps the existing observation ids; where a stopgap table
sits inside an observation today, the new figure takes the observation's
group id (`## Observations {#<fact>--observations-<figure id>}`).

The first upgrade for all seven reports comes free with Phase 1: a `figures`
list restores the planned reading order, so tables no longer fall after every
chart (known rendering limit 1 in WORKFLOW stage 5).

## 1. Highest value: reports whose main evidence is a table

### 1.1 `federal-and-state-power-over-voting-rules` — the whole legal record

The report has one chart (`senate-votes`); its substance is three markdown
tables that render last.

| Artifact today | Target kind | Data it needs |
| --- | --- | --- |
| "Federal voting laws and bills, 1965–2026" table (6 rows) | `timeline` (categories: law in force, bill passed House, bill failed in Senate) with a `dataTable` behind it | Already in the table: year or date, measure, effect, status; each row's citation number. The spec's worked example (2.11) is this table. |
| "Key holdings" table (8 rulings) | `dataTable`, sortable by date, cited cells | Case, date, vote, holding, court level; citations per row. A `court` column (Supreme Court / district) would let readers filter merits rulings from stays. |
| "Live federal measures on 23 October 2026" (4 rows) | `dataTable` with a status column; later `periodTimeline` (one row per measure, periods "blocked" / "in force") | Each measure's dated status changes, already in the observations: EO 14248 (enjoined Oct 2025, Jun 2026), EO 14399 (stayed 24 Aug 2026), SAVE (blocked Jun, stayed 25 Sep 2026). |
| SAVE figures table in `save-database-revived` (3 rows) | `keyFigures` (more than 65 million verified; 26 states; 28,635 flagged) with `qualifier: more than` and `asPublished` | Solicitor General quote, already source-cited. |

### 1.2 `election-fraud-and-voter-exclusion-history` — the case table

| Artifact today | Target kind | Data it needs |
| --- | --- | --- |
| `case-table`: 20-row markdown table of cases, methods and outcomes | `dataTable`, sortable by year and by "ID check reaches it?", rows highlighted by method; placed directly under the `case-methods` comparison | Columns already present: case, year, method, ID reaches (Yes / Partly / No / Not known), outcome and its as-of date, citation per row. Add a `method` category column (officials, absentee/mail, vote buying, in-person) so the comparison and table share one coding. |
| `remedies-timeline` bullets | `timeline` (categories: anti-fraud reform, anti-exclusion reform, list-maintenance law) | 1888 and 1896 secret ballot; 6 Aug 1965 VRA; 1966 poll-tax ruling; 1970 literacy-test ban; 1993 NVRA; 2002 HAVA; existing citations. |
| `louisiana-registration-collapse` table (1898 / to 1944 / 1956) | `keyFigures` (three periods), or a `series` with `asPublished` bounds ("never exceeded one percent") once Phase 3 (f) estimated points exist | The three quoted shares and their dates from *Louisiana v. US*. |
| `pre-vra-stagnation` table (three states, two dates) | `comparisons` with groups (earlier / latest) — usable today; or `dataTable` | The six quoted percentages and their years. |
| `modern-result-changing-cases-absentee` table | `dataTable` | Election, margin, finding; citations. |
| `florida-2000-list` table | `compositionBar` (181,157 listed → about 65,776 felons → about 8,000 wrongly added) or `keyFigures` | The four Civil Rights Commission figures already quoted. |

## 2. High value: tables that hide a comparison

### 2.1 `voter-id-rules-in-the-us-and-abroad`

| Artifact today | Target kind | Data it needs |
| --- | --- | --- |
| `us-rules-2026` comparison (counts of states per rule) | categorical `tileMap` (spec 4.1): each state's tile marked by rule (strict photo, non-strict photo, strict non-photo, non-strict non-photo, no document) | NCSL Table 1 classification for all 50 states and D.C. (source 1/2); the counts in the comparison stay as the legend totals. This is the most-asked-for view in the topic and today does not exist. |
| "Polling-place ID in the G7" table (7 rows) | `dataTable` with categorical cells, United States highlighted | Columns already present: must show ID, photo, fallback, since; citations per cell. |
| "Why they adopted ID" table (NI, GB, Canada) | `quoteComparison` (stated reason, in each government's words) beside a small `dataTable` of the fraud record | The three quotes already fetched (sources 25, 27, 32) and the record column. |
| Carter–Baker table (5 rows) | `quoteComparison` (majority recommendation vs. dissent) | Sources 20 and 21 quotes. |
| `ni-after-photo-id` table (4 measures) | `keyFigures` (tendered ballots 55, a 94% reduction; one conviction since 2002; 66% → 28% believing fraud took place) | Commons Library quotes (source 27); the two belief figures are different questions, so show them as two figures, not a change. |
| `dpoc-not-all-in-effect` bullets | categorical `tileMap` for the 13 proof-of-citizenship states (in force / not in force / only when records fail / federal-races-only) | NCSL proof-of-citizenship list (sources 17, 18). |

### 2.2 `voter-roll-maintenance`

| Artifact today | Target kind | Data it needs |
| --- | --- | --- |
| `bulk-errors` table (11 programs) | `dataTable`, sortable by year and flagged count, with cited cells | Already present; add a numeric "flagged" column where the source gives one, so it can sort. |
| `state-removal-rates` comparison (54 bars) | numeric `tileMap` of the states (spec 2.6), keeping the bar chart's Table view | EAVS 2024 removal rate per state (already in the comparison items); territories listed beside the map. |
| `mostly-moves-deaths-nonresponse` table (7 reasons, shares) | `compositionBar` for 2022–24, one bar per cycle if earlier cycles are added | EAC corrected 2024 shares (already quoted); earlier cycles from the `removal-reasons` series. |
| `bloated-roll-claims` table (4 claims) | `claimCheck` per claim (the claim, what it counted, the outcome) | Already present, with citations. |
| ERIC membership changes (in `eric-reports` events) | `periodTimeline` of members by state, 2012–2026 | Join and leave dates per member state (ERIC membership page; NPR for the nine departures). Not yet collected for all states. |
| `nvra-rules` bullets | `caveatList` is the wrong fit; keep as prose | — |

### 2.3 `non-citizens-on-voter-rolls`

| Artifact today | Target kind | Data it needs |
| --- | --- | --- |
| `both-errors-side-by-side` table | `dataTable` with two numeric columns, or a grouped `comparisons` (ineligible found vs. citizens wrongly flagged) | Texas 117 / 578; Denton 14 / 14 (+56 unknown); Alabama at least 159 / about 2,000 — with `qualifier` for the bounds. |
| `some-noncitizens-vote` table (6 multi-election counts) | `dataTable` with a "kind of count" column (found / referred) | Already present. |
| `texas-save-reversals` dated bullets | `timeline` (Oct 2025 flags → Dec 2025 Denton → Jul 2026 director → Sep 2026 state count) | Already present, with citations. |
| `save-national-unaudited` bullets | `keyFigures` shared with R7 (one data definition via `featuredCharts` or a shared fact) | Solicitor General figures. |
| `registrants-found`, `votes-found` per-million comparisons | keep `comparisons`; add `valuesFrom` (spec 3.7) naming each numerator and denominator so the audit can check the derivation | Inputs already in the chart notes. |

## 3. Medium value: estimates that need ranges

### 3.1 `burdens-of-id-and-citizenship-rules`

| Artifact today | Target kind | Data it needs |
| --- | --- | --- |
| `turnout-overall` and `turnout-by-group` comparisons (point estimates) | `estimateRange`, grouped by study (Cantoni & Pons national; GAO Kansas; GAO Tennessee) | Each estimate's 95% interval. Cantoni & Pons publish intervals; GAO's report gives significance but its intervals need to be read from its appendix. This would show at a glance why `burden-without-turnout-effect` holds. |
| Kansas Richman table (2.2%, margin 2.7%) | `estimateRange` (one estimate whose range crosses zero) | Already quoted from the Tenth Circuit. |
| `georgia-few-problems-2022` bullets | `keyFigures` (1.1% problem casting; 75% waited ten minutes or less; 72% excellent, up from 55%) | UGA SPIA survey figures as quoted. |
| `documents-held` comparison | `compositionBar` (has current licence / outdated licence / other photo ID only / no photo ID) | The CDCE survey shares; needs the "other photo ID only" share, which the survey publishes. |

### 3.2 `opinion-and-confidence-in-elections`

| Artifact today | Target kind | Data it needs |
| --- | --- | --- |
| "Studies of whether ID rules change confidence" table (4 studies) | `estimateRange` for the three studies with an estimate (Milyo +14 points; Stewart et al. and Cantoni & Pons near zero), plus `dataTable` for design | Each study's estimate and interval; Stewart et al. and Clinton report effects in different units, so they may stay in the table only. |
| `photo-id-across-races` table (mixed Gallup 2024 / Pew 2021) | two `comparisons` (one per pollster and year), usable today | Already present; splitting stops two surveys sharing one axis. |
| Many Pew and Gallup series with few points | keep `series`; Phase 2's collapsible event key (3.1) and axis-label fix (3.3) | — |

## 4. Fixes from Phase 2 that every report needs

- **Collapsible event key (3.1):** R1's ID-law chart has five events and the
  photo split six; R6's Gallup accuracy chart four. The open key is the text
  the markers were meant to replace.
- **Readable markdown tables (3.2):** until each table above is converted,
  the 20-row case table and the 11-row bulk-errors table overflow at 390px.
- **Grouped-table header (3.5):** R5's `case-methods` and R2's
  `licence-by-group` tables print "Country" as the row header; set
  `itemLabel` to "Case" and "Group".
- **Chart-value audit (3.7):** add `valuesFrom` to every comparison whose
  values are derived (R3's per-million charts, R4's state rates), so the
  audit run by hand at stage 5 becomes repeatable.
