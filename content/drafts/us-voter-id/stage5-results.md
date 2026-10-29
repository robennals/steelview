# Stage 5 results: voter-ID reports

What each report builder returned: observation ids by viewpoint (for stage 6
pills), what was dropped or unverified, blocked sources, and glossary terms
wanted. Link observations as `#fact-<report-id>/<observation-id>`.

## R7 `federal-and-state-power-over-voting-rules`

Status `well-supported`. 43 quotes fetched with curl and script-checked against source text.

- **`states-decide`:** `elections-clause-text` (Clause names state legislatures and Congress, not the President); `not-who-may-vote` (*ITCA*: who may vote is for states); `eo-14248-blocked` (two courts permanently blocked the 2025 order's proof-of-citizenship section); `state-rules-vary` (ID states 13 → 34 → 36; 13 with proof-of-citizenship laws); `national-bills-stalled` (both parties' national bills short of 60 Senate votes).
- **`prove-identity`:** `congress-power-paramount`; `hava-id-rule` (HAVA requires ID from first-time mail registrants); `house-passed-save-america-act` (three times); `crawford-upheld-photo-id` (6–3).
- **`turned-away`:** `crawford-record` (no impersonation in Indiana's record; ~43,000 lacked ID; the dissent); `federal-form-sworn-citizenship`.
- **`id-plus-access`:** `freedom-to-vote-act-provisions`.
- **`clean-rolls`, against `states-decide`:** `save-database-revived` (65M checked, 28,635 flagged, government figures; no error rate).
- **Against `states-decide`:** `eo-14399-allowed`, `congress-has-set-national-floors`.
- **All:** `no-merits-ruling`, `save-america-act-status`, `moore-state-courts`.
- **Subtleties:** `no-time-series`, `two-orders-two-outcomes`, `crawford-was-facial`, `itca-left-open`.
- **Dropped:** White House 31 Aug statement; *LULAC* "no direct role" quote (opinion not found); 2021 cloture tally; *USPS v. California* (mail topic). No time series — R1 carries the ID-law counts.
- **Blocked:** senate.gov and congress.gov (the 52–46 vote rests on an advocacy outlet citing The Hill); clerk.house.gov; CourtListener.
- **Glossary wanted:** Elections Clause; cloture/filibuster; documentary proof of citizenship; federal form (NVRA); SAVE database; facial challenge; Purcell principle.
- **Workflow notes:** AUTHORING doesn't say whether body-only markdown tables count as artifacts; observation groups not tied to a chart need the literal heading "Observations" to render as expandos.

## R3 `non-citizens-on-voter-rolls`

Status `well-supported`. 27 sources, script-checked against curl text (one court quote broken by a page number). Five comparisons: `registrants-found`, `votes-found`, `flags-reversed`, `against-margins`, `ohio-referrals`. No series; body says why.

- **`prove-identity`:** `found-on-rolls`; `some-noncitizens-vote`; `ohio-recurs` (every batch since 2019); `detected-is-a-floor`; `close-local-races`; `how-noncitizens-reach-rolls` (mostly paperwork errors).
- **`turned-away`:** `hundredths-of-a-percent` (≤ ~130 per million registrants); `votes-per-ballots` (~1–22 per million ballots); `kansas-court-findings` (≤39 on rolls vs 31,089 blocked); `flag-lists-shrink`; `alabama-2024`; `texas-save-reversals` (578 of 2,724 Texas flags shown citizens; 117 referred); `virginia-2024`; `texas-2019`; `below-margins`; `referrals-not-convictions`.
- **`clean-rolls`:** `full-roll-check-feasible`; against: `save-national-unaudited`, `state-records-would-have-cleared`, `iowa-flags`.
- **X2 crux:** `both-errors-side-by-side`. **Context:** `ohio-scale`.
- **Corrections to the outline:** Iowa's 277 came from a separate check, not from the 2,176 flags — the "277 of 2,176" framing in `turned-away` is wrong. Texas: a 15 Sep 2026 release gives 578 of 2,724 statewide; the Denton County "only data" note is outdated. Georgia 2022 figure dropped (site 403).
- **Blocked:** sos.ga.gov, ohiosos.gov, sos.iowa.gov, the Alabama injunction, the full AJC article.
- **Crux:** size of undetected non-citizen registration (existing assumption crux); in `dataStillNeeded`.
- **Glossary wanted:** SAVE, list maintenance, NVRA 90-day rule.
- **Workflow note:** where "About this data" goes for comparison-only facts (put as an h2 at the end).

## R6 `opinion-and-confidence-in-elections`

Status `well-supported`. check:figures clean for this file.

- **`prove-identity`:** `photo-id-majorities` (83–84%, most Democrats); `photo-id-across-races` (≥7 in 10 in every group); `proof-of-citizenship-support` (83%, 2024 only); `milyo-finds-effect` (strict ID +14 pts high confidence, one study); `eligibility-confidence-2026`.
- **`id-plus-access`:** `democrats-moved-toward-id`; `republicans-moved-toward-early-voting`; `gallup-policy-trend`; `shared-goals` (90% / 85%); `procedures-they-oppose` (Clinton); `global-winner-gap`.
- **`turned-away`:** `studies-find-no-effect` (Stewart et al.; Cantoni & Pons); `georgia-rebound`; `sb202-self-reported`; `access-measures-divide-more`; `different-fears`.
- **Against `id-plus-access`:** `overlap-not-published`; `confidence-follows-power`; `exceptions-2008-2020`; `post-election-winner-swing`; `no-gap-2026`; `approval-gap-by-administration`.
- **Against `turned-away`:** `democrats-moved-toward-id`.
- **Context:** `level-versus-not-at-all` ("not at all confident" 6% → 19%); `honesty-long-run` (avg 45% since 2006); `mail-versus-in-person`; `expert-ratings`.
- **Dropped/changed:** two unlabelled Pew/SPAE points omitted; Pew's July 2026 Democratic figure is 58 in text, 54 in chart — 58 used, noted; Pew mode series replaces SPAE; Clinton abstract via a secondary site.
- **Blocked:** electionlawblog (Clinton); Endres & Panagopoulos PDF.
- **Crux candidate:** does strict ID raise confidence net of who won? (Milyo rests on few state changes.) Decisive for `prove-identity`'s confidence argument vs `turned-away`.
- **Glossary wanted:** winner effect; partisan leaners.

## R2 `burdens-of-id-and-citizenship-rules`

Status `well-supported`.

- **`turned-away`:** `kansas-blocked-vs-noncitizens` (31,089 vs ≤39); `texas-still-above-baseline` (3.4% / ~3.5% vs 1.2–1.5% nationally); `texas-march-2022-spike` (12.38%); `rejected-texans-did-not-vote` (~90%); `gao-larger-drops-young-new-black`; `gao-kansas-tennessee`; `dpoc-not-readily-available` (21.3M); `dpoc-by-group`; `no-licence-by-race-party`; `licence-by-age-income`; `arizona-218000`; `gb-non-voters-cite-id` (4%); `mobilisation-may-offset`; `georgia-gap-widened-2022`.
- **`prove-identity`:** `national-panel-no-turnout-effect`; `no-id-versus-outdated-id` (2.6M none vs 28.6M outdated licence); `why-no-licence`; `kansas-noncitizens-not-zero`; `arizona-eight-noncitizens`; `georgia-few-problems-2022`; `gb-turnaways-small`; `texas-rate-fell-after-primary`.
- **`id-plus-access`:** `georgia-rejections-near-national`; `two-states-opposite`; `national-panel-no-turnout-effect`.
- **Against `turned-away`:** `georgia-gap-predates-sb202`; `georgia-2024-turnout`; `texas-rate-fell-after-primary`; `kansas-dpoc-possession-unknown`.
- **Against `prove-identity` and `id-plus-access`:** `no-effect-on-fraud`; `texas-still-above-baseline`.
- **Cruxes X2/X3:** `burden-without-turnout-effect` (GAO's two-state estimates sit inside the national study's confidence interval).
- **Notes:** `who-ran-the-survey`, `2006-survey-not-comparable`, `texas-2018-denominator`.
- **Corrections to the outline:** Georgia's mail-rejection rate *fell* after SB 202 (2016 ~6.4%, 2018 3.1% of returned ballots), not "stayed near the national rate". Texas 2018 baseline is 1.76% of returned ballots (NPR's 1.5% used ballots sent). Texas March 2022 rejections 24,636 (state figure), replacing AP's "nearly 23,000".
- **Reached only via archive or reprint:** GAO (access denied), CDCE PDF (TLS), Electoral Commission (WiredGov reprint), Tenth Circuit opinion (404). Not fetched: 2018 district-court opinion (quoted via the Tenth Circuit), the *JOP* paper (Votebeat account), Brennan's Texas-by-race study.
- **Crux candidates:** (1) were Kansas's blocked applicants unable to get documents or did they not finish? — decides `turned-away`'s strongest number; (2) how would national proof-of-citizenship rules change registration and turnout? (prediction; SAVE America Act).
- **Glossary wanted:** documentary proof of citizenship, strict ID law, ballot curing, EAVS, difference-in-differences, citizen voting-age population.
- **Product issues found (code, not content):** time series always render before snapshot charts, so a plan's reading order can't be followed; no way to mark a policy date on a series (`breaks` is only for method changes); check:figures matches "1.4 percent" in a quote only to "1.4 percent" in prose, not "1.4%"; check:figures passes a figure quoted anywhere on the topic, not in the file's own sources; grouped comparison tables hard-code the header "Country".

## R4 `voter-roll-maintenance`

Status `well-supported`. Quotes script-checked (only page/footnote breaks). Artifacts: EAVS removals 2004–2024 (count and share); removals by reason 2006–2024 (four lines summing to total); ERIC reports 2013–2026; state removal rates 2022–24; confirmation-notice outcomes; Ohio 2012 notice replies (*Husted*); Pew 2011 baseline; NVRA rules; table of 11 bulk-removal error events; table of bloated-roll claims.

- **`clean-rolls`:** `removals-21-million`; `mostly-moves-deaths-nonresponse`; `eric-cross-state-movers`; `pew-only-direct-measure` (dated 2011); `nvra-90-day-rule`; `state-range`.
- **`prove-identity`:** `lists-contain-ineligible`; `removals-trend`; `litigation-driven-removals` (5M after Judicial Watch suits).
- **`turned-away`:** `bulk-matching-errs`; `ohio-notice-replies`; `florida-2000-list`; `save-flags-citizens`; `virginia-2024-stay`.
- **`states-decide`:** `state-range`; `virginia-2024-stay`.
- **Against `clean-rolls`:** `nonresponse-largest`; `eric-departures`; `eric-reports-fell`; `notices-mostly-unreturned`.
- **Against `prove-identity`:** `pew-not-fraud`; `bloated-claims-count-inactive`.
- **Against `turned-away`:** `purge-totals-mostly-lawful`; `husted-ruling`; Thernstrom's reading inside `florida-2000-list`.
- **Dropped/unverified:** Ohio 2019 "40,000 wrongly included" (search summary only); Becker "no evidence" → NPR "little evidence"; Florida 2012 counts (not in *Arcia*); Alabama 93.8% quoted but kept out of prose (conflicts with ~2,000 citizens); NC 97.6% only via an advocacy brief; ERIC departure order from Wikipedia; 2002–04 reasons (scanned). Texas SAVE row updated to 578 of 2,724 to match R3.
- **Blocked:** DOJ Oct 2017 NYC settlement release; Alabama Reflector; Stateline; Judge Manasco's Alabama opinion; 4th Cir. *PILF v. NCSBE*; EAC 2003–04 NVRA tables (OCR).
- **Crux candidate:** share of removed registrants (especially non-responders) who were still eligible — decides X2 between `turned-away` and `clean-rolls`.
- **Glossary wanted:** NVRA, EAVS, confirmation notice, inactive registrant, list maintenance, ERIC, SAVE.
- **Product issues:** non-chart body sections render after every chart, breaking planned order; check:figures treats "31.1%" and "31.1 percent" as different; `$TMPDIR` differs when the sandbox is disabled.

## R1 `voter-id-rules-in-the-us-and-abroad`

Status `well-supported`. Comparator set: the G7, each member's rule checked against its own law. US series stitched from NCSL's two histories plus archived NCSL pages each election autumn, 1950–2026 (uneven points; NCSL gives 13 and 14 for 2000 — 13 used, noted).

- **`prove-identity`:** `us-36-states-up-from-13`; `shift-to-photo`; `dpoc-surge`; `photo-id-common-in-g7`; `northern-ireland-after-personation`; `ni-after-photo-id` (tendered ballots −94%, no fall in turnout); `britain-turnaways-small-and-falling` (0.25% → 0.08%); `britain-confidence-and-personation`.
- **`turned-away`:** `britain-awareness-gaps` (71% young, 76% ethnic-minority, 87% overall); `britain-turnaways-undercount` (4% of non-voters cited the rule); `state-supplies-id`; `ni-register-fell`; `carter-baker-split`.
- **`id-plus-access`:** `carter-baker-bargain`; `strict-states-early-voting`; `strict-states-exceptions`; `canada-vouching`; `fallbacks-abroad`.
- **`states-decide`:** `rules-vary-widely`; `dpoc-not-all-in-effect`; `courts-blocked-laws`; `early-adopters`.
- **Against `prove-identity`:** `britain-precaution-not-fraud` (five convictions since 2016); `canada-no-fraud-rationale`; `germany-japan-no-routine-check`; `ni-personation-unquantified`; `require-versus-adopted-after-fraud`; `turnaways-are-not-fraud-stopped`.
- **Against `id-plus-access`:** `strict-states-without-early-voting`; `carter-baker-split`.
- **Context:** `pace-of-adoption`; `strict-count-fell-then-rose`; `canada-nonvoters`; `two-counts-for-2000`; `country-counts-depend-on-definition`.
- **Dropped/replaced:** Britain "1 personation conviction in 2019" → Commons Library "five convictions and six cautions since 2016"; NI "949 turned away in 1983" not found (Commons Library: 149 arrests); Canada 120,000 vouched (Wikipedia only).
- **Blocked:** Electoral Commission site (used Commons Library and a WiredGov reprint); Barton (2022) dataset article; Elections Canada; Britain's May 2024/2025 turnaway figures.
- **Crux candidates:** none.
- **Glossary wanted:** strict ID law, provisional ballot, documentary proof of citizenship, personation, vouching, Voter Authority Certificate, tendered ballot.
- **Note:** categorical comparisons have no chart shape; markdown tables with `## Observations {#…--observations-<slug>}` used.

## R5 `election-fraud-and-voter-exclusion-history`

Status `well-supported`. **Headline answer to the human's question:** of 20 cases with method from a court or prosecution record — 8 by officials, 6 absentee/mail, 2 vote buying, 2 in-person impersonation or repeat voting, 2 method not confirmed. A polling-place ID check would have reached 2, partly reached 2 (Chicago 1982, Kansas City 1936 — the judges who would check ID were taking part), and missed 14.

- **`prove-identity`:** `machine-fraud-real-and-prosecuted` (259 Kansas City convictions; 58 Chicago by 1985); `in-person-ghost-voting` (Tammany repeaters, Chicago ghost voters, one confirmed 2004 Washington case); `carter-baker-id-deters`; `illinois-1960`.
- **`turned-away`:** `louisiana-registration-collapse`; `pre-vra-stagnation`; `florida-2000-list`; `georgia-exact-match`; `impersonation-rare-modern`; `heritage-impersonation-small`.
- **`clean-rolls`:** `stale-rolls-enabled-fraud` (dead and moved names were what Chicago's fraud used); `florida-2000-list`.
- **Against `prove-identity`:** `officials-did-the-fraud`; `caught-by-prosecutors`; `id-would-not-reach`; `checkers-complicit`; `modern-result-changing-cases-absentee`; `indiana-no-impersonation`; `heritage-impersonation-mail` (16 of Heritage's 34 "impersonation" entries involve mail ballots); `kansas-city-no-repeaters`; `chicago-1982-margin`.
- **Against `turned-away`:** `florida-counter-reading`; `jim-crow-tools-discretionary`; `certification-refusals` (all forced to certify); `registration-gap-closed`.
- **Shared:** `case-table` (artifact 7); `remedies-timeline`; `northern-ireland-comparator`; `detected-is-a-floor`; `no-common-measure` (crux).
- **Dropped:** Louisiana 130,334 → 5,320 (no primary; replaced by *Louisiana v. US*: 44% of registrants Black in 1898, under 1% 1921–44); Chicago "100,000 fraudulent votes" (no source); Kansas City "278 defendants" (secondary only); Box 13 and Illinois 1960 marked method not confirmed; *Cartello* excluded (reversed); Wayne County 2020 and Georgia State Election Board omitted.
- **Blocked:** Chicago 1982 grand jury report (used 7th Cir. *Olinger*, *Howard*, *Kasper*); *Missouri Waltz*; 1961 Wexler report; USCCR 1968 tables; Heritage site (counted from its data file via Wayback).
- **Crux candidate:** size of undetected impersonation (existing assumption crux).
- **Glossary wanted:** absentee ballot, precinct captain, election judge, preclearance.
- **Notes:** check:figures misses a percent the source prints without "%"; no rule for where body tables go (put inside an observation).
