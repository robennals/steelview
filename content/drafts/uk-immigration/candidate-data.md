# UK immigration: how many, and on what terms — candidate data

Stage 3 output ([WORKFLOW](../../WORKFLOW.md#3-find-candidate-data)),
researched 2026-10-24 by four parallel agents against
[outline.md](outline.md) draft 3, and merged here. The agents' working
files are in [research/](research/). The report plan (3c) was added in
stage 4 (below).

- **Candidate numbers** are grouped by research area: D1–D30 levels,
  population and settlement; D50–D79 economics; D100–D133 routes and
  rights; D150–D185 culture and cohesion. Gaps are unused. Six duplicates
  found across areas are merged, and their numbers point to the survivor:
  D15 and D117 → D60; D58 → D18; D4 → D69; D76 → D103; D166 → D14.
- **Question numbers** are by area: L (levels and settlement), E
  (economics), R (routes and rights), C (culture and cohesion).
- **How figures are marked:**
  - **(read)**: seen on a page that was actually fetched, at the URL given;
    **(read, PDF)** from a downloaded PDF's text; **(read, data)** or
    **(read, own calc)** computed by the agent from a downloaded official
    file, which stage 5 must re-run.
  - **(read, secondary)**: read on a fetched secondary page, with the
    primary not reached.
  - ***unverified***: search snippets, secondary summaries or memory.
- **"Read" is not a quote.** Fetched pages were summarised by a model, so
  stage 5 quotes every figure from the source.
- **Certificate checks.** The asylum research downloaded some files with
  TLS certificate checking turned off; none of the files in this topic's
  candidates is known to have been, but stage 5 re-downloads every file it
  quotes regardless.

---

## 3a. Question index

| # | Question | Viewpoints | Answers it | Context | Likely status, and how to narrow it | Report |
|---|---|---|---|---|---|---|
| L1 | How have immigration, emigration and net migration changed, and how much of population growth is due to migration? | `economic-cost`, `open-and-build`, `end-settlement` | D1, D2, D3 | *run:* D1 (annual 1964–2011, then quarterly to YE Dec 2025). *denom:* D3 (mid-2025 population). *record:* D2 (Nov 2025 and May 2026 method revisions; British emigration). *cf:* D4 (zero/low-migration projections). *comp:* D5 (OECD/UN per-head — weak; see 3d). *mechanism:* D6, D7 (routes 2021–24). | Well-supported: peak 944,000 (YE Mar 2023) → 171,000 (YE Dec 2025); migration ≈ 98% of growth to mid-2025. Narrow "4.5 million arrived" to gross immigration (D1) and say net was about 2.5m over 2021–24. | I1 |
| L2 | How many people become eligible for ILR each year to 2030, by route? | `economic-cost`, `contribute-and-earn`, `keep-our-word` | D6, D8 | *run:* D9 (settlement grants since 2004; YE Jun 2026 199,628). *cf:* D8 (2019/2020 cohort settlement rates by route). | Well-supported as a Home Office forecast: central 1.6m (range 1.3–2.2m) in 2026–30, peak ~450,000 in 2028. A forecast, so state the range. | I5 |
| L3 | What did each party promise about migration levels since 2010, and what happened? | `economic-cost`, `open-and-build` | D10, D1 | *record:* D10 (manifesto pledges, mostly unverified). *run:* D11 (polling on preferred levels). | Well-supported that the "tens of thousands" pledge (2010, 2015, 2017) was never met: in D1 net migration was above 100,000 in every period from 1998 to 2019, and fell below it only in the Covid periods YE Sep 2020 (35,000) and YE Dec 2020 (93,000). Manifesto wording needs fetching. | I1 |
| L4 | How many people hold ILR, from which routes and years, and how many would Reform's plan affect? | `end-settlement`, `keep-our-word` | D12, D9 | *denom:* D12 (non-EU ILR 621k–820k end-2024; EUSS settled ~4.6m grants). *run:* D9. *record:* D13 (Reform plan: EUSS exempt). | **No official stock exists** (ONS/Home Office publish grants, not holders). Best is the Migration Observatory range. The plan's reach: existing non-EU ILR holders (621k–820k, minus naturalised) plus ~1.6m forecast to qualify 2026–30. | I5 |
| L5 | What are ILR holders' employment, earnings, benefit receipt and social-housing tenancy, by route and years since arrival? | `end-settlement`, `keep-our-word`, `economic-cost`, `contribute-and-earn` | D14, D15, D16, D17 | *comp:* D14 (UC shares by status), D16 (new social lets by nationality). *record:* D18 (£234bn and its withdrawal). | **Gap:** nothing is published for ILR holders specifically by route. Only proxies: UC caseload by status (ILR 2.7% of 8.0m, July 2025); earnings of visa holders before settlement (D15); new social lets by nationality (D16). Say so. | I5 |
| L6 | How do the Gulf states, Singapore, Switzerland and others handle permanent residence, and temporary workers' rights? | `end-settlement`, `keep-our-word` | D19 | *comp:* D19 (Canada, Australia, Germany, Switzerland, Japan, Singapore, Gulf); D29 (HAC: UK would be an outlier). | Partly supported: rules are records, mostly *unverified* except Singapore's work-permit conditions (read) and HAC's "usually five years" (read). | I5 |
| L7 | Could existing ILR be revoked lawfully, and what would courts make of Article 8 claims? Have the Rules been changed mid-route before? | `end-settlement`, `keep-our-word`, `contribute-and-earn` | D21, D22 | *record:* D21 (s.76 NIAA 2002 revocation grounds; HSMP Forum 2008; 2006 and 2012 precedents). D23 (Windrush). | Complicated: current statute allows revocation only on narrow grounds; Parliament could legislate, and courts would then weigh Article 8 case by case. No court has ruled on mass revocation, so the claim "would be blocked in court" is a prediction. | I5 |
| L8 | What net emigration would the plan need, and has any rich democracy achieved net negative migration by policy? When was UK net migration negative? | `end-settlement`, `economic-cost` | D1, D24 | *run:* D1 (UK negative 1964–78, 1980–82, 1988, 1992–93; low −87,000 in 1969). *comp:* D24 (Gulf expulsions; Ireland/Spain recessions — not by policy). | Searched, none found for a rich democracy by policy. The UK's negative years were driven by British emigration, not by expelling residents (stage 5 to confirm with ONS 2015 history article). | I1 |
| L9 | What share of the public supports revoking existing ILR, as against ending it for new arrivals? | `end-settlement`, `keep-our-word`, `contribute-and-earn` | D25 | *record:* D11 (preferred levels). | Well-supported, one poll: YouGov Sept 2025 — ending new ILR 44% support / 43% oppose; removing existing ILR 29% / 58%. Only one pollster found. | I5 |
| L10 | Reform's £234bn — where does it come from? | `end-settlement`, `economic-cost` | D18 | — (fiscal method left to the economics agent). | Traced (read): CPS *Here to Stay?* (Karl Williams, 2025) central estimate; CPS now says the overall cost estimates "should no longer be used". | I3 |
| L11 | What did each route's rules and guidance say about settlement, and have the Rules changed mid-route before, with what transitional protection? | `keep-our-word`, `end-settlement`, `contribute-and-earn` | D26, D21 | *record:* D26 (gov.uk route pages; BN(O) policy statement 2020); D21 (HSMP 2006/2008; 2006 4→5 years; 2012 family 2→5 years with protection). | Well-supported that guidance said "after 5 years, you may be able to apply" — conditional language, not a promise; BN(O) statement is the most explicit ("historic and moral commitment"). | I5 |
| L12 | How many people would retroactive earned-settlement changes affect, and what are their employment and earnings? | `keep-our-word`, `contribute-and-earn`, `economic-cost` | D27, D6, D15 | *denom:* D27 (2.2m on a 5-year path, end-2024, 53% of temporary visa holders); D12. *record:* D18. | Well-supported: 2.2m on a path; 1.6m forecast to settle 2026–30. Employment by route from D27/D15 (e.g. about half of adult Skilled Worker dependants not working). | I5 |
| L13 | What happened in past cases of insecure status, including Windrush? | `keep-our-word`, `end-settlement` | D23 | *record:* Lessons Learned Review (2020); compensation data to June 2026. | Well-supported as a record: £130.9m paid on 4,131 claims; 6,606 of 11,428 final decisions were zero-entitlement (read, data). | I5 |
| L14 | Do settlement rules change who comes or leaves? | `keep-our-word`, `contribute-and-earn`, `end-settlement` | D28 | *comp:* D28 (Denmark 2002 and 2007 reforms; Germany naturalisation waits; Sweden 2016). | Complicated: evidence is on refugees and family migrants' *behaviour once here*, not on workers' choice of destination. No study found on whether longer waits deter skilled workers or prompt departure. | I5 |
| L15 | What share of each route's migrants would meet the earned-settlement conditions? | `contribute-and-earn`, `keep-our-word` | D27, D15, D29 | *record:* D29 (HAC report). | Partly supported: "hundreds of thousands" would fail the £12,570 test on current circumstances (MO; HAC). Shares are implied from non-employment rates, not published per condition. | I5 |
| L16 | What is the current status of the earned-settlement proposal? | `contribute-and-earn`, `keep-our-word` | D30, D29, D6 | *record:* CP 1448 (Nov 2025), consultation closed 12 Feb 2026; HAC report 13 Mar 2026; no response or Statement of Changes as of 22 Oct 2026. | Well-supported as a dated record. The outline's "1 March 2026" date is not confirmed (one secondary source says 5 March); CP 1448 itself (Nov 2025) already said it would apply to people here without ILR. | I5 |
| E1 | Did GDP per head grow less in the high-migration years, and how much of that is due to migration? | `economic-cost`, `open-and-build`, `contribute-and-earn` | D50, D52 | *run:* D50 (annual since 1996, quarterly to Q2 2026). *comp:* D51 (G7, 2007–24). *cf:* D52 (OBR scenarios: ±200k net migration → GDP per person "largely unchanged", −0.4% if capital does not adjust); pandemic, energy shock and Brexit not separated by any source found. *mech:* D74 (employment rates), D61 (recent arrivals' pay), D60 (pay by route); capital per worker only in D52's assumption. | **Well-supported** that GDP per head barely grew: 0.17% a year 2019–25 against 1.26% in 2010–19 (D50). **Not supported** that migration caused it: no source attributes the stagnation to migration, and the OBR says the per-person effect is small and of uncertain sign. Canada (also high migration) and Germany (energy shock) were also flat in 2019–24 (D51). Narrow to "grew little" plus the OBR's uncertainty. | I3 |
| E2 | What is the lifetime net fiscal contribution of migrants by wage, age at arrival, family size and route? | `economic-cost`, `end-settlement`, `contribute-and-earn`, `open-and-build`, `keep-our-word` | D55, D54, D56, D57 | *comp:* D55 (UK resident of the same age: +£117k mean / −£47k median). *denom:* D55 (all UK residents: mean −£39k, median −£145k). *record:* D54 (OBR FRS 2024), D56 (MAC 2018), D57 (Oxford Economics 2018, Dustmann–Frattini, Rowthorn, Migration Watch), D58 (CPS £234bn, withdrawn), D59 (Reform £622bn). *mech:* D55, D54 (what drives cost: no childhood education costs for adult arrivals; pensions, health and care in old age; dependants' low employment; children). | **Well-supported** for the 2022/23 Skilled Worker cohort: +£47bn in total; care workers −£36k each; Health and Care dependants −£67k each (D55). **Well-supported** that the result depends on earnings and age at arrival (D54, D55). Reform's figures fail the test: the CPS withdrew the £234bn itself, and the £622bn is undiscounted (D58, D59). There is no high-quality estimate for all routes under the post-Brexit system (D57). | I3 |
| E3 | What do migrants earn, and what is their fiscal contribution, by route, over time since arrival? | `contribute-and-earn`, `economic-cost`, `keep-our-word` | D60, D61, D55 | *comp:* D61 (relative to all UK employees), D55 (age-matched UK residents). *run:* D61 (HMRC RTI cohorts 2015–2025). *mech:* D55 (salary thresholds: the top 10% of Skilled Worker earners give 39% of the fiscal gain). | **Well-supported** as a 2023/24 snapshot by route (D60). Time since arrival is covered only at the level of EU/non-EU cohorts (D61), not by route. Earnings by route over time is **missing**. MAC's dependants' employment path is an assumption, apart from one 2019/20 family cohort (44% employed → 60% after four years). | I3 |
| E4 | What share of household growth comes from migration, and how much has it added to rents and house prices? Housebuilding against household growth; rents as migration fell in 2024–26. | `economic-cost`, `open-and-build`, `blame-underinvestment` | D62, D63, D64, D65, D66, D56 | *run:* D64 (net additional dwellings, England, 1991–92 to 2024–25), D63 (rents 2015–Sep 2026). *comp:* D63 (regions), D62 (local vs regional effects). *cf:* D63 (rent inflation fell from 9.1% to about 3.5% while net migration fell; interest rates not separated). *mech:* D66 (about a third of private renters were born abroad in 2021). | **Complicated.** Best evidence: immigration explains about 4–6% of the real house-price rise over three decades, as an illustrative estimate (D62). No UK study of rents exists (D62). Rents have **not fallen**, but their growth has more than halved (D63). The share of household growth due to migration has **no official estimate found** for the 2022-based projections (see 3d). | I4 |
| E5 | How has demand on GPs, hospitals and schools changed with population, against staffing? | `economic-cost`, `blame-underinvestment`, `open-and-build` | D67, D68, D56, D52 | *denom:* D67 (GPs per patient by ICB only). *record:* D75, D74 (migrants' share of NHS and care staff). | **Partial.** Pupil numbers in England are **falling** (−112,200 in 2026), which undercuts a national school-pressure claim (D68). GP numbers are up 2,382 since December 2019 (D67), but patients per GP over time was not obtained. Hospital demand per head was not researched (see 3d). OBR: the government did not raise departmental spending for the higher population, so real spending per person fell (D52); this supports `blame-underinvestment` and `economic-cost` alike. | I4 |
| E6 | How will the working-age share and the old-age dependency ratio change under high, central and low migration? | `open-and-build`, `economic-cost` | D69, D54 | *comp:* other ageing countries **not obtained** (see 3d). *cf:* D54/ONS letter (pension age 68 in the early 2030s, 69 later in the 2030s and 70 in the 2040s would hold the ratio at 278). | **Well-supported**, and it cuts both ways. In ONS 2024-based projections, people 65+ per 1,000 aged 16–64 rise from 302 (2024) to 525 by 2074 in the principal projection, 457 with high migration, 580 with low and 641 with zero net migration (D69). Migration slows ageing but does not stop it. | I1 |
| E7 | What have the OBR's forecasts said lower migration does to growth, borrowing and debt? | `open-and-build`, `economic-cost`, `contribute-and-earn` | D52, D53, D54 | *record:* D52 (March 2024 EFO scenarios), D53 (March 2025, November 2025, March 2026), D54 (long run). *comp:* D70 (Resolution Foundation, Oxford Economics, IFS), D57. Total GDP versus GDP per head: D52. | **Well-supported** that in OBR scenarios lower migration raises borrowing over five years: 200k lower net migration → £19.9bn higher borrowing in 2028–29, or £13.1bn if spending per person is held (D52). Revisions: March 2026 lowered net migration to an average of 235k (from 295k) and potential output by 0.25% in 2030 (D53, secondary). Narrow to "in the OBR's 5-year scenarios"; the long-run effect is smaller and later reverses (D54). | I3 |
| E8 | How much do international students pay, and how dependent are universities on them? | `open-and-build`, `contribute-and-earn` | D72, D71, D73 | *run:* D72 (fees as a share of income: 5% in 2000/01, 14% in 2017/18, 23% in 2022/23; *unverified*). *record:* D71 (35.8% of English providers in deficit in 2024–25; 42.7% forecast for 2025–26). | Likely **well-supported** once HESA is read (it is blocked). Students' spending: D73 (HEPI/London Economics, net £40.4bn per intake; *unverified*). | I3 |
| E9 | How many NHS and care staff are migrants, by nationality, over time? | `open-and-build`, `contribute-and-earn`, `economic-cost` | D75, D76, D74 | *run:* D75 (NHS England HCHS staff since 2009). | **Well-supported** in direction. Figures are *unverified* pending NHS Digital (blocked): about 20% of NHS hospital and community staff were non-UK nationals in 2023, from 11.9% in 2009. British-national filled posts in adult social care fell 130,000 since 2020/21 (D76, secondary). | I2 |
| E10 | What are immigration's wage effects on UK-born workers, by wage level? | `open-and-build`, `contribute-and-earn`, `economic-cost`, `blame-underinvestment` | D56, D77 | *record:* D56/D77 (range across studies). *mech:* D77 (competition in low-skill jobs; downgrading of skilled migrants; earlier migrants bear most of the effect). | **Well-supported**: average effects are small; small negative effects at the bottom, positive further up (D56). There are **no post-Brexit studies** (D77). | I3 |
| E11 | Do immigrants found businesses or file patents at higher rates? | `open-and-build`, `contribute-and-earn` | D78, D79 | *denom:* D78 (42% of founders vs about 16% foreign-born). *comp:* D79 (US: immigrants were 16% of inventors and 23% of patents; *unverified*). Rates by route: **none found**. | **Complicated.** Founders: one think-tank's count of the top 100 companies, with nationality used as a proxy for birthplace (D78). No UK foreign-born patent share was found (D79). Narrow to "high-growth start-ups" and name the source. | I3 |
| R1 | What happened in the care sector before and after the care-worker route opened (Feb 2022) and closed to new overseas recruits (22 Jul 2025): visas, dependants, vacancies, pay, sponsor licences revoked? | `contribute-and-earn`, `blame-underinvestment`, `open-and-build`, `economic-cost` | D100, D101, D103, D104, D106, D107 | Run: D103 (vacancies 2016/17–2025/26, pay 2016/17–2025/26); counterfactual: vacancy rate before 2022 was 6.5–7.1% (D103); record: D104, D105, D108, D109; fiscal: D117 | "The route brought far more than planned, with many dependants" passes (D100, D104, D118). Note that the inflow had already fallen ~95% by 2024 after the March 2024 dependant ban, before the July 2025 closure (D101). "Widespread abuse" passes as a record (MAC, ICIBI, revocations), but no source measures prevalence. | I2 |
| R2 | Did overseas recruitment substitute for domestic training in nursing, medicine and care? | `contribute-and-earn`, `open-and-build`, `blame-underinvestment` | D103, D110, D111, D112, D113, D114 | Run: NMC joiners by training origin (D110), UCAS acceptances (D111), medical school places (D113); comparators: OECD foreign-trained shares (D114, blocked); record: MAC 2018 found no negative effect on training (published fact `overseas-recruitment-and-domestic-training`) | Probably **fails** as a general claim. In nursing, UK-educated joiners rose during the international peak (+11.9% in 2023-24, D110). Medical places were capped by government (D113), not by employers. Care is the strongest case: British-filled posts fell 130,000 while overseas recruits rose (D103). That fits substitution, but it fits British workers leaving low pay equally well. Narrow it to "in adult social care, British-held posts fell while overseas recruitment rose". | I2 |
| R3 | How many asylum claims are made by people who arrived on visas, by route? | `contribute-and-earn`, `economic-cost`, `open-and-build` | D115 | Denominator: visas issued (D100); run 2018–2026 Q2 (D115) | Passes: 34,999 (41%) in YE June 2026, Graduate route claims more than doubled. Denominators give small rates (~1% of Health and Care visas, ~2–3% of study visas, rough cross-year ratios). "Tens of thousands" passes. | I2 |
| R4 | What jobs and earnings do Graduate-route holders have, years after study? | `contribute-and-earn`, `open-and-build`, `economic-cost` | D116 | Comparators: domestic graduates (D116); denominator: all international students (D100; migrant journey, see 3d) | Only first-year outcomes exist. **Years after** is not measured: LEO does not cover international graduates usefully (searched, none found). Narrow it to "in their first year". | I2 |
| R5 | How many people use the high-skilled routes (Global Talent, High Potential, Innovator Founder), as a share of work visas over time? | `contribute-and-earn`, `open-and-build` | D100 | Denominator: all work visas (D100); run 2014–2026 H1 | Passes as a series: ~2% of work visas through 2023, 3.6% in 2025, mainly because the denominator fell. Innovator Founder has collapsed. | I2 |
| R6 | What thresholds did the May 2025 white paper set, and what did they do to grants? | `contribute-and-earn`, `economic-cost`, `open-and-build` | D118, D100, D101 | Counterfactual: the government's own estimate (D118) vs outturn (D100) | Thresholds pass as record. Effect: the closure of the care route was estimated at only −7,000 a year because inflows had already collapsed. Skilled Worker main applicants fell 30% in the latest year. Separating the effect of the white paper from earlier rules needs quarterly data. | I2 |
| R7 | How have public investment and spending on NHS, schools and social housing changed since 2010, against population? | `blame-underinvestment`, `economic-cost`, `open-and-build` | D124, D125, D126, D127, D133 | Comparators: OECD government investment (D126), EU14 health capital (D127); denominator: per pupil (D125), per head (D133) | Mixed. Capital and social housing support it (UK in the bottom quarter of the OECD for government investment through 2017; social rent completions far below 2010). Current spending cuts against it: NHS spending per head rose in real terms throughout, and school spending per pupil is back to its 2010 level. Narrow it to capital and social housing. | I4 |
| R8 | How many people have "no recourse to public funds", how many are children, and what happens to them? | `blame-underinvestment`, `end-settlement`, `economic-cost` | D122, D123 | Denominator: all migrants with leave (not published); record: council spending (D122) | **No official count.** The Home Office says it holds no data on children. The only estimate is from 2020 (1.1m people, 140,000 children). Council support is measurable (~£82m a year across 85 councils, 2024). Likely status: unknown; DWP plans Family Resources Survey questions in 2026/27. | I5 |
| R9 | What do visa fees and the health surcharge charge, against processing cost and health use, over time and against other countries? | `blame-underinvestment`, `keep-our-word`, `economic-cost` | D119, D120, D121 | Run: fee tables since 2014 (D119 archive); comparators: Royal Society (D121) | Passes for fees: ILR is £3,226 against a unit cost of £310; Skilled Worker (over 3 years) is £1,618 against £153 (D119). The surcharge is set to estimated average use (~£1,036), so "many times the cost" **fails for the surcharge**. Comparator: the UK is the most expensive for skilled visas (D121, unverified). | I5 |
| R10 | How common is exploitation of sponsored workers, and how many sponsors lost their licences (as a share of sponsors or sponsored workers)? | `blame-underinvestment`, `contribute-and-earn` | D107, D106, D108, D109, D104, D105 | Denominator: registered sponsors (D107); workers (D106) | Revocations pass as record: 4,403 Skilled Worker licences revoked in the four quarters to June 2026, about 3.5% of 126,104 sponsors, against about 1% a year in 2014–19. There is no sector split in the official series. **Prevalence of exploitation is not measured**; there are only helpline and NRM leads. | I2 |
| R11 | Does anti-immigrant rhetoric precede hate crime or unrest (2016 referendum, 2024 riots, Epping 2025)? | `blame-underinvestment`, `economic-cost`, `cultural-cost` | D128, D129, D130, D131, D132 | Record: monthly police data (D128); counterfactual: events vs rhetoric (D131) | Likely **fails as a causal claim about politicians' rhetoric**. Spikes follow events: the referendum result, the Southport murders, terror attacks (D128, D129, D131). UK studies identify an effect of revealed norms and of events, not of specific rhetoric. German evidence links online rhetoric to attacks (D132). Searched for an Epping study: none found. | I7 |
| C1 | What did the national and local inquiries find about group-based child sexual exploitation — victims, offenders' ethnicity, why officials did not act? | `cultural-cost`; against: `open-and-build`, `blame-underinvestment` | D150 (Casey), D151 (Jay), D152 (Telford), D153 (Rochdale/Oldham), D154 (national police data), D155 (inquiry and Beaconport status) | D156 (all CSA: prevalence, perpetrator relationship), D157 (population shares), D158 (sexual-offence convictions by ethnicity), D159 (Quilliam and its critics) | **Well-supported, if narrowed to named places:** Rotherham (~1,400 victims, mostly Pakistani-heritage perpetrators), Telford (>1,000 est., majority southern-Asian heritage), Greater Manchester (52–54% of group-CSE suspects Asian vs 20.9% of population), West Yorkshire (35% Asian vs 16%), Stovewood (~2/3 Pakistani vs 4% of Rotherham). Fear of being called racist is a finding of Jay, Telford and Casey. **Not supportable nationally:** ethnicity is unrecorded for ~2/3 of suspects (Casey), so neither "mostly Pakistani" nor "mostly white" can be stated for England and Wales. | I7 |
| C2 | Employment, earnings, benefit receipt and fiscal contribution by country or region of origin (UK, Denmark, Netherlands, Norway) | `cultural-cost`, `contribute-and-earn`, `economic-cost`; against: `open-and-build` | D160 (Denmark), D161 (Netherlands), D162 (Norway), D163 (UK employment by ethnicity), D164 (Census by religion) | D165 (second generation), D166 (UK benefits by nationality) | **Well-supported for Denmark and the Netherlands** as stated, with caveats: Denmark's is an annual cross-section, not lifetime; the Dutch study is by independent academics, **not CPB** (outline error). UK publishes no fiscal-by-origin figures; employment gaps by ethnicity are large but narrowing (Pakistani/Bangladeshi 44%→61%, 2004–2022). | I6 |
| C3 | Liberal attitudes by religion, origin and generation | `cultural-cost`; against: `open-and-build` | D167 (ICM/Channel 4), D168 (HJS/J.L. Partners 2024), D169 (Kashyap & Lewis 2009 survey) | D170 (religiosity explains much; second-generation gender attitudes) | **Contested.** Large gaps on homosexuality and gender roles are measured in two polls (2015, 2024); the one academic generational study finds liberalising on gay marriage but not on the morality of homosexuality. Narrow to "British Muslims are markedly more conservative than the public on homosexuality; evidence on generational change is mixed." No ESS/BSA series by religion found. | I6 |
| C4 | Offending by nationality and, where recorded, ethnicity | `cultural-cost`; against: `open-and-build` | D171 (Migration Observatory, UK nationality), D172 (Denmark by origin) | D158 (UK ethnicity), D173 (MoJ nationality-data dispute) | **UK:** non-citizens' share of convictions (13.1%) and prisoners (12.1%) is about their population share, lower after age adjustment — this cuts against the outline's "in some places offending". **Denmark:** non-Western descendants' age-adjusted index is 262 (men), higher than immigrants' (158). Narrow by country and generation. | I7 |
| C5 | Islamist share of terrorism arrests, prisoners, MI5 caseload; born abroad | `cultural-cost`; against: `blame-underinvestment` | D174 (Home Office TACT statistics), D175 (Prevent), D176 (MI5) | Population: D157 (Muslim share via religion census, fact file) | **Well-supported** that Islamist extremists are the largest group of terrorist prisoners (57%, June 2026) and ~75% of MI5 caseload (*unverified*). Against "home-grown": 73% of arrestees since 2001 self-define as British. Prevent referrals now run 2:1 extreme right-wing over Islamist. 2025–26 arrest totals are distorted by Palestine Action (94%). | I7 |
| C6 | How fast has the foreign-born share changed, nationally and in the fastest-changing local authorities? | `cultural-cost`; `open-and-build` | D177 (Census 1951–2021; LA change, my computation) | D178 (OECD/Eurostat comparators) | **Well-supported:** 4.3% (1951) → 8.9% (2001) → 13.4% (2011) → 16.8% (2021), E&W. Largest LA rises 2011–21 are ~8–10 points (Barking and Dagenham, Watford, Havering, Thurrock, Boston). "Changed more in a decade than the previous century" fits places such as Boston; it needs place-by-place checks against 2001. | I6 |
| C7 | English proficiency by years since arrival, origin, generation | `cultural-cost`; `open-and-build` | D179 (Census 2021 language and arrival-period analysis) | — | **Well-supported:** 1.8% of residents cannot speak English well or at all; 11% of 2011–21 arrivals do not speak it well vs 4% of pre-1971 arrivals. Generation not available (Census does not record parents' birthplace). | I6 |
| C8 | Is residential and school segregation rising or falling? | `cultural-cost`; against: `open-and-build` | D180 (Catney et al. 2023), D181 (school segregation) | Mechanism: none decisive found | **Residential evenness falling for every group 1991–2021 (well-supported)** — against `cultural-cost`'s "parallel communities" framing. But the dissimilarity index measures evenness, not exposure; isolation can rise as groups grow. School data older (2011–16), *unverified*. | I6 |
| C9 | Is social trust, or trust in democracy, lower where migration has been faster? | `cultural-cost`; against: `open-and-build` | D182 (Community Life Survey), D183 (research record) | Counterfactual: deprivation (Sturgis) | **Mixed/unknown.** Meta-analysis finds a small negative diversity–trust association, strongest for neighbours; UK London studies find none once deprivation is controlled. National "get on well" stable at 80–84%. No study links *pace* of migration to trust in democracy found. | I6 |
| C10 | How do children of migrants do at school and in work, by origin? | against `cultural-cost`; `open-and-build` | D184 (Attainment 8 by ethnicity), D185 (HE entry by ethnicity) | D165 (employment of second generation) | **Well-supported:** most minority groups outperform White British at GCSE (Chinese 65.5, Indian 59.4, Bangladeshi 51.9, Pakistani 47.0 vs White British 44.9, 2022/23) and enter HE at higher rates. Exceptions: Black Caribbean, Gypsy/Roma, Irish Traveller. Ethnicity ≠ migrant generation (most are UK-born). | I6 |
**Searched without a good result.**

*Levels, population and settlement:*
- **L5:** no official series of employment, earnings, benefits or social housing for ILR holders by route (DWP, HMRC, APS and Census do not record ILR status; ONS FOI-2025-3296 says it holds no status data — *unverified*).
- **L6:** no single official comparator table of permanent-residence waits; the OECD *International Migration Outlook* is blocked (3d).
- **L8:** no rich democracy found with net negative migration achieved by policy.
- **L14:** no study of destination choice by skilled workers in response to settlement waits.

---

## 3b. Candidate datasets

---

**Levels, population and settlement**


### D1. ONS long-run series: immigration, emigration and net migration, UK, 1964–2025
- **Source:** ONS, chart data behind *Long-term international migration, provisional: year ending December 2025* (bulletin 21 May 2026), https://www.ons.gov.uk/visualisations/dvc3417/line-chart/datadownload.xlsx ; bulletin https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025 . Next release (YE June 2026): outline says 26 Nov 2026; the bulletin says "To be announced" (read).
- **Measures:** long-term (12 months+) moves in and out, all nationalities. Excludes short-term migration. Sources change: IPS to 2020; Home Office Borders and Immigration data plus DWP RAPID since; the file warns comparisons across June 2021 "should be treated with caution" (read, data).
- **Coverage:** calendar years 1964–2011, then rolling quarterly year-ending figures from YE Jun 2012 to YE Dec 2025. UK only.
- **Shape:** time series (61 years) with a method break.
- **Slices:** the bulletin adds nationality (British, EU+, non-EU+) and, for non-EU+, reason (study, work, family, humanitarian, asylum; main applicants vs dependants).
- **What it shows (read, data; as of YE Dec 2025):**
  - Net migration was **negative in 1964–1978, 1980–1982, 1988, 1992 and 1993**; lowest −87,000 (1969). First sustained positive run from 1994; above 100,000 every year 1998–2019.
  - Peak: immigration 1,469,000 and net 944,000 in YE Mar 2023. YE Dec 2024 net 331,000 (revised); YE Dec 2025 net **171,000** (immigration 813,000, emigration 642,000).
  - Calendar-year gross immigration 2021–2024 = 947,000 + 1,398,000 + 1,441,000 + 1,012,000 ≈ **4.8 million**; 2022–2025 ≈ 4.66 million. Net 2021–2024 ≈ **2.54 million** (my arithmetic). Home Office CP 1448 gives "net migration of an additional 2.6 million" 2021–24 (read, PDF; D6).
  - YE Dec 2025 by nationality (read, bulletin): immigration non-EU+ 627,000, British 110,000, EU+ 76,000; net non-EU+ +350,000, British −136,000, EU+ −42,000. Non-EU+ immigration by reason: study 294,000 (47%; 17,000 dependants), work 146,000 (23%; 74,000 dependants), asylum 88,000 (14%), family 7%, humanitarian 6%.
- **Helps:** `economic-cost` (2021–24 inflow is the largest on record; "4.5 million arrived" holds for gross immigration); `end-settlement` (negative net migration has happened before). `open-and-build` (net already down about 82% from peak — 944k→171k, my arithmetic). **Hurts:** `economic-cost` (the "largest inflow" framing is gross; net was about 2.5m and includes British returners); `end-settlement` (the negative years came from emigration, not removal of residents, and arrivals then were ~200,000 a year, far below today).
- **Likely status:** well-supported. State gross vs net, and mark the 2021 method break.

### D2. ONS method revisions (November 2025 and May 2026) and British emigration
- **Source:** ONS, *Long-term international migration, provisional: YE June 2025* (27 Nov 2025), https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingjune2025 ; ONS article *What is international migration and how do we estimate it?* (18 Nov 2025); Migration Observatory, *Long-term international migration flows to and from the UK* (updated 27 May 2026), https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/ .
- **Measures:** what changed in method: British flows moved from IPS to DWP RAPID; EU+ flows from RAPID to Home Office HOBI data; better matching for non-EU+. Revised YE Jun 2021 to YE Dec 2024 (read).
- **Coverage:** British-citizen estimates since 1964 (read, MO).
- **Shape:** record of revisions, plus British-national series.
- **What it shows:**
  - Effect of Nov 2025 revision: YE Dec 2024 net cut from 431,000 to 345,000; old peak 906,000 (YE Jun 2023) replaced by 944,000 (YE Mar 2023); British emigration in 2024 revised from 77,000 to 257,000; British net from −17,000 to −114,000 (***unverified***: press snippets; stage 5 should take from the ONS revisions article).
  - British net migration has been negative every year since 1964 except 1985 (read, MO). Net British −136,000 in 2025; ONS says gross British emigration is stable and the net rise since 2022 is fewer Britons returning (read, MO).
  - MO says a further revision in May 2026 lowered 2024 by about 100,000 (23%) (read, MO) — the two descriptions of which release did what conflict; stage 5 to settle.
- **Helps:** `open-and-build` (Britons are leaving on net in large numbers). **Hurts:** `open-and-build` (gross British emigration is "stable", so it is fewer returners, not an exodus); `economic-cost` (the peak is now higher, but recent years are lower than first published).
- **Likely status:** well-supported for the British series' direction; the size is "highly uncertain" (MO).

### D3. ONS mid-year population estimates, mid-2025
- **Source:** ONS, *Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025*, released 1 Oct 2026, https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/annualmidyearpopulationestimates/mid2025 ; Migration Observatory *The impact of migration on UK population growth* (13 May 2026), https://migrationobservatory.ox.ac.uk/resources/briefings/the-impact-of-migration-on-uk-population-growth/ .
- **Measures:** population and components of change (births, deaths, net international migration).
- **Coverage:** annual series back to at least 1991 in ONS tables (range not yet checked); UK and nations.
- **Shape:** time series.
- **Slices:** nation, local authority, age, sex.
- **What it shows (read; as of mid-2025):** population 69,483,900, up 227,700 (0.33%), the slowest since mid-2020. Net international migration 222,900 (down from 651,700); natural change +4,900 (652,400 births, 647,500 deaths) — migration ≈ 98% of growth (my arithmetic). MO: net migration was 68% of growth 2005–2024 and 99% since 2020 (read, MO). 34% of births in England and Wales in 2024 were to non-UK-born mothers (read, MO).
- **Helps:** `economic-cost` (migration is nearly all population growth); `open-and-build` (without migration the population stops growing). **Hurts:** neither directly; the direct share understates migration's effect via births (MO says the retrospective figure excludes it).
- **Likely status:** well-supported.

### D4. Merged into D69

### D5. Cross-country net migration per head (OECD; UN/World Bank)
- **Source:** OECD, *International Migration Outlook 2025* (Nov 2025) — **blocked** (403 on WebFetch and curl); World Bank API indicator SM.POP.NETM (UN World Population Prospects estimates), last updated 8 Oct 2026, https://api.worldbank.org/v2/country/GBR/indicator/SM.POP.NETM .
- **Measures:** OECD: "permanent-type" inflows by country; UN: modelled net migration.
- **Coverage:** OECD annual since 2000s for ~38 countries; UN 1960–2024 all countries.
- **Shape:** cross-country comparison.
- **What it shows:** OECD: UK permanent migration fell 41% from 2023 to 2024; OECD-wide permanent migration 6.2m in 2024 (***unverified***, press summary). World Bank/UN series gives the UK +445,523 for 2023 and +417,114 for 2024 (read, data) — about half of ONS's figures (848,000 YE Dec 2023), and Australia only ~140,000 a year, far below ABS. **Not usable as a comparator** without reconciliation.
- **Helps/hurts:** cannot yet be assigned.
- **Likely status:** needs the OECD annex by hand (3d). Canada's planned 380,000 permanent admissions a year in 2026–28 (≈0.9% of population; ***unverified***) against UK settlement grants of 153,204 in 2025 (≈0.2%; my arithmetic, D9) is a lead for "UK grants permanence less often than Canada".

### D6. Home Office, *A Fairer Pathway to Settlement* (CP 1448) — settlement forecast and proposal
- **Source:** Home Office, *A Fairer Pathway to Settlement: a statement and accompanying consultation on earned settlement*, CP 1448, 20 Nov 2025, https://assets.publishing.service.gov.uk/media/691edda450b16caf978153d8/Command_Paper_final_-_reviewed7.pdf
- **Measures:** settlement grants 2004–2024 (actuals) and a forecast 2025–2030 by entry route, from Migrant Journey data and assumed propensity to settle; the earned-settlement proposals. Excludes EUSS.
- **Coverage:** actuals 2004–2024; forecast to 2030.
- **Shape:** series + forecast; policy record.
- **Slices:** entry route (Health and Care, Skilled Worker, BN(O), family, study), dependants.
- **What it shows (read, PDF; as of Nov 2025):**
  - **1.6 million** forecast to settle 2026–2030 (range 1.3m–2.2m); peak ~450,000 in 2028 (range 359,000–620,000).
  - Drivers: 154,000 BN(O) visas in 2021–22 (92,000 extra settlement applications in 2026, 54,000 in 2027); 616,000 Health and Care entry visas 2022–24 (384,000 extra applications 2027–29, peak 210,000 in 2028); 344,000 Skilled Worker entry visas 2022–24 (~222,000 applications).
  - Forecast grants 2026–30: Health and Care 462,000; other Skilled Worker 306,000 (61,000/yr vs 39,000 in 2024); family 280,000; study 105,000.
  - Grants peaked in 2010 at almost 250,000 (82,295 discretionary backlog grants); averaged 111,000 a year 2011–2024; 163,000 in YE Q2 2025.
  - 2021–24 settlers: work 31%, family 30%, study 11% (2024); dependants 26% of grants. Dependants per Skilled Worker: 0.74 (2016–19) → 1.14 (2021–24); 56% of Health and Care new-entrant visas 2022–23 went to dependants. Care-worker median pay £23,000–£26,000 (2023/24) vs £37,000 UK full-time median.
  - Proposal: 10-year baseline; 15 years consulted for care/medium-skilled; reductions for £50,270 (−5 yrs) and £125,140 (−7 yrs); +5/+10 yrs for benefit receipt; +up to 20 yrs for illegal entry. BN(O) and partners of British citizens keep 5 years. "We propose to apply these changes to everyone in the country today who has not already received indefinite leave to remain." "We will not, and would never, take away settled status from those who have already been granted it." EUSS and Windrush out of scope. Also asks whether benefits should be reserved for citizens.
  - DWP: 213,000 migrants with settlement were claiming UC (June 2025).
- **Helps:** `economic-cost` (a large settlement wave 2026–30, skewed to low-paid routes with dependants); `contribute-and-earn` (the government's own case and design). **Hurts:** `end-settlement` (the government rules out revoking existing ILR and keeps EUSS out); `keep-our-word` (explicit intent to apply to people already here); `economic-cost` (BN(O) — a higher-earning, family cohort — is a large part of the 2026–27 wave).
- **Likely status:** well-supported as the official forecast; a forecast with a wide range.

### D7. Home Office visa grants by route, 2021–2025 (immigration system statistics)
- **Source:** Home Office, *Immigration system statistics data tables* (Vis_D02, Occ_D02), latest YE June 2026 (27 Aug 2026), https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables
- **Measures:** entry-clearance visas granted by route and applicant type. Visas are not arrivals or stays.
- **Coverage:** quarterly since 2005 (range not yet checked).
- **Shape:** series.
- **Slices:** route, main/dependant, nationality, occupation (sponsored work).
- **What it shows:** CP 1448 (D6) uses it: student visas averaged 238,000/yr 2017–19 vs 532,000/yr 2021–23; students' dependants per main applicant 0.06 → 0.26; Health and Care visas below RQF 6 went from 11% (2021) to 75% (2023) (read, PDF). HAC: 157,490 social-care worker entry visas 2021–Sep 2025, 105,432 in 2023 (read, D29). Ukraine schemes' arrivals not yet read.
- **Helps:** `economic-cost`, `contribute-and-earn` (the rise was students, care workers and dependants, plus humanitarian routes). **Hurts:** `economic-cost` (Ukraine and BN(O) humanitarian routes, which a "cut it hard" policy would not have closed, were a sizeable part).
- **Likely status:** well-supported; stage 5 to pull a route-by-year table including Ukraine and BN(O).

### D8. Home Office *Migrant journey* reports (2024 and 2025)
- **Source:** Home Office, *Migrant journey: 2024 report* (22 May 2025), https://www.gov.uk/government/statistics/migrant-journey-2024-report/migrant-journey-2024-report ; *Migrant journey: 2025 report* (21 May 2026), https://www.gov.uk/government/statistics/migrant-journey-2025-report/migrant-journey-2025-report
- **Measures:** status after five years of each annual cohort of new visa holders.
- **Coverage:** cohorts from 2008 (read).
- **Shape:** cohort series.
- **Slices:** entry route, age.
- **What it shows (read):**
  - 2019 cohort at end-2024: study 25% still held leave, under 1% ILR; work 45% held leave, 20% ILR (skilled "Worker" 28% ILR); family 89%, 53% ILR; asylum 95%, 11% ILR.
  - 2020 cohort at end-2025: study 41% held leave (<1% ILR); work 58% (30% ILR); family 86% (46% ILR); asylum 99% (3% ILR). Settlement grants in 2025: 153,204 (−9%). The report gives skilled-Worker ILR as both 41% and 27% — inconsistent; check.
  - Family: over 70% of 2008–11 arrivals had ILR within five years; 18% for the 2013 cohort after the 2012 2→5-year change.
- **Helps:** `keep-our-word` (most work migrants historically did not settle; settlement is not automatic). `economic-cost` (retention is rising cohort by cohort: study 17–18% → 41%). **Hurts:** `end-settlement` (most temporary migrants already leave).
- **Likely status:** well-supported.

### D9. Home Office settlement and EUSS grants, YE June 2026
- **Source:** Home Office, *How many Indefinite Leave (Settlement and EUSS settled status) grants have been issued in the UK?*, YE June 2026 (27 Aug 2026), https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-june-2026/how-many-indefinite-leave-settlement-and-euss-settled-status-grants-have-been-issued-in-the-uk ; tables Se_D01/Se_D02.
- **Measures:** grants (flows), not holders.
- **Coverage:** settlement since 2004 in tables; page charts from YE Jun 2011.
- **Shape:** series.
- **Slices:** previous leave (work, family, protection, other incl. BN(O)), nationality.
- **What it shows (read; YE Jun 2026):** 199,628 settlement grants, +24%, highest since YE Jun 2011. Work 80,409 (+36%); "other" 57,433, of which BN(O) 38,373 (from 587); refugee/protection 22,799 (−40%). EUSS settled status 336,229; just under **4.6 million** EUSS settled grants since launch. Indian nationals largest group (35,384, +51%; ***unverified***, press).
- **Helps:** `economic-cost` (the wave has begun). **Hurts:** `economic-cost` (BN(O) is the largest new element so far, not care workers); `end-settlement` (EUSS holders — exempt from Reform's plan — dwarf other ILR).
- **Likely status:** well-supported.

### D10. Party pledges on migration levels since 2010
- **Source:** party manifestos 2010–2024 (Conservative, Labour, Reform); Full Fact, *Clash of the manifestos: the net migration target*, https://fullfact.org/immigration/clash-manifestos-net-migration-target/ (not fetched).
- **Measures:** stated targets.
- **Shape:** record, set against D1.
- **What it shows (***unverified***):** Conservative 2010, 2015 and 2017: net migration in "the tens of thousands"; 2019: "overall numbers will come down", target dropped; 2024: binding annual cap. Labour 2024: reduce net migration, no number. Reform 2024: "net zero immigration"; 2025: "net negative". D1 shows net migration never fell below 100,000 between 1998 and 2019.
- **Helps:** `economic-cost` (promises broken under every government since 2010). **Hurts:** `economic-cost` (the Conservative governments that made the pledge also oversaw the 2021–23 liberalisation); `end-settlement` (no government has delivered even the lower targets).
- **Likely status:** well-supported once manifesto wording is fetched.

### D11. Polling on preferred migration levels and salience
- **Source:** Ipsos/British Future *Immigration Attitudes Tracker*, wave 18 (fieldwork 16 Jun–2 Jul 2025, n=3,003 GB adults; published 27 Nov 2025), https://www.ipsos.com/en-uk/immigration-tracker-november-2025-0 ; Migration Observatory *UK public opinion toward immigration*, https://migrationobservatory.ox.ac.uk/resources/briefings/uk-public-opinion-toward-immigration-overall-attitudes-and-level-of-concern/ (Ipsos Issues Index).
- **Measures:** preferred level (reduce a lot/a little, same, increase); salience.
- **Coverage:** tracker since Feb 2015 (18 waves); Issues Index monthly since 1974.
- **Shape:** series.
- **What it shows:** 2025 wave: reduce a lot 41%, reduce modestly 16% (≈57% reduce), stay the same 21%, increase 15% (read). Earlier waves: 67% reduce (Feb 2015) → 42% (Feb 2022) → 55% (Sep 2024) (***unverified***). Salience: 56% peak Sep 2015, ~5% in 2020, 51% Sep 2025, 43% Jul 2026 (read, MO).
- **Helps:** `economic-cost`, `end-settlement` (a majority want lower numbers). **Hurts:** `end-settlement` (only 41% want "a lot" lower, short of net negative); `economic-cost` (preferences softened 2015–22 while numbers were still high).
- **Likely status:** well-supported; fetch the tracker trend tables.

### D12. Migration Observatory estimate of non-EU ILR holders, and people on a path to settlement
- **Source:** Migration Observatory, *How many migrants in the UK have settlement?* (10 Nov 2025), https://migrationobservatory.ox.ac.uk/resources/commentaries/how-many-migrants-in-the-uk-have-settlement/ ; briefing *Migrant settlement in the UK* (24 Feb 2026), https://migrationobservatory.ox.ac.uk/resources/briefings/migrant-settlement-in-the-uk/ (not fetched).
- **Measures:** estimated stock of non-EU citizens holding ILR, from Census 2021 (England and Wales) plus visa data.
- **Coverage:** end-2024 snapshot.
- **Shape:** snapshot (range estimate).
- **What it shows (read; end-2024):** **621,000–820,000** non-EU citizens with ILR (excludes Scotland and NI; some have left or naturalised). Excludes ~4 million EU citizens with settled or pre-settled status. HAC cites this range (read, D29). No official stock exists: ONS says it holds no immigration-status data (FOI-2025-3296, ***unverified***).
- **Helps:** `keep-our-word`, `end-settlement` (gives the size of the group Reform's plan would hit, excluding EUSS). **Hurts:** `end-settlement` (the group outside EUSS is under a million, so revoking it is a small lever on total population next to the ~4.6m EUSS grants, D9).
- **Likely status:** complicated: the only estimate is a range by one research group; say "about 0.6–0.8 million, not counting EU citizens".

### D13. Reform UK's ILR plan (record)
- **Source:** Reform UK press conference, 22 Sep 2025; Irish News/PA, *Reform defends savings claim amid questions on scope of welfare plans*, https://www.irishnews.com/news/uk/reform-defends-savings-claim-amid-questions-on-scope-of-welfare-plans-OBIOF3E5WNIXZGX2ANH44BG6WQ/ ; New Statesman (Sep 2025). Reform's own policy document not found.
- **Shape:** policy record.
- **What it shows:** abolish ILR; renewable five-year visas; seven years' residence, higher salary and English thresholds for new applicants; non-citizens barred from benefits; **EU settled-status holders exempt** from the ILR and benefits changes (Yusuf: would seek to renegotiate welfare terms with the EU); Hong Kong and Ukrainian nationals not exempt; Reform estimated ~800,000 would become eligible from 2020–24 arrivals (read, Irish News). Existing ILR holders would have to reapply, with those above an unspecified salary kept (***unverified***, secondary reports).
- **Helps/hurts:** defines `end-settlement`'s plan; the EUSS exemption cuts against "aim for more leaving than arriving" because most settled non-citizens are EU (D9).
- **Likely status:** record; the primary Reform document is still needed.

### D14. DWP Universal Credit by immigration status
- **Source:** DWP, *Universal Credit statistics, 29 April 2013 to 10 July 2025*, https://www.gov.uk/government/statistics/universal-credit-statistics-29-april-2013-to-10-july-2025/universal-credit-statistics-29-april-2013-to-10-july-2025 ; later monthly releases (Jan 2026 figures published 17 Feb 2026, ***unverified***).
- **Measures:** people on UC by status recorded at claim (Habitual Residence Test); "statistics in development". Naturalised people may still be recorded as ILR (MO, D12, read).
- **Coverage:** monthly since 2025 (range not yet checked); GB.
- **Shape:** short series.
- **What it shows (read; July 2025):** of 8.0m people on UC, 83.8% British/Irish/right of abode, 9.6% EUSS (settled + pre-settled), **2.7% ILR (not EUSS) ≈ 213,000–220,000**, 1.5% refugees. FOI (Pie, May 2026): 332,652 people with ILR or limited ILR plus dependants claimed at some point in 2025 (***unverified***).
- **Helps:** `end-settlement`, `economic-cost` (213,000 ILR holders on UC against a stock of 621k–820k suggests roughly a quarter to a third — my arithmetic, rough, mismatched denominators). **Hurts:** `end-settlement` (EUSS claimants, exempt under Reform, are 3.5 times as many); UC includes in-work claimants.
- **Likely status:** complicated: no published ILR rate; flag the denominator problem.
- **Merged from D166:** January 2026, 8.3m on UC in GB: UK/Irish/right of abode 85%, EEA 7%, non-EEA 6%, unknown 2% (***unverified***, Lords answer and Full Fact). By nationality, not origin or ethnicity; naturalised people count as British.

### D15. Merged into D60

### D16. MHCLG social housing lettings by nationality of lead tenant
- **Source:** MHCLG, *Social housing lettings in England, April 2024 to March 2025: tenants* (13 Nov 2025), https://www.gov.uk/government/statistics/social-housing-lettings-in-england-april-2024-to-march-2025/social-housing-lettings-in-england-tenants-april-2024-to-march-2025
- **Measures:** new lettings (CORE) by lead tenant's nationality. Does not record ILR ("Equivalent information is not collected"). Census 2021: 7% of social-housing residents held a non-UK passport (***unverified***).
- **Coverage:** 2008/09–2024/25; England.
- **Shape:** series.
- **What it shows (read):** 89% UK nationals (233,000), 4% EEA (10,000), 8% non-EEA (20,000) in 2024/25. UK share fell from 94% (2008/09); non-EEA 3–4% until 2020/21, 9% in 2023/24. Refugees 2.3% of new lets.
- **Helps:** `economic-cost` (non-EEA share has doubled). **Hurts:** `end-settlement` (about one new let in twelve goes to a non-EEA lead tenant, and some of those are refugees or naturalised-status unknown).
- **Likely status:** well-supported for nationality; cannot isolate ILR.

### D17. Migration Advisory Committee annual report 2025 — outcomes by route
- **Source:** MAC, *Annual report 2025* (17 Dec 2025), https://www.gov.uk/government/publications/migration-advisory-committee-annual-report-2025/migration-advisory-committee-mac-annual-report-2025-accessible
- **Measures:** employment and earnings by route from linked administrative data and surveys; static fiscal estimates.
- **Coverage:** mostly 2022–2024 cohorts; some years since arrival.
- **Shape:** snapshots and short cohort series.
- **What it shows (read):** family partners' employment 49% at arrival → 65% by year 3, median £20,000; 44% of family migrants get ILR in year 5 and 29% more by year 6; family claimants after ILR average £2,400 a year in benefits (years 5–7); Skilled Worker adult dependants 44% employed; BN(O) 59% employed; asylum migrants 56% vs 75% UK-born; Ukraine scheme 69% employed, 40% receiving benefits. Higher English requirements "may in practice mean keeping migrants in temporary statuses for longer periods".
- **Helps:** `contribute-and-earn`, `economic-cost` (employment gaps among dependants and family migrants). **Hurts:** `end-settlement` (employment rises with years since arrival — the people it would remove are more likely in work over time).
- **Likely status:** well-supported for visa-holder outcomes; the closest thing found to "years since arrival", but not for ILR holders by route.

### D18. Reform's £234bn figure: Centre for Policy Studies, *Here to Stay?*
- **Source:** Karl Williams, CPS, *Here To Stay? Estimating the Scale and Cost of Long-Term Migration* (2025; PDF at https://cps.org.uk/wp-content/uploads/2025/09/Here-to-stay.pdf ), page https://cps.org.uk/research/here-to-stay/ ; Full Fact, *Daily Mail corrects report about Reform UK's disputed immigration savings* (3 Oct 2025), https://fullfact.org/politics/reform-uk-ilr-benefit-cost/
- **Measures:** CPS projection of ILR applications from visas issued Jan 2021–Jun 2024, times OBR lifetime fiscal profiles.
- **Shape:** record (an estimate and its withdrawal).
- **What it shows (read):** over 2 million visas issued Jan 2021–Jun 2024 lead to ILR eligibility; central projection **801,000** ILR applications (up to 1.24m); "lifetime net fiscal cost to the state of leaving ILR conditionality unchanged would be £234 billion" (≈£8,200 per household). The CPS page now says: the OBR fiscal data "is the subject of dispute, meaning that the overall cost estimates should no longer be used"; visa and ILR-number projections stand. Full Fact: it was a net lifetime cost, not a benefits bill; the Daily Mail corrected its "in benefits" wording. Farage called the figure "without a doubt too low" (read, Irish News, D13).
- **Helps:** `end-settlement`, `economic-cost` (a think-tank estimate that settlement of the 2021–24 cohort has a large net cost). **Hurts:** `end-settlement` (its source has withdrawn the figure; it is a cost of *settling*, not a saving from revoking existing ILR; it is not a benefits figure). The CPS's 801,000 is half the Home Office's 1.6m (D6) because it covers a narrower window.
- **Likely status:** traced. The claim "Reform's plan saves £234bn" fails the 90% test; the economics agent should cover the fiscal method.
- **Merged from D58:** CPS clarification, 22 Sep 2025, https://cps.org.uk/media/post/2025/centre-for-policy-studies-issues-clarification-on-indefinite-leave-to-remain-statistics/ (read): after OBR definitional revisions, "the overall cost estimates should no longer be used"; the visa analysis and ILR projections by route stand. Jonathan Portes said correcting earnings and employment gives about +£125bn (***unverified***, social media). "About 72% of the cohort expected to earn below the average salary" (***unverified***, Telegraph, Karl Williams). Reform's later £622bn is D59.

### D19. Permanent-residence rules in comparator countries
- **Source:** official pages (not yet fetched except Singapore): Singapore MOM, *Work Permit conditions*, https://www.mom.gov.sg/passes-and-permits/work-permit-for-foreign-worker/sector-specific-rules/work-permit-conditions ; Swiss SEM (C permit); IRCC *2026–2028 Immigration Levels Plan*; German Residence Act §9, §18c; Australian Home Affairs skilled visas; UAE Golden Visa; Saudi Premium Residency. HAC report (D29) for "usually five years".
- **Shape:** record / comparison.
- **What it shows:**
  - Singapore Work Permit holders must not marry a citizen or PR without MOM approval, must not get pregnant or give birth in Singapore, may work only for their employer in a set occupation; permits generally 2 years (read).
  - HAC: the UK would be "an outlier among most high-income countries, where the standard settlement period is usually five years ... although Switzerland and Japan both have 10-year routes" (read, D29).
  - Switzerland: C permit usually after 10 years (5 with early integration or for some nationalities), discretionary (***unverified***, law firms). Canada: economic immigrants receive PR on arrival; target 380,000 PR a year 2026–28 and temporary residents cut to under 5% of population (***unverified***). Germany: settlement permit generally after 5 years, faster for skilled workers and Blue Card holders; citizenship after 5 years since 2024 (***unverified***). Gulf states: no general permanent residence; long-term "golden" visas for investors and high earners; most workers on employer-tied visas (***unverified***).
- **Helps:** `end-settlement` (large rich states run mostly temporary systems; Switzerland waits 10 years). `keep-our-word`, `contribute-and-earn` (the democracies Britain competes with settle people in about five years, or at once). **Hurts:** `end-settlement` (the temporary-only systems restrict marriage, pregnancy and job changes — conditions no UK party proposes); `contribute-and-earn` (a 10–15 year wait would put the UK at the restrictive end).
- **Likely status:** complicated as a comparison; each country's rule is easy to state from official pages (stage 5). The OECD comparative table is blocked (D5).

### D20. Unused

### D21. Legal record: revocation powers and past mid-route rule changes
- **Source:** Nationality, Immigration and Asylum Act 2002, s.76, https://www.legislation.gov.uk/ukpga/2002/41/section/76 ; *R (HSMP Forum Ltd) v SSHD* [2008] EWHC 664 (Admin), https://caselaw.nationalarchives.gov.uk/ewhc/admin/2008/664 ; follow-up [2009] EWHC 711 (Admin); Home Office *Statement of Intent: Family Migration* (June 2012) para 132 and Explanatory Memorandum to HC 1016 (30 Mar 2006) para 7, both cited by HAC (D29) as precedents (not fetched).
- **Shape:** legal record.
- **What it shows:**
  - s.76: ILR may be revoked only where the person is liable to deportation but cannot be deported for legal reasons; leave was obtained by deception; or (refugees) protection ceased through their own voluntary acts (read). Mass revocation would need new primary legislation.
  - HSMP 2006/2008: the 2006 changes applied a new points test at extension to migrants already admitted; the High Court held this an abuse of power because guidance had promised those admitted would keep the terms "prevailing at the date he joined", and it saw no public interest outweighing the unfairness (paras 55–64; read). Government issued protective guidance in July 2008 (***unverified***).
  - HAC: "It is common for the Home Office to apply transitional protections ... but there is also precedent for changes to Immigration Rules being applied to people already in the UK" (read, D29). The 2012 family change (2→5 years) applied to new applicants only (***unverified***, Statement of Intent cited).
  - Article 8: no case found on revoking settled status en masse; lawyers quoted say retrospective removal would be challenged as unfair (***unverified***, press).
- **Helps:** `keep-our-word` (courts have struck down retrospective changes where guidance promised continuity; current law gives no general revocation power). `end-settlement` (Parliament can legislate; HAC accepts precedent for applying changes to people already here). **Hurts:** `end-settlement` (needs new primary law and faces Article 8 claims person by person); `contribute-and-earn` (HSMP is close to applying a 10-year wait to people promised 5).
- **Likely status:** complicated: what the law says now is clear; how courts would treat a new Act is a prediction.

### D22. Legal commentary on applying settlement changes retrospectively
- **Source:** Charles Russell Speechlys, *Retrospectively changing ILR rules for those currently on route* (16 May 2025), https://www.charlesrussellspeechlys.com/en/insights/quick-reads/102kbau-retrospectively-changing-indefinite-leave-to-remain-rules-for-those-currently-on/ ; Law Society evidence to HAC (D29).
- **Shape:** record (opinion).
- **What it shows (read):** the firm expects courts would apply HSMP to a retrospective 10-year rule; it does not address Article 8 or revocation of existing ILR. The Law Society told HAC it would undermine "fundamental principles of fairness and expectation" (read, D29).
- **Helps:** `keep-our-word`. **Hurts:** none directly; it is advocacy-adjacent professional opinion, not a ruling. HSMP turned on explicit guidance; immigration-route pages say "you may be able to apply" (D26), which is weaker.
- **Likely status:** opinion; use only as context.

### D23. Windrush: Lessons Learned Review and compensation scheme data
- **Source:** Wendy Williams, *Windrush Lessons Learned Review* (HC 93, 19 Mar 2020), https://www.gov.uk/government/publications/windrush-lessons-learned-review (PDF mirror https://www.civilservant.org.uk/library/2020-Windrush_Lessons_Learned_Review.pdf ); Home Office, *Windrush Compensation Scheme data: June 2026* (27 Aug 2026), data tables https://assets.publishing.service.gov.uk/media/6a8c4077dba67049905daa29/windrush-compensation-scheme-data-tables-jun-2026.ods
- **Measures:** compensation claims, decisions, payments; review findings.
- **Coverage:** scheme since April 2019, monthly.
- **Shape:** series + record.
- **What it shows:**
  - To 30 Jun 2026 (read, data): **£130.9m paid** (£130,900,210.74) on 4,131 claims; £136.2m offered; 12,134 cases taken in; 11,428 final decisions, of which 3,901 value offers, **6,606 zero-entitlement**, 921 refused/withdrawn; 573 in progress.
  - Review: the scandal was "foreseeable and avoidable"; "institutional ignorance and thoughtlessness towards the issue of race", consistent with "some elements" of institutional racism; Home Office identified 164 people detained or removed since 2002 (***unverified***, press).
- **Helps:** `keep-our-word` (people lawfully settled lost jobs, homes and in some cases were removed when they could not prove status). **Hurts:** `keep-our-word` as an analogy: Windrush victims were entitled to stay under existing law and were wrongly treated; Reform's plan would change the law openly (and EUSS/Windrush are out of scope of the government's plan, D6). Low payment totals can be read either way.
- **Likely status:** well-supported as a record.

### D24. Net negative migration in other countries
- **Source:** leads only: Saudi GASTAT labour-force and population data; CSO Ireland population and migration estimates; World Bank/UN series (D5).
- **Shape:** comparison / record.
- **What it shows (***unverified***):** Saudi Arabia: 466,000 foreign workers left in Q4 2017 after an expat dependant levy; non-Saudi population 13.58m (2020) → 12.42m (2021), mostly during Covid. Ireland had net emigration around 2009–2014 and Spain around 2012–2014, both in recessions, not by policy. Japan: UN shows −35,000 in 2021 (Covid border closure). No rich democracy found achieving net negative migration by deliberate policy.
- **Helps:** `end-settlement` (Gulf states have shed foreign workers quickly by policy). **Hurts:** `end-settlement` (only non-democracies with employer-tied systems did; democracies' negative years came from recessions or emigration of their own citizens, as in the UK's 1960s–80s).
- **Likely status:** "searched, none found" for a democracy by policy; Gulf figures need primary fetch.

### D25. YouGov: scrapping ILR for new arrivals vs existing holders
- **Source:** YouGov, *What do Britons really think about scrapping indefinite leave to remain?* (Sept 2025), https://yougov.com/en-gb/articles/53070-what-do-britons-really-think-about-scrapping-indefinite-leave-to-remain
- **Shape:** snapshot poll. Fieldwork dates and sample not on page (fetch the tables).
- **What it shows (read):** ending new ILR grants 44% support / 43% oppose; removing ILR from current holders **29% / 58%**. Reform voters: 64% / 54% support; Conservative: 51%, and 44% vs 42% on removal; Labour, Lib Dem, Green 71–80% oppose removal. Among groups, majorities want NHS workers and full-time taxpayers kept; 50% for those with 20+ years in the UK. One other poll (pollster unnamed) found 39% support and 26% oppose a 10-year wait, 36% if retrospective (***unverified***).
- **Helps:** `keep-our-word`, `contribute-and-earn` (the public separates new rules from removing status). **Hurts:** `end-settlement` (majority against its distinctive proposal); `keep-our-word` (the public is split, not opposed, on ending ILR for new arrivals).
- **Likely status:** well-supported for one poll; look for a second pollster.

### D26. What the route rules and guidance said about settlement
- **Source:** gov.uk, *Skilled Worker visa*, https://www.gov.uk/skilled-worker-visa ; *Health and Care Worker visa*, https://www.gov.uk/health-care-worker-visa ; Home Office, *Hong Kong British National (Overseas) Visa: policy statement* (22 Jul 2020), https://www.gov.uk/government/publications/hong-kong-bno-visa-policy-statement/hong-kong-british-national-overseas-visa-policy-statement-plain-text-version
- **Shape:** record (current guidance; archived 2021–24 versions still to fetch from the web archive).
- **What it shows (read):** Skilled Worker and Health and Care pages: "After 5 years, you may be able to apply to settle permanently in the UK" if you "meet the other eligibility requirements"; no note of planned changes (as of 24 Oct 2026). BN(O) statement: after five years holders who have "stayed free of criminality" and "supported themselves financially" can apply for settled status, and "after a further year they may apply to naturalise"; the route reflects "the UK's historic and moral commitment to BN(O) citizens"; English required at settlement; no income threshold.
- **Helps:** `keep-our-word` (a five-year path was stated on every main route; BN(O) framed as a national commitment). **Hurts:** `keep-our-word` (the wording is "may be able to apply", subject to the rules at the time); `end-settlement` (BN(O)s would lose a status the government called a moral commitment).
- **Likely status:** well-supported for current wording; archived versions needed to show what applicants saw when they came.

### D27. Migration Observatory, *Changes to settlement: what do they mean?*
- **Source:** Mihnea Cuibus, Migration Observatory (updated 10 Feb 2026), https://migrationobservatory.ox.ac.uk/resources/commentaries/changes-to-settlement-what-do-they-mean/
- **Measures:** people on temporary visas at end-2024 by route, and shares not working (from Home Office, HMRC, MAC and survey data).
- **Coverage:** end-2024 snapshot.
- **Shape:** snapshot.
- **What it shows (read):** **~2.2 million** (53% of ~4.2m temporary visa holders) were on a five-year path to settlement at end-2024; ~3.6m of temporary holders arrived since 2021. Not working: about half of adult Skilled Worker dependants (645,000 total, 328,000 adults); about a third of Health and Care dependants; about a third of adults on family visas by year five (352,000 / 318,000 adults); ~45% of refugees by year five (230,000 / 165,000 adults); 30% of adult BN(O)s (189,000 / 145,000 adults). Overall "hundreds of thousands" would fail the employment test on current circumstances. Most Skilled Worker mains earn above £50,270 (median £56,600). Over 250,000 out-of-country visas for care or middle-skilled jobs 2021–Sep 2025, plus 71,000 switchers; children on a path 430,000–520,000.
- **Helps:** `contribute-and-earn` (most main applicants pass; the test targets non-working adults). `keep-our-word` (the group affected is large and includes children and BN(O)s). **Hurts:** `keep-our-word` (sizeable shares of adult dependants are not working); `contribute-and-earn` (shares failing are high among refugees and BN(O)s whom it says it values).
- **Likely status:** well-supported as the best available estimate; shares are implied, not computed per condition.

### D28. Evidence on whether settlement rules change behaviour (Denmark, Germany, Sweden)
- **Source:** Arendt, Dustmann and Ku, *Refugee Migration and the Labor Market: Lessons from 40 Years of Post-arrival Policies in Denmark*, CReAM DP 09/22, https://cream-migration.org/publ_uploads/CDP_09_22.pdf (review); underlying: Arendt, Dustmann and Ku, "Permanent Residency and Refugee Immigrants' Skill Investment", *Journal of Labor Economics* (2023/24), https://www.journals.uchicago.edu/doi/full/10.1086/726433 (blocked); Kilström, Larsen and Olme (2018); Gathmann and Keller (2018); Blomqvist, Thoursie and Tyrefors (2018).
- **Shape:** quasi-experimental studies (records of effects).
- **What it shows (read, PDF):** Denmark 2002 (wait 3→7 years plus language test): no significant effect on employment or earnings seven years in; more education enrolment among women and the low-skilled. Denmark 2007 (2.5 years' full-time work and a harder language test added to 7 years): **reduced work hours ~30%** (FTE) and no effect on passing language tests, driven by low performers; high performers unaffected or improved. Germany (naturalisation wait 15→8 years): no effect for men, higher employment for women. Sweden 2016 (temporary vs permanent): less language-course take-up, no employment effect in year one.
- **Helps:** `keep-our-word` (harsh conditions can reduce work among those who doubt they can meet them). `contribute-and-earn` (well-calibrated conditions can raise effort among those able to meet them). **Hurts:** `contribute-and-earn` and `end-settlement` (the assumption that a tougher test produces more contribution failed for low performers in Denmark). All evidence is on refugees and family migrants, not workers' choice of country.
- **Likely status:** complicated: transferable only with care; no evidence on destination choice or departures.

### D29. House of Commons Home Affairs Committee, *Earned Settlement: Examining the Government's proposed reforms*
- **Source:** HAC, Sixth Report of Session 2024–26 (13 Mar 2026), https://publications.parliament.uk/pa/cm5901/cmselect/cmhaff/1409/report.html (403 direct; read via web.archive.org raw copy).
- **Shape:** record (inquiry report with evidence).
- **What it shows (read):** summary of the proposals (10-year baseline; 15 for medium-skilled; 20 for refugees; B2 English; £12,570 earnings for 3–5 years; deductions and additions). The £12,570 requirement "is likely to make hundreds of thousands of people currently on routes to settlement ineligible", and could disadvantage BN(O)s who rely on savings. Skilled Worker dependants' median £30,200, Health and Care dependants £22,100, so most dependants would not get the 5-year reduction; 73% of Skilled Worker dependants are women, 72% of Health and Care dependants men. Applying changes to people already here: "not unprecedented"; "extending routes ... for at least some people already in the UK is essential" to the government's aim, but it is hard to justify for pre-2021 arrivals; recommends transitional arrangements. Delaying care workers' settlement gives "short-term direct fiscal savings ... but risks increasing exploitation and poverty". NRPF support by 91 councils cost £94m in 2024/25. UKVI visa fees recovered 256% of cost. Home Secretary: "616,000 people arrived" against an expected 6,000–40,000; committee notes the estimates were per year and of workers only. Two amendments opposing retrospective changes were tabled in committee (outcome to check).
- **Helps:** `keep-our-word` (cross-party committee warns against retroactivity for pre-2021 arrivals and on BN(O)); `contribute-and-earn` (committee accepts the case for applying to some people already here). **Hurts:** `contribute-and-earn` (exploitation and poverty risks; dependants' penalty); `keep-our-word` (committee says changes for current migrants are not unprecedented and partly necessary).
- **Likely status:** well-supported record.

### D30. Status of earned settlement, October 2026 (record)
- **Source:** CP 1448 (D6); HAC (D29); EIN, *Home Secretary tells MP earned settlement policy will be set out later this year* (24 Sep 2026), https://www.ein.org.uk/news/home-secretary-tells-mp-earned-settlement-policy-will-be-set-out-later-year ; OTS Solicitors, *Earned Settlement After Labour Conference 2026* (22 Oct 2026), https://www.otssolicitors.co.uk/news/earned-settlement-after-labour-conference-2026-what-has-changed-for-ilr
- **Shape:** dated record.
- **What it shows:** consultation 20 Nov 2025 – 12 Feb 2026 (read, D29). As of 2 Oct 2026 no consultation response, no Statement of Changes, no commencement date and no transitional provisions published; Skilled Worker 5-year rules still apply (read, OTS). On ~23 Sep 2026 Mahmood told HAC "Later this year we will set out the new policy on settlement"; options range from "passporting certain cohorts through" on five years to phased approaches; "a large group of people who arrived in 2022, absent any change, would qualify in February 2027" (read, EIN). The outline's "1 March 2026" statement was not found; a secondary source dates a confirmation to 5 March 2026 (***unverified***). CP 1448 already stated (Nov 2025) the intent to apply to everyone without ILR (read, D6).
- **Helps:** `keep-our-word` (protection for some cohorts is openly under consideration). **Hurts:** `contribute-and-earn` (a year after the proposal, nothing is in the Rules, while the wave starts qualifying in Feb 2027).
- **Likely status:** well-supported; must be re-checked just before publication.

---

**Economics**


### D50. ONS: GDP per head, chained volume (series IHXW)
- **Source:** ONS, *GDP first quarterly estimate / quarterly national accounts*, dataset PN2, series IHXW, "Gross domestic product (Average) per head, CVM market prices (reference year = 2023)". CSV: https://www.ons.gov.uk/generator?format=csv&uri=/economy/grossdomesticproductgdp/timeseries/ihxw/pn2 . The release date in the file is 13 Aug 2026; the next release was 30 Sep 2026, so stage 5 should re-download.
- **Measures:** real GDP divided by population. It excludes income per head (GNI) and distribution. The population denominator was revised with the November 2025 migration revisions.
- **Coverage:** annual 1996–2025; quarterly to 2026 Q2. No comparators in the same source.
- **Shape:** series.
- **Slices:** none (UK only).
- **What it shows (read, own calc; as of 13 Aug 2026):**
  - £32,945 in 2000; £37,625 in 2007; £40,125 in 2019; £40,554 in 2022; £40,153 in 2024; £40,546 in 2025.
  - Growth was 1.92% a year in 2000–07, 1.26% in 2010–19, 0.17% in 2019–25, and −0.01% in 2022–25.
  - The quarterly series fell from 10,082 (2023 Q1) to 9,948 (2023 Q4), then rose to 10,234 in 2026 Q2.
- **Helps:** `economic-cost` (GDP per head was flat in exactly the high-migration years). **Hurts:** `economic-cost` (on its own it cannot separate migration from the pandemic, the energy shock and interest rates; growth resumed in 2024–26 while migration was still high). `open-and-build` concedes this.
- **Likely status:** well-supported as description; causal attribution not.

### D51. World Bank WDI: GDP per capita, constant 2015 US$ (NY.GDP.PCAP.KD), G7
- **Source:** World Bank API, last updated 8 Oct 2026. https://api.worldbank.org/v2/country/GBR;USA;DEU;FRA;ITA;JPN;CAN/indicator/NY.GDP.PCAP.KD?format=json&date=2007:2024
- **Measures:** real GDP per person at market exchange rates. The OECD's PPP series is the better comparator; I did not fetch it.
- **Coverage:** 1960–2024, all countries.
- **Shape:** cross-country series.
- **What it shows (read, own calc; as of 2024):**

  | Country | Growth a year, 2007–19 | Growth a year, 2019–24 |
  |---|---|---|
  | UK | 0.54% | 0.01% |
  | Canada | 0.57% | −0.02% |
  | Germany | 1.14% | −0.09% |
  | France | 0.53% | 0.50% |
  | Japan | 0.57% | 0.61% |
  | Italy | −0.50% | 1.41% |
  | US | 1.00% | 1.83% |

- **Helps:**
  - `economic-cost`: Canada, the other G7 country with a migration surge in 2022–24, was also flat per head.
  - `open-and-build`: Germany, with a smaller recent surge (*unverified*: it had a 2015–16 and 2022 Ukraine inflow), was also flat after its energy shock, so flat GDP per head is not peculiar to high migration.
- **Hurts:** each of these for the reason the other gives. Net migration per head for the same countries must be added (from OECD; it may already be in another agent's candidates on levels).
- **Likely status:** complicated; a comparator, not a causal test.

### D52. OBR, *Economic and fiscal outlook – March 2024*, Box 2.3 and the Chapter 4 migration box
- **Source:** OBR, March 2024 EFO (CP 1046). https://obr.uk/docs/dlm_uploads/E03057758_OBR_EFO-March-2024_Web-AccessibleFinal.pdf (read via Wayback, 2024-03-06).
- **Measures:** five-year scenarios with net migration 200,000 a year higher or lower, giving a population 1 million higher or lower in 2028–29, and their effects on GDP, GDP per person, receipts, spending and borrowing.
- **Coverage:** 2023–24 to 2028–29; a single forecast round.
- **Shape:** record (a model scenario).
- **Slices:**
  - Productivity: migrants as productive per hour as residents; capital does not adjust; high participation.
  - Spending: departmental spending unadjusted, or adjusted for population.
- **What it shows (read, PDF; as of March 2024):**
  - **Higher migration (net 515k in 2028–29), same productivity:** GDP is 1.5% higher; GDP per person is "largely unchanged".
  - **If the capital stock does not adjust:** GDP is 1% higher; GDP per person is 0.4% lower.
  - **With about 90% participation (nearly all adults on work visas):** GDP is 2.2% higher and GDP per person 0.8% higher.
  - **The low scenario (net 115k) is symmetric.**
  - **Fiscal, unadjusted spending:** receipts are £18.0bn higher; borrowing £19.9bn lower; debt 3.1% of GDP lower in 2028–29. Low migration: borrowing £19.9bn higher.
  - **Fiscal, spending per person held:** equivalent services would cost an extra £6.1bn; borrowing is then £13.1bn lower and debt 2.5% of GDP lower (symmetric for low migration).
  - **Spending per person:** the government had not adjusted departmental limits for population, so implied real public-service spending per person had fallen since October 2021. The upward migration revision alone cut departmental spending per person by £40 in 2028–29.
- **Helps:**
  - `open-and-build`: lower migration raises borrowing.
  - `blame-underinvestment`: spending per head was not raised with population.
  - `economic-cost`: GDP per person does not rise with migration, and falls if capital does not keep up.
- **Hurts:**
  - `economic-cost`: on the OBR's numbers, cutting migration worsens the five-year finances.
  - `open-and-build`: the gain is in total GDP, not GDP per person, and it shrinks once services are funded.
- **Likely status:** well-supported as "the OBR's scenarios show…". Stage 5: the FRS 2024 text says Box 2.3 and Box 4.5; confirm the box numbers.

### D53. OBR forecast revisions: March 2025 EFO, November 2025 EFO, March 2026 EFO, and "Forecasting net migration" (Sep 2026)
- **Source:**
  - March 2025 EFO: https://obr.uk/docs/dlm_uploads/OBR_Economic_and_fiscal_outlook_March_2025.pdf (Wayback, 2025-03-26).
  - November 2025 EFO: https://obr.uk/docs/dlm_uploads/OBR_Economic_and_fiscal_outlook_November_2025.pdf (Wayback, 2025-11-26).
  - March 2026 EFO: https://obr.uk/efo/economic-and-fiscal-outlook-march-2026/ (blocked; not archived).
  - OBR article, E. Robson, 3 Sep 2026: https://articles.obr.uk/forecasting-net-migration/index.html
- **Measures:** OBR net migration forecasts and their effects on the adult population, labour supply and potential output.
- **Coverage:** forecast rounds since 2010 (only these were read).
- **Shape:** a record of forecast revisions.
- **What it shows:**
  - **March 2025 (read, PDF):**
    - Net migration was revised up to a peak of 906,000 in the year to mid-2023.
    - The forecast falls from 728,000 (mid-2024) to a trough of 258,000 (mid-2027), then 340,000 (the ONS migration-category variant).
    - Home Office fees were forecast at £5.8bn in 2024–25, falling to £5.7bn by 2029–30 "due to lower gross migration".
  - **November 2025 (read, PDF):**
    - Net migration fell from a record 873,000 (2022) to 431,000 (2024), with about 262,000 expected in the year to mid-2026.
    - The forecast was **unchanged from March**: White Paper cuts to immigration were offset by higher stay rates.
    - Footnote: revised ONS data put the peak at 891,000 and 2024 at 345,000, about 110,000 below the March expectation. Settlement (ILR) consultations are listed as a risk.
    - Net migration gives about three-quarters of adult population growth.
  - **March 2026:**
    - Net migration is expected to average 235,000 a year in 2026–30, down from 295,000 in November, driven by more British emigration. The adult population is about 200,000 lower by 2030. Potential output growth is 0.1 percentage points a year lower, and the level of potential output 0.25% lower in 2030 (read, secondary: Irish News/PA, 3 Mar 2026, https://www.irishnews.com/news/uk/lower-net-migration-could-hold-back-uk-growth-potential-obr-finds-ZYLW2AHJXFNCHOARCXCC5K3UOQ/).
    - British nationals' net migration is assumed to return to about −85,000, and EU nationals' to rise to zero by 2028. Migration gives about two-thirds of adult population growth (read, OBR article).
    - The borrowing effect of the March 2026 revision was **not found**.
- **Helps:** `open-and-build` (the OBR does lower potential output as migration falls). **Hurts:** `open-and-build`, since the revisions are small (0.25% of potential output), and November 2025 made no net change; the borrowing claim rests on D52's 2024 scenario more than on actual revisions. `economic-cost`: nothing in these numbers is per head.
- **Likely status:** well-supported for the March 2026 figures once the EFO is quoted; the human may need to download it.

### D54. OBR, *Fiscal risks and sustainability – September 2024*, chapter 4 (with the correction slip of 14 Nov 2024), and the supplementary release of 6 Mar 2025
- **Source:**
  - FRS 2024 corrected version: https://obr.uk/docs/dlm_uploads/Fiscal-risks-and-sustainability-report-September-2024-1.pdf (Wayback, 2024-11-16).
  - Supplementary release: https://obr.uk/docs/dlm_uploads/FRS-migration-supplementary-forecast-information-release-Mar-2025.pdf (Wayback).
- **Measures:**
  - The cumulative lifetime fiscal impact of a representative migrant arriving at 25 on low wages (the 25th percentile of first-year migrant pay, about 50% below the UK average, paying 22% of average taxes), average wages, or high wages (the 75th percentile, about 30% above the average, paying 144% of average taxes), against a representative UK resident.
  - It assumes no welfare for five years, £12,500 in visa fees and health charges, and £20,000 of public capital per new arrival.
  - It excludes dependants (0.3 dependants per main applicant in 2021–23).
  - Separately: the long-run length-of-stay scenario and the old-age dependency ratio.
- **Coverage:** to 2073–74.
- **Shape:** record (a stylised model).
- **What it shows (read, PDF; as of Sep 2024, chart corrected Nov 2024):**
  - **Average-wage migrant arriving at 25:** a net contributor "by their second year". A UK resident of the same age becomes one only in their 40s, because the migrant did not consume UK childhood education and health.
  - **High-wage migrant:** "a net benefit… even if they lived to 100".
  - **Low-wage migrant on half the average wage:** becomes "less fiscally beneficial… than the average UK resident in their early 40s". The correction made the low-wage migrant "significantly less fiscally beneficial, and substantially so at older ages".
  - **Values are on the chart only.** The cumulative axis runs to −£2,000k. A commentator's £1.55m net lifetime cost for a low-wage migrant and £405k for an average-wage one (Liam Halligan, Substack) are ***unverified*** and must be read off the chart data.
  - **Length-of-stay scenario:** half of migrants leave after three years. Primary spending is then 1.7% of GDP lower by 2073–74, and debt 251% of GDP instead of 274%.
  - **Old-age dependency ratio** (65+ to 16–64): 31% in 2023, about 47% in the long term; higher migration lowers it in every year compared with FRS 2022.
  - **FRS 2023 (via D57):** net migration of 245k rather than 129k a year cuts the primary deficit by 1.1% of GDP and debt by 30 percentage points by 2072–73. Debt still rises from about 100% to 300% of GDP.
- **Helps:**
  - `economic-cost` and `end-settlement`: low-wage arrivals are lifetime net costs, worse than the average resident; old-age costs drive this.
  - `contribute-and-earn`: earnings decide the result.
  - `open-and-build`: average- and high-wage migrants beat the average resident; adult arrivals avoid childhood costs.
- **Hurts:**
  - `end-settlement`: temporary stays are best fiscally, but the model is stylised, ignores dependants and assumes the same use of public services.
  - `open-and-build`: low-wage migration is a cost; migration delays rather than solves ageing (OBR 2013 via D57).
- **Likely status:** well-supported as "an OBR illustration"; the human must extract the chart values.

### D55. Migration Advisory Committee, *The Fiscal Impact of Immigration: Static and Dynamic Estimates for the UK* (Dec 2025)
- **Source:** MAC, published 11 Dec 2025. https://assets.publishing.service.gov.uk/media/6938108633c7ace9c4a41e42/The_Fiscal_Impact_of_Immigration_Final__1_.pdf
- **Measures:**
  - The present-value lifetime net fiscal contribution of the 2022/23 Skilled Worker cohort (329,200 people, including Health and Care Worker visas and dependants).
  - Uses an HMRC–visa linked match for earnings, a 3.0% real discount rate and 1.8% real growth.
  - Excludes other routes (family, students, Graduate, humanitarian) and children born in the UK later. Children who stay over 8 years are treated as UK children.
- **Coverage:** one cohort; sensitivity tables.
- **Shape:** record or snapshot (a model estimate).
- **Slices:** main applicant or dependant; Skilled Worker excluding health and care vs Health and Care; care workers vs other health and care workers; entry-wage decile; stayers vs leavers.
- **What it shows (read, PDF; as of Dec 2025):**
  - **Whole cohort:** +£47.1bn, or +£143k per migrant, "almost entirely driven by main applicants working outside of Health and Care".
  - **Skilled Worker main applicants (excluding health and care):** +£689k each. Stayers are +£931k and leavers +£174k. The top 10% of earners (salary at least £131k) give 39% of the gain; the bottom 10% give 1%. The top 30% give 72%.
  - **Health and Care main applicants:** +£54k each. Care workers are −£36k each (−£2bn in total); other health and care occupations are +£166k (+£7.5bn).
  - **Adult dependants:** Skilled Worker dependants +£3k each (−£700m in aggregate); Health and Care dependants −£67k. First-year employment of dependants is 44%. Low scenario: −£43k and −£92k.
  - **UK residents (the denominator):** mean −£39k, median −£145k. Working-age residents are +£4k. Age-matched comparators: +£117k mean, −£47k median.
  - **Static:** UK resident adults +£3,400 per person in 2022/23; a £402-per-person primary deficit overall.
  - **Discount rate matters:** at 1% the resident mean becomes −£163k; with 0% real growth it is −£8k.
- **Helps:**
  - `contribute-and-earn`: the gain is concentrated among high earners; care workers are negative.
  - `economic-cost`: low-paid routes and their dependants are net costs.
  - `open-and-build`: the cohort as a whole is strongly positive; even care workers are about the median resident.
  - `keep-our-word`: stayers on the main route contribute most, so settling them keeps the contribution.
- **Hurts:**
  - `end-settlement`: for high earners, leaving loses revenue (£931k vs £174k).
  - `economic-cost`: the Skilled Worker route is "clearly fiscally positive".
  - `open-and-build`: care workers and Health and Care dependants are negative.
- **Likely status:** well-supported, narrowed to "the MAC's model of the 2022/23 Skilled Worker cohort".

### D56. Migration Advisory Committee, *EEA migration in the UK: final report* (Sep 2018)
- **Source:** MAC, September 2018. https://assets.publishing.service.gov.uk/media/5ba26c1de5274a54d5c39be2/Final_EEA_report.PDF
- **Measures:** a review plus new analysis of EEA migration's effects on wages, employment, productivity, house prices, public finances and public services. It includes the Oxford Economics commissioned fiscal study.
- **Coverage:** studies to 2018; LFS 1993–2017 update of Dustmann, Frattini and Preston.
- **Shape:** record (an evidence review).
- **What it shows (read, PDF):**
  - **Wages:** "not a major determinate of the wages of UK-born workers"; "lower-skilled workers face a negative impact while higher-skilled workers benefit… generally small".
    - Nickell & Saleheen (2015): a 1-point rise in the migrant share lowers average wages by just under 0.1%. In semi- and unskilled services, a 10-point rise gives −1.9% (earlier −5.2%), of which about 0.5% is a compositional effect.
    - Dustmann, Frattini & Preston (2013): −0.6% at the 5th percentile, −0.5% at the 10th, positive above.
    - Manacorda, Manning & Wadsworth (2012): effects fall mostly on earlier immigrants.
    - Becker & Fetzer (2018): a median local shock is linked to about −0.5%.
  - **House prices:** migration "has increased house prices", more where planning is restrictive.
  - **Public finances:** EEA migrants pay more in taxes than they receive in benefits. The break-even household income is about £30,000.
  - **Public services:**
    - EEA migrants contribute more to health and care than they use; "no evidence that migration has reduced the quality of healthcare".
    - No evidence of reduced school choice or attainment.
    - Migrants are a small but rising share of new social tenants, "inevitably at the expense of other potential tenants".
  - **Productivity:** positive but uncertain; high-skilled migrants contribute to innovation.
- **Helps:**
  - `open-and-build`: small wage effects, positive for EEA fiscal impact, no harm to services.
  - `contribute-and-earn`: selection on earnings would raise the gains.
  - `economic-cost`: house prices, social lettings, low-wage effects.
- **Hurts:** `economic-cost` (on wages and services); `open-and-build` (on house prices and effects at the bottom of the pay scale). The evidence covers EEA free movement before Brexit.
- **Likely status:** well-supported, dated 2018.

### D57. Migration Observatory, *The Fiscal Impact of Immigration in the UK* (briefing, 23 Jun 2026)
- **Source:** Vargas-Silva, Sumption, Brindle. https://migrationobservatory.ox.ac.uk/resources/briefings/the-fiscal-impact-of-immigration-in-the-uk/ ; PDF https://migrationobservatory.ox.ac.uk/wp-content/uploads/2026/06/2026-Briefing-The-fiscal-impact-of-immigration-to-the-UK.pdf
- **Measures:** a review of UK estimates, and a table of past static and cumulative estimates.
- **Coverage:** studies 1995–2025.
- **Shape:** record.
- **What it shows (read, PDF):**
  - **Oxford Economics 2018:** a single 20-year-old breaks even at just over £10,000 a year; a couple with two children at about £45,000. FY 2016/17: EEA +£4.7bn, non-EEA −£9.0bn, UK-born −£41.4bn (column mapping to confirm).
  - **Dustmann & Frattini (1995–2011):** EEA +£4.4bn, non-EEA −£118bn, UK-born −£591bn.
  - **Rowthorn (2014) and Migration Watch (2014, 2016):** more negative. Migration Watch 1995–2011: EEA −£13.6bn, non-EEA −£134.9bn.
  - **Pre-Brexit totals:** typically under 1% of GDP.
  - **No good post-Brexit total:** "There is not yet a high-quality estimate for the total fiscal impact of migration under the post-Brexit immigration system" (read, secondary, quoting Sumption).
  - **Public-service use:** there is almost no data on migrants' use of public services; most studies assume the same use as UK-born people of the same age.
- **Helps:** `open-and-build` (impacts are small, and positive for workers). **Hurts:** `economic-cost`, where it rests on totals (all studies are small relative to GDP). `open-and-build`: Migration Watch and Rowthorn are negative for non-EEA migrants; the sign depends on assumptions.
- **Likely status:** well-supported as a range of estimates.

### D58. Merged into D18

### D59. Reform UK, "Boriswave" cost report (April 2026): £622bn
- **Source:** a 21-page Reform UK document launched by Farage and Yusuf (about 15 Apr 2026). The original was not found. Critiques: Byline Times, 16 Apr 2026, https://bylinetimes.com/2026/04/16/economists-slam-reform-uks-fantasy-claims-that-boriswave-migrants-will-cost-households-20000/
- **Measures:** the claimed real-terms cost to 2085 of about 1.6 million 2020–24 arrivals.
- **Shape:** record (a claim).
- **What it shows (read, secondary):**
  - **The claim:** £622bn, about £20,000 per household, undiscounted. Reform's own report gives £154bn at the Green Book 3.5% discount rate.
  - **Method:** cohorts are mapped to "very rough proxies" of taxes and benefits by ONS income quintile.
  - **Critics:**
    - Sumption: no standard discounting.
    - Portes: "simply invented their own numbers for migrant earnings", ignoring the MAC's HMRC analysis.
    - Marley Morris (IPPR): misses high earners; counts children's education but not their later taxes.
  - **Reform's reply:** the assumptions are "entirely defensible".
- **Helps:** `end-settlement` (it is the party's current figure). **Hurts:** `end-settlement` (on Reform's own discounted figure the cost is £154bn; method criticised by named economists).
- **Likely status:** fails as stated; obtain the report itself.

### D60. Home Office, *Sponsored work and family visa earnings, employment and Income Tax* (12 May 2025)
- **Source:** https://www.gov.uk/government/publications/sponsored-work-and-family-visa-earnings-employment-and-income-tax/sponsored-work-and-family-visa-earnings-employment-and-income-tax
- **Measures:**
  - PAYE earnings, employment and income tax in 2023/24 for people aged 18–65 granted visas from April 2019 to March 2023.
  - Uses Home Office–HMRC linked data; 93% matched.
  - Excludes self-employment and National Insurance; employment rates are minimums.
- **Coverage:** one financial year. No later edition was found.
- **Shape:** snapshot.
- **Slices:** route; main applicant or dependant; entry clearance or extension; care occupations.
- **What it shows (read; FY 2023/24):**
  - **Median earnings:**
    - Skilled Worker: £56,600 (dependants £30,200).
    - Health and Care: £30,900 (dependants £22,100); extensions £34,900.
    - Care workers and home carers: £23,100; senior care workers: £25,800.
    - Senior or Specialist: £47,900.
    - Family visas: £20,200 (extensions £21,300).
  - **Minimum employment:** Skilled Worker main applicants ≥75%, dependants ≥45%; Health and Care ≥81% and ≥67%; Family ≥48%.
  - **Median income tax:** £9,100 per Skilled Worker; £3,500 per Health and Care worker; £1,500 per family visa holder.
- **Helps:** `contribute-and-earn` and `economic-cost` (low earnings on the care and family routes). `open-and-build` (Skilled Workers earn well above the UK median, about £37k; *unverified*, from ONS ASHE).
- **Hurts:** `end-settlement` (most work: high employment on work routes). `open-and-build` (the family route earns about £20k).
- **Likely status:** well-supported snapshot.
- **Merged from D15 and D117:** mean Income Tax £24,800 (Skilled Worker) and £4,000 (Health and Care), against £7,800 for the average UK taxpayer (not directly comparable); at least 84% of care-worker main applicants have PAYE earnings (read). Also **hurts** `keep-our-word`: about half of Skilled Worker dependants and family entrants show no PAYE earnings. Not a measure of ILR holders.

### D61. Migration Observatory, *Upward mobility? Earnings trajectories for recent immigrants* (updated 29 May 2026), from HMRC PAYE RTI by nationality and entry cohort
- **Source:** Brindle, Sumption, Portes. https://migrationobservatory.ox.ac.uk/resources/commentaries/upward-mobility-earnings-trajectories-for-recent-immigrants . Data: HMRC RTI via FOI ("HMRC RTI earnings by nationality (2026)").
- **Measures:** median pay of payrolled employees by EU or non-EU nationality and year of first payroll entry, relative to all UK employees. It does not distinguish full-time from part-time, covers no self-employed, and has no route or age breakdown.
- **Coverage:** cohorts 2015–2025, data to December 2025.
- **Shape:** series by cohort.
- **What it shows (read; as of Dec 2025):**
  - Non-EU cohorts of 2021–23 earned about 95% of the UK median after one full year; the 2024 cohort earned 90%.
  - 2021 and 2023 entrants passed the median after two years; 2015 entrants took about six.
  - Entry-year relative pay fell sharply for the 2025 cohort.
  - 60% of non-EU and 45% of EU 2015 entrants were still on payroll in 2025.
- **Helps:** `open-and-build` and `keep-our-word` (fast catch-up for recent non-EU cohorts). `economic-cost` (the 2024–25 cohorts start lower).
- **Hurts:** `end-settlement` (the 2021–23 "Boriswave" cohorts out-earn the median within two years, on this measure). Neil O'Brien argues the all-age comparison flatters migrants, who are younger (***unverified***, https://www.neilobrien.co.uk/p/new-data-on-migrants-earnings).
- **Likely status:** complicated: payroll medians are not routes.

### D62. Migration Advisory Committee / University of Greenwich, *Migration and housing costs: what does international evidence imply for the UK?* (19 Jun 2026)
- **Source:** Rabensteiner, Sangwan, Tasciotti. https://www.gov.uk/government/publications/migration-and-housing-costs-what-does-international-evidence-imply-for-the-uk/migration-and-housing-costs-what-does-international-evidence-imply-for-the-uk-accessible
- **Measures:** a meta-review of estimates of how house prices and rents respond to the immigrant population share, applied illustratively to the UK.
- **Coverage:** international studies; the UK's foreign-born share rose from 7% to 17%.
- **Shape:** record (a review).
- **What it shows (read):**
  - **Response per 1-point rise in the immigrant share:** house prices median +0.36% (+0.65% in UK-like countries); rents median +0.64% (+0.81%).
  - **UK application:** immigration explains "approximately 4–6%" of the roughly 150% real house-price rise; the report calls this "highly simplified".
  - **"No UK analysis of immigration and rents"** appears to exist.
  - **Sá (2015):** for UK local authorities, a 1-point rise is linked to −1.7% in house prices, via native out-migration. MAC 2018 found positive effects; Braakmann (2019) found falls only at the bottom of the distribution.
  - **Supply and scale:** effects are larger where supply is inelastic and at regional rather than neighbourhood scale.
  - **Construction labour:** migrants are about 46% of construction employment in London.
- **Helps:** `open-and-build` and `blame-underinvestment` (a small share; supply and planning dominate). `economic-cost` (the effect is positive, and larger in rents and where building lags).
- **Hurts:** `economic-cost` ("most of the rise" is not supported). `open-and-build` (the effect is real and positive).
- **Likely status:** well-supported, narrowed to "an illustrative MAC-commissioned estimate".

### D63. ONS, Price Index of Private Rents (PIPR) and UK HPI, *Private rent and house prices, UK: October 2026* (21 Oct 2026)
- **Source:**
  - Bulletin: https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentandhousepricesuk/latest
  - Dataset: https://www.ons.gov.uk/file?uri=/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/21october2026/priceindexofprivaterentsukmonthlypricestatistics.xlsx
- **Measures:** private rents for new and existing tenancies; official statistics since 20 May 2026.
- **Coverage:** January 2015 – September 2026; UK nations, regions and local authorities.
- **Shape:** series with regional comparison.
- **What it shows (read; read, own calc for the peak):**
  - The UK average rent was £1,406 in September 2026, up 3.8% on a year.
  - Annual rent inflation peaked at 9.1% in March 2024. It was 8.7% in January 2025, 5.5% in September 2025, and 3.3–3.8% through 2026.
  - The average rent level rose from £1,216 (January 2024) to £1,406.
  - Regions: highest growth in the North West (5.7%); lowest in London and the South East (3.5%).
  - House prices rose 0.9% to £273,000 in the year to August 2026; London −2.2%.
- **Helps:**
  - `open-and-build`: rents did not fall when migration fell about four-fifths.
  - `economic-cost`: rent growth more than halved as net migration fell from about 900k to about 200k.
- **Hurts:** each side's version of the claim. The timing also matches Bank Rate cuts and the end of post-pandemic catch-up; nothing here separates the causes.
- **Likely status:** the description is well-supported; the cause is not.

### D64. MHCLG, *Housing supply: net additional dwellings, England: 2024 to 2025* (20 Nov 2025)
- **Source:** https://www.gov.uk/government/statistics/housing-supply-net-additional-dwellings-england-2024-to-2025/housing-supply-net-additional-dwellings-england-2024-to-2025
- **Measures:** net change in the dwelling stock in England.
- **Coverage:** 1991–92 to 2024–25 (Table 1); England only.
- **Shape:** series.
- **What it shows (read):**
  - 1990s: 148,000–166,000 a year.
  - Trough of 130,610 in 2012–13; peak of 248,590 in 2019–20.
  - 234,290 in 2022–23; 221,410 in 2023–24; 208,600 in 2024–25 (0.81% of the stock).
- **Helps:** `economic-cost` (building fell as population growth peaked). `open-and-build` and `blame-underinvestment` (building has run below what household projections need for decades; see D65).
- **Hurts:** none directly. Population and household denominators are needed from D65.
- **Likely status:** well-supported.

### D65. ONS, *Household projections for England: 2022-based* (28 Oct 2025), and *Population estimates: mid-2025* (1 Oct 2026)
- **Source:**
  - Household projections: https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationprojections/bulletins/householdprojectionsforengland/2022based
  - Population estimates: https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/annualmidyearpopulationestimates/latest
- **Measures:** projected households under the migration-category variant (plus five-year, ten-year and high-migration variants), and population change by component.
- **Coverage:** households 2022–2047, England, by local authority; population from mid-1949 to mid-2025.
- **Shape:** projection (series); population series.
- **What it shows:**
  - **Households (read, secondary via search):** 23.5m (2022) to 25.9m (2032), about 240,000 a year. The 2018-based projections had 158,000 a year.
  - **No zero-migration household variant** was found, so the migration share of household growth is not given.
  - **Population (read):**
    - Net international migration was 222,900 in the year to mid-2025: immigration 886,200 (down from 1,296,500), emigration 663,400.
    - Births 652,400, deaths 647,500.
    - Net migration contributed most to population growth every year since mid-1999 except 2012.
- **Helps:** `economic-cost` (migration drives population growth; projected household growth exceeds building, 240k against 209k). `open-and-build` (the shortfall predates the surge).
- **Hurts:** neither directly.
- **Likely status:** well-supported for projections. The migration share of household growth needs the ONS variant data or an older DCLG figure (see 3d).

### D66. Migration Observatory, *Migrants and housing in the UK: experiences and impacts* (4 Dec 2024, since updated)
- **Source:** https://migrationobservatory.ox.ac.uk/resources/briefings/migrants-and-housing-in-the-uk-experiences-and-impacts/
- **Measures:** tenure and housing outcomes by country of birth (Census 2021, England and Wales; UKHLS; CORE lettings).
- **Shape:** snapshot, plus a 2007/08–2022/23 lettings series.
- **What it shows (read):**
  - **Tenure:** about a third of private renters were born abroad in 2021, against about 10% of owner-occupiers and 15% of social renters. 61% of people born in post-2004 EU accession countries rent privately.
  - **Home ownership:** 17% for arrivals within the last 5 years, 68% for those here 20+ years, 67% for the UK-born.
  - **Social housing:** non-UK nationals took 6% of new social lettings in 2007/08 and 10% in 2022/23.
- **Helps:** `economic-cost` (migrant demand concentrates in private renting, where rents are set). `open-and-build` (long-settled migrants own homes at UK-born rates).
- **Hurts:** `economic-cost`'s social-housing argument (non-UK nationals take a small share of new lets). `end-settlement` (the same).
- **Likely status:** well-supported.

### D67. NHS Digital, *General practice workforce* (monthly), via the Nuffield Trust staffing tracker
- **Source:**
  - Tracker: https://nuffieldtrust.org.uk/nhs-staffing-tracker/general-practice (data June 2026).
  - Primary: https://digital.nhs.uk/data-and-information/publications/statistical/general-and-personal-medical-services (blocked by Cloudflare).
- **Measures:** FTE GPs and other practice staff; patients per GP.
- **Coverage:** consistent data since 2015.
- **Shape:** series.
- **What it shows (read, secondary; as of June 2026):**
  - 30,183 fully qualified FTE GPs in England: +1,381 in a year, +2,382 since December 2019.
  - Other practice health professionals are +37,108 since December 2019.
  - Earlier (Nuffield): 1,963 fewer fully qualified GPs in March 2024 than in March 2016 (***unverified***).
  - Needs-weighted patients per GP ranges from 2,566 (North East London) to 1,798 (Bristol) by ICB.
- **Helps:** `economic-cost` (fewer GPs per patient over 2016–24, as the population grew). `blame-underinvestment` (staffing, not only population).
- **Hurts:** `economic-cost` (GP numbers have risen since 2019).
- **Likely status:** complicated. Stage 5 needs registered patients and FTE by month, 2015–2026.

### D68. DfE, *Schools, pupils and their characteristics: academic year 2025/26* (4 Jun 2026, updated 16 Oct 2026)
- **Source:** https://explore-education-statistics.service.gov.uk/find-statistics/school-pupils-and-their-characteristics
- **Measures:** pupil numbers in England (January census), the share with English as an additional language (EAL), and class sizes.
- **Coverage:** annual series. The range was not checked; earlier releases go back to the 2000s.
- **Shape:** series.
- **What it shows (read; as of January 2026):**
  - Over 8.9m pupils: −112,200 (−1.2%) on a year, projected to keep falling to 2030.
  - 21.6% EAL (23.8% primary, 19.3% secondary); EAL is "not a measure of English language proficiency".
  - Average class size: 26.1 primary, 22.6 secondary.
- **Helps:** `open-and-build` and `blame-underinvestment` (school rolls are falling nationally despite high migration).
- **Hurts:** `economic-cost`'s school-pressure argument at national level. Local pressure is possible; pupil numbers by local authority are needed.
- **Likely status:** well-supported. It undercuts the outline's "pressure on… schools" if stated nationally.

### D69. ONS, *National population projections: 2024-based* (28 Apr 2026), with migration variants
- **Source:** ONS dataset Z1, 2024-based. https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/populationprojections/datasets/z1zippedpopulationprojectionsdatafilesuk/2024based/uk1.zip
  - Files: `uk_ppp` (principal), `uk_pph` (high migration), `uk_ppl` (low migration), `uk_ppz` (zero net migration).
  - The 2022-based bulletin (28 Jan 2025) gave 278 people of pensionable age per 1,000 working age in 2022, rising to 302 by 2047.
- **Measures:** projected population by single year of age, 2024–2124, under different long-term net migration assumptions. My ratio is people 65+ per 1,000 aged 16–64, **not** the ONS state-pension-age measure.
- **Shape:** projection with variants.
- **What it shows (read, own calc):**

  | Variant | Long-term net migration | Population 2074 | 65+ per 1,000 aged 16–64: 2024 → 2035 → 2050 → 2074 → 2100 |
  |---|---|---|---|
  | Principal | 230k | 71.4m | 302 → 366 → 410 → 525 → 602 |
  | High | 455k | 86.2m | 302 → 353 → 373 → 457 → 533 |
  | Low | 105k | 63.2m | 302 → 374 → 435 → 580 → 670 |
  | Zero | 0 | 56.0m | 302 → 382 → 461 → 641 → 764 |

  - The principal long-term assumption fell from 340k (2022-based) to 230k.
  - ONS letter to the Lords (7 May 2025; read): holding the ratio at 278 needs a pension age of 68 in the early 2030s, 69 later in the 2030s and 70 in the 2040s. https://uksa.statisticsauthority.gov.uk/wp-content/uploads/2025/07/LEAC-follow-up-letter-060525.pdf
- **Helps:** `open-and-build` (zero migration gives a far older population: 641 against 525 in 2074). `economic-cost` (even 455k a year leaves the ratio rising by half; higher pension ages do comparable work; population grows to 86m).
- **Hurts:** `open-and-build` (migration does not solve ageing). `economic-cost` and `end-settlement` (net-zero or negative migration sharply raises the burden per worker).
- **Likely status:** well-supported. Stage 5: re-run with the state-pension-age definition, and add other countries' ratios from Eurostat or the UN.
- **Merged from D4:** ONS bulletin, https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationprojections/bulletins/nationalpopulationprojections/2024based (read): principal 69.3m (2024) → 72.4m by 2049 with net migration 230,000 a year from mid-2027; low (105,000) 68.8m; high (455,000) 78.9m; zero 65.5m. Deaths exceed births from mid-2026 in the ONS principal projection; the Migration Observatory says from 2030 — check which projection each uses.

### D70. Independent estimates of lower migration's fiscal cost: Resolution Foundation, Oxford Economics, IFS (2026)
- **Source:**
  - Oxford Economics, "Lower immigration will hit UK growth and raise borrowing", 11 Feb 2026: https://www.oxfordeconomics.com/resource/lower-immigration-will-hit-uk-growth-and-raise-borrowing/ (read).
  - Resolution Foundation Spring Statement preview, Feb 2026: https://www.resolutionfoundation.org/app/uploads/2026/02/SS2026-Preview-Slides.pdf (not opened).
  - IFS (Helen Miller), Sep 2026, via London Loves Business, 14 Sep 2026: https://londonlovesbusiness.com/migration-crackdown-could-cost-treasury-4bn-as-lower-arrivals-squeeze-tax-revenues/ (read, secondary).
- **Shape:** record.
- **What it shows:**
  - **Oxford Economics (read):** net migration is below 100k in 2026; the population in 2030 is 1.5m (2.1%) below the OBR's principal projection. If the OBR followed suit, potential output would be 1 percentage point lower and borrowing £19bn (0.5% of GDP) higher.
  - **Resolution Foundation:** lower net migration among other factors adds about £6bn to borrowing by 2029–30; a large future population downgrade could cut receipts by £10bn or more (***unverified***).
  - **IFS:** policy changes could cost up to £4bn by 2029–30, citing the OBR's 200k / £20bn scenario (read, secondary).
- **Helps:** `open-and-build`. **Hurts:** `open-and-build` (the IFS's £4bn is modest; all are total-GDP effects). `economic-cost` (lower migration has a fiscal cost).
- **Likely status:** complicated; private and think-tank estimates.

### D71. Office for Students, *Financial sustainability of higher education providers in England* (14 May 2026)
- **Source:**
  - Press release: https://www.officeforstudents.org.uk/news-blog-and-events/press-and-media/ofs-warns-against-persistent-over-optimism-as-analysis-finds-institutions-under-continued-financial-pressure/
  - Report: https://www.officeforstudents.org.uk/media/taolybdu/ofs-2026_21.pdf (curl returned an empty file).
- **Measures:** providers' outturn and forecast surpluses and deficits; English providers only.
- **Coverage:** annual reports since about 2019. The range was not checked.
- **Shape:** series of reports.
- **What it shows:**
  - **Deficits (read):** 35.8% of institutions in deficit in 2024–25; 42.7% forecast for 2025–26. The OfS names an "overreliance on fee income from international students" as a risk.
  - **Scenarios (*unverified*, press coverage):** the severe scenario gives £4.2bn of cumulative losses and about 70% of providers in deficit by 2028–29. International fees are about a fifth of income (Knight Frank).
  - **Study visas:** applications fell by nearly a third in January–March 2026 (*unverified*).
- **Helps:** `open-and-build` (universities depend on international fees and are under strain as recruitment falls).
- **Hurts:** `open-and-build` (the OfS calls the dependence a risk and blames over-optimistic plans, not only migration policy). `contribute-and-earn` concedes the point.
- **Likely status:** well-supported for deficits.

### D72. HESA, *Higher Education Provider Data: Finance* (tuition fee income by domicile)
- **Source:** https://www.hesa.ac.uk/data-and-analysis/finances (blocked, 403). The 2022/23 release was published 16 May 2024; 2023/24 and possibly 2024/25 have since been published.
- **Measures:** sector income by source; fees by domicile.
- **Coverage:** since the 1990s; UK.
- **Shape:** series.
- **What it shows (*unverified*, search summary):**
  - 2022/23: total income £51.6bn; tuition fees £27.0bn (52%); non-UK domicile fees £11.8bn (23% of income).
  - Non-EU fees were 14% of income in 2017/18 (£5.2bn) and 5% in 2000/01.
- **Helps:** `open-and-build`. **Hurts:** none directly.
- **Likely status:** likely well-supported; **blocked**, so the human must download it.

### D73. HEPI / London Economics / Kaplan, *The benefits and costs of international higher education students to the UK economy* (2026)
- **Source:** https://www.hepi.ac.uk/reports/hepi-le-kaplan-the-benefits-and-costs-of-international-higher-education-students-to-the-uk-economy-2026/ (not opened).
- **Measures:** the lifetime net economic benefit of one intake: fees, spending, and the public-service costs subtracted.
- **Shape:** snapshot by intake. The 2021/22 and 2022/23 editions are comparable.
- **What it shows (*unverified*):**
  - The 2024/25 intake of 404,500 students gives a net benefit of £40.4bn; benefits are 9.7 times costs; £62m per constituency.
  - The intake was 12% below 2022/23, about £2.9bn less benefit.
  - The 2024 edition: gross £41.9bn, net £37.4bn.
- **Helps:** `open-and-build`. **Hurts:** none directly. It is commissioned by the sector (Kaplan sells pathway courses), so trace the method and the treatment of dependants and Graduate-route stayers.
- **Likely status:** complicated (sector-funded).

### D74. Migration Observatory, *Migrants in the UK labour market: an overview* (15 May 2026)
- **Source:** Brindle & Fernández-Reino. https://migrationobservatory.ox.ac.uk/wp-content/uploads/2019/07/2026-Briefing-Migrants-in-the-UK-labour-market-an-overview.pdf
- **Measures:** employment, unemployment and sectors by country of birth (LFS/APS), and HMRC RTI sector shares for non-EU nationals.
- **Coverage:** about 2004–2025.
- **Shape:** series and snapshot.
- **What it shows (read, PDF; as of 2025 / Dec 2025):**
  - **Employment rates, 2025:** migrant men 83% against UK-born men 77%; migrant women 72% against 73% (EU-born 79%, non-EU-born 69%). Some South Asian-born women's rates are much lower.
  - **Health and care share:** health and care held a quarter of non-EU adult migrants' employee jobs in December 2025, from 22% in February 2022. About a third in Wales, Northern Ireland and the South West.
  - **Care visas:** 161,000 Skilled Worker visas granted to non-EU care workers by the end of 2025.
  - **Reliance on migrants:** care workers and health professionals had the highest non-EU-born shares in 2025.
- **Helps:** `open-and-build` (high employment; health and care reliance). `contribute-and-earn` (dependence on low-paid care).
- **Hurts:** `end-settlement` and `economic-cost` (on employment). `cultural-cost`, outside this file (women's employment by origin).
- **Likely status:** well-supported.

### D75. NHS England / NHS Digital, *NHS Workforce Statistics* — staff by nationality
- **Source:** https://digital.nhs.uk/data-and-information/publications/statistical/nhs-workforce-statistics (blocked by Cloudflare). The House of Commons Library CBP-7783, *NHS staff from overseas: statistics*, is also blocked.
- **Measures:** FTE hospital and community health service staff by recorded nationality; England. Excludes GPs and social care.
- **Coverage:** September 2009 – latest month.
- **Shape:** series.
- **What it shows (*unverified*, PA analysis via search; as of Sep 2023):**
  - 20.4% non-UK nationals, up from 13.0% (2016) and 11.9% (2009).
  - Doctors 36.3% (26.6% in 2016); nurses and health visitors 30.0%.
  - The latest (2026) figure was not obtained.
- **Helps:** `open-and-build`, `contribute-and-earn` (on training substitution: rising overseas share). **Hurts:** none directly. `economic-cost` concedes the point.
- **Likely status:** well-supported once read; **blocked**.

### D76. Merged into D103

### D77. Wage-effects literature: Migration Observatory, *The labour market effects of immigration* (briefing; date not seen), and the primary studies
- **Source:**
  - Briefing: https://migrationobservatory.ox.ac.uk/resources/briefings/the-labour-market-effects-of-immigration/ (read).
  - Primary studies, all summarised in D56 and to be read in stage 5:
    - Dustmann, Frattini & Preston (2013), *Review of Economic Studies* 80(1).
    - Nickell & Saleheen (2015), Bank of England Staff Working Paper 574.
    - Manacorda, Manning & Wadsworth (2012), *JEEA*.
- **Measures:** effects on UK-born wages by percentile and occupation.
- **Coverage:** studies of 1975–2017 data.
- **Shape:** record.
- **What it shows (read):**
  - **2022 study of 1994–2016:** about −0.5p an hour per year at the 5th percentile, +1.7p at the 90th.
  - **Occupations:** a 1-point rise in the migrant share gives −0.2% in low-wage services.
  - **Who bears the effect:** the main impact falls on earlier migrants.
  - **Mechanisms:** competition in low-skill jobs; downgrading of skilled migrants; job creation.
  - **No post-Brexit studies:** "there are not yet any similar studies on the impacts of post-Brexit migration".
- **Helps:** `open-and-build` (small effects). `contribute-and-earn` and `economic-cost` (effects are negative at the bottom). `blame-underinvestment` (exploitation and tied visas are not measured here).
- **Hurts:** `economic-cost` (the size is pennies). `open-and-build` (the sign is negative at the bottom).
- **Likely status:** well-supported.

### D78. The Entrepreneurs Network, *Job Creators 2025*
- **Source:** Ives & Salter, late 2025. https://www.tenentrepreneurs.org/job-creators-2025
- **Measures:** foreign-born founders among the top 100 UK companies by valuation growth (Beauhurst, June 2024 – May 2025). Nationality is used as a proxy; the method is not fully clear.
- **Coverage:** annual since 2019: 49% (2019), 39% (2023, 2024), 54% (2025) (*unverified* for earlier years).
- **Shape:** series of snapshots.
- **What it shows (read):**
  - 54 of 100 companies have a foreign-born founder or co-founder.
  - 91 of 219 founders (42%) were born abroad, against a foreign-born population of about 16%.
  - Founders come mainly from France, the US and EU countries.
- **Helps:** `open-and-build` (founders out of proportion to population). `contribute-and-earn` (high-skilled and founder routes; founders come mostly from rich countries, not from the low-wage routes).
- **Hurts:** `open-and-build`'s general claim (it is about selected high-skilled migrants, not the 2021–24 inflow). It is a pro-immigration think tank, and the sample is small.
- **Likely status:** complicated: narrow to "high-growth start-ups".

### D79. Immigrant inventors: Nathan (2015) and Miguelez & Fink (WIPO, 2013)
- **Source:**
  - Nathan, "Same difference? Minority ethnic inventors, diversity and innovation in the UK", *Journal of Economic Geography* 15(1), 2015: https://researchonline.lse.ac.uk/id/eprint/58329 (abstract seen).
  - Miguelez & Fink, WIPO Economic Research Working Paper 10, 2013: not reached.
  - US comparator: Bernstein et al., about 880,000 US inventors 1990–2016.
- **What it shows:**
  - **Nathan:** uses ethnic names, not birthplace; small positive effects; no crowding-out of majority inventors (read, secondary).
  - **US:** immigrants were 16% of inventors and 23% of patents (***unverified***).
  - **WIPO:** no UK immigrant-inventor share was obtained.
- **Helps:** `open-and-build` (weakly). **Hurts:** `open-and-build` (there is no UK birthplace measure).
- **Likely status:** there is little UK evidence. Flag it.

---

**Work and study routes; migrants' rights**


### D100 — Home Office entry clearance visas by route (Vis_01, Vis_D02), year ending June 2026

- **Source:** Home Office, Immigration system statistics, year ending June 2026: `visas-summary-jun-2026-tables.ods` (Vis_01), `entry-clearance-visa-outcomes-datasets-jun-2026.xlsx` (Vis_D02), and summary page "Why do people come to the UK? Work", https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-june-2026/why-do-people-come-to-the-uk-work. Published 27 Aug 2026; next 26 Nov 2026.
- **Measures:** Entry clearance visas issued (applied for outside the UK), main applicants and dependants. **Excludes** in-country grants and switches (e.g. Graduate route, many Global Talent endorsements), and visa-free arrivals.
- **Coverage:** Vis_D02 2005–2026 Q2 quarterly; Vis_01 annual 2014–YE Jun 2026. No country comparison.
- **Shape:** Series.
- **Slices:** Route, subgroup, nationality, applicant type, quarter.
- **What it shows (read, files above; my sums from Vis_D02):**
  - Work visas totalled 613,627 in 2023 and 234,841 in YE June 2026.
  - Health and Care Worker visas, main applicants / dependants by year:
    - 2021: 31,800 / 31,491
    - 2022: 76,724 / 80,912
    - 2023: 145,823 / 202,334
    - 2024: 27,047 / 83,426
    - 2025: 13,193 / 35,339
    - 2026 H1: 3,025 / 11,700
  - In YE June 2026, 79% of Health and Care visas went to dependants (summary page).
  - High-skilled routes (Global Talent + Exceptional Talent, High Potential Individual, Innovator Founder/Start-up/Entrepreneur, Scale-up), all applicants:
    - 2014: 3,685 (2.2% of work visas)
    - 2019: 4,993 (2.6%)
    - 2023: 12,050 (2.0%)
    - 2025: 9,384 (3.6%)
    - 2026 H1: 4,593 (3.6%)
  - Global Talent was 6,653 in 2025, down from 7,362 in 2023. High Potential Individual was 2,117 in 2025. The Innovator group fell from 3,821 (2019) to 448 (2025).
  - As of YE June 2026.
- **Helps / hurts:**
  - `contribute-and-earn`: helps on the scale of dependants on the care route. Hurts its "make the high-skilled routes easier" claim, since the high-skilled share is small and flat in absolute numbers.
  - `economic-cost`: helps (record inflow), but also shows that the fall has already happened.
  - `open-and-build`: hurts slightly (talent routes have not grown as other routes closed).

### D101 — Home Office sponsored work visas by occupation (SOC 2020), to 2026 Q2

- **Source:** Home Office, `occupation-soc2020-visas-datasets-jun-2026.xlsx`, Occ_D02 grants, published 27 Aug 2026. https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables
- **Measures:** Entry clearance grants to sponsored **main applicants**, by occupation. 2021 Q1–2024 Q3 are modelled from SOC 2010 (note 1); 2026 is provisional.
- **Coverage:** 2021 Q1–2026 Q2, quarterly.
- **Shape:** Series.
- **Slices:** Occupation (to unit group), industry, route, nationality (not for modelled years).
- **What it shows (read; my sums):**
  - Caring personal services (SOC 613) grants by quarter:
    - 2022 Q1: 4,025
    - 2023 Q3: 34,639 (peak)
    - 2024 Q1: 3,450 (after the March 2024 dependant ban and CQC rule)
    - 2025 Q2: 1,066
    - 2025 Q4: 25
    - 2026 Q2: 10
  - Calendar 2023 total: ~108,000.
  - Nursing professionals (SOC 223): 26,141 (2022), 6,488 (2024), 1,785 (2025).
  - The summary page gives care workers 107,772 → 344 between YE Dec 2023 and YE Jun 2026 (read, D100 page).
  - **The fall came in early 2024, 18 months before the July 2025 closure.**
- **Helps / hurts:**
  - `contribute-and-earn`: helps (the route was large). Hurts any claim that the July 2025 closure itself cut numbers.
  - `blame-underinvestment` and `open-and-build`: they can use it to ask whether the sector replaced these workers (D103).

### D102. Unused

### D103 — Skills for Care, The state of the adult social care sector and workforce in England 2026, and statistical appendix

- **Source:** Skills for Care. Executive summary PDF and `ASC-Workforce-Statistical-Appendix-2026.xlsx`: https://www.skillsforcare.org.uk/Adult-Social-Care-Workforce-Data/Workforce-intelligence/publications/national-information/The-state-of-the-adult-social-care-sector-and-workforce-in-England.aspx. Published 14 Oct 2026 (2025/26 data); next Oct 2027. Also a methodology revision note (Oct 2026).
- **Measures:** England adult social care: filled posts, vacancies, turnover, nationality, pay (from ASC-WDS, weighted). **Excludes** the rest of the UK.
- **Coverage:** Appendix vacancy trend 2016/17–2025/26; pay trend 2016/17–2025/26. Earlier editions go back to 2012/13 (range not yet checked on the revised method). No country comparison.
- **Shape:** Series.
- **Slices:** Sector (independent / local authority), job role, region, nationality, service type.
- **What it shows (read, exec summary and appendix):**
  - **Vacancy rate, all roles:** 6.5% (2016/17), 7.1% (2018/19), 6.6% (2020/21), 10.1% (2021/22), 9.5% (2022/23), 7.9%, 6.7%, 6.1% (2025/26). The exec summary text says the peak was 10.4% and the latest 6.2% (see 3d).
  - **International recruits:** about 105,000 (2023/24, *unverified*, press), 50,000 (2024/25), 30,000 (2025/26) (read). About 2,000 in Apr–Jun 2026, against an average of 7,500 a quarter the year before (read).
  - **Visa workers in post:** 150,000 posts were filled by Health and Care visa holders at March 2026.
  - **British-held posts:** fell from 85% of the workforce (2020/21) to 67% (2025/26), a loss of 130,000 posts, 40,000 of them in the last year.
  - **Care worker pay (independent sector, mean hourly) against the NLW:**
    - 2016/17: £7.77 vs £7.20 (+57p)
    - 2022/23: £10.33 vs £9.50 (+83p)
    - 2025/26: £12.84 vs £12.21 (+63p)
  - **Median pay and progression:** median £12.60 in March 2026, 39p above the NLW. Workers with 5+ years' experience earn 12p an hour more than new starters, down from 33p in 2016.
  - **Recruiting employers:** the vacancy rate among employers who recruited internationally fell from 9.9% (2022) to 5.6% (2026).
- **Helps / hurts:**
  - `open-and-build`: helps (overseas recruitment coincided with vacancies falling from their peak).
  - `contribute-and-earn`: helps (British posts fell while overseas recruits rose; little pay progression). It also hurts its prediction that wages will rise, since the premium over the NLW has narrowed.
  - `blame-underinvestment`: helps (pay sits at the wage floor, which points to underfunding).
  - `economic-cost`: mixed. Vacancies kept falling after recruitment collapsed, which cuts against "care will go short"; but the workforce grew only 1.4%.
- **Merged from D76:** press coverage of the June 2026 edition (LocalGov, 24 Jun 2026, read, secondary) gave 6.2% vacancies, about 96,000, the lowest since 2015/16. **Hurts** `open-and-build`: vacancies did not spike after the route closed; **hurts** `contribute-and-earn`: British-held posts are still falling, so domestic recruitment has not replaced overseas staff.

### D104 — Migration Advisory Committee, Annual report 2023 (care chapter)

- **Source:** MAC, https://www.gov.uk/government/publications/migration-advisory-committee-annual-report-2023/migration-advisory-committee-mac-annual-report-2023-accessible, 13 Dec 2023. Also MAC Adult Social Care report (Apr 2022), https://assets.publishing.service.gov.uk/media/626931768fa8f57a40cf7e7b/E02726219_CP_665_Adult_Social_Care_Report_Elay.pdf (not fetched).
- **Measures:** Review of the care route and evidence of exploitation.
- **Coverage:** Feb 2022–late 2023.
- **Shape:** Record.
- **Slices:** None.
- **What it shows (read, first 100k characters of the page):**
  - ~91,700 care worker visas since Feb 2022. The Health and Care dependant ratio was 1.21 (Oct 2022–Sep 2023), against 0.77 for other Skilled Worker occupations.
  - MAC was "concerned by the increasing reports of exploitation and abuse". It cites Unseen's 700+ potential modern-slavery cases in care in 2022 and 25 possible bonded-labour cases seen by UKVI (May–Jul 2023). 5 care sponsor licences were revoked in May 2023, covering 1,100+ applications; 600 sponsors were flagged.
  - Root cause: "the underfunding of the social care sector". MAC recommended a minimum wage of £1 above the NLW for publicly funded care, which the government did not implement. "Immigration could not solve these workforce issues alone."
- **Helps / hurts:**
  - `contribute-and-earn`: helps (dependants, abuse).
  - `blame-underinvestment`: helps strongly (MAC names underfunding as the cause).
  - `open-and-build`: hurts (the route came with exploitation).

### D105 — ICIBI, An inspection of the immigration system as it relates to the social care sector (Aug–Nov 2023)

- **Source:** Independent Chief Inspector of Borders and Immigration (David Neal), published ~Mar 2024. The gov.uk URL I guessed returned 404; the Home Office response page exists: https://www.gov.uk/government/publications/response-to-an-inspection-of-the-immigration-system-as-it-relates-to-the-social-care-sector/
- **Measures:** Inspection of Home Office sponsor licensing and compliance.
- **Coverage:** 2019–Nov 2023.
- **Shape:** Record.
- **What it shows (*unverified*, EIN/Free Movement summaries):**
  - Registered sponsors rose from 30,730 (2019) to 94,704 (Nov 2023), with too few compliance officers.
  - 275 certificates of sponsorship went to a care home that did not exist.
  - Tied visas deter complaints.
  - The Home Office accepted the recommendations.
- **Helps / hurts:**
  - `blame-underinvestment`: helps (tied visas).
  - `contribute-and-earn`: helps (the route was abused).
  - `open-and-build`: hurts.

### D106 — Home Office figures on care sponsors revoked, Jul 2022–Dec 2024

- **Source:** Home Office figures reported by PA (12 Mar 2025) and a Commons written answer (Jun 2025). Primary not fetched.
- **Measures:** Care-sector sponsor licences revoked, and workers linked to those sponsors.
- **Shape:** Snapshot.
- **What it shows (*unverified*):**
  - 470+ care-sector licences were revoked, Jul 2022–Dec 2024.
  - 39,000+ workers were linked to those sponsors since Oct 2020 (~40,000 in the written answer).
  - Work Rights Centre (an advocacy group): only 941 of the workers referred to job hubs reported new jobs.
  - Denominator: roughly 250,000 care worker and senior care worker main applicants 2021–24 (D101), so about 15% were linked to a revoked sponsor. This is a rough ratio; the periods differ.
- **Helps / hurts:**
  - `blame-underinvestment` and `contribute-and-earn`: helps both.
  - `open-and-build`: hurts.

### D107 — UKVI Sponsorship transparency data (SC_01 action against sponsors; SP_01 registered sponsors), Q2 2026

- **Source:** Home Office Migration transparency data, `sponsorship-transparency-data-apr-to-jun-2026.ods`, published 27 Aug 2026. https://www.gov.uk/government/collections/migration-transparency-data
- **Measures:** Licences suspended and revoked each quarter (Skilled Worker, Student, Temporary Worker); registered sponsors. **Excludes** any sector split and the number of workers affected.
- **Coverage:** 2012 Q1–2026 Q2.
- **Shape:** Series.
- **What it shows (read; my sums):**
  - Skilled Worker licences revoked:
    - 2014–2019: about 300–700 a year (2019: 380)
    - 2021: 39
    - 2024: 1,494
    - 2025: 3,100
    - Q3 2025–Q2 2026: 4,403
  - Registered Skilled Worker sponsors: 28,274 (2019 Q2), 100,082 (2024 Q2), 126,104 (2026 Q2).
  - Revocations as a share of sponsors: about 3.5% in the last year, against about 1.3% in 2019.
  - The Home Office press release of 11 Sep 2025 gives 1,948 revoked Jul 2024–Jun 2025, against 937, 247 and 261 in earlier years (read, https://www.gov.uk/government/news/record-numbers-of-visa-sponsor-licences-revoked-for-rule-breaking). This counts all worker routes, so it differs from SC_01's Skilled Worker column.
- **Helps / hurts:**
  - `contribute-and-earn`: helps (enforcement now visible).
  - `blame-underinvestment`: helps (abuse was real) and hurts its "sponsors go unpunished" framing.
  - Practitioners say many revocations are for paperwork failures, not exploitation (*unverified*, Free Movement). This limits use of the series as a measure of exploitation.

### D108 — Unseen, Modern Slavery & Exploitation Helpline annual assessments 2022–2024

- **Source:** Unseen UK (a charity), e.g. https://www.unseenuk.org/wp-content/uploads/2024/05/Press-release-AA-2023-for-immediate-release.pdf. Not fetched.
- **Measures:** Potential victims indicated by helpline contacts. Uncorroborated; not a prevalence measure.
- **Coverage:** Annual series (range not yet checked).
- **Shape:** Series.
- **What it shows (*unverified*):**
  - Potential victims in care: 708 (2022), 918 (2023).
  - In 2024, care was 18% of cases and 24% of 4,839 potential victims, the largest sector for labour exploitation.
- **Helps / hurts:**
  - `blame-underinvestment` and `contribute-and-earn`: helps both.
  - `open-and-build`: hurts.
  - It is a lead only; the Home Office NRM statistics would be the official counterpart, but they have no sponsored-worker flag (searched, none found).

### D109 — Director of Labour Market Enforcement, UK Labour Market Enforcement Strategy 2024 to 2025

- **Source:** DLME, Nov 2024 (Home Care Association summary). Not fetched; I did not find a 2025/26 strategy.
- **Shape:** Record.
- **What it shows (*unverified*):**
  - Non-compliance with employment rights in social care is rising.
  - Overseas workers fear complaining against their sponsors.
  - The strategy recommends assessing the joint enforcement approach to care.
- **Helps / hurts:**
  - `blame-underinvestment`: helps.
  - `contribute-and-earn`: helps.

### D110 — Nursing and Midwifery Council, Annual data report, March 2026

- **Source:** NMC, https://www.nmc.org.uk/globalassets/sitedocuments/data-reports/2026/0184ca-data-report-uk-web.pdf, 2026 (data to 31 Mar 2026). Mid-year Sept 2025 report also exists.
- **Measures:** New joiners to and leavers from the UK register, by UK or international education.
- **Coverage:** Annual reports from at least 2017 (range not yet checked).
- **Shape:** Series.
- **Slices:** Country of training, profession, ethnicity.
- **What it shows (read):**
  - Internationally educated share of joiners: 49.4% (2023-24), 39.1% (2024-25), 26.4% (2025-26).
  - International joiners fell from 20,669 to 10,961 (−47%) in 2025-26.
  - UK-educated joiners fell from 32,164 to 30,581 (−4.9%), after rising 11.9% in 2023-24 and 5.9% in 2024-25.
  - The register is 75.6% UK-educated and 24.4% internationally educated.
  - India is the largest international source (4,215); Nigeria and Ghana, both on the WHO "red list", are next.
- **Helps / hurts:**
  - **Hurts** `contribute-and-earn`'s substitution claim: UK-trained joiners grew while international recruitment peaked, and they fell as it collapsed.
  - Helps `open-and-build`.
  - The red-list sourcing gives `contribute-and-earn` an ethics point.

### D111 — UCAS nursing acceptances (England), via Nuffield Trust staffing tracker

- **Source:** Nuffield Trust, https://www.nuffieldtrust.org.uk/nhs-staffing-tracker/training (UCAS end-of-cycle data). Not fetched.
- **Coverage:** Annual series, 2010s–2025 (range not yet checked).
- **Shape:** Series.
- **What it shows (*unverified*):**
  - England nursing acceptances in 2025 were 4,755 (18%) below the 2021 peak, and +0.7% on 2024.
  - Applicants were down 26% on 2021.
- **Helps / hurts:**
  - Helps `contribute-and-earn` (domestic intake fell while overseas recruitment boomed). Causation is unclear: the 2021 peak was a pandemic surge.
  - `blame-underinvestment` can point to bursaries and fees.

### D112 — General Medical Council, The state of medical education and practice: workforce report 2025

- **Source:** GMC, published 21 Nov 2025. https://www.gmc-uk.org/news/news-archive/uk-health-services-risk-huge-holes-if-internationally-qualified-doctors-quit. Not fetched.
- **Coverage:** Annual (range not yet checked).
- **Shape:** Series.
- **What it shows (*unverified*):**
  - 20,060 international doctors joined in 2024 (19,629 in 2023).
  - Doctors who qualified outside the UK make up 42% of the licensed workforce.
  - IMGs were 52% of joiners in 2022.
- **Helps / hurts:**
  - Helps `open-and-build` (dependence).
  - Helps `contribute-and-earn` (reliance on imports).

### D113 — Medical school places in England, and the Medical Training (Prioritisation) Act 2026

- **Source:** NHS England letter, 28 Feb 2025 (https://www.england.nhs.uk/long-read/nhs-england-update-on-medical-school-training-places-28-february-letter-to-royal-college-of-physicians/); NHS England guidance on the prioritisation Bill; Nuffield Trust analysis. Not fetched.
- **Shape:** Record and series.
- **What it shows (*unverified*):**
  - Places were capped at ~6,000 until a 1,500-place expansion (2018–20), then re-capped at 7,500. There were 7,571 places in 2023 and up to 8,326 in 2025.
  - The Long Term Workforce Plan (2023) targets 15,000 by 2031/32.
  - Specialty training competition was 3.3 applicants per post in 2025.
  - From 2026, UK graduates are prioritised: the non-prioritised (mostly IMG) share of posts fell from 28% to 1.8%.
- **Helps / hurts:**
  - Helps `contribute-and-earn` and `blame-underinvestment`: government capped domestic training, so the shortfall was a policy choice.
  - Hurts the idea that employers chose imports over training doctors.

### D114 — OECD, Health at a Glance 2025: international migration of nurses and doctors

- **Source:** OECD, Nov 2025, https://www.oecd.org/en/publications/2025/11/health-at-a-glance-2025_a894f72e/full-report/international-migration-of-nurses_9f4ba769.html. **Blocked** (403 to WebFetch and curl; archive.org not reachable).
- **Coverage:** 2010–2023, OECD countries.
- **Shape:** Comparison.
- **What it shows (*unverified*, search snippets):**
  - UK foreign-trained nurses rose from ~70,000 to ~170,000 between 2010 and 2023, which is 83% of the increase in UK nurses.
  - The OECD average share of foreign-trained nurses is 8.8%; for doctors it is 20% (2023).
  - The UK, US and Germany host most migrant doctors.
  - Graduates per 100,000 (domestic training comparator) are not retrieved.
- **Helps / hurts:**
  - Helps `contribute-and-earn` (the UK is an outlier in reliance).
  - Helps `open-and-build` (dependence).

### D115 — Home Office, People claiming asylum by prior route (Asy_D01a)

- **Source:** Home Office, `asylum-claims-datasets-jun-2026.xlsx`, sheet Asy_D01a, published 27 Aug 2026 ("Official Statistics in Development"); summary page https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-june-2026/how-many-people-claim-asylum-in-the-uk.
- **Measures:** People claiming asylum by the leave they last held. "Other leave" includes ETAs and family visas. 2018–19 are rounded and have no work sub-routes.
- **Coverage:** 2018 Q1–2026 Q2.
- **Shape:** Series.
- **Slices:** Route subgroup (Study, Visitor, Graduate, Health and Care, Skilled Worker, Seasonal, other), nationality.
- **What it shows (read; my sums):**
  - Study-visa claims: 4,900 (2018), 8,308 (2022), 13,561 (2023), 15,948 (2024), 12,626 (2025).
  - Health and Care Worker claims: 36 (2022), 856 (2023), 5,669 (2024), 4,761 (2025).
  - Graduate claims: 37 (2022), 1,318 (2024), 4,004 (2025), 2,531 (2026 H1).
  - Seasonal Worker claims: 2,215 (2022), 2,415 (2023), 1,086 (2025).
  - Visitor claims: about 7,500–9,000 a year since 2023.
  - In YE June 2026, 34,999 (41%) of 85,891 claimants had held a visa or leave, slightly above small-boat arrivals (33,949). Graduate claims more than doubled to 5,130 (summary page).
  - Rough rates (my cross-year ratios against D100):
    - Health and Care claims 2024 / H&C visas 2022–23 (incl. dependants) ≈ 1.1%
    - Study claims 2024 / sponsored study visas 2023 ≈ 2.7%
    - Visitor claims / visitor visas ≈ 0.4%
- **Helps / hurts:**
  - `contribute-and-earn`: helps ("tens of thousands" holds).
  - `economic-cost`: helps.
  - `open-and-build`: helped by the denominators, since rates are 1–3% of visa holders.
  - Shared with `uk-asylum`: merge there.

### D116 — Migration Advisory Committee, Rapid review of the Graduate route (May 2024)

- **Source:** MAC, https://assets.publishing.service.gov.uk/media/6745b2eecdd295aea88098b6/MAC+Rapid+Review+of+Graduate+Route+-+FINAL+Nov+24__1_.pdf, 14 May 2024 (file revised Nov 2024).
- **Measures:** HMRC PAYE earnings in the first year on the route (cohort starting before Apr 2022); occupations of people who switched to Skilled Worker, Jul 2021–Dec 2023 (Home Office management information, corrected data).
- **Coverage:** First year only. Comparators in the same source: domestic graduates (Graduate Outcomes survey, 15 months after graduation) and other countries' post-study visas.
- **Shape:** Snapshot.
- **What it shows (read):**
  - Median monthly income in work: £1,750 (£21,000 a year); £2,020 in the last three months of the first year.
  - Domestic graduates' median 15 months after graduating: £26,000.
  - 19% earned at least £2,500 in their first month.
  - Of those who switched to Skilled Worker, 69% were in managerial, professional or associate professional jobs (domestic graduates 75%; direct student switchers 42%).
  - 20% of Graduate switchers became care or senior care workers; for direct student switchers it was 49%.
  - MAC found the commissioning letter's claim about switchers' earnings was based on wrong data.
- **Helps / hurts:**
  - `open-and-build`: helps (switchers look like domestic graduates).
  - `contribute-and-earn`: helps (low first-year pay; the route fed care work).
  - Neither side gets "years after"; see 3d.

### D117. Merged into D60

### D118 — HM Government, Restoring control over the immigration system: white paper and technical annex (12 May 2025)

- **Source:** https://www.gov.uk/government/publications/restoring-control-over-the-immigration-system-white-paper/restoring-control-over-the-immigration-system-technical-annex
- **Shape:** Record, plus the government's own counterfactual.
- **What it shows (read, annex):**
  - Illustrative change in inflows per year:
    - Skill threshold raised to RQF 6: −39,000 (17,000 main applicants + 22,000 dependants)
    - Care route closed to overseas recruits: **−7,000**
    - Graduate route cut to 18 months: −12,000
    - Basic Compliance Assessment tightened: −12,000
    - Higher education levy: −7,000
    - English requirements: −6,000
    - 10-year settlement: −18,000
    - Growth routes: +3,000
    - **Total: −98,000** (range −82,000 to −113,000)
  - The annex gives no salary figure. The £41,700 general threshold from 22 July 2025 is from the published fact `work-visas-swung-to-low-skill-and-back` (*unverified* here).
  - Outturn (D100): Skilled Worker main applicants fell 30% in YE June 2026 (to 26,894). Over 100 occupations were removed.
- **Helps / hurts:**
  - `contribute-and-earn`: helps (a targeted design).
  - The small care estimate undercuts claims, on either side, that the 2025 closure was what cut care recruitment.

### D119 — Home Office, Fees and unit cost table, 8 October 2026 (Visa fees transparency data)

- **Source:** https://www.gov.uk/government/publications/visa-fees-transparency-data, file `Copy_of_Fees__Unit_cost_table_08_October_2026_-_KM.ods`. Earlier tables back to Jan 2024 are on the same page; older ones exist (2014 onwards, not fetched).
- **Measures:** Each fee, the Home Office's estimated unit cost of processing it, and the legal maximum.
- **Coverage:** Point in time; there is a series of tables.
- **Shape:** Snapshot (a run is possible from the archive).
- **What it shows (read), fee against unit cost:**
  - ILR: £3,226 vs £310
  - Skilled Worker over 3 years, from overseas: £1,618 vs £153
  - Health and Care up to 3 years: £324 vs £153 (in-country unit cost £202)
  - Student: £558 vs £176
  - Graduate: £937 vs £110
  - Visit (6 months): £135 vs £159
  - Global Talent (main applicant, with an approval letter, overseas): £205 vs £488
  - Naturalisation: £1,709 vs "1.23" (an apparent error in the table)
  - Past ILR fees: £1,093 in 2014 and £2,389 in 2019 (*unverified*, press).
- **Helps / hurts:**
  - `blame-underinvestment` and `keep-our-word`: helps (fees are many times the processing cost).
  - `economic-cost` and `contribute-and-earn`: the surplus funds the border system, the Home Office's stated rationale.

### D120 — Immigration Health Surcharge: rates and cost basis

- **Source:** Immigration (Health Charge) (Amendment) Order 2024 and its explanatory memorandum and equality impact assessment; Nuffield Trust briefing. Not fetched.
- **Shape:** Record.
- **What it shows (*unverified*):**
  - Rates per year: introduced at £200 (Apr 2015); £400 (Jan 2019); £624 (Oct 2020); £1,035 adult / £776 student and child (6 Feb 2024).
  - DHSC estimated healthcare cost at ~£1,036 per payer. Nuffield Trust disputes the assumptions behind it.
  - The 2024 increase is expected to raise £6.2bn over five years (central estimate).
  - Payers also pay tax, so it is a double charge, as the left argues.
- **Helps / hurts:**
  - Cuts against `blame-underinvestment`'s "many times what services cost" claim for the surcharge (it is pegged to average use).
  - Supports the double-payment argument.
  - `economic-cost`: helps.

### D121 — Royal Society / Fragomen, Summary of visa costs analysis 2025

- **Source:** https://royalsociety.org/-/media/policy/publications/2025/summary-of-visa-costs-analysis-2025.pdf. **Blocked** (curl returned nothing).
- **Shape:** Comparison (the UK against leading science nations).
- **What it shows (*unverified*):**
  - The UK has the highest upfront Skilled Worker costs on a purchasing-power basis.
  - A family of four on a five-year visa pays up to £24,711 (PhD role) or £29,711 (sub-PhD).
- **Helps / hurts:**
  - `open-and-build` and `blame-underinvestment`: helps.
  - `contribute-and-earn`: hurts (it wants talent routes easier).

### D122 — NRPF Network, NRPF Connect data (councils supporting people with no recourse to public funds)

- **Source:** NRPF Network (Islington Council-hosted), written evidence to the Commons (https://committees.parliament.uk/writtenevidence/136019/html/), LGA presentation Oct 2024. The nrpfnetwork.org.uk certificate had expired, so it was blocked.
- **Measures:** Households supported by councils under the Children Act s17 and Care Act, among participating councils only.
- **Coverage:** Annual, about 2017–2024 (range not yet checked).
- **Shape:** Series, partial coverage.
- **What it shows (*unverified*):**
  - At March 2024, 78 councils supported 1,563 families (2,824 dependants) at £34m a year.
  - Across 85 councils, spending was £82m (families £34m, adults with care needs £24.5m, care leavers £23.4m), 83% of it on property.
  - Cost per household rose from £18.4k to £21.7k.
  - In 2021-22, 72 councils supported 3,423 households at £64m.
- **Helps / hurts:**
  - `blame-underinvestment`: helps (destitution costs fall on councils and children).
  - `economic-cost` and `end-settlement`: the cost is small against the claim that NRPF protects the public purse.

### D123 — Numbers subject to NRPF: estimates and the government's data position

- **Source:** Migration Observatory estimate (c. 2020) cited by the Children's Society; Home Office and DWP written answers Sep–Oct 2025 (westminsterbrief.co.uk archive). Not fetched.
- **Shape:** Snapshot / record of a data gap.
- **What it shows (*unverified*):**
  - Over 1.1m people were subject to NRPF, including ~140,000 children (c. 2020).
  - The Home Office says NRPF applies to most adult temporary migrants and holds no data on children.
  - DWP is developing questions for the Family Resources Survey 2026/27.
  - Separately, 2.9m+ people held time-limited leave around 2025 (not checked; another agent's denominator).
- **Helps / hurts:**
  - `blame-underinvestment`: helps on scale. The gap itself weakens claims on both sides.

### D124 — MHCLG, Affordable housing supply in England 2024 to 2025

- **Source:** https://www.gov.uk/government/statistics/affordable-housing-supply-in-england-2024-to-2025/affordable-housing-supply-in-england-2024-to-2025, 20 Nov 2025 (live tables 1000–1012).
- **Measures:** Gross new affordable supply (completions and acquisitions; losses to Right to Buy and demolition not netted off).
- **Coverage:** 1991-92 to 2024-25.
- **Shape:** Series.
- **Slices:** Tenure, provider, region.
- **What it shows (read):**
  - 64,762 affordable completions (highest since 2014-15).
  - Social rent: 12,198, described as the "highest since 2013-14" in the key statistics but "since 2012-13" in section 3.1.
  - Councils: 10,480, the highest since 1991-92.
  - Social rent starts: 10,810, the highest on record.
  - Social rent completions were ~39,500 in 2010-11 (*unverified*, memory; stage 5 must read live table 1000).
- **Helps / hurts:**
  - `blame-underinvestment`: helps (social rent supply collapsed after 2010).
  - `economic-cost`: it argues demand still outruns supply.
  - `open-and-build`: helps.

### D125 — IFS, Annual report on education spending in England 2025–26

- **Source:** IFS, https://ifs.org.uk/news/rapid-rises-send-and-childcare-spending-are-reshaping-education-spending-england. **Blocked** (403 to WebFetch; curl got a challenge page).
- **Coverage:** Long series, 2010–2025 and earlier.
- **Shape:** Series.
- **What it shows (*unverified*):**
  - School spending per pupil fell ~9–10% in real terms 2010–2019, while pupil numbers grew 11%.
  - By 2025 it was back to roughly its 2010 level; mainstream schools only +5% since 2019, with the rest going to SEND.
- **Helps / hurts:**
  - `blame-underinvestment`: helps for the 2010s.
  - Hurts it for now (spending per pupil has been restored, and pupil numbers are falling).

### D126 — Government investment in international comparison (OBR box; ONS 2017; IPPR)

- **Source:** OBR, "International comparisons of government investment" (https://obr.uk/box/international-comparisons-of-government-investment/, c. 2020); ONS, An international comparison of gross fixed capital formation (2 Nov 2017); IPPR analysis of OECD data (2024, think tank). OBR **blocked** (403).
- **Coverage:** OECD, 2007–2017 (OBR); 1997–2017 (ONS).
- **Shape:** Comparison.
- **What it shows (*unverified*):**
  - UK general government investment ranked 23rd–27th of 30 OECD countries in every year of the decade to 2017 (OBR).
  - The UK had the lowest total GFCF share in the OECD 1997–2017 (ONS).
  - Public sector net investment averaged ~1.6% of GDP 1978-79 to 2022-23, against 2.4% forecast for 2024-25 (IFS).
  - Stage 5 should pull OECD National Accounts general government GFCF for 2010–2025.
- **Helps / hurts:**
  - `blame-underinvestment`: helps strongly.
  - The recent rise to around the OECD median weakens the "still starved" claim.

### D127 — Health Foundation, International comparisons of capital in health care (2019; updates)

- **Source:** https://health.org.uk/sites/default/files/2019-10/20191024%20-%20Long%20read%20-%20International%20comparisons%20of%20capital%20in%20health%20care%20-%20Web%20version_0.pdf; Darzi review (Sep 2024). Not fetched.
- **Coverage:** EU14/OECD, 2000s–2017.
- **Shape:** Comparison.
- **What it shows (*unverified*):**
  - UK health capital was 0.27% of GDP against an OECD average of 0.5% (2016).
  - Matching the EU14 average would have meant £33bn more investment 2010–2019 (Darzi: £37bn).
  - The NHS maintenance backlog rose from £4bn (2013) to £11.6bn (2022).
- **Helps / hurts:**
  - `blame-underinvestment`: helps.
  - `economic-cost`: no direct effect; it does not deny the shortfall.

### D133 — NHS and public service current spending per head since 2010

- **Source:** HM Treasury PESA; IFS/Health Foundation analysis of health spending growth. Not fetched (lead only).
- **Shape:** Series.
- **What it shows (*unverified*, memory):**
  - Real NHS England day-to-day spending grew ~1–2% a year in 2010–19, against ~3.6% long-run, but it grew every year. Spending per head was higher in real terms in 2024 than in 2010.
  - NHS staff numbers grew strongly after 2019 while waiting lists stayed high.
- **Helps / hurts:**
  - **Cuts against** `blame-underinvestment` for current spending (there was no cut per head).
  - Helps `economic-cost` (more money did not fix waits; demand per head matters).
  - Needed to give the left's claim a fair test.

### D128 — Home Office, Hate crime, England and Wales, year ending March 2026

- **Source:** https://www.gov.uk/government/statistics/hate-crime-england-and-wales-year-ending-march-2026/hate-crime-england-and-wales-year-ending-march-2026, 8 Oct 2026.
- **Measures:** Police-recorded hate crime, with monthly racially or religiously aggravated offences. These measure demand on the police, not prevalence. Trends are unreliable because recording has improved; the Met is excluded from trends.
- **Coverage:** YE Mar 2013–2026 (monthly series in the tables). CSEW for comparison.
- **Shape:** Series.
- **Slices:** Strand, religion targeted, month.
- **What it shows (read):**
  - 146,825 hate crimes (+7%); race 107,926 (+9%).
  - Monthly racially or religiously aggravated offences peaked at 10,158 in **August 2024**, the highest on record, after the Southport murders and disorder.
  - Levels were elevated May–Oct 2025, during protests (including Epping).
  - There were spikes "around the time of the EU Referendum" and in March 2026, after the US–Iran conflict began.
  - CSEW hate crime has fallen over the long term.
- **Helps / hurts:**
  - `blame-underinvestment`: helps (spikes accompany anti-migrant mobilisation).
  - Also consistent with spikes following events rather than rhetoric (D131).
  - `economic-cost` and `cultural-cost`: the CSEW fall helps them.

### D129 — Albornoz, Bradley & Sonderegger, "The Brexit referendum and the rise in hate crime: conforming to the new norm" (2020; revised 2022 as "Updating the social norm")

- **Source:** University of Nottingham CeDEx DP 2020-12, https://www.nottingham.ac.uk/cedex/documents/papers/cedex-discussion-paper-2020-12.pdf. Not fetched. Related: LSE (Devine), "why was the rise more pronounced in areas that voted Remain?", https://researchonline.lse.ac.uk/id/eprint/108816.
- **Shape:** Study (event study on police data).
- **What it shows (*unverified*):**
  - Hate crime was flat until the result, then rose sharply, **more so in Remain-voting areas**.
  - The mechanism is the revealed national norm, which legitimised xenophobia, not local campaigning.
- **Helps / hurts:**
  - `blame-underinvestment`: partly helps (public signals matter).
  - It points to the vote result rather than politicians' rhetoric.

### D130 — Mason & Rowe (University of Liverpool Geographic Data Science Lab), on the 2024 riots

- **Source:** https://www.liverpool.ac.uk/geographic-data-science/news/stories/title,1486589,en.php, 30 Aug 2024 (blog, not peer-reviewed).
- **Shape:** Descriptive.
- **What it shows (read):**
  - Most anti-migrant events were in areas of high deprivation, often near asylum hotels.
  - Disinformation spread on social media; riot and migration hashtags surged.
  - There were 253 hotel protests in 2022, about double 2021.
  - It does not test rhetoric as a cause.
  - Related: the HMICFRS 2025 report on the disorder (*unverified*); Ministry of Justice data on defendants' prior records (not fetched).
- **Helps / hurts:**
  - `blame-underinvestment`: helps (deprivation plus disinformation).
  - `economic-cost` can argue it is a grievance over asylum-hotel siting.

### D131 — Ivandic, Kirchmaier & Machin, "Jihadi attacks, media and local hate crime" (CEP, 2019; later published)

- **Source:** LSE Centre for Economic Performance. Not fetched (*unverified*, memory).
- **Shape:** Study (Greater Manchester police data).
- **What it shows (*unverified*):** Islamophobic hate crimes rose after jihadi attacks, and more after attacks that got more media coverage.
- **Helps / hurts:** This is a counterfactual for R11: events and coverage, not politicians' rhetoric. It partly hurts `blame-underinvestment`'s rhetoric claim and partly helps it (via media).

### D132 — Müller & Schwarz, "Fanning the flames of hate: social media and hate crime" (JEEA 2021), Germany

- **Source:** Journal of the European Economic Association. Not fetched (*unverified*, memory).
- **Shape:** Study.
- **What it shows (*unverified*):** Anti-refugee posts on the AfD's Facebook pages predicted attacks on refugees, especially where Facebook use was high; internet outages weakened the link.
- **Helps / hurts:** `blame-underinvestment`: helps (the best causal evidence that rhetoric leads to violence). It is non-UK, so whether it transfers is a question.

---

**Culture, integration and cohesion**


### D150. Casey, *National Audit on Group-based Child Sexual Exploitation and Abuse* (2025)
- **Source:** Home Office, Baroness Louise Casey, published 16 Jun 2025, page last updated 15 Jan 2026. https://www.gov.uk/government/publications/national-audit-on-group-based-child-sexual-exploitation-and-abuse (HTML: …/national-audit-on-group-based-child-sexual-exploitation-and-abuse-accessible; PDF 197 pp.)
- **Measures:** national police data (ONS recorded crime; NPCC VKPP/CPAI dataset; the Hydrant CSE Taskforce's COCAD group-based dataset), local force data supplied to the audit (Greater Manchester MIT, West Yorkshire, NCA Operation Stovewood), 50 serious case reviews, and a timeline of reviews since 2000. **Excludes:** any prevalence estimate — the audit says it could not assess scale.
- **Coverage:** national figures for 2023–2024; local data 2020–2025; timeline 2000–2025. Snapshot plus record.
- **Shape:** record (official audit) with snapshot tables. No series of group-based CSE by ethnicity exists.
- **Slices:** suspect ethnicity, sex, age; force area; victims' sex and age.
- **What it shows (read, https://www.gov.uk/…-accessible):**
  - **Volume:** 102,878 CSA offences recorded in E&W in 2024 (27,300 in 2013, +276%); ~60% contact; ~17,100 flagged as CSE; ~700 recorded group-based CSE offences in 2023 (COCAD, which the audit says undercounts).
  - **National ethnicity recording:** ethnicity "is still not recorded for two-thirds of perpetrators". VKPP 2023: ethnicity recorded for 31% (of these 88% White, 5% Asian). COCAD 2023: recorded for 34% (88% White, 7% Asian, 5% Black, 3% Mixed). Re-based with unknowns included: White 1,884 (28%), Asian 165 (2%), Not declared 4,404 (66%) of 6,670. The audit calls presenting the data without unknowns "misleading".
  - **Greater Manchester (GMP MIT, Jan 2022–May 2025):** 61 multi-victim/multi-offender investigations, 269 suspects: Asian 141 (52%), White 101 (38%), Black 7 (3%), Other 20 (7%). 35 group-based investigations (COCAD definition), 243 suspects: Asian 131 (54%). Census 2021 Asian share of Greater Manchester: 20.9%. For **all** open CSA crimes in GM (908 suspects): White 44%, Unknown 32%, Asian 16% — "much closer to that of the local population".
  - **West Yorkshire (2020–2024):** 1,222 CSE suspects: Asian 429 (35%), White 413 (34%), not stated 281 (24%), against a population 16% Asian, 77% White.
  - **NCA Operation Stovewood (Rotherham):** 323 designated suspects and 42 convicted, "nearly two-thirds" Pakistani in each, against 4% of Rotherham and 2.4% of South Yorkshire.
  - **Serious case reviews:** of 50, ethnicity identifiable in 15; 10 predominantly Asian/Pakistani, 1 mixed minority (Newcastle), 1 Black, 1 Turkish, 1 Somali, 1 White (Torbay).
  - **Live operations:** "a significant proportion" of ~12 live cases seen involve non-UK nationals and/or asylum claimants (no numbers).
  - **On the Home Office 2020 paper:** the audit finds it "hard to understand" how it concluded offenders are likely "in line with … the general population … with the majority of offenders being White".
  - **Why officials failed to act:** victims treated as consenting or as offenders; data obfuscation; fear of being thought racist (also cited from Jay and Telford).
- **Helps:** `cultural-cost` (local over-representation of Asian/Pakistani suspects, 2–16 times population share; the government's own audit says ethnicity was "shied away from"; outline's claim about recording is confirmed). **Hurts:** `cultural-cost` if stated nationally (no national figure possible; the GM all-CSA profile is close to the population; West Yorkshire Asian and White suspect counts are about equal).
- **Likely status:** well-supported for "over-represented in the three force areas examined"; the audit itself says it cannot say whether this holds nationally.

### D151. Jay, *Independent Inquiry into Child Sexual Exploitation in Rotherham 1997–2013* (2014)
- **Source:** Alexis Jay, for Rotherham MBC, Aug 2014. https://www.rotherham.gov.uk/downloads/file/279/independent-inquiry-into-child-sexual-exploitation-in-rotherham (PDF, 159 pp.)
- **Measures:** case-file reading and interviews; a conservative victim estimate. No offender count by ethnicity.
- **Coverage:** 1997–2013, Rotherham only. **Shape:** record.
- **What it shows (read, PDF):** "approximately 1400 children were sexually exploited" (exec. summary). "By far the majority of perpetrators were described as 'Asian' by victims"; "the majority of known perpetrators were of Pakistani heritage" (§11.2), when the borough was 3.1% Pakistani/Kashmiri (2011, §11.1). Staff described "nervousness about identifying the ethnic origins of perpetrators for fear of being thought racist; others remembered clear direction from their managers not to do so." The report also states "across the UK the greatest numbers of perpetrators of CSE are white men" (citing the Children's Commissioner) and found no evidence that social-care staff's individual case decisions were influenced by ethnicity — the failure was organisational.
- **Helps:** `cultural-cost` (scale; ethnicity; fear of racism as cause). **Hurts:** none directly; its "white men nationally" line rests on the data Casey later called unreliable.
- **Likely status:** well-supported as a record (as of 2014). Stovewood convictions: over 39 per Casey (read, D150), as of 2025.

### D152. Crowther, *Independent Inquiry Telford Child Sexual Exploitation* (2022)
- **Source:** Tom Crowther QC, published 12 Jul 2022, 4 vols. Vol. 1: https://www.telford.gov.uk/media/ivsjb1k2/iitcseplusreportplus-plusvolumeplusone.pdf
- **Measures:** disclosed documents, witness evidence. **Coverage:** 1989–2022. **Shape:** record.
- **What it shows (read, PDF):** no hard proof of 1,000 victims, but witnesses considered the "1,000" estimate "conservative" (¶29). "The evidence plainly shows that the majority of CSE suspects in Telford … were men of southern Asian heritage, including all the men convicted in Chalice, and Operations Delta and Epsilon" (¶614.2), with the caution that names are unreliable indicators. West Mercia Police "allowed a nervousness about race to become prevalent among officers" in the 1990s–2000s, leading to reluctance to police parts of Wellington (¶518); teachers and parents feared being labelled racist (¶616.2). Crowther adds it would be "wholly wrong, and undoubtedly racist, to equate membership of a particular racial group with propensity to commit CSE" (¶614.1). Telford's 2025–26 annual CSE report records 11 suspects, 4 White British where recorded (*unverified*, search snippet of democracy.telford.gov.uk).
- **Helps:** `cultural-cost` (ethnicity; police nervousness about race). **Hurts:** — (recent Telford suspects are few and mixed, *unverified*).
- **Likely status:** well-supported as a record.

### D153. Greater Manchester independent assurance reviews (Newsam & Ridgway): Oldham (Part 2, 2022), Rochdale / Operation Span (Part 3, 2024)
- **Source:** Greater Manchester Combined Authority. Part 3, Jan 2024: https://www.greatermanchester-ca.gov.uk/media/9148/operation-span-report-january-2024-v3.pdf . Part 2 (Oldham, Jun 2022) summarised in D150's timeline.
- **Coverage:** Rochdale 2004–2013. **Shape:** record.
- **What it shows (read, PDF):** "compelling evidence of widespread organised sexual exploitation of children" in Rochdale; 111 children considered, "a significant probability that 74 … were being sexually exploited"; agencies appropriately protected 3; "serious failures to protect" 48. At least 96 individuals potentially posing a risk; 30 men convicted across successive operations. The report uses "Asian" because that is how records described suspects (fn 22). Oldham Part 2 found flaws but "no evidence of a cover-up" (read, D150 timeline).
- **Helps:** `cultural-cost` (scale, failure). **Hurts:** `cultural-cost`'s "looked away" framing in Oldham specifically (no cover-up found).
- **Likely status:** well-supported as a record.

### D154. National police data on group-based CSE: VKPP (CPAI) and Hydrant CSE Taskforce COCAD (2023 data)
- **Source:** NPCC Vulnerability Knowledge and Practice Programme, *National analysis of police-recorded CSAE crimes* (2023 data, publ. 2024); Hydrant CSE Taskforce COCAD report (Nov 2024). Read only as reported in D150. Home Office 2020 *Group-based CSE: Characteristics of Offending* and IICSA final report (Oct 2022) also read only as quoted in D150.
- **Measures:** suspects in recorded CSAE / group-based CSAE (two or more suspects, including family and institutional settings — wider than "grooming gangs").
- **Coverage:** 2023 (COCAD's first year); quarterly snapshots never updated, so early-investigation undercount. **Shape:** snapshot.
- **What it shows (read, as reported in D150):** see D150 national figures (ethnicity known for 31–34%). Older studies collated by the Home Office 2020 paper: CEOP 2011 (1,200 offenders, 38% unknown; 30% White, 28% Asian where known, *truncated in source*); CEOP 2013: of 52 groups, half all-Asian, 11 all-White; Children's Commissioner 2015: 42% White, 17% Black, 14% Asian, 22% unknown. IICSA 2022: ethnicity "rarely recorded".
- **Helps:** `open-and-build`/`blame-underinvestment` only if the 88% White figure is used — which the audit calls misleading. **Hurts:** both sides' national claims (data too incomplete). Post-audit, the government committed to mandatory recording of ethnicity and nationality (Commons answer 4 Nov 2025, *unverified*).
- **Likely status:** "unknown nationally" is the defensible claim.

### D155. Independent Inquiry into Grooming Gangs and NCA Operation Beaconport (status, Oct 2026)
- **Source:** statutory inquiry, chair Baroness Anne Longfield; terms of reference published Mar 2026; set up 13 Apr 2026 (*unverified*). Bevan Brittan note, 16 Jun 2026 (read): https://www.bevanbrittan.com/insights/articles/2026/national-inquiry-into-grooming-gangs-is-launched/ ; Local Government Lawyer, 25 Jun 2026 (read): https://localgovernmentlawyer.co.uk/child-protection/392-children-protection-news/100901-oldham-london-and-bradford-and-keighley-announced-as-first-places-to-be-investigated-in-grooming-gangs-inquiry ; NCA update 15 Jun 2026 (read): https://www.nationalcrimeagency.gov.uk/news/operation-beaconport-update-on-the-national-investigation-into-group-based-child-sexual-abuse
- **Shape:** record (in progress).
- **What it shows (read):** three years, £65m, covers 1 Jan 1996–31 Mar 2029, England and Wales; must examine whether "ethnicity, religion, culture, or community relations concerns shaped official responses". First local investigations: Oldham; Bradford and Keighley; London. First national accountability hearings "before the end of" 2026; >800 past recommendations found. Beaconport (NCA) reviews closed cases (Jan 2010–Mar 2025); forces in 8 areas directed to reopen cases; new offending found in 4. LBC reported 1,273 investigations from 23 forces referred, 236 prioritised (*unverified*). Five survivors resigned from the victims' liaison panel over scope (*unverified*). An MoU with Beaconport was due 13 Oct 2026 (not checked).
- **Helps/hurts:** neither yet; the report must say findings are pending (as of 2026-10-24).

### D156. ONS, *Child sexual abuse in England and Wales: year ending March 2019* (CSEW) — base rate
- **Source:** ONS, 14 Jan 2020 (corr. 2 Mar 2021). https://www.ons.gov.uk/peoplepopulationandcommunity/crimeandjustice/articles/childsexualabuseinenglandandwales/yearendingmarch2019
- **Measures:** adults 18–74 recalling sexual abuse before 16 (excludes 16–17). No perpetrator ethnicity. **Shape:** snapshot.
- **What it shows (read):** 7.5% (~3.1m) experienced CSA before 16. Perpetrator: friend or acquaintance 37%, stranger 30% (all victims); family member other than parent 24% (women) / 15% (men); step-father 7.5% / 1.4%. Only 7% of rape/penetration victims told police.
- **Helps:** `cultural-cost` slightly (group-based CSE is a small share of a huge, mostly unreported total — so recorded data understate it). **Hurts:** the outline's own concession that "most child sexual abuse is committed by family members" is **not supported** by this source as stated (see 3d).

### D157. Census 2021 ethnic group and religion — population denominators
- **Source:** ONS Census 2021 (fact files `ethnic-composition-at-the-2021-census`, `religious-composition-at-the-2021-census`). Pakistani counts read in Catney et al. 2023 Table 1 (D180).
- **What it shows:** Pakistani 1,587,819 (2.66%) of E&W in 2021, up from 0.91% (1991) (read, PDF, D180). Asian 9.3%, White 81.7%, Muslim 6.5% (*unverified*, from fact files; re-fetch).
- **Use:** the denominator for C1 and C5. Local shares (GM 20.9% Asian, West Yorkshire 16%, Rotherham 4% Pakistani) come from D150.

### D158. MoJ, *Ethnicity and the criminal justice system* — convictions by ethnicity (Ethnicity facts and figures)
- **Source:** https://www.ethnicity-facts-figures.service.gov.uk/crime-justice-and-the-law/courts-sentencing-and-tribunals/prosecutions-and-convictions/latest/ (publ. 10 Oct 2018, updated 8 Aug 2023; data to 2017). Newer MoJ "Statistics on ethnicity and the CJS 2024" not fetched.
- **What it shows (read):** prosecution counts and conviction ratios, not rates per head; ethnicity unknown for ~1 in 5. Sexual-offence convictions (year not stated on the page): White 4,455, Asian 436, Black 442.
- **Use:** base rate for sexual offending by ethnicity; no CSA or group split. Stage 5 needs the 2024 edition and population rates.

### D159. Quilliam, *Group Based Child Sexual Exploitation – Dissecting Grooming Gangs* (2017) and Cockbain & Tufail critique (2020)
- **What it says (*unverified*):** 84% of 264 people convicted of "grooming gang" offences 2005–2017 were Asian. Built from press reports of prosecutions; Cockbain & Tufail (*Race & Class*, 2020) argue the method selects cases that were reported as "grooming gangs" in the first place.
- **Use:** a widely cited lead only; disputed method. **Helps:** `cultural-cost`. **Hurts:** — . Not usable as evidence without the primary convictions.

### D160. Denmark, Finansministeriet, *Indvandreres nettobidrag til de offentlige finanser i 2019* (May 2023)
- **Source:** Danish Ministry of Finance, May 2023. https://fm.dk/media/27067/oekonomisk-analyse_indvandreres-nettobidrag-til-de-offentlige-finanser-i-2019.pdf (fm.dk refused fetching; read from web.archive.org copy). Previous edition: data year 2018, Oct 2021.
- **Measures:** annual net contribution (taxes minus transfers and individualised public consumption, plus allocated collective spending such as defence) by origin, from Statistics Denmark registers. **Not lifetime**; not adjusted for business cycle. Iran was misclassified outside MENAPT (ministerial answer, 2023, *unverified*).
- **Coverage:** 2014–2019 in this edition (in 2019 prices). Update with 2020–21 data was targeted for H1 2025; not found published (*unverified*).
- **Shape:** short series plus snapshot by origin.
- **Slices:** Danish origin / immigrants / descendants × Western / MENAPT / other non-Western; refugees and family reunified.
- **What it shows (read, PDF; as of 2019):**
  - Net contribution per person (DKK 1,000): Danish origin +22; all immigrants +5; Western immigrants +52; **MENAPT immigrants −79**; other non-Western immigrants +11. Descendants: all −102; Western −73; MENAPT −109; other non-Western −106 (descendants are mostly children).
  - Totals: immigrants and descendants −16 bn DKK (−21,000 per person); MENAPT immigrants and descendants −23 bn; other non-Western −4 bn; Western +11 bn.
  - Trend: total net cost fell from −34 bn (2014) to −16 bn (2019), "særligt stærkere tilknytning til arbejdsmarkedet".
  - Age matters: at the Danish-origin age structure, descendants' contribution would be ~13 bn higher and immigrants' ~28 bn lower.
  - If MENAPT 25–64-year-olds had the employment rate of Danish origin, their contribution would be ~12 bn higher. About 11% of MENAPT immigrants had a positive contribution above 150,000 DKK.
  - Refugees and their family-reunified: −9.9 bn, ~−103,000 DKK per person.
- **Helps:** `cultural-cost` (MENAPT immigrants are net costs, others not, as the outline says), `contribute-and-earn` (route matters: refugees most negative). **Hurts:** `cultural-cost`'s "persists" framing (net cost of MENAPT groups fell sharply 2014–19 with employment); Danish MENAPT inflows were mainly refugees and family, unlike UK work routes.
- **Likely status:** well-supported for Denmark, if stated as "annual, 2019".

### D161. Netherlands, van de Beek, Roodenburg, Hartog & Kreffer, *Borderless Welfare State* (*Grenzeloze verzorgingsstaat*, 2021)
- **Source:** independent study (University of Amsterdam-affiliated authors), 3 Mar 2021, self-published via Demo-Demo; **not a CPB publication** (the outline is wrong). PDF: https://www.wyniasweek.nl/wp-content/uploads/2021/03/Grenzeloze_Verzorgingsstaat.pdf (231 pp., includes English summary).
- **Measures:** lifetime net contribution (generational accounting, present value) per immigrant, from CBS microdata, **including the second generation's costs**. Critics (BNNVARA/Joop, *unverified*) dispute treating housing and childcare benefits as costs.
- **Coverage:** 1995–2019 realised, projections to 2040. **Shape:** cross-section by origin and motive.
- **What it shows (read, PDF, English summary):** labour migrants +€125,000; study −€75,000; family −€275,000; asylum −€475,000. Western average +€25,000; non-Western −€275,000; Japan/N. America/Oceania/British Isles/Scandinavia/Switzerland +€200,000; Central/Eastern EU −€50,000; Morocco −€550,000; Horn of Africa and Sudan −€600,000; Turkey, Caribbean, W. Asia, N/C/W Africa −€200,000 to −€400,000. Net cost of immigration 1995–2019 ~€400 bn. Native Dutch roughly budget-neutral over life. On the second generation: where parents' contribution is strongly negative "is er bij de tweede generatie meestal ook nog een forse achterstand"; "Het adagium 'het komt wel goed met de tweede generatie' gaat dus niet op."
- **Helps:** `cultural-cost` (origin gaps; second generation does not close them), `contribute-and-earn` (motive matters). **Hurts:** `cultural-cost`'s "culture" causal story — within every region, labour migrants do far better than asylum/family migrants (Western vs non-Western gap ~€125,000 for labour, €250,000 for asylum), so route explains much.
- **Likely status:** contested (non-peer-reviewed, method disputed); cite with authorship clearly stated.

### D162. Norway, Statistics Norway (SSB), Holmøy & Strøm — fiscal effects by country group
- **Source:** SSB, "The effects of more immigrants on public finances", 19 Dec 2014 (Samfunnsspeilet 5/2013). https://www.ssb.no/en/offentlig-sektor/artikler-og-publikasjoner/the-effects-of-more-immigrants-on-public-finances . Later: SSB Rapporter 2017/31 for NOU 2017:2 (not fetched).
- **Measures:** model simulation of 5,000 extra immigrants arriving in 2015, including their children, by country group R1 (W. Europe, N. America, Oceania), R2 (EU east), R3 (rest of world).
- **What it shows (read):** present value 2015–2100 (2012 NOK, 4% discount): R3 net spending +NOK 4.1m per immigrant; R1 −0.8m (net gain); R2 +0.8m. Authors warn this is not one average immigrant's lifetime account. Refugees not separate; service-use assumption "probably entails an underestimation" for refugees.
- **Helps:** `cultural-cost`, `contribute-and-earn`. **Hurts:** — (but R3 is a very broad group, not "culture").
- **Likely status:** well-supported as a model result; dated (2013 model).

### D163. UK Annual Population Survey: employment rate by ethnicity (Ethnicity facts and figures)
- **Source:** DWP/ONS APS, https://www.ethnicity-facts-figures.service.gov.uk/work-pay-and-benefits/employment/employment/latest/ (data 2022, publ. 28 Nov 2023).
- **Coverage:** 2004–2022, GB, ages 16–64. **Shape:** series.
- **What it shows (read):** 2022 employment: overall 76%; White British 76%; Indian 77%; Black 69%; Pakistani and Bangladeshi 61% (women 46%). Pakistani/Bangladeshi rose from 44% in 2004 — the largest rise of any group.
- **Helps:** `cultural-cost` (women's employment gap is large). **Hurts:** `cultural-cost` (gap narrowing fast; Indian higher than White British).
- **Note:** UK publishes no country-of-birth fiscal estimates; APS country-of-birth tables exist (not fetched). HMRC's tax-by-nationality series was discontinued in 2023 (Commons answer May 2025, *unverified*).

### D164. Census 2021: religion by employment and education
- **Source:** ONS, *Religion by housing, health, employment and education, England and Wales: Census 2021*, 24 Mar 2023. https://www.ons.gov.uk/peoplepopulationandcommunity/culturalidentity/religion/articles/religionbyhousinghealthemploymentandeducationenglandandwales/census2021
- **What it shows (read; not age-standardised):** employment 16–64: Muslim 51.4% vs 70.9% overall, "resulted from the high percentages of people who were students or looking after home or family". Looking after home: Muslim women 28.7% vs 9.7% of all women. Level 4+ qualifications: Hindu 54.8%, overall 33.8%, Muslim 32.3%; no qualifications: Muslim 25.3% vs 18.2%.
- **Helps:** `cultural-cost` (women's inactivity). **Hurts:** — (a young age profile and students explain part).

### D165. Second-generation employment studies (UK)
- **Sources (*unverified*, abstracts/snippets only):** Dustmann & Theodoropoulos (LFS 1979–2005, *Oxford Economic Papers*); Platt & Warwick, IFS Deaton Review "Are some ethnic groups more vulnerable…" / ethnicity and labour market (2020–21); Baek, Kulu et al. (UKHLS 2009–21); Platt (2025 conference paper).
- **What they show:** UK-born Pakistani and Bangladeshi women's participation is well above their mothers' generation but still below White British; much of the rise follows education; second-generation degree holders reach professional jobs at similar rates.
- **Helps:** `open-and-build` (convergence). **Hurts:** `open-and-build` (gap persists into second generation). Stage 5 must fetch one primary.

### D166. Merged into D14

### D167. ICM for Channel 4, *What British Muslims Really Think* (fieldwork 2015, broadcast Apr 2016)
- **Source:** Channel 4 press release. https://www.channel4.com/press/news/c4-survey-and-documentary-reveals-what-british-muslims-really-think
- **Measures:** 1,081 Muslim adults, face-to-face, 25 Apr–31 May 2015, **only in areas ≥20% Muslim** (2011 Census) — so it over-represents concentrated communities; control group 1,008 adults by phone (mode differs).
- **Shape:** snapshot.
- **What it shows (read):** homosexuality should be legal: 18% agree, 52% disagree (press control figure 5% disagree, *unverified* — not in release); acceptable for a gay person to teach: 47% disagree; wives should always obey husbands: 39% agree; support for Sharia areas: 23%; sympathy for violence against those who mock the Prophet: 18%; suicide bombing: 4%. Belonging: strong sense of belonging to Britain 86% (vs 83% national); 78% want to integrate on most things; 88% say Britain is a good place for Muslims. No age breakdown in release.
- **Helps:** `cultural-cost` (attitude gap on homosexuality and women). **Hurts:** `cultural-cost` (belonging to Britain as high as the public's; terrorism sympathy small).

### D168. J.L. Partners for the Henry Jackson Society, British Muslims poll (Feb–Mar 2024)
- **Source:** HJS deck, Apr 2024. https://henryjacksonsociety.org/wp-content/uploads/2024/04/HJS-Deck-200324-Final.pdf (HJS is a partisan think tank; fieldwork by J.L. Partners with Number Cruncher).
- **Measures:** 1,000 British Muslims (online panel, quotas and weights incl. country of birth), 14 Feb–12 Mar 2024; 2,013 general public. Critics (Sunder Katwala, *unverified*) dispute question wording.
- **What it shows (read, PDF):** "Only 28% say it would be undesirable to outlaw homosexuality in the UK (compared to 62% of the public)"; net desirability of outlawing homosexuality: Muslims −1, public −47; **UK-born Muslims +5, foreign-born −5**; 18–34 −8. Making it illegal to show a picture of the Prophet: net +27 among Muslims, −31 public (52% vs 16% want it, per HJS). Women taking a more traditional role: net +23 (all age groups +21 to +31). HJS summary: more extreme views more likely among 18–34s, graduates and British-born.
- **Helps:** `cultural-cost` (no sign of liberalising among the UK-born on these questions). **Hurts:** — (partisan commissioner; online panel of a hard-to-reach group).

### D169. Kashyap & Lewis, "British Muslim youth and religious fundamentalism" (*Ethnic and Racial Studies*, 2013) — Faith Matters in British Muslims survey 2009
- **Source:** ORA Oxford repository copy (read, PDF): https://ora.ox.ac.uk/objects/uuid:5ed689a8-9fb0-4aec-ac7f-8fee616b65d8/files/r4m90dx10d (journal citation *unverified*).
- **Measures:** 480 Muslims face-to-face, Jan–May 2009, in output areas ≥10% Muslim (67.5% of GB Muslims); 79% non-response; compared with BSA 2009 (2,457 religious non-Muslims, 1,903 non-religious).
- **What it shows (read, PDF):** "Like other youth, Muslim youth show liberalizing social attitudes across generations on gay marriage and legal abortion"; 74% of Muslim youth support same-sex marriage or civil unions; but "Muslim youth are the most conservative when it comes to the morality of homosexuality, falling even slightly more conservative than their elders." Young Muslim men most supportive of gay marriage *and* of Sharia for civil cases. Religiosity shapes attitudes for Muslims much as for Christians.
- **Helps:** `open-and-build` (policy attitudes liberalise by generation). **Hurts:** `open-and-build` (moral disapproval does not fade). Small, old sample.

### D170. Other attitude evidence (leads)
- **Lewis & Kashyap, *JSSR* (2013), BSA/Citizenship Survey (*unverified*):** Muslims more conservative across sex and gender questions; religiosity among all Britons explains much of the gap.
- **Cambridge thesis using Understanding Society (*unverified*):** second-generation minorities hold more egalitarian gender-role attitudes and more mixed networks than the first generation. https://www.repository.cam.ac.uk/handle/1810/296278
- **Searched, not found:** BSA or ESS published series of attitudes by religion and generation for the UK; Pew has no recent UK Muslim survey (2006 Global Attitudes only, not fetched); Policy Exchange *Unsettled Belonging* (2016) not fetched.

### D171. Migration Observatory, *Migrants and crime in the UK* (2026)
- **Source:** https://migrationobservatory.ox.ac.uk/resources/briefings/migrants-and-crime-in-the-uk/ (page dated 18 Aug 2026). Primary: MoJ Offender Management Statistics; Criminal Justice Statistics (FOI).
- **Measures:** foreign nationals' share of prisoners (self-reported, unverified nationality) and of cautions/convictions; no country of birth; naturalised people counted British.
- **What it shows (read):** E&W prisoners: 12.1% foreign nationals (10,450, Jun 2025); cautions and convictions 13.1% (43,250, 2024); non-citizens ~13.5% of adults (MO estimate, 2025). Roughly proportionate; lower after age adjustment (over-represented under 25 and 65+, under-represented 25–44). Most common in prison: Albanian, Irish, Polish. Local studies: asylum-seeker share linked to +1.1% property crime per point (Bell, Fasani & Machin 2013); EU8 linked to a fall; no violent-crime effects.
- **Helps:** `open-and-build`. **Hurts:** `cultural-cost` (no general over-representation); `cultural-cost` gains only on specific nationalities (Albania) and asylum-seekers' property crime.
- **Gaps:** no published UK convictions by nationality and offence (FOI only); no ethnicity-by-generation data.

### D172. Denmark, Justitsministeriet Forskningsenheden, *Kriminalitet og herkomst 2023* (Apr 2025)
- **Source:** https://www.justitsministeriet.dk/wp-content/uploads/2025/05/Kriminalitet-og-herkomst-2023-WT.pdf (data purchased from Statistics Denmark). DST *Indvandrere i Danmark 2025* (Dec 2025) has country-level indices (*unverified*: Lebanese male descendants 386, Somali 316, Syrian 312, Iraqi 268).
- **Measures:** age-corrected index (100 = average) of persons aged 15–79 with a conviction under the criminal code or drugs law, 2023. **Not** corrected for income or education (DST publishes such versions — not fetched).
- **What it shows (read, PDF):** men, criminal code: Danish origin 88; Western immigrants 85; Western descendants 131; **non-Western immigrants 158; non-Western descendants 262**. Violence: non-Western descendants 293; drug dealing 435 (from chart). Descendants of non-Western origin are "markant mindre kriminelt belastet i dag end tidligere" — share convicted by birth cohort has fallen — though the count rose from 654 (2000) to 2,301 (2023) as the group grew.
- **Helps:** `cultural-cost` (the second generation offends more than the first, and far more than natives). **Hurts:** `cultural-cost` (cohort rates falling; no socio-economic control here).

### D173. MoJ refusal to publish convictions by nationality (record)
- **What it shows (*unverified*, Brussels Signal, Jul 2026):** the ICO ordered MoJ on 22 Jun 2026 to release 2018–2024 E&W convictions by nationality and offence (FOI by the Centre for Migration Control); MoJ is appealing. A press analysis of MoJ data claimed non-GB citizens were 71% more likely to have sex-offence convictions (2021–23) (*unverified*; denominators not checked).
- **Use:** documents the recording gap; the "71%" claim needs its source and age adjustment before use.

### D174. Home Office, *Operation of police powers under the Terrorism Act 2000*, to June 2026
- **Source:** Home Office accredited official statistics, published 8 Oct 2026. https://www.gov.uk/government/statistics/operation-of-police-powers-under-tact-2000-to-june-2026 (release text fetched).
- **Measures:** terrorism-related arrests (GB) and outcomes; persons in custody for terrorism and terrorism-connected offences by ideology (series from year ending June 2015; ideology split comparable from 2021), self-declared nationality and religion. **Not** country of birth. Arrests are not broken down by ideology.
- **Coverage:** arrests since 11 Sep 2001. **Shape:** series.
- **What it shows (read):**
  - **Prisoners (30 Jun 2026):** 275, the highest on record; **57% Islamist**, 29% extreme right-wing, 14% other. Islamist share fell from 70% (2021); ERW rose from 22%. Islamist count unchanged at 157. 82% self-declare UK nationality; 60% Muslim.
  - **Arrests:** 3,867 in the year, of which 3,630 (94%) linked to supporting Palestine Action after its proscription on 5 Jul 2025 (average age 59; 96% White where known); the 10-year median was 238. Non-PA arrests: 237; 56% White, 27% Asian (where known).
  - **Nationality:** since 2001, 73% of arrestees self-defined as British or British dual; not below 68% in any of the last 15 years.
- **Helps:** `cultural-cost` (Islamist the largest prisoner group; ~4 times the Muslim population share among prisoners, my arithmetic vs 6.5% Muslim). **Hurts:** `cultural-cost`'s immigration framing (most are British nationals; the ERW share is rising). Note: "home-grown" supports the outline's own wording ("in communities that integration has not reached") but the data cannot show integration status.
- **Likely status:** well-supported for prisoners; arrest totals for 2025–26 must exclude Palestine Action to be comparable.

### D175. Home Office, *Individuals referred to and supported through the Prevent programme, April 2024 to March 2025*
- **Source:** https://www.gov.uk/government/statistics/individuals-referred-to-prevent-to-march-2025/individuals-referred-to-and-supported-through-the-prevent-programme-april-2024-to-march-2025 (official statistics in development; extracted 29 Sep 2025). Series since 2015/16.
- **What it shows (read):** 8,778 referrals (record; +27%). Extreme right-wing 21% (1,798); Islamist 10% (870); no ideology categories 56% (4,917). Channel cases adopted: ERW 612 of 1,464 (42%), Islamist 226 (15%). Methodology changed (new PCMT system), so comparisons need caution.
- **Helps:** `blame-underinvestment` / `open-and-build` (ERW the largest named ideology). **Hurts:** `cultural-cost` on its face; but referrals measure what teachers and others report, not threat — the Shawcross review (2023) argued Prevent under-refers Islamism (*unverified*).

### D176. MI5 caseload (Director General's threat updates)
- **What it shows (*unverified*):** Islamist terrorism ~75% of MI5's counter-terrorism caseload, ERW ~25% (Pool Re 2025 citing MI5); 19 late-stage plots disrupted since Jan 2020; Oct 2025 update said anti-immigration and anti-Muslim grievance is "tipping into terrorist intent" (Arab News report of the 16 Oct 2025 speech).
- **Blocked:** mi5.gov.uk returned 403; globalsecurity.org copy 402. Stage 5 must download the speech by hand.
- **Helps:** `cultural-cost` (three-quarters of caseload). **Hurts:** — (no birthplace data).

### D177. Census 1951–2021: foreign-born share, England and Wales and local authorities
- **Source:** ONS, *International migration, England and Wales: Census 2021*, 2 Nov 2022. https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/internationalmigrationenglandandwales/census2021 ; 1951–2011 from ONS 2013 (fact file `share-of-the-population-born-abroad`). LA change computed by me from Nomis: KS204EW (2011, NM_611_1, pre-2015 districts) and TS004 (2021, NM_2024_1, 2022 districts), https://www.nomisweb.co.uk/api/v01/dataset/…
- **Coverage:** census years 1951–2021; LAs 2011 and 2021 (323 LAs with unchanged codes; merged authorities dropped). Mid-2024 UK estimate 13.1m non-UK-born (fact file, *unverified*).
- **Shape:** series; LA comparison.
- **What it shows:**
  - E&W non-UK-born: 4.3% (1951), 8.9% (2001), 13.4% (2011), 16.8% / 10.0m (2021); 42.4% of the non-UK-born arrived 2011–21 (read).
  - Highest 2021: Brent 56.1%, Westminster 55.6%, Kensington & Chelsea 53.9%, Slough 44.0%, Leicester 41.1% (read).
  - **Largest rises 2011→2021 (my computation from Nomis; read data):** City of London +12.9 pts; Barking & Dagenham 30.9%→41.3% (+10.4); Watford 24.7→34.0; Havering 10.3→19.4; Thurrock 12.0→21.0; Reading +8.7; Cambridge +8.6; Boston 15.1→23.6; Hillingdon +8.5; Dartford 11.3→19.7; Sandwell +7.7; Peterborough +7.6; Swindon +7.5; Luton +7.5. Several inner-London boroughs flat (Newham 53.7%→53.7%).
  - Fastest-growing countries of birth: Romania 80,000→539,000 (+576%) (read).
- **Helps:** `cultural-cost` (rapid change in outer London and some towns: Boston, Peterborough, Thurrock). **Hurts:** `cultural-cost`'s "very different cultures" framing for these towns — the fastest growth was largely EU (Romanian, Polish), not MENAPT. Stage 5: add 2001 LA shares to test "more in a decade than a century".
- **Likely status:** well-supported.

### D178. International comparators (OECD *International Migration Outlook 2025*; Eurostat)
- **What it shows (*unverified*):** OECD foreign-born share 11.5% (2024), up from 9.1% (2014). Selected EU shares ~14% (France), 18–19% (Germany, Spain), 11% (Italy) — country assignment unclear from snippet.
- **Blocked:** Eurostat API (ec.europa.eu) refused connection from the sandbox. Stage 5: OECD statistical annex table A.4/B.4.
- **Use:** places the UK's 16.8% among large European peers — neither an outlier nor low.

### D179. Census 2021: main language and proficiency, and characteristics by arrival period
- **Source:** ONS, *Language, England and Wales: Census 2021*, 29 Nov 2022, https://www.ons.gov.uk/peoplepopulationandcommunity/culturalidentity/language/bulletins/languageenglandandwales/census2021 ; ONS, *Analysis of social characteristics of international migrants living in England and Wales: Census 2021*, 18 Sep 2023, https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/analysisofsocialcharacteristicsofinternationalmigrantslivinginenglandandwales/census2021 . Full cross-tab: dataset "length of residence × proficiency in English × religion".
- **Measures:** self-reported proficiency, asked only of those whose main language is not English. No generation (no parents' birthplace).
- **Shape:** snapshot; arrival-period cross-section (not a cohort followed over time).
- **What it shows (read):** English main language 91.1% (2021) vs 92.3% (2011). Cannot speak English well 1.5% (880,000); not at all 0.3% (161,000). By arrival: English main language 84% of pre-1971 arrivals vs 37% of 2011–21 arrivals; "not well" 11% of 2011–21 arrivals vs 4% pre-1971; "not at all" 1–2% in every period. UK-only national identity: 94% of non-EU-born arrivals before 1951, 81% of 1981–90 arrivals, 20% of 2011–21 arrivals.
- **Helps:** `open-and-build` (proficiency and identity rise with time in the UK). **Hurts:** `open-and-build` mildly (recent arrivals' identity and language lag; cross-section confounds period with cohort). Origin split exists in the datasets (not fetched).

### D180. Catney et al., "Ethnic diversification and neighbourhood mixing: a rapid response analysis of the 2021 Census of England and Wales" (*Geographical Journal* 189(1), 2023)
- **Source:** open access, doi 10.1111/geoj.12507; QUB copy: https://pureadmin.qub.ac.uk/ws/portalfiles/portal/424693520/Ethnic_diversification.pdf
- **Measures:** Index of Dissimilarity (evenness of each group vs all others) across 2021 LSOAs, 1991–2021, eight groups; Reciprocal Diversity Index by district.
- **Shape:** series (four censuses).
- **What it shows (read, PDF):** "steady declines in segregation for all ethnic groups: White and minority", 1991–2021; largest proportional fall Black African (−0.17); Bangladeshi, Black Caribbean and Indian also large. White British D 0.55 (2001, 2011) → 0.53 (2021). Pakistani group grew 0.91% (1991) → 2.66% (2021). Pakistani D values are in Figure 7 only (not extracted).
- **Helps:** `open-and-build` (segregation falling everywhere). **Hurts:** `cultural-cost`'s "parallel communities" if read as rising segregation. **Caveat for `cultural-cost`:** D measures evenness; exposure/isolation (share of a group's neighbours from the same group) can rise as a group grows — Casey Review 2016 and Kaufmann make that argument (*unverified*, not fetched). Stage 5 should get an isolation index for Pakistani and Bangladeshi groups.

### D181. iCoCo Foundation, SchoolDash & The Challenge, *Understanding School Segregation in England 2011 to 2016* (2017)
- **What it shows (*unverified*, summaries):** 26% of primary and 40.6% of secondary schools ethnically segregated relative to their 10 nearest schools (2016); over 84% of non-Christian faith schools "segregated"; Bradford secondaries 89%→70% (2011→2016).
- **Use:** only school measure found; dated. Burgess et al. school-segregation series and DfE school census composition not reached. **Helps:** `cultural-cost` (school-level separation is higher than residential). **Hurts:** `cultural-cost` (falling in Bradford).

### D182. DCMS, *Community Life Survey 2023/24*
- **Source:** published 4 Dec 2024. https://www.gov.uk/government/statistics/community-life-survey-202324-annual-publication/community-life-survey-202324-background-and-headline-findings
- **Measures:** England adults; push-to-web since 2013/14 (with paper option). Series continues the Citizenship Survey (2001–2011, face-to-face, not comparable).
- **What it shows (read):** "people from different backgrounds get on well together": 81% (84% in 2021/22; 80–83% since 2013/14). "Many people in the neighbourhood can be trusted": 41% (42% in 2021/22; 40–42% since 2016/17; 48% in 2013/14).
- **Helps:** `open-and-build` (cohesion stable through record inflows 2021–24). **Hurts:** `open-and-build` mildly (neighbourhood trust fell 2013/14–2016/17). National only; no link to local migration pace.

### D183. Research record on diversity and trust
- **Sources:** Migration Observatory briefing *Immigration, diversity and social cohesion* (13 Dec 2019, read): https://migrationobservatory.ox.ac.uk/resources/briefings/immigration-diversity-and-social-cohesion/ ; Dinesen, Schaeffer & Sønderskov, *Annual Review of Political Science* 23 (2020), meta-analysis of 1,001 estimates from 87 studies (*unverified*).
- **What it shows:** MO (read): "Most of the empirical literature … finds that the relationship between diversity and trust is negative"; Sturgis et al. (2013, London) — controlling deprivation, diversity linked to *higher* perceived cohesion, while segregation linked to lower; Laurence (2011, Citizenship Survey) — diversity linked to lower neighbourhood trust, softened by bridging ties. Dinesen et al. (*unverified*): small, statistically significant negative association, stronger for trust in neighbours and at more local scales; covariates change it only slightly.
- **Helps:** `cultural-cost` (consistent small negative effect on neighbourhood trust). **Hurts:** `cultural-cost` (small; deprivation and segregation matter; no evidence of a tipping point). **Not found:** any study linking the *pace* of local migration to trust in democracy or national institutions (searched UK studies via MO; Kaufmann's work on pace and white British attitudes not fetched).

### D184. DfE Key Stage 4: Attainment 8 by ethnicity (Ethnicity facts and figures)
- **Source:** https://www.ethnicity-facts-figures.service.gov.uk/education-skills-and-training/11-to-16-years-old/gcse-results-attainment-8-for-children-aged-14-to-16-key-stage-4/latest/ (2022/23, publ. 7 Nov 2024). DfE KS4 performance tables have later years (2023/24, 2024/25) — not fetched.
- **Measures:** ethnicity, not migrant generation or country of birth; FSM split.
- **What it shows (read, 2022/23, out of 90):** all 46.3; White British 44.9; Chinese 65.5; Indian 59.4; Bangladeshi 51.9; Black African 48.7; Pakistani 47.0; Black Caribbean 40.0; Gypsy/Roma 20.3; Irish Traveller 26.8. FSM pupils: White British 30.9 vs Bangladeshi 47.7, Pakistani 42.2, Black African 44.7.
- **Helps:** `open-and-build` (most minority groups — including Pakistani and Bangladeshi — outperform White British, especially among poor pupils). **Hurts:** `open-and-build` for Black Caribbean (below average).

### D185. DfE: higher-education entry rates at 18 by ethnicity (Ethnicity facts and figures)
- **Source:** https://www.ethnicity-facts-figures.service.gov.uk/education-skills-and-training/higher-education/entry-rates-into-higher-education/latest/ (2024, publ. 9 Jul 2025). English state-school pupils.
- **Coverage:** 2006–2024. **Shape:** series.
- **What it shows (read, 2024):** Chinese 66.1%; Asian 51.4%; Black 48.0%; Mixed 37.0%; White 29.8%. Black rose from 21.6% (2006); White from 21.8%. Detailed groups not on this page.
- **Helps:** `open-and-build`. **Hurts:** `cultural-cost`'s "integration fails across generations" for education.

---

## 3c. Proposed reports

Seven combined reports and an **Other facts** report
([stage 4b](../../WORKFLOW.md#4b-plan-the-combined-reports)). Each is read
as a whole; where viewpoints argue about the same area, they point to
different observations in the same report. Viewpoint ids are abbreviated:
**ES** `end-settlement`, **EC** `economic-cost`, **CC** `cultural-cost`,
**CE** `contribute-and-earn`, **KW** `keep-our-word`, **OB**
`open-and-build`, **BU** `blame-underinvestment`.

The published topic's fact files map onto these reports and will be
rebuilt in stage 5, keeping their ids where a report replaces one file
(the rest redirect).

### I1. Migration and population over the long run

- **Artifacts, in reading order:**
  1. Immigration, emigration and net migration, 1964–2025, with method
     breaks marked (*run*; D1, D2).
  2. Net migration by route and reason, 2019–2025 (*mechanism*; D7).
  3. Population growth: natural change against net migration (*denominator*; D3).
  4. Projections under zero, low, principal and high migration, and the
     old-age ratio under each (*counterfactual*; D69).
  5. Manifesto pledges against outcomes, and polling on preferred levels
     (*rest of the record*; D10, D11).
  6. Cross-country net migration per head (*comparators*; D5, if the OECD
     annex can be obtained).
- **Observations:**
  - *Net migration peaked at about 944,000 and has fallen by about
    four-fifths* — OB (already fallen), EC (fell only through reversible
    rule changes).
  - *Gross arrivals of about 4.7 million in 2022–25, net about 2.5 million* — EC, ES.
  - *Migration is almost all of population growth* — EC, OB.
  - *Zero migration gives a smaller, much older population; high migration
    slows ageing but does not stop it* — OB, EC.
  - *The UK's negative net migration years came from emigration* — ES (precedent), OB.
  - *"Tens of thousands" was met only during Covid* — EC, ES.

### I2. Work and study routes, and the care workforce

- **Artifacts:**
  1. Entry visas by route, 2014–2026, with the high-skilled routes
     broken out (*run, slice*; D100).
  2. Care-worker visas by quarter, with the March 2024 dependant ban and
     the July 2025 closure marked (*counterfactual*; D101, D118).
  3. Adult social care: vacancies, pay against the National Living Wage,
     British-held and visa-held posts, 2016/17–2025/26 (*run, mechanism*;
     D103, D104).
  4. Sponsor licence revocations against registered sponsors (*denominator*; D107, D106).
  5. Nurses and doctors joining by training origin; UK nursing
     acceptances; medical school places (*rest of the record*; D110–D113).
  6. NHS staff by nationality, 2009–2025 (*run*; D75).
  7. Graduate-route holders' first-year earnings against UK graduates
     (*comparators*; D116).
  8. Asylum claims by people who arrived on visas, by route, against
     visas issued (*denominator*; D115, D100).
- **Observations:**
  - *The care route brought far more than planned, and collapsed after
    the dependant ban, not the closure* — CE (scale), OB and BU (timing).
  - *Care vacancies fell to a decade low after the route closed* — CE.
  - *British-held care posts fell by 130,000* — CE (substitution), BU
    (pay), OB (reliance).
  - *UK-trained nurses joining rose at the peak of overseas recruitment* — OB, BU.
  - *Revocations are at a record* — CE, BU.
  - *About a fifth of NHS staff are non-UK nationals* — OB, BU.
  - *High-skilled routes are about 3.6% of work visas* — OB, CE's concession.
  - *Visa-to-asylum claims: 41% of claims, a small share of each route* — CE, OB.

### I3. The economy and the public finances

- **Artifacts:**
  1. GDP and GDP per head, 1996–2026 (*run*; D50); GDP per head across the
     G7, 2007–2024 (*comparators*; D51).
  2. The OBR's migration scenarios: GDP, GDP per head and borrowing
     (*counterfactual*; D52), and its forecast revisions (D53).
  3. Lifetime net fiscal contribution by route and wage, with the
     age-matched UK resident and the population average beside it
     (*denominator, comparators*; D55, D54, D56).
  4. Earnings by route, and earnings growth with years since arrival
     (*slice, run*; D60, D61).
  5. The record of headline cost estimates: CPS's £234bn and its
     withdrawal, Reform's £622bn and its discounted equivalent, Migration
     Watch, Oxford Economics (*rest of the record*; D18, D57, D59, D70).
  6. Wage effects on UK-born workers by wage level (*slice*; D56, D77).
  7. International students' fees and university finances (*record*; D71–D73).
  8. Founders and inventors (*record*; D78, D79).
- **Observations:**
  - *GDP per head has barely grown since 2019* — EC.
  - *The OBR finds the per-head effect small and of uncertain sign, and the
    G7 stalled alike* — OB.
  - *Lower migration raises borrowing in the OBR's five-year scenarios* — OB.
  - *Skilled Workers are a large net gain; care workers and Health and Care
    dependants are net costs* — CE, OB, EC, ES.
  - *The average resident is a lifetime net cost* — OB, KW (comparator).
  - *The £234bn was withdrawn by its author* — KW, OB; ES's concession.
  - *Small average wage effects, slightly negative at the bottom* — OB, EC.
  - *A third of universities are in deficit* — OB.

### I4. Housing and public services

- **Artifacts:**
  1. Net additional dwellings against household growth, 1991–2025
     (*run*; D64, D65).
  2. Private rents and house prices, 2015–2026, with net migration beside
     them (*run, counterfactual*; D63, D1).
  3. The best estimate of migration's effect on house prices, and the
     regional evidence (*mechanism*; D62, D66).
  4. Pupil numbers and projections; GPs and patients (*denominator*; D68, D67).
  5. Social-rent completions since 1991; public investment in OECD
     comparison; NHS and school spending per head since 2010 (*rest of
     the record*; D124–D127, D133).
- **Observations:**
  - *Rent growth fell from 9.1% to about 3.5% as migration fell* — EC.
  - *Rents are still rising* — OB.
  - *Immigration explains about 4–6% of the real house-price rise* — OB, BU.
  - *Pupil numbers are falling, GPs rising* — OB, BU.
  - *Social-rent building fell after 2010 and public investment was low* — BU.
  - *Day-to-day spending per head was not cut* — EC.

### I5. Settlement and migrants' status

- **Artifacts:**
  1. Settlement grants by route, 2004–2026, and the Home Office forecast
     to 2030 (*run*; D9, D6).
  2. Who is on a path to settlement, and the estimated stock of ILR and
     EUSS holders (*denominator*; D27, D12, D9).
  3. What happens to each route's migrants: share who settle (*mechanism*; D8).
  4. ILR holders and visa holders on Universal Credit and in new social
     lettings (*proxy, with its limits*; D14, D16).
  5. The rules: what route guidance said, s.76 revocation powers, *HSMP
     Forum*, past transitional protection; the earned-settlement proposal
     and its status (*record*; D21, D22, D26, D29, D30, D6).
  6. Waits for permanent residence in other countries (*comparators*; D19).
  7. Fees against unit costs; the health surcharge; no recourse to public
     funds (*record*; D119, D120, D122, D123).
  8. Windrush (*record*; D23).
  9. Polling on ending and revoking ILR (*record*; D25).
- **Observations:**
  - *About 1.6 million are expected to qualify in 2026–30* — ES, EC, CE.
  - *About 2.2 million are on a five-year path* — KW.
  - *No official data on ILR holders' work or benefits* — KW, ES's concession.
  - *EUSS holders far outnumber non-EU ILR holders* — KW, OB.
  - *Guidance said "may be able to apply"; the High Court struck down a
    mid-route change in 2008* — ES, CE (first); KW (second).
  - *A ten-year baseline would make the UK an outlier* — KW.
  - *ILR costs ten times its processing cost; the surcharge matches
    average use* — BU, KW; CE.
  - *Revoking existing ILR is opposed 58–29; ending it for new arrivals
    splits evenly* — KW, ES.

### I6. Integration: language, work, schooling, segregation and trust

- **Artifacts:**
  1. The foreign-born share, 1951–2021, nationally and in the
     fastest-changing local authorities, by region of birth (*run, slice*; D177).
  2. English proficiency by period of arrival (*run*; D179).
  3. Employment by ethnicity, 2004–2025, and by religion (*slice, run*; D163, D164, D165).
  4. Fiscal contribution by origin where published: Denmark, the
     Netherlands, Norway (*comparators*; D160–D162).
  5. GCSE attainment and university entry by ethnicity (*counter-record*; D184, D185).
  6. Residential segregation by ethnic group, 1991–2021 (*run*; D180), and
     school segregation (D181).
  7. Social trust and cohesion, 2013/14–2023/24, and the research record
     on diversity and trust (*run, rest of the record*; D182, D183).
  8. Attitudes to homosexuality and gender roles by religion, with each
     survey's method (*slice*; D167–D170).
- **Observations:**
  - *The foreign-born share has quadrupled since 1951* — CC.
  - *The fastest-changing towns gained mostly EU migrants* — OB.
  - *Large but narrowing employment gaps by ethnicity* — CC (gaps), OB (narrowing).
  - *Denmark: MENAPT immigrants are net costs where Western immigrants
    are net contributors* — CC; *the cost fell sharply as employment rose* — OB.
  - *Most minority groups outperform White British pupils* — OB.
  - *Segregation fell for every group* — OB.
  - *Cohesion stable; neighbourhood trust lower than in 2013/14* — OB, CC.
  - *British Muslims more conservative on homosexuality; the evidence on
    generations is thin* — CC; OB.

### I7. Crime, terrorism and group-based child sexual exploitation

- **Artifacts:**
  1. Convictions and prison population by nationality, against population
     share and adjusted for age (*denominator*; D171, D173).
  2. Offending by origin and generation in Denmark (*comparators*; D172).
  3. Terrorism prisoners and arrests by ideology and nationality, 2001–2026,
     with 2025–26 Palestine Action arrests shown separately (*run, slice*;
     D174); Prevent referrals by ideology (D175); MI5 caseload (D176).
  4. Group-based child sexual exploitation: what each inquiry found —
     victims, offenders, why officials did not act (*record*; D150–D153).
  5. Suspects by ethnicity against population share, where recorded, with
     the share unrecorded shown (*denominator*; D150, D154, D157).
  6. All child sexual abuse by relationship of offender, and sexual
     offence convictions by ethnicity (*base rate*; D156, D158).
  7. The national inquiry and Operation Beaconport: status (*record*; D155).
  8. Hate crime by month, 2015–2026, with events marked (*run*; D128),
     and the research on what drives spikes (D129–D132).
- **Observations:**
  - *Non-citizens' share of convictions and prisoners matches their
    population share* — OB.
  - *In Denmark, descendants of non-Western migrants offend more than
    their parents* — CC.
  - *Islamists are the largest group of terrorist prisoners; most are
    British* — CC (both); OB (second).
  - *Prevent referrals now run two to one extreme right-wing* — OB, BU.
  - *In the places investigated, offenders were mostly Pakistani-heritage
    men, and officials feared being called racist* — CC.
  - *Ethnicity is unrecorded for about two-thirds of suspects nationally* —
    CC (a recording failure), OB (no national claim possible).
  - *Most child sexual abuse is outside gangs* — OB.
  - *Hate crime spikes follow events* — BU, OB, EC.

### Other facts

- Universal Credit claimants by nationality (D14), if not used in I5.

**Check: does any report serve only one viewpoint?** No: each has
observations for at least three. I7 is where `cultural-cost` makes its
strongest case; the report must show the recorded-share gaps beside every
local figure, so that its neutrality does not rest on the reader's goodwill.

---

## 3d. Problems for the human

### Decisions for the stage-4 review

1. **`end-settlement` stays as Reform's actual position.** Its strongest
   supported part is ending ILR for new arrivals (D6, D55, D60). Revoking
   ILR already held and net negative migration rest on values, with no
   data on the people affected and no precedent (D14, D24). The fallback
   positions already exist: `economic-cost` (ten years before ILR, no
   benefits for non-citizens) and `contribute-and-earn` (earned
   settlement). **Recommendation:** no separate fallback viewpoint.
2. **`cultural-cost` lost several claims to the evidence** (segregation,
   UK offending, terrorists' nationality, fastest-changing towns) and kept
   grooming gangs in the places investigated, Danish and Dutch outcomes by
   origin, second-generation offending in Denmark, and attitudes. It
   still has a substantive empirical case. Its main crux — whether gaps
   persist across generations in Britain — has no British data to settle
   it.
3. **Report I7 brings crime, terrorism and grooming gangs together.** It
   puts every local grooming-gang figure beside the national recording
   gap and the base rate for all child sexual abuse. The alternative is to
   give grooming gangs a report of their own, which would serve one
   viewpoint.
4. **Published fact files.** The seven reports replace the published 24
   immigration fact files (seven asylum files move to `uk-asylum`). Stage 5
   keeps an id where one report replaces one file and adds redirects for
   the rest.
5. **Downloads needed by hand before stage 5:** the OBR March 2026
   Economic and fiscal outlook and the 2024 Fiscal risks chart data; NHS
   Digital workforce by nationality; the Commons Library briefings; the
   OECD *International Migration Outlook 2025* annex; HESA finance tables;
   the Skills for Care full report; the CPS *Here to stay* PDF and Reform's
   April 2026 report; the OECD *Health at a Glance 2025* chapters; MI5's
   caseload statement. Each is listed with what was tried in the area
   sections below.


### Levels, population and settlement

**Claims in the outline the evidence does not support, or needs narrowing**
- **"Reform puts the saving from its plan at £234bn"** (`end-settlement`): the figure is the CPS's estimate of the net lifetime cost of *settling* ~801,000 people, not a saving from revoking existing ILR, and the CPS says it "should no longer be used" (D18). The argument should say so or drop the number.
- **"Around 4.5 million people arrived in the four years after 2021"** (`economic-cost`): true of gross immigration (≈4.66m in 2022–25; ≈4.8m in 2021–24, D1), but net migration over 2021–24 was ≈2.5m and arrivals include British returners. Phrase as gross.
- **"Mahmood said on 1 March 2026 that it would apply to people already here"** (Topic): no source found for that date; a secondary source gives 5 March 2026, and the November 2025 command paper already said so (D6, D30). Correct the date or cite CP 1448.
- **Reform "including for people who already hold it"**: Reform exempts EU Settlement Scheme holders (D13), who hold most settled non-citizen status (~4.6m EUSS settled grants vs 0.6–0.8m non-EU ILR holders; D9, D12). The viewpoint's "net negative" aim leaves the largest group untouched.
- **`end-settlement` "Only net emigration ... can undo"**: no rich democracy has achieved net negative migration by policy (D24); the UK's negative years (D1) came from emigration when inflows were ~200,000 a year.
- **`keep-our-word` "rules said they could settle after five years"**: the guidance says "you may be able to apply" subject to requirements (D26). Only the BN(O) statement is framed as a commitment. HAC says mid-route changes are "not unprecedented" (D29).
- **The Home Secretary's "616,000 arrivals against 6,000–40,000 jobs"** (`contribute-and-earn` context): HAC notes the 6,000–40,000 was an annual worker estimate and 616,000 includes dependants and non-care Health and Care visas (D29).
- **Outline: deaths exceed births "from mid-2026"** (ONS 2024-based principal) vs "from 2030" (Migration Observatory briefing). Check which projection each uses (D4).

**Viewpoints with little data**
- `end-settlement`'s central empirical claim — ILR holders' benefits, social housing and employment by route — has **no direct official data** (D14–D17 are proxies). Its comparators (Gulf, Singapore) rest on non-democracies whose rules include marriage and pregnancy bans (D19).
- `keep-our-word`'s "retroactive changes deter skilled people": no study found on destination choice or departures in response to settlement waits (D28 covers refugees' behaviour once there).

**Missing data**
- No official count of ILR holders (ONS and Home Office publish grants only; D12).
- No ILR-holder outcomes by route and years since arrival.
- Archived 2021–24 versions of route guidance (what applicants saw) not yet fetched (D26).
- Reform's own policy document on ILR not found; details come from press reports (D13).
- Old-age dependency under migration variants: in ONS tables, not yet read (D4).

**Disputed or unreliable sources**
- CPS £234bn (withdrawn by its author, D18).
- World Bank/UN net migration series disagrees sharply with ONS (UK 2023: 445,523 vs ONS ~848,000) and with ABS for Australia; do not use it for per-head comparisons (D5).
- Migration Observatory and ONS describe the 2025–26 revisions differently (which release revised what; D2).
- *Migrant journey 2025* gives skilled-Worker ILR rate as both 41% and 27% (D8).
- DWP UC immigration status is "statistics in development"; naturalised people may still appear as ILR (D14).

**Blocked sources (what was tried)**
- **OECD *International Migration Outlook 2025*** (per-head comparisons): WebFetch 403; curl 403. Not tried: archive. Needs manual download of the statistical annex.
- **HAC report** publications.parliament.uk: 403 on WebFetch and curl; read via `web.archive.org/web/2026id_/` raw copy.
- **Arendt, Dustmann and Ku (JOLE)** and SSRN: 403; read via the CReAM discussion paper instead.
- **VoxEU/CEPR column**: 403; not needed after CReAM.
- **ONS 2025 revisions detail** (old vs new 2024 and British emigration figures): not on fetched bulletin pages; figures are press snippets.

### Economics

**Claims the evidence does not support, or undercuts**

1. **`economic-cost`: "Migration… adding to… pressure on GPs and schools."** School rolls in England are falling (−112,200 in 2026, projected to fall to 2030; D68), and GP numbers are up 2,382 since 2019 (D67). Narrow to local pressure, or to hospitals and GPs per patient over 2016–24 if stage 5 confirms it.
2. **`economic-cost`: "GDP per head has barely grown" as an effect of migration.** True as description (D50). But the OBR finds the per-person effect small and of uncertain sign (D52), and Germany and Canada were also flat (D51). Phrase it as a risk (capital dilution, low-wage composition), not a finding.
3. **`economic-cost`: "Migration has driven most recent household growth, outrunning housebuilding."** No official estimate of the migration share of household growth was found for the 2022-based projections. The best price estimate is 4–6% of the long-run rise (D62). Rent growth fell from 9.1% to about 3.5% as migration fell (D63), which is consistent with some effect but is not isolated from interest rates.
4. **`open-and-build`: "rents… have not fallen".** True of levels, but rent inflation more than halved (D63). The report should show both, or the claim reads as cherry-picked.
5. **`end-settlement`: the £234bn.** Withdrawn by the CPS itself on 22 Sep 2025 (D58). Reform now cites £622bn, undiscounted; its own discounted figure is £154bn (D59). The outline's "whatever the true figure" is right. The argument should rest on MAC route estimates (care workers −£36k, Health and Care dependants −£67k; D55), not on Reform's totals.
6. **`open-and-build`: "the OBR has lowered its growth and revenue forecasts as migration fell".** Partly. March 2026 cut potential output by 0.25% in 2030 (D53), but November 2025 made no net change, and the large borrowing figure (£19.9bn) is a 2024 scenario, not a revision (D52). Name the scenario.
7. **`open-and-build`: ageing.** Migration slows but does not reverse the rise in the old-age ratio; even 455k a year leaves it at 457 per 1,000 in 2074, up from 302 (D69). The OBR (2013, via D57): migration "delay[s]" the problem rather than resolving it.
8. **Denominator for fiscal claims.** The average UK resident is a lifetime net cost (mean −£39k, median −£145k; D55). Claims that a group is "a net cost" need this comparator, and an age-matched one.

**Viewpoints with thin data**

- **`blame-underinvestment`:** only D52 (spending per person not raised with population) and D67 (staffing). Public investment per head since 2010 was not researched here; it is probably another agent's question.
- **`end-settlement`:** nothing in this area supports net-negative migration economically. D69 shows zero migration gives the oldest population.

**Missing data (searched, none found)**

- **The share of household growth due to migration (England, 2022-based):** the bulletin has no zero-migration household variant. Older DCLG 2014-based projections reportedly put it at about 37% (***unverified***, memory). Ask the ONS, or compute from the subnational variant.
- **Earnings and fiscal contribution by route over years since arrival:** the Home Office–HMRC data is a single year (D60). HMRC RTI cohorts are by EU/non-EU, not route (D61).
- **Capital per worker, and the employment and earnings of the 2021–24 arrivals specifically,** linked to GDP per head: no study found.
- **Patients per GP and hospital activity per head, 2015–2026:** not obtained.
- **A UK foreign-born share of patents:** none found (D79). Business founding rates per head by route: none found.
- **Post-Brexit wage-effect studies:** none exist, per the Migration Observatory (D77).
- **Old-age dependency comparators (other ageing countries):** not fetched. Use Eurostat proj_23ndbi or the UN World Population Prospects.

**Disputed or partisan sources**

- **D58 and D59** (CPS, Reform): partisan, withdrawn or criticised.
- **D73** (HEPI / London Economics / Kaplan): sector-funded.
- **D78** (Entrepreneurs Network): an advocacy think tank.
- **Migration Watch figures in D57:** a restrictionist think tank; the most negative of the pre-Brexit series.

**Blocked sources (what was tried)**

- **OBR (obr.uk):** Cloudflare blocks WebFetch and curl. The March 2024, March 2025 and November 2025 EFOs and the 2024 FRS were read via Wayback. **The March 2026 EFO is not archived**; the human should download it, along with the FRS 2024 Chart 4.13 data for the representative-migrant values.
- **NHS Digital (digital.nhs.uk):** Cloudflare (both tools). NHS workforce by nationality and the GP workforce series are needed.
- **House of Commons Library CBP-7783:** Cloudflare.
- **HESA finance tables (hesa.ac.uk):** 403.
- **OfS report PDF:** curl returned an empty file. The press release was read instead.
- **Not opened** (download by hand): the Skills for Care full report, the CPS *Here to stay* PDF, Reform's April 2026 report, and the Resolution Foundation slides.

### Work and study routes; migrants' rights

**Claims the evidence undercuts**

1. **The July 2025 closure did not cut care recruitment; the March 2024 dependant ban did.** Care-worker grants fell from 34,639 in 2023 Q3 to 3,450 in 2024 Q1 (D101). The white paper itself estimated the closure at −7,000 a year (D118). Any viewpoint text crediting or blaming the 2025 closure needs rewording.
2. **"Overseas recruitment substituted for training" fails for nursing** (D110: UK-educated joiners grew 11.9% in 2023-24, at the international peak). For medicine, training was government-capped (D113). It is arguable only for care (D103), where pay at the wage floor offers a rival explanation (D104: MAC blames underfunding). `contribute-and-earn`'s argument should be narrowed to care, or stated as a prediction.
3. **"Fees charge many times the cost" holds for application fees** (ILR £3,226 vs £310 unit cost), **not for the health surcharge**, which is pegged to estimated average health use (D119, D120). `blame-underinvestment` should separate the two.
4. **"Underinvestment" holds for capital and social housing, not current spending.** NHS spending per head rose throughout, and school spending per pupil is back to its 2010 level (D125, D133). The viewpoint's first argument should say "investment" and "council housing", not "spending".
5. **Rhetoric → violence:** UK evidence ties spikes to events (the referendum result, Southport, terror attacks) and to revealed norms. No UK study isolates politicians' rhetoric. German social-media evidence is the strongest (D132). As written, the claim probably fails the 90% test. Reframe it as "anti-migrant mobilisation and disinformation accompany hate-crime spikes".
6. **The high-skilled routes are tiny and not growing in numbers.** About 9,400 entry visas in 2025, 3.6% of work visas; Innovator Founder fell ~90% from 2019 (D100). `contribute-and-earn`'s "make those routes easier" has little track record to point to.
7. **Revocations are not exploitation.** The official series (D107) has no sector or worker counts, and practitioners say many revocations are for paperwork. Only the 2025 Home Office care figure (470 licences, 39,000 workers; D106) links revocations to care, and it is unverified.

**Thin or missing data**

- **Graduate route "years after study":** only first-year PAYE data (D116). The Home Office migrant journey report (2025) gives how many are still on leave, not their earnings. LEO: searched, no usable international-graduate breakdown found. `contribute-and-earn` and `open-and-build` both lack this.
- **NRPF:** no official count of people or children (D123). Council data cover participating councils only (D122).
- **Exploitation prevalence:** helpline and NRM data have no visa-route flag. I found no 2025/26 Director of Labour Market Enforcement strategy.
- **Hate crime and Epping 2025:** searched for studies of the Epping protests; none found. Only the Home Office's monthly elevation May–Oct 2025 (D128).
- **Skills for Care revision:** the exec summary gives a 10.4% peak and 6.2% latest vacancy rate, while the revised appendix gives 10.1% and 6.1% (D103; methodology revised Oct 2026). Stage 5 should use the appendix and note the revision.
- **Data error:** the Home Office unit-cost table lists the naturalisation unit cost as "1.23" (D119), which is presumably an error.

**Blocked sources** (with what I tried)

- OECD Health at a Glance 2025 chapters (D114): WebFetch 403; curl returned a challenge page; web.archive.org unreachable.
- OBR box on government investment (D126) and IFS education spending report (D125): WebFetch 403; curl returned a short challenge page.
- Royal Society visa costs 2025 PDF (D121): curl returned nothing.
- NRPF Network site (D122): TLS certificate expired.
- ICIBI social care inspection (D105): the gov.uk URL guessed returned 404; the Home Office response page exists but was not fetched.

**Sources whose reliability is disputed**

- Unseen helpline figures are uncorroborated (D108).
- IPPR, the Work Rights Centre and the Children's Society are advocacy or think-tank sources: their numbers are leads only.
- The ICIBI author, David Neal, was dismissed before publication. The Home Office called his reports "excessively critical" (D105).

### Culture, integration and cohesion

1. **"Mostly Pakistani-heritage" holds locally, not nationally.** Rotherham, Telford, Rochdale and Stovewood records support it; Casey's force data show Asian suspects at 2–2.6 times their population share in Greater Manchester and West Yorkshire. But ethnicity is unrecorded for ~2/3 of suspects nationally (D150), and in West Yorkshire Asian and White suspects were about equal in number (35% vs 34%). Suggest the argument say "in the places investigated" and cite Casey's own conclusion that this "warrants further examination".
2. **The outline's concession "most child sexual abuse is committed by family members" is not supported by the source found.** CSEW 2019 (D156) puts friends/acquaintances (37%) and strangers (30%) above family for all CSA before 16. Reword, or find the CSA Centre source if it says otherwise. "Most abusers of any kind are white" rests on VKPP data with 31% recording, which Casey calls misleading — say "where recorded".
3. **"CPB Borderless Welfare State" is wrong attribution.** It is van de Beek et al. (2021), independent, not peer-reviewed, not CPB (D161). Its method is disputed. The Danish figures (D160) are annual, not lifetime, and for 2019; no newer edition found.
4. **"In some places offending" (outline):** UK non-citizens are not over-represented overall (D171). Only Danish data (D172) support an origin gap, and there the second generation offends more than the first — which supports the outline's "persist into the second generation" but undercuts any claim that it fades.
5. **Terrorism is home-grown in nationality terms:** 82% of terrorist prisoners and 73% of arrestees since 2001 are British nationals (D174). Prevent referrals now run 2:1 ERW over Islamist (D175). The 2025–26 arrest total is 94% Palestine Action and must be excluded from any trend.
6. **Segregation is falling on the standard index** for every group (D180), which cuts against "parallel communities". `cultural-cost`'s best counter is exposure/isolation measures — not found; needed.
7. **Fastest-changing towns gained mostly EU migrants** (Boston, Peterborough, Thurrock, Barking & Dagenham, D177), so "very different cultures" and "fastest change" point at different places.
8. **Attitude evidence is thin and partly partisan.** The two large polls are ICM 2015 (areas ≥20% Muslim only) and HJS/J.L. Partners 2024 (online panel, partisan commissioner). No official or academic series by religion and generation was found; the only academic generational study is from 2009 (n=480).
9. **Viewpoint with little data:** the "residents were never asked" argument has no empirical question; polling is in another area's remit.
10. **Pending record:** the Longfield inquiry has not reported (first hearings due by end-2026; ends 2029). MoJ is appealing an ICO order to publish convictions by nationality (D173). Mandatory police recording of ethnicity and nationality for group-based CSE was promised in 2025; no data yet.
11. **Blocked or not reached:** fm.dk (404/403; used web.archive.org copy); ft.dk (403); mi5.gov.uk (403) and the speech mirror (402); Eurostat API (connection refused in sandbox); web.archive.org via WebFetch (used curl instead). Not fetched for time: Home Office 2020 paper and IICSA reports directly (read only as quoted by Casey), COCAD/VKPP reports, DST *Indvandrere i Danmark 2025*, Norway SSB 2017/31, OECD annex, Policy Exchange 2016, Casey Review 2016, Dinesen et al. full text, Quilliam 2017 and Cockbain & Tufail.

---

## Coverage check (stage 5)

Every question in 3a, mapped to the observations that answer it
(`report-id/observation-id`) or to a `dataStillNeeded` entry. Report ids:
**LR** `immigration-against-the-long-run`, **WS** `work-and-study-routes`,
**EF** `immigration-economy-and-public-finances`, **HS**
`immigration-housing-and-public-services`, **SS**
`settlement-and-migrant-status`, **IO** `integration-outcomes`, **CT**
`crime-terrorism-and-group-exploitation`.

| # | Answered by | Gap |
|---|---|---|
| L1 | LR/four-years-gross-and-net, migration-is-almost-all-population-growth, peak-by-route, british-and-eu-net-emigration, zero-migration-smaller-population, uk-mid-table-per-head | Net migration per head across countries (`dataStillNeeded`; the OECD publishes inflows only) |
| L2 | SS/forecast-1-6-million, settlement-varies-by-route, work-cohorts-settle-more | Annual forecast is a chart image only, so it is given in prose |
| L3 | LR/tens-of-thousands-met-only-in-covid, later-pledges-unquantified, public-preferences | — |
| L4 | SS/euss-outnumber-non-eu-ilr, no-official-count-of-holders | No official count of holders (`dataStillNeeded`) |
| L5 | SS/no-official-data-on-ilr-holders-work-or-benefits, uc-overstates-ilr, social-lettings-nationality, non-working-groups | ILR holders' outcomes by route (`dataStillNeeded`) |
| L6 | SS/ten-year-baseline-outlier, uk-settlement-fee-high-in-europe | **Gulf and Singapore comparators not built** — see note 1 |
| L7 | SS/revocation-needs-new-law, high-court-struck-down-mid-route-change-2008, transitional-protection-precedent | — |
| L8 | LR/negative-years-came-from-emigration | **"No rich democracy has reached net negative migration by policy" has no report** — see note 2 |
| L9 | SS/revoking-opposed-58-29, ending-for-new-arrivals-splits | One pollster only |
| L10 | EF/234bn-withdrawn, 622bn-undiscounted; SS/cps-projection | — |
| L11 | SS/guidance-said-may-be-able-to-apply, high-court-struck-down-mid-route-change-2008, transitional-protection-precedent | Archived 2021–24 guidance not fetched |
| L12 | SS/path-2-2-million, non-working-groups, dependants-ten-year-route | — |
| L13 | SS/windrush-record | — |
| L14 | SS/behaviour-evidence-limited | No study on skilled workers' choices (stated in the report) |
| L15 | SS/dependants-ten-year-route | Shares meeting each condition are not published |
| L16 | SS/status-of-earned-settlement | Recheck before publishing |
| E1 | EF/gdp-per-head-barely-grew, timing-not-cause, g7-stalled-alike, obr-per-head-effect-small | Why GDP per head stalled (`dataStillNeeded`) |
| E2 | EF/skilled-workers-gain-care-workers-cost, average-resident-is-a-lifetime-net-cost, earnings-and-age-decide, old-age-reverses-gains, discounting-changes-the-sign, no-post-brexit-total | Whole post-Brexit system (`dataStillNeeded`) |
| E3 | EF/earnings-by-route, earnings-catch-up | By route over time (`dataStillNeeded`) |
| E4 | HS/migration-share-of-household-growth, building-below-household-growth, rent-growth-fell-as-migration-fell, rents-are-still-rising, immigration-explains-4-6-percent-of-house-price-rise, migrants-concentrated-in-private-renting | — (the zero-migration household variant exists, closing the 3d gap) |
| E5 | HS/pupil-numbers-falling, gp-numbers-rising, local-pressure, patients-per-gp-not-obtained | Patients per GP and hospital demand per head (`dataStillNeeded`) |
| E6 | LR/migration-slows-ageing-but-does-not-stop-it, projections-are-scenarios | Other countries' ratios not built |
| E7 | EF/lower-migration-raises-borrowing, march-2026-revision, five-year-window, independent-forecasts | Borrowing effect of the March 2026 revision (`dataStillNeeded`) |
| E8 | EF/a-third-of-universities-in-deficit, non-uk-fee-share | Total university income (`dataStillNeeded`) |
| E9 | WS/fifth-of-nhs-staff, british-held-posts-fell; HS/migrants-staff-services | — |
| E10 | EF/small-wage-effects, no-post-brexit-wage-studies | — |
| E11 | EF/foreign-born-founders | UK foreign-born inventors (`dataStillNeeded`) |
| R1 | WS/care-visas-collapsed-before-the-closure, care-vacancies-fell, vacancies-held-as-recruitment-fell, british-held-posts-fell, care-pay-near-the-floor, mac-names-underfunding, exploitation-not-measured | — |
| R2 | WS/uk-trained-joiners-rose, then-both-fell, training-research-predates-sponsorship, uk-doctor-reliance, uk-nurse-reliance | Doctors joining by place of training; medical places (`dataStillNeeded`) |
| R3 | WS/visa-holders-two-in-five-claims, graduate-claims-doubled | — |
| R4 | WS/graduate-first-year-earnings, graduate-switchers-jobs | Earnings years after study (`dataStillNeeded`) |
| R5 | WS/talent-routes-are-small | — |
| R6 | WS/skill-threshold-lowered-then-raised, work-visas-rose-and-fell | — |
| R7 | HS/social-rent-building-fell-after-2010, public-investment-low, health-capital-below-average, day-to-day-spending-per-head-above-2010 | NHS spending per head series (`dataStillNeeded`) |
| R8 | SS/nrpf-costs | Numbers with no recourse to public funds (`dataStillNeeded`) |
| R9 | SS/ilr-fee-ten-times-cost, surcharge-matches-average-use, uk-settlement-fee-high-in-europe | — |
| R10 | WS/revocations-at-a-record, revocation-rate-not-a-record, exploitation-not-measured | Prevalence of exploitation (stated) |
| R11 | CT/hate-crime-spikes-follow-events | Causal studies not fetched; the report keeps to the Home Office's "coincided with" |
| C1 | CT/asian-suspects-over-represented-in-areas-examined, offenders-mostly-pakistani-heritage-in-places-investigated, officials-feared-being-called-racist, ethnicity-unrecorded-nationally, no-national-figure, most-child-sexual-abuse-is-outside-groups, all-child-sexual-abuse-close-to-population | Sexual-offence convictions by ethnicity after 2017 (`dataStillNeeded`) |
| C2 | IO/employment-gaps-narrowing, gap-is-among-women, muslim-employment, denmark-menapt-vs-western, denmark-cost-fell-with-employment, netherlands-by-motive, netherlands-by-region, norway-model | UK fiscal figures by origin (stated as absent) |
| C3 | IO/muslim-attitudes-homosexuality, muslim-belonging, attitudes-generations, attitude-survey-methods | — |
| C4 | CT/non-citizens-share-matches-population, rates-vary-by-nationality, danish-descendants-offend-more-than-parents | — |
| C5 | CT/islamists-largest-group-of-terrorist-prisoners-most-british, mi5-caseload, most-terrorism-arrestees-british, prevent-referrals-two-to-one-extreme-right-wing | MI5 figure is secondary |
| C6 | IO/foreign-born-share-quadrupled, fastest-changing-places, eu-share-of-the-change | — |
| C7 | IO/recent-arrivals-struggle-with-english, english-rises-with-time | By generation (not recorded) |
| C8 | IO/segregation-fell, evenness-not-exposure, school-segregation | Isolation index (`dataStillNeeded`) |
| C9 | IO/cohesion-stable, trust-lower-than-2013, diversity-and-trust-research, diversity-not-immigration | Pace of migration and trust (stated as unstudied) |
| C10 | IO/minority-pupils-outperform, university-entry, ethnicity-is-not-generation | — |

**Questions given up, for the human:**

1. **L6, the Gulf and Singapore.** `end-settlement` cites countries that
   never grant permanence. No report holds them, because the research read
   only Singapore's work-permit conditions. Either a small record is added
   to SS, or the viewpoint drops the comparison.
2. **L8, net negative migration by policy.** "No rich democracy has done
   it" is a claim about an absence, and no source states it. It goes from
   `end-settlement`'s concessions unless a source is found; the report keeps
   only that the UK's negative years came from emigration.
