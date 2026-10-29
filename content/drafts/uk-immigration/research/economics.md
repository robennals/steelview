# UK immigration — stage-3 research: the economics of immigration

Researched 2026-10-24 for [`uk-immigration`](../outline.md). Questions E1–E11; candidates D50–D79.

- **Marks:** **(read)** = seen on a fetched page or PDF at the URL given; **(read, PDF)** = from the text of a fetched PDF; **(read, own calc)** = my arithmetic on a fetched official dataset (stage 5 should re-run it); **(read, secondary)** = on a fetched secondary page, primary not reached; ***unverified*** = search snippet, secondary summary or memory.
- **"Read" is not a quote.** Most pages were summarised by a model; PDFs were converted with `pdftotext`. Stage 5 must quote every figure from the source.
- **OBR is behind a Cloudflare check** (both WebFetch and curl blocked). OBR PDFs were read from Wayback Machine copies; the URLs below are the original obr.uk addresses, with the archived timestamp given.

---

## 3a. Question index

| # | Question | Viewpoints | Answers it | Context | Likely status, and how to narrow it |
|---|---|---|---|---|---|
| E1 | Did GDP per head grow less in the high-migration years, and how much of that is due to migration? | `economic-cost`, `open-and-build`, `contribute-and-earn` | D50, D52 | *run:* D50 (annual since 1996, quarterly to Q2 2026). *comp:* D51 (G7, 2007–24). *cf:* D52 (OBR scenarios: ±200k net migration → GDP per person "largely unchanged", −0.4% if capital does not adjust); pandemic, energy shock and Brexit not separated by any source found. *mech:* D74 (employment rates), D61 (recent arrivals' pay), D60 (pay by route); capital per worker only in D52's assumption. | **Well-supported** that GDP per head barely grew: 0.17% a year 2019–25 against 1.26% in 2010–19 (D50). **Not supported** that migration caused it: no source attributes the stagnation to migration, and the OBR says the per-person effect is small and of uncertain sign. Canada (also high migration) and Germany (energy shock) were also flat in 2019–24 (D51). Narrow to "grew little" plus the OBR's uncertainty. |
| E2 | What is the lifetime net fiscal contribution of migrants by wage, age at arrival, family size and route? | `economic-cost`, `end-settlement`, `contribute-and-earn`, `open-and-build`, `keep-our-word` | D55, D54, D56, D57 | *comp:* D55 (UK resident of the same age: +£117k mean / −£47k median). *denom:* D55 (all UK residents: mean −£39k, median −£145k). *record:* D54 (OBR FRS 2024), D56 (MAC 2018), D57 (Oxford Economics 2018, Dustmann–Frattini, Rowthorn, Migration Watch), D58 (CPS £234bn, withdrawn), D59 (Reform £622bn). *mech:* D55, D54 (what drives cost: no childhood education costs for adult arrivals; pensions, health and care in old age; dependants' low employment; children). | **Well-supported** for the 2022/23 Skilled Worker cohort: +£47bn in total; care workers −£36k each; Health and Care dependants −£67k each (D55). **Well-supported** that the result depends on earnings and age at arrival (D54, D55). Reform's figures fail the test: the CPS withdrew the £234bn itself, and the £622bn is undiscounted (D58, D59). There is no high-quality estimate for all routes under the post-Brexit system (D57). |
| E3 | What do migrants earn, and what is their fiscal contribution, by route, over time since arrival? | `contribute-and-earn`, `economic-cost`, `keep-our-word` | D60, D61, D55 | *comp:* D61 (relative to all UK employees), D55 (age-matched UK residents). *run:* D61 (HMRC RTI cohorts 2015–2025). *mech:* D55 (salary thresholds: the top 10% of Skilled Worker earners give 39% of the fiscal gain). | **Well-supported** as a 2023/24 snapshot by route (D60). Time since arrival is covered only at the level of EU/non-EU cohorts (D61), not by route. Earnings by route over time is **missing**. MAC's dependants' employment path is an assumption, apart from one 2019/20 family cohort (44% employed → 60% after four years). |
| E4 | What share of household growth comes from migration, and how much has it added to rents and house prices? Housebuilding against household growth; rents as migration fell in 2024–26. | `economic-cost`, `open-and-build`, `blame-underinvestment` | D62, D63, D64, D65, D66, D56 | *run:* D64 (net additional dwellings, England, 1991–92 to 2024–25), D63 (rents 2015–Sep 2026). *comp:* D63 (regions), D62 (local vs regional effects). *cf:* D63 (rent inflation fell from 9.1% to about 3.5% while net migration fell; interest rates not separated). *mech:* D66 (about a third of private renters were born abroad in 2021). | **Complicated.** Best evidence: immigration explains about 4–6% of the real house-price rise over three decades, as an illustrative estimate (D62). No UK study of rents exists (D62). Rents have **not fallen**, but their growth has more than halved (D63). The share of household growth due to migration has **no official estimate found** for the 2022-based projections (see 3d). |
| E5 | How has demand on GPs, hospitals and schools changed with population, against staffing? | `economic-cost`, `blame-underinvestment`, `open-and-build` | D67, D68, D56, D52 | *denom:* D67 (GPs per patient by ICB only). *record:* D75, D74 (migrants' share of NHS and care staff). | **Partial.** Pupil numbers in England are **falling** (−112,200 in 2026), which undercuts a national school-pressure claim (D68). GP numbers are up 2,382 since December 2019 (D67), but patients per GP over time was not obtained. Hospital demand per head was not researched (see 3d). OBR: the government did not raise departmental spending for the higher population, so real spending per person fell (D52); this supports `blame-underinvestment` and `economic-cost` alike. |
| E6 | How will the working-age share and the old-age dependency ratio change under high, central and low migration? | `open-and-build`, `economic-cost` | D69, D54 | *comp:* other ageing countries **not obtained** (see 3d). *cf:* D54/ONS letter (pension age 68 in the early 2030s, 69 later in the 2030s and 70 in the 2040s would hold the ratio at 278). | **Well-supported**, and it cuts both ways. In ONS 2024-based projections, people 65+ per 1,000 aged 16–64 rise from 302 (2024) to 525 by 2074 in the principal projection, 457 with high migration, 580 with low and 641 with zero net migration (D69). Migration slows ageing but does not stop it. |
| E7 | What have the OBR's forecasts said lower migration does to growth, borrowing and debt? | `open-and-build`, `economic-cost`, `contribute-and-earn` | D52, D53, D54 | *record:* D52 (March 2024 EFO scenarios), D53 (March 2025, November 2025, March 2026), D54 (long run). *comp:* D70 (Resolution Foundation, Oxford Economics, IFS), D57. Total GDP versus GDP per head: D52. | **Well-supported** that in OBR scenarios lower migration raises borrowing over five years: 200k lower net migration → £19.9bn higher borrowing in 2028–29, or £13.1bn if spending per person is held (D52). Revisions: March 2026 lowered net migration to an average of 235k (from 295k) and potential output by 0.25% in 2030 (D53, secondary). Narrow to "in the OBR's 5-year scenarios"; the long-run effect is smaller and later reverses (D54). |
| E8 | How much do international students pay, and how dependent are universities on them? | `open-and-build`, `contribute-and-earn` | D72, D71, D73 | *run:* D72 (fees as a share of income: 5% in 2000/01, 14% in 2017/18, 23% in 2022/23; *unverified*). *record:* D71 (35.8% of English providers in deficit in 2024–25; 42.7% forecast for 2025–26). | Likely **well-supported** once HESA is read (it is blocked). Students' spending: D73 (HEPI/London Economics, net £40.4bn per intake; *unverified*). |
| E9 | How many NHS and care staff are migrants, by nationality, over time? | `open-and-build`, `contribute-and-earn`, `economic-cost` | D75, D76, D74 | *run:* D75 (NHS England HCHS staff since 2009). | **Well-supported** in direction. Figures are *unverified* pending NHS Digital (blocked): about 20% of NHS hospital and community staff were non-UK nationals in 2023, from 11.9% in 2009. British-national filled posts in adult social care fell 130,000 since 2020/21 (D76, secondary). |
| E10 | What are immigration's wage effects on UK-born workers, by wage level? | `open-and-build`, `contribute-and-earn`, `economic-cost`, `blame-underinvestment` | D56, D77 | *record:* D56/D77 (range across studies). *mech:* D77 (competition in low-skill jobs; downgrading of skilled migrants; earlier migrants bear most of the effect). | **Well-supported**: average effects are small; small negative effects at the bottom, positive further up (D56). There are **no post-Brexit studies** (D77). |
| E11 | Do immigrants found businesses or file patents at higher rates? | `open-and-build`, `contribute-and-earn` | D78, D79 | *denom:* D78 (42% of founders vs about 16% foreign-born). *comp:* D79 (US: immigrants were 16% of inventors and 23% of patents; *unverified*). Rates by route: **none found**. | **Complicated.** Founders: one think-tank's count of the top 100 companies, with nationality used as a proxy for birthplace (D78). No UK foreign-born patent share was found (D79). Narrow to "high-growth start-ups" and name the source. |

---

## 3b. Candidate datasets

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

### D58. Centre for Policy Studies, *Here to stay* (Feb 2025) and its clarification (22 Sep 2025): the £234bn figure
- **Source:**
  - Report: https://cps.org.uk/wp-content/uploads/2025/09/Here-to-stay.pdf (not opened).
  - Clarification: https://cps.org.uk/media/post/2025/centre-for-policy-studies-issues-clarification-on-indefinite-leave-to-remain-statistics/
  - Full Fact: https://fullfact.org/politics/reform-uk-ilr-benefit-cost/
- **Measures:** a ballpark lifetime net fiscal cost of the roughly 800,000 people expected to become eligible for ILR from the 2021–24 cohorts, using OBR data.
- **Shape:** record (a claim and its withdrawal).
- **What it shows:**
  - **Clarification (read; 22 Sep 2025):** after OBR definitional revisions, "the overall cost estimates should no longer be used"; an update would follow "in due course". The visa analysis and the ILR projections by route are unaffected.
  - **Full Fact (read, secondary):**
    - The figure is £234bn of net lifetime cost; benefits are "a fraction".
    - Farage wrote (Daily Mail, Sep 2025) that ending ILR "will save… at least £234 billion".
    - The Mail corrected its description of the figure as benefits.
  - **Portes:** said correcting the earnings and employment data gives about +£125bn (***unverified***; social media).
  - **About 72% of the cohort expected to earn below the average salary:** ***unverified*** (Telegraph piece by Karl Williams of the CPS).
- **Helps:** `end-settlement` and `economic-cost` only through the CPS's route counts (still stated as valid). **Hurts:** `end-settlement` (its headline saving was disowned by its own source on the day Reform launched the policy).
- **Likely status:** the £234bn claim fails. Stage 5: open the PDF, record the method, and check whether an updated estimate has appeared.

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

### D76. Skills for Care, *The state of the adult social care sector and workforce in England* (2025/26 edition, June 2026; 2024/25 edition, Oct 2025)
- **Source:** https://www.skillsforcare.org.uk/Adult-Social-Care-Workforce-Data/Workforce-intelligence/publications/national-information/The-state-of-the-adult-social-care-sector-and-workforce-in-England.aspx (not opened). Coverage: LocalGov, 24 Jun 2026, https://www.localgov.co.uk/Social-care-vacancy-rate-falls-to-decade-low-but-challenges-ahead/64563 (read, secondary).
- **Measures:** filled posts, vacancies and nationality in adult social care.
- **Coverage:** annual since about 2012/13.
- **Shape:** series.
- **What it shows (read, secondary; as of 2025/26):**
  - **Vacancies:** 6.2%, the lowest since 2015/16; about 96,000.
  - **British-national filled posts:** down 40,000 in a year and 130,000 since 2020/21.
  - **International recruits:** 30,000, the lowest in four years. The previous edition gave 105,000 (2023/24) and 50,000 (2024/25).
  - **Non-British numbers have risen**, but no share was given.
- **Helps:** `contribute-and-earn` (vacancies fell after the care route closed, not the shortage feared). `open-and-build` (the sector rests on non-British staff as British staff leave).
- **Hurts:** `open-and-build` (vacancies did not spike after closure). `contribute-and-earn` (domestic recruitment has not replaced the losses: British-national posts are still falling).
- **Likely status:** well-supported once the report is read.

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

## 3d. Problems for the human

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
