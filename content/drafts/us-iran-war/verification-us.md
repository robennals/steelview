# US war with Iran — verification of US-side candidates

Stage 5 check, 26 Oct 2026, of C10–C14, C18–C22, C29–C36, C73 and C79 from
[candidate-data.md](candidate-data.md). Every quote below was copied from raw
fetched text (HTML with tags stripped, PDF via `pdftotext`, or XML/JSON
fields). Where the original site refused automated fetches, an Internet
Archive copy was used and the copy's capture time is given.

**Summary.** 17 verified (some with newer figures), 3 corrected (C11, C14,
C22), 0 unverifiable, 0 dropped. The main corrections:

- **C14:** Pew's 33% (Oct) and 37% (Mar) measure approval of *Trump's
  handling* of the war, not of the war itself. Pew does not report
  independents. The "two to one" figure for independents comes from Gallup
  (June, 68–26) and Quinnipiac (March, 60–31).
- **C11:** the Senate voted 14 times on Iran war-powers measures. It
  succeeded twice: a motion to discharge on 19 May, and the adoption of
  H.Con.Res.86 on 23 June.
- **C22:** the Brookings $150–300 bn estimate was made in August 2003, so it
  is not a prewar estimate. CRS's $1.6 tn covers all post-9/11 wars; Iraq's
  share is $815 bn.
- **C18:** DCAS (the Pentagon's casualty database, read via its own API) now
  confirms 21 deaths and 865 wounded as of 23 Oct. Of the 21 deaths, 10 were
  non-hostile.

---

### C10 — House roll-call votes, 2026 — verified

Source: Office of the Clerk, roll-call XML, `https://clerk.house.gov/evs/2026/rollNNN.xml`, fetched 26 Oct 2026. All 2026 rolls (1–314) were downloaded and searched for "Iran", "war powers" and "hostilities".

- **5 Mar, H.Con.Res.38, failed 212–219; Republicans yes 2.** Roll 85: `vote-result: Failed`, `vote-desc: "Directing the President pursuant to section 5(c) of the War Powers Resolution to remove United States Armed Forces from unauthorized hostilities in the Islamic Republic of Iran"`; Republican yea 2 / nay 215 / nv 1; Democratic yea 210 / nay 4; totals 212–219–0 present–1 nv. https://clerk.house.gov/evs/2026/roll085.xml
- **16 Apr, H.Con.Res.40, failed 213–214; Republicans yes 1.** Roll 114: Republican yea 1 / nay 212 / present 1 / nv 3; Democratic yea 212 / nay 1; Independent nay 1; totals 213–214–1–3. https://clerk.house.gov/evs/2026/roll114.xml
- **14 May, H.Con.Res.75, failed 212–212; Republicans yes 3.** Roll 170: Republican yea 3 / nay 210 / nv 4; Democratic yea 209 / nay 1 / nv 2; Independent nay 1; totals 212–212–0–6. https://clerk.house.gov/evs/2026/roll170.xml
- **3 Jun, H.Con.Res.86, passed 215–208; Republicans yes 4.** Roll 199: `vote-result: Passed`; Republican yea 4 / nay 207 / nv 6; Democratic yea 211 / nv 1; Independent nay 1. https://clerk.house.gov/evs/2026/roll199.xml
- **23 Jul, H.Con.Res.89, passed 214–208; Republicans yes 4.** Roll 282: Republican yea 4 / nay 207 / nv 7; Democratic yea 210 / nv 2; Independent nay 1. https://clerk.house.gov/evs/2026/roll282.xml
- **15 Sep, H.Con.Res.93, passed 220–204; Republicans yes 7.** Roll 307: Republican yea 7 / nay 203 / nv 8; Democratic yea 213 / nv 1; Independent nay 1. https://clerk.house.gov/evs/2026/roll307.xml
- **Related House votes not in the candidate entry:**
  - Roll 84, 5 Mar, H.Res.1099 ("Reaffirming Iran remains the largest state sponsor of terrorism") passed 372–53 under suspension. Republicans voted 215–0; Democrats 157–53.
  - Two Lebanon war-powers resolutions failed: roll 201, 4 Jun, H.Con.Res.84, 92–324; roll 232, 30 Jun, H.Con.Res.108, 189–235.
- **No newer votes.** The last 2026 roll call is 314 (16 Sep 2026). Rolls 315–350 return `Error sanitizing file`, meaning they do not exist. There has been no House vote on Iran since 15 Sep (as of 26 Oct).
- **Range for a chart:** six Iran war-powers votes, 5 Mar – 15 Sep 2026, with party breakdowns available for each.
- **For the viewpoints:** Republican defections rose from 2 to 7, which supports "growing defections" but shows how small they are. Democratic defections fell from 4 to 0. Every resolution was a concurrent resolution; the outline's "non-binding" note stands.

### C11 — Senate roll-call votes — corrected (fuller list; two successes, not one)

senate.gov returns 403 to direct fetches. The vote menu XML was read from the Internet Archive copy captured 10 Oct 2026 07:57 UTC (`https://web.archive.org/web/20261010195728id_/https://www.senate.gov/legislative/LIS/roll_call_lists/vote_menu_119_2.xml`), and the individual roll-call XML files the same way. The archive has no capture after 10 Oct, so any vote after that date is unchecked.

- **Iran war-powers votes in the 119th Congress, 2nd session (title in every case: "…direct the removal of United States Armed Forces from hostilities within or against the Islamic Republic of Iran that have not been authorized by Congress", or for H.Con.Res. "…from hostilities with Iran"):**
  - 4 Mar, vote 46, motion to discharge S.J.Res.104: rejected 47–53
  - 18 Mar, vote 58, discharge S.J.Res.118: rejected 47–53
  - 24 Mar, vote 69, discharge S.J.Res.116: rejected 47–53
  - 15 Apr, vote 79, discharge S.J.Res.123: rejected 47–52
  - 22 Apr, vote 88, discharge S.J.Res.114: rejected 46–51
  - 30 Apr, vote 113, discharge S.J.Res.184: rejected 47–50
  - 13 May, vote 118, discharge S.J.Res.163: rejected 49–50
  - **19 May, vote 129, discharge S.J.Res.185: "Agreed to" 50–47**
  - 16 Jun, vote 174, discharge S.J.Res.172: rejected 47–48
  - **23 Jun, vote 184, H.Con.Res.86: "Agreed to" 50–48**
  - 24 Jun, vote 192, motion to proceed to S.J.Res.185: rejected 47–50
  - 23 Jul, vote 207, discharge S.J.Res.180: rejected 47–49
  - 30 Jul, vote 216, discharge S.J.Res.181: rejected 49–50
  - 24 Sep, vote 244, H.Con.Res.89: rejected 49–50
- **That makes 14 votes, matching ABC's count.** "Passed once" is right only for measures. The 19 May discharge motion also succeeded, but the resolution itself then failed a motion to proceed on 24 Jun.
- **Vote 184 (23 Jun) detail:** `vote_result_text: "Concurrent Resolution Agreed to (50-48)"`. Republicans voting yea: Cassidy, Collins, Murkowski, Paul. Democrat voting nay: Fetterman. Two Republicans did not vote. Archived XML: https://web.archive.org/web/2026id_/https://www.senate.gov/legislative/LIS/roll_call_votes/vote1192/vote_119_2_00184.xml
- **Vote 244 (24 Sep):** `"Concurrent Resolution Rejected (49-50)"`. Republicans yea: Collins, Murkowski, Paul, Tillis. Democrat nay: Fetterman. One Democrat did not vote.
- **Vote 129 (19 May):** `"Motion to Discharge Agreed to (50-47)"`. Republicans yea: Cassidy, Collins, Murkowski, Paul.
- **Vote 46 (4 Mar):** `"Motion to Discharge Rejected (47-53)"`. Paul was the only Republican yea; Fetterman the only Democratic nay.
- **Not Iran (exclude):** the Venezuela war-powers votes (S.J.Res.98, 8 and 14 Jan) and the Cuba vote (S.J.Res.124, 28 Apr).
- **For the viewpoints:** support for 3 is steady but small: 1 Republican in March, then 4 from May on. Cassidy was replaced by Tillis in September. With H.Con.Res.86 adopted by both chambers, the "House passed three and Senate one" line is correct.

### C12 — War Powers reports and letters — verified (the 1 May letter only through quotation)

- **2 Mar 48-hour report.**
  - Quotes: "I acted pursuant to my constitutional authority as Commander in Chief and Chief Executive to conduct United States foreign relations." "I am providing this report as part of my efforts to keep the Congress fully informed, consistent with the War Powers Resolution (Public Law 93-148)." On its purpose: "in collective self-defense of our regional allies, including Israel."
  - The letter is dated "March 2, 2026" and addressed to Senator Grassley as President pro tempore. The PDF's filename says "2025", but the letter says 2026.
  - URL: https://www.justsecurity.org/wp-content/uploads/2026/03/wpr-report-operation-epic-fury-march-2-2025.pdf (Just Security, Mar 2026).
  - govinfo has it as House Doc 119-139 (referred 3 Mar 2026), but the text there is "[TEXT NOT AVAILABLE REFER TO PDF]".
- **1 May letter, "terminated" (as of 1 May).**
  - Lawfare quoting the letter: "There has been no exchange of fire between United States Forces and Iran since April 7, 2026," and "[t]he hostilities that began on February 28, 2026 ... have terminated[,]".
  - Lawfare also quotes the same letter saying "the threat posed by Iran to the United States and our Armed Forces remains significant[.]"
  - URL: https://www.lawfaremedia.org/article/law-and-the-iran-war--after-the-first-60-days (Scott R. Anderson, Lawfare, early May 2026).
  - Jack Goldsmith (Executive Functions, 4 May 2026) also cites the letter: "the 'hostilities' ... that began on Feb. 28 had 'terminated' due to the April 7 ceasefire". He calls the "no exchange of fire" claim "highly misleading". https://www.execfunctions.org/p/trumps-interpretation-of-the-war
  - **Partial:** the primary letter was not found. govinfo House Docs 119-120 to 119-215 contain no "have terminated" text.
- **House Doc 119-167 (letter dated 29 Jun 2026, referred 6 Jul).** Quotes: "I write today to apprise you of military actions taken at my direction against the Government of the Islamic Republic of Iran on June 26 and June 28, 2026." "These efforts led to my signing a Memorandum of Understanding (MOU) with the Government of the Islamic Republic of Iran on June 17, 2026." https://www.govinfo.gov/content/pkg/CDOC-119hdoc167/html/CDOC-119hdoc167.htm. This settles the 17-vs-18 June timeline question in favour of the 17th, per the President's own letter.
- **Further letters found on govinfo (a series of War Powers reports):**
  - **HD 119-162 (12 Jun):** "military action commenced on June 9, 2026 ... On June 8, 2026, ... Iran engaged a United States Army AH-64 Apache helicopter, forcing its crash landing."
  - **HD 119-169 (10 Jul):** "military action commenced on July 7, 2026, against the Government of the Islamic Republic of Iran". This cuts against the timeline's "US strikes 10 Jul"; the letter is *dated* 10 Jul.
  - **HD 119-183 (3 Aug):** "military action commenced on July 27, 2026, against targets in the Republic of Iraq following Islamic Revolutionary Guard Corps-directed attacks by Iranian aligned militia groups".
  - **HD 119-193 (3 Sep):** "military action commenced on September 1, 2026, against the Islamic Republic of Iran", with targets including "oil tankers belonging to the National Iranian Oil Company".
  - URLs follow the pattern `https://www.govinfo.gov/content/pkg/CDOC-119hdocNNN/html/CDOC-119hdocNNN.htm`.
- **For the viewpoints:** strengthens 2 and its relabelling point. After declaring hostilities "terminated" on 1 May, the administration sent at least five more letters reporting new military action against Iran or its proxies: 9 Jun, 26 and 28 Jun, 7 Jul, 27 Jul and 1 Sep. Each cites Article II and is filed "consistent with" the War Powers Resolution, the form every president since 1973 has used.

### C13 — CRS on unauthorised use of force — verified

- **"Hundreds of instances" (edition of 7 Jun 2023, covering 1798–2023).** "The following list reviews hundreds of instances in which the United States has used military forces abroad in situations of military conflict or potential conflict to protect U.S. citizens or promote U.S. interests. The list does not include covert actions or the many occurrences in which U.S. forces have been stationed abroad..." CRS R42738, https://www.everycrsreport.com/reports/R42738.html
- **11 declarations, 5 wars.** "Eleven times in its history, the United States has formally declared war against foreign nations. These 11 U.S. war declarations encompassed five separate wars: the war with Great Britain declared in 1812; the war with Mexico declared in 1846; the war with Spain declared in 1898; the First World War...; and World War II..." (same URL). The outline's "declared war 11 times" is accurate, but should say this covers five wars.
- **168 WPR reports (1975 – March 2017).** "From 1975 through March 2017, Presidents have submitted 168 reports as the result of the War Powers Resolution, but only one, the 1975 Mayaguez seizure, cited Section 4(a)(1), which triggers the 60-day withdrawal requirement". CRS R42699 (latest everycrsreport edition, 2019), https://www.everycrsreport.com/reports/R42699.html
- **Gap:** there is no newer R42738 edition than 2023 on everycrsreport, and congress.gov is blocked.

### C14 — US polling on the war, by party — corrected (the outline's wording)

- **Pew Oct 2026 (fieldwork 28 Sep – 4 Oct, 5,062 adults).**
  - "Around two-thirds of Americans (65%) disapprove of the way President Donald Trump is handling the U.S. military action in Iran, while a third (33%) approve".
  - "Today, 33% of adults say they approve of how Trump is handling the U.S. military action against Iran – down from 37% in March. This decline has come entirely from Republicans: At the start of the conflict, 69% approved of his handling of the conflict. Today, 63% do."
  - Also: "34% now view this as the right decision – down 4 percentage points from March."
  - URL: https://www.pewresearch.org/short-reads/2026/10/08/iran-conflict-remains-deeply-unpopular-as-many-americans-expect-it-to-go-on-for-months/ (Pew, 8 Oct 2026).
- **Pew Mar 2026 (fieldwork 16–22 Mar, 3,524 adults).** "About six-in-ten Americans (61%) disapprove of Trump's handling of the conflict, while 37% approve." Right decision 38%, wrong 59%. Republicans and leaners: 69% approve of his handling. https://www.pewresearch.org/politics/2026/03/25/americans-broadly-disapprove-of-u-s-military-action-in-iran/ (25 Mar 2026)
- **Correction 1, what Pew measured.** The outline's "33% approved in October, down from 37% in March" is Pew's measure of approval of *Trump's handling* of the military action. Pew's measure of the war itself ("right decision") is 34%, down from 38%. Say "approve of Trump's handling", or switch to the decision measure.
- **Correction 2, independents.** Pew splits only into Republicans and Democrats including leaners, so it gives no independent figure. The "about two to one" claim needs another source:
  - **Gallup, 1–15 Jun 2026 (1,001 adults).** "Do you approve or disapprove of this U.S. military action against Iran?" Total 34 approve / 63 disapprove / 4 no opinion. Republican 79/19, Independent 26/68, Democrat 8/90. https://news.gallup.com/file/poll/711863/2026_Iran_PDF.pdf. Among independents that is about 2.6 to 1.
  - **Quinnipiac, 6–8 Mar 2026 (1,002 registered voters, released 9 Mar).** "Fifty-three percent of voters oppose the U.S. military action against Iran, while 40 percent support it. Democrats (89 – 7 percent) and independents (60 – 31 percent) oppose the U.S. military action against Iran, while Republicans (85 – 11 percent) support it." Congress's approval: "Yes/Should have 59%"; independents 64%. https://poll.qu.edu/images/polling/us/us03092026_upip88.pdf
  - **Suggested wording:** "independents opposed it by about two to one (Quinnipiac, March: 60–31) or more (Gallup, June: 68–26)."
- **Not re-checked:** AP-NORC (July), Reuters/Ipsos (August), CNN/SSRS, YouGov.
- **Range for a chart:** each pollster's series is short. Pew has two points (Mar, Oct); Gallup has one in this file; Quinnipiac has one (Mar).
- **For the viewpoints:** the concession that "most Republicans support the war" holds in every source: Pew 63% approve of the handling, Gallup 79%, Quinnipiac 85%.

### C18 — US service member casualties (DCAS) — verified and updated

Source: DCAS (the Defense Casualty Analysis System). It is a JavaScript app, but its own JSON API is open: `https://dcas.dmdc.osd.mil/dcas/api/report/wia/casualtySummary/category/{totDeath|totWIA|host|nonHost}/{oefu|oo}` and `.../report/casualtySummary/monthly/{oefu|oo}`. Every response carries `"extractionDate":"October 23, 2026"`.

- **Deaths, as of 23 Oct: 21.**
  - Operation Epic Fury (OEFU): `{"army":"8","navy":"1","marines":"0","airforce":"6","spaceforce":"0","total":"15","casualty_CATEGORIES":"TOTAL DEATHS"}`
  - "Overseas Operations" (OO): `{"army":"5","navy":"1",...,"total":"6","casualty_CATEGORIES":"TOTAL DEATHS"}`
- **Hostile vs non-hostile: 11 hostile, 10 non-hostile.**
  - OEFU: `"TOTAL HOSTILE DEATHS"` total 7 (6 killed in action, 1 died of wounds); `"TOTAL NON-HOSTILE DEATHS"` total 8 (6 Air Force accidents, 1 illness, 1 undetermined).
  - OO: hostile 4 (all killed in action, July); non-hostile 2 (`"PENDING"`).
  - **Flag for the outline:** "21 American lives" is the DoD total, but nearly half of those deaths were non-hostile.
- **Wounded in action, as of 23 Oct: 865.** OEFU `"total":"417"` plus OO `"total":"448"`.
  - Monthly, OEFU: Feb 36, Mar 342, Apr 34, Jun 5.
  - Monthly, OO: Jul 350, Sep 94, Oct 4.
  - "Most since 7 July" holds narrowly: 448 of 865 (52%) are in OO, which begins in June/July.
  - Small discrepancy: Task & Purpose reports "five soldiers were wounded in action in October", while DCAS shows OO October WIA = 4 (23 Oct extraction).
- **Secondary confirmation (as of 9 Oct DCAS update).** "Since Feb. 28, 865 service members have been wounded in the war, the majority since July 7." Also: "This summer the Pentagon split deaths and injuries in the war into two separate categories: one for Operation Epic Fury and one listed as 'overseas operations,' covering casualties since July." Task & Purpose, Nicholas Slayton, 10 Oct 2026, https://taskandpurpose.com/news/pentagon-iran-war-death-toll-21/
- **Newer than the candidate:** no change. The totals are the same on 23 Oct as on 9 Oct.
- **Range for a chart:** monthly from Feb 2026 to Oct 2026 in two categories. A method-change flag is needed for the split into OO.

### C19 — Cost estimates — verified (one small correction)

- **DoD $43.6 bn as of 3 Sep.** "The Pentagon's latest figure comprises $11.2 billion already obligated for operating expenses ... plus $32.4 billion in unfunded replacement costs for munitions, damaged aircraft and other assets". "The new Pentagon estimate of $43.6 billion is current as of Sept. 3, the document said". Roll Call, John M. Donnelly, 18 Sep 2026, https://rollcall.com/2026/09/18/pentagons-latest-iran-war-cost-estimate-43-6-billion/
- **The official series, from the same Roll Call article:** "the CBO said the war cost $38.1 billion through July"; "The IG, meanwhile, put the figure at $33.4 billion. Its estimate ran through June. Defense Secretary Pete Hegseth testified in July that the war would cost $37.5 billion through the end of September. The Pentagon has asked Congress for $67.1 billion in supplemental spending".
- **DoD $25 bn (29 Apr).** "Twenty-five billion dollars - that's how much the Pentagon estimates the war with Iran is costing." NPR via KASU, 29 Apr 2026, https://www.kasu.org/2026-04-29/dod-officials-say-iran-war-has-cost-25-billion-so-far-during-congressional-grilling
- **CBO (letter dated 15 Sep 2026; cbo.gov 403, read from the archive copy captured 1 Oct 2026).**
  - "CBO estimates that as of August 1, 2026, the armed conflict with Iran has cost DoD approximately $38 billion."
  - "if the level of violence remained as low as it was in May and June, an additional month of conflict would cost $2 billion; if the intensity of the conflict increased to roughly the level experienced in July, the cost per month would increase to $3 billion."
  - "CBO relied on government databases and public reports because DoD did not respond to CBO's requests for information."
  - URL: https://web.archive.org/web/20261001081726id_/https://www.cbo.gov/publication/62756
- **Supplemental request (CBO).** "This past June, the Administration requested $87.6 billion in supplemental appropriations, of which $67.1 billion was for DoD to pay for the conflict. The portion of that request that appears to be directly related to the conflict, $42.3 billion, is about 10 percent larger than CBO's estimate".
- **PCE (correction).** The candidate's "+0.5–0.6 pt" should be +0.5 pt headline and +0.3 pt core. CBO: "in the first quarter of 2027, inflation (measured year over year) in the price index for personal consumption expenditures (PCE) is now estimated to be 0.5 percentage points higher than the agency projected in February 2026, and core PCE inflation is estimated to be 0.3 percentage points higher". This is CBO's *attribution* to the conflict, which fills C32's causation gap.
- **CSIS (23 Jun 2026; archive copy, 11 Oct).** "CSIS estimates war costs to be around $40 billion ($34 billion to $42 billion)." https://www.csis.org/analysis/war-may-be-ending-what-did-epic-fury-cost
- **AEI (10 Apr 2026).** "we estimate an incremental cost to date of between $25 and $35 billion." https://www.aei.org/foreign-and-defense-policy/epic-fury-costs-as-of-the-april-8-cease-fire/
- **No newer DoD figure than $43.6 bn (3 Sep) was found** (one web search, 26 Oct).
- **For the viewpoints:** "$38–44 billion" holds. CBO notes the war's low cost relative to Iraq ("relatively few U.S. forces have been involved compared with the much larger and longer U.S. operations in Iraq and Afghanistan"), which helps the "not Iraq-scale" side.

### C20 — CSIS interceptor inventories — verified (the prewar figure is in a chart only)

- **Interceptor stocks (as of 27 Jul).** "This has required extensive use of interceptors, with Patriot inventories now under 1,000 and THAAD inventories at about 250. Diminished stockpiles may force the United States and its coalition partners to take more risks with interceptions." CSIS, Mark F. Cancian et al., published 27 Jul 2026. csis.org returns 403; read from the archive copy of 11 Oct: https://www.csis.org/analysis/renewed-iran-war-would-test-diminished-interceptor-inventories
- **2,330 Patriots prewar: not verifiable from text.** The April report (21 Apr 2026, Cancian & Park) puts its Patriot inventory in "Figure 9" (a chart); the text says only "Up to 400 of the older PAC-2 missiles may also still be in the stockpile but are not included in Figure 9." https://www.csis.org/analysis/last-rounds-status-key-munitions-iran-war-ceasefire
- **Method (April report):** "Of the total deliveries, 5 percent was deducted for training, lot testing, and other nonoperational uses." These are estimates built from budget documents, not official stock figures. Frame them as "CSIS estimates".
- **Not checked:** the Hegseth/CNN dispute.

### C21 — CRS RL32492 casualties — verified

- **Iraq, OIF only (as of 16 Jul 2020).** From "Table 12. Operation Iraqi Freedom: Casualty Summary by Casualty Category (as of July 16, 2020)": "Total Hostile Deaths 3,481 ... Total Nonhostile Deaths 937 ... Total Deaths 4,418 ... Total Wounded in Action 31,994". CRS RL32492, updated 29 Jul 2020, https://www.everycrsreport.com/files/2020-07-29_RL32492_e7d48d4caf03cdd007922fe2dc0d50d2a5594721.html
- **Afghanistan, OEF:** "Total Deaths 2,349 ... Total Wounded In Action 20,149".
- **Note:** 4,418 covers OIF (2003–2010) only. Operation New Dawn adds "Total Deaths 74" (Table 15). For "the Iraq war", use 4,418 for OIF or 4,492 for OIF + OND.
- **Comparison:** Iran's 21 deaths (C18) are 0.5% of OIF's 4,418.

### C22 — Iraq prewar cost estimates vs actual — corrected

- **Lindsey and Daniels (Sep 2002 onward).** "In September 2002, White House economic adviser Lawrence Lindsey told The Wall Street Journal that a U.S. intervention in Iraq could cost between $100 billion and $200 billion... White House Budget Director Mitchell E. Daniels Jr. labeled that figure as 'very, very high' and estimated total war costs at between $50 billion to $60 billion." CFR backgrounder, 2 Feb 2005, https://www.cfr.org/backgrounder/iraq-wars-price-tag
- **Correction, Brookings.** "Brookings Institution senior fellows Michael O'Hanlon and Lael Brainard estimated in August 2003 that military and reconstruction costs could range from $150 billion to $300 billion." That is five months after the invasion, so it is *not* a prewar estimate. The same CFR piece has a genuinely prewar independent estimate: "On the eve of the war in March 2003, an independent task force report from the Council on Foreign Relations estimated that stabilizing Iraq could cost some $20 billion a year for several years".
- **Correction, the actual cost.** CRS RL33110 (8 Dec 2014): "Congress has approved appropriations for the past 13 years of war that total $1.6 trillion ... $686 billion (43%) for Operation Enduring Freedom (OEF) for Afghanistan and other counterterror operations received; $815 billion (51%) for Operation Iraqi Freedom (OIF)/Operation New Dawn (OND)". https://www.everycrsreport.com/reports/RL33110.html. The $1.6 tn is all post-9/11 wars; **Iraq's share is $815 bn (FY2001–14).**
- **Not checked:** the CBO Sept 2002 letter.
- **For the viewpoints:** it still supports 3. Daniels' $50–60 bn against $815 bn actual is about a 14-fold overrun.

### C29 — EIA daily Brent spot (RBRTE) — verified; latest value 20 Oct

Source: EIA, "Europe Brent Spot Price FOB (Dollars per Barrel)", https://www.eia.gov/dnav/pet/hist/RBRTEd.htm. Release Date 10/21/2026; next release 10/28/2026. Raw table rows quoted below.

- **Before and at the April peak:**
  - "2026 Feb-23 to Feb-27 71.90 71.21 70.69 71.66 71.32": $71.32 on 27 Feb.
  - "2026 Apr- 6 to Apr-10 138.21 122.11 119.03 119.07": $138.21 on 7 Apr. The Monday cell (6 Apr, Easter Monday) is blank in EIA's table, so the first value is Tuesday 7 Apr, as the candidate says.
- **Autumn and latest:**
  - "2026 Sep-28 to Oct- 2 119.97 113.96 115.91 114.82 135.51": $135.51 on 2 Oct.
  - "2026 Oct-19 to Oct-23 118.82 115.22": **latest $115.22 (20 Oct 2026)**.
- **All-time high:** "2008 Jun-30 to Jul- 4 138.40 140.67 141.24 143.95": $143.95 on 3 Jul 2008. The 2022 high is $133.18 (8 Mar 2022, per parsed series).
- **Full range for a chart:** 20 May 1987 ($18.63) to 20 Oct 2026 (9,112 daily values). WTI (RWTCd) runs 2 Jan 1986 to 20 Oct 2026; its latest value is $107.89.
- **Correction to "a ~60% rise":** the peak was +94% over 27 Feb ($71.32 → $138.21). The latest value is +62%. State which comparison you mean.
- **Strengthens 5:** the post-July high was $135.51 (2 Oct), within 2% of the April peak.

### C30 — EIA real prices (STEO Real Prices Viewer) — verified, with a note on forecasts

Source: `https://www.eia.gov/outlooks/steo/realprices/real_prices.xlsx`, sheet "Crude Oil-M" ("Monthly Average Imported Crude Oil Price"; "real price (Oct 2026 $)"; "Data Source: EIA Short-Term Energy Outlook, October 2026"). Read from the XLSX cells.

- **Real-price peaks:** 2026 historical peak May $98.85; Jan 1981 $148.55; Jul 2008 $194.52; Jun 2022 $126.68. All verified to the cent.
- **Range for a chart:** Jan 1974 to Aug 2026 historical. Values from Sep 2026 onward are flagged as forecasts or estimates.
- **Note:** EIA's estimate for Sep 2026 is $97.89 and its Oct 2026 forecast is $100.00 real. If these hold, autumn 2026 will slightly exceed May as the 2026 peak. The series is the refiner *imported* crude cost, not Brent.

### C31 — EIA weekly US regular gasoline — verified; latest 19 Oct

Source: EIA, "Weekly U.S. Regular All Formulations Retail Gasoline Prices (Dollars per Gallon)", Release Date 10/20/2026, https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=EMM_EPMR_PTE_NUS_DPG&f=W

- **Rows quoted:**
  - "2026-Feb … 02/23 2.937"
  - "2026-May 05/04 4.452 05/11 4.500 05/18 4.490 05/25 4.475"
  - "2026-Sep … 09/21 4.478 09/28 4.465"
  - "2026-Oct 10/05 4.354 10/12 4.331 10/19 4.284"
  - "2022-Jun 06/06 4.876 06/13 5.006"
- **Latest value: $4.284 (19 Oct 2026).** The 2026 peak is $4.500 (11 May); the record is $5.006 (13 Jun 2022).
- **Range for a chart:** weekly from 20 Aug 1990 to 19 Oct 2026.

### C32 — BLS CPI, Fed, EIA STEO — verified

- **BLS CPI, September 2026 (released 14 Oct).** bls.gov returns 403; read from the archive copy of 24 Oct of `https://www.bls.gov/news.release/cpi.nr0.htm` (title "Consumer Price Index Summary - 2026 M09 Results").
  - "The all items index rose 3.7 percent for the 12 months ending September, a larger increase than the 3.4-percent increase reported for the 12 months ending in August. The all items less food and energy index rose 2.6 percent over the year... The energy index increased 20.4 percent for the 12 months ending September."
  - "The index for energy increased 20.4 percent over the past 12 months due in large part to the index for gasoline rising 34.2 percent over the same period."
  - "The index for gasoline rose 9.1 percent in September, accounting for over half of the monthly all items increase."
  - September is the latest month; October CPI is due in mid-November.
- **Fed, 16 Sep 2026.** "The Committee decided to raise the target range for the federal funds rate by 1/4 percentage point to 3-3/4 to 4 percent... While uncertainty remains elevated owing, in part, to geopolitical developments, domestic spending has been resilient." https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm. The statement does not name Iran.
- **EIA STEO (released 6 Oct 2026).**
  - "We assess that crude oil production shut-ins averaged 4.8 million b/d in September, down from 5.8 million b/d in August and down from 10.9 million b/d at the peak in May. We forecast the Brent crude oil spot price will average $105/b in the fourth quarter of 2026 (4Q26), $14/b higher than in last month's STEO." https://www.eia.gov/outlooks/steo/report/global_oil.php
  - From the STEO overview page: "gasoline prices averaged $4.35 per gallon (gal)" in September; Brent is forecast to fall to "$84/b next year". https://www.eia.gov/outlooks/steo/
- **Causation:** CPI and the Fed do not attribute the rise to the war. CBO's +0.5 pt PCE attribution (C19) is now verified.

### C33 — EIA Hormuz flows — verified

Source: EIA STEO, Global Energy Security tables, Release Date 12 Aug 2026, https://www.eia.gov/outlooks/steo/report/energysecurity/article.php

- **Oil and LNG flows, Table 4:** "Total oil flows through the Strait of Hormuz 20.9 21.0 21.3 21.6 14.9 4.9" (1Q25–2Q26, million b/d). "LNG flows through the Strait of Hormuz (billion cubic feet per day) 11.7 11.0 10.9 10.5 7.4 0.8".
- **Method caveat:** "Since the end of February 2026, AIS signal data for ships transiting the Strait of Hormuz have become especially unreliable. For 2026 Hormuz volumes, tanker tracking data are being revised frequently". The data are based on Vortexa tanker tracking.
- **Range:** quarterly, 1Q25 to 2Q26. 3Q26 is not yet published.

### C34 — IMF PortWatch daily Hormuz transits — verified

Source: IMF PortWatch ArcGIS API, `.../Daily_Chokepoints_Data/FeatureServer/0/query?where=portname='Strait of Hormuz'`, queried 26 Oct 2026. Values computed from the `n_total` field.

- **Monthly means:** Dec 2025 55.5, Jan 58.5, Feb 78.3, Mar 3.2, Apr 7.1, May 3.9, Jun 12.9 (peak 51 on 24 Jun), Jul 10.2, Aug 4.7, Sep 3.6, Oct (1–18) 3.6.
- **Latest:** 18 Oct, `n_total: 4`.
- **The collapse in early March:** 27 Feb 64, 28 Feb 57, 1 Mar 20, 2 Mar 4, 4 Mar 0.
- **Range for a chart:** daily from 1 Jan 2019 to 18 Oct 2026.
- **Baseline note:** the 2025 average was 85.5/day and 2024 was 92.3/day. Feb 2026 (78.3) was a pre-war surge over Dec–Jan (about 56–58). The choice of baseline changes the size of the fall.

### C35 — CENTCOM blockade tallies — verified (as quoted by a secondary source)

- **Blockade tally (as of 11 Oct).** The CENTCOM release text is reproduced in the Khaleej Times live blog: "CENTCOM forces resumed America's blockade against all ships entering or departing Iranian ports on July 14. Four commercial vessels have been disabled and 135 ships have been turned around during three months of strict enforcement. Additionally, U.S. forces have destroyed 10 tankers linked to the Islamic Revolutionary Guard Corps' multibillion-dollar shadow network over the same period." Khaleej Times, 11 Oct 2026, https://www.khaleejtimes.com/world/mena/worldmenaus-israel-iran-lebanon-war-live-updates-october-11-2026
- **Limits:** centcom.mil itself was not fetched (403 at stage 3). The "13 destroyed" figure (5 Oct) was not checked. These are single-party claims.

### C36 — Iranian oil exports — verified in part

- **Exports, Vortexa via Reuters (4 Jun 2026).** "Iran's exports averaged about 209,000 bpd in May, Vortexa data shows, down sharply from 1.34 million bpd in April and nearly 1.9 million bpd in March. This marks their lowest level since late 2019 and early 2020". Baird Maritime, 4 Jun 2026, https://www.bairdmaritime.com/shipping/tankers/iran-oil-exports-feel-the-squeeze-hitting-a-six-year-low
- **Not re-checked:** EIA STEO Table 1 (Iran crude 3,390 kb/d in Feb; 1,200 kb/d shut in, Sep) and the "September zero loadings" claim.

### C73 — Earlier congressional votes on unauthorised force — verified

- **Libya (House, 24 Jun 2011):**
  - Roll 493, H.J.Res.68, "Authorizing the limited use of the United States Armed Forces in support of the NATO mission in Libya", On Passage: Failed, 123–295. https://clerk.house.gov/evs/2011/roll493.xml
  - Roll 494, H.R.2278 (funding limit), On Passage: Failed, 180–238. https://clerk.house.gov/evs/2011/roll494.xml
- **Yemen, S.J.Res.7:**
  - House roll 153, 4 Apr 2019: Passed 247–175 (1 present). https://clerk.house.gov/evs/2019/roll153.xml
  - Senate passage, 13 Mar 2019, vote 48: "Passed 54 46".
  - Veto override, 2 May 2019, vote 94: "Veto Sustained 53 45". Senate vote menu 116-1, archive copy.
  - Senate Democrats' floor log: "By a vote of 53 to 45, the Senate failed to override the president's veto of the Yemen troop withdrawal resolution." https://www.dailypress.senate.gov/thursday-may-2-2019/
- **Iran, S.J.Res.68 (2020):**
  - Senate passage, 13 Feb 2020, vote 52: "Passed 55 45".
  - House roll 101, 11 Mar 2020, On Passage: Passed 227–186. https://clerk.house.gov/evs/2020/roll101.xml
  - Override, 7 May 2020, vote 84: "Veto Sustained 49 44". Floor log: "The override of S.J. Res 68 failed by a vote of 49-44." https://www.dailypress.senate.gov/thursday-may-7-2020/
- **Iran, S.J.Res.59 (27 Jun 2025):** "By a vote of 47-53, the Senate did not agree to S.J. Res.59, the Kaine War Powers Resolution on Iran. Senator Paul (R) voted aye and Senator Fetterman (D) voted no." https://www.dailypress.senate.gov/friday-june-27-2025/
- **Status:** all the Senate tallies now come from senate.gov's own vote menus (via the archive), so the Wikipedia dependency is removed.

### C79 — Trump 2024 campaign statements — verified

- **RNC acceptance speech, 18 Jul 2024.**
  - "I was the first president in modern times to start no new wars."
  - "With our victory in November, the years of war, weakness and chaos will be over. I don't have wars."
  - "they did everything possible for Iran and now Iran is very close to having a nuclear weapon, which would have never happened."
  - URL: American Presidency Project, https://www.presidency.ucsb.edu/documents/address-accepting-the-presidential-nomination-the-republican-national-convention-milwaukee
- **Election-night remarks, 6 Nov 2024.** "They said: 'He will start a war.' I'm not going to start a war. I'm going to stop wars." The word "Iran" does not appear in the transcript. https://www.presidency.ucsb.edu/documents/remarks-accepting-election-the-47th-president-the-united-states-palm-beach-florida (also reachable as presidency.ucsb.edu/node/375126)

---

## Blocked sources

- **https://www.senate.gov/legislative/LIS/roll_call_votes/vote1192/vote_119_2_00184.xml** and **https://www.senate.gov/legislative/LIS/roll_call_lists/vote_menu_119_2.xml**: HTTP 403 ("Senate.gov - Unauthorized", Akamai firewall). Worked around with the Internet Archive (latest capture 10 Oct 2026).
- **https://www.cbo.gov/publication/62756**: HTTP 403. Archive copy of 1 Oct 2026 used.
- **https://www.csis.org/analysis/renewed-iran-war-would-test-diminished-interceptor-inventories** (and other csis.org pages): HTTP 403. Archive copies of 11–16 Oct 2026 used.
- **https://www.bls.gov/news.release/archives/cpi_10142026.htm**: HTTP 403 ("Access Denied"). Archive copies of 17 and 24 Oct 2026 used.
- **https://dcas.dmdc.osd.mil/dcas/app/conflictCasualties**: returns a JavaScript shell with no data. Worked around through the app's own JSON API at `/dcas/api/report/...`.
- **https://clerk.house.gov/evs/2026/index.asp**: HTTP 404. Rolls were enumerated directly instead.
- **The primary 1 May 2026 War Powers letter**: not found on govinfo (House Docs 119-120 to 119-215 scanned). Known only from quotations by Lawfare and Goldsmith.
