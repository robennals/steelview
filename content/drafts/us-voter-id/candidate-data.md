# US voter ID and citizenship checks — candidate data

Stage 3 output, researched 2026-10-23, ten days before the 3 November 2026 midterms. Divided on 2026-10-23 from the combined [US voting rules candidate data](../us-voting-rules/candidate-data.md), with this topic's report plan (3c, [stage 4b](../../WORKFLOW.md#4b-plan-the-combined-reports)) added. The outline is [outline.md](outline.md) (draft 3; being revised against the evidence in parallel, so 3c may need adjusting to the revised arguments).

- **How the file was divided.** Every question and candidate in the combined file was tagged **[ID]** (`us-voter-id`), **[MAIL]** (`us-vote-by-mail`) or **[BOTH]**. This file holds the [ID] and [BOTH] items. [BOTH] candidates are copied into the [vote-by-mail file](../us-vote-by-mail/candidate-data.md) as well, identical except that viewpoint labels use each file's ids, so a correction to one must be made in both.
- **Candidate numbers are the combined file's** (D1–D69), so cross-references hold. Gaps in the numbering are mail-only candidates.
- **Retagged in the split** (for the human to confirm; see 3d):
  - **D1, D25, D51, D52, D56: [MAIL] → [BOTH].** This topic's questions and history report need them: D1 is the national mail-rejection rate that Texas and Georgia are compared with (I2a); D25, D51 and D52 are the modern result-changing fraud cases, which were absentee and so bear on what polling-place ID can reach (S1); D56 dates the secret ballot, one of the remedies the history question asks about (I1a, S1).
  - **D48: [ID] → [BOTH],** because the vote-by-mail history report sets the in-person machine record beside the absentee cases.
- **Viewpoint ids.** The split outline's viewpoints, with their draft-3 numbers:

  | Id | Draft-3 no. | Title |
  |---|---|---|
  | `prove-identity` | ID1 | Voters should prove who they are and that they are citizens |
  | `turned-away` | ID2 | These rules turn away eligible citizens to fix a problem that barely exists |
  | `clean-rolls` | ID3 | Clean the rolls, rather than burdening voters at the door |
  | `id-plus-access` | ID4 | Require ID and guarantee access, so both sides trust the result |
  | `states-decide` | ID5 | Election rules belong to the states, and presidents have no say in them |

  The vote-by-mail topic's viewpoints are written with a `mail/` prefix, e.g. `mail/mail-exception`. Draft 2's numbers map as V1→`prove-identity`, V2→`turned-away`, V5→`clean-rolls`, V6→`states-decide`, V7→`id-plus-access`.
- **Crux labels.** X1: should Congress set one national standard? X2: is a rejected eligible voter a worse error than an ineligible vote counted? X3: does a rule that does not change turnout still burden voters?
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
- **EO 14248 (25 Mar 2025):** its proof-of-citizenship section for the federal registration form is blocked.
  - *LULAC v. EOP* (D.D.C.) granted summary judgment on 31 Oct 2025 (*unverified* beyond the ACLU-hosted order).
  - *California v. Trump* (D. Mass.): preliminary injunction 13 Jun 2025; merits ruling 24 Jun 2026 that the challenged sections exceed presidential authority and conflict with NVRA, UOCAVA and HAVA; final judgment 13 Jul 2026; First Circuit argument set for 9 Dec 2026 (read, Civil Rights Litigation Clearinghouse, https://clearinghouse.net/case/46337/).
- **EO 14399 (31 Mar 2026):** creates DHS/SSA "State Citizenship Lists" and a USPS mail-ballot rule.
  - **24 Aug 2026, *Trump v. California*, No. 26A124:** SCOTUS stayed the injunction against the order itself, calling it "an internal directive" that "neither requires nor forbids anything of anyone outside the Executive Branch", with the states' claims likely unripe (read, https://www.supremecourt.gov/opinions/25pdf/26a124_hgci.pdf).
  - The order's USPS rule is blocked for November 2026 (see the vote-by-mail file); the order itself, including the citizenship lists, is not enjoined.
- **SAVE database overhaul:** a federal judge blocked it in June 2026 (read, Texas Tribune, 16 Jul 2026); on 25 Sep 2026 SCOTUS stayed that order, so DHS can again use it for voter-roll checks (read, OPB/NPR).

---

## 3a. Question index

One row per empirical question in the outline, in outline order. **Answers it** lists candidates that address the question itself; **Context** lists those that supply what the outline says must sit beside the answer, tagged by kind: *run* (longer run), *comp* (comparators), *denom* (denominator or base rate), *record* (rest of the record), *cf* (counterfactual). The **Report** column gives the 3c report that will answer it.

| # | Question | Viewpoints | Answers it | Context | Likely status, and how to narrow it | Report |
|---|---|---|---|---|---|---|
| I1a | What is the documented history of in-person and registration fraud in the US, and how did it end where it ended? | `prove-identity`, `turned-away` | D48, D49, D50, D13, D14 | *denom:* D49 (Illinois 1960 margin about 9,000), D48 (no vote estimate read). *record:* D55 (fraud by officials: Box 13), D53 (exclusion). *run:* D48 (DOJ reports 1978–2023, but no consistent count). *cf:* D56 (secret ballot 1884–1891), D45 (registration and federal law). | Well-supported that machine fraud was real and prosecuted (Chicago 1982: 58 convicted by 1985). "Rules stopped it" has no causal evidence yet; the turnout-inflation debate (Converse, Burnham, Kousser) is not reached. | R5 |
| I1b | What ID do other democracies require, when and why did they adopt it, and what happened afterwards? | `prove-identity`, `turned-away`, `id-plus-access` | D21, D57, D58, D59, D60 | *comp:* D21, D60 (national ID cards; Germany asks only on request; France exempts small communes). *record:* D57 (GB turnaways 0.25% in 2023, 0.08% in 2024; personation before the law: 1 conviction in 2019), D58 (Northern Ireland register fell 10% after 2002, mostly from new registration rules). | Complicated. Narrow to named countries with dates. Northern Ireland fits "adopted after fraud"; Great Britain and Canada are not shown to. | R1 |
| I1c | How many non-citizens have systematic audits found on the rolls and voting? | `prove-identity`, `turned-away`, `clean-rolls`, X2 | D12, D28, D29 | *denom:* D28, D29 (registrants checked, ballots cast). *record:* D28, D29, D30 (flags confirmed or reversed). *comp:* D29 (Georgia 2020 margin 11,779). | Well-supported: confirmed cases are hundredths of a percent of registrants or fewer, far below recent statewide margins. | R3 |
| I1d | What share of Americans, by party and race, support photo ID and proof of citizenship? | `prove-identity`, `id-plus-access` | D18, D19 | *record:* D18, D19 (same polls' access items). *run:* D19 (2021 → 2025), D18 (2016 → 2024). | Well-supported. Race splits not found in a fetched source. | R6 |
| I2a | How many registrations and ballots have been rejected under ID and citizenship rules, and how many of those people were eligible? | `turned-away`, `prove-identity`, X2, X3 | D11, D16, D31, D17 | *run* and *cf:* D31 (Texas and Georgia before and after), D1 (national rate). *record:* D31 (90% of Texas 2022 rejected voters did not vote another way); cures (D1). | Well-supported for Texas's March 2022 spike and partial fall. "Shown eligible" is unknown outside Kansas. | R2 |
| I2b | What happened to turnout, by group, after strict ID or proof-of-citizenship rules? | `turned-away`, `prove-identity`, X3 | D8, D9, D39 | *record:* D8 beside D9; D8's mobilisation offset. *run:* D39 (Georgia gap widening before SB 202). *comp:* D57 (GB 2024: about 4% of non-voters cited ID). | Well-supported for "no large aggregate effect"; group effects contested. | R2 |
| I2c | How many eligible citizens lack current photo ID or ready proof of citizenship? | `turned-away`, `prove-identity` | D15, D17 | *record:* D15 (none vs outdated). *comp:* D57 (GB awareness and lower-grade non-voters). Cost and travel time: not found. | Complicated: definitions drive the headline. | R2 |
| I2d | How have officials used eligibility rules to exclude eligible voters, historically and recently? | `turned-away`, `prove-identity`, `clean-rolls` | D53, D54, D30, D55 | *run* and *cf:* D53 (Louisiana Black registrants 130,334 in 1896 → 5,320 in 1900; VRA before/after). *record:* D54 (Florida 2000 purge list; Georgia exact match 2018), D30 (Alabama and Virginia 2024), D37. *comp:* D58 (Northern Ireland franchise, Cameron report). Counter-record: D54 (Thernstrom: error, not targeting). | Well-supported for Jim Crow exclusion. Recent purges: well-supported that errors fell on citizens; whether by design is contested. | R5, R4 |
| I3a | How many registrations are inaccurate or out of date, and how many are removed each cycle, for what reasons? | `clean-rolls`, `prove-identity`, `turned-away` | D32, D35, D33 | *run:* D32 (2022, 2024), D37 (2006–18 totals). *record:* D34 (Husted data), D37 (Ohio 2019). *comp:* D32 (state range). *Claims traced:* D36. | Well-supported: about 21M records removed in 2022–24, mostly movers, the dead and non-responders. | R4 |
| I3b | What has SAVE and other database matching found, and how often was it wrong? | `clean-rolls`, `turned-away`, `prove-identity`, X2 | D12, D28, D30, D33 | *denom* and *record:* D28, D29, D30; D54 (Florida 2000 database errors). | Well-supported: matching alone flags many citizens; no published SAVE error rate. | R3, R4 |
| I4a | How much do supporters of ID and of access measures overlap? | `id-plus-access` | D19, D18 | — | **No published crosstab.** Only two separate majorities can be stated. | R6 (`dataStillNeeded`) |
| I4b | How has confidence in vote counts changed, by party, and does it track who won or what the rules are? | `id-plus-access`, `prove-identity` | D18, D19, D41, D20 | *comp:* D42 (global winner gap; 2025 US reversal; expert ratings). *record:* D18 and D19 wording. | Well-supported for the trend and the winner effect to 2024; 2025–26 complicates it. | R6 |
| I4c | Has any state combined strict ID with broad access, and what happened to turnout and confidence? | `id-plus-access`, `prove-identity`, `turned-away` | D40, D39, D38 | *comp:* D40 (strict-ID states without early voting). *cf:* D39 (pre-existing gap trend; 2022 winner effect). | Complicated: Georgia is the only documented case. | R1, R2, R6 |
| I5a | What federal laws, bills and orders on ID and citizenship are live, and what has happened to each? | `states-decide`, X1 | D24 | *run:* D45 (VRA, NVRA, HAVA ID rule; Freedom to Vote Act). *record:* D46. | Well-supported as a dated record. | R7 |
| I5b | How much do state ID rules vary, and how has that changed since 2000? | `states-decide` | D4, D47, D7 | *run:* D47 (13 states in 2000 → 34 in 2020 → 36). | Well-supported. | R1, R7 |
| S1 | Who has subverted American elections, how, and what stopped them? Fraud by machines and aligned groups; exclusion and manipulation by officials; remedies and their dates. | `prove-identity`, `turned-away`, `clean-rolls` | D48–D55, D25 | *comp:* D58 (Northern Ireland personation and franchise), D56 (Britain 1872). *run:* D56, D53, D45 (remedy dates). *record:* D25, D51, D52 (the modern result-changing cases were absentee). | Well-supported as a record of named cases. "Which danger was bigger" has no common measure, so it stays a crux. | R5 |

**Crux candidates.**
- *Rejected eligible voter vs ineligible vote counted* (X2) needs both error counts side by side: I1c with I2a and I3b (R3 beside R2).
- *Burden without a turnout effect* (X3) needs I2a beside I2b — both are in R2.
- *Fraud by machines vs exclusion by officials* draws on S1 (R5).
- *National standard* (X1) draws on I5a (R7).

**Searched without a good result.** This list is incomplete: the shared search budget ran out mid-turn (see 3d).
- **I1a:** no consistent series of election-crime prosecutions; the 1960 Wexler report and the 19th-century turnout debate were not reached.
- **I1b:** no neutral cross-national ID count; the Electoral Commission site returned 403.
- **I2c:** no source on the cost or travel time to get documents.
- ***Crawford* (2008):** `prove-identity` cites it, but no candidate covers it; it was not researched (see 3d).

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
- **Helps:** `mail/election-day-receipt` (a measurable rejection rate; late arrival is a named reason); `mail/mail-works` (curing; no all-mail penalty). **Hurts:** `mail/mail-works` (rejections far exceed in-person); `mail/election-day-receipt` (deadlines themselves cause about 18% of rejections).
- **Likely status:** well-supported as a descriptive series. Narrow it to "rate of returned mail ballots", and state the denominator, because MIT's per-vote-cast rate is 0.34% in both 2020 and 2024 (read, https://elections-blog.mit.edu/articles/administration-mail-voting, 25 Jun 2026).

### D2. [BOTH] MIT Election Data + Science Lab: *How We Voted in 2024* (SPAE), Elections Performance Index
- **Source:** https://electionlab.mit.edu/sites/default/files/2025-07/HowWeVotedIn2024.pdf ; SPAE project page https://electionlab.mit.edu/research/projects/survey-performance-american-elections
- **Measures:** a survey of about 200 voters per state, 10,200 in total (*unverified*), of voting mode, experience, ID requests, wait times and confidence. The EPI compiles state indicators, including mail rejection per vote cast.
- **Coverage:** SPAE 2008–2024; EPI 2008–2024. Both cover every state.
- **Shape:** series (survey waves) with state comparison.
- **Slices:** party, age, race, state, mode; confidence by mode and party.
- **What it shows:** mail use was 29% in 2024 vs 43% in 2020 and 21% in 2016; Democrats 37% vs Republicans 24% (*unverified*, Statista citing MIT; as of 2024). The PDF exceeded the fetch size limit.
- **Helps:** `mail/mail-works` (cross-party use). **Hurts:** `mail/mail-works` (the partisan gap, which draft 2 now concedes); `id-plus-access` (confidence follows own side's mode).
- **Likely status:** well-supported for descriptive shares.

### D4. [ID] NCSL "Voter ID Laws"
- **Source:** https://www.ncsl.org/elections-and-campaigns/voter-id (updated 3 Sep 2026).
- **Measures:** state ID requirements at the polls, classified as photo or non-photo and strict or non-strict. It does not cover mail-ballot ID rules.
- **Coverage:** current snapshot plus a dated change log; history in D47.
- **Shape:** cross-state snapshot.
- **What it shows (read, as of Aug–Sep 2026):**
  - 36 states request or require ID (14 strict, 22 non-strict; 24 photo, 12 non-photo); 14 plus DC use other methods.
  - 10 strict-photo states: AR, GA, IN, KS, MS, NH, NC, OH, TN, WI. Georgia offers a free voter ID card.
  - 2025–26 changes: Wisconsin constitutionalised photo ID (2025); West Virginia moved to photo ID; Oklahoma SQ 846; New Hampshire dropped student IDs.
- **Helps:** `prove-identity` (the direction of travel); `states-decide` (variation); `id-plus-access` (supplies the strict-ID list for I4c). **Hurts:** `prove-identity` (most US states already ask for ID); `turned-away` (even strict states allow provisional ballots).
- **Likely status:** well-supported.

### D7. [ID] NCSL on documentary proof of citizenship (DPOC)
- **Source:** "Voter Citizenship Bills Top Lawmaker To-Do Lists in 2026" (24 Jul 2026) https://www.ncsl.org/resources/details/voter-citizenship-bills-top-lawmaker-to-do-lists-in-2026 ; also https://www.ncsl.org/elections-and-campaigns/legislative-approaches-to-ensuring-only-citizens-vote
- **Shape:** cross-state snapshot plus legislative record.
- **What it shows:** four states added DPOC in 2026, for 13 in total, not all in effect. Utah and South Dakota use "federal-only" lists, and Florida's law takes effect in 2027 (*unverified*). An Ohio BMV-related DPOC law was enjoined on 25 Aug 2026 and the injunction stayed by the 6th Circuit on 24 Sep (*unverified*, OSU sidebar).
- **Helps:** `prove-identity` (momentum); `states-decide`. **Hurts:** `prove-identity` (litigation keeps blocking these laws).
- **Likely status:** well-supported once a dated state list is built.

### D8. [ID] Cantoni & Pons, "Strict ID Laws Don't Stop Voters" (*QJE* 136(4), 2021)
- **Source:** https://www.nber.org/papers/w25522
- **Measures:** difference-in-differences on a 1.6-billion-observation voter-file panel, 2008–2018.
- **Shape:** one study over a ten-year state panel.
- **What it shows (read, abstract):**
  - The laws have "no negative effect on registration or turnout", overall or for any race, gender, age or party group. Turnout effect −0.1 pts (95% CI −3.0 to +2.8).
  - They have "no effect on fraud – actual or perceived".
  - Campaign contact with non-white voters rose 4.7 pts, possibly offsetting the burden.
- **Helps:** `prove-identity` and `id-plus-access` (little turnout cost). **Hurts:** `turned-away` (no measurable turnout effect); `prove-identity` and `id-plus-access` (no fraud or confidence benefit).
- **Likely status:** well-supported for "no large aggregate turnout effect". Contested for zero burden (D9, the mobilisation offset). Central to X3.

### D9. [ID] GAO-14-634, "Issues Related to State Voter Identification Laws" (2014)
- **Source:** https://www.gao.gov/products/gao-14-634
- **Shape:** one study, two states, one cycle.
- **What it shows (read):** from 2008 to 2012, turnout fell 1.9–2.2 pts more in Kansas and 2.2–3.2 pts more in Tennessee than in comparison states. Drops were larger among registrants aged 18–23, those registered for under a year, and Black registrants.
- **Helps:** `turned-away`. **Hurts:** `prove-identity`, `id-plus-access`. It conflicts with D8.
- **Likely status:** contested if stated as general. Narrow it to "in Kansas and Tennessee 2008–12, GAO estimated…", and pair it with D8.

### D11. [ID] Kansas DPOC litigation record (*Fish v. Kobach / Schwab*)
- **Source:** D. Kan. 2018 findings; 10th Cir. 2020. Lead coverage: https://en.wikipedia.org/wiki/Fish_v._Kobach ; https://electionlawblog.org/2020/breaking-in-major-decision-rejecting-kris-kobachs-claims-of-massive-voter-fraud-tenth-circuit-unanimously-holds-kansass-documentary-proof-of-citizenship-requirement-to-register-to-vote-violates/ . Stage 4 needs the opinions.
- **Shape:** legal record.
- **What it shows:** 31,089 applicants had registrations cancelled or suspended from 2013 to 2016. At most 67 non-citizens registered or tried to, and at most 39 got onto the rolls, over 19 years (*unverified*).
- **Helps:** `turned-away` (ratio of blocked applicants to non-citizens caught). **Hurts:** `prove-identity`. But non-citizen registration is non-zero, which `prove-identity` uses.
- **Likely status:** well-supported as court findings. The 31,089 is applicants blocked, not citizens proven unable to register.

### D12. [ID] Non-citizen roll checks: state announcements and the SAVE database
- **Sources:**
  - Georgia 2024 audit, AP: https://abcnews.go.com/US/wireStory/georgia-citizenship-audit-finds-noncitizens-voter-rolls-115073753 ; 2022 audit: https://sos.ga.gov/news/citizenship-audit-finds-1634-noncitizens-attempted-register-vote (403)
  - SAVE national: https://www.opb.org/article/2026/09/25/the-supreme-court-revives-the-controversial-save-data-system/
  - Denominators and later corrections are now in D28–D30.
- **Shape:** snapshot announcements, state by state.
- **What it shows:**
  - **Georgia:** 20 confirmed non-citizens among about 8.2 million registrants, 9 of whom had voted, plus 156 under review (*unverified*, AP via Alabama Reflector, 24 Oct 2024). In 2022, 1,634 non-citizen applicants were held and never registered (*unverified*).
  - **SAVE:** more than 65 million voters checked in 26 states, 28,635 flagged (read; Solicitor General's figure, Sep 2026, not audited). NPR counted 47M+ records run by Dec 2025 (read, D28).
  - **Correction to draft 1:** draft 1 said Texas "found about 20% later to be citizens". No statewide figure exists; that figure was Denton County's 14 of 84 (17%). See D28.
  - **Other states:** Tennessee 42; Indiana at least 21 (*unverified*). Louisiana and Ohio are now read in D29.
- **Helps:** `prove-identity` (non-zero; mechanisms via DMV and jury forms); `clean-rolls`. **Hurts:** `prove-identity` (rates around 0.0002–0.05%); `clean-rolls` (false positives, D28/D30); `turned-away` (the attempts are real).
- **Likely status:** well-supported for "found cases are a tiny share of registrants". Unknown for the true rate.
- **Reliability:** announcements come from elected officials, often just before elections. Use referrals, not convictions, and say so.

### D13. [BOTH] Heritage Foundation Election Fraud Database (partisan lead)
- **Source:** https://www.heritage.org/voterfraud (403); criticism: https://snopes.com/fact-check/absentee-ballot-fraud-heritage/
- **Measures:** a curated list of convictions and official findings, by category. Heritage says it is "not exhaustive". No denominator.
- **Shape:** event record (case list).
- **What it shows:** about 1,285 cases in 2020, more than 1,400 by Jan 2023, "over 1,500" later (*unverified*). No separate mail vs absentee split.
- **Helps:** `mail/mail-exception` (absentee is a large category); `prove-identity`. **Hurts:** `prove-identity` and `mail/mail-exception` (the total over decades, against billions of ballots, is tiny).
- **Likely status:** usable only as a lower-bound count with method stated.

### D14. [ID] Brennan Center counts and Levitt (partisan lead)
- **Sources:** Brennan 2017 survey of officials: https://www.brennancenter.org/our-work/research-reports/noncitizen-voting-missing-millions ; fraud resources: https://www.brennancenter.org/our-work/research-reports/resources-voter-fraud-claims ; Levitt 2014 (31 impersonation incidents in more than 1 billion ballots, 2000–14), lead: https://www.kxan.com/news/us-politics/election/only-31-instances-of-impersonation-fraud-found-in-a-billion-ballots-cast-election-experts-report/amp/
- **Shape:** snapshot surveys and case compilations.
- **What it shows:** 42 jurisdictions, 23.5 million votes, about 30 suspected non-citizen votes referred (0.0001%) in 2016 (*unverified*). NYC refused to take part.
- **Helps:** `turned-away`. **Hurts:** `prove-identity`. It has the same detection limit `prove-identity` points to.
- **Likely status:** well-supported for "referred/detected incidents are extremely rare".

### D15. [ID] University of Maryland CDCE, VoteRiders and Brennan surveys on ID and citizenship documents (2024)
- **Sources:** DPOC: https://www.npr.org/2024/06/11/nx-s1-4991903/voter-registration-proof-of-citizenship-requirement ; ID: https://cdce.substack.com/p/new-cdce-survey-shows-millions-lack ; https://cdce.substack.com/p/which-us-citizens-lack-easy-access
- **Shape:** one-off survey snapshot (2006 Brennan survey a weak earlier point).
- **What it shows (as of 2024, all *unverified*):** 21.3 million voting-age citizens (9.1%) lack *ready* access to proof of citizenship, 3.8 million have none; about 21 million lack a current driver's licence, 28.6 million have one without current name or address, about 2.6 million have no government photo ID at all; 41% of 18–24-year-olds lack an ID showing their current address.
- **Helps:** `turned-away`. **Hurts:** `turned-away` framing (mostly *outdated* ID); `prove-identity`.
- **Reliability:** academic centre with advocacy partners; single self-reported survey.
- **Likely status:** complicated.

### D16. [BOTH] Texas SB 1 mail-ballot rejections, March 2022 primary
- **Source:** AP/NPR https://www.kut.org/2022-03-16/in-texas-thousands-of-mail-ballots-were-rejected-following-new-id-requirements . Series now in D31.
- **Shape:** event snapshot (series in D31).
- **What it shows:** about 23,000 mail ballots rejected; Harris County 19% (6,888) against 135 in 2018 (*unverified*). Most for missing or mismatched ID numbers. Texas Public Radio puts the statewide total at 24,636, 12.38% (read, D31).
- **Helps:** `turned-away`. **Hurts:** `prove-identity`, `id-plus-access`. The later fall (D31) partly hurts `turned-away`'s "permanent harm".
- **Likely status:** well-supported for the 2022 primary.

### D17. [ID] Arizona federal-only voters and the MVD citizenship error (2024)
- **Source:** https://votebeat.org/arizona/2024/10/03/citizenship-proof-error-federal-only-voter-registration-drivers-license-records ; https://www.washingtontimes.com/news/2024/oct/1/number-of-arizona-voters-with-unconfirmed-citizens/ (AP)
- **Shape:** event record.
- **What it shows:** about 218,000 voters (5.3%) had full-ballot status without DPOC on file, because pre-1996 licences were coded as citizen (*unverified*, as of Oct 2024).
- **Helps:** `turned-away` (long-time citizens can't easily document); `prove-identity` and `clean-rolls` (records are unreliable). **Hurts:** both.
- **Likely status:** well-supported as an event.

### D18. [BOTH] Gallup
- **Sources:**
  - "Americans Endorse Both Early Voting and Voter Verification", 24 Oct 2024 (fielded 1–12 Oct, n=1,023): https://news.gallup.com/poll/652523/americans-endorse-early-voting-voter-verification.aspx
  - "Trust in Elections Breaks Global Pattern", World Poll, 7 Oct 2026: https://news.gallup.com/poll/715205/trust-elections-breaks-global-pattern.aspx (cross-country part is D42)
- **Shape:** series (policy items 2016–2024; confidence 2006–2026) with party slices.
- **What it shows:**
  - **Policy (read, Oct 2024):** photo ID 84%; proof of citizenship for new registrants 83%; early voting 76%; automatic registration 60%. Republican support for early voting 57%, down from 74% in 2016; Democratic support for photo ID up 14 pts since 2022. Party splits for ID (R 98, I 84, D 67) *unverified*. No crosstab of people backing both.
  - **Confidence (read, 2026):** 49% confident in the honesty of elections, averaging 45% since 2006. D 63, R 37, I 35. The party gap was 55 pts in 2024 and 4 pts in 2025.
  - **Correction to draft 1:** the World Poll article gives a global approver/disapprover comparison, not an OECD comparison.
- **Helps:** `prove-identity` (support); `id-plus-access` (both ID and early voting are majority positions). **Hurts:** `id-plus-access`'s "confidence has collapsed" framing (the long-run average is 45%); `turned-away`.
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
- **Helps:** `id-plus-access` (both majorities exist, and each side has moved toward the other's rule since 2021). **Hurts:** `id-plus-access` (confidence flips with incumbency); `mail/mail-works` (Republican support for mail is falling); `turned-away` (Democrats back ID too).
- **Likely status:** well-supported for each policy. The overlap claim cannot be stated as a figure.

### D20. [ID] Studies of whether rules move confidence
- **Sources:** Clinton, "Procedural Polarization" (*APSR*, forthcoming): https://electionlawblog.org/?p=156060 (403) ; Milyo 2025: https://ideas.repec.org/p/umc/wpaper/2518.html ; Stewart, Ansolabehere & Persily, *Stanford L. Rev.* 68(6): https://www.stanfordlawreview.org/print/article/revisiting-public-opinion-on-voter-identification-and-voter-fraud-in-an-era-of-increasing-partisan-polarization/ ; Endres & Panagopoulos: https://costaspanagopoulos.com/files/costas-panagopoulos/files/20531680211030435.pdf
- **Shape:** set of studies.
- **What it shows:** mixed. Voters distrust results produced by procedures they oppose (Clinton). Strict ID raises confidence (Milyo). Strict ID has no effect (Stewart et al.; Cantoni & Pons) (*unverified*, abstracts).
- **Helps/hurts:** cuts both ways for `prove-identity` and `id-plus-access`. Clinton is the strongest evidence *for* `id-plus-access`'s mechanism.
- **Likely status:** contested. A crux, not a lead finding.

### D21. [ID] International ID comparisons
- **Sources:** ACE (https://aceproject.org/epic-en/ ; 503); Schaffer & Wang 2009 via https://politifact.com/factchecks/2016/jun/20/barack-obama/barack-obama-austin-says-us-only-advanced-democrac/ ; partisan leads CPRC/Lott, Daily Signal https://www.dailysignal.com/2026/02/23/photo-id-to-vote-is-perfectly-normal-worldwide/ (403)
- **Shape:** cross-country snapshot (if a neutral source is found).
- **What it shows:** OECD counts disagree (27/38 vs 33/38 photo ID — *unverified*). Most comparators issue national ID cards and register voters automatically.
- **Helps:** `prove-identity`. **Hurts:** `prove-identity`; helps `id-plus-access` (abroad, ID comes with state-supplied access — the `id-plus-access` bargain).
- **Likely status:** complicated. International IDEA is the next source to check.

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
- **Helps:** `mail/mail-exception` (mail-specific fraud can affect a race). **Hurts:** `mail/mail-exception`'s generalisation (caught by mail-specific safeguards and remedied); `mail/mail-works`.
- **Likely status:** well-supported as a case. An observation, not a lead.

### D28. [ID] Texas SAVE check, 2025–26, and what happened to the flagged voters
- **Sources:**
  - Texas SOS, "Texas Completes Citizenship Verifications in the SAVE Database", 20 Oct 2025: https://www.sos.texas.gov/about/newsreleases/2025/102025.shtml
  - Votebeat/Texas Tribune, 18 Dec 2025: https://www.votebeat.org/texas/2025/12/18/texas-voter-roll-citizens-investigation-save-database-travis-county/
  - NPR via VPM, 10 Dec 2025: https://www.vpm.org/npr-news/2025-12-10/trumps-save-tool-is-looking-for-noncitizen-voters-but-its-flagging-u-s-citizens-too
  - Votebeat, 30 Jul 2026: https://www.votebeat.org/texas/2026/07/30/save-potential-noncitizens-gave-proof-of-citizenship-to-dps/
  - Texas Tribune, 16 Jul 2026: https://www.texastribune.org/2026/07/16/texas-jane-nelson-concerns-save-data-voter-citizenship-uscis/
- **Measures:** flags from the federal SAVE system against the full Texas roll, and county follow-up. Excludes any statewide count of confirmed non-citizens or of reinstated citizens.
- **Shape:** event record with a denominator; county snapshots.
- **What it shows (read):**
  - 2,724 "potential noncitizens" out of "more than 18 million" registrants (about 0.015%), as of 20 Oct 2025. Flagged voters who do not reply in 30 days are cancelled.
  - Denton County: 84 noticed; 14 proved citizenship; 14 cancelled because forms said "noncitizen" (none had voted); 55 cancelled for not replying, 5 of them undeliverable (as of Dec 2025).
  - Travis County: 97 flagged; 26 had registered at the driver's licence agency, and 11 had already given it proof of citizenship. Across 24 counties asked, at least 33 citizens identified (as of 18 Dec 2025).
  - May–June 2026: the state had DPS check the 2,724 and told counties to "immediately reinstate some voters"; the elections director could not say how many and said SAVE had "some inaccurate information" (as of 30 Jul 2026). In April 2026 the Secretary of State wrote to USCIS about inaccurate data.
  - **No statewide reinstatement number has been published.**
- **Helps:** `clean-rolls` (a full-roll check is feasible); `prove-identity` (non-zero flags). **Hurts:** `clean-rolls` and `prove-identity` (database flags include citizens; the state's own records would have cleared some); helps `turned-away`.
- **Likely status:** well-supported for "the flag rate was about 0.015% and included citizens"; the share wrongly flagged is unknown.

### D29. [ID] State non-citizen reviews with denominators: Ohio, Iowa, Louisiana, Georgia 2026
- **Sources:**
  - Ohio, Oct 2025 (WYSU/Statehouse News, 28 Oct 2025): https://wysu.org/ohio-news/2025-10-28/ohios-secretary-of-state-forwards-alleged-voter-fraud-cases-to-doj-after-local-prosecutors-dont-act ; Aug 2024 (WOSU): https://www.wosu.org/politics-government/2024-08-22/ohio-finds-597-noncitizens-who-voted-or-registered-recently-a-fraction-of-its-electorate ; denominator: https://www.highlandcountypress.com/headlines/larose-certifies-official-2024-general-election-results . ohiosos.gov returned 403.
  - Iowa (AP via News4Jax, 20 Mar 2025): https://www.news4jax.com/news/politics/2025/03/20/iowa-review-finds-35-noncitizens-voted-last-fall-that-is-a-tiny-fraction-of-the-ballots-cast/
  - Louisiana (States Newsroom, 4 Sep 2025): https://www.newsfromthestates.com/article/louisiana-election-investigation-finds-79-noncitizens-have-voted-1980s
  - Georgia 2026 (AJC, 17 Jul 2026): https://www.ajc.com/politics/2026/07/most-noncitizen-voters-dhs-found-in-georgia-were-never-voters-at-all/
  - Margin comparator: Georgia 2020 presidential result (Wikipedia, read; official SOS page not reached).
- **Shape:** state-by-state snapshots; Ohio has a short annual series of referrals (2019–2025).
- **What it shows (read):**
  - **Ohio:** 1,084 non-citizen registrations referred, 167 of whom voted in federal elections 2018–2024 (Oct 2025). Earlier referrals: 354 (2019), 117 (2021), 148 (2022), 597 with 138 voted (Aug 2024). Of 633 earlier referrals, prosecutors took 12 and grand juries returned 6 indictments. **Denominator:** 8,159,946 registered and 5,851,387 ballots cast in Nov 2024 alone.
  - **Iowa:** 2,176 flagged before the 2024 election; 277 confirmed registered non-citizens of nearly 2.3M registrants; 35 voted, out of more than 1.6M ballots (as of Mar 2025). About 87% of the pre-election flag list were not confirmed.
  - **Louisiana:** 390 suspected (about 0.01% of about 2.9M registrants); 79 had voted at least once since the 1980s; "preliminary" (as of Sep 2025).
  - **Georgia 2026:** DHS flagged about 2,500, most of them pending applicants rather than registered voters; about 150 had previously voted; about 8.1M registrants (as of Jul 2026).
  - **Margin:** Georgia 2020 presidential margin 11,779 (0.23 pts).
- **Helps:** `prove-identity` and `clean-rolls` (non-citizens do reach the rolls and some vote). **Hurts:** `prove-identity` (counts are far below margins and ballots cast; flag lists shrink sharply on review); helps `turned-away`.
- **Likely status:** well-supported for "confirmed counts are hundredths of a percent or less of registrants". Referrals are not convictions.
- **Reliability:** elected officials' announcements; Ohio's 167 spans four federal cycles while the ballot denominator is one cycle — show both.

### D30. [ID] Removal programs that reached citizens: Alabama 2024, Virginia 2024, North Carolina (court records)
- **Sources:**
  - *Beals v. Virginia Coalition for Immigrant Rights*, No. 24A407: SCOTUS order 30 Oct 2024 (read, PDF): https://www.supremecourt.gov/orders/courtorders/103024zr_f2ah.pdf ; respondents' stay opposition, 29 Oct 2024 (read, PDF; an advocacy filing): https://www.supremecourt.gov/DocketPDF/24/24A407/330579/20241029145523924_SCOTUS%20Stay%20Opp%20FINAL%20TO%20FILE.pdf
  - Alabama, *US v. Alabama* / Judge Manasco, 16 Oct 2024: https://www.wsls.com/news/politics/2024/10/16/ (read); opinion not reached (CourtListener 403, govinfo 500).
  - *PILF v. NC State Board of Elections*, 996 F.3d 257 (4th Cir. 2021), cited in the brief; not fetched.
- **Shape:** legal record.
- **What it shows:**
  - **Alabama:** 3,251 flagged as possible non-citizens (13 Aug 2024, 84 days before the election) and made inactive. The Secretary of State's chief of staff testified that about 2,000 were legally registered citizens (read, WSLS). On a driver's-licence cross-check, the state "immediately confirmed the citizenship of 93.8%"; the rest were unverified, not confirmed non-citizens (read, PDF, Beals brief fn. 20). Enjoined under the NVRA 90-day rule.
  - **Virginia:** 1,610 removed under EO 35 (7 Aug–21 Oct 2024). The district court found the state "failed to show that any of the 1,610… were in fact noncitizens" (read, PDF, brief). SCOTUS stayed that order 30 Oct 2024, with three justices dissenting (read, PDF). No count of citizens among the 1,610 exists.
  - **North Carolina:** "97.6% of persons identified by the DMV as noncitizens, in fact were citizens" (*unverified*: quoted in the brief from the 4th Circuit opinion, not fetched).
- **Helps:** `turned-away` (citizens are swept up); `states-decide` (SCOTUS let Virginia's state program proceed). **Hurts:** `clean-rolls` when matching is done close to an election or without checking existing records; `prove-identity` when relying on database or checkbox matches alone.
- **Likely status:** well-supported for "in Alabama 2024 most flagged voters were citizens". The Virginia question is unknown.

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
- **Helps:** `turned-away` (Texas's spike and lasting rise; most rejected voters did not vote). **Hurts:** `turned-away` for Georgia general elections (close to the national rate); `prove-identity` and `id-plus-access` for Texas (an ID rule raised rejections fourfold above 2020 even after the learning curve).
- **Likely status:** well-supported for Texas 2022 primary and for Georgia being near the national rate. Pre-2022 baselines must be read from EAVS datasets.

### D32. [ID] EAVS list-maintenance data: removals by reason
- **Source:** EAC, 2024 EAVS Comprehensive Report, Chapter 3, pp. 148–155 (URL as D1), corrected by Errata v2, 12 Feb 2026: https://www.eac.gov/sites/default/files/2026-02/Errata_Note_2024_EAVS_v2.pdf ; 2022 Errata v1.1, 18 Dec 2023: https://votebymail.gov/sites/default/files/2023-12/Errata_Note_2022_EAVS_v1.1.pdf
- **Measures:** confirmation notices and removals reported by states for the period between registration closes. Excludes whether a removal was correct. North Dakota has no registration; Mississippi gave no reasons.
- **Coverage:** biennial since 2004; 2024 counts "records" not voters and adds "duplicate record" as a reason, so 2024 is a break.
- **Shape:** biennial series plus cross-state comparison.
- **What it shows (read, PDF):**
  - **2022–24:** 21,298,175 records removed, 9.1% of registrants. Reasons: no response and missed two federal elections 33.5%; moved 30.8% (6,504,140); died 21.6–21.7% (4,576,275; the corrected chart and table differ); duplicate 8.1%; other 3.4%; voter request 2.6%; felony 1.5%; mental incompetence 0.1%. 1,898,841 further records merged or linked.
  - 234,504,358 registered; 211,144,275 active (86.6% of citizen voting-age population).
  - 38,803,086 confirmation notices (19.1% of active voters, up from 13.7% in 2022 and 14.3% in 2020); 68.9% never returned.
  - Range: Utah removed 0.8% of registrants; Puerto Rico 22.2%.
  - EAC: lists "will contain some number of voter records for individuals who are no longer eligible" because the NVRA process takes two cycles.
  - **2020–22:** 19,284,010 removed, 8.6%; no-response 25.6%.
- **Helps:** `clean-rolls` (maintenance at scale; most removals are moves and deaths). **Hurts:** `clean-rolls` partly (the largest category is non-response, which may include eligible voters); `prove-identity` (bloated-roll claims rest on records the system is already removing).
- **Likely status:** well-supported. 2014–2020 reason shares still needed for the longer run.

### D33. [ID] ERIC (Electronic Registration Information Center)
- **Source:** https://ericstates.org/statistics and https://ericstates.org/about (read, as of 30 Sep 2026); departures from https://en.wikipedia.org/wiki/Electronic_Registration_Information_Center (read, secondary).
- **Measures:** reports ERIC sends to members — leads for officials, not removals.
- **Shape:** annual series (2013–2026) and a membership record.
- **What it shows:**
  - Cumulative 2013–Sep 2026 (read): cross-state movers 14,600,683; in-state updates 31,170,181; in-state duplicates 1,459,110; deceased 681,231; eligible-but-unregistered more than 34M since 2012.
  - Cross-state mover reports peaked at 3.49M in 2021 and fell to 701,420 in 2024 and 668,803 in 2026 (read). Whether the fall reflects departures is my inference, not ERIC's.
  - Members (read, /about): 27 states plus DC. Louisiana left in 2022; Alabama, Florida, Missouri, West Virginia, Ohio, Iowa, Texas and Virginia in 2023; Hawaii joined 2024; New York required to join (Dec 2025 law); Virginia ordered to rejoin (Mar 2026) (read, Wikipedia).
- **Helps:** `clean-rolls` (cross-state matching finds millions of stale records). **Hurts:** `clean-rolls`'s coalition (the states most associated with `prove-identity` left ERIC); `prove-identity` (the tool many `prove-identity` states abandoned is the main cross-state cleaner).
- **Likely status:** well-supported as a record. Stage 4 should confirm membership dates from ERIC.

### D34. [ID] NVRA list-maintenance rules and cases
- **Sources:** 52 U.S.C. §20507 (read): https://www.law.cornell.edu/uscode/text/52/20507 ; *Arcia v. Florida Sec. of State* (11th Cir. 2014, read): media.ca11.uscourts.gov/opinions/pub/files/201215738.pdf ; *Husted v. A. Philip Randolph Institute* (2018, read): https://www.law.cornell.edu/supremecourt/text/16-980
- **Shape:** legal record.
- **What it shows (read):**
  - States must make a "reasonable effort" to remove the dead and movers; no removal for not voting alone; any *systematic* removal program must be completed "not later than 90 days prior to" a federal election, though individual removals (death, request, conviction) continue; a mover can be removed only on written confirmation, or an unanswered forwardable notice plus no voting through two federal general elections.
  - *Arcia*: Florida's 2012 non-citizen matching (licence records, then SAVE) violated the 90-day provision; named plaintiffs were citizens wrongly flagged. The ~180,000 and ~2,600 counts were not on the pages read (*unverified*).
  - *Husted* (5–4): Ohio may use non-voting to trigger a notice. Breyer's dissent: of about 1.5M notices in 2012, more than 1M got no reply; only about 60,000 (4%) said they had moved, while about 235,000 said they had not.
- **Helps:** `clean-rolls` (there is a lawful, bounded process; draft 2 concedes the 90-day limit). **Hurts:** `clean-rolls` (non-response is a weak signal of moving, per the Husted data); `prove-identity` (the 90-day rule blocked last-minute programs in 2012 and 2024).
- **Likely status:** well-supported as a record.

### D35. [ID] Pew Center on the States, "Inaccurate, Costly, and Inefficient" (Feb 2012)
- **Source:** https://www.pew.org/~/media/legacy/uploadedfiles/pcs_assets/2012/pewupgradingvoterregistrationpdf.pdf (read, PDF)
- **Measures:** RTI analysis of Catalist voter-file records, 2004–Mar 2011. Measures stale records, not votes.
- **Shape:** one-off snapshot, dated baseline (before ERIC).
- **What it shows (read, as of 2011):** about 24M records (nearly 13%) "inaccurate or no longer valid"; 1.8M+ deceased; 2,758,578 registered in more than one state; 51M+ eligible citizens unregistered (24%). Pew says it "likely underestimates" the problem. Pew's David Becker said it "found no evidence that any of the inaccuracies led to voter fraud" (*unverified*, NPR 2012 via snippet).
- **Helps:** `clean-rolls` (the problem is stale records, and it is large). **Hurts:** `prove-identity` when cited as fraud evidence; `clean-rolls` if presented as current.
- **Likely status:** well-supported as a dated finding; must carry "as of 2011".

### D36. [ID] Bloated-roll claims traced to source: Judicial Watch and PILF (partisan leads)
- **Sources:** Judicial Watch release, 2 Jan 2020 (read); Judicial Watch "1.8M in 353 counties", Oct 2020 (404); *JW v. Logan* settlement, 2019 (read): judicialwatch.org/wp-content/uploads/2019/01/JW-v-Logan-...pdf ; Judicial Watch release 23 Feb 2023 (read); FactCheck.org on PILF Pennsylvania (read).
- **Shape:** claim record, each traced to EAVS counts against Census estimates.
- **What it shows:**
  - Judicial Watch 2020: 378 counties with about 2.5M registrations above 100% of the citizen voting-age population, from EAC data; the release does not say whether inactive registrants are counted (read).
  - "1.8M in 353 counties" used ACS 2014–18 estimates and included inactive registrants (*unverified*, snippets; fact-checkers called it misleading).
  - *Logan* settlement rests on Husted's statement that removal is "mandatory" and states no "admission of liability"; Judicial Watch reported 1,207,613 removed in LA County by 2023, described as inactive or ineligible, not fraudulent votes (read). "Up to 1.5M" *unverified*.
  - PILF Pennsylvania 2020: claimed 21,000+ dead registrants; the judge declined to order removals and noted more than half of PILF's earlier 9,300 names were missing from its later list (read, FactCheck.org).
  - PILF "Alien Invasion" (Virginia): 5,556 listed; PILF later settled a defamation suit with an apology (*unverified*).
- **Helps:** `clean-rolls` and `prove-identity` (rolls do carry stale records). **Hurts:** `prove-identity` (stale records are not votes); the claims' methods.
- **Likely status:** leads only; use the underlying EAVS figures (D32).

### D37. [ID] Brennan Center purge reports and Ohio 2019 (partisan lead)
- **Sources:** "Purges: A Growing Threat", 20 Jul 2018 (read); Brennan, 1 Aug 2019 (read); WVXU on Ohio's 2019 list, 20 Aug 2019 (read).
- **Shape:** series from EAVS (2006–2018) plus event records.
- **What it shows (read):** almost 16M removed 2014–16, 33% more than 2006–08; "at least 17 million" 2016–18 — Brennan concedes these include all removals for any reason. Examples: NYC improperly deleted 200,000+ names; Virginia removed about 39,000 using a faulty mover database in 2013. Ohio 2019: 235,000 names on a removal list; activists said about 4,000 were wrong; the Secretary of State said about 10,000 had become active. "~40,000 wrongly included" *unverified*.
- **Helps:** `turned-away`. **Hurts:** `clean-rolls` (errors in bulk cleaning). Its totals mostly count lawful removals of movers and the dead, which helps `clean-rolls`.
- **Likely status:** use for named error events; take totals from D32.

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
- **Helps:** `id-plus-access` (the literal ID-plus-access package); `prove-identity` (includes proof of citizenship); `mail/mail-exception` (absentee fraud risk); `clean-rolls` (list maintenance). **Hurts:** `id-plus-access` (the commission split, and its co-chair attacked the first state to adopt the ID half); `mail/mail-works` (absentee line); `id-plus-access`'s "access" half (the report downplays early voting).
- **Likely status:** well-supported as a text record.

### D39. [ID] Georgia SB 202 (2021): voter experience, confidence and turnout gap
- **Sources:**
  - Hood & McKee, "Gauging the Effects of SB 202 on Voting in Georgia" (about 2023): https://electionlab.mit.edu/sites/default/files/2024-05/5_sb202-MEDSLReport.pdf (read, PDF)
  - Brennan Center, "Georgia's Racial Turnout Gap Grew in 2022", 16 Dec 2022, updated Jul 2023: https://www.brennancenter.org/our-work/analysis-opinion/georgias-racial-turnout-gap-grew-2022 (read)
  - Brennan Center, "Racial Turnout Gap Grew in Georgia — Again", 23 Dec 2024: https://www.brennancenter.org/our-work/analysis-opinion/racial-turnout-gap-grew-georgia-again (read)
  - UGA SPIA post-election poll, Nov–Dec 2022 (DocumentCloud 403)
- **Shape:** survey waves (2020, 2021, 2022) and a turnout-gap series (2014–2024).
- **What it shows:**
  - **Experience (read, 2022):** 1.1% reported a problem voting; 72% rated it "excellent", up from 55% after 2020; 75% of in-person voters waited 10 minutes or less.
  - **Confidence in the statewide count (read):** Republicans 26% (2020), 28% (2021), 70% (2022); Democrats 94%, 97%, 85%; overall 76%, up from 59%. 42% said SB 202 raised their confidence and 25% lowered it — 59.1% of Republicans raised, 46.8% of Democrats lowered. Authors: the Republican rebound may reflect "the noted winner's effect".
  - **Turnout gap (read):** white turnout 8.6 pts above non-white in 2022, about 50% wider than in the last two midterms; the white–Black gap grew about 3 pts 2020–24, about the same as 2016–20. Brennan: "we cannot say whether the passage of S.B. 202 is the cause."
  - 0% of Black voters reporting a poor experience (SPIA) *unverified*. Early votes about 2.29M (2022) vs 1.8M (2018) *unverified*.
- **Helps:** `prove-identity` and `id-plus-access` (smooth experience under strict ID with long early voting); `turned-away` (widening racial gap). **Hurts:** `id-plus-access` (confidence rose on the side that wrote the law and fell on the other); `turned-away` (the gap was widening before the law).
- **Likely status:** well-supported for "voters reported few problems in 2022"; complicated for any causal claim.

### D40. [ID] Strict-ID states against early-voting access (NCSL)
- **Source:** NCSL "Early In-Person Voting", updated 11 Aug 2026: https://www.ncsl.org/elections-and-campaigns/early-in-person-voting (read), crossed with D4.
- **Shape:** cross-state snapshot (to be built as a two-way table in stage 4).
- **What it shows (read, as of Aug 2026):** 47 states offer early in-person voting. Indiana starts 28 days before; Georgia from the fourth Monday before; Tennessee about 15 days. Two strict-photo states, Mississippi and New Hampshire, have no early voting.
- **Helps:** `id-plus-access` (most strict-ID states already pair ID with early voting). **Hurts:** `id-plus-access`'s claim that the combination is new; `id-plus-access` (two strict states offer no early voting).
- **Likely status:** well-supported once the cross-table is built. Indiana outcome studies remain leads (Mycoff et al. 2009; Barreto et al. 2009, *unverified*).

### D41. [BOTH] The winner effect on US confidence
- **Sources:** Sances & Stewart, Caltech/MIT VTP Working Paper #125 (2014; *Electoral Studies* 2015): https://www.vote.caltech.edu/documents/16/WP_125.pdf (read, abstract); Stewart, Election Updates, 19 Dec 2018: https://electionupdates.caltech.edu/?p=6578 (read); Sinclair, Smith & Tucker, *PRQ* 71(4), 2018: https://isps.yale.edu/resource/its-largely-a-rigged-system-voter-confidence-and-the-winner-effect-in-2016 (read, abstract).
- **Shape:** pooled surveys 2000–2012; pre/post-election pairs 2014–2018.
- **What it shows (read):** "a consistent relationship between voting for the winner and confidence"; "respondents lose confidence by virtue of change itself". In 2014, Republican confidence rose 14 pts after the election; in 2016, Democrats went from 15 pts more confident to 13 pts less; in 2018, essentially no winner effect.
- **Helps:** `id-plus-access`'s concession (confidence follows who won). **Hurts:** `id-plus-access`'s mechanism (new rules, even agreed ones, may lower trust at first); `prove-identity` (ID's confidence gain is hard to separate from winning).
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
- **Helps:** `id-plus-access` (a winner gap is normal; the US is an outlier); `states-decide` and `mail/election-day-receipt` (experts rate US counting well). **Hurts:** `id-plus-access`'s concession (in 2025 US confidence did not follow who won, so something else — perhaps elite cues — drives it); `prove-identity` and `turned-away` (experts do not fault the voting mechanics).
- **Likely status:** well-supported for "a winner–loser gap is the global norm". CSES numbers needed for a proper comparator set.

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
- **Helps:** `states-decide` (wide, shifting variation). **Hurts:** `states-decide`'s "states learn which rules work" (no source links adoption to measured results); `id-plus-access` (states have moved toward *both* ID and early voting, without a national bargain).
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
- **Helps:** `prove-identity` (machine fraud was real and large, with "dozens of convictions" confirmed).
- **Hurts:** `prove-identity`'s causal claim, because the fraud was caught by investigators under existing law, not by an ID rule.
- **As of:** 1985 (convictions).
- **Likely status:** well-supported for "58 convicted by 1985". The vote estimate needs the grand jury report.

### D49. [ID] Chicago and Illinois, 1960
- **Sources:** Kallina, "The State's Attorney and the President", *Journal of American Studies* 12(2), 1978, citation page read; findings via JSTOR Daily, https://daily.jstor.org/should-nixon-have-demanded-a-recount (read). Kallina's book *Courthouse Over White House* (1988) and the 1961 Wexler special-prosecutor report were not reached.
- **Shape:** event record with a margin.
- **What it shows (read):**
  - Kennedy won Illinois by about 9,000 votes.
  - The recount of paper-ballot precincts showed "considerable votes stolen" from Republican State's Attorney Adamowski, "far fewer from Nixon".
  - Even counting fraud in machine-voting precincts, Adamowski would have won and Nixon would still have lost.
  - Unverified: the recount left Nixon short by fewer than 1,000 votes, and Adamowski lost 31,000+ votes.
- **Helps:** `prove-identity` (a down-ballot race was stolen). **Hurts:** `prove-identity` and `mail/mail-exception` on the presidential story (the fraud was smaller than the margin).
- **Likely status:** well-supported as the leading scholarly account. Name it as Kallina's.

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
- **Helps:** `prove-identity`. **Hurts:** none directly. The Converse–Burnham–Kousser debate over whether 19th-century turnout was inflated by fraud is the counter-record, and was not reached.
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
- **Helps:** `mail/mail-exception` (absentee fraud reversed a result). **Hurts:** `prove-identity` (polling-place ID would not have touched it); `mail/mail-exception`'s generalisation (caught and remedied).
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
- **Helps:** `mail/mail-exception` (a mail election was voided over ballot handling). **Hurts:** `mail/mail-exception` and `prove-identity` (caught before certification; no proven criminal case).
- **As of:** May 2026.
- **Likely status:** well-supported for "a court voided the result". Do not call it proven fraud.

### D53. [ID] Jim Crow disenfranchisement and the Voting Rights Act
- **Sources:**
  - DOJ, "Introduction to Federal Voting Rights Laws": https://www.justice.gov/crt/introduction-federal-voting-rights-laws-0 (read).
  - DOJ, "History of Federal Voting Rights Laws": https://www.justice.gov/crt/history-federal-voting-rights-laws (read).
  - Wikipedia, "Voting Rights Act of 1965" and "Disfranchisement after the Reconstruction era" (read, secondary; trace to Kousser and the USCCR).
  - USCCR, *Political Participation* (1968). Too large to fetch from https://www2.law.umaryland.edu/marshall/usccr/documents/cr12p753.pdf ; scanned at crmvet.
- **Shape:** before-and-after snapshots by state (a series once the USCCR tables are read).
- **What it shows:**
  - Louisiana Black registrants: 130,334 (1896), 5,320 (1900), 730 (1910). Texas adult male turnout fell from over 80% to under 30% after the poll tax (read, secondary).
  - Mississippi Black registration: 6.7% (1964) to 66.5% (1969). Alabama: 19.3% to 61.3% (read, secondary). The "59.8% by 1967" and "44.0%" figures conflict, and the baseline year differs by source (1962, 1964 or March 1965), so these stay *unverified* until the USCCR tables are read.
  - Section 5 raised Black registration 14–19 points (*J. Politics* 2018, via Wikipedia; unverified).
  - *Harper* (1966) struck down poll taxes in state elections. Literacy tests were suspended in 1965, banned nationwide in 1970, and permanently in 1975 (read, DOJ).
  - Kousser: Democrats "disfranchised these whites as willingly as they deprived blacks" (read, secondary).
- **Helps:** `turned-away` (officials used eligibility rules to exclude). **Hurts:** `turned-away`'s analogy, in one respect: those tools were discretionary tests or wealth tests, and the VRA removed discretion. `prove-identity` argues a free, uniform ID differs in kind. No source measures that.
- **Likely status:** well-supported for the history. The exact figures need the USCCR text.

### D54. [ID] Selective purges: Florida 2000 and Georgia "exact match" 2018
- **Sources:**
  - USCCR, *Voting Irregularities in Florida*, ch. 5 (June 2001): https://www.usccr.gov/files/pubs/vote2000/report/ch5.htm (read)
  - Stuart, Harvard Kennedy School RWP02-041 (2002): https://www.hks.harvard.edu/publications/databases-felons-and-voting-errors-and-bias-florida-felons-exclusion-list-2000 (read)
  - Thernstrom, Senate testimony, 27 Jun 2001: https://manhattan.institute/article/testimony-by-abigail-thernstrom-before-the-committee-on-rules-and-administration-united-states-senate (read)
  - GPB, 24 Oct 2018: https://www.gpb.org/news/2018/10/24/why-are-53000-voter-registrations-on-hold-in-georgia (read)
- **Shape:** event records.
- **What it shows (read):**
  - **Florida's lists.** The April 2000 list had 181,157 names, about 65,776 of them felons. About 8,000 Texas misdemeanants were wrongly included.
  - **Accuracy in practice.** Leon County found 34 confirmed felons among about 700 names. Hillsborough estimated 15% were purged in error, "disproportionately African American".
  - **Appeals.** Over half of Black Miami-Dade appellants were reinstated.
  - **Partisan use.** Stuart: probably over a quarter listed in error, with Black registrants wrongly listed at higher rates, and Republican supervisors more likely to use the list.
  - **Counter-reading.** Thernstrom says the Commission's own data show whites wrongly listed at almost twice the Black rate.
  - **Georgia 2018.** More than 53,000 registrations were on hold, "nearly 70 percent" of them Black (AP analysis). They could vote by showing photo ID.
- **Helps:** `turned-away`. **Hurts:** `clean-rolls` (database purges err). Thernstrom's reading cuts against `turned-away`'s targeting claim. The Georgia fallback helps `prove-identity`.
- **Likely status:** well-supported that the Florida list was badly inaccurate. Racial targeting is contested.

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
- **Helps:** `turned-away` and `mail/signature-discretion` (a rule is only as fair as the officials who apply it). **Hurts:** the same viewpoints' alarm, because the checks held every time since 2020.
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
- **Helps:** `mail/mail-exception` (secrecy was adopted against watching and buying votes, and it worked in Chile). **Hurts:** `mail/mail-exception`'s step from polling-place secrecy to mail. No study here measures coercion of mail voters. If Heckelman holds, secrecy rules also cut turnout.
- **Likely status:** well-supported for motives and dates.

### D57. [ID] Great Britain's voter ID (Elections Act 2022) and its rollout
- **Sources:**
  - Elections Act 2022: https://www.legislation.gov.uk/ukpga/2022/37/contents (read).
  - Electoral Commission press release on the July 2024 election, 10 Sep 2024, reprinted at https://wired-gov.net/wg/news.nsf/articles/Electoral+Commission+calls+for+improvements+to+voter+ID+accessibility+10092024161000 (read; the Commission's own site returned 403).
  - Government response, 12 Feb 2025: https://www.gov.uk/government/publications/electoral-commissions-reports-on-the-2024-elections-government-response (title only).
  - Electoral Reform Society briefing, 12 Feb 2026: https://electoral-reform.org.uk/?p=8972 (read; an advocacy group).
- **Shape:** two-point series (May 2023 local, July 2024 general), with group slices.
- **What it shows:**
  - **July 2024 general election (read):**
    - 0.08% of people who tried to vote in person could not, for lack of accepted ID: about 16,000 people, or 1 in 1,200. The comparable May 2023 figure was 0.25%.
    - 0.25% were first turned away, and two-thirds of them came back and voted.
    - About 4% of non-voters said their decision was related to the ID rule.
    - Awareness of the rule was 87% overall, 71% among young people and 76% among ethnic minorities; 58% knew of the free certificate.
  - **May 2023 (unverified):** about 14,000 people were turned away and did not return (read only via the Electoral Reform Society, which cites the Commission). Its 42,368 total across three elections is an advocacy figure.
  - **Personation before the law:** 33 alleged cases at polling stations in 2019, 1 conviction and 1 caution. For 2019–23, all electoral fraud: 1,462 allegations, 10–11 convictions and 4 cautions. Both are *unverified* at source; the first is via the Electoral Reform Society, the second via Wikipedia and Full Fact.
- **Helps:** `prove-identity` (ID is workable, and turnaways are small and falling). **Hurts:** `prove-identity`'s "adopted after fraud" (personation in Britain was tiny); helps `turned-away` (uneven awareness).
- **Likely status:** well-supported for 2024 turnaways once read on the Commission's site.

### D58. [ID] Northern Ireland: the 1985 and 2002 ID laws, and the Cameron report
- **Sources:**
  - Elections (Northern Ireland) Act 1985: https://www.legislation.gov.uk/ukpga/1985/2 (read).
  - Electoral Fraud (Northern Ireland) Act 2002, s.4: https://www.legislation.gov.uk/ukpga/2002/13/section/4 (read).
  - Wikipedia on the 2002 Act, citing the NI Affairs Committee report of 15 Dec 2004 (read, secondary; parliament.uk 403).
  - Cameron Report (1969), CAIN: https://cain.ulster.ac.uk/hmso/cameron2.htm (read).
- **Shape:** legal record plus a before-and-after register count.
- **What it shows:**
  - **1985:** no ballot paper is issued without a "specified document". These were mostly non-photo: driving licence, passport, benefits book, medical card (read).
  - **2002:** adds a free photo Electoral Identity Card, valid for 10 years (read).
  - **After 2002 (read, secondary):** the register fell from nearly 1.2 million to under 1.1 million, about 10%. This was mainly due to the Act's individual-registration rules, not photo ID. Returning officers reported "a marked reduction" in suspected fraud.
  - **Personation before 1985:** "vote early, vote often", and 949 people turned away in 1983. Not found (*unverified*).
  - **Cameron (read):** in Londonderry in 1967, Catholic voters, about 60% of adults, elected 8 of 20 councillors. The householder-only local franchise shut out about a quarter of parliamentary electors. This is exclusion by officials in the same polity.
- **Helps:** `prove-identity` (ID followed fraud, and fraud reportedly fell; a free card came with it, which helps `id-plus-access`). **Hurts:** `prove-identity`'s simple story (the register drop came with the reform); `turned-away` can cite Cameron as the other half of the record.
- **Likely status:** well-supported for the laws. The fraud before and after needs primary sources.

### D59. [ID] Canada's ID requirement (2007) and vouching
- **Sources:**
  - Bill C-31, Royal Assent 22 Jun 2007: https://www.parl.ca/legisinfo/en/bill/39-1/c-31 (read; title and status).
  - Canada Elections Act s.143, current to 30 Sep 2026: https://laws-lois.justice.gc.ca/eng/acts/e-2.01/section-143.html (read).
  - Elections Canada ID page (2025 election): https://www.elections.ca/content2.aspx?section=vot&dir=ids&document=index&lang=e (read).
  - Wikipedia, Fair Elections Act (read, secondary).
- **Shape:** legal record.
- **What it shows:**
  - **ID rule (read):** a voter shows one government photo ID with their address, or two authorised IDs. A voter with no ID may declare identity if another elector vouches for them, one person per voucher. The voter information card counts as one of the two IDs.
  - **Vouching (read, secondary):** about 120,000 people were vouched for in 2011, with no recorded improper votes. The 2014 Fair Elections Act restricted vouching; the 2018 Elections Modernization Act reversed much of that.
  - **Why Canada adopted ID in 2007:** no source found.
- **Helps:** `prove-identity` (ID has been required since 2007) and `id-plus-access` (ID with a fallback). **Hurts:** `prove-identity` (Canada's rule is not photo-only and keeps vouching).
- **Likely status:** well-supported as a record.

### D60. [ID] Polling-place ID in France and Germany, and cross-country counts
- **Sources:**
  - service-public.gouv.fr F1361, checked 21 Sep 2026: https://www.service-public.gouv.fr/particuliers/vosdroits/F1361 (read).
  - Bundeswahlordnung §56: https://www.gesetze-im-internet.de/bwo_1985/__56.html (read).
  - Wikipedia, "Voter identification laws", citing Barton (2024), *Representation* 60(2) (read, secondary).
- **Shape:** legal snapshot.
- **What it shows:**
  - **France (read):** photo ID must be shown in communes of 1,000+ people, and a national ID card is accepted even if expired by under 5 years. ID is not mandatory in smaller communes.
  - **Germany (read):** the voter must prove identity on request, especially without the polling notification.
  - **Count (unverified, looks high):** "176 countries required photo ID as of 2021".
- **Helps:** `prove-identity` (ID is ordinary in France). **Hurts:** `prove-identity` (Germany asks only on request; both countries issue national ID cards).
- **Likely status:** well-supported per country. No neutral count yet.

## Stage-4 review decisions

Recorded 2026-10-23 from the human's review ([stage 4 gate](../../WORKFLOW.md#4b-plan-the-combined-reports)).

- **Approved for stage 5** as planned: the revised outline (draft 4) and the seven reports below.
- **R5 must show how each documented fraud was carried out** and whether a polling-place ID check would have reached it (artifact 7), because the assumption that historical fraud was mostly impersonation at the polls is widespread and testable.
- **A data gap becomes a crux only if its answer would change which viewpoint has the better case.** Gaps that would not swing the balance go to `dataStillNeeded`.

Report ids (filenames, permanent once published):

| Report | Fact id |
|---|---|
| R1 | `voter-id-rules-in-the-us-and-abroad` |
| R2 | `burdens-of-id-and-citizenship-rules` |
| R3 | `non-citizens-on-voter-rolls` |
| R4 | `voter-roll-maintenance` |
| R5 | `election-fraud-and-voter-exclusion-history` |
| R6 | `opinion-and-confidence-in-elections` |
| R7 | `federal-and-state-power-over-voting-rules` |

---

## 3c. Proposed reports

The report plan of [stage 4b](../../WORKFLOW.md#4b-plan-the-combined-reports). Seven combined reports; no Other-facts report is needed, because every candidate fits one of the seven. Each report covers one core area, sliced several ways, and is meant to be read as a whole; viewpoints that cite the same area point at different observations in it. This replaces the archived combined plan: its R5 → R1; R6 + R7 + part of R2 → R2; R8 → R3; R13 → R4; D48–D56, unplaced in the archived plan, → R5 (new); R10 + R11 → R6; R12 → R7. Report ids here are new to this topic.

Observations are written as the finding each viewpoint would link, with the candidate it rests on. "Against" lines are the findings in the same report that cut against that viewpoint, so a reader following its link meets them.

**R1. Voter ID and Citizenship-Proof Rules in the US and Other Democracies, 2000–2026**
(D4, D7, D47, D40, D38, D21, D57, D58, D59, D60)
- Artifacts, in reading order:
  1. States requesting or requiring ID at the polls, 2000–2026 (13 → 34 → 36), split strict / non-strict and photo / non-photo — *over time* (D47, D4).
  2. Current rules by state: ID category, free ID card, documentary proof of citizenship (13 states, in effect or not), 2025–26 changes — *by state* (D4, D7).
  3. Strict-photo-ID states against days of early in-person voting and free ID — *by subgroup* (D40, D4).
  4. Carter–Baker 2005 recommendations and dissents, as a dated text box — *the rest of the record* (D38).
  5. Polling-place ID in comparator democracies: the rule, photo or not, fallback (vouching), national ID card, automatic registration, adoption date and stated reason — *comparators* (D21, D57, D58, D59, D60).
  6. What happened after adoption, where measured: Great Britain's turnaways 2023 and 2024 with awareness by group; Northern Ireland's register before and after 2002 — *before and after* (D57, D58).
- Observations by viewpoint:
  - **`prove-identity`:** 36 states already ask for ID, up from 13 in 2000 (D47); photo ID is required at French polling stations in communes of 1,000+, in Canada since 2007 and in Great Britain since 2023 (D60, D59, D57); Britain's turnaways were small and fell, 0.25% → 0.08% (D57); Northern Ireland adopted ID after personation and officials reported "a marked reduction" in suspected fraud (D58).
  - **`turned-away`:** comparators issue national ID cards and register voters automatically, so the state supplies the ID (D21, D60); awareness of Britain's rule was 71% among the young and 76% among ethnic minorities, against 87% overall (D57).
  - **`id-plus-access`:** most strict-photo states already pair ID with weeks of early voting, and Georgia offers a free card (D40, D4); Carter–Baker paired free photo ID with outreach and mobile offices (D38); Canada keeps a vouching fallback (D59).
  - **`states-decide`:** rules vary widely and keep shifting; documentary-proof laws are repeatedly enjoined (D4, D7, D47).
  - **Against `prove-identity`:** Britain had 1 personation conviction in 2019 before its law (D57, *unverified*); no fraud rationale was found for Canada, whose rule is not photo-only (D59); Germany asks for ID only on request (D60); Northern Ireland's register fell about 10% after 2002, mostly from its registration rules (D58).
  - **Against `id-plus-access`:** the commission split, and its co-chair called Georgia's 2005 law a poll tax (D38); Mississippi and New Hampshire have strict photo ID and no early voting (D40).

**R2. Burdens of ID and Citizenship-Proof Rules: Missing Documents, Rejections and Turnout**
(D15, D17, D11, D16, D31, D1, D8, D9, D39, D57)
- Artifacts, in reading order:
  1. Voting-age citizens lacking documents, by type — no government photo ID, outdated ID, no proof of citizenship, proof not readily available — and by age, race and income — *by subgroup* (D15).
  2. Arizona 2024: about 218,000 long-registered voters without proof of citizenship on file, and why — *the rest of the record* (D17).
  3. Kansas, 2013–16: applicants cancelled or suspended under proof of citizenship, against non-citizens found over 19 years — *denominator* (D11).
  4. Mail-ballot rejection before and after ID-number rules, Texas and Georgia 2018–2024, beside the national rate — *over time, comparators* (D31, D16, D1).
  5. What rejected Texas voters did next (2022 primary) — *the rest of the record* (D31).
  6. Turnout-effect estimates with confidence intervals, overall and by group: the national voter-file panel and GAO's Kansas and Tennessee study — *by study, by subgroup* (D8, D9).
  7. Georgia's racial turnout gap, 2014–2024, with SB 202 marked; voter-reported problems in 2022 — *over time* (D39).
  8. Great Britain 2024: share of non-voters citing the ID rule — *comparators* (D57).
- Observations by viewpoint:
  - **`turned-away`:** Kansas blocked 31,089 applicants against at most 39 non-citizens on its rolls (D11); Texas rejected 12.38% of mail ballots in March 2022 and still about 3.5% in 2024, against 1.2% nationally (D31, D1); about 90% of rejected Texas voters did not vote another way (D31); GAO found larger drops for young, new and Black registrants (D9); 21.3 million citizens lack ready proof of citizenship (D15).
  - **`prove-identity`:** the national panel finds "no negative effect on registration or turnout" for any group (D8); about 2.6 million have no government photo ID at all — most who "lack" ID hold an outdated one (D15); 1.1% of Georgia voters reported a problem in 2022 (D39).
  - **`id-plus-access`:** no aggregate turnout cost (D8); Georgia's mail rejection stayed near the national rate after SB 202 (D31).
  - **X2, X3:** blocked-applicant and rejection counts sit beside the turnout estimates, so both errors and the "burden without turnout effect" question are read together.
  - **Against `turned-away`:** Georgia's gap was widening before SB 202, and the Brennan Center says it cannot attribute it to the law (D39); Texas's rate fell after the first primary (D31).
  - **Against `prove-identity` and `id-plus-access`:** the same panel finds "no effect on fraud – actual or perceived" (D8); Texas's ID-number rule left rejections about four times their 2020 level (D31).

**R3. Non-Citizens on US Voter Rolls: Audits, Database Flags and Confirmed Cases, 2016–2026**
(D12, D28, D29, D30, D11, D14, D17)
- Artifacts, in reading order:
  1. State reviews: registrants checked, flagged, confirmed non-citizen registrants, confirmed as having voted, later shown to be citizens, referrals and indictments, each dated (Georgia 2024 and 2026; Ohio 2019–2025; Iowa; Louisiana; Texas; Tennessee; Indiana) — *by state* (D12, D28, D29).
  2. Confirmed counts against registrants, ballots cast and recent statewide margins — *denominator* (D29).
  3. From flag to confirmed case: Iowa 2,176 → 277 → 35; Texas 2,724 → county outcomes; Alabama 3,251 → about 2,000 citizens; Ohio 633 referrals → 12 taken → 6 indictments — *the rest of the record* (D28, D29, D30).
  4. SAVE's national use, 2025–26 (65M+ checked in 26 states, 28,635 flagged; unaudited) — *scale* (D12, D28).
  5. How non-citizens reach the rolls: licence-record coding, checkbox forms, jury forms — *by mechanism* (D12, D17, D28).
  6. The earlier record: the 2016 survey of officials (about 30 suspected in 23.5 million votes) and Kansas's court findings — *the longer run* (D14, D11).
- Observations by viewpoint:
  - **`prove-identity`:** non-citizens do reach the rolls and some vote — Ohio referred 1,084, 167 of whom voted; Iowa 35 voted; Louisiana 79 since the 1980s (D29); most arrive by administrative error that a registration check would close (D17, D12).
  - **`turned-away`:** confirmed cases are hundredths of a percent of registrants or fewer (D29); flag lists shrink sharply on review — 87% of Iowa's list not confirmed, about 2,000 of Alabama's 3,251 citizens (D29, D30); in Denton County 14 of 84 flagged proved citizenship (D28).
  - **`clean-rolls`:** a full-roll check is feasible — Texas ran 18 million registrants through SAVE (D28).
  - **X2:** ineligible votes found and eligible citizens wrongly flagged are shown in the same table.
  - **Against `clean-rolls` and `prove-identity`:** SAVE flags included citizens whom the state's own licence records would have cleared, and no SAVE error rate is published (D28); the confirmed counts are far below recent margins, such as Georgia's 11,779 in 2020 (D29).
  - **Against `turned-away`:** the attempts and votes are real and recur every cycle in Ohio's series (D29).

**R4. Voter Roll Maintenance: Stale Records, Removals and Matching Errors, 2004–2026**
(D32, D33, D34, D35, D36, D37; error events also draw on D30 and D54)
- Artifacts, in reading order:
  1. Records removed per cycle by reason, 2014–2024, with the 2024 definitional break marked — *over time, by reason* (D32; the 2014–2020 reason shares are still to be read).
  2. Removal rates by state, 2022–24 — *by state* (D32).
  3. Confirmation notices sent and never returned, and what Ohio's notice recipients said — *the rest of the record* (D32, D34).
  4. ERIC reports by type, 2013–2026, with the membership timeline and departures — *over time* (D33).
  5. The 2011 stale-record baseline as a dated point — *the longer run* (D35).
  6. NVRA rules box: "reasonable effort", the 90-day limit, the two-cycle mover rule; *Husted* and *Arcia* — *legal record* (D34).
  7. Bulk-removal error events: Florida 2000, Florida 2012, Virginia 2013, New York City, Ohio 2019, Alabama and Virginia 2024 — flagged against shown eligible — *the rest of the record* (D37, D34, D30, D54).
  8. Bloated-roll claims traced to what they counted — *by source* (D36).
- Observations by viewpoint:
  - **`clean-rolls`:** 21.3 million records removed in 2022–24, mostly non-responders, movers and the dead (D32); ERIC has reported 14.6 million cross-state movers since 2013 (D33); about 13% of records were inaccurate in 2011 (D35).
  - **`prove-identity`:** the EAC says lists "will contain some number of voter records for individuals who are no longer eligible" (D32); bloated-roll claims, with what each counted (D36).
  - **`turned-away`:** bulk matching sweeps up eligible voters (D37, D30, D54); in Ohio's 2012 data only about 4% of notice recipients said they had moved, while about 235,000 said they had not (D34).
  - **Against `clean-rolls`:** the largest removal category is non-response, which may include eligible voters (D32, D34); many of the states most associated with ID left ERIC in 2022–23 (D33).
  - **Against `prove-identity`:** stale records are not votes, and the roll claims count inactive records the system is already removing (D36, D32).
  - **Against `turned-away`:** most removals are lawful removals of movers and the dead, including in the purge totals advocates cite (D37, D32).

**R5. Election Fraud and Voter Exclusion in the US, 1860s–2026**
(D48, D49, D50, D53, D54, D55, D56, D45, D13, D14, D38, D25, D51, D52; D58 as comparator)
- Artifacts, in reading order:
  1. Fraud by machines and aligned groups — Tammany Hall, Kansas City 1936, Illinois 1960, Chicago 1982, Duval County 1982 — with method, scale against margin, how it was caught, outcome and the date the outcome is as of — *the rest of the record* (D50, D49, D48).
  2. Exclusion and count manipulation by officials — Jim Crow registration tools, Box 13 in 1948, Florida's 2000 list, Georgia's 2018 "exact match", the post-2020 certification refusals — same columns; Northern Ireland's Cameron report as a comparator — *the rest of the record, comparators* (D53, D54, D55, D58).
  3. Black registration before and after the Voting Rights Act, by Southern state — *over time* (D53; USCCR tables still to be read).
  4. Remedies timeline: the secret ballot (1884–1891; South Carolina 1950), the poll-tax and literacy-test bans, the VRA, NVRA, HAVA, the spread of state ID laws — *dated record* (D56, D45, D53, D47 via R1).
  5. Modern detected fraud against ballots cast: impersonation incidents 2000–14, and case-list counts by type with their method stated — *denominator* (D14, D13), with Carter–Baker's verdict (D38).
  6. Modern cases that changed or voided a result, by method: East Chicago 2003, NC-09 2018, Paterson 2020 — *by method* (D51, D25, D52).
  7. **How the fraud was done, and whether ID would have reached it.** Every documented case in artifacts 1, 5 and 6 classified by method — impersonation at the polls, repeat voting, padded or fictitious registrations, officials stuffing or miscounting, absentee fraud, vote buying — with a column for whether a polling-place ID check would have stopped it. Shows directly whether the fraud people remember was the kind ID prevents. *By method* (D48–D51, D25, D52, D13, D14). **Gap:** the Chicago 1982 grand jury report and Kansas City court record are needed to classify those cases by method; until read, mark them "method not yet confirmed".
- Observations by viewpoint:
  - **`prove-identity`:** machine fraud was real, large and prosecuted — 58 convicted after Chicago's 1982 election, 259 of 278 defendants in Kansas City (D48, D50); a down-ballot Illinois race was stolen in 1960 (D49); Carter–Baker: fraud and multiple voting "both occur, and it could affect the outcome of a close election" (D38).
  - **`turned-away`:** officials used eligibility rules to exclude — Louisiana's Black registrants fell from 130,334 in 1896 to 5,320 in 1900 (D53); Florida's 2000 list was badly inaccurate (D54); detected impersonation was 31 incidents in more than a billion ballots (D14).
  - **`clean-rolls`:** database purges have erred on eligible voters (Florida 2000, Georgia 2018), the risk its matching must avoid (D54).
  - **Against `prove-identity`:** Chicago's 1982 fraud was caught by prosecutors, not by an ID rule (D48); Illinois 1960 fraud was smaller than the presidential margin (D49); the modern cases that changed results were absentee, which polling-place ID does not reach (D51, D25, D52).
  - **Against `turned-away`:** one reading of the Florida data finds whites wrongly listed at almost twice the Black rate (D54); the Jim Crow tools were discretionary or wealth tests that the VRA removed (D53); every post-2020 certification refusal was forced to certify (D55).
  - **Crux:** the two case tables have no common measure, so "which danger was bigger" stays a crux.

**R6. Public Opinion on Voting Rules and Confidence in US Elections, 2000–2026**
(D18, D19, D2, D20, D41, D42, D39)
- Artifacts, in reading order:
  1. Support by party for photo ID, proof of citizenship, early voting and automatic registration (Pew 2018–2025; Gallup 2016–2024) — *over time, by party* (D18, D19).
  2. `dataStillNeeded`: the share backing both ID and early voting (I4a; no published crosstab).
  3. Confidence in elections by party (Gallup 2006–2026; Pew 2020–2026), with wording notes — *over time, by party* (D18, D19).
  4. Confidence by voting mode and party — *by subgroup* (D2).
  5. The winner effect, 2000–2018 — *by subgroup* (D41).
  6. Winner–loser confidence gaps worldwide with the US marked; expert integrity scores — *comparators* (D42).
  7. Georgia 2020–22: confidence by party and the self-reported effect of SB 202 — *state case* (D39).
  8. Studies of whether rules move confidence — *by study* (D20; D8 via R2).
- Observations by viewpoint:
  - **`prove-identity`:** photo ID has 83–84% support, including most Democrats (D18, D19); one study finds strict ID raises confidence (D20).
  - **`id-plus-access`:** both photo ID and early voting are majority positions, and each party has moved toward the other's rule since 2021 (D19); voters distrust results produced by procedures they oppose (D20); a winner–loser gap is the global norm (D42).
  - **`turned-away`:** other studies find strict ID has no effect on confidence (D20); Georgia's confidence gain under SB 202 came on the side that wrote it, while 46.8% of Democrats said it lowered theirs (D39).
  - **Against `id-plus-access`:** no figure for the overlap exists (I4a); confidence follows who won (D41), though in 2025 the US broke that pattern, so something else also drives it (D42).
  - **Against `turned-away`:** Democratic support for photo ID is up 14 points since 2022 (D18).

**R7. Federal and State Power Over Voter ID and Registration Rules, 1965–2026**
(D24, D45, D46, D47, D4, D7, D34)
- Artifacts, in reading order:
  1. Dated timeline of federal voting laws, 1965–2026, with failed bills (Freedom to Vote Act 2021–22; SAVE America Act 2025–26) — *over time* (D45, D24).
  2. Live measures and their court status as of 23 Oct 2026: SAVE America Act, EO 14248, EO 14399, the SAVE database — *the rest of the record* (D24).
  3. Key holdings: *ITCA* 2013, *Moore* 2023, *Husted* 2018, the 2025–26 executive-order rulings (and *Crawford* 2008 once researched) — *legal record* (D46, D34, D24).
  4. State variation in ID and proof-of-citizenship rules over time — *by state, over time* (D47, D4, D7; detail in R1).
- Observations by viewpoint:
  - **`states-decide`:** courts held EO 14248's citizenship sections exceed presidential authority (D24, D46); recent national bills from both parties failed (D45); *ITCA*: the Elections Clause covers "how federal elections are held, but not who may vote in them" (D46).
  - **`prove-identity`:** Congress's power is "paramount… and may be exercised at any time, and to any extent" (D46); HAVA already sets an ID rule for first-time mail registrants (D45); the House has passed the SAVE America Act three times (D24).
  - **`id-plus-access`:** both parties have sought national standards; the Freedom to Vote Act would have required ID states to accept alternatives (D45).
  - **Against `states-decide`:** the Supreme Court let EO 14399 stand as an internal directive and let DHS use the revived SAVE system (D24); Congress has set national floors repeatedly (D45).

**Candidates placed.** Every candidate in 3b is in at least one report: R1 D4, D7, D21, D38, D40, D47, D57, D58, D59, D60; R2 D1, D8, D9, D11, D15, D16, D17, D31, D39, D57; R3 D11, D12, D14, D17, D28, D29, D30; R4 D30, D32, D33, D34, D35, D36, D37, D54; R5 D13, D14, D25, D38, D45, D48, D49, D50, D51, D52, D53, D54, D55, D56, D58; R6 D2, D18, D19, D20, D39, D41, D42; R7 D4, D7, D24, D34, D45, D46, D47. **None left out.**

---

## 3d. Problems for the human

**Decisions about the split:**
- **Retagging.** D1, D25, D51, D52 and D56 moved from [MAIL] to [BOTH], and D48 from [ID] to [BOTH] (reasons in the header). The alternative was to keep the tags and link across files, which would put this topic's history report on evidence held in another topic's file.
- **Copies.** [BOTH] candidates now exist in two files. Stage 4 verbatim quoting must update both copies, or the human could name one file as the master and reduce the other to a pointer.
- **One burden report, not two.** Missing documents, rejections and turnout effects (the archived R6, R7 and the ID half of R2) are merged into R2, because X3 needs the rejection counts beside the turnout studies. They could be split back into "who lacks ID" and "turnout effects" if R2 reads as too long.
- **History gets its own report (R5)** rather than being spread across R1 and R3, as the brief asked, so the fraud and exclusion records sit side by side.

**Outline claims the evidence does not support as written:**
- **`turned-away` "Texas reinstated about a fifth of the voters SAVE flagged."** No statewide figure has been published (D28). The "fifth" is Denton County's 14 of 84. Narrow it to that county, plus the state's order to reinstate "some" voters.
- **`states-decide` on the courts.** The courts did block the EO 14248 citizenship section. But the Supreme Court let EO 14399 itself proceed, and let the revived SAVE system be used (D24, D46). Do not imply the March 2026 order is blocked.
- **`prove-identity` "other democracies adopted ID after fraud: Northern Ireland, Britain 2023, Canada 2007."** Only Northern Ireland is documented that way (D58).
  - Britain: before its law, Britain had 1 personation conviction in 2019 (D57, unverified at source).
  - Canada: no fraud rationale was found for 2007, and Canada keeps non-photo ID and vouching (D59).
  - Narrow it to "Northern Ireland adopted ID after personation; Britain and Canada now require it too".
- **`prove-identity` "the 1982 investigation led to dozens of convictions."** Supported: 58 convicted by 1985 (D48). The "100,000 fraudulent votes" figure often paired with it is not sourced. Keep it out until the grand jury report is read.
- **`prove-identity` "rules that seem unnecessary now are the reason it stopped being easy."** No causal evidence was found. The Chicago fraud was caught by prosecutors, not by ID (D48). East Chicago and Paterson were absentee cases that polling-place ID would not reach (D51, D52).
- **`prove-identity` "*Crawford* (2008) upheld Indiana's ID law…"** No candidate covers *Crawford*. It is a legal fact that belongs in R7; it needs researching before stage 5.
- **`prove-identity` "large majorities across parties and races".** Party splits are read (D18, D19); race splits were not found in a fetched source. Drop "and races" or find them.
- **`clean-rolls` "SAVE has checked more than 65 million voters in 26 states".** This is the Solicitor General's figure, not audited (D12). Attribute it.
- **`turned-away` "Jim Crow tools prove a rule is only as fair as its officials."** The history is solid (D53). But those tools were discretionary or wealth tests, which the VRA removed. Whether a uniform free ID is comparable is a judgement, not a measure. It belongs in the "which danger was bigger" crux.

**Viewpoints with thin evidence:**
- **`id-plus-access`'s state test** rests on Georgia alone (D39), and its overlap question has no figure (I4a).
- **`states-decide`'s "states learn which rules work"** has adoption counts (D47) but nothing linking adoption to results.
- **`clean-rolls`' "how many are inaccurate"** has only Pew 2011 as a direct measure (D35).
- **The cross-cutting question "which danger was bigger"** has case lists on both sides but no common measure.

**No good data exists:**
- Undetected fraud.
- Rejected or removed voters later shown eligible, apart from Kansas and county fragments.
- The cost and travel time to obtain ID documents.
- A neutral cross-national ID count.
- A consistent US series of election-crime prosecutions (D48).

**Sources whose reliability is disputed:**
- **Fraud and roll-claim compilers:** Heritage (curated, no denominator); Judicial Watch and PILF (registration counts against Census estimates).
- **Advocacy-linked sources:** the Brennan Center (referrals; purge totals); the CDCE and VoteRiders surveys; the Electoral Reform Society's UK turnaway totals.
- **Party filings:** the *Beals* stay opposition (an advocacy filing).
- **Officials' own figures:** secretary-of-state announcements; SAVE flags.
- **Secondary-only:** Wikipedia was used as the read source for Box 13, Otero, Cochise, Kansas City and Northern Ireland outcomes. Each needs its primary source.

**Blocked sources, for download by hand:**
- **US state and court sources:** the Ohio, Georgia and Iowa secretary-of-state sites (403); the Alabama injunction and the 4th Circuit *PILF v. NCSBE* opinion; congress.gov and senate.gov; the Heritage fraud database.
- **Historical:** the USCCR 1968 *Political Participation* report (too large or scanned); the Chicago 1982 grand jury report; the 1961 Wexler report; Milligan's *Missouri Waltz*.
- **UK:** the Electoral Commission website (403 on every page: the 2023 and 2024 voter ID reports, fraud data); parliament.uk committee reports (the 2004 Northern Ireland Affairs Committee report).
- **Other:** electionlawblog (Clinton); the UGA SPIA poll; the MIT *How We Voted* PDF (too large).
- **Not reached when the search budget ran out:** the 1983 Northern Ireland personation figures; the Converse–Burnham–Kousser turnout debate; 2025–26 certification refusals; the Cochise outcome for Crosby.

**The facts will move within weeks.** These will alter R3, R4, R6 and R7:
- the 3 Nov midterms;
- a possible lame-duck vote on the SAVE America Act;
- the First Circuit appeal on EO 14248, argued 9 Dec;
- the merits of EO 14399;
- the revived SAVE system;
- the 2026 EAVS, due mid-2027.

---

## Coverage check (stage 5)

Every stage-3 question mapped to the observations that answer it, as
`report-id/observation-id`. Observation ids and the gaps each builder found
are in [stage5-results.md](stage5-results.md).

| # | Answered by | Gap recorded |
|---|---|---|
| I1a | `election-fraud-and-voter-exclusion-history/machine-fraud-real-and-prosecuted`, `/case-table`, `/remedies-timeline` | Chicago 1982 grand jury report not online |
| I1a (method) | `election-fraud-and-voter-exclusion-history/case-table`, `/id-would-not-reach`, `/officials-did-the-fraud` | two cases "method not confirmed" |
| I1b | `voter-id-rules-in-the-us-and-abroad/photo-id-common-in-g7`, `/northern-ireland-after-personation`, `/ni-after-photo-id`, `/britain-turnaways-small-and-falling` | OECD-wide comparison (Barton 2022) blocked |
| I1c | `non-citizens-on-voter-rolls/found-on-rolls`, `/hundredths-of-a-percent`, `/votes-per-ballots`, `/below-margins` | undetected registration (`dataStillNeeded`; crux) |
| I1d | `opinion-and-confidence-in-elections/photo-id-majorities`, `/photo-id-across-races`, `/proof-of-citizenship-support` | proof-of-citizenship support only for 2024 |
| I2a | `burdens-of-id-and-citizenship-rules/kansas-blocked-vs-noncitizens`, `/texas-march-2022-spike`, `/texas-still-above-baseline` | eligibility of rejected people known only for Kansas (crux candidate) |
| I2b | `burdens-of-id-and-citizenship-rules/national-panel-no-turnout-effect`, `/gao-larger-drops-young-new-black`, `/burden-without-turnout-effect` | no national study of proof-of-citizenship rules |
| I2c | `burdens-of-id-and-citizenship-rules/no-id-versus-outdated-id`, `/dpoc-not-readily-available`, `/who-ran-the-survey` | cost and travel time to obtain documents |
| I2d | `election-fraud-and-voter-exclusion-history/louisiana-registration-collapse`, `/florida-2000-list`, `/georgia-exact-match`; `voter-roll-maintenance/bulk-matching-errs` | USCCR 1968 tables blocked |
| I3a | `voter-roll-maintenance/removals-21-million`, `/mostly-moves-deaths-nonresponse`, `/pew-only-direct-measure` | no measure since 2011 |
| I3b | `non-citizens-on-voter-rolls/texas-save-reversals`, `/flag-lists-shrink`; `voter-roll-maintenance/save-flags-citizens`; `federal-and-state-power-over-voting-rules/save-database-revived` | no national SAVE error rate |
| I4a | `opinion-and-confidence-in-elections/overlap-not-published` | no published crosstab |
| I4b | `opinion-and-confidence-in-elections/confidence-follows-power`, `/post-election-winner-swing`, `/studies-find-no-effect`, `/milyo-finds-effect` | — |
| I4c | `burdens-of-id-and-citizenship-rules/georgia-rejections-near-national`, `/two-states-opposite`; `opinion-and-confidence-in-elections/georgia-rebound` | Georgia is the only test |
| I5a | `federal-and-state-power-over-voting-rules/save-america-act-status`, `/eo-14248-blocked`, `/eo-14399-allowed` | no appellate merits ruling |
| I5b | `voter-id-rules-in-the-us-and-abroad/us-36-states-up-from-13`, `/rules-vary-widely`; `federal-and-state-power-over-voting-rules/state-rules-vary` | nothing links rule adoption to results |
| S1 | `election-fraud-and-voter-exclusion-history/case-table`, `/officials-did-the-fraud`, `/no-common-measure` | no common measure (crux) |

No question is left unanswered or unrecorded.

## Corrections from the vote-by-mail deep research (2026-10-26)

Shared [BOTH] candidates re-verified while researching
[`us-vote-by-mail`](../us-vote-by-mail/candidate-data.md). The finished
voter-ID reports already use the corrected forms.

- **D13 (Heritage database):** counts are from the archived data file — 1,619 records, 387 tagged absentee, 34 impersonation; Heritage calls it "a sampling ... not comprehensive".
- **D50 (Kansas City 1936):** "a total of 259 convictions" (US Attorney, W.D. Mo.), not "259 of 278 defendants".
- **D56 (secret ballot):** US adoption from *Burson v. Freeman* — Louisville, Massachusetts and New York in 1888; "almost 90 percent of the States" by 1896.
- **D2 (MIT party shares of mail voting):** confirmed.
