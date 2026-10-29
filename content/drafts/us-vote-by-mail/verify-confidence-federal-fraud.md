# Verification: confidence and disputed results (R7), the federal record (R6), the fraud record (R4) and the secret ballot (R5)

Checked 2026-10-26. **Reused** means the quote and URL were already confirmed at source while building `content/topics/us-voter-id/facts/` and are copied here verbatim from that file (file and source number given); they were not refetched. **Fetched** means fetched today with `curl` and read from the raw text.

## D74. Pew, confidence in US elections, October 2026 — **verified** (reused)

- **Mail voters trust mail counting more than in-person voters do; party split.**
  > 64% of Democratic voters say they are confident mail and absentee votes will be counted as voters intend – down from 88% in the 2022 midterm elections and 85% among Kamala Harris' voters in the 2024 presidential election. 42% of GOP voters say they are confident mail and absentee votes will be counted as intended – modestly higher than in past recent elections. ... Roughly three-quarters of mail and absentee voters (76%) are confident votes cast this way will be counted as voters intend. By comparison, about half of in-person voters (47%) are confident this will happen.
  — Broad Public Confidence in Elections in the U.S. – but Partisans Differ Over Concerns About Access, Security, Pew Research Center, 2026-10-20, https://www.pewresearch.org/politics/2026/10/20/broad-public-confidence-in-elections-in-the-u-s-but-partisans-differ-over-concerns-about-access-security/ [reused from us-voter-id/opinion-and-confidence-in-elections #14]
- **Series, in person vs by mail, 2020–2026 (chart data; order All, Dem, Rep):**
  > 2020-10 Oct '20 In person 91 90 92 ... 2026-10 Oct '26 In person 79 81 84 2020-10 Oct '20 By absentee or mail-in ballot 59 77 36 2022-10 Oct '22 By absentee or mail-in ballot 62 88 37 2024-10 Oct '24 By absentee or mail-in ballot 61 85 38 2026-10 Oct '26 By absentee or mail-in ballot 53 64 42
  — same page, chart data [reused from us-voter-id/opinion-and-confidence-in-elections, series `pew-count-by-mode`]
- Sample: "5,062 U.S. adults, including 3,917 registered voters, from Sept. 28 to Oct. 4, 2026" (same quote).
- **Note:** confidence in mail counting is below in-person counting in all four October readings (59/62/61/53 against 91/84/85/79), for all voters.

## D18, D19, D41, D42. Gallup, Pew series and the winner effect — **verified** (reused)

- **Gallup accuracy series by party, 2004–2024** (R 87→28, D 59→84; full table in the voter-ID series `gallup-accuracy-party`), and the 2020 note:
  > In 2020, amid then-President Donald Trump's public questioning of the validity of mail voting in the upcoming election, Republicans' confidence in voting integrity dropped to a new low of 44%, while Democrats' confidence remained high
  — Confidence in Election Integrity Hides Deep Partisan Divide, Gallup, 2022-11-04, https://news.gallup.com/poll/404675/confidence-election-integrity-hides-deep-partisan-divide.aspx [reused, #9]
  > This has led to a record-high 56-percentage-point partisan gap, with 84% of Democrats versus 28% of Republicans having faith in the accuracy of the vote.
  — Partisan Split on Election Integrity Gets Even Wider, Gallup, 2024, https://news.gallup.com/poll/651185/partisan-split-election-integrity-gets-even-wider.aspx [reused, #8]
- **Gallup World Poll 2026:** "In 2026, 63% of Democrats are confident in the honesty of elections, higher than either Republicans (37%) or political independents (35%). ... No other country in the world in the past 15 years has seen this pattern" — https://news.gallup.com/poll/715205/trust-elections-breaks-global-pattern.aspx [reused, #15]. Worldwide median: 70% of approvers vs 30% of disapprovers (2025).
- **Pew fair-and-accurate series 2020–2026** (R 75/46/47/55; D 46/81/77/58): https://www.pewresearch.org/short-reads/2026/08/05/how-confident-are-americans-in-the-midterm-elections-fairness-and-accuracy/ [reused, #13 and series `pew-fair-accurate`].
- **Winner effect:**
  > Using approximately 30 national surveys over the past decade, we find a consistent relationship between voting for the winner and confidence in election administration.
  — Sances & Stewart, VTP Working Paper 125, Caltech/MIT, 2014, https://www.vote.caltech.edu/documents/16/WP_125.pdf [reused, #10]
  > The 2018 election broke that pattern.
  — Stewart, Election Updates, 2018-12-19, https://electionupdates.caltech.edu/?p=6578 [reused, #12]
  > In this paper, we find that the "winner" effect mitigates the effects from strong pre-election cues from elites.
  — Sinclair, Smith & Tucker, PRQ 2018, https://isps.yale.edu/resource/its-largely-a-rigged-system-voter-confidence-and-the-winner-effect-in-2016 [reused, #17]
- **PEI 2024 (D42):** "the counting, results and procedural aspects of the election were strong" — https://ueaeprints.uea.ac.uk/id/eprint/99835/1/Year_in_Elections_PEI_11_Report_FINAL.pdf [reused, #16].
- **Two different gaps, not to be confused:** the World Poll's 2024 party gap on *honesty* is 55 points (D18 as written); Gallup's domestic 2024 gap on *accuracy* is 56 points.

## D75. Disputed US election outcomes — **verified for six cases; confidence-after not separately measured**

| Dispute | Mail ballots central? | Resolution | Source |
|---|---|---|---|
| Florida 2000 presidential recount | No (hand recounts of punch cards) | US Supreme Court ended the recount | *Bush v. Gore* |
| Ohio 2004 electoral votes | No | Both chambers rejected the objection | CRS RL32717 |
| Georgia 2018 governor | No (registration "exact match", D-ID file) | Abrams acknowledged Kemp would be certified, "not a speech of concession" | GPB |
| 2020 presidential | Yes (mail voting questioned before and after) | Courts and Congress rejected challenges | SCOTUS order; House roll calls |
| Arizona 2022 governor | Yes (signature verification on early ballots) | Trial court rejected the claim after remand | AZ Supreme Court order; AP |
| Bridgeport, CT 2023 mayoral primary | Yes (absentee ballots stuffed into drop boxes) | Judge ordered a new primary | CT Mirror (and D76) |

- **Florida 2000:**
  > Upon due consideration of the difficulties identified to this point, it is obvious that the recount cannot be conducted in compliance with the requirements of equal protection and due process without substantial additional work.
  — Bush v. Gore, 531 U.S. 98 (2000), per curiam, Supreme Court of the United States (via Cornell LII), 2000-12-12, https://www.law.cornell.edu/supct/html/00-949.ZPC.html [fetched]
- **Ohio 2004:**
  > The second instance related to reported voting irregularities in Ohio. In 2005, a Representative (Stephanie Tubbs Jones of Ohio) and a Senator (Barbara Boxer of California) objected in writing to the Ohio electoral votes. The chambers withdrew from the joint session to consider the objection, and the House and Senate each rejected the objection.
  — Counting Electoral Votes: An Overview of Procedures at the Joint Session (RL32717), Congressional Research Service (via EveryCRSReport), 2020 edition, https://www.everycrsreport.com/reports/RL32717.html [fetched]
- **Georgia 2018:**
  > A glimpse at the teleprompter on the floor showed her speech was called "I Will Not Concede," and Abrams, who would have been the country's first black female governor, said this was not meant to be a speech of concession. ... "Concession means to acknowledge an action is right, true or proper," Abrams said.
  — Abrams Ends Gov Run, Vows To Continue Voting Rights Fight, Georgia Public Broadcasting, 2018-11-16, https://www.gpb.org/news/2018/11/16/abrams-ends-gov-run-vows-continue-voting-rights-fight [fetched]
- **2020:**
  > The State of Texas's motion for leave to file a bill of complaint is denied for lack of standing under Article III of the Constitution. Texas has not demonstrated a judicially cognizable interest in the manner in which another State conducts its elections.
  — Texas v. Pennsylvania, No. 155, Orig., Order List 592 U.S., Supreme Court of the United States, 2020-12-11, https://www.supremecourt.gov/orders/courtorders/121120zr_p860.pdf [fetched]
  - House objections to electoral votes, 6–7 Jan 2021: roll call 10 "On Agreeing to the Objection ... Failed", 121 yea, 303 nay (6 Jan); roll call 11, 138 yea, 282 nay (7 Jan) — https://clerk.house.gov/evs/2021/roll010.xml and roll011.xml [fetched]. **Which state each objection concerned (Arizona, Pennsylvania) is not printed in the clerk's record: unverified at source.** Senate roll-call pages refused automated fetching (blocked).
  - Georgia recertification: "Biden's lead dropped from 12,670 to 11,779." — AP via WDBJ7, 2020-12-07, https://www.wdbj7.com/2020/12/07/georgia-again-certifies-election-results-showing-biden-won/ [reused, us-voter-id/non-citizens-on-voter-rolls #26]
- **Arizona 2022:**
  > Issue number six asks, "Did the panel err in dismissing the signature-verification claim on laches[,] mischaracterizing Lake's claim as a challenge to existing signature verification policies, when Lake in fact alleged that Maricopa failed to follow these
  — Lake v. Hobbs, No. CV-23-0046-PR, Order, Arizona Supreme Court, 2023-03-22 (copy hosted by States United Democracy Center), https://statesuniteddemocracy.org/wp-content/uploads/2023/05/2023-03-22-Supreme-Court-.pdf [fetched]
  > Thompson said Lake failed to prove her claim that Maricopa County did not verify signatures on mail ballots as required by law. ... She filed suit after losing to Hobbs by about 17,000 votes, asking the courts to install her as governor or order a new election.
  — Judge dismisses Kari Lake's final claim in election loss for Arizona governor, Associated Press (via KSAT), 2023-05-23, https://www.ksat.com/news/politics/2023/05/23/judge-dismisses-kari-lakes-final-claim-in-election-loss-for-arizona-governor/ [fetched]
- **Bridgeport 2023:** see D76.
- **Not found:** a survey measuring confidence immediately before and after each dispute. The Gallup and Pew series give the surrounding years only; R7 must say so.

## D76 (new). Elections voided over absentee-ballot fraud, beyond the three named cases — **verified as a record; counts derived**

- **Bridgeport 2023 (primary source journalism):**
  > "Given the volume of votes at issue, the miscounting of those statutorily invalid votes leaves this court unable to determine the result of the primary." ... Bloss based his argument that a new primary is needed on numbers — arguing that as many as 1,253 were submitted through drop boxes, while 2,100 hours of surveillance videos of the city's four drop boxes show only about 420 people placing ballots in them.
  — Judge orders new Bridgeport primary (Superior Court Judge William Clark), CT Mirror, 2023-11-01, https://ctmirror.org/2023/11/01/bridgeport-primary-election-ruling-ganim-gomes/ [fetched]. Margin: "Ganim defeated Gomes by 251 votes in the Sept." (same article).
- **Heritage's own data file** (archived 27 Jul 2026, 1,619 records, years 1982–2025): https://web.archive.org/web/20260727163153/https://electionfraud.heritage.org/static/data/vfdb.csv [the file is reused from us-voter-id #33; the counts below are my arithmetic from it, fetched today]
  - **387 of 1,619 records** carry a fraud type containing "Absentee"; **34** contain "Impersonation"; 1,379 are criminal convictions.
  - About 25 records describe a whole election voided or overturned (as against individual cases). Most of those describe absentee or mail ballots: for example Philadelphia's 1993 state senate special election ("overturned by a federal district court judge due to absentee ballot fraud"), Mission, Texas 2018, Aberdeen, Mississippi 2020 ("66 of the 84 absentee ballots cast should not have been counted"), Bridgeport 2023, Caddo Parish, Louisiana 2023 (decided by one vote; mail and other illegal votes). Some were not absentee (Georgia's 28th House District 2018, Compton 2001, Pembroke, NC). **The exact count needs a hand-coded pass in stage 5**, because the file's tags are inconsistent.
  - **No election-level voiding in Colorado, Oregon, Utah or Washington appears in the file.** Their absentee records (10 CO, 3 OR, 0 UT, 8 WA) are individual cases, mostly a spouse's, parent's or deceased relative's ballot, e.g. "Donald L. Woodward was charged by Asotin County with one felony count of perjury after he filled out and signed his deceased wife's mail-in ballot for the 2016" (same file).
  - Heritage's own description: "The Election Fraud Map displays a sampling of proven instances of election fraud. ... While not comprehensive, this map demonstrates vulnerabilities in the election process" — https://web.archive.org/web/20260104115156/https://electionfraud.heritage.org/ [reused, #34]
- **News21's independent case database (reused):**
  > The analysis shows 491 cases of absentee ballot fraud and 400 cases of registration fraud. A required photo ID at the polls would not have prevented these cases.
  — News21, 2012-08-12, https://votingrights.news21.com/article/election-fraud/ [reused, us-voter-id/election-fraud-and-voter-exclusion-history #31]; same article: 2,068 alleged cases since 2000, 10 impersonation.

## D13, D25, D38, D48, D50, D51, D52 — fraud record — **verified (reused); D50 corrected**

- **D25 NC-09:** margin 905 (Harris 139,246, McCready 138,341); "corrupted by fraud, improprieties, and irregularities so pervasive..." — NCSBE order, 2019-03-13 [reused, us-voter-id/election-fraud-and-voter-exclusion-history #26]; prosecutions "Dowless died before facing a judge. All other workers pleaded guilty." — WSOC-TV, 2025-03-21 [reused, #27].
- **D51 East Chicago:** "of the 1,950 absentee ballots, Pastrick defeated Pabey by 477 votes" — Pabey v. Pastrick, 816 N.E.2d 1138 (Ind. 2004) [reused, #24]; "Forty-seven people either pleaded guilty or were convicted" — NBC, 2008 [reused, #25]. **The 155 invalidated votes and the "perverted the absentee voting process" wording were not in the reused quote; re-quote at stage 5.**
- **D52 Paterson:** new election ordered by Judge Caposela, NJ Globe 2020-08-19 [reused, #28]; dismissal on speedy-trial and disclosure grounds, NJ Globe 2026-04-13 [reused, #29]; charges against Jackson dropped and appeal of Mendez dismissal, NJ Globe 2026-05-15 [reused, #30]. The 19% / 24–26% rejection figures (McKoy petition) were not re-checked.
- **D38 Carter–Baker:** "Absentee ballots remain the largest source of potential voter fraud." and "There is no evidence of extensive fraud in U.S. elections or of multiple voting, but both occur, and it could affect the outcome of a close election." — https://eac.gov/sites/default/files/eac_assets/1/6/Exhibit%20M.PDF [reused, #35]. The third-party-handling recommendation was not in the reused quote; re-quote at stage 5.
- **D48 Chicago 1982:** 58 convicted by April 1985 (DOJ 1984 report) [reused].
- **D50 Kansas City 1936: corrected.** The primary-adjacent source says "a total of 259 convictions", not "259 of 278 defendants":
  > U.S. Attorney Maurice M. Milligan and his staff prosecuted the resulting vote fraud cases for a total of 259 convictions.
  — Snapshot History: Maurice Milligan, US Attorney's Office W.D. Mo., 2015-02-26, https://www.justice.gov/usao-wdmo/historical-resources/snapshot-history-maurice-milligan [reused, #7]
- **D55 officials:** Otero (KOB 2022-06-18) and Cochise (Votebeat 2025-09-17: "Judd has since pleaded guilty to a misdemeanor. But Crosby pleaded not guilty, and is awaiting a trial.") [reused, #47, #48]. **Box 13, Wayne County 2020 and the Georgia State Election Board remain secondary-only.**

## D24, D45, D46, D47 — federal record — **verified** (Watson and USPS fetched; others reused)

- **Watson v. RNC:**
  > (b) The federal election-day statutes do not preempt Mississippi's law because the defining element of an "election" has always been the electorate's choice of candidate.
  > Today, roughly 30 States count at least some absentee ballots mailed by election day but received afterward.
  > For instance, they might have shared plaintiffs' view that an election-day deadline avoids the appearance of fraud from late-arriving ballots.
  > As we have said time and again, however, policy arguments are properly directed to legislatures, not courts.
  — Watson v. Republican National Committee, 609 U.S. ___ (2026), decided 2026-06-29, slip opinion, https://www.supremecourt.gov/opinions/25pdf/609us2r65_g314.pdf [fetched]
- **USPS v. California:**
  > The application for stay presented to JUSTICE JACKSON and by her referred to the Court is denied.
  > Even assuming the rule here is a regulation of elections, Congress may create such rules under the Elections Clause.
  — USPS v. California, No. 26A305, 2026-09-14 (second quote: Alito, J., joined by Thomas, J., dissenting from the denial), https://www.supremecourt.gov/opinions/25pdf/26a305_4g15.pdf [fetched]
- **Trump v. California:** "It neither requires nor forbids anything of anyone outside the Executive Branch." [reused, us-voter-id/federal-and-state-power-over-voting-rules #34]
- **SAVE America Act:** House passage 218–213 (Just The News, 2026-02-11) [reused, #25]; "would end universal mail voting in eight states and DC" (American Democracy Minute, 2026-07-23, an advocacy outlet) [reused, #26]; Senate photo-ID subset failed 52–46 on 8 Aug 2026 [reused, #27]. **The bill text's mail provision was not read; R6 must quote the bill or CRS, not the advocacy summary.**
- **ITCA, Moore, HAVA, UOCAVA, MOVE, Freedom to Vote Act** [reused, us-voter-id/federal-and-state-power-over-voting-rules].

## D56. The secret ballot — **verified for the US adoption record and Chile; corrected dates**

- > State attempts to standardize the ballots were easily thwarted — the vote buyer could simply place a ballot in the hands of the bribed voter and watch until he placed it in the polling box. ... the Commonwealth of Massachusetts, and the State of New York adopted the Australian system in 1888. ... By 1896, almost 90 percent of the States had adopted the Australian system.
  — Burson v. Freeman, 504 U.S. 191 (1992), plurality, via Caselaw Access Project, https://static.case.law/us/504/html/0191-01.html [reused, us-voter-id/election-fraud-and-voter-exclusion-history]
- > We examine the effects of the introduction of the secret ballot in Chile in 1958 on voting behavior. Before the reforms, localities with more pervasive patron-client relationships tended to exhibit a much stronger support for the right-wing parties, traditionally associated with the landed oligarchy. After the reform, however, this difference across localities completely disappeared.
  — Baland & Robinson, "Land and Power: Theory and Evidence from Chile", American Economic Review 98(5), 2008, https://www.aeaweb.org/articles?id=10.1257/aer.98.5.1737 [fetched, abstract]
- **Correction:** the candidate's "US states adopted it 1884–1891" is secondary. Use *Burson*: Louisville, Massachusetts and New York from 1888; "almost 90 percent" by 1896. South Carolina 1950, the Australian 1856 dates and the Chartist quote remain secondary (Wikipedia).

## D2. MIT SPAE mail use by party — **verified**

> Thirty-seven percent of Democrats reported voting by mail, compared to 24% of Republicans. ... In 2022, and then again in 2024, the gap closed somewhat, although this was primarily due to Democrats pulling back in the use of voting by mail rather than Republicans increasing their usage.
— How We Voted in 2024, MIT Election Data + Science Lab, 2025-07, https://electionlab.mit.edu/sites/default/files/2025-07/HowWeVotedIn2024.pdf [fetched]

## D16, D31. Texas and Georgia rejection — **verified (reused); Georgia 2018 baseline still unverified**

- Texas March 2022: "24,636 mail-in ballots were rejected ... a 12.38% rejection rate"; "Texas' mail ballot rejection rate during the 2020 general election was 0.8% and it was 1.5% in 2018" — TPR 2022-11-06 [reused, us-voter-id/burdens-of-id-and-citizenship-rules #16]. Harris County 19% (6,888) vs 135 in 2018 — KUT 2022-03-16 [reused, #17]. Brennan study: 30,000 rejected, "roughly 90%" did not vote another way; 344 of more than 18,000 voted in person — Votebeat 2025-05-28 [reused, #18].
- EAVS briefs: TX 2022 3.4% rejected; TX 2024 96.5% counted, 5.8% entered cure; GA 2022 1.5%; GA 2024 98.3% counted [reused, #19–22].

## Blocked

- senate.gov roll-call pages (security block on automated requests).
- The state each 6–7 Jan 2021 House objection concerned is not printed in the clerk's XML or page; needs the Congressional Record (govinfo) by hand.
- Wayne County 2020, Box 13 and the Georgia State Election Board: primary sources not reached.

## Summary

Verified 22 (D2, D13, D16, D18, D19, D24, D25, D31 in part, D38, D41, D42, D45, D46, D47, D48, D51, D52, D56 in part, D74, D75, D76 new); corrected 2 (D50: "259 convictions"; D56: adoption dates from *Burson*); partly secondary 1 (D55). Most were reused from the voter-ID build; Watson, USPS, the disputed-results record, Bridgeport, the Heritage counts, Chile and the MIT party shares were fetched today.
