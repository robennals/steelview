# UK asylum: flows, decisions and policy (stage-3 research)

Stage-3 research for [`uk-asylum`](../outline.md), the area covering asylum flows, decisions and the policies aimed at them. Researched 2026-10-24. Candidates are numbered D1–D49 and questions F1–F13. Viewpoint ids are `bar-and-remove`, `tighten-within-the-echr` and `refuge`.

- **"My arithmetic"** means a figure I computed from a fetched official dataset. The dataset counts as **read**; the sum is mine, and stage 5 should recompute it.
- **Datasets downloaded and parsed** (all read):
  - Home Office small-boats daily and weekly time series to 23 Oct 2026.
  - Home Office year-ending-June-2026 detailed datasets: Asy_D02, Asy_D09, IER_D01–D03, and the safe and legal routes summary tables.
  - Eurostat `migr_asyappctza`, `migr_asydcfsta` and `demo_gind`.

## 3a. Question index

| # | Question | Viewpoints | Answers it | Context | Likely status, and how to narrow it |
|---|---|---|---|---|---|
| F1 | How many people crossed by small boat each year, from which nationalities, and what happened to their claims? | `bar-and-remove`, `refuge`, `tighten-within-the-echr` | D1, D2, D3 | *run:* D1 (daily from 2018), D4 (irregular entry before 2018: lorry and port attempts, *unverified*). *comp:* D5 (Frontex routes to the EU). *record:* D2 (initial outcomes by arrival year and nationality), D21. *mechanism:* D6, D7, D8. | **Well-supported.** About 204,500 people crossed from 2018 to June 2026. Of the claims decided so far, 59% were granted at initial decision. The 59% excludes withdrawals (24,000) and appeals, so the denominator has to be stated. |
| F2 | Why did crossings fall in 2026: policy, French action at sea, the NCA, or weather? | `tighten-within-the-echr`, `bar-and-remove` | D1, D7, D5, D6, D8 | *mechanism:* D7 (Met Office "red days"), D1 (French preventions; people per boat). *comp:* D5 (central Mediterranean down 56%, Channel attempts down 43%). *cf:* D6. | **Complicated.** Weather explains little: red days fell about 11% while arrivals fell about 43%. French preventions fell in step with arrivals, so the prevention *rate* barely moved. The fall matches an EU-wide fall in irregular arrivals. No source separates policy from other causes. |
| F3 | What did the UK–France "one in, one out" deal achieve, and why did it end? | `tighten-within-the-echr`, `bar-and-remove` | D9 | *denom:* D9 (27,920 arrivals in the same period), D1. *record:* D9 (ended 30 Sep 2026). | **Well-supported** for the numbers: 1,087 out and 1,117 in to 30 June 2026, about 4% of arrivals. The cost (about £56,000 per return) and the reason it ended rest on news reports. |
| F4 | Why did Albanian crossings collapse after 2022? | `tighten-within-the-echr` | D12, D2, D21 | *run:* D2 (quarterly Albanian arrivals). *cf:* D12 (the fall began before 13 Dec 2022). *record:* D21 (Albanian initial grant rate 62% in 2022, 12% in 2023, 3% in 2024). | **Complicated.** The fall began before the deal: 9,044 in Q3 2022 against about 1,000 in October and 28 in December. Albanian arrivals have stayed more than 90% below 2022 since. Attribute the staying-low to the deal plus refusals and faster processing, not the initial fall. |
| F5 | What happened to claims, grant rates and integration in Denmark after protection became temporary? | `tighten-within-the-echr`, `refuge` | D13, D14, D15, D16, D17, D20 | *comp:* D13, D14 (Sweden and Germany in the same source). *cf:* D13 (the EU-wide 2016 fall). | **Complicated.** Danish claims per head are about one-fifth of the EU average (3.1 against 14.9 per 10,000 in 2025). But Denmark's 2015→16 fall (−71%) matches Sweden's (−86%), Denmark's grant rate is near the EU's, and Denmark made many changes at once. No study isolates temporary status. |
| F6 | How have the backlog, decision times and hotel use changed since 2022, and what does asylum cost? | `tighten-within-the-echr`, `bar-and-remove`, `refuge` | D23, D24, D25, D26, D3 | *run:* D23 (support by accommodation type, 2014–2026). *denom:* D26 (Home Office budget), D3 (claims). *mechanism:* D25 (hotels are 35% of people and 76% of contract cost). | **Well-supported.** The initial-decision backlog is down 77% from its peak and hotel use is down 71%. Asylum support cost £4.7bn in 2023-24 and £4.0bn in 2024-25. Note that the backlog has moved to appeals (D22). |
| F7 | What share of claims, by nationality, is granted at first decision and after appeal, and why did it fall in 2023–25? | `refuge`, `bar-and-remove` | D21, D22 | *run:* D21 (2001–2026 by nationality). *record:* D21 (Syria 98%→9%; Afghanistan 98%→33%), D12. | **Well-supported** for initial decisions. The fall is largely a change of nationality mix plus Syria after Assad. The appeal series (Asy_D04 cohorts) was not fetched: only the latest quarter (39% allowed) is read. |
| F8 | How many claims does the UK receive per head, against other European countries? | `refuge` | D13, D3 | *run:* D13 (2008–2025). *comp:* D13 (EU27 and 14 countries). | **Well-supported, but it cuts against the outline.** UK claims per head rose from about 6 per 10,000 (2015–19) to 14.5 in 2025, level with the EU27 average of 14.9. The Home Office ranks the UK 16th of the EU+ per head. |
| F9 | How many people came by each safe and resettlement route each year, against crossings by nationality? | `refuge`, `tighten-within-the-echr` | D11, D10, D2 | *denom:* D2 (crossings by nationality). *run:* D11 (2010 to YE June 2026). | **Well-supported.** Ukraine and Hong Kong: hundreds of thousands of visas and almost no boat arrivals. For Eritreans, Sudanese and Iranians, the only route of any size is family reunion, now paused. |
| F10 | Does the right to work while waiting draw more claims? | `refuge`, `bar-and-remove` | D27, D28, D29, D33 | *comp:* D27 (EU 2008–2020). | **Complicated, leaning to "weak effect".** One cross-country study finds a "modest" association, not none. The Home Office has published no estimate (*unverified*). |
| F11 | What did the Rwanda scheme cost, and how many people did it move? | `refuge`, `bar-and-remove` | D30 | *record.* | **Well-supported:** about £700m–£715m and four voluntary relocations. Narrow it to say "four volunteers; no enforced removals". |
| F12 | How do refugees with secure status fare in work, against those on temporary status? | `refuge`, `tighten-within-the-echr` | D17, D18, D19, D20, D28 | *comp:* Denmark, Sweden, Germany. *UK before and after 2022:* none found. | **Complicated.** Three reforms (Denmark 2002, Germany 2016, Denmark 2007 *unverified*) found no gain or a loss from less-secure status. Sweden 2013 found higher short-run income on temporary permits, but less education. No UK evaluation exists. |
| F13 | What is the current policy record (30-month protection, the Bill's asylum provisions, Piddington)? | `tighten-within-the-echr` | D15, D31, D32, D10 | *record.* | **Well-supported** for 30-month protection (written statement, read). The Bill's clauses and Piddington are *unverified* (secondary only). |

## 3b. Candidate datasets

### D1. Home Office, *Migrants detected crossing the English Channel in small boats*: time series
- **Source:** Home Office, `23_October_2026_Small_boats_-_time_series.ods`, updated 24 Oct 2026. https://assets.publishing.service.gov.uk/media/6adb41a0b62d80a107bc5c3f/23_October_2026_Small_boats_-_time_series.ods ; collection page https://www.gov.uk/government/publications/migrants-detected-crossing-the-english-channel-in-small-boats
- **Measures:**
  - SB_01: daily arrivals and boats.
  - SB_02: weekly arrivals, boats, and the people and events "prevented", as estimated by the French authorities.
  - Excludes larger vessels, clandestine entry on ferries and undetected arrivals. Figures are provisional operational data and differ slightly from the quarterly statistics (D3).
- **Coverage:** daily from 1 Jan 2018. In this file, preventions appear from about May 2024.
- **Shape:** series.
- **Slices:** day or week, boats, people per boat, preventions.
- **What it shows (read; my arithmetic):**

  | Year | Arrivals | Boats | Days with arrivals |
  |---|---|---|---|
  | 2018 | 299 | 43 | 29 |
  | 2019 | 1,843 | 164 | 81 |
  | 2020 | 8,462 | 641 | 130 |
  | 2021 | 28,526 | 1,034 | 154 |
  | 2022 | 45,755 | 1,110 | 162 |
  | 2023 | 29,437 | 602 | 140 |
  | 2024 | 36,816 | 695 | 151 |
  | 2025 | 41,472 | 672 | 139 |

  - **2026 to 23 Oct:** 20,935 arrivals, against 36,954 to the same date in 2025 (−43%).
  - **Boats, same period:** 305 against 603 (−49%).
  - **Days with arrivals, same period:** 97 against 128.
  - **People per boat:** 68.6 in 2026 against 61.7 in 2025 and 41.2 in 2022.
  - **French preventions, weeks to about 24 Oct:** 10,708 in 2026 against 20,109 in 2025 (−47%).
  - **Attempts** (arrivals plus preventions) fell about 44%. The share prevented was about 34% in both years.
- **Helps:**
  - `tighten-within-the-echr`: the 2026 fall is real and large.
- **Hurts:**
  - `tighten-within-the-echr`: French preventions fell in step with arrivals, so "more interceptions" did not drive the fall in this measure. Fewer boats were launched.
  - `bar-and-remove`: crossings fell 43% while the UK stayed in the ECHR.
  - `refuge`: no new safe route opened before September 2026, yet crossings fell.

### D2. Home Office, *Illegal entry routes to the UK*, detailed datasets IER_D01–D03 (year ending June 2026)
- **Source:** Home Office, released 27 Aug 2026. https://assets.publishing.service.gov.uk/media/6a85c41d3d82f78d5c514551/illegal-entry-routes-to-the-uk-dataset-jun-2026.xlsx
- **Measures:**
  - D01: detected arrivals by method (small boat, inadequately documented air arrivals, detections at ports and inland), nationality, sex and age.
  - D02 and D03: asylum claims and initial outcomes for small-boat arrivals, by arrival quarter (2018–2025; next update May 2027).
  - Excludes appeal outcomes and undetected entry.
- **Coverage:** 2018 Q1 to 2026 Q2.
- **Shape:** series.
- **Slices:** nationality, quarter, outcome, applicant type, unaccompanied children, sex, age.
- **What it shows (read; my arithmetic):**
  - **Small-boat arrivals by nationality, 2022 → 2025:**
    - Afghanistan 9,088 → 4,801
    - Eritrea 2,020 → 7,583
    - Sudan 1,762 → 4,447
    - Iran 5,841 → 4,505
    - Syria 3,006 → 1,531
    - Somalia 86 → 3,806
    - Albania 12,658 → 264
    - Vietnam 505 → 1,440
    - Ukraine 0–5 a year; Hong Kong 0
  - **Total, 2018 to June 2026:** about 204,500.
  - **Outcomes for 2018–2025 arrivals** who claimed (about 179,700):
    - 81,400 granted at initial decision
    - 56,400 refused
    - 24,200 withdrawn
    - 9,600 administrative outcomes
    - 8,100 awaiting
  - **Initial grant rate** (grants ÷ grants + refusals), by arrival year:
    - 2022: 71%
    - 2023: 50%
    - 2024: 48%
    - 2025: 57%
  - **Initial grant rate by nationality, 2018–25 arrivals:**
    - Sudan 92%, Eritrea 89%, Iran 64%, Syria 62%, Afghanistan 57%
    - Iraq 31%, Vietnam 17%, Turkey 17%, Albania 2%
    - For Albanians, 8,460 of 13,362 outcomes were withdrawals.
  - **Albanians by quarter:**
    - 2022: Q2 2,194; Q3 9,044; Q4 1,185
    - 2023: Q1 29; Q3 587
  - **Other detections, 2018 → 2025:** inland detections 7,257 → 1,816; port detections 1,052 → 204.
- **Helps:**
  - `refuge`: most arrivals come from nationalities granted at high rates.
  - `bar-and-remove`: tens of thousands of arrivals are refused or withdraw, and with a top grant rate of 92% few nationalities are "almost all refugees".
- **Hurts:**
  - `bar-and-remove`: "most are economic migrants" is not supported at initial decision.
  - `refuge`: about 41% of decided claims are refused, before withdrawals are counted.

### D3. Home Office, *Immigration system statistics, year ending June 2026*: summary and chapters
- **Source:** Home Office, 27 Aug 2026.
  - https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-june-2026/summary-of-latest-statistics
  - …/how-many-people-come-to-the-uk-via-illegal-entry-routes
  - …/how-many-people-are-in-the-uk-asylum-system
- **Measures:** headline claims, decisions, backlog, support, returns, humanitarian routes and EU ranking.
- **Coverage:** chapters give runs back to 2001 or 2010.
- **Shape:** series (headline figures).
- **Slices:** limited.
- **What it shows (read):**
  - **Claims:** 86,000 in YE June 2026 (−21%). "Just over half" arrived by illegal routes and 41% had previously held a visa.
  - **Initial grant rate:** 38%, against a 77% peak in YE Sep 2022.
  - **Backlog:** 40,168 people awaiting an initial decision at end June 2026, against 175,457 at the June 2023 peak (−77%), 7,240 in Dec 2010 and 35,855 in Dec 2018.
  - **Small-boat arrivals:** 33,374 in YE June 2026 (−23%). The top five nationalities are Eritrean 5,875, Sudanese 4,191, Somali 3,901 (+76%), Afghan and Iranian.
  - **Returns:** 41,000 in total, of which 9,700 enforced.
  - **EU ranking:** 5th largest intake in the EU+ and 16th per head (YE March 2026).
  - **Quality flag:** the illegal-entry chapter, as returned by the fetch tool, says "September and November 2026 averaged 71" people per boat. This is probably 2025; check the raw page.
- **Helps / hurts:** as D2 and D23. The claim fall (−21%) helps `tighten-within-the-echr`. The 41% visa-to-asylum share complicates a debate framed only around boats, for all three viewpoints.

### D4. Irregular entry before 2018: Border Force prevented attempts and lorry detections (partisan and press relay)
- **Source:** Home Office figures released under freedom of information, reported by Motor Transport (2017), CILT(UK) and Full Fact. No official series was found.
  - https://motortransport.co.uk/attempts-by-migrants-to-illegally-enter-the-uk-fell-in-2016-but-remained-historically-high/3748.article
  - https://live.fullfact.org/immigration/164000-attempts-cross-border
- **Measures:** attempts stopped at the juxtaposed controls (Calais, Dunkirk, Coquelles), and clandestine entrants found in lorries.
- **Coverage:** about 2010–2016.
- **Shape:** snapshot or short series, not official statistics.
- **What it shows (*unverified*):**
  - About 81,000 prevented attempts in 2015 (Full Fact says about 84,000) and about 56,000 in 2016.
  - Lorry entrants detected: 6,429 in 2015 and 2,411 in 2014.
  - Full Fact warns that attempts are not people.
- **Helps:**
  - `refuge`: irregular entry did not start with the boats; the boats displaced lorries as port security tightened (compare D2's falling port detections).
  - `bar-and-remove`: large-scale irregular attempts are long-standing.
- **Hurts:** `tighten-within-the-echr`: enforcement at one route displaced people to another.

### D5. Frontex, irregular border crossings, January–September 2026
- **Source:** Frontex news release, 19 Oct 2026. https://www.frontex.europa.eu/media-centre/news/news-release/frontex-irregular-border-crossings-into-the-eu-down-1-3-in-the-first-nine-months-of-2026-7YMDmt
- **Measures:** detections of irregular crossings into the EU, plus Channel exit attempts (arrivals plus those stopped). Preliminary.
- **Coverage:** monthly releases. Annual series from 2009 exist on the Frontex site but were not fetched.
- **Shape:** cross-route comparison.
- **What it shows (read; Jan–Sep 2026 against Jan–Sep 2025):**
  - EU total just over 91,000, down almost a third.
  - Eastern Mediterranean about 31,800 (−15%).
  - Central Mediterranean about 22,500 (−56%).
  - Western Mediterranean about 18,300 (+26%).
  - Western African route about 7,100 (−45%).
  - Channel attempts about 30,900 (−43%).
  - Frontex credits cooperation with departure countries.
  - The Migration Observatory (D6) cites Frontex for EU crossings −26% in 2025 and −37% in H1 2026 (read via D6).
- **Helps:** `refuge` and `bar-and-remove`: the UK's fall tracks a continent-wide fall, so UK domestic policy is not the obvious cause.
- **Hurts:** `tighten-within-the-echr`'s attribution of the 2026 fall to its own measures.

### D6. Migration Observatory, "Q&A: Why have small boat arrivals declined in 2026?" (think tank; academic)
- **Source:** Mihnea Cuibus, Migration Observatory, 10 Sep 2026. https://migrationobservatory.ox.ac.uk/resources/commentaries/qa-why-have-small-boat-arrivals-declined-in-2026/
- **Measures:** a synthesis of evidence on the causes.
- **Shape:** commentary.
- **What it shows (read):**
  - 16,300 arrivals from 1 Jan to 9 Sep 2026, 47% fewer than in 2025. The year ending 9 Sep 2026 had about 27,900, the lowest since Dec 2021.
  - Weather is "unlikely to have had a significant impact".
  - French interceptions at sea are legally possible, but "it remains unclear how often this has been implemented".
  - Other possible factors:
    - Returns to France were about 4% of arrivals.
    - Boats are getting larger; one carried a record 230 people in Aug 2026.
    - More departures from Belgium.
    - Family reunion was suspended (Sep 2025).
    - The grant rate fell (76% in 2022 to 42% in 2025).
    - Frontex's EU-wide fall (D5).
    - Syrian arrivals fell 67% (2024→25).
  - Conclusion: policy and non-policy effects "cannot be separated".
- **Helps:** `tighten-within-the-echr` (policy plausibly contributed); `refuge` (wider EU trends).
- **Hurts:** any viewpoint claiming a single cause.

### D7. Home Office written answer on Met Office "red days" (PQ 26940 / 26941)
- **Source:** Anna Turley MP, Home Office, answered 10 Sep 2026. Read via the Parliament written-questions API (https://questions-statements-api.parliament.uk/api/writtenquestions/questions?uin=26940); web page https://www.parallelparliament.co.uk/question/26940/undocumented-migrants-english-channel. Parallel Parliament is blocked by Cloudflare.
- **Measures:** red days per month (the Met Office's daily assessment that a crossing attempt is likely), Sep 2019 to Aug 2026, and average arrivals per red day for January–August of each year.
- **Coverage:** Sep 2019 – Aug 2026.
- **Shape:** monthly series.
- **What it shows (read; sums are my arithmetic):**
  - **Red days, January–August:**
    - 2020: 71
    - 2021: 68
    - 2022: 82
    - 2023: 76
    - 2024: 102
    - 2025: 123
    - 2026: 110
  - **Whole of 2022:** 106 red days.
  - **Arrivals per red day, Jan–Aug:**
    - 2020: 53
    - 2021: 136
    - 2022: 251
    - 2023: 208
    - 2024: 194
    - 2025: 232
    - 2026: 144 (−38%)
  - The minister says 2026 has had "more favourable crossing conditions so far this year than the same period in almost any year since 2020".
  - **Lead (*unverified*):** a Sky News analysis (Aug 2026) found boats per favourable day down "significantly".
- **Helps:** `tighten-within-the-echr`: the fall is not mainly weather. Red days fell about 11% against 2025; arrivals per red day fell 38%.
- **Hurts:** `bar-and-remove` (Chris Philp attributed the fall to wave height, *unverified*). It does not show *which* policy worked.

### D8. NCA and Border Security Command enforcement claims (government sources)
- **Source:** National Crime Agency news releases (Felixstowe seizure, 18 Jul 2026; German raids, 21 May 2026); Home Secretary's statements on officer numbers. https://www.nationalcrimeagency.gov.uk/news/25-boats-and-25-engines-destined-for-channel-people-smugglers-seized-in-major-operation-at-felixstowe
- **Measures:** seizures, arrests, officers.
- **Shape:** record, not a series.
- **What it shows (*unverified*):**
  - More than 1,600 boats or engines seized since late 2023.
  - Organised-immigration-crime arrests up more than 55% in the year to April 2026.
  - Nearly 800 NCA officers on this work, up from 376 at the start of 2025.
  - The UK pays France £660m over three years under the April 2026 deal, with payment linked to results.
  - Home Office: 61% of small-boat events were stopped from 27 Apr to 2 Aug 2026, only 5 points up on 2025 (*unverified*, The National).
- **Helps:** `tighten-within-the-echr` (fewer boats launched, larger loads, consistent with supply disruption: D1).
- **Hurts:** nothing directly. These are inputs, not measured effects, and no evaluation exists.

### D9. UK–France Agreement: transfers and returns, and the end of the pilot
- **Source:** Home Office ad hoc statistics, 16 Jul 2026. https://www.gov.uk/government/publications/the-border-security-commanders-annual-report-data/transfers-into-and-returns-from-the-united-kingdom-under-the-uk-france-agreement-on-the-prevention-of-dangerous-journeys-between-6-august-2025-and-30
  - End of pilot: Euronews, 30 Sep 2026. https://www.euronews.com/2026/09/30/uk-ends-one-in-one-out-migrant-returns-deal-with-france
- **Measures:** completed returns to France ("OUT"; repeat returns counted once) and transfers to the UK ("IN"), by month.
- **Coverage:** Aug 2025 – Jun 2026.
- **Shape:** short monthly series and an event record.
- **What it shows:**
  - **Totals (read):** OUT 1,087, IN 1,117.
  - **Monthly OUT, rising (read):** 17 in Sep 2025, 88 in Jan 2026, 264 in Jun 2026.
  - **From Euronews (read; secondary):**
    - 27,920 small-boat arrivals over the same period, so about 4% were returned.
    - The Home Office said on 30 Sep 2026 the pilot "is no longer processing new cases".
    - Mahmood told MPs on 15 Sep that each return cost about £56,000.
    - Paris wants an EU-wide replacement.
  - Later reports of about 1,500 returns are *unverified*.
- **Helps:** `bar-and-remove` (returns at this scale do not deter); `refuge` (the IN leg was a safe route of about 1,100 people).
- **Hurts:** `tighten-within-the-echr` (its flagship deal moved about 4% of arrivals and ended).

### D10. UK Resettlement Scheme reopening, and resettlement by scheme (Res_01)
- **Source:**
  - Home Office news, "UK Resettlement Scheme reopens for new referrals", 28 Sep 2026. https://www.gov.uk/government/news/uk-resettlement-scheme-reopens-for-new-referrals
  - Safe and legal routes summary tables, Res_01, 27 Aug 2026. https://assets.publishing.service.gov.uk/media/6a85c59054bcee010d514573/safe-legal-routes-summary-tables-jun-2026.ods
- **Measures:** people resettled by scheme.
- **Coverage:** 2010 – YE June 2026.
- **Shape:** series and a policy record.
- **What it shows (read):**
  - **UKRS arrivals:** 1,269 (2021), 1,159, 617, 711, 537 (2025); 296 in H1 2026.
  - **Afghan Resettlement Programme:** 16,445 (2021), then 4,737, 3,695, 7,199, 5,874 (2025).
  - **Vulnerable Persons Resettlement Scheme (Syrians):** peak 4,832 (2017).
  - **Total resettled:** 717 in 2010, 6,212 in 2017, 18,032 in 2021, 6,417 in 2025.
  - **The reopening:**
    - About a quarter of referrals are expected to be Afghan women and girls and Palestinians.
    - Arrivals "in the hundreds at first", rising to "the low thousands", with an annual cap.
    - A 5-year path to settlement.
- **Helps:** `tighten-within-the-echr` (it is pairing enforcement with routes); `refuge` (the government concedes routes matter).
- **Hurts:** `refuge`'s hope of scale: a cap in the low thousands, against about 33,000 crossings a year.

### D11. Safe and legal (humanitarian) routes, Hum_01
- **Source:** as D10, table Hum_01.
- **Measures:** people offered humanitarian routes, by route. "In country" grants are mostly the Ukraine extension scheme.
- **Coverage:** 2010 – YE June 2026.
- **Shape:** series.
- **What it shows (read):**
  - **BN(O) Hong Kong grants:** 96,418 (2021) falling to 16,028 (2025).
  - **Ukraine grants:** 232,135 (2022), 49,027, 21,235, 148,522 (2025, mostly in-country extensions).
  - **Refugee family reunion:** about 4,000–7,500 a year (2010–2022), 9,320 (2023), 19,258 (2024), 18,577 (2025); 12,888 in YE June 2026. Paused since Sep 2025.
  - **Total out-of-country grants:** 5,603 (2010), 273,413 (2022), 48,814 (2025).
  - Set against D2: Ukrainians and Hong Kongers almost never cross by boat. For Eritrea, Sudan, Iran and Somalia, family reunion was the only sizeable route.
- **Helps:**
  - `refuge`: where routes existed at scale, nationals did not take boats.
  - `bar-and-remove`: these routes were open-ended, and the Ukraine and Hong Kong schemes were for specific crises.
- **Hurts:** `refuge`: Afghan resettlement (about 4,000–7,000 a year) ran alongside 4,800–9,100 Afghan boat arrivals a year. A route did not stop boats for a nationality where the route was small relative to demand.

### D12. Migration Observatory, "Albanian asylum seekers in the UK and EU: a look at recent data" (think tank; academic)
- **Source:** Migration Observatory, first published 4 Nov 2022, updated 22 Oct 2025. https://migrationobservatory.ox.ac.uk/resources/commentaries/albanian-asylum-seekers-in-the-uk-and-eu-a-look-at-recent-data/
  - Government counter-claim (existing fact file): FCDO, 22 May 2024, Albanian arrivals "fell by over 90% in 2023".
- **Measures:** Albanian arrivals, claims and grant rates; EU comparison.
- **Shape:** commentary with series.
- **What it shows (read):**
  - Q3 2022 about 9,000; October about 1,000; November 166; December 28. The deal was announced 13 Dec 2022.
  - "Available data suggest that such arrivals had already fallen sharply prior to the December 2022 announcement."
  - Albanian initial grant rate: almost half in 2021–22; 3% in 2024. Women 87% in 2022.
  - Of 31 EU+ countries, 28 granted no Albanian adults in 2022.
  - The government prioritised Albanian cases.
  - D2 adds: the Q4 2022 fall in Albanian arrivals (−87% against Q3) far exceeds the seasonal fall in all arrivals (−37%), so it is not seasonal.
- **Helps:** `tighten-within-the-echr`: returns, refusals and processing kept numbers low, within the ECHR.
- **Hurts:** `tighten-within-the-echr`'s claim that the deal *caused* the collapse. Also `bar-and-remove`: removal plus refusal worked without leaving the ECHR.

### D13. Eurostat first-time asylum applicants and population (claims per head)
- **Source:** Eurostat `migr_asyappctza` (updated 3 Sep 2026) and `demo_gind` (population on 1 January), fetched through the API. https://ec.europa.eu/eurostat/databrowser/view/migr_asyappctza/default/table
  - UK claims for 2020–25 are not in Eurostat; I used Home Office people claiming (fact file `asylum-claims-in-historical-and-european-context`, Asy_D01).
- **Measures:** first-time applicants from outside the EU.
- **Coverage:** 2008–2025, by country; the UK in Eurostat only to 2019.
- **Shape:** cross-country series.
- **Slices:** country, citizenship, age, sex.
- **What it shows (read; per-10,000 figures are my arithmetic):**

  | Country | 2015 | 2016 | 2019 | 2022 | 2024 | 2025 |
  |---|---|---|---|---|---|---|
  | UK (Home Office) | 6.2 | 6.0 | 6.9 | 14.1 | 15.2 | 14.5 |
  | EU27 | 27.5 | 26.3 | 14.1 | 19.6 | 20.3 | 14.9 |
  | Denmark | 36.8 | 10.6 | 4.5 | 7.6 | 3.7 | 3.1 |
  | Sweden | 160.2 | 22.7 | 20.3 | 12.6 | 6.4 | 4.8 |
  | Germany | 54.4 | 87.9 | 17.2 | 26.2 | 27.5 | 13.5 |
  | France | 10.6 | | 20.6 | | | 16.9 |
  | Ireland | | | | | | 23.8 |
  | Austria | | | | | | 13.5 |
  | Netherlands | | | | | | 13.3 |

  - **Danish applicants:** 20,825 (2015) → 6,055 (2016) → 1,835 (2025), the lowest since 2008. "40-year low" (D15) is not checked.
  - **Caveat:** Eurostat counts first-time applicants; the Home Office counts people claiming, both including dependants. Stage 5 should check that the two definitions match.
- **Helps:**
  - `tighten-within-the-echr`: Denmark's very low intake.
  - `refuge` (before 2020 only): the UK was well below the EU average.
- **Hurts:**
  - `refuge`: in 2025 the UK is at the EU average per head, not "fewer than many".
  - `tighten-within-the-echr`: Denmark's 2016 drop happened in Sweden and across the EU too.

### D14. Eurostat first-instance decisions: recognition rates
- **Source:** Eurostat `migr_asydcfsta`, fetched through the API, Oct 2026.
- **Measures:** positive first-instance decisions ÷ all first-instance decisions (refugee, subsidiary and humanitarian status).
- **Coverage:** 2008–2025 (EU27 from 2012).
- **Shape:** cross-country series.
- **What it shows (read; my arithmetic):**

  | Country | 2015 | 2016 | 2017 | 2023 | 2024 | 2025 |
  |---|---|---|---|---|---|---|
  | Denmark | 81% | 68% | 34% | 63% | 48% | 36% |
  | Sweden | 67% | 70% | 44% | 27% | 34% | 25% |
  | Germany | 57% | 69% | 50% | 62% | 53% | 32% |
  | EU27 | 53% | 62% | 46% | 53% | 51% | 39% |

  - Danish decisions in 2025: 1,170.
- **Helps:** `refuge`: Denmark still grants at about the EU rate, so its low intake is not achieved by refusing.
- **Hurts:** `tighten-within-the-echr` if it implies Denmark screens out more claims. It shows a smaller inflow, not stricter decisions.

### D15. Written ministerial statement HCWS1373, "Asylum changes"
- **Source:** Shabana Mahmood, Home Secretary, 2 Mar 2026. Read via the Parliament written-statements API; https://questions-statements.parliament.uk/written-statements/detail/2026-03-02/hcws1373 (403 to WebFetch).
- **Shape:** policy record.
- **What it shows (read):**
  - Adults and accompanied children claiming from 2 March 2026 get "a 30-month period of protection, if granted", with a review at 30 months.
  - Family reunion "remains paused".
  - A 20-year wait for settlement on "core protection", unless the refugee switches to a work or study route.
  - Unaccompanied children keep 5 years. Existing claims follow the old rules.
  - The statement is "inspired by Denmark's success": Denmark is cutting claims "to a 40-year low", while the UK rose 13% (YE Sep 2025) and the EU fell 22%.
- **Helps:** `tighten-within-the-echr` (the policy record).
- **Hurts:** none directly. Its Denmark claim is tested by D13, D14 and D16–D20.

### D16. Danish revocations of protection (Syrians) (secondary; academic)
- **Source:** leads only: ResearchGate paper "'You can never feel safe': Danish revocation practice…" (2025); Lighthouse Reports. Primary sources would be the Danish Immigration Service and the Refugee Appeals Board (not fetched).
- **What it shows (*unverified*):**
  - 2,155 Syrian cases considered for revocation from 2019 to May 2023.
  - 34% revoked at first instance, half of those overturned on appeal, so revocation in under 20% of cases.
  - Fewer revocations in 2023.
- **Helps:** `refuge` (review produces insecurity but few returns).
- **Hurts:** `tighten-within-the-echr`'s implied promise that review means return.

### D17. Kilström, Larsen and Olme, "Temporary refugee protection and labor-market outcomes", *Empirical Economics* (2023)
- **Source:** doi:10.1007/s00181-023-02403-z. Abstract read via the Crossref API; Springer blocks fetching.
- **Shape:** quasi-experiment: Denmark's 2002 reform lengthened the wait for permanent residency.
- **What it shows (read):** "we find no evidence of positive effects on labor-market outcomes".
- **Helps:** `refuge`.
- **Hurts:** `tighten-within-the-echr`'s case that temporary status speeds integration.

### D18. Jutvik and Robinson, "Permanent or temporary settlement?", *Comparative Migration Studies* (2020)
- **Source:** doi:10.1186/s40878-020-00203-3. Abstract read via Crossref.
- **Shape:** natural experiment, Sweden 2013. Syrians switched to permanent status.
- **What it shows (read):** temporary residents "have higher incomes and less unemployment" in the short term, but "are less likely to spend time in education".
- **Helps:** `tighten-within-the-echr`.
- **Hurts:** `refuge`'s claim that temporary status harms work, at least in the short run.

### D19. Matheny, "Conditional Permanent Residency and Refugee Integration: Evidence from Germany's 2016 Reform", *JIMI* (Sept 2026)
- **Source:** doi:10.1007/s12134-026-01431-9. Abstract read via Crossref.
- **Shape:** difference-in-differences, German Socio-Economic Panel (SOEP).
- **What it shows (read):**
  - The reform "did not accelerate take-up rates of either overall or full-time employment".
  - Permanent-residency acquisition fell.
- **Helps:** `refuge`.
- **Hurts:** `tighten-within-the-echr`.

### D20. Arendt, Dustmann and Ku, "Refugee Migration and the Labor Market: Lessons from 40 Years of Post-Arrival Policies in Denmark" (*Oxford Review of Economic Policy* 38(3), 2022)
- **Source:** IZA DP 15497; SSRN doi:10.2139/ssrn.4083586. Abstract read via Crossref (a review, with no headline figure in the abstract).
- **Lead (*unverified*, search snippet):** Arendt et al. (2025) find Denmark's 2007 tougher permanent-residency rule reduced employment of Syrian and Iraqi refugees.
- **Shape:** review of Danish evaluations.
- **Helps / hurts:** likely `refuge` on integration. It is the best single source for Denmark's employment record; stage 5 should read the full text.
- **Gap:** no Danish refugee employment *rate* series was found (Integrationsbarometer and Statistics Denmark were not reached).

### D21. Home Office Asy_D02: asylum initial decisions, 2001 Q1 to 2026 Q2
- **Source:** Home Office asylum claims datasets, YE June 2026. https://assets.publishing.service.gov.uk/media/6a85c2d7c9205b515d421eeb/asylum-claims-datasets-jun-2026.xlsx
- **Measures:** initial decisions by nationality, outcome, applicant type, age and sex. Excludes appeals.
- **Coverage:** 2001 Q1 – 2026 Q2. No 2000 data in this table.
- **Shape:** series.
- **Slices:** nationality, outcome group, main applicant or dependant, unaccompanied children.
- **What it shows (read; my arithmetic):**
  - **Main-applicant initial grant rate**, which matches the Home Office headline (42% in 2025):
    - 2001: 26%
    - 2003: 17%
    - 2004: 12%
    - 2010: 25%
    - 2014: 41%
    - 2019: 51%
    - 2021: 72%
    - 2022: 75%
    - 2023: 67%
    - 2024: 47%
    - 2025: 42%
    - 2026 H1: 34%
  - **By nationality, all applicants, 2022 → 2025:**
    - Syria 98% → 10%
    - Afghanistan 97% → 38%
    - Eritrea 98% → 87%
    - Sudan 82% → 94%
    - Iran 80% → 61%
    - Iraq 56% → 30%
    - Albania 62% → 6%
    - Vietnam 73% → 18%
    - Pakistan 60% → 32%
  - **Withdrawals:** 25,011 in 2023, 20,123 in 2024, 18,302 in 2025.
  - **The 2023–25 fall is:**
    - partly a change of nationality mix;
    - partly Syria after Assad (decisions paused, then refused);
    - partly lower Afghan grants;
    - partly the end of 2022–23 "streamlined" processing of high-grant nationalities (D12 says straightforward cases were prioritised; the streamlined questionnaire itself is *unverified*).
- **Helps:**
  - `refuge`: high grants for the main boat nationalities.
  - `bar-and-remove` and `tighten-within-the-echr`: the grant rate has returned to its 2010s level.
- **Hurts:** `refuge`'s claim that "mostly refugees" holds across nationalities and years. The 2021–23 peak was unusual.

### D22. Appeals: MoJ tribunal statistics (April–June 2026), plus Home Office outcome analysis (Asy_D04, not fetched)
- **Source:**
  - MoJ, Tribunal statistics quarterly, April–June 2026. https://www.gov.uk/government/statistics/tribunals-statistics-quarterly-april-to-june-2026/tribunal-statistics-quarterly-april-to-june-2026
  - Home Office Asy_D04 cohort outcomes (updated each May).
- **Measures:** First-tier Tribunal (Immigration and Asylum Chamber) receipts, disposals, caseload and the share of appeals allowed.
- **Shape:** quarterly series.
- **What it shows:**
  - **(read)** 39% of asylum and protection appeals determined were allowed.
  - **(read)** The open caseload across all appeal types was 156,000 (+48%). Mean time to clear an appeal was 65 weeks.
  - **(read, D3)** The asylum appeal caseload was 87,450 at end March 2026, against 6,319 at end June 2022.
  - ***(unverified)*** Migration Observatory: for 2012–16 claims, 55% were eventually granted (38% initially plus 17% on appeal). The Home Office says appeals add 10–15 points.
- **Helps:** `refuge` (about two in five appeals succeed); `bar-and-remove` (the backlog has moved into the courts).
- **Hurts:** `tighten-within-the-echr`'s "backlog cleared" framing, since appeal caseloads rose 13-fold.

### D23. Home Office Asy_D09: asylum seekers in receipt of support, by accommodation type
- **Source:** https://assets.publishing.service.gov.uk/media/6a85c2f1c9205b515d421eec/asylum-seekers-receipt-support-datasets-jun-2026.xlsx (YE June 2026).
- **Measures:** people on Section 95, 98 or 4 support, by accommodation type, nationality and region.
- **Coverage:** quarterly from 2014 Q1. Hotels are separately identified only from Dec 2022; before that they sit within "Section 98".
- **Shape:** series.
- **What it shows (read; my arithmetic):**
  - **Hotels:** 45,753 (Dec 2022); 56,018 at the peak (Sep 2023); 38,054 (Dec 2024); 30,657 (Dec 2025); 16,021 (Jun 2026).
  - **Total supported:** 123,758 at the peak (Sep 2023); 93,293 (Jun 2026).
  - **Dispersal accommodation:** 28,492 (Jun 2014); 58,965 (Jun 2022); 69,038 (Jun 2026).
  - **Military sites, June 2026 (read, D3):** 744 at Wethersfield and 418 at Crowborough.
- **Helps:** `tighten-within-the-echr` (hotel use down 71% from its peak).
- **Hurts:** `refuge`'s claim that costs are only a backlog problem, since dispersal numbers kept rising. `bar-and-remove`'s "out of control" claim fails on the hotel trend.

### D24. NAO, *An analysis of the asylum system* (HC 1517)
- **Source:** National Audit Office, 10 Dec 2025. https://www.nao.org.uk/wp-content/uploads/2025/12/an-analysis-of-the-asylum-system.pdf
- **Measures:** whole-system costs and constraints, plus international comparisons (Appendix Two).
- **Shape:** snapshot with two years of costs.
- **What it shows (read):**
  - Home Office asylum support was "around £4.0 billion in 2024-25 (£4.7 billion in 2023-24)", including about £2.7bn on accommodation and £883m in grants to local authorities.
  - Total Home Office and MoJ spending on asylum was about £4.9bn in 2024-25:
    - accommodation and support £3,406m
    - unaccompanied children £636m
    - casework £442m
    - appeals £102m
    - detention and removals £46m
  - Local authority costs are unknown.
  - Asylum seekers make up 0.16% of the population.
  - Permission to work comes after 12 months, on a shortage list. The Home Office "does not currently publish" how many get it. The EU allows work after 9 months at the latest.
  - The government expects at least £1bn a year in savings by 2028-29.
- **Helps:** `bar-and-remove` (billions a year); `refuge` (the cost is driven by delays).
- **Hurts:** `bar-and-remove`'s implied scale: about 1% of the Home Office's and MoJ's combined budgets is not stated by the NAO. Only £46m goes on detention and removals, which bears on the removals-force cost.

### D25. NAO, *The Home Office's asylum accommodation contracts* (May 2025), and the Home Affairs Committee (Oct 2025)
- **Source:**
  - NAO: https://www.nao.org.uk/wp-content/uploads/2025/05/home-offices-asylum-accommodation-contracts.pdf (read; quoted in the existing fact file).
  - Home Affairs Committee, *The Home Office's management of asylum accommodation*, Oct 2025: https://committees.parliament.uk/publications/49900/documents/297953/default (not fetched).
- **What it shows:**
  - **(read)** Contract cost estimate: £4.5bn over 10 years originally, now £15.3bn.
  - **(read)** Hotels were about 35% of people and 76% of cost (£1.3bn of £1.7bn, seven months of 2024-25).
  - **(read)** Supplier profit was £383m from Sep 2019 to Aug 2024 (7% margin); £4m deducted for underperformance.
  - ***(unverified, Commons Library relay)*** About £145 per person per night in hotels against £23.25 in dispersal accommodation (June 2025). Hotel spend £3bn in 2023-24 and £2.1bn in 2024-25.
- **Helps:** `refuge` (hotels, not people, drive cost); `tighten-within-the-echr` (closing hotels is where the money is).
- **Hurts:** `bar-and-remove`'s "cost of the people" framing.

### D26. Home Office Annual Report and Accounts 2025–26 (HC 440)
- **Source:** Home Office, 14 Jul 2026. https://assets.publishing.service.gov.uk/media/6a58e9953ae256c99b702f50/36.54_HO_ARA_25-26_WEB.pdf
- **What it shows (read):**
  - Resource DEL outturn for "Asylum Support, Resettlement and Accommodation" was £4.18bn (budget £4.33bn), of a total £17.92bn (23%, my arithmetic).
  - The total includes Afghan resettlement (£222.1m), so its boundary differs from the NAO's £4.0bn.
  - Spending peaked in 2023-24 "with year-on-year reductions in 2024-25 and 2025-26".
  - 107,003 people were on support at end December 2025, 29% of them in hotels.
- **Coverage:** prior years' accounts give a series back to at least 2019-20 (not extracted; stage 5).
- **Helps:** `bar-and-remove` (nearly a quarter of the Home Office's day-to-day budget).
- **Hurts:** `bar-and-remove`'s "rising cost" claim (it is falling).

### D27. Di Iasio and Wahba, "The Determinants of Refugees' Destinations: Where Do Refugees Locate within the EU?" (IZA DP 16085, April 2023)
- **Source:** https://docs.iza.org/dp16085.pdf (read). Working paper, not peer-reviewed.
- **Shape:** cross-country panel of first-time applicants to the EU, 2008–2020.
- **What it shows (read):**
  - "The strongest pull factor … is social networks".
  - "Employment bans are not a strong deterrence for asylum seekers given their modest association to asylum flows."
- **Helps:** `refuge`.
- **Hurts:** `refuge` slightly: the association is "modest", not zero. This gives `bar-and-remove` a foothold.

### D28. Fasani, Frattini and Minale, "Lift the Ban? Initial Employment Restrictions and Refugee Labour Market Outcomes" (CReAM DP 10/20; *JEEA* 2021)
- **Source:** https://www.cream-migration.org/publ_uploads/CDP_10_20.pdf (read).
- **Shape:** European refugees arriving 1985–2012, using variation in employment bans.
- **What it shows (read):**
  - A ban at arrival "reduces refugee employment probability in post-ban years by 15%", lasting up to 10 years.
  - Estimated €37.6bn output loss from the bans applied to the 2015 cohort.
  - It is about integration, not about drawing claims.
- **Helps:** `refuge`.
- **Hurts:** none directly. Note that it does not answer the pull question (F10).

### D29. Home Office and MAC statements on "pull factor" evidence (leads only)
- **Source:** Refugee Action, Asylum Welcome / Lift the Ban, Free Movement, Morning Star (all advocacy or press).
- **What they say (*unverified*):**
  - The MAC asked the Home Office in 2021 and 2022 to publish evidence of a pull factor.
  - MAC chair Brian Bell said the Home Office review looked only at fiscal impacts.
  - A 2020 Home Office research report reportedly did not support the pull-factor claim.
  - Stage 5 should find the Home Office review (2020–2023) and the MAC annual reports.
- **Helps:** `refuge` if confirmed.
- **Hurts:** `bar-and-remove`.

### D30. Rwanda scheme: NAO investigation (2024) and the Home Secretary's statements
- **Source:**
  - NAO, *Investigation into the costs of the UK-Rwanda Partnership*, 1 Mar 2024. https://www.nao.org.uk/press-releases/the-costs-of-the-uk-rwanda-partnership/ (read).
  - Yvette Cooper, Commons, 22 Jul 2024 (about £700m) and 2 Dec 2024 (£715m). Read via EIN (https://www.ein.org.uk/news/home-secretary-vows-fix-collapse-controls-migration-and-borders-call-ps715-million-rwanda-plan) and the Shropshire Star / PA (secondary).
- **Shape:** record.
- **What it shows:**
  - **(read, NAO)** £370m to Rwanda's Economic Transformation and Integration Fund, of which £220m paid by Feb 2024.
  - **(read, NAO)** £120m more after 300 relocations; £20,000 per person; up to £150,874 per person in processing costs; flights about £11,000 per person.
  - **(read, EIN)** £715m in total, including £290m paid to Rwanda; 4 volunteers relocated.
  - The 2025-26 accounts record no further Rwanda risk (read, D26).
- **Helps:** `refuge` (cost with almost no removals).
- **Hurts:** `bar-and-remove`: its flagship offshore route never ran at scale. Its defenders will argue courts blocked it (see the ECHR research file).

### D31. Immigration and Asylum Bill 2026: asylum provisions (secondary leads)
- **Source:** NACCOM (https://naccom.org.uk/immigration-and-asylum-bill-2026/), EIN, HJT Training. The Bill text and explanatory notes on bills.parliament.uk were not fetched.
- **What it shows (*unverified*):**
  - Puts core protection and the 20-year settlement route into statute.
  - Allows recovery of up to £10,000 of asylum support from people later granted status.
  - The outline's dates (introduced 30 Jun 2026; second reading 13 Jul, 264–90) were not checked here.
- **Helps:** `tighten-within-the-echr` (the record).
- **Hurts:** `refuge`: charging people who were barred from working.

### D32. Piddington (Oxfordshire) large asylum site (press)
- **Source:** ITV Meridian, 19 Sep 2026 (https://www.itv.com/news/meridian/2026-09-19/asylum-site-plans-in-oxfordshire-village-pose-avoidable-risks-council-says); LBC; Euronews, 16 Sep 2026.
- **What it shows (*unverified*):**
  - Up to about 1,250 single men on MoD land in a village of about 314–350 people.
  - Cherwell District Council objected on wastewater, flooding, asbestos and unexploded ordnance.
  - A petition passed 19,000 signatures.
  - No cost figure found.
- **Helps:** `tighten-within-the-echr` (moving away from hotels).
- **Hurts:** `tighten-within-the-echr` (local consent; untested cost). Context only.

### D33. Waiting-time and employment-ban studies (Marbach, Hainmueller and Hangartner 2018; Hainmueller et al. 2016)
- **Source:** *Science Advances* 2018 (Germany); *Science Advances* 2016 (Switzerland). Search snippets only.
- **What it shows (*unverified*):**
  - Germany: an extra seven months' wait for work access meant a 20-point lower employment rate five years on, fading by year 10.
  - Switzerland: each extra year awaiting a decision cut later employment by 4–5 points.
- **Helps:** `refuge` (on cost and integration, not pull).
- **Hurts:** none.

## 3d. Problems for the human

### Claims the evidence undercuts

1. **`refuge`'s "the UK receives fewer claims per head than many European countries."** This was true before 2020, at about 6 per 10,000 against an EU average of 14–27. In 2025 the UK is at 14.5, level with the EU27's 14.9, and ranks 16th of the EU+. Suggested rewording: "about the European average per head, and below Germany, Ireland, Greece and Spain".
2. **`tighten-within-the-echr`'s "crossings fell with French interceptions."**
   - French preventions fell 47% in 2026, about as much as arrivals. The prevention rate stayed near a third (D1).
   - Channel attempts as a whole fell 43%, in line with EU-wide falls: central Mediterranean −56% (D5).
   - Weather is not the reason (D7), but the evidence fits fewer launches (fewer boats, more people per boat), which fits supply disruption *or* lower demand.
   - No source separates them. Present the 2026 fall as **complicated**, not as a policy success.
3. **"The Albania deal caused the collapse."** The outline already flags this. Confirmed: the collapse began two months before the deal (D12, D2).
4. **"Denmark's temporary protection cut claims."** Denmark's intake is very low (D13). But its 2016 fall matched Sweden's, and its grant rate is near the EU's (D14). The integration evidence from Denmark, Germany and Sweden mostly finds that less-secure status does not help employment (D17, D19), with one short-run exception (D18). The government statement (D15) cites a "40-year low" that I could not check beyond 2008.
5. **"The backlog is cleared."** The initial-decision backlog is down 77%, but the asylum appeal caseload rose from 6,319 (2022) to 87,450 (March 2026), and appeals take 65 weeks (D22). The cost has moved rather than vanished.
6. **"Most small-boat arrivals are found to be refugees."** At initial decision this is true over 2018–25 (59%), and for the main 2025 nationalities. But it excludes 24,000 withdrawals. Arrivals in 2023 and 2024 were granted at under 50% initially.

### Viewpoints with thin evidence

- **`bar-and-remove`:** this area holds little *for* it beyond cost (D24, D26) and the end of the France deal (D9). Its Australia, removals and ECHR evidence lie in other files. The most useful evidence for it here:
  - refusal rates for Iraqi, Turkish, Vietnamese and Albanian arrivals (D2);
  - the "modest" association between work rights and claims (D27);
  - the falling grant rate (D21).
- **`refuge` on the right to work:** no direct test of UK pull exists. D27 is a working paper.

### Missing data

- **UK refugees' employment by status** (before and after 2022; 30-month protection since March 2026): none found.
- **Danish refugee employment-rate series:** not reached.
- **Danish revocation statistics:** secondary only (D16).
- **Final grant rate after appeal by cohort since 2004** (Home Office Asy_D04, published each May): not fetched; only the latest quarter's 39% allowed is read.
- **Annual asylum-support spending before 2023-24:** needs the earlier Home Office accounts (D26).
- **Piddington cost, and the Bill's text:** secondary only.
- **French at-sea interception counts:** none published.

### Source cautions

- **French preventions** (D1, D8) are French operational estimates, not official statistics.
- **NCA seizure and officer figures** come from ministerial and agency press releases (D8).
- **The quarterly Home Office "people per boat" text** mentions "September and November 2026" in a June-2026 release (D3); probably 2025.
- **The UK–France cost** (£56,000 per return) rests on a press report of a ministerial remark (D9).

### Blocked sources

- **Commons Library briefing CDP-2025-0184:** 403.
- **Parallel Parliament:** Cloudflare. Worked around through the Parliament API.
- **questions-statements.parliament.uk web pages:** 403. Worked around through the API.
- **Springer article pages** (D17, D19): client challenge. Abstracts read through Crossref.
- **Express & Star:** 403.
- **Eurostat API:** curl failed on its TLS certificate; fetched through Python urllib instead.
- **NAO PDFs:** downloaded with certificate checking disabled. A later attempt to do the same for another site was refused, so stage 5 should re-download them normally.
