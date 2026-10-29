# US vote by mail — candidate data

Stage 3 output, researched 2026-10-23, ten days before the 3 November 2026 midterms. Divided on 2026-10-23 from the combined [US voting rules candidate data](../us-voting-rules/candidate-data.md), with this topic's report plan (3c, [stage 4b](../../WORKFLOW.md#4b-plan-the-combined-reports)) added. The outline is [outline.md](outline.md) (draft 3; being revised against the evidence in parallel, so 3c may need adjusting to the revised arguments).

> **Deep research, 2026-10-26.** Every candidate a viewpoint or planned observation uses was checked at source. Results are at the end of this file: [Stage 4 verification](#stage-4-verification-2026-10-26), [Viewpoint grounding](#viewpoint-grounding), [Visualization plan](#visualization-plan), [Visualizations needed](#visualizations-needed). The verbatim quotes are in four working files beside this one: [verify-privacy.md](verify-privacy.md) (D65, D70–D73), [verify-signatures.md](verify-signatures.md) (D66–D69, R1 candidates), [verify-international-deadlines.md](verify-international-deadlines.md) (D61–D64, R3 candidates) and [verify-confidence-federal-fraud.md](verify-confidence-federal-fraud.md) (R7, R6, R4, D56, new D76). The 3b entries above are left as stage 3 wrote them; where they differ from the verification, the verification wins.

- **How the file was divided.** Every question and candidate in the combined file was tagged **[ID]** (`us-voter-id`), **[MAIL]** (`us-vote-by-mail`) or **[BOTH]**. This file holds the [MAIL] and [BOTH] items. [BOTH] candidates are copied into the [voter-ID file](../us-voter-id/candidate-data.md) as well, identical except that viewpoint labels use each file's ids, so a correction to one must be made in both.
- **Candidate numbers are the combined file's** (D1–D69), so cross-references hold. Gaps in the numbering are ID-only candidates.
- **Retagged in the split** (for the human to confirm; see 3d):
  - **D1, D25, D51, D52, D56: [MAIL] → [BOTH],** because the voter-ID topic's rejection and history questions need them.
  - **D48: [ID] → [BOTH],** because this topic's history report (R4) sets the in-person machine record beside the absentee cases, as M1a's context asks.
- **Viewpoint ids.** The split outline's viewpoints, with their draft-3 numbers:

  | Id | Draft-3 no. | Title |
  |---|---|---|
  | `mail-exception` | MAIL1 | Mail voting should be the exception, as it is in most democracies |
  | `mail-works` | MAIL2 | Voting by mail works, and the states that use it prove it |
  | `signature-discretion` | MAIL3 | Signature checks let officials throw out valid ballots on a judgement call |
  | `election-day-receipt` | MAIL4 | Ballots should be in by Election Day, and counted fast |
  | `states-decide` | MAIL5 | Mail-voting rules belong to the states, and presidents have no say in them |

  The voter-ID topic's viewpoints are written with an `id/` prefix, e.g. `id/turned-away`. Draft 2's numbers map as V3→`election-day-receipt`, V4→`mail-works`, V6→`states-decide`; `mail-exception` and `signature-discretion` are new in the split. In candidate entries copied from the voter-ID side, `states-decide` covers both topics' viewpoint of that name.
- **Crux labels** used in some entries are the voter-ID topic's: X1, should Congress set one national standard? (it applies here to receipt deadlines and mail rules too); X2, rejected eligible voter vs ineligible vote counted; X3, burden without a turnout effect.
- **How figures are marked:**
  - **(read)**: seen on a page that was actually fetched, at the URL given.
  - **(read, PDF)**: read from the text or page images of a fetched PDF.
  - **(read, secondary)**: read on a fetched page that is itself secondary (Wikipedia, journalism), with the primary not reached.
  - ***unverified***: seen only in search-result summaries, or not checked.
- **What "read" means here:** fetched pages were summarised by a model, so stage 4 must still quote every figure from the source.
- **"As of"** is the date of the release or of the period the figure describes, given beside each figure or in the candidate's **As of** line.

---

## Current state of the federal fights (as of 2026-10-23)

- **SAVE America Act** (national photo ID, documentary proof of citizenship at registration, and per coverage an end to universal mail voting): passed the House on 10 Apr 2025, on 11 Feb 2026 (218–213), and again attached to FY27 appropriations and NDAA bills in July 2026. It is stalled in the Senate by the filibuster. On 31 Aug the White House said passage was likely only after the midterms, in a lame-duck session or via reconciliation. *unverified* (press coverage only)
- **EO 14399 (31 Mar 2026):** creates DHS/SSA "State Citizenship Lists" and a USPS mail-ballot rule.
  - **24 Aug 2026, *Trump v. California*, No. 26A124:** SCOTUS stayed the injunction against the order itself, calling it "an internal directive" that "neither requires nor forbids anything of anyone outside the Executive Branch", with the states' claims likely unripe (read, https://www.supremecourt.gov/opinions/25pdf/26a124_hgci.pdf).
  - **USPS Final Rule** (barcoded official envelopes) was then enjoined on 4 Sep; on **14 Sep, *USPS v. California*, No. 26A305**, SCOTUS refused to stay that injunction. Kavanaugh concurred on timing; Alito and Thomas dissented, saying Congress "may create such rules under the Elections Clause" and may delegate them (read, https://www.supremecourt.gov/opinions/25pdf/26a305_4g15.pdf).
  - Result: the USPS rule will not apply in November 2026; the order itself is not enjoined.
- ***Watson v. RNC*** (29 Jun 2026, 5–4, Barrett): federal Election-Day statutes do not bar counting ballots postmarked by Election Day that arrive later. Policy arguments "are properly directed to legislatures, not courts" (read, https://www.supremecourt.gov/opinions/25pdf/609us2r65_g314.pdf).
- The registration-side fights (EO 14248's proof-of-citizenship section, the SAVE database) are in the voter-ID file.

---

## 3a. Question index

One row per empirical question in the outline, in outline order. **Answers it** lists candidates that address the question itself; **Context** lists those that supply what the outline says must sit beside the answer, tagged by kind: *run* (longer run), *comp* (comparators), *denom* (denominator or base rate), *record* (rest of the record), *cf* (counterfactual). The **Report** column gives the 3c report that will answer it.

| # | Question | Viewpoints | Answers it | Context | Likely status, and how to narrow it | Report |
|---|---|---|---|---|---|---|
| M1a | What is the documented history of mail and absentee fraud, in the US and abroad? | `mail-exception`, `mail-works` | D25, D51, D52, D62, D13, D38 | *denom:* D1, D3 (mail ballots cast). *record:* in-person cases over the same years (D48, D50); remedies after each case (D62: UK 2006 and 2022 Acts; D25). *comp:* D62 (UK), D61 (France), D64 (Germany, Switzerland). | Well-supported that organised absentee fraud has changed results (NC-09, East Chicago, Birmingham). Paterson: a new election, no convictions. No rate by method. | R4, R5 |
| M1b | Why did the secret ballot emerge, and what happened to vote-buying and intimidation after it? | `mail-exception`, `mail-works` | D56 | *run:* D56 (Australia 1856, Britain 1872, US 1884–1891, South Carolina 1950). *cf:* D56 (Baland & Robinson, Chile 1958). Heckelman and Kam on turnout and bribery: not read. | Well-supported for motives; effects evidence is thin and about polling-place secrecy, not mail. | R5 |
| M1c | How do other democracies handle remote voting, and why did those that restricted it do so? | `mail-exception`, `mail-works` | D63, D61, D62, D64 | *comp:* D63 (IDEA full set; counts not extracted). *record:* D64 (Germany 4.9% in 1957 → 47.3% in 2021 → 37.0% in 2025; Switzerland over 90%). | Unknown until IDEA counts are extracted. "France abolished it over fraud" is complicated: reasons conflict (D61). | R5 |
| M1d | How many mail voters report someone else filling in or pressuring their ballot, by surveys of what quality? | `mail-exception`, `mail-works` | D65 | *record:* D65 (wording, about 325 mail-voter subsample, critiques). Other surveys: not found. | Not-supported as a fraud rate: an opt-in survey whose questions mix legal help with fraud. | R4 |
| M2a | How has the share of votes cast by mail changed since 2000, and who uses it? | `mail-works`, `election-day-receipt` | D1, D3, D2, D26 | *run:* D3 (1996–2024), D1. *record:* D2, D3, D26 (age, party, disability). | Well-supported. | R1 |
| M2b | What is the effect of universal mail voting on turnout and on each party's vote share? | `mail-works`, `election-day-receipt` | D10, D27 | *comp:* other reforms (not gathered). *run:* pre/post 2020. | Well-supported for pre-2020. | R1 |
| M2c | How do rejection and cure rates compare between all-mail states and others? | `mail-works`, `signature-discretion` | D1, D66 | *run:* D1. *record:* D1 reasons. | Well-supported: "not significantly different" (EAVS 2024). | R2 |
| M3a | How many mail ballots are rejected for signature reasons, by state, county and voter group? | `signature-discretion`, `mail-exception`, `mail-works` | D66, D1 | *run:* D1 (2024 read; earlier cycles needed). *comp:* D66 (Washington counties 4–7x apart after controls). *record:* D67 (cure-required states). | Well-supported: signatures are the largest reason (40.7% in 2024) and rates differ by group and county. | R2 |
| M3b | What standards, training and appeal rights govern signature matching, and what have courts said? | `signature-discretion` | D67, D68 | *cf:* D67 (6 states use ID numbers instead), D31 (their rejection rates). | Well-supported as a record. | R2 |
| M3c | Has signature review ever been used to change a result? | `signature-discretion`, `mail-exception` | D69 | *record:* D55 (officials manipulating which ballots count). | No case found (search incomplete). Cobb County 2020 audit found no fraudulent ballots. | R2, R4 |
| M4a | Which states count late-arriving ballots, and how many arrive late? | `election-day-receipt`, `mail-works`, `states-decide` | D5, D44, D23 | *run:* D44 (13 → 21 → 15 states). *denom:* D23. *record:* D44 (2026 late rejections). Military and overseas: D5. | Well-supported for rules; per-state counts patchy. | R3 |
| M4b | How long do states take to count, and what explains the differences? | `election-day-receipt`, `mail-works` | D22, D43 | *comp:* D43 (pre-processing rules), D1 (mail share). | Well-supported for 2024 descriptives. | R3 |
| M5a | What federal bills and orders on mail voting are live, and what has happened to each? | `states-decide` | D24 | *record:* D45, D46. | Well-supported as a dated record. | R6 |
| M5b | How much do state mail-voting rules vary, and how has that changed since 2000? | `states-decide` | D47, D6, D44 | *run:* D47 (no-excuse 30 → 37 states, 2016–2026); pre-2016 not found. | Well-supported from 2016. | R1, R6 |
| S1 | Who has subverted American elections through absentee and mail ballots, and through control of which ballots count, and what stopped them? | `mail-exception`, `mail-works`, `signature-discretion` | D25, D51, D52, D55, D69, D13 | *comp:* D62 (Britain's postal-fraud cases), D56 (Britain 1872 and 1883). *run:* D56, D45 (remedy dates). *record:* D48, D50 (in-person machine fraud over the same era). | Well-supported as a record of named cases. "Fraud by outsiders or manipulation by officials" has no common measure, so it stays a crux. | R4 |

**Crux candidates.**
- *Strict and fair checks* needs M3a, M3c and D65 (R2 and R4).
- *Secrecy vs access* needs M1b and M2a (R5 and R1).
- *Fraud by outsiders vs manipulation by officials* draws on S1 (R4).

**Searched without a good result.** This list is incomplete: the shared search budget ran out mid-turn (see 3d).
- **M1c:** IDEA country counts are in images.
- **M1d:** no other survey on household help or coercion was found.
- **M3c:** no case of signature review used to change a result was found.
- **M5b:** no state mail-rule counts before 2016.

---

## 3b. Candidate datasets

### D1. [BOTH] EAC Election Administration and Voting Survey (EAVS)
- **Tag:** [MAIL] in the combined file; retagged [BOTH] in the split (see the header).
- **Source:** U.S. Election Assistance Commission, *2024 EAVS Comprehensive Report*, released 30 Jun 2025, errata v2 12 Feb 2026. The 2026 cycle is not yet released. https://eac.gov/sites/default/files/2025-07/2024_EAVS_Report_508.pdf ; state and national data briefs at https://www.eac.gov/sites/default/files/2026-07/2024_EAVS_Data_Brief_US.pdf
- **Measures:** turnout by mode, mail ballots sent, returned, counted and rejected, rejection reasons, curing, provisional ballots, list maintenance (see D32) and UOCAVA, all by state. It does not measure fraud, ballots counted inside grace periods, or ID-related turnout effects.
- **Coverage:** biennial since 2004 (read, CRS IF13056), every state. Definitions change between cycles, so breaks need marking.
- **Shape:** biennial series plus cross-state comparison in the same source.
- **Slices:** state; mode; rejection reason; all-mail vs other states.
- **What it shows (read, PDF; as of the 2024 general):**
  - 2024 mail share was 30.3% of turnout, down from 43% in 2020 and up from about a quarter in 2016 and 2018. In-person early voting was 35.2% and Election Day 37.4%.
  - 66,867,671 mail ballots sent; 47,957,093 returned; 47,629,437 counted; 584,463 rejected (1.2%).
  - Rejection reasons: 40.7% signature problems; 18.1% other; 17.8% received late (about 104,000, my arithmetic); 10% no signature. The 2022 late share was 23.1%.
  - The counted/rejected split "was not significantly different" between all-mail and other states, and across 2020, 2022 and 2024.
  - More than 585,000 ballots entered curing, and over half were cured.
- **Helps:** `election-day-receipt` (a measurable rejection rate; late arrival is a named reason); `mail-works` (curing; no all-mail penalty). **Hurts:** `mail-works` (rejections far exceed in-person); `election-day-receipt` (deadlines themselves cause about 18% of rejections).
- **Likely status:** well-supported as a descriptive series. Narrow it to "rate of returned mail ballots", and state the denominator, because MIT's per-vote-cast rate is 0.34% in both 2020 and 2024 (read, https://elections-blog.mit.edu/articles/administration-mail-voting, 25 Jun 2026).

### D2. [BOTH] MIT Election Data + Science Lab: *How We Voted in 2024* (SPAE), Elections Performance Index
- **Source:** https://electionlab.mit.edu/sites/default/files/2025-07/HowWeVotedIn2024.pdf ; SPAE project page https://electionlab.mit.edu/research/projects/survey-performance-american-elections
- **Measures:** a survey of about 200 voters per state, 10,200 in total (*unverified*), of voting mode, experience, ID requests, wait times and confidence. The EPI compiles state indicators, including mail rejection per vote cast.
- **Coverage:** SPAE 2008–2024; EPI 2008–2024. Both cover every state.
- **Shape:** series (survey waves) with state comparison.
- **Slices:** party, age, race, state, mode; confidence by mode and party.
- **What it shows:** mail use was 29% in 2024 vs 43% in 2020 and 21% in 2016; Democrats 37% vs Republicans 24% (*unverified*, Statista citing MIT; as of 2024). The PDF exceeded the fetch size limit.
- **Helps:** `mail-works` (cross-party use). **Hurts:** `mail-works` (the partisan gap, which draft 2 now concedes); `id/id-plus-access` (confidence follows own side's mode).
- **Likely status:** well-supported for descriptive shares.

### D3. [MAIL] Census Bureau CPS Voting and Registration Supplement
- **Source:** 2024 tables released 30 Apr 2025. https://www.census.gov/newsroom/press-releases/2025/2024-presidential-election-voting-registration-tables.html
- **Measures:** self-reported registration, turnout and mode, plus reasons for not voting or registering. It over-reports turnout, and mode is self-reported.
- **Coverage:** biennial from 1964. The mode question starts in 1996 and changed in 2004 (*unverified*), so a break is needed. National and state.
- **Shape:** long series.
- **Slices:** age, race, Hispanic origin, sex, education, income, citizenship status, metro/non-metro.
- **What it shows:** 2024: 39.6% voted on Election Day, 30.7% early in person, 29.0% by mail (*unverified*, press-release snippet).
- **Helps:** `mail-works` (mail use by age and rurality). **Hurts:** neither directly. It is the only long mode series back to 1996.
- **Likely status:** well-supported for broad shares; complicated for fine subgroups.

### D5. [MAIL] NCSL Table 11, "Receipt and Postmark Deadlines for Absentee/Mail Ballots"
- **Source:** https://www.ncsl.org/elections-and-campaigns/table-11-receipt-and-postmark-deadlines-for-absentee-mail-ballots (updated 25 Sep 2026).
- **Shape:** cross-state snapshot (series in D44).
- **What it shows (read, as of 25 Sep 2026):**
  - 35 states require receipt by Election Day; 15 states plus DC, Guam, PR and USVI accept ballots postmarked by Election Day that arrive later. Windows: TX +1 day, NV +4, CA +7, NY +7, AK +10, IL +14, WA until the day before certification.
  - In 2025, North Dakota, Ohio and Utah ended their grace periods. Kansas legislated an end, but it is enjoined, so Kansas keeps its three-day window.
  - *Watson*'s "roughly 30 States" counts states that accept *some* late ballots, mostly military and overseas ones.
- **Helps:** `election-day-receipt` (a trend toward receipt by Election Day); `states-decide` (variation). **Hurts:** `election-day-receipt` (the grace-period states include Texas and Alaska).
- **Likely status:** well-supported. Reconcile 15 vs ~30 explicitly.

### D6. [MAIL] NCSL Table 18, "States with All-Mail Elections"
- **Source:** https://www.ncsl.org/elections-and-campaigns/table-18-states-with-all-mail-elections ; CRS IF11477 (Jul 2026) https://www.everycrsreport.com/files/2026-07-10_IF11477_6b1984f8f326df526ae5607f823fd9b0a61e64a5.pdf
- **Shape:** cross-state snapshot with adoption dates.
- **What it shows:** eight states plus DC (CA, CO, HI, NV, OR, UT, VT for general elections only, WA), with adoption dates (*unverified*). Utah reportedly phasing out (*unverified*).
- **Helps:** `mail-works` (a red state, Utah, is on the list). **Hurts:** `mail-works` if Utah's retreat is confirmed.
- **Likely status:** well-supported.

### D10. [MAIL] Thompson, Wu, Yoder & Hall, "Universal vote-by-mail has no impact on partisan turnout or vote share" (*PNAS* 2020)
- **Source:** https://pmc.ncbi.nlm.nih.gov/articles/PMC7322007 (publisher page 403)
- **Shape:** one study, county panel 1996–2018.
- **What it shows (read):** county roll-outs in CA, UT and WA raised turnout by about 2.1 pts; Democratic share of turnout changed by about +0.1 pts; vote-share estimates "modest or null"; pre-COVID only.
- **Helps:** `mail-works` (no partisan bias, a modest turnout gain); `election-day-receipt` (no partisan advantage to fear). **Hurts:** `mail-works`'s turnout claims (the effect is small).
- **Likely status:** well-supported for pre-2020.

### D13. [BOTH] Heritage Foundation Election Fraud Database (partisan lead)
- **Source:** https://www.heritage.org/voterfraud (403); criticism: https://snopes.com/fact-check/absentee-ballot-fraud-heritage/
- **Measures:** a curated list of convictions and official findings, by category. Heritage says it is "not exhaustive". No denominator.
- **Shape:** event record (case list).
- **What it shows:** about 1,285 cases in 2020, more than 1,400 by Jan 2023, "over 1,500" later (*unverified*). No separate mail vs absentee split.
- **Helps:** `mail-exception` (absentee is a large category); `id/prove-identity`. **Hurts:** `id/prove-identity` and `mail-exception` (the total over decades, against billions of ballots, is tiny).
- **Likely status:** usable only as a lower-bound count with method stated.

### D16. [BOTH] Texas SB 1 mail-ballot rejections, March 2022 primary
- **Source:** AP/NPR https://www.kut.org/2022-03-16/in-texas-thousands-of-mail-ballots-were-rejected-following-new-id-requirements . Series now in D31.
- **Shape:** event snapshot (series in D31).
- **What it shows:** about 23,000 mail ballots rejected; Harris County 19% (6,888) against 135 in 2018 (*unverified*). Most for missing or mismatched ID numbers. Texas Public Radio puts the statewide total at 24,636, 12.38% (read, D31).
- **Helps:** `id/turned-away`. **Hurts:** `id/prove-identity`, `id/id-plus-access`. The later fall (D31) partly hurts `id/turned-away`'s "permanent harm".
- **Likely status:** well-supported for the 2022 primary.

### D18. [BOTH] Gallup
- **Sources:**
  - "Americans Endorse Both Early Voting and Voter Verification", 24 Oct 2024 (fielded 1–12 Oct, n=1,023): https://news.gallup.com/poll/652523/americans-endorse-early-voting-voter-verification.aspx
  - "Trust in Elections Breaks Global Pattern", World Poll, 7 Oct 2026: https://news.gallup.com/poll/715205/trust-elections-breaks-global-pattern.aspx (cross-country part is D42)
- **Shape:** series (policy items 2016–2024; confidence 2006–2026) with party slices.
- **What it shows:**
  - **Policy (read, Oct 2024):** photo ID 84%; proof of citizenship for new registrants 83%; early voting 76%; automatic registration 60%. Republican support for early voting 57%, down from 74% in 2016; Democratic support for photo ID up 14 pts since 2022. Party splits for ID (R 98, I 84, D 67) *unverified*. No crosstab of people backing both.
  - **Confidence (read, 2026):** 49% confident in the honesty of elections, averaging 45% since 2006. D 63, R 37, I 35. The party gap was 55 pts in 2024 and 4 pts in 2025.
  - **Correction to draft 1:** the World Poll article gives a global approver/disapprover comparison, not an OECD comparison.
- **Helps:** `id/prove-identity` (support); `id/id-plus-access` (both ID and early voting are majority positions). **Hurts:** `id/id-plus-access`'s "confidence has collapsed" framing (the long-run average is 45%); `id/turned-away`.
- **Likely status:** well-supported for the trends.

### D19. [BOTH] Pew Research Center
- **Sources:**
  - Voting policy, 22 Aug 2025 (fielded 4–10 Aug, n=3,554): https://www.pewresearch.org/politics/2025/08/22/majority-of-americans-continue-to-back-expanded-early-voting-voting-by-mail-voter-id/
  - Voting policy, 22 Apr 2021 (n=5,109): https://www.pewresearch.org/politics/2021/04/22/republicans-and-democrats-move-further-apart-in-views-of-voting-access/
  - Confidence, Aug 2026: https://pewresearch.org/short-reads/2026/08/05/how-confident-are-americans-in-the-midterm-elections-fairness-and-accuracy
- **Shape:** series with party slices (policy 2018–2025; confidence 2020–2026).
- **What it shows (read):**
  - **2025:** photo ID 83% (R 95, D 71); two weeks of early voting 80% (R 71, D 89); automatic registration 59% (R 42, D 77); no-excuse mail 58% (R 32, D 83), down from 70% in Apr 2020.
  - **2021:** photo ID 76% (R 93, D 61); early voting 78%.
  - No published crosstab of people backing both ID and early voting.
  - **Confidence:** Apr 2020 R 75 / D 46; Aug 2022 R 46 / D 81; Jul 2024 R 47 / D 77; Jul 2026 R 55 / D 58.
- **Helps:** `id/id-plus-access` (both majorities exist, and each side has moved toward the other's rule since 2021). **Hurts:** `id/id-plus-access` (confidence flips with incumbency); `mail-works` (Republican support for mail is falling); `id/turned-away` (Democrats back ID too).
- **Likely status:** well-supported for each policy. The overlap claim cannot be stated as a figure.

### D22. [MAIL] MIT Election Lab, "How long did it take to count the vote in 2024?" (Dec 2024)
- **Source:** https://electionlab.mit.edu/articles/how-long-did-it-take-count-vote-2024 . Edison/CNN feeds.
- **Shape:** cross-state comparison, 2020 and 2024.
- **What it shows (read, as of 2024 general):**
  - Nationally, a majority of votes were counted in about 2 hours and 75% in about 3 hours; every state passed 75% within about 5 days.
  - Slowest: WA, CA, NV, AZ, UT, CO, AK, mostly heavy-mail. TX and FL counted more than 10 million votes each within about a day; GA reached 95% in 5 hours, NC in 6.
  - Hours to 95% (2020 → 2024): PA 49 → 8; NV 159 → 51; AZ 73 → 147. California reported about a third of its vote over roughly a month.
- **Helps:** `election-day-receipt` (fast counting is achievable). **Hurts:** `election-day-receipt` (most votes are counted within hours); `mail-works` (all-mail states slowest).
- **Likely status:** well-supported for 2024 descriptives.

### D23. [MAIL] Late-arriving ballots: Nevada counts
- **Source:** Nevada Independent / Gigafact, 31 Jan 2025: https://thenevadaindependent.com/article/was-a-large-percentage-of-votes-received-after-election-day-in-nevada-in-2024 (read); earlier lead https://thenevadaindependent.com/article/supreme-court-to-decide-if-states-including-nevada-can-count-late-arriving-mail-ballots
- **Shape:** single-state snapshot.
- **What it shows:** about 9,500 (Clark) plus 2,400 (Washoe) mail ballots arrived after Election Day, against nearly 1.3 million votes cast in those counties, under 1% (read, from Nevada SOS data, as of 2024 general). Against mail ballots alone, about 2% (*unverified*, earlier article). Statewide margins (President about 46k, Senate about 24k) *unverified*.
- **Helps:** `election-day-receipt` (enough to matter in close races); `mail-works` (small). **Hurts:** `election-day-receipt` (well below these margins).
- **Likely status:** well-supported per state.

### D24. [BOTH] Federal legal record, 2025–26
- **Sources:** *Watson v. RNC* slip opinion (read): https://www.supremecourt.gov/opinions/25pdf/609us2r65_g314.pdf ; EO 14399 tracker: https://www.brennancenter.org/our-work/court-cases/league-women-voters-massachusetts-v-trump-march-2026-mail-voting-executive ; *Trump v. California* and *USPS v. California* (read, see Current state); EO 14248: https://assets.aclu.org/live/uploads/2025/10/217-Order-Granting-MSJ.pdf and https://clearinghouse.net/case/46337/ ; SAVE America Act: https://rsc-pfluger.house.gov/media/press-releases/rsc-chairman-pfluger-releases-statement-house-passage-save-america-act ; CRS IF11477.
- **Shape:** dated legal record.
- **What it shows:** see "Current state".
- **Helps:** `states-decide` (courts blocked the EO 14248 citizenship section as beyond presidential power). **Hurts:** `states-decide` (SCOTUS let EO 14399 stand as an internal directive; Alito's *USPS* dissent says Congress can delegate Elections Clause rules to an agency); X1 (*Watson* says Congress could set a deadline).
- **Likely status:** well-supported as a dated record that will change after the midterms.

### D25. [BOTH] NC-09 2018 absentee-ballot fraud
- **Tag:** [MAIL] in the combined file; retagged [BOTH] in the split (see the header).
- **Source:** NC State Board of Elections, Order in the matter of the 9th District contest, signed 13 Mar 2019 (copy: https://www.democracydocket.com/wp-content/uploads/2020/08/North-Carolina-Election-Contest-Order_03132019-1.pdf); prosecutions: WSOC-TV, 21 Mar 2025, https://www.wsoctv.com/news/local/with-two-guilty-pleas-nc9-election-fraud-saga-comes-an-end/HSJOA7VKRNH5JJKC3B4UV5KZD4/
- **Shape:** event record.
- **What it shows (read, PDF):**
  - Harris 139,246, McCready 138,341: margin 905 (0.3%). About 10,500 mail ballots districtwide.
  - Bladen: 1,369 requests, some forged; 728 returned, 595 not. Robeson: 2,321 requests, 776 returned, 1,493 not.
  - Dowless paid workers in cash to collect request forms and ballots and falsify witness signatures, funded mainly by the Harris campaign through Red Dome Group.
  - **How it was found:** the outlier rate of requested-but-unreturned ballots (expert analysis), voter interviews (142 reached), and a 2016 referral already naming Dowless. The board found the election "corrupted by fraud", the number of affected ballots undeterminable, and ordered a new election.
  - **Prosecutions (read):** all other workers pleaded guilty; Dowless died before trial (death date 24 Apr 2022 *unverified*).
- **Helps:** `mail-exception` (mail-specific fraud can affect a race). **Hurts:** `mail-exception`'s generalisation (caught by mail-specific safeguards and remedied); `mail-works`.
- **Likely status:** well-supported as a case. An observation, not a lead.

### D26. [MAIL] Rutgers and EAC, disability and voting
- **Source:** https://www.eac.gov/news/2021/07/07/new-data-177-million-americans-disabilities-voted-2020-significant-increase-over ; https://www.eac.gov/blogs/understanding-voting-accessibility-2022-elections
- **Shape:** snapshots (2020, 2022).
- **What it shows:** in 2020, 53% of voters with disabilities voted by mail vs 42% without; in 2022, 6% reported difficulty with mail ballots vs under 1% (*unverified*). No 2024 figure found.
- **Helps:** `mail-works`. **Hurts:** `mail-works` slightly.
- **Likely status:** well-supported for 2020.

### D27. [MAIL] Yoder et al., excuse requirements in Texas and Indiana (2021)
- **Source:** https://dthompson.scholar.ss.ucla.edu/wp-content/uploads/sites/19/2021/07/Yoder_et_al_VBM_TX_IN_short.pdf
- **Shape:** one study.
- **What it shows:** age-based no-excuse eligibility raised mail use, with small turnout and partisan effects even in 2020 (*unverified*, not read).
- **Helps:** `mail-works` and `election-day-receipt` (neutral partisan effect). **Hurts:** `mail-works` (small turnout gain).

### D31. [BOTH] Mail-ballot rejection before and after ID-number rules: Texas SB 1 (2021) and Georgia SB 202 (2021)
- **Sources:**
  - Texas Public Radio, 6 Nov 2022: https://www.tpr.org/news/2022-11-06/texas-officials-say-theyre-rejecting-fewer-mail-ballots-than-the-primarys-big-spike
  - EAVS state briefs: TX 2022 https://www.eac.gov/sites/default/files/2023-10/2022_EAVS_Data_Brief_TX_508c.pdf ; TX 2024 https://www.eac.gov/sites/default/files/2026-07/2024_EAVS_Data_Brief_TX.pdf ; GA 2022 https://www.eac.gov/sites/default/files/2023-10/2022_EAVS_Data_Brief_GA_508c.pdf ; GA 2024 https://www.eac.gov/sites/default/files/2026-07/2024_EAVS_Data_Brief_GA.pdf
  - Brennan Center study, *Journal of Politics* 2025, via Votebeat 28 May 2025: https://www.votebeat.org/texas/2025/05/28/mail-voting-decline-under-senate-bill-1-election-law-id-requirement/
- **Measures:** share of returned mail ballots rejected (EAVS 2024 gives "counted", so 1 − counted is approximate).
- **Shape:** short state series, comparable to the national EAVS rate (D1).
- **What it shows:**

  | Election | Texas | Georgia | Mark |
  |---|---|---|---|
  | 2018 general | 1.5% | 0.15% (signature rejections only) | *unverified* (TX: EAC as cited by TPR; GA: SOS release, site 403) |
  | 2020 general | 0.8% | (as above) | *unverified* |
  | Mar 2022 primary | 12.38% (24,636) | — | read, TPR |
  | Nov 2022 general | 3.4% of returned | 1.5% of returned | read, PDF |
  | Nov 2024 general | about 3.5% not counted | about 1.7% not counted | read, PDF |
  | National 2024 | 1.2% | 1.2% | read, D1 |

  - **Brennan study (read):** about 215,000 requested mail ballots for the Texas 2022 primary; about 30,000 had an application or ballot rejected; about 90% did not vote another way; only 344 of more than 18,000 with rejected ballots voted in person.
  - Texas 2024: 5.8% of mail ballots entered curing (read, PDF).
  - 2018 EAVS briefs have no rejection line; 2020 briefs not found.
- **Helps:** `id/turned-away` (Texas's spike and lasting rise; most rejected voters did not vote). **Hurts:** `id/turned-away` for Georgia general elections (close to the national rate); `id/prove-identity` and `id/id-plus-access` for Texas (an ID rule raised rejections fourfold above 2020 even after the learning curve).
- **Likely status:** well-supported for Texas 2022 primary and for Georgia being near the national rate. Pre-2022 baselines must be read from EAVS datasets.

### D38. [BOTH] Carter–Baker Commission, *Building Confidence in U.S. Elections* (Sept 2005)
- **Source:** Commission on Federal Election Reform (American University), full text hosted by EAC: https://eac.gov/sites/default/files/eac_assets/1/6/Exhibit%20M.PDF (read, PDF page images). Carter on Georgia: PBS NewsHour, 19 Sep 2005, https://www.pbs.org/newshour/show/jimmy-carter-and-james-baker (read).
- **Shape:** text record.
- **What it shows (read):**
  - **2.5.1:** States should require the REAL ID card, adapted to show citizenship, and "provide an EAC-template ID with a photo to non-drivers free of charge". **2.5.2:** "best efforts to obtain proof of citizenship before registering voters". **2.5.3:** provisional ballots with signature match until 1 Jan 2010.
  - States should "play an affirmative role in reaching out with mobile offices" to register people and issue ID; registration and ID "accessible and available to all eligible citizens" (4.1.1).
  - "There is no evidence of extensive fraud in U.S. elections or of multiple voting, but both occur, and it could affect the outcome of a close election."
  - "Absentee ballots remain the largest source of potential voter fraud"; recommends banning third-party ballot handling.
  - Early and convenience voting have had "little impact on voter turnout".
  - **Dissents:** Daschle, Overton and Yzaguirre called the REAL ID recommendation "the most troublesome", for some "nothing short of a modern day poll tax".
  - **Carter, Sept 2005:** Georgia's law "is a poll tax" because its ID cost about $20–35; "We require in our recommendations that the voter ID card be free of charge."
- **Helps:** `id/id-plus-access` (the literal ID-plus-access package); `id/prove-identity` (includes proof of citizenship); `mail-exception` (absentee fraud risk); `id/clean-rolls` (list maintenance). **Hurts:** `id/id-plus-access` (the commission split, and its co-chair attacked the first state to adopt the ID half); `mail-works` (absentee line); `id/id-plus-access`'s "access" half (the report downplays early voting).
- **Likely status:** well-supported as a text record.

### D41. [BOTH] The winner effect on US confidence
- **Sources:** Sances & Stewart, Caltech/MIT VTP Working Paper #125 (2014; *Electoral Studies* 2015): https://www.vote.caltech.edu/documents/16/WP_125.pdf (read, abstract); Stewart, Election Updates, 19 Dec 2018: https://electionupdates.caltech.edu/?p=6578 (read); Sinclair, Smith & Tucker, *PRQ* 71(4), 2018: https://isps.yale.edu/resource/its-largely-a-rigged-system-voter-confidence-and-the-winner-effect-in-2016 (read, abstract).
- **Shape:** pooled surveys 2000–2012; pre/post-election pairs 2014–2018.
- **What it shows (read):** "a consistent relationship between voting for the winner and confidence"; "respondents lose confidence by virtue of change itself". In 2014, Republican confidence rose 14 pts after the election; in 2016, Democrats went from 15 pts more confident to 13 pts less; in 2018, essentially no winner effect.
- **Helps:** `id/id-plus-access`'s concession (confidence follows who won). **Hurts:** `id/id-plus-access`'s mechanism (new rules, even agreed ones, may lower trust at first); `id/prove-identity` (ID's confidence gain is hard to separate from winning).
- **Likely status:** well-supported for 2000–2016.

### D42. [BOTH] Winner–loser confidence gaps in other democracies
- **Sources:**
  - Gallup World Poll, 7 Oct 2026 (as D18) (read)
  - Electoral Integrity Project, *Electoral Integrity Global Report 2025* (PEI 11.0, Jul 2025): https://ueaeprints.uea.ac.uk/id/eprint/99835/1/Year_in_Elections_PEI_11_Report_FINAL.pdf (read, PDF)
  - Anderson, Blais, Bowler, Donovan & Listhaug, *Losers' Consent* (OUP 2005) — bibliographic only
  - CSES modules — not reached
- **Shape:** cross-country comparison (Gallup global medians; PEI expert scores 2012–2024).
- **What it shows:**
  - **Gallup (read, 2025):** worldwide median, 70% of people who approve of their national leadership are confident in elections vs 30% of those who disapprove. In the US, approvers 41% and disapprovers 52%: "No other country in the world in the past 15 years has seen this pattern."
  - **PEI (read, approximate from chart):** the US overall index fell from about 70 (2022) to about 54 (2024), among five countries with a 2024 decline; vote count, results and procedures were "strong", while boundaries, media and finance were weak. "26th of 73" *unverified*.
  - *Losers' Consent*: losers more critical, especially in new democracies (*unverified*, review snippet).
- **Helps:** `id/id-plus-access` (a winner gap is normal; the US is an outlier); `states-decide` and `election-day-receipt` (experts rate US counting well). **Hurts:** `id/id-plus-access`'s concession (in 2025 US confidence did not follow who won, so something else — perhaps elite cues — drives it); `id/prove-identity` and `id/turned-away` (experts do not fault the voting mechanics).
- **Likely status:** well-supported for "a winner–loser gap is the global norm". CSES numbers needed for a proper comparator set.

### D43. [MAIL] Mail-ballot pre-processing rules by state, against count speed
- **Sources:** NCSL "Table 16: When Absentee/Mail Ballot Processing and Counting Can Begin", updated 15 Sep 2026: https://www.ncsl.org/elections-and-campaigns/table-16-when-absentee-mail-ballot-processing-and-counting-can-begin (read); Stewart, Election Updates, 30 Oct 2024 (summarising MIT's 2020 "Blue Shift" analysis): https://electionupdates.caltech.edu/?p=7034 (read).
- **Shape:** cross-state snapshot (rules) paired with D22 (count speed).
- **What it shows (read):**
  - Processing can start before Election Day in 44 states plus DC and PR; only on Election Day in 6 (AL, MS, NH, PA, WV, WI). Scanning can start before Election Day in 33 plus DC and PR. No state may release results before polls close.
  - PA and WI: no processing before Election Day. MI: 8 days early for jurisdictions of 5,000+. AZ, FL, NV: on receipt. GA: from the third Monday before. NC: from the fifth Tuesday before.
  - 2020: four hours after polls closed, states without pre-processing had reported 63% of votes vs 78% for states with it; the gap "essentially disappeared by the 24-hour mark".
- **Helps:** `election-day-receipt` (fast counting is a policy choice). **Hurts:** `election-day-receipt` (AZ and NV pre-process but are still slow; the effect fades within a day); `mail-works`.
- **Likely status:** well-supported for the rules; "pre-processing speeds the first hours" is supportable; the larger causal claim is not.
- **Lead not fetched:** Shaikh & Stewart 2026, "Why the Wait?" (electionlawblog 403).

### D44. [MAIL] Late-arriving ballots over time and in 2026
- **Sources:** NCSL "Evolution of Absentee/Mail Voting Laws 2016–2026": https://www.ncsl.org/elections-and-campaigns/evolution-of-absentee-mail-voting-laws-2016-2026 (read); California SOS unprocessed-ballots report, 7 Nov 2024: https://www.sos.ca.gov/administration/news-releases-and-advisories/2024-news-releases-and-advisories/california-secretary-state-shirley-n-weber-phd-issues-unprocessed-ballots-report (read); Philadelphia Inquirer reprinting NYT, 31 Aug 2026: https://www.inquirer.com/politics/more-late-mail-in-votes-rejected-trump-postal-service-slow-drop-box-20260831.html (read); *Watson* slip opinion (D24).
- **Shape:** series (grace-period state counts 2016–2026); snapshots of late arrivals and rejections.
- **What it shows (read):**
  - States accepting ballots after Election Day: 13 (2016), 21 + DC (Nov 2020), 19 + DC (2022), 18 + DC (2024), 15 + DC expected for 2026.
  - California, two days after the 2024 election: 5,472,423 ballots still to process vs 10,728,985 processed — no late-arrival breakdown. 243,976 postmarked ballots unprocessed at the end of election week and 122,480 mail ballots rejected (0.9%) are *unverified* (PPIC 403; CalMatters).
  - 2026 primaries: late rejections rose — Washington from about 16,000 to over 20,000 (75% of its rejections), Michigan over 10,000 (nearly double 2024), Wisconsin about 5,000 (78%). The Postal Service says over 95% of ballots arrive on time.
  - *Watson* notes states may set Election Day deadlines to avoid "the appearance of fraud from late-arriving ballots".
- **Helps:** `election-day-receipt` (the trend is back toward Election Day receipt; *Watson* legitimises it as a state choice). **Hurts:** `election-day-receipt` (deadlines convert postal delay into rejected eligible ballots, rising in 2026); helps `id/turned-away` and `mail-works`.
- **Likely status:** well-supported for the rule series; per-state late counts remain patchy.

### D45. [BOTH] Earlier federal election laws and the Freedom to Vote Act
- **Sources:** DOJ Voting Section, "Statutes Enforced": https://www.justice.gov/crt/statutes-enforced-voting-section (read); HAVA 52 U.S.C. §21083 (read, Cornell LII); MOVE Act, 52 U.S.C. §20302 (read); CRS IN11781 (Oct 2021): https://www.everycrsreport.com/reports/IN11781.html (read); Senate Periodical Press, 19 Jan 2022: https://www.periodicalpress.senate.gov/wednesday-january-19-2022/ (read).
- **Shape:** legal record (dated timeline 1965–2022).
- **What it shows (read):**
  - VRA 1965 (bars racially discriminatory practices; §2 covers results); UOCAVA 1986 (military and overseas absentee voting); NVRA 1993 (mail and agency registration, list-maintenance rules); HAVA 2002 (voting-system standards, provisional ballots, statewide databases); MOVE 2009 (ballots out at least 45 days before).
  - **HAVA ID:** first-time voters who registered by mail must show photo ID or a utility bill, bank statement or government document, unless their licence or SSN4 matched; new registrations must carry a licence number or SSN4.
  - **Freedom to Vote Act:** would have required early voting, same-day registration and no-excuse absentee voting, required ID states to accept alternatives, limited removals and created an Election Day holiday. Cloture failed 20 Oct 2021; on 19 Jan 2022 cloture on H.R. 5746 failed 49–51 and the rules-change attempt lost 52–48. A 15-day early-voting floor is *unverified*. No 119th-Congress reintroduction found (congress.gov 403).
- **Helps:** X1 (both parties have sought national standards); `states-decide` (each recent national push failed). **Hurts:** `states-decide` (Congress has set national floors repeatedly, including an ID rule in HAVA).
- **Likely status:** well-supported as a record.

### D46. [BOTH] Court record on federal and presidential power over voting rules
- **Sources:** *Arizona v. Inter Tribal Council of Arizona* (2013): https://www.law.cornell.edu/supremecourt/text/12-71 (read); *Moore v. Harper* (2023): https://www.law.cornell.edu/supremecourt/text/21-1271 (read); 2025–26 EO rulings in "Current state" and D24.
- **Shape:** legal record.
- **What it shows (read):**
  - *ITCA* (7–2, Scalia): the NVRA bars Arizona from demanding more than the federal form for federal registration; Congress's Elections Clause power is "paramount… and may be exercised at any time, and to any extent" — but covers "how federal elections are held, but not who may vote in them".
  - *Moore* (6–3): the Elections Clause "does not insulate state legislatures from the ordinary exercise of state judicial review".
  - *California v. Trump* (D. Mass., 2026): EO 14248's challenged sections exceed presidential authority. *LULAC*'s "the Constitution assigns no direct role to the President in either domain" *unverified*.
  - *Trump v. California* (2026) let EO 14399 stand as unripe; *USPS v. California* kept the USPS rule blocked on timing grounds, with Alito's dissent on delegated Elections Clause power.
- **Helps:** `states-decide` (district courts on presidential power; ITCA's limit on "who may vote"). **Hurts:** `states-decide` (Congress's power is "paramount"; SCOTUS has not yet ruled on the merits of presidential action).
- **Likely status:** well-supported as a record. Opinions must be quoted verbatim in stage 4.

### D47. [BOTH] State rule variation over time (NCSL)
- **Sources:** NCSL, *The Canvass*, Oct 2021: https://www.ncsl.org/news/details/the-canvass-october-2021 (read); D4; NCSL "Evolution of Absentee/Mail Voting Laws 2016–2026" (as D44); D40; NCSL "Same-Day Voter Registration", updated 27 Mar 2026: https://www.ncsl.org/elections-and-campaigns/same-day-voter-registration (read).
- **Shape:** series of state counts.
- **What it shows (read):**
  - Voter ID states: 13 (2000), 34 (2020), 36 (2026). 25 in Dec 2007 *unverified*.
  - No-excuse or all-mail: 30 + DC (2016), 38 + DC (Nov 2020), 35 + DC (2022), 36 + DC (2024), 37 + DC expected 2026.
  - Early in-person voting: 37 + DC (2016) to 47 + DC (2024 and 2026).
  - Same-day registration: 24 states plus DC; enactments from Maine 1973 to New York 2023 (3 by 1975, 10 by 2007, 19 by 2018).
- **Helps:** `states-decide` (wide, shifting variation). **Hurts:** `states-decide`'s "states learn which rules work" (no source links adoption to measured results); `id/id-plus-access` (states have moved toward *both* ID and early voting, without a national bargain).
- **Likely status:** well-supported for counts.

### D48. [BOTH] Chicago 1982: the federal vote-fraud investigation
- **Tag:** [ID] in the combined file; retagged [BOTH] in the split (see the header).
- **Sources:**
  - Abraham Lincoln Presidential Library, Dan Webb oral history abstract (IST-A-L-2016-034, interviews 2016): https://presidentlincoln.illinois.gov/Resources/fb83c35f-55a4-4abf-8236-bb519dbdf186/download (read). Webb was the US Attorney who ran the probe.
  - DOJ Public Integrity Section, annual Reports to Congress, index 1978–2023: https://www.justice.gov/criminal/criminal-pin/annual-reports ; 1984 report: https://www.justice.gov/media/1106966/dl?inline ; 1983 report: https://www.justice.gov/media/1106971/dl?inline (read, PDF)
  - Excerpt of the *Report of the Special January 1982 Grand Jury* (N.D. Ill.), Lapham's Quarterly: https://www.laphamsquarterly.org/node/11047 (read)
- **Measures:** prosecutions and convictions arising from the November 1982 general election in Chicago. No count of fraudulent votes was read.
- **Shape:** event record. The DOJ reports are an annual series, but they list example cases, not consistent totals, so they cannot carry a prosecutions-over-time chart.
- **What it shows:**
  - "fifty-eight individuals, including city employees and election judges, thus far have been convicted of vote fraud in the November 1982, general election. The investigation continues" (read, PDF, DOJ 1984 report, as of April 1985).
  - Webb's office "prosecuted sixty five individuals for federal election crimes; sixty-three of those were convicted" (read, abstract; describes 1982–85). The 58 and 63 counts probably differ only by date.
  - The grand jury: "In some Chicago precincts, vote fraud has been routine" (read).
  - The probe followed Governor Thompson's "razor thin margin" over Adlai Stevenson III in 1982.
  - Unverified: "100,000 fraudulent votes", about 10% of the city's vote. This is attributed to Webb or the grand jury on Wikipedia and Heritage (403), with no primary source seen. Also unverified: a ballot "tabulated 198 times".
  - The same 1984 DOJ report also lists 21 of 29 people convicted of buying votes with food stamps in Duval County, Texas, in the 1982 primary (read, PDF).
- **Helps:** `id/prove-identity` (machine fraud was real and large, with "dozens of convictions" confirmed).
- **Hurts:** `id/prove-identity`'s causal claim, because the fraud was caught by investigators under existing law, not by an ID rule.
- **As of:** 1985 (convictions).
- **Likely status:** well-supported for "58 convicted by 1985". The vote estimate needs the grand jury report.

### D50. [BOTH] Earlier machine fraud: Tammany Hall, Kansas City 1936, contested elections
- **Sources:** all secondary leads.
  - Wikipedia, Tammany Hall and "Electoral fraud in the United States" (read, secondary).
  - Wikipedia, Maurice Milligan, citing *Dictionary of Missouri Biography* (1999) (read, secondary).
  - Kirkus review of Campbell, *Deliver the Vote* (2005) (read).
- **Shape:** event record.
- **What it shows:**
  - Tammany: Tweed-era "naturalization committees", bribed judges and intimidation (read, secondary).
  - Kansas City: Milligan "got convictions on 259 of 278 defendants" after the 1936 election (read, secondary). About 60,000 fraudulent registrations: unverified.
  - 217 contested House elections 1798–1901, 94 overturned or vacated (read, secondary).
  - Campbell: fraud is long-standing and "varies by region" (read, review).
- **Helps:** `id/prove-identity`. **Hurts:** none directly. The Converse–Burnham–Kousser debate over whether 19th-century turnout was inflated by fraud is the counter-record, and was not reached.
- **Next sources:** Milligan, *Missouri Waltz* (1948); Campbell's text; Argersinger.
- **Likely status:** complicated until primary or scholarly text is read.

### D51. [BOTH] East Chicago, Indiana, 2003 mayoral primary (*Pabey v. Pastrick*)
- **Tag:** [MAIL] in the combined file; retagged [BOTH] in the split (see the header).
- **Sources:** Indiana Supreme Court, No. 45S04-0401-CV-14, decided 6 Aug 2004: https://caselaw.findlaw.com/court/in-supreme-court/1106090.html (read). Convictions: NBC News, 16 Oct 2008, https://www.nbcnews.com/id/wbna27166150 (read).
- **Shape:** legal record.
- **What it shows (read):**
  - Pabey led election-day votes by 199. Pastrick led the 1,950 absentee ballots by 477 and won by 278.
  - The trial court invalidated 155 absentee votes, finding a "deliberate series of actions" that "perverted the absentee voting process". Methods: cash for votes (at least 39 people), steering first-time, elderly and limited-English voters into absentee voting, and others handling ballots.
  - The Supreme Court ordered a special election, "only in rare and exceptional cases". Two justices dissented.
  - "Forty-seven people either pleaded guilty or were convicted" (NBC, 2008).
- **Helps:** `mail-exception` (absentee fraud reversed a result). **Hurts:** `id/prove-identity` (polling-place ID would not have touched it); `mail-exception`'s generalisation (caught and remedied).
- **Likely status:** well-supported as a case.

### D52. [BOTH] Paterson, New Jersey, May 2020 all-mail council election
- **Tag:** [MAIL] in the combined file; retagged [BOTH] in the split (see the header).
- **Sources:**
  - McKoy verified petition, June 2020: https://insidernj.com/wp-content/uploads/2020/06/Verified-Petition-McKoy-v2.pdf (read; a candidate's filing).
  - NJ Globe, 20 May and 19 Aug 2020 (read).
  - NBC New York (read).
  - Paterson Times, 13 Apr 2026, and NJ Globe, Apr and about May 2026 (read).
- **Shape:** event and legal record.
- **What it shows:**
  - About 19% of ballots rejected citywide and 24–26% in the Third Ward (1,195 of 4,556), against 8.1% in the rest of the county and 4.5–10.5% in past Paterson mail elections (read; petition and NJ Globe).
  - 347 ballots were found at a Haledon post office and 531 bundled at another (read, Paterson Times).
  - Judge Caposela voided the result and ordered a new election. The order is dated 16 or 19 Aug 2020; sources differ.
  - **Criminal outcomes:** on 13 Apr 2026 Judge Mohammed dismissed the indictment against Councilman Mendez and three others, on speedy-trial and grand-jury-disclosure grounds. The Attorney General is appealing and moved to dismiss Councilman Jackson's case (read). **No convictions found.**
- **Helps:** `mail-exception` (a mail election was voided over ballot handling). **Hurts:** `mail-exception` and `id/prove-identity` (caught before certification; no proven criminal case).
- **As of:** May 2026.
- **Likely status:** well-supported for "a court voided the result". Do not call it proven fraud.

### D55. [BOTH] Officials and count or certification manipulation
- **Sources:** Wikipedia pages on Couy Griffin, Peggy Judd, attempts to overturn the 2020 election, and the Box 13 scandal (read, secondary; they cite NYT, NBC, CNN, *Political Science Quarterly* 1994 and Caro 1990).
- **Shape:** event record.
- **What it shows (read, secondary):**
  - **Texas 1948, Box 13.** Johnson won by 87 of 988,295 votes. 202 votes were added to Precinct 13 six days later, "in alphabetical order… same pen and handwriting". In 1977 the election judge said the local boss ordered it. This is fraud *by officials*.
  - **Otero County, NM, 2022.** Commissioners refused to certify the primary until the state supreme court ordered it. Griffin said it was based on "my gut feeling".
  - **Cochise County, AZ, 2022.** Supervisors delayed the canvass past the deadline and were indicted in 2023. Judd pleaded guilty to a misdemeanor in Oct 2024. Crosby's outcome is *unverified*.
  - **Wayne County, MI, Nov 2020.** The board deadlocked 2–2, then certified. Two members tried to rescind after calls from Trump and the RNC chair.
  - **Georgia State Election Board, 2024.** Its certification rules were blocked by the Georgia Supreme Court (Oct 2024). Later rulings are *unverified*.
  - In each post-2020 refusal, courts or state officials forced certification.
  - 2025–26 refusals: not searched.
- **Helps:** `id/turned-away` and `signature-discretion` (a rule is only as fair as the officials who apply it). **Hurts:** the same viewpoints' alarm, because the checks held every time since 2020.
- **Likely status:** well-supported as named cases once primaries are read.

### D56. [BOTH] Why the secret ballot emerged, and what it changed
- **Tag:** [MAIL] in the combined file; retagged [BOTH] in the split (see the header).
- **Sources:**
  - Wikipedia, "Secret ballot", "Ballot Act 1872" and "Vote buying" (read, secondary; cite Kinzer 1982, Lawrence 2009, Stokes 2005).
  - Ballot Act 1872 on legislation.gov.uk: https://www.legislation.gov.uk/ukpga/Vict/35-36/33 (title only).
  - Baland & Robinson, "Land and Power", *AER* 98(5), 2008: https://www.aeaweb.org/articles?id=10.1257/aer.98.5.1737 (read, abstract).
- **Shape:** a dated record of adoption, plus one causal study.
- **What it shows:**
  - Tasmania, Victoria and South Australia adopted it in 1856. Britain followed in 1872, to stop employers and landlords watching tenants and workers vote. The 1838 Chartist petition: secrecy is needed against "the corruption of the wealthy and the violence of the powerful" (read, secondary).
  - US states adopted it 1884–1891, starting with Massachusetts in 1888. South Carolina was last, in 1950 (read, secondary).
  - **Chile 1958:** before the reform, areas with more landlord patronage voted more strongly for the right. After it, the gap disappeared (read, abstract).
  - "Monitoring is harder when ballots are cast secretly at a polling place" (Stokes 2005, read via secondary).
  - Not read: Heckelman 1995 (turnout fell after US adoption), Rusk 1970, Kam 2017 (UK bribery).
- **Helps:** `mail-exception` (secrecy was adopted against watching and buying votes, and it worked in Chile). **Hurts:** `mail-exception`'s step from polling-place secrecy to mail. No study here measures coercion of mail voters. If Heckelman holds, secrecy rules also cut turnout.
- **Likely status:** well-supported for motives and dates.

### D61. [MAIL] France's 1975 abolition of postal voting
- **Sources:**
  - Assemblée nationale, ministerial answer to written question n° 1703 (question published 22 Aug 1988): https://www.assemblee-nationale.fr/dyn/9/questions/QANR5L9QE1703 (read).
  - International IDEA answer: https://www.idea.int/answer/ans93791603472096 (read).
  - Wahlrecht.de "Briefwahl" (read, secondary).
  - Restoration bills: Assemblée PPL n° 3039 (2 Jun 2020), https://www.assemblee-nationale.fr/dyn/15/textes/l15b3039_proposition-loi ; Sénat PPL n° 116 (15 Nov 2023), https://www.senat.fr/leg/ppl23-116.html (read).
  - Legifrance returned 403.
- **Shape:** legal record plus a before-and-after abstention comparison.
- **What it shows:**
  - Loi n° 75-1329 of 31 Dec 1975 "a abrogé le vote par correspondance" (read).
  - The government refused to restore it in 1988, saying abstention had not risen overall (read):

    | Election type | Abstention before 1975 | Abstention after 1975 |
    |---|---|---|
    | Presidential | 18.4% | 16.6% |
    | Legislative | 21.5% | 25.7% |
    | Municipal | 23.1% | 21.4% |
    | Cantonal | 39% | 33.6% |

  - **Stated reasons conflict:**
    - IDEA: "because of the incidence of fraud" (read).
    - Wahlrecht.de: concern about postal workers' political affiliations (read, secondary).
    - The ministerial answer's fraud wording ("fraudes graves… électeurs fictifs"): *unverified*.
    - Corsica: no fetched source.
  - Restoration bills were filed in 2020 and 2023; no adoption found.
- **Helps:** `mail-exception` (a peer democracy abolished postal voting, citing fraud). **Hurts:** `mail-exception`'s account of the reason (contested), and its "abolition is settled" framing (restoration bills keep coming).
- **Likely status:** well-supported that it was abolished in 1975. The reason is complicated.

### D62. [MAIL] Britain's postal-vote fraud cases and reforms
- **Sources:**
  - Birmingham judgment (Mawrey QC, 4 Apr 2005). Its text was not fetched; the "banana republic" quote, para 716, is via Wikipedia (read, secondary).
  - *Re Slough* [2013] EWHC 2572 (QB), paras 14–16: https://caselaw.nationalarchives.gov.uk/ewhc/qb/2013/2572 (read).
  - *Erlam v Rahman* [2015] EWHC 1215 (QB): https://caselaw.nationalarchives.gov.uk/ewhc/qb/2015/1215 (read to para 154).
  - Electoral Administration Act 2006 s.14: https://www.legislation.gov.uk/ukpga/2006/22/section/14 (read).
  - Elections Act 2022, Sch.3 and ss.3–7 (read).
  - Full Fact, 24 Jul 2024: https://fullfact.org/election-2024/postal-voting-pre-election-briefing/ (read; cites the Electoral Commission).
- **Shape:** legal record plus a usage series.
- **What it shows:**
  - **Birmingham 2005:** Mawrey later wrote in *Slough* that "literally thousands of votes" were falsified there, "as many as half the votes cast for the winning candidates", in "some fourteen different ways". "The problem was universal" (read).
  - **Tower Hamlets 2015:** the judgment blamed "postal voting on demand" for a revival of personation (para 64, read). That Rahman's election was voided: *unverified* here.
  - **2006 reform:** postal applications must carry a signature and date of birth (read).
  - **2022 reform:** postal votes lapse after about three years; campaigners' handling of postal votes is restricted (read). The "own plus five" hand-in limit is per Full Fact.
  - **Usage (read, Full Fact):** postal votes were 15.3% of votes in 2010 and 18% in 2017. In 2019, 8.2m were issued and 6.7m used.
  - **Recent fraud (read, Full Fact):** 1,462 alleged fraud cases of all kinds in 2019–23, 11 convictions; six postal allegations in 2023; "no evidence of large-scale electoral fraud".
- **Helps:** `mail-exception` (court-proven organised postal fraud in a peer democracy). **Hurts:** `mail-exception` (Britain kept postal voting on demand, added identifiers and handling limits, and recent fraud counts are low). Helps `signature-discretion`'s "objective checks" fix (UK uses date-of-birth identifiers).
- **Likely status:** well-supported once the 2005 judgment text is read.

### D63. [MAIL] International IDEA, Special Voting Arrangements: in-country postal voting
- **Source:** https://www.idea.int/data-tools/tools/special-voting-arrangements/postal-in-country ; 2025 fact sheet ("Postal data last updated as of 20 August 2025"): https://www.idea.int/sites/default/files/2025-09/2025-International-IDEA-Special-Voting-Arrangements-postal-voting-data.pdf (read).
- **Measures:** whether each country allows in-country postal voting for all voters, some voters, or none.
- **Shape:** cross-country snapshot (March 2021 and Aug 2025 data).
- **What it shows:** the two categories are confirmed (read). The country lists and counts are in images: *unverified*. A search summary listing France under "all voters" is plainly wrong.
- **Helps / hurts:** decides `mail-exception`'s "as it is in most democracies". It is the comparator set the source itself defines.
- **Likely status:** unknown until the counts are extracted, by hand or from IDEA's database export.

### D64. [MAIL] Large postal-vote systems: Germany and Switzerland
- **Sources:**
  - Germany: wahlrecht.de reproducing the Bundeswahlleiterin series (read, secondary); official files linked from https://bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/weitere-ergebnisse.html (not opened).
  - BVerfG, 2 BvC 7/10, 9 Jul 2013: https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2013/07/cs20130709_2bvc000710.html (read).
  - Switzerland: Swissinfo, 17 Sep 2026, https://www.swissinfo.ch/eng/swiss-democracy/how-does-postal-voting-work-in-switzerland/92073387 (read; journalism).
- **Shape:** Germany is a long series (1957–2025); Switzerland is a snapshot.
- **What it shows:**
  - **Germany, postal share of the Bundestag vote (read, secondary):**

    | Year | Postal share |
    |---|---|
    | 1957 | 4.9% |
    | 1976 | 10.7% |
    | 2005 | 18.7% |
    | 2013 | 24.3% |
    | 2017 | 28.6% |
    | 2021 | 47.3% (22.1m) |
    | 2025 | 37.0% (18.5m) |

    No reason has been needed since 2008 (*unverified*).
  - **Germany's 2013 court ruling:** the court upheld postal voting without stated reasons, while conceding that "Bei der Briefwahl ist die öffentliche Kontrolle der Stimmabgabe zurückgenommen" (public control of how the vote is cast is reduced) and that integrity is "nicht gleichermaßen gewährleistet" (not equally guaranteed). The legislator must watch that no election principle is substantially hollowed out (read).
  - **Switzerland:** "over 90% of voters" vote by mail (read, journalism estimate); this "hasn't led to major political debates about security or fraud". Fraud cases such as Upper Valais 2017 were not reached.
- **Helps:** `mail-works` (two mature democracies run very large postal votes, upheld by a constitutional court). **Hurts:** `mail-works` in part. Germany's court concedes reduced secrecy and integrity, which is `mail-exception`'s point.
- **Likely status:** well-supported for Germany's series once the official file is read.

### D65. [MAIL] Rasmussen Reports–Heartland Institute survey, December 2023
- **Sources:**
  - Release, 12 Dec 2023: https://www.rasmussenreports.com/public_content/politics/partner_surveys/one_in_five_mail_in_voters_admit_they_cheated_in_2020_election (read).
  - Questions: https://www.rasmussenreports.com/public_content/politics/partner_surveys/questions_voters_fraud_heartland_december_2023 (read).
  - Critique: FactCheck.org, 20 Sep 2024, https://www.factcheck.org/2024/09/trumps-latest-bogus-claim-about-mail-in-vote-fraud-in-pennsylvania (read).
- **Measures:** self-reports by mail voters about 2020. Fielded 30 Nov–6 Dec 2023; 1,085 "Likely Voters"; "telephone and online" by Pulse Opinion Research; stated ±3 points; weighting not described.
- **Shape:** one-off snapshot.
- **What it shows (read):**
  - The ballot questions went only to the 30% who said they voted by mail, about 325 people (my arithmetic).
  - Of those mail voters:
    - 21% said yes to "did you fill out a ballot, in part or in full, on behalf of a friend or family member, such as a spouse or child?"
    - 19% said someone else filled out theirs.
    - 17% said they signed a ballot or envelope for someone, "with or without his or her permission".
    - 17% said they voted in a state where they were no longer a permanent resident.
- **Critiques (read, FactCheck.org):**
  - Krosnick: mostly an opt-in online panel, so no margin of error applies, and Rasmussen is "known to produce very biased results".
  - Levitt: the results are inconsistent with signature-mismatch flag rates anywhere.
  - Disability advocates: helping a disabled voter is legal.
  - The survey's 30% mail share sits well below EAVS's 43% for 2020.
  - FiveThirtyEight dropped Rasmussen in March 2024.
- **Other surveys of household help or coercion:** a follow-up search found no peer-reviewed study measuring the same behaviour. Closest evidence: Oregon surveys (D70, D71), ballot-secrecy research (D72) and UK family-voting research (D73). Still to check: SPAE and Cooperative Election Study questionnaires.
- **Reading for secrecy rather than fraud.** Even where help is lawful, 21% saying they filled out someone else's ballot "in part or in full" and 19% saying someone filled out theirs means those votes were not cast in private. That is a measure of lost secrecy, which the secret ballot exists to prevent, even if it is a poor measure of fraud.
- **Helps:** `mail-exception` rhetorically. **Hurts:** `mail-exception` (method; the wording mixes lawful help with fraud; administrative data contradict it). Helps `mail-works`.
- **Likely status:** not-supported as an estimate of mail fraud. Report it as a claim, with its method.

### D66. [MAIL] Signature rejections by state, county and voter group
- **Sources:**
  - Ballotpedia News, 15 Aug 2025: https://news.ballotpedia.org/2025/08/15/nationwide-mail-ballot-rejection-rate-was-1-2-in-2024-higher-than-2016-and-2020/ (read; summarises EAVS).
  - Washington State Auditor, "Evaluating Washington's Ballot Rejection Rates" (1 Feb 2022): https://sao.wa.gov/performance_audit/evaluating-washingtons-ballot-rejection-rates and https://sao.wa.gov/the-audit-connection-blog/2022/few-ballots-rejected-rejection-rates-vary-county-gender-and-race-performance-audit-finds (read).
  - Baringer, Herron & Smith, *Election Law Journal* 19(3), 2020 (Florida 2018). Not read; electionlawblog 403.
- **Shape:** cross-state snapshot (EAVS, with a 2016–2024 series to build), and a cross-county and demographic snapshot (Washington 2020).
- **What it shows:**
  - **2024, by reason and state (read):** 1.2% of mail ballots rejected nationally; non-matching signatures were 40.7% of rejections. Highest: Arkansas 8.8%, Delaware 5.1%, Oklahoma 4.3%. Lowest: Vermont, Maine and Indiana at 0.2%. Reason shares cover only reported reasons, and some states report none (*unverified*, Pew).
  - **Washington 2020, scale and groups (read):** 0.72% rejected statewide, fewer than 30,000 of 4.2 million. Black, Native American, Hispanic and Asian/Pacific Islander voters were each above 1.2%, against 0.63% for white voters. Younger and male voters were rejected more.
  - **Washington 2020, counties (read):** after demographic controls, some counties were 4–7 times likelier to reject than others.
  - **Washington 2020, the audit's own check (read):** on a re-check of more than 7,200 signatures, auditors agreed with counties more than 98% of the time and "did not find evidence of bias in the decisions made by elections workers".
  - **Florida 2018 (unverified):** young voters, voters needing assistance, and county variation.
- **Helps:** `signature-discretion` (signatures are the largest reason; rates differ by group and county). **Hurts:** `signature-discretion`'s bias claim (Washington found no worker bias and 98% agreement); `mail-exception` (rejections are low).
- **Likely status:** well-supported for disparities in Washington 2020. Their cause is unknown.

### D67. [MAIL] How states verify mail ballots and cure them (NCSL Tables 14 and 15)
- **Sources:**
  - NCSL Table 14: https://www.ncsl.org/elections-and-campaigns/table-14-how-states-verify-voted-absentee-mail-ballots (read; the page showed an update date of 23 Oct 2026, which needs re-checking).
  - NCSL Table 15, updated 31 Aug 2026: https://www.ncsl.org/elections-and-campaigns/table-15-states-with-signature-cure-processes (read).
- **Shape:** cross-state snapshots.
- **What it shows (read):**
  - 32 states plus PR check signatures. 9 states plus DC and USVI do not (CT, DE, GA, MD, NM, PA, VT, VA, WY).
  - 6 states match ID or SSN digits instead (GA, MN, NM, OH, TX, VA). Utah switches to ID digits in 2029.
  - Witness requirements in 8 states; notary in 3.
  - Washington requires training on statewide signature standards. Colorado requires two more judges, of different parties, to review a mismatch.
  - "Thirty-five states and Washington, D.C., have ballot curing processes statewide." What can be cured varies.
- **Helps:** `signature-discretion`'s fix (ID-number states exist, and Utah is switching). **Hurts:** `signature-discretion`'s "usually untrained" (training and bipartisan review are required in some states) and its urgency (most states already have cure).
- **Likely status:** well-supported.

### D68. [MAIL] Signature-matching lawsuits
- **Sources:**
  - *Saucedo v. Gardner* (D.N.H., 14 Aug 2018): ACLU case page https://www.aclu.org/cases/saucedo-v-gardner (read); opinion PDF unreadable.
  - *Richardson v. Texas Sec. of State*, No. 20-50774 (5th Cir., 19 Oct 2020): https://caselaw.findlaw.com/court/us-5th-circuit/2091702.html (read); later history via Democracy Docket (read).
  - Pennsylvania Supreme Court, J-113-2020 (23 Oct 2020), via PhillyVoice (read).
  - *Democracy N.C. v. NCSBE* (2020): *unverified*.
- **Shape:** legal record.
- **What it shows (read):**
  - **New Hampshire 2018:** signature-mismatch rejection without notice or hearing violated due process. The process was "fundamentally flawed", and moderators had no handwriting training.
  - **Texas 2020:** the 5th Circuit stayed a notice-and-cure order. It held there is no due-process interest in voting by mail and that signature checks are reasonable because "the potential and reality of fraud is much greater in the mail-in ballot context". About 5,000 rejections for perceived mismatches in 2016 and 2018 combined. Reversed in 2022 on sovereign immunity; certiorari denied 21 Feb 2023.
  - **Pennsylvania 2020:** the Election Code "does not authorize or require county election boards to reject" ballots on signature analysis.
  - Not reached: *Martin v. Kemp*, *Florida Democratic Party v. Detzner*, *Self Advocacy Solutions v. Jaeger*.
- **Helps:** `signature-discretion` (New Hampshire; Pennsylvania). **Hurts:** `signature-discretion` (the 5th Circuit upheld discretion); helps `mail-exception` (the court's fraud language).
- **Likely status:** well-supported as a record.

### D69. [MAIL] Cobb County, Georgia 2020 signature audit
- **Source:** AP via NBC Connecticut, 30 Dec 2020 (read). The Georgia Secretary of State release returned 403.
- **Shape:** event record (one audit).
- **What it shows (read):** 15,118 envelopes from randomly selected boxes, about 10% of the county total, sized for 99% confidence. "No fraudulent absentee ballots". Two ballots should have been flagged for cure; both voters confirmed they had voted.
- **Helps:** `mail-works`. **Hurts:** `mail-exception` (no impostor ballots). Also, nothing to catch means nothing was shown about detection power.
- **Search gap:** no case was found of officials using signature review to change a result. Maricopa 2021 and Colorado's referrals of signature discrepancies to prosecutors were not searched.
- **Likely status:** well-supported as one audit.


### D70. [MAIL] Oregon voter surveys after universal vote by mail (1998 onward)
- **Source:** reported in "Voting by mail is convenient, but not always secret", The Conversation, Aug 2020: https://theconversation.com/voting-by-mail-is-convenient-but-not-always-secret-144716 (search summary only; the underlying surveys — likely Southwell and Burchett — not yet identified or read).
- **Measures:** whether others were present when the voter completed a mail ballot, and whether the voter felt pressured.
- **Shape:** snapshots (two surveys).
- **What it shows (*unverified*):** as many as a third of voters completed their ballots with others present; 1% or fewer felt pressured.
- **Helps:** `mail-exception` (a large share of mail ballots are not completed alone). **Hurts:** `mail-exception` (few report pressure). Addresses the human's point that lawful help still means someone else sees the vote.
- **Likely status:** well-supported once the primary surveys are read; the pressure figure is a self-report and may undercount.

### D71. [MAIL] Oregon single-county survey (Portland State University)
- **Source:** cited in Heritage Foundation, "Four Stolen Elections: The Vulnerabilities of Absentee and Mail-In Ballots": https://www.heritage.org/election-integrity/report/four-stolen-elections-the-vulnerabilities-absentee-and-mail-ballots (search summary only; partisan lead — trace to the original survey).
- **What it shows (*unverified*):** 5% of voters said "other people marked their ballots"; 2.4% said others signed their ballot envelopes.
- **Shape:** one-off snapshot, one county.
- **Helps:** `mail-exception`. Status: lead only until the original is found.

### D72. [MAIL] Ballot-secrecy beliefs: Gerber, Huber, Doherty, Dowling and Hill
- **Sources:** "Is There a Secret Ballot? Ballot Secrecy Perceptions and Their Implications for Voting Behaviour", *British Journal of Political Science* (2013), reported via search; "Do Perceptions of Ballot Secrecy Influence Turnout? Results from a Field Experiment", *AJPS* (2013), NBER w17673: https://www.nber.org/system/files/working_papers/w17673/w17673.pdf; related: "The voting experience and beliefs about ballot secrecy", *PLOS ONE*: https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0209765 (none read yet).
- **What it shows (*unverified*):** in a national sample, 25% did not believe their ballot choices are kept secret and over 70% shared their vote choice with others; social pressure had more effect on vote choice among those who doubted secrecy. The field experiment found secrecy reassurance letters raised turnout among people with no voting history.
- **Shape:** survey snapshot plus experiment.
- **Helps:** `mail-exception` (secrecy perceptions change behaviour). **Hurts:** `mail-exception` partly (doubts exist for in-person voting too).
- **Likely status:** well-supported as published findings.

### D73. [MAIL] UK research on family voting and remote-voting secrecy
- **Sources:** Birch and Watt (2004) on remote voting, summarised in the University of Essex REF impact case study: https://impact.ref.ac.uk/casestudies/CaseStudy.aspx?Id=43401 (search summary only); Democracy Volunteers' observation reports on family voting (2018 onward; cited in press, not read).
- **What it shows (*unverified*):** remote voting loses ballot secrecy and opens room for undue influence; the UK government accepted the findings and changed postal-vote law in 2006. Observers report family voting in polling stations too, in some areas at scale.
- **Shape:** record and observational counts.
- **Helps:** `mail-exception`. **Hurts:** it partly (family voting also happens at polling stations).

### D74. [BOTH] Pew Research Center, confidence in US elections, October 2026
- **Source:** "Broad Public Confidence in Elections in the U.S., but Partisans Differ Over Concerns About Access, Security", 20 Oct 2026: https://www.pewresearch.org/politics/2026/10/20/broad-public-confidence-in-elections-in-the-u-s-but-partisans-differ-over-concerns-about-access-security/ (title from search; not read).
- **Measures:** confidence that votes will be counted accurately, by party and voting method, ahead of the 2026 midterms.
- **Shape:** latest point in Pew's series (see D19 for the run).
- **Helps:** `mail-exception` and `election-day-receipt` (partisan gap in trust); `mail-works` (broad overall confidence).

### D75. [BOTH] Disputed US election outcomes
- **To research:** the record of losers disputing results — Florida 2000, Ohio 2004, Georgia's 2018 governor's race, the 2020 presidential election, Arizona's 2022 governor's race — with what was alleged, whether mail ballots were central, how each was resolved, and what happened to public confidence afterwards (D18, D19, D41).
- **Context:** loser's-consent research in other democracies (Anderson et al., *Losers' Consent*).
- **Shape:** dated record.
- **Helps:** `mail-exception`, `election-day-receipt` (trust, and the cost of disputed results). **Hurts:** both if disputes track who lost rather than how votes were cast (D41).

---

## 3c. Proposed reports

The report plan of [stage 4b](../../WORKFLOW.md#4b-plan-the-combined-reports). Six combined reports; no Other-facts report is needed. Each report covers one core area, sliced several ways, and is meant to be read as a whole; viewpoints that cite the same area point at different observations in it. This replaces the archived combined plan: its R1 + R9 + the mail half of R10 → R1; the mail half of R2 + D66–D69 → R2; R3 → R3; the NC-09 part of R8 + D51, D52, D55, D65 → R4 (new); D56, D61–D64 → R5 (new); R12 → R6. Report ids here are new to this topic.

Observations are written as the finding each viewpoint would link, with the candidate it rests on. "Against" lines are the findings in the same report that cut against that viewpoint, so a reader following its link meets them.

**R1. Mail Voting in the US: Who Uses It, Where, and Its Effects on Turnout and Party, 1996–2026**
(D1, D3, D2, D6, D26, D47, D10, D27, D19)
- Artifacts, in reading order:
  1. National shares of votes by mail, early in person and on Election Day, 1996–2024 (CPS, with its 2004 question break; EAVS 2004–2024) — *over time* (D3, D1).
  2. Mail share by state, 2024, with all-mail states and their adoption dates marked — *by state* (D1, D6).
  3. Mail use by party, age, rurality and disability — *by subgroup* (D2, D3, D26).
  4. States offering no-excuse or all-mail voting, 2016–2026 — *over time* (D47).
  5. Estimated effects of universal and no-excuse mail on turnout and party share, before and in 2020 — *by study* (D10, D27).
  6. Support for no-excuse mail voting by party, 2020–2025 — *over time, by party* (D19).
- Observations by viewpoint:
  - **`mail-works`:** in 2020, 53% of voters with disabilities voted by mail against 42% without (D26); county roll-outs of universal mail raised turnout about 2.1 points with no partisan tilt (D10); a Republican-led state, Utah, votes by mail (D6).
  - **`mail-exception`:** the mail share fell from 43% in 2020 to 30% in 2024 (D1); Republican support for no-excuse mail fell to 32% in 2025 (D19).
  - **`election-day-receipt`:** mail gives neither party an advantage (D10, D27), so the case for deadlines rests on timing and security, not partisanship.
  - **`states-decide`:** 37 states plus DC are expected to offer no-excuse or all-mail voting in 2026, up from 30 in 2016 (D47).
  - **Against `mail-works`:** the turnout gain is small (D10, D27); Democrats now use mail far more than Republicans (D2).
  - **Against `mail-exception`:** mail is still above its pre-pandemic share (D1), and its users skew older, rural and disabled (D3, D26).

**R2. Mail Ballot Rejection, Signature Checks and Curing, 2016–2026**
(D1, D2, D66, D67, D68, D69, D31, D16)
- Artifacts, in reading order:
  1. National mail-ballot rejection rate, 2016–2024, on both denominators (returned mail ballots; all votes cast) — *over time* (D1, D2, D66).
  2. Rejection reasons, 2024 — *by reason* (D1).
  3. Rejection rate by state, 2024, with all-mail and cure states marked; the all-mail comparison — *by state* (D66, D67, D1).
  4. Washington 2020: rejection by race, age and sex; county differences after controls; the auditor's re-check of 7,200 signatures — *by subgroup, by county* (D66).
  5. How states verify ballots (signature, ID number, witness, notary), cure them, and train and review — *rules by state* (D67).
  6. Rejection before and after ID-number checks, Texas and Georgia, beside the national rate — *over time, comparators* (D31, D16).
  7. Cure counts, 2024 — *the rest of the record* (D1, D31).
  8. Court rulings on signature matching (New Hampshire 2018, Texas 2020, Pennsylvania 2020) — *legal record* (D68).
  9. Cobb County's 2020 signature audit, and a `dataStillNeeded` entry for any case of signature review used to change a result (M3c) — *the rest of the record* (D69).
- Observations by viewpoint:
  - **`signature-discretion`:** signature problems were the largest single reason for rejection, 40.7% in 2024 (D1); in Washington, Black, Native American, Hispanic and Asian/Pacific Islander voters were each rejected at above 1.2%, against 0.63% for white voters, and some counties were 4–7 times likelier to reject after controls (D66); a New Hampshire court found the process "fundamentally flawed" (D68); Pennsylvania's code "does not authorize or require" rejection on signature analysis (D68).
  - **`mail-works`:** 1.2% of returned mail ballots were rejected, 0.34% of votes cast; all-mail states were "not significantly different"; over half of the 585,000 ballots in cure were cured (D1); Cobb's audit found "no fraudulent absentee ballots" (D69).
  - **`mail-exception`:** the 5th Circuit upheld signature checks because "the potential and reality of fraud is much greater in the mail-in ballot context" (D68); mail ballots are rejected far more often than in-person votes (D1).
  - **Against `signature-discretion`:** Washington's auditors agreed with counties more than 98% of the time and found no worker bias (D66); Washington requires training and Colorado bipartisan review; 35 states plus DC have statewide cure (D67); Texas's switch to ID-number checks raised rejections, so the objective alternative also rejects valid ballots (D31, D16).
  - **Against `mail-works`:** rejection rates differ by group and by county (D66); Arkansas rejected 8.8% in 2024 (D66).
  - **Against `mail-exception`:** Cobb's audit found no impostor ballots (D69), though it shows nothing about how well review catches them.

**R3. Ballot Receipt Deadlines, Late Ballots and Counting Speed, 2016–2026**
(D5, D44, D23, D22, D43, D1, D24, D42)
- Artifacts, in reading order:
  1. Receipt and postmark deadlines by state, with grace windows, 2025 changes and military and overseas rules shown separately; reconciling 15 states with *Watson*'s "roughly 30" — *by state* (D5).
  2. Number of states counting late-arriving ballots, 2016–2026 — *over time* (D44).
  3. Late arrivals and late rejections against ballots cast and margins: Nevada 2024; Washington, Michigan and Wisconsin 2026 primaries; late arrival's share of national rejections — *denominator* (D23, D44, D1).
  4. Hours to count 50%, 75% and 95% of votes, by state, 2020 and 2024 — *by state, over time* (D22).
  5. When mail-ballot processing may begin, by state, beside count speed and mail share — *comparators* (D43, D22, D1).
  6. *Watson*'s holding — *legal record* (D24).
  7. Expert ratings of the US vote count — *comparators* (D42).
- Observations by viewpoint:
  - **`election-day-receipt`:** states counting late ballots fell from 21 plus DC in 2020 to 15 plus DC for 2026 (D44); the slowest-counting states are mostly heavy-mail, while Texas and Florida counted more than 10 million votes each within about a day (D22); *Watson* notes the interest in avoiding "the appearance of fraud from late-arriving ballots" (D44).
  - **`mail-works`:** late ballots were under 1% of votes cast in Clark and Washoe counties in 2024 (D23); nationally a majority of votes were counted in about 2 hours (D22); experts rate the US count "strong" (D42).
  - **`states-decide`:** *Watson* left deadlines to legislatures (D24); deadlines and processing rules differ widely (D5, D43).
  - **Against `election-day-receipt`:** deadlines turned postal delay into rising rejections in the 2026 primaries — over 20,000 in Washington, 75% of its rejections (D44); late arrival was 17.8% of 2024 rejections (D1); the pre-processing advantage "essentially disappeared by the 24-hour mark", and Arizona and Nevada pre-process yet count slowly (D43); grace-period states include Texas and Alaska (D5).
  - **Against `mail-works`:** about 2% of Nevada's mail ballots arrived late (D23, *unverified*), and California reported about a third of its vote over roughly a month (D22).

**R4. Absentee and Mail Ballot Fraud and Manipulation of the Count in the US, 1936–2026**
(D25, D51, D52, D55, D13, D38, D65, D48, D50; D1 and D3 as denominators)
- Artifacts, in reading order:
  1. Organised absentee and mail-ballot fraud and ballot handling — East Chicago 2003, NC-09 2018, Paterson 2020 — with method, ballots involved against margin, how it was detected, the remedy, the criminal outcome and the date that outcome is as of — *the rest of the record* (D51, D25, D52).
  2. Officials manipulating which ballots count or whether results are certified — Box 13 in 1948, Wayne County 2020, Otero and Cochise 2022, Georgia's election board 2024 — same columns, with a `dataStillNeeded` row for signature review used to change a result (M3c) — *the rest of the record* (D55).
  3. In-person and machine fraud over the same era, for comparison — Kansas City 1936, Chicago 1982, Tammany — *comparators* (D48, D50).
  4. Fraud case counts by type (Heritage, a lower bound with its method stated) against mail ballots cast — *denominator* (D13, D1, D3).
  5. Carter–Baker 2005 on absentee ballots and third-party handling — *the rest of the record* (D38).
  6. Survey self-reports: the 2023 Rasmussen–Heartland questions, sample, results and critiques, beside administrative rejection rates — *by source quality* (D65, D1).
- Observations by viewpoint:
  - **`mail-exception`:** organised absentee fraud has changed or voided results — East Chicago's trial court invalidated 155 absentee votes and 47 people were convicted (D51); the NC-09 board found the election "corrupted by fraud" and ordered a new one (D25); a Paterson court voided a mail election (D52); Carter–Baker: "Absentee ballots remain the largest source of potential voter fraud" (D38); the Rasmussen–Heartland figures, reported with their method (D65).
  - **`mail-works`:** each case was caught — NC-09 through the outlier rate of unreturned ballots and voter interviews — and remedied (D25, D51); listed cases are few against tens of millions of mail ballots a cycle (D13, D1); the Paterson indictment was dismissed and there are no convictions (D52); the survey's opt-in panel and wording do not support a fraud rate (D65).
  - **`signature-discretion`:** officials have tried to manipulate which votes count or are certified, from Box 13 to the post-2020 refusals (D55).
  - **Against `signature-discretion`:** every post-2020 refusal ended in certification, forced by courts or state officials (D55), and no case of signature review used to change a result was found.
  - **Against `mail-exception`:** the in-person machine record over the same era sits beside it — 58 convicted after Chicago 1982, 259 of 278 in Kansas City (D48, D50).
  - **Crux:** fraud by outsiders and manipulation by officials have no common measure.

**R5. The Secret Ballot and Postal Voting in Other Democracies, 1856–2026**
(D56, D61, D62, D63, D64)
- Artifacts, in reading order:
  1. Secret-ballot adoption and stated motives: Australia 1856, Britain 1872, US states 1884–1891, South Carolina 1950 — *dated record* (D56).
  2. What secrecy changed: Chile's 1958 reform, before and after; a `dataStillNeeded` entry for US and UK studies (Heckelman, Kam) — *before and after* (D56).
  3. Countries allowing in-country postal voting to all voters, some or none (IDEA, Aug 2025) — *comparators* (D63; counts still to be extracted).
  4. Postal share of the vote over time: Germany 1957–2025; Britain 2010–2019; Switzerland's over 90% — *over time, comparators* (D64, D62).
  5. Restrictions and reforms, with their stated reasons: France's 1975 abolition, the 1988 abstention table and the restoration bills; Britain's Birmingham 2005 and Tower Hamlets 2015 judgments and the 2006 and 2022 reforms — *the rest of the record* (D61, D62).
  6. Germany's Constitutional Court on postal voting (2013) — *legal record* (D64).
- Observations by viewpoint:
  - **`mail-exception`:** the secret ballot was adopted against "the corruption of the wealthy and the violence of the powerful", and in Chile it removed the landlord-patronage vote (D56); France abolished postal voting in 1975, IDEA says "because of the incidence of fraud" (D61); a British judge found "literally thousands of votes" falsified in Birmingham (D62); Germany's court conceded that postal voting reduces public control of how votes are cast (D64).
  - **`mail-works`:** Germany's postal share rose to 47.3% in 2021 and its court upheld postal voting without stated reasons; Switzerland's over-90% postal vote "hasn't led to major political debates about security or fraud" (D64); Britain kept postal voting on demand and finds "no evidence of large-scale electoral fraud" (D62); France's abstention did not rise overall after abolition (D61).
  - **`signature-discretion`:** Britain checks postal ballots against date-of-birth identifiers, an objective check of the kind it proposes (D62).
  - **Against `mail-exception`:** no study here measures coercion of mail voters (D56); France's reason is disputed and restoration bills keep coming (D61); whether restriction is the norm "in most democracies" waits on IDEA's counts (D63).
  - **Against `mail-works`:** Britain's large postal-fraud cases arose under postal voting on demand, and needed new identifiers and handling limits (D62).

**R6. Federal and State Power Over Mail Voting Rules, 1986–2026**
(D24, D45, D46, D47, D6, D5)
- Artifacts, in reading order:
  1. Dated timeline of federal laws touching mail voting: UOCAVA 1986, NVRA 1993, HAVA 2002, MOVE 2009; the failed Freedom to Vote Act (no-excuse absentee for all) and the SAVE America Act — *over time* (D45, D24).
  2. Live measures and court status as of 23 Oct 2026: EO 14399 and its USPS rule; *Watson* — *the rest of the record* (D24).
  3. Key holdings: *ITCA*, *Moore*, *Watson*, *Trump v. California*, *USPS v. California* with the Alito dissent — *legal record* (D46, D24).
  4. State variation over time: no-excuse and all-mail counts 2016–2026, all-mail adoption dates, receipt deadlines — *by state, over time* (D47, D6, D5; detail in R1 and R3).
- Observations by viewpoint:
  - **`states-decide`:** the USPS rule is blocked for November 2026 (D24); *Watson* leaves the policy to legislatures (D24); states' mail rules vary widely and have moved both ways (D47, D6, D5).
  - **`mail-exception`:** the House has passed the SAVE America Act, which per coverage would end universal mail voting (D24); Alito and Thomas: Congress "may create such rules under the Elections Clause" (D24).
  - **`election-day-receipt`:** *Watson* says Congress could set a national receipt deadline (D24).
  - **Against `states-decide`:** the Supreme Court let EO 14399 itself stand (D24); Congress's Elections Clause power is "paramount" (D46); Congress has already set national floors for military and overseas mail ballots (D45).

**R7. Confidence in US Elections and Disputed Results, 2000–2026**
(D18, D19, D41, D74, D75; D72 for secrecy beliefs)
- Artifacts, in reading order:
  1. Confidence that votes are counted accurately, by party, every election since 2000, in Gallup's and Pew's own series side by side — *over time, by group* (D18, D19, D74).
  2. Confidence in mail ballots against in-person ballots, by party — *by method* (D19, D74).
  3. Disputed outcomes: each case, what was alleged, whether mail ballots were central, how it was resolved, and confidence before and after — *the rest of the record* (D75).
  4. The winner–loser gap in the US against other democracies — *comparators* (D41, D75's loser's-consent research).
- Observations by viewpoint:
  - **`mail-exception`:** trust in mail ballots is lower than in in-person ones and split by party; disputed results are destabilising whatever their merits; detected fraud is a floor, so low counts do not by themselves reassure (D19, D74, D75).
  - **`election-day-receipt`:** confidence falls when counts take days and leads change (D75, D41).
  - **`mail-works`:** overall confidence remains broad (D74); confidence moves with who won more than with how votes were cast (D41).
  - **Crux:** whether changing mail rules would move the losing side's confidence is a prediction no study settles.

**Candidates placed.** R1 D1, D2, D3, D6, D10, D19, D26, D27, D47; R2 D1, D2, D16, D31, D66, D67, D68, D69; R3 D1, D5, D22, D23, D24, D42, D43, D44; R4 D1, D3, D13, D25, D38, D48, D50, D51, D52, D55, D65; R5 D56, D61, D62, D63, D64, D70, D71, D72, D73; R6 D5, D6, D24, D45, D46, D47; R7 D18, D19, D41, D74, D75.

**Left out deliberately** (kept in 3b because they are [BOTH]):
- None. D18 and D41 were unplaced until the outline added confidence questions; they are now in R7.

---

## 3d. Problems for the human

**Decisions about the split:**
- **Retagging.** D1, D25, D51, D52 and D56 moved from [MAIL] to [BOTH], and D48 from [ID] to [BOTH] (reasons in the header). The alternative was to keep the tags and link across files.
- **Copies.** [BOTH] candidates now exist in two files. Stage 4 verbatim quoting must update both copies, or the human could name one file as the master.
- **The Rasmussen–Heartland survey goes in the fraud report (R4)**, beside the case record and administrative rates, rather than in a report of its own. A report built around one survey would be the "one side's preferred number" report that stage 4b warns against.
- **Signature checks and rejection share one report (R2)**, because signatures are the largest rejection reason and `mail-works` and `signature-discretion` cite opposite slices of the same data.
- **D62 (Britain) appears twice in substance:** its fraud cases are a comparator in R4's framing and its reforms and usage series are in R5. It is listed only in R5 to keep one home; R4 links to it.
- **Two [BOTH] candidates are unplaced** (D18, D41; see 3c).

**Outline claims the evidence does not support as written:**
- **`election-day-receipt` "Ohio, North Dakota, Utah and Kansas ended that in 2025."** Kansas's change is enjoined, so Kansas still counts late ballots (D5).
- **`states-decide` on the courts.** The courts did block the USPS rule for November. But the Supreme Court let EO 14399 itself proceed (D24, D46). Do not imply the March 2026 order is blocked.
- **`states-decide` "Oregon's all-mail system and Mississippi's excuse-only system were each chosen by their own voters."** No candidate covers how either was adopted. Research it or drop it.
- **`mail-works` "Colorado, Utah, Washington and Oregon… no fraud scandals".** No candidate measures fraud by state, and Utah's reported phase-out of all-mail voting is *unverified* (D6). Narrow it to what R1 and R4 show.
- **`mail-exception` "Paterson 2020" as a fraud case.** A court voided the election. But the April 2026 dismissal of the main indictment means no criminal case has been proven (D52). Call it "a mail election voided over ballot handling".
- **`mail-exception` "France abolished postal voting in 1975 over fraud."** IDEA says so. A German source gives a postal-worker security rationale, and the French government's 1988 answer found no rise in abstention (D61). Corsica appears in no fetched source. Narrow it to "France abolished postal voting in 1975, citing fraud", and add the restoration bills.
- **`mail-exception` "a 2005 British judgment said it would 'disgrace a banana republic'."** The quote was read only via Wikipedia, since the judgment was not fetched. Mawrey's 2013 *Slough* judgment does confirm the scale (D62).
- **`mail-exception` "a large share of 2020 mail voters said they had filled out a ballot for someone else."** The survey asked only about 325 mail voters, mostly through an opt-in panel. Its question includes lawful help to a spouse or child. Its own mail share (30%) contradicts EAVS (43%) (D65). The status should be not-supported as a fraud estimate.
- **`mail-exception` "as it is in most democracies".** Untested until IDEA's country counts are extracted (D63). Germany (37–47% postal) and Switzerland (over 90%) cut against it (D64).
- **`signature-discretion` "election workers, usually untrained".** Washington requires training, and Colorado requires bipartisan review (D67). Washington's auditor agreed with counties 98% of the time and found no worker bias, though group disparities remained (D66). Narrow it to the disparities and the variation between states and counties.
- **`signature-discretion` "has signature review ever been used to change a result?"** No case was found (D69), but the search was incomplete.

**Viewpoints with thin evidence:**
- **`mail-exception`'s secret-ballot argument** has strong evidence on polling-place secrecy (D56). Nothing measured coerced mail voting; the only US survey is D65.
- **`signature-discretion`'s group disparities** rest on one state-year (Washington 2020); Florida 2018 is unread (D66).
- **The cross-cutting question "fraud by outsiders or manipulation by officials"** has case lists on both sides but no common measure.

**No good data exists:**
- Undetected fraud.
- Ballots counted inside grace periods nationally.
- Survey measures of household coercion in mail voting.

**Sources whose reliability is disputed:**
- **Fraud compilers:** Heritage (curated, no denominator).
- **Party filings:** the McKoy petition (a candidate's filing).
- **Polls:** Rasmussen–Heartland (opt-in panel; FiveThirtyEight dropped Rasmussen).
- **Secondary-only:** Wikipedia was used as the read source for Box 13, Otero, Cochise and the German postal series. Each needs its primary source.

**Blocked sources, for download by hand:**
- **UK:** the Electoral Commission website (403 on every page: fraud data, postal-vote statistics); the 2005 Birmingham judgment text.
- **France:** Legifrance (the 1975 law).
- **Data in images or unopened files:** the IDEA postal-voting country lists (images); the Bundeswahlleiterin series files.
- **Other:** electionlawblog (Shaikh & Stewart; Baringer et al.); PPIC; the Washington Post Rasmussen critique; the MIT *How We Voted* PDF (too large); the Georgia secretary-of-state site (Cobb audit release).
- **Not reached when the search budget ran out:** Heckelman, Rusk and Kam on the secret ballot; Swiss fraud cases; the signature cases *Martin v. Kemp*, *Detzner* and *Jaeger*; the Gwinnett, Colorado and California signature studies; other surveys on household help; 2025–26 certification refusals; the Cochise outcome for Crosby.

**The facts will move within weeks.** These will alter R1, R2, R3, R4 and R6:
- the 3 Nov midterms (the first general election since several states ended grace periods);
- a possible lame-duck vote on the SAVE America Act;
- the merits of EO 14399;
- the Paterson appeal;
- the 2026 EAVS, due mid-2027.

---

## Stage 4 verification (2026-10-26)

Each candidate was checked at its primary source with `curl` (PDFs to text). **Reused** means the quote was already confirmed while building `content/topics/us-voter-id/facts/` and is copied from there, not refetched. This covers most [BOTH] candidates: EAVS 2016–2022, the TX and GA briefs, Gallup, Pew (including the Oct 2026 D74 release), Carter–Baker, NC-09, East Chicago, Paterson, Chicago 1982, Heritage, *Burson*, *ITCA*, *Trump v. California* and the SAVE America coverage. Quotes, URLs, publishers and dates are in the four `verify-*.md` files.

**Counts (47 candidates, including new D76): 34 verified, 9 corrected, 4 partly unverifiable, 0 dropped.**

| Cand. | Status | What changed or was confirmed |
|---|---|---|
| D1 | verified | 2024: 584,463 rejected, 1.2% of returned; reasons "non-matching **or incomplete**" signature 40.7%, late 17.8%, unsigned 10%; all-mail "not significantly different"; **585,457** entered cure, **317,191 (54.3%)** cured. Series added: 1.0% (2016), 1.4% (2018), 0.8% (2020), 1.5% (2022), 1.2% (2024). |
| D2 | verified | SPAE 2024: Democrats 37% by mail, Republicans 24%; the gap narrowed because Democrats pulled back. |
| D3 | **corrected** | CPS 2024: 39.6 / 30.7 / 29.0% confirmed. The mode series is confirmed only for **2004–2024** (CRS); the 1996 start is unconfirmed. |
| D5 | verified | 35 states require receipt by Election Day; 15 plus DC and three territories accept later ballots; ND, OH, UT ended grace periods in 2025; Kansas enjoined (3 days). |
| D6 | **corrected** | Adoption dates added (OR 1998 initiative/2000, WA 2011/2012, CO 2013/2014, UT 2012/2019, HI 2019/2020, CA, NV, VT 2021/2022, DC 2022/2023). **Utah HB 300 (2025) makes mail opt-in from 2029**; NCSL's table does not show it yet. |
| D10 | verified | Turnout +2.1–2.2 pts of citizen voting-age population; Democratic turnout share +0.1 with trends (upper bound about 0.3); CA, UT, WA 1996–2018. |
| D13 | verified | Heritage file, archived Jul 2026: **1,619 records, 387 tagged absentee, 34 impersonation** (my count). Heritage calls it "a sampling ... not comprehensive". |
| D16, D31 | verified (reused) | TX Mar 2022 12.38% (24,636); TX 2018 1.5%, 2020 0.8% (EAC via TPR); TX 2022 3.4%, 2024 about 3.5%; GA 2022 1.5%, 2024 about 1.7%. **GA 2018 0.15% still unverified.** |
| D18, D19, D41, D42 | verified (reused) | As in the voter-ID report: Gallup accuracy series 2004–2024; Pew 2020–2026; winner effect; PEI. |
| D22 | verified | Majority counted in about 2 hours, 75% in about 3; TX and FL more than 10m within about a day; hours to 95%: AZ 73→147, NV 159→51, PA 49→8. |
| D23 | verified | About 9,500 + 2,400 late of nearly 1.3m in Clark and Washoe 2024. "About 2% of mail ballots" and the statewide margins are still unverified. |
| D24 | verified | *Watson* (5–4, 29 Jun 2026): "roughly 30 States"; "appearance of fraud from late-arriving ballots"; "properly directed to legislatures". *USPS v. California*: stay denied; Alito and Thomas: "Congress may create such rules". |
| D25, D38, D48, D51, D52 | verified (reused) | As before. East Chicago's 155 invalidated votes and Carter–Baker's third-party-handling line need re-quoting at stage 5. |
| D26 | partly unverifiable | 2020: "More than 53%" of disabled voters voted by mail, against 42%. The 2022 "6% vs under 1%" figure is not in the blog text. |
| D27 | verified | Being 65 in Texas in 2020 raised turnout by 0.02 pts (upper bound 0.26); it shifted voters between methods. |
| D43 | verified | 44 states plus DC, PR **and USVI** may pre-process; 6 only on Election Day. Stewart: 63% vs 78% at four hours; "the gap between states had essentially disappeared" at 24 hours. |
| D44 | verified | Grace-period states: 13 (2016), 15 + DC (Jan 2020), 21 + DC (Nov 2020), 19 + DC, 18 + DC, 15 + DC (2026). 2026 primaries: WI about 5,000 late (78%), **compared with spring 2023, not 2024**; MI over 10,000; WA late arrivals 16,000 → over 20,000, 75% of rejections. |
| D45, D46, D47 | verified (reused/fetched) | No-excuse or all-mail: 30 + DC (2016), 38 + DC (Nov 2020), 35 + DC, 36 + DC, 37 + DC (2026). |
| D50 | **corrected** | Kansas City 1936: "a total of 259 convictions" (US Attorney W.D. Mo.), not "259 of 278 defendants". |
| D55 | partly unverifiable | Otero and Cochise verified (Crosby awaiting trial). Box 13, Wayne County and the Georgia board are still secondary only. |
| D56 | **corrected** | US adoption from *Burson*: Louisville, Massachusetts and New York in 1888; "almost 90 percent of the States" by 1896. Chile 1958 confirmed (AER abstract; no numbers). The Australian 1856 dates, SC 1950 and the Chartist quote are still secondary. |
| D61 | verified | The 1988 official answer gives fraud as the reason: postal voting "était l'occasion de fraudes graves", allowing "électeurs fictifs"; proxy voting was widened at the same time. Abstention table confirmed. **The 2020 restoration bill was rejected on 3 Feb 2022; the 2023 Senate bill (presidential only) has lapsed.** No source mentions Corsica. |
| D62 | **corrected** | [2013] EWHC 2572 is **Woking** (*Ali v Bashir*), not Slough; the **Slough** case was **2008** and was register fraud. Birmingham "banana republic" confirmed in the 2005 Afterword. Tower Hamlets 2015 voided. UK postal share is **18.8% (2010), 20.5% (2015), 21.7% (2017), 21.0% (2019)** of valid votes (Commons Library, 1945–2019), not Full Fact's 15.3% and 18%. Electoral Commission: 1,462 alleged cases in 2019–23, 11 convictions; 6 postal allegations in 2023. |
| D63 | **corrected** | IDEA, Aug 2025: **11 countries allow in-country postal voting for all voters** (Canada, Germany, Iceland, South Korea, Liechtenstein, Luxembourg, New Zealand, Poland, Switzerland, UK, US); **21 for some** (France and Australia among them); out of **204** coded. 2021 data: 27% of OECD countries for all voters. The PDF's pie chart contradicts its own list; cite the list. |
| D64 | verified | Official Bundeswahlleiterin series 1957–2025 (4.9% to 47.3% in 2021, 37.0% in 2025). No reason needed since 2008. BVerfG 2013 (a European-election case) quotes confirmed. Switzerland "around 90%" is still journalism-sourced; Upper Valais 2017: at least 193 forged ballots, suspended sentence. |
| D65 | verified | All figures confirmed: 1,085 likely voters, 30 Nov–6 Dec 2023, phone and online, Pulse; 30% voted by mail (about 326 weighted); 21% filled out someone else's ballot "in part or in full"; 19% had theirs filled out; 17% signed for someone; 17% voted where no longer resident. Critiques confirmed (Krosnick, Levitt, disability advocates, 30% vs 43%). A weighted crosstab is public: 34% of under-40 mail voters said someone else filled in theirs, against 2% of those 65+. |
| D66 | **corrected** | WA 2020: Black 2.49%, Native American 1.59%, Hispanic 1.57%, Asian/PI 1.24%, white 0.63%; Black voters twice as likely after controls; ages 18–21 2.68% vs 65+ 0.17%; men 42% more likely. The **"4–7 times" county gap counts mismatched *or unsigned* ballots**, after controls for age, race, education and income; for mismatches alone, two counties were 18 times another. **The candidate's "no bias" quote does not exist**; use "We found no evidence of bias when counties accepted or rejected ballots". 98.7% of decisions appropriate; reviewers, including auditors, disagreed. EAVS 2024 state extremes confirmed in EAVS itself (AR 8.8%; VT, ME, IN 0.2%). |
| D67 | verified | NCSL Table 14 (updated 23 Oct 2026) and Table 15 (31 Aug 2026) counts confirmed. Ohio and Texas appear in both the signature and the ID-number lists. Colorado refers uncured mismatches to the district attorney. |
| D68 | **corrected** | The Texas "about 5,000 mismatch rejections in 2016 and 2018" is from **Judge Higginbotham's concurrence**, not the majority; the due-process point is a stay-stage "likely to show". NH 2018 opinion quoted directly (0.35% of absentee ballots rejected for mismatch in 2016). PA 2020 holding confirmed. |
| D69 | verified | GA SOS release (archived): 15,118 envelopes, "no fraudulent absentee ballots", 99.99% accuracy. **One missed envelope was signed by the voter's spouse and passed the county's check.** The audit sampled accepted ballots only. |
| D70 | partly unverifiable | The Conversation (Orr and Johnson, 2020) confirmed: "as many as a third ... while others were present", "1%, or fewer" pressured. **Its link is to Southwell & Burchett 1997, a survey of the January 1996 special Senate election, not "after 1998".** The paper itself is paywalled. |
| D71 | **corrected** | The original is the LA Times, 11 Dec 2000: Melody Rose's unpublished pilot of 818 Washington County voters: "About 5%" said others marked their ballots, 2.4% that others signed envelopes. Heritage dropped "About", "pilot" and "preliminary". |
| D72 | verified | BJPS 2013 (Gerber, Huber, Doherty, Dowling; no Hill): 25% doubt secrecy. Field experiment: +3.4 pts turnout among people with no voting record. **New: Dowling et al., PLOS ONE 2019 (YouGov, Dec 2010): over 23% of mail voters had someone else in the room, 17.8% discussed their vote there, more than 6% showed their ballot; mail voters were almost 10 points likelier than Election Day voters to say their choices were not secret.** In person: 22% had no privacy screen. |
| D73 | verified | Birch & Watt 2004 via Essex REF. Democracy Volunteers 2024: family voting seen in 21% of UK polling stations observed; postal family voting "we are unable to collect data on". Pickles 2016: household undue influence is hard to prove, for reasons "similar to those which prevent sufferers of domestic abuse from coming forward"; R18 would extend secrecy offences to postal ballots. |
| D74 | verified (reused) | Pew Oct 2026: 76% of mail voters vs 47% of in-person voters confident that mail votes are counted as intended; Republicans 42%, Democrats 64%. Mail is below in-person in all four readings, 2020–2026. |
| D75 | verified | Six disputes sourced: Florida 2000, Ohio 2004, Georgia 2018, 2020, Arizona 2022 (Lake's signature-verification claim, rejected May 2023), Bridgeport 2023. Mail ballots were central in 2020, Arizona 2022 and Bridgeport. **No survey measures confidence just before and after each dispute.** |
| D76 (new) | verified | Elections voided over absentee ballots beyond the three named cases: Bridgeport 2023 (CT Mirror), plus Heritage's own file, in which most of about 25 whole-election voidings involve absentee or mail ballots, and none is in CO, OR, UT or WA. News21 (2012): 491 absentee cases against 10 impersonation, of 2,068. Exact Heritage counts need hand-coding in stage 5. |

**[BOTH] corrections to copy to the voter-ID candidate file** (which this brief does not let me edit): D50 (259 convictions), D56 (*Burson* dates), D13 (counts from the data file), D2 (party shares confirmed). Its finished facts already use the corrected forms of D50 and D56.

**Blocked, for a human to fetch:**
- **Survey texts:** Southwell & Burchett, *PS* 1997, and Southwell, *PS* 2004 (Cambridge, paywalled). These hold the original Oregon question wording, sample and figures.
- **Other journal texts:** the BJPS 2013 full text; the Baringer, Herron & Smith ELJ 2020 full text (Sage Cloudflare).
- **Paywalled journalism:** the Washington Post Rasmussen critiques (Bump, 12 Dec 2023 and 8 Mar 2024).
- **Government sites that refused automated fetching:**
  - Legifrance (loi n° 75-1329).
  - The Electoral Commission's 2024 general election report.
  - senate.gov roll-call pages, and the Congressional Record pages saying which states the 6–7 Jan 2021 House objections concerned.
  - The 2008 SPAE report (MIT DSpace, HTTP 429).
- **Data not published in a usable form:** IDEA's Looker dashboards (no export; the country lists came from the PDF text); any official Swiss national postal-share statistic (none found).
- **Primary sources for officials' manipulation (D55):** Box 13, Wayne County 2020 and the Georgia State Election Board.

---

## Viewpoint grounding

For each argument: the verified facts it rests on (candidate, confirmed figure), then its strongest well-supported concession. **Unsupported** marks an argument left without a verified fact; each was dropped or narrowed in outline draft 5.

### `mail-exception`

1. **Mail gives up the secret ballot.** *Grounded.*
   - The secret ballot was adopted so a vote buyer could not "watch until he placed it in the polling box". Massachusetts and New York adopted it in 1888, and "almost 90 percent of the States" had by 1896 (D56, *Burson*). In Chile, the right's stronger vote in landlord-patronage areas "completely disappeared" after the 1958 reform (D56).
   - In a December 2010 national survey, over 23% of mail voters had someone else in the room, 17.8% discussed their vote there, and more than 6% showed their ballot. Mail voters were almost 10 points likelier than Election Day voters to say their choices were not secret (D72, Dowling et al.).
   - Secrecy beliefs change behaviour: reassurance letters raised turnout among people with no voting record by 3.4 points (D72).
   - Germany's court, while upholding postal voting, conceded that "public control of how the vote is cast is reduced" and integrity "not equally guaranteed" (D64). The UK's 2016 Pickles review recorded the argument that unrestricted postal voting "undermines the fundamental secrecy of the ballot" (D73).
   - Weaker surveys give higher figures:
     - Rasmussen–Heartland: 19% of mail voters said someone else filled in theirs "in part or in full" (D65; opt-in, about 326 weighted respondents, asked three years later).
     - A 2000 Oregon county pilot (818 respondents): "About 5%" said others marked their ballots (D71).
     - Early Oregon surveys, reported second-hand: "as many as a third" with others present (D70; a 1996 survey, not "after 1998").
   - *Strongest concession:*
     - The presence figures mostly describe benign shared voting, and few report pressure: "1%, or fewer" in Oregon (D70).
     - In-person voting is not fully private either: 22% of in-person voters had no privacy screen (D72), and observers saw family voting in 21% of UK polling stations (D73).
     - Oregon's researcher found "no evidence that undue influence ... has been a problem" (D70).
2. **Detected fraud is a floor, not a measure** (the human's note). *Grounded as a point about detection; the size of the gap is an `assumption` crux.*
   - Household pressure is rarely reported, for reasons the Pickles review likened to domestic abuse (D73, para 192).
   - Signature review passed an envelope signed by the voter's spouse in Cobb County's 2020 audit (D69).
   - The researcher behind the Oregon pilot suspected under-reporting, "because people are reluctant to admit being party to a crime" (D71).
   - Heritage calls its own list "a sampling ... not comprehensive" (D13).
   - *Strongest concession:*
     - Large organised schemes leave traces and are caught. NC-09 was found through an outlier rate of unreturned ballots and voter interviews (D25), and Bridgeport on drop-box video (D76).
     - Levitt: the survey results are "wildly out of line" with signature-mismatch flag rates everywhere (D65).
3. **Trust matters as much as honesty.** *Grounded.*
   - Confidence that mail votes are counted as intended is below in-person in every Pew reading: 59/62/61/53% for mail against 91/84/85/79% in person (2020–2026). It is split by party: Republicans 42%, Democrats 64% in Oct 2026 (D74).
   - Losers disputed Florida 2000, Ohio 2004, Georgia 2018, 2020 and Arizona 2022. Mail ballots were central in 2020 (Gallup links that year's fall in Republican confidence to "public questioning of the validity of mail voting") and in Arizona's signature-verification suit (D75, D18).
   - *Strongest concession:*
     - Confidence follows who won more than how votes were cast (D41).
     - In 2026, US confidence ran against the global winner–loser pattern (D18).
     - Every dispute ended with the result standing (D75).
4. **The elections voided for fraud in modern America mostly involved absentee ballots.** *Grounded, narrowed from "were absentee cases".*
   - Named cases: East Chicago 2003 (D51), NC-09 2018, where the board found the result "corrupted by fraud" (D25), Paterson 2020 (D52), and Bridgeport's 2023 mayoral primary, voided after video of drop-box stuffing (D76).
   - Heritage's file holds about 25 whole-election voidings; most involve absentee ballots, but not all — Georgia's HD-28 in 2018 and Compton in 2001 were not absentee cases (D76).
   - News21 found 491 absentee cases against 10 impersonation cases, among 2,068 (D76).
   - Carter–Baker: "Absentee ballots remain the largest source of potential voter fraud" (D38).
   - *Strongest concession:*
     - Every case was local or a single district, caught and remedied. The Paterson indictments were dismissed in 2026 (D52).
     - Against roughly 47.6 million mail ballots counted in 2024 (D1), the cases are few.
     - None of the voidings is in a long-standing all-mail state (D76).
5. **Most democracies do not offer postal voting on demand.** *Grounded; restored from draft 3 in narrowed form.*
   - IDEA: 11 of 204 countries offer in-country postal voting to all voters; 27% of OECD members (2021) (D63).
   - France abolished postal voting in 1975 over "fraudes graves" and "électeurs fictifs", widened proxy voting instead, and rejected restoring it in 2022 (D61).
   - British election courts found mass postal fraud in Birmingham in 2005 ("would disgrace a banana republic") and voided Woking 2013 and Tower Hamlets 2015. Britain added identifiers in 2006 and handling limits and three-year renewal in 2022 (D62).
   - *Strongest concession:*
     - The 11 include the US, UK, Germany, Switzerland and Canada (D63).
     - Germany's postal share reached 47.3% in 2021 (D64). Switzerland is about 90%, without "major political debates about security or fraud" (D64).
     - The UK recorded 11 convictions from 1,462 allegations in 2019–23 (D62).
- **Status: well grounded** on lost secrecy, the absentee fraud record and international practice. The step from lost secrecy to coercion and fraud rests on the floor argument, which is an assumption.

### `mail-works`

1. **Mail raises turnout modestly and favours neither party.**
   - Universal mail raised turnout by about 2.1–2.2 points; Democratic turnout share rose by +0.1 (D10).
   - No-excuse eligibility at 65 in Texas barely moved turnout in 2020 (D27).
   - *Concession:* the effect is small (D10, D27).
   - *Draft 4's "high turnout" in all-mail states:* **unsupported** (no state turnout candidate). Narrowed.
2. **All-mail states show none of the organised fraud seen elsewhere.**
   - No whole-election voiding in Colorado, Oregon, Utah or Washington appears in Heritage's own file. Their listed cases are individuals, mostly casting a dead or absent relative's ballot, and they were caught (D76).
   - Rejection rates are "not significantly different" between all-mail and other states (D1).
   - *Concession:* detection is a floor (`mail-exception` 2). Heritage's file is a sample.
   - *Draft 4's "no higher rate of detected fraud":* **unsupported as a rate** (no per-ballot measure exists). Narrowed to the case record.
3. **Mail has checks that in-person voting lacks.**
   - 585,457 ballots entered cure in 2024 and 54.3% were cured (D1).
   - Cobb County's audit found "no fraudulent absentee ballots" and 99.99% accuracy (D69).
   - NC-09 was caught through the ballots' own paper trail (D25).
   - *Concession:* 584,463 returned ballots were rejected in 2024 (D1), and rejection falls unevenly (D66).
4. **Mail serves voters who cannot easily get to a polling place.**
   - More than 53% of disabled voters voted by mail in 2020, against 42% of other voters (D26).
   - *Draft 4's "rural, elderly and shift-working":* **unsupported** (no candidate). Dropped.
5. **Mature democracies vote by post on demand without scandal** (new).
   - Germany: 47.3% in 2021, and its court upheld postal voting (D64).
   - Switzerland: about 90% (D64).
   - UK: "no evidence of large-scale electoral fraud" in the past five years (D62).
   - *Concession:*
     - Britain's worst postal frauds came under on-demand postal voting and needed new laws (D62).
     - Germany's court conceded reduced integrity (D64).
     - Universal postal voting is unusual worldwide (D63).
- **Other concessions to carry:**
  - Texas's 2022 primary rejected 12.38% of mail ballots (D16).
  - Democrats vote by mail far more than Republicans, 37% to 24% (D2).
  - Utah makes mail opt-in from 2029 (D6).
  - Trust in mail counting is lower than in in-person counting (D74).
  - Mail is not private (D72).
- **Status: well grounded,** after dropping the unsourced turnout and rurality claims.

### `signature-discretion`

1. **Standards differ by state and county.** *Grounded.*
   - 32 states check signatures, 9 plus DC do not, and 6 use ID digits; Utah switches in 2029 (D67).
   - Pennsylvania's code "does not authorize or require" rejection on signature analysis (D68).
   - New Hampshire's process was "fundamentally flawed": no notice, "no training in handwriting analysis", no standards, no appeal (D68).
   - *Concession:* Washington requires training, Colorado requires bipartisan review, and 35 states plus DC have statewide cure (D67).
2. **Rejections fall unevenly.** *Grounded.*
   - Washington 2020: Black voters 2.49% against 0.63% for white voters, twice as likely after controls; ages 18–21 at 2.68% against 0.17% for those 65+; some counties 4–7 times likelier to reject (mismatch or unsigned, after controls), and 18 times for mismatches alone. Even the auditors disagreed among themselves (D66).
   - Florida 2018: young voters and voters needing assistance were rejected disproportionately, with "significant variation" across counties (D66).
   - States ranged from 0.2% to 8.8% in 2024 (D66).
   - *Concession:*
     - The auditor found "no evidence of bias" in decisions, and 98.7% of them appropriate (D66).
     - The racial gaps include unsigned ballots; only the age gap is reported for mismatches alone (D66).
3. **Discretion is an opening for officials or partisans.** *Rests mainly on values,* with the risk illustrated:
   - Arizona's losing candidate for governor sued over signature review in 2022 to overturn the result (D75).
   - Officials refused to certify in Otero and Cochise in 2022 (D55).
   - No case of signature review used to change a result was found (D69, search incomplete).
   - *Concession:*
     - Objective checks also reject valid ballots: Texas's ID-number rule produced 12.38% in a primary (D16).
     - Washington's lower-rejection counties accepted less conclusive signatures (D66).
     - A signature check is one of the few checks on a ballot cast out of sight, and it already misses household signing (D69).
- **New, strongest available:**
  - Judge Higginbotham's concurrence: about 5,000 Texas ballots were rejected for "perceived" mismatches in 2016 and 2018 (D68).
  - Signatures' share of rejections swings from 15.8% to 40.7% across EAVS cycles (D1).
- **Status: well grounded** on variation and disparity. **Thin** on bias and corruption, where it argues from risk.

### `election-day-receipt`

1. **Late ballots were not in the count when the election was held.** *Grounded.*
   - 15 states plus DC and three territories count them. ND, OH and UT ended this in 2025; Kansas's change is enjoined (D5).
   - The number of grace-period states has fallen from 21 plus DC (Nov 2020) to 15 plus DC, the 2016 level (D44).
   - *Watson* recognises the "appearance of fraud from late-arriving ballots" as a legislature's reason (D24).
   - *Concession:*
     - Late ballots were under 1% of votes in Clark and Washoe counties in 2024 (D23).
     - Deadlines caused 17.8% of 2024 rejections (D1).
     - In 2026 primaries, lateness caused 78% of Wisconsin's rejections and 75% of Washington's (D44).
     - The USPS says over 95% of ballots arrive on time (D44).
2. **Slow counts are a choice.** *Grounded for counting speed.*
   - Texas and Florida counted more than 10 million votes each within about a day, while California reported about a third of its vote over a month and Arizona took 147 hours to reach 95% (D22).
   - States that allowed pre-processing had reported 78% of votes four hours after polls closed, against 63% for those that did not (D43).
   - **Unsupported: "the lead changes and suspicion grows".** No candidate links count length to confidence or disputes. It is kept as an argument from values, flagged.
   - *Concession:* the pre-processing gap "had essentially disappeared" by 24 hours, and Arizona and Nevada pre-process yet count slowly (D43, D22).
- **Status: well grounded** on rules and speed. **Thin** on its trust mechanism.

### `states-decide`

1. **The president has no role; courts blocked the Postal Service rule.** *Grounded.* The Supreme Court refused to stay the injunction against the USPS rule (D24).
   - *Concession:*
     - The Court let the March 2026 order itself stand as "an internal directive" (D24).
     - Alito and Thomas: "Congress may create such rules under the Elections Clause" (D24).
     - *ITCA* calls Congress's Elections Clause power "paramount" (D46).
2. **States choose and revise their own systems.** *Grounded, narrowed.*
   - Oregon adopted all-mail voting by citizen initiative in 1998 (D6).
   - Utah's legislature is moving back to opt-in mail from 2029 (D6).
   - Three states ended grace periods in 2025 (D5).
   - No-excuse states went 30 → 38 → 35 → 37 (D47).
   - *Watson*: policy arguments "are properly directed to legislatures, not courts" (D24).
   - **Unsupported: "Mississippi's excuse-only system was chosen by its own voters"** (no source). Dropped.
   - *Concession:*
     - Congress has set national mail-ballot rules for military and overseas voters (D45).
     - The House passed the SAVE America Act 218–213 (D24).
- **Status: well grounded,** but it rests mainly on a value, decisions made closest to the people.

### Crux check (stage 4a rule)

- **Kept:**
  - *Undetected household fraud and pressure* (`assumption`): the answer decides whether `mail-exception`'s strongest argument stands.
  - *Secrecy vs access* (`tradeoff`).
  - *Strict and fair checks* (`tradeoff`).
  - *Would restricting mail raise the losing side's confidence?* (`prediction`): no study measures it.
- **Dropped as a crux: "fraud by outsiders or manipulation by officials".** The record answers the narrow question. Organised outsider schemes have voided elections; no case of officials using signature review to change a result was found. What remains is a research task (`dataStillNeeded` in R2 and R4), not a disagreement that would change which viewpoint has the better case. *Decision for the human.*
- **Resolved, not a crux: "is restricting postal voting the democratic norm?"** IDEA's counts answer it (D63).

---

## Visualization plan

Each report opens with a two- or three-sentence overview. Statistics are carried by the artifacts. Dated policy changes and events go on an **EventStrip** under the relevant chart (series `events`, being wired now). Artifacts are listed in reading order. **[wired]** marks components already usable from fact frontmatter (SeriesChart, ComparisonChart, and EventStrip as series events); every other component needs wiring.

Reading-order caveat: until the rendering limit in WORKFLOW stage 5 changes, series render before snapshots and tables, so some orders below can hold only within those groups.

### R1. Mail Voting in the US: Who Uses It, Where, and Its Effects on Turnout and Party, 2004–2026
(Renamed from 1996: the CPS mode series is confirmed only from 2004.)

1. **SeriesChart [wired]: national shares of votes by mail, early in person and on Election Day, 2004–2024.**
   - *Data:* CPS supplement (Census tables, every cycle 2004–2024, as charted by CRS IF11477); a second reading for EAVS mail share of turnout (2020 43%, 2024 30.3%; whether every EAVS report back to 2004 prints a comparable share is still to confirm).
   - *Events:* 2020 COVID rule changes (NCSL: 38 + DC no-excuse plus 10 COVID-excuse states).
   - *Why:* the long run, with the 2020 spike shown against the trend.
2. **TileMap (US states): mail share of 2024 turnout by state.**
   - *Data:* EAVS 2024 Overview Table; the eight mostly-mail states and DC highlighted.
   - *Why:* place is the slice; tiles keep small states legible.
3. **PeriodTimeline: when each mostly-mail state adopted it.**
   - *Data:* NCSL Table 18a, enacted/implemented years, OR 1998/2000 to DC 2022/2023. Utah's 2029 opt-in goes on as a marked future change (HB 300).
   - *Why:* adoption periods by state are periods, not points.
4. **CompositionBar: states by mail rule (no-excuse or all-mail / excuse required / COVID excuse added), one bar per cycle.**
   - *Data:* NCSL Evolution table, Nov 2016–Nov 2026 (full published range).
   - *Why:* shows the parts of a 50-state total.
5. **ComparisonChart [wired]: mail use by party and by disability.**
   - *Data:* SPAE 2024 (Democrats 37%, Republicans 24%), and SPAE Figure 4 by party 2008–2024 if its values can be read; Rutgers/EAC 2020 (more than 53% vs 42%).
   - *Why:* group comparison at one date.
6. **EstimateRange: estimated effects of mail rules on turnout and party share, with confidence intervals and a zero line.**
   - *Data:* Thompson et al. 2020 (turnout +2.1 to 2.2; Democratic turnout share +0.1, upper bound about 0.3); Yoder et al. 2021 (+0.02, upper bound 0.26).
   - *Why:* effect sizes need their uncertainty beside a null.
7. **SeriesChart [wired]: support for no-excuse mail voting by party.**
   - *Data:* Pew, every published reading from 2018 to Aug 2025 (2025: all 58%, Republicans 32%, Democrats 83%).
   - *Events:* Trump's 2020 statements on mail voting (Gallup's 2020 note).

### R2. Mail Ballot Rejection, Signature Checks and Curing, 2016–2026

1. **SeriesChart [wired]: national rejection rate, % of returned mail ballots, 2016–2024.**
   - *Data:* EAVS (1.0, 1.4, 0.8, 1.5, 1.2).
   - *Note:* MIT's per-vote-cast rate (0.34% in 2020 and 2024) appears only in the note, as a second denominator.
   - *Events:* PA court ruling (Oct 2020), TX SB 1 and GA SB 202 (2021).
2. **BarChart: rejection reasons, 2024, with signature share per cycle in the table view.**
   - *Data:* EAVS Table 1.
   - *Why BarChart, not CompositionBar:* the shares use casewise deletion and do not total 100%, so a parts-of-a-whole bar would mislead.
3. **TileMap (US states): rejection rate by state, 2024.**
   - *Data:* EAVS Overview Table 1 (0.2% to 8.8%); all-mail states highlighted.
   - *Observation beneath:* "not significantly different" for all-mail states.
4. **BarChart: Washington 2020 rejection rate by race, age, sex and first-time voting.**
   - *Data:* State Auditor Exhibits 5–7 (e.g. Black 2.49%, white 0.63%; ages 18–21 2.68%, 65+ 0.17%).
   - *Then* a **DataTable** of the 39 county rates (Exhibit 3) and the controlled county ratios (4–7×; 18× for mismatches).
   - *Why not SliceExplorer:* it needs row-level data the audit does not publish.
5. **KeyFigures: the audit's own re-check.**
   - *Data:* more than 7,200 signatures; 98.7% of decisions appropriate; "no evidence of bias"; cure rates 65% vs 50%.
6. **DataTable: how each state verifies and cures mail ballots.**
   - *Data:* NCSL Tables 14 and 15 (signature / ID digits / witness / notary; statewide cure; training; bipartisan review).
   - *Ideally* a categorical state map; see Visualizations needed.
7. **SeriesChart [wired]: Texas and Georgia rejection rates beside the national rate, 2018–2024.**
   - *Data:* TPR/EAC, EAVS briefs. The March 2022 Texas primary (12.38%) is a marked separate point, since it is a primary.
   - *Events:* SB 1 and SB 202 (2021).
8. **KeyFigures: curing, 2024.**
   - *Data:* 585,457 set aside, 317,191 cured (54.3%); Texas 5.8% entered cure.
9. **QuoteComparison: "May officials reject a ballot on their own judgement of a signature?"**
   - *Data:* New Hampshire 2018, Fifth Circuit 2020 (majority and Higginbotham), Pennsylvania 2020, Arizona 2023 (Lake).
   - *Why:* courts answering one question in different ways.
10. **CaveatList.**
    - Cobb's audit (no fraudulent ballots; a spouse-signed envelope passed).
    - `dataStillNeeded`: signature review used to change a result; mismatch-only rejection by race.

### R3. Ballot Receipt Deadlines, Late Ballots and Counting Speed, 2016–2026

1. **TileMap (US states): days after Election Day a postmarked ballot may arrive, 2026.**
   - *Data:* NCSL Table 11; 0 for receipt by Election Day, up to 21 for Washington.
   - *Note:* military and overseas rules.
   - *Why:* numeric, so no categorical map is needed.
2. **SeriesChart [wired]: number of states counting late-arriving ballots, Nov 2016–Nov 2026.**
   - *Data:* NCSL Evolution table, all six readings.
   - *Events:* ND, OH and UT changes (2025); *Watson* (Jun 2026); Kansas injunction (Jul 2026).
3. **DataTable: late ballots against their denominators.**
   - *Data:*
     - Nevada 2024: Clark and Washoe, 11,900 of nearly 1.3m.
     - 2026 primaries: WI about 5,000 (78% of rejections) against 2,300 in spring 2023; MI more than 10,000; WA 16,000 → 20,000+ late arrivals.
     - National: 17.8% of 2024 rejections.
   - *Why a table:* the denominators differ, so a single chart would mislead.
4. **ComparisonChart [wired]: hours to count 95% of the vote, seven swing states, 2020 and 2024.**
   - *Data:* MIT Table 1.
5. **DataTable: when processing may begin, by state, beside hours to count and mail share.**
   - *Data:* NCSL Table 16, MIT, EAVS. A scatter would show this better (see Visualizations needed).
   - *Then* **KeyFigures:** Stewart's 63% vs 78% at four hours.
6. **PullQuote: *Watson*.**
   - "Appearance of fraud" and "properly directed to legislatures", with "roughly 30 States" reconciled against NCSL's 15 in the description.

### R4. Absentee and Mail Ballot Fraud and Manipulation of the Count in the US, 1936–2026

1. **Timeline: cases by category.**
   - *Categories:*
     - organised absentee or mail fraud: Philadelphia 1993, East Chicago 2003, NC-09 2018, Paterson 2020, Bridgeport 2023, Aberdeen 2020, Caddo 2023;
     - officials and certification: Box 13 1948, Wayne 2020, Otero and Cochise 2022;
     - in-person and machine fraud: Kansas City 1936, Chicago 1982.
   - *Why:* one view of the whole record, filterable, so no category is read alone.
2. **DataTable: the organised absentee cases.**
   - *Columns:* method; ballots at issue; margin; how detected; remedy; criminal outcome; outcome as of.
   - *Data:* NCSBE order, *Pabey*, NJ Globe, CT Mirror, Heritage records.
3. **ComparisonChart [wired]: ballots at issue against the winning margin, per case.**
   - *Data:*
     - NC-09: margin 905 (and the board's "undeterminable").
     - East Chicago: margin 278; 155 votes invalidated.
     - Bridgeport: margin 251; 1,253 drop-box ballots against about 420 people seen on video.
     - Caddo: margin of 1; at least 11 illegal votes.
   - *Why:* shows whether fraud could have changed the result.
4. **DataTable: officials and certification.**
   - Same columns, plus Lake's 2022 signature-review suit.
5. **BarChart: fraud records by type, in two independent compilations.**
   - *Data:* Heritage's file (1,619 records; 387 absentee; 34 impersonation) and News21 (2,068; 491 absentee; 10 impersonation).
   - *Then* **KeyFigures** for the denominator: 47,629,437 mail ballots counted in 2024.
6. **CaveatList: "detected fraud is a floor, not a measure"** (the human's note), with its reasons:
   - household pressure goes unreported (Pickles);
   - signature review passed a spouse's signature (Cobb);
   - Heritage's list is a sample.
   - `dataStillNeeded`: any estimate of undetected mail fraud.
7. **ClaimCheck: "One in five mail-in voters admit they cheated" (Rasmussen–Heartland, Dec 2023).**
   - *Status:* likely `not-supported` as a fraud estimate.
   - *Finding:* the method and critiques, linking to R5's privacy table for what the survey can support.
8. **PullQuote: Carter–Baker,** "Absentee ballots remain the largest source of potential voter fraud", with its "no evidence of extensive fraud" sentence in the description.

### R5. The Secret Ballot and Postal Voting in Other Democracies, 1856–2026

1. **Timeline: secret-ballot adoption.**
   - *Data:* Australia 1856 (secondary), Britain 1872, Louisville, Massachusetts and New York 1888 (*Burson*), "almost 90 percent" of states by 1896, Chile 1958.
2. **PullQuote: Baland & Robinson on Chile.**
   - *Note:* the abstract gives no numbers, so no chart until the paper's table is read.
3. **DataTable: how private is a mail ballot? Every survey, ranked by method.**
   - *Rows:*
     - Dowling et al. 2010 (YouGov matched sample): more than 23% someone in the room; 17.8% discussed; more than 6% showed the ballot; mail voters about 10 pts likelier to doubt secrecy.
     - The same survey's in-person items: 22% no screen; more than 20% could be seen.
     - Rasmussen–Heartland 2023 (opt-in): 19% and 21%.
     - Rose 2000 pilot (818): about 5%, 2.4%.
     - Oregon 1996 (second-hand): a third present, 1% or fewer pressured.
     - Democracy Volunteers 2024: UK polling-station family voting, 21% of stations.
   - *Columns:* source, year, sample and method, exact question, figure, mail or in person.
   - *Why a table:* the questions differ, so the figures cannot share an axis.
4. **GeoMap (world): IDEA in-country postal voting — all voters / some voters / none, Aug 2025.**
   - *Data:* 204 countries.
   - *Then* **KeyFigures:** 11 all; 21 some; 27% of OECD members.
   - Needs a categorical map (see Visualizations needed).
5. **SeriesChart [wired]: postal share of the vote, Germany 1957–2025 and UK 1945–2019.**
   - *Data:* Bundeswahlleiterin; Commons Library CBP-7529.
   - *Note:* Switzerland's about 90% (journalism) and the West-Germany-only period to 1987.
   - *Events:* Germany drops the reason requirement (2008); UK personal identifiers (2006), Elections Act (2022). The UK's 2001 move to postal voting on demand needs a source first.
6. **ComparisonChart [wired]: French abstention before and after the 1975 abolition, four election types.**
   - *Data:* 1988 ministerial answer.
   - *Description:* the stated reason, and the 2022 rejection of restoration.
7. **DataTable: British election-court cases and the reforms that followed.**
   - *Data:* Birmingham 2005, Slough 2008, Woking 2013, Tower Hamlets 2015; 2006 and 2022 Acts.
   - *Then* **KeyFigures:** 1,462 allegations, 11 convictions (2019–23); 6 postal allegations (2023).
8. **QuoteComparison: "Does postal voting weaken the secret ballot?"**
   - *Data:* BVerfG 2013, Mawrey 2005, Pickles 2016, Southwell 2020, swissinfo 2026.

### R6. Federal and State Power Over Mail Voting Rules, 1986–2026

1. **Timeline: federal laws, bills, orders and rulings.**
   - UOCAVA 1986, NVRA 1993, HAVA 2002, MOVE 2009; the Freedom to Vote Act cloture failures (2021, Jan 2022); SAVE America House votes (2025, Feb and Jul 2026); EO 14399 (Mar 2026); *Watson* (Jun 2026); *Trump v. California* (Aug 2026); *USPS v. California* (Sep 2026).
2. **DataTable: live measures and their status as of the build date.**
3. **QuoteComparison: "Who may set mail-voting rules?"**
   - *Data:* *ITCA*, *Watson*, *Trump v. California* (majority and Sotomayor), *USPS* (Alito).
4. **CompositionBar: state rule mix 2016–2026.**
   - The same data as R1 artifact 4. The **receipt-deadline series** links to R3.

### R7. Confidence in US Elections and Disputed Results, 2000–2026

1. **SeriesChart [wired]: Gallup, confident votes are counted accurately, by party, 2004–2024.**
   - *Events:* changes of president; Florida 2000 (just before the series starts, in the note); Ohio 2004; Georgia 2018; 2020 mail-voting claims; Arizona 2022.
   - *Why:* the full series with disputes placed on it.
2. **SeriesChart [wired], two readings: Pew, confident votes cast in person / by mail will be counted as intended, by party, Oct 2020–Oct 2026.**
   - *Data:* reused from the voter-ID series.
   - *Then* **KeyFigures:** 76% of mail voters vs 47% of in-person voters (Oct 2026).
3. **DataTable: disputed outcomes.**
   - *Columns:* election, what was alleged, whether mail was central, how it was resolved, source.
   - *Data:* the six cases in D75.
   - *Why a table:* the cases are categorical, and confidence before and after each was not measured.
4. **ComparisonChart [wired]: winner–loser confidence gap.**
   - *Data:* world median (70% vs 30%) against the US (41% approvers, 52% disapprovers; Gallup World Poll).
   - *Then* **SeriesChart [wired]:** Gallup honesty series 2006–2026.
5. **CaveatList.**
   - No survey measures confidence just before and after each dispute.
   - No study tests whether restricting mail voting raises losers' confidence (the `prediction` crux).

---

## Visualizations needed

**(a) Library components the plan uses that are not yet wired into fact frontmatter** (`lib/content/schema.ts` accepts only series and comparisons; EventStrip is arriving as series `events`):

| Component | Reports | Uses |
|---|---|---|
| DataTable | R2, R3, R4, R5, R6, R7 | case records, state rules, survey-quality table, disputes; the most needed |
| KeyFigures | R2, R3, R4, R5, R7 | audit re-check, cure counts, denominators, IDEA counts |
| TileMap (US) | R1, R2, R3 | mail share, rejection rate, receipt window by state |
| Timeline | R4, R5, R6 | case record, secret-ballot adoption, federal record |
| QuoteComparison | R2, R5, R6 | courts on signatures; secrecy; who sets rules |
| PullQuote | R3, R4, R5 | *Watson*, Carter–Baker, Chile |
| CaveatList | R2, R4, R7 | "detected fraud is a floor"; dataStillNeeded items |
| ClaimCheck | R4 | Rasmussen–Heartland |
| BarChart | R2, R4 | rejection reasons; Washington groups; fraud by type |
| CompositionBar | R1, R6 | state mail-rule mix per cycle |
| EstimateRange | R1 | turnout and partisan effect estimates |
| PeriodTimeline | R1 | all-mail adoption periods |
| GeoMap (world) | R5 | IDEA postal voting (needs (b)1) |

**(b) Visualizations no component provides:**

1. **Categorical choropleth (a categorical mode for TileMap and GeoMap).**
   - *What it shows:* a rule or category per area, such as IDEA's postal voting for all, some or no voters by country, or each state's ballot-verification method.
   - *Inputs:* area id → category key, a category list with labels and an order, and an optional per-area note.
   - *Requirements:* each category needs a pattern or label as well as a colour, to meet the never-colour-alone rule. The table view lists the area under its category.
   - *Why no existing component fits:* `MapDatum` is `{ value: number }` with a sequential or diverging ramp. Coding categories as numbers would show a false order and a false legend.
2. **Scatter plot (two measures per area, with labels).**
   - *What it shows:* each state's mail-processing lead time (days before Election Day) against hours to count 95% of its vote, sized or marked by mail share. A second use is mail-share against rejection rate.
   - *Inputs:* rows of {id, label, x, y, optional group}, axis labels and formats, optional highlighted ids.
   - *Requirements:* a table view and a label for every point.
   - *Why no existing component fits:* no library component plots two quantities against each other. The plan's DataTable fallback leaves the reader to find the relationship.

**Not needed as new components:** before-and-after comparisons (ComparisonChart handles France's abstention); evidence-quality ranking (DataTable with a method column); the case-margin comparison (ComparisonChart).

---

## Coverage check (stage 5, 2026-10-29)

Every question in the 3a index, mapped to the observations that answer it (`report/observation`) or to a `dataStillNeeded` entry. Report ids: R1 `mail-voting-use-and-effects`, R2 `mail-ballot-rejection-and-signature-checks`, R3 `ballot-deadlines-and-counting-speed`, R4 `absentee-fraud-and-manipulation-of-the-count`, R5 `secret-ballot-and-postal-voting-abroad`, R6 `federal-and-state-power-over-mail-voting`, R7 `confidence-and-disputed-results`. Full lists are in [stage5-results.md](stage5-results.md).

| # | Answered by | Still needed |
|---|---|---|
| M1a history of mail and absentee fraud, US and abroad | R4 `absentee-schemes-voided-elections`, `most-voidings-absentee`, `some-voidings-not-absentee`, `no-voidings-in-all-mail-states`, `each-case-caught-and-rerun`, `paterson-voided-no-convictions`, `few-cases-against-ballots-cast`, `in-person-machine-fraud-record`; R5 `uk-election-courts`, `uk-fraud-under-on-demand`, `uk-no-large-scale-fraud`, `france-abolished-over-fraud`, `switzerland-about-90-percent` | R4 `dataStillNeeded`: any estimate of undetected mail fraud; primary records for Wayne County 2020 and the Georgia board 2024 |
| M1b why the secret ballot emerged and what it changed | R5 `secret-ballot-against-watching`, `chile-secret-ballot-effect`, `secrecy-evidence-is-polling-place` | R5 `dataStillNeeded`: US and UK before-and-after studies (Heckelman, Kam); Australian 1856 primary dates |
| M1c how other democracies handle remote voting | R5 `universal-postal-voting-is-rare`, `large-democracies-vote-by-post`, `germany-postal-share-rose`, `uk-postal-share-rose-after-2001`, `france-widened-proxy`, `france-restoration-rejected`, `curing-uncommon-abroad` | Official Swiss national postal share (none published) |
| M1d household help or pressure, by survey quality | R5 `mail-voters-often-not-alone`, `rasmussen-heartland-weak-measure`, `pressure-rarely-reported`, `pressure-may-be-underreported`, `in-person-not-fully-private`, `uk-postal-help-insisted`, `no-study-of-mail-coercion`; R4 `rasmussen-pointer` | R5 `dataStillNeeded`: a probability survey measuring pressure on mail voters; the Oregon surveys' primary text |
| M2a mail share since 2004, and who uses it | R1 `mail-share-fell-after-2020`, `mail-above-pre-pandemic`, `older-voters-use-mail-most`, `west-votes-by-mail`, `democrats-use-mail-more`, `disabled-voters-use-mail-more`, `three-measures` | R1 `dataStillNeeded`: Census shares 2004–2016 as published numbers (the series starts 2016/2018); mail use by rural and urban residence |
| M2b turnout and party effects | R1 `universal-mail-raised-turnout-modestly`, `no-partisan-tilt`, `eligibility-shifted-method`, `studies-predate-split` | R1 `dataStillNeeded`: effect studies for 2022 and 2024 |
| M2c rejection and cure, all-mail vs other states | R2 `all-mail-states-not-different`, `rejection-about-one-percent`, `more-than-half-cured`, `cure-coverage` | R2 `dataStillNeeded`: cure outcomes by reason and group; 2004–2010 rejection data |
| M3a signature rejections by state, county, group | R2 `signatures-largest-reason`, `state-rates-range-widely`, `washington-race-gaps`, `race-gaps-not-mismatch-only`, `washington-age-gaps`, `county-strongest-predictor`, `florida-young-and-inexperienced` | R2 `dataStillNeeded`: mismatch-only rejection by race in more than one state; Baringer, Herron & Smith full text |
| M3b standards, training, appeals, court rulings | R2 `checks-differ-by-state`, `training-and-bipartisan-review`, `most-states-cure`, `new-hampshire-due-process`, `fifth-circuit-fraud-risk`, `higginbotham-perceived-mismatches`, `pennsylvania-no-signature-rejection`, `id-number-checks-also-reject` | — |
| M3c signature review used to change a result | R2 `no-case-signature-review-changed-result`, `lake-signature-claim-failed`; R4 `officials-manipulated-count`, `refusals-ended-in-certification`, `no-signature-review-case-found` | R2 `dataStillNeeded`: a systematic search; a false-acceptance rate for signature checks |
| M4a late-arriving ballots: rules and counts | R3 `back-to-2016-level`, `grace-states-mixed`, `fifteen-versus-thirty`, `late-share-of-rejections`, `late-ballots-small-in-nevada`, `late-rejections-rising-2026`, `postal-delays-and-postmarks` | R3 `dataStillNeeded`: a national count of late ballots counted under grace periods; 3 Nov 2026 late rejections |
| M4b counting speed and its causes | R3 `most-votes-counted-within-hours`, `slowest-states-mostly-heavy-mail`, `slow-states-not-only-mail`, `preprocessing-speeds-first-hours`, `gap-gone-by-24-hours`, `nevada-2024-lead-change` | R3 and R7 `dataStillNeeded`: any study linking count length to confidence |
| M5a live federal bills and orders | R6 `usps-rule-blocked`, `eo-14399-stands`, `eo-14248-deadlines-enjoined`, `save-america-mail-unclear`, `save-america-status`, `bills-on-both-sides`, `national-bills-stalled`, `no-merits-ruling` | R6 `dataStillNeeded`: SAVE America text as passed 22 Jul 2026; an appellate merits ruling |
| M5b state rule variation since 2016 | R1 `no-excuse-states-grew`, `oregon-by-initiative`, `recent-adoptions`, `utah-all-mail-and-opt-in`; R6 `state-rules-move-both-ways`, `receipt-deadlines-swung-back`; R3 `processing-rules-vary` | Counts before 2016: not found (stated in R6's chart note) |
| S1 who has subverted elections through mail ballots or the count | R4 (as M1a), `officials-manipulated-count`, `refusals-ended-in-certification`, `in-person-machine-fraud-record` | As M1a and M3c |
| Trust (outline, `mail-exception` argument 3) | R7 `mail-below-in-person`, `mail-confidence-by-party`, `mail-voters-trust-mail`, `confidence-follows-power`, `winner-swing-after-elections`, `us-breaks-global-pattern`, `disputes-table`, `mail-central-in-recent-disputes`, `every-dispute-resolved` | R7 `dataStillNeeded`: confidence before and after each dispute; a test of whether restriction raises losers' confidence; post-midterm readings |

**Given up, for the human:** none. Every question has an observation; the open parts are in `dataStillNeeded`, and the three that would decide between viewpoints are cruxes.
