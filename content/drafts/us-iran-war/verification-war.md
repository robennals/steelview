# Verification — war casualties, ceasefire record, allies and the timeline

Checked 26 Oct 2026 against pages fetched with curl (HTML tags stripped;
PDFs via `pdftotext`). Quotes are verbatim. "As of" is the date the figure
describes. Covers C15, C16, C17, C37, C38 (with C12's War Powers letters,
see [verification-us.md](verification-us.md)), C39, and the timeline's
latest events.

**Status:** 5 verified (C15, C16, C17, C38, C39), 1 corrected (C37).

---

### C15 — HRANA daily war reports — verified

- **1,701 civilians (at least 254 children), 1,221 military, 714
  unclassified, as of 7 Apr 2026.** "Aggregated data since the beginning of
  the conflict on February 28, 2026, based on incidents recorded in the
  incident tab and using minimum values for figures marked "more than": •
  Civilian fatalities: 1,701 people (including at least 254 children) •
  Military fatalities: 1,221 people • Unclassified fatalities
  (civilian/military): 714 people". HRANA, "Day 39 of U.S. and Israeli
  Attacks on Iran: Extensive Damage to the Rail Network and Roads", posted
  7 Apr 2026.
  https://www.en-hrana.org/day-39-of-u-s-and-israeli-attacks-on-iran-extensive-damage-to-the-rail-network-and-roads/
  (fetched directly with curl).
  - The 3,636 total is our sum (1,701 + 1,221 + 714); the page does not
    print it. Civilian share 1,701 / 3,636 = 46.8% (our arithmetic).
- **Method and undercount.** "Delays in medical reporting, difficulties in
  confirming identities, and restricted access to certain provinces may
  result in temporary undercounting." Same page. HRANA also lists state-media
  aggregates separately and excludes them: "they have not been included in
  the event-based calculations".
- **No later cumulative HRANA count was found.** The daily series runs
  28 Feb – about 8 Apr.

### C16 — Iranian government counts relayed by WHO — verified (newer source)

- **3,375 deaths, 33,806 injuries, 3.2 million displaced, as of 21 Jul
  2026.** WHO, "Middle East escalation of conflict — Global external
  situation report #10", 22 Jul 2026 ("Data as of 21 July"). Overview table:
  "Iran 3 200 000 [Displaced] 33 806 [Injured] 3 375 [Deaths]", with the note
  "All numbers are estimates and may differ from other sources due to data
  cutoff times." Country text: "Since the beginning of the hostilities on 28
  February, national authorities reported 3375 deaths and 33 806 injuries in
  the Islamic Republic of Iran, including 15 injuries following strikes on 7
  June. An additional 50 deaths and more than 517 injuries have been
  reported as occurring between 27 June – 19 July … Cumulative figures since
  28 February have yet to be reported."
  https://cdn.who.int/media/docs/default-source/middle-east-situation-report/middle-east-conflict-global-situation-report-22-july-2026.pdf
  (landing page https://www.who.int/publications/m/item/middle-east-escalation-of-conflict--global-external-situation-report--10---22-july-2026).
  - The deaths are the Iranian authorities' figure, relayed; WHO does not
    count independently. The 3.2 million displaced is not attributed to
    UNHCR in this edition.
  - **Denominator:** World Bank population 92,417,681 in 2025
    (`"date":"2025","value":92417681`, WDI SP.POP.TOTL, last updated
    8 Oct 2026, https://api.worldbank.org/v2/country/IRN/indicator/SP.POP.TOTL?format=json).
    3.2 million displaced is 3.5% of that (our arithmetic).
  - Supersedes the candidate's EMRO Sitrep 7, which is blocked (TLS:
    "self signed certificate in certificate chain").
- **3,519 including 517 women (23 Jun, via Bernama): unverifiable** (same
  TLS failure; the archive copy returned 503).

### C17 — Hengaw and Airwars — verified

- **Hengaw: at least 7,650 killed in 40 days, 1,030 (13.5%) civilians, as
  of 8 Apr 2026.** "According to data collected by Hengaw, at least 7,650
  people were killed during the recent war, of whom 1,030 (equivalent to
  13.5%) were civilians." Also: "among the victims were at least 189 minors
  and at least 215 women". Hengaw, "At least 7,650 killed in 40 days of war,
  including 1,030 civilians — Hengaw's tenth report", 8 Apr 2026.
  https://hengaw.org/en/content/article-40331
  - Hengaw also asserts that "Iranian military forces abandoned official
    bases and were stationed in civilian locations" — an allegation, not a
    count.
- **Airwars: 267 civilian-harm incidents in the 40-day war (71 published);
  34 more after strikes resumed in June (23 published).** "Over 40 days
  Airwars tracked 267 civilian harm incidents and has published 71." "In
  June, U.S. strikes began again after negotiations faltered. Airwars' rapid
  response team has tracked 34 further incidents of civilian harm, of which
  23 have been published." Airwars conflict page (live, undated; "numbers
  liable to change"), fetched 26 Oct 2026.
  https://airwars.org/conflicts/israeli-iranian-and-us-forces-2026
- **Airwars/CIVIC one-month report: 1,443 civilians to 23 Mar — this is
  HRANA's figure, not an independent count.** "At least 1,443 civilians have
  been killed by U.S. and Israeli forces, including 217 children, according
  to HRA." Airwars, 27 Mar 2026.
  https://airwars.org/civilian-harm-in-iran-after-one-month-of-war/
- **Finding for R5:** counters disagree on the split as much as the total:
  HRANA 46.8% civilian of a 3,636 minimum (7 Apr), Hengaw 13.5% of 7,650
  (8 Apr), the government 3,375 with no split (to 21 Jul).

### C37 — ISW/CTP Iran updates — corrected (wording; URL recovered)

- **"Reconstitute", not "rebuild"; and no enrichment statement on the
  page.** "Iran has continuously made efforts to reconstitute its ballistic
  missile and drone programs since the ceasefire on April 8." ISW/CTP, "Iran
  Update Special Report, July 13, 2026".
  https://www.criticalthreats.org/analysis/iran-update-special-report-july-13-2026
  - The candidate's "no evidence of enrichment" is not on this page; drop it
    or find the update that says it.
  - Same report: "The United States will resume its blockade of Iranian ports
    beginning on July 14 at 4:00 PM ET." And: "the increase in strikes and
    reimposition of the blockade nonetheless mark the end of the ceasefire."
  - Same report on the blockade's effect: "The US naval blockade had a
    limited but notable effect on Iranian willingness to continue fighting in
    Spring 2026 and was critical to securing the MoU."
- **Newer (19 Oct 2026):** "The Iranian regime's appointment of Mehrdad
  Akhlaghi, who has extensive experience in missile technology, as Iran's new
  defense minister indicates that the regime is prioritizing the
  reconstitution of its missile program." And Akhlaghi "stated on October 19
  that Iran will not rebuild defense industrial facilities at old locations
  but will instead construct them 'in mountains and security structures.'"
  https://www.criticalthreats.org/analysis/iran-update-october-19-2026
- Publisher caveat stands: AEI/ISW; an assessment, not imagery.

### C38 — Ceasefire incident record — verified (from War Powers letters)

- **Both sides used force during the 8 Apr – 7 Jul ceasefire**, per the
  President's own War Powers letters (quotes in verification-us.md, C12):
  HD 119-162 ("On June 8, 2026, … Iran engaged a United States Army AH-64
  Apache helicopter, forcing its crash landing"; US "military action
  commenced on June 9, 2026"); HD 119-167 (US action "on June 26 and June
  28, 2026"); HD 119-169 (US "military action commenced on July 7, 2026").
- **Not verified:** Iranian Health Ministry "38 killed since 22 June";
  Kuwait intercepts; GlobalSecurity imagery digest (402).
- **WHO adds:** "An additional 50 deaths and more than 517 injuries have been
  reported as occurring between 27 June – 19 July" (C16 source).

### C39 — Allied and UN statements — verified (UNSCR 2817 unverifiable)

- **E3, 28 Feb 2026.** "We did not participate in these strikes, but are in
  close contact with our international partners, including the United
  States, Israel, and partners in the region." "We condemn Iranian attacks on
  countries in the region in the strongest terms. … Ultimately, the Iranian
  people must be allowed to determine their future." UK Government, "Joint
  E3 leaders' statement on Iran: 28 February 2026".
  https://www.gov.uk/government/news/joint-e3-leaders-statement-on-iran-28-february-2026
- **Oman's foreign minister, 14 Jul 2026.** "Sayyid Badr describes the war as
  "a catastrophe". He notes that it has been launched without United Nations
  authorisation and has failed to achieve the objectives cited to justify
  it." Oman Ministry of Foreign Affairs, summarising his *Le Monde* article,
  14 Jul 2026. https://www.fm.gov.om/en/50917/
- **UNSCR 2817 (11 Mar, 13–0–2): unverifiable.** press.un.org returned a
  client challenge, the archive copy HTTP 406, and docs.un.org a JavaScript
  viewer. Human fetch needed.

### Timeline's latest events — checked 26 Oct 2026

- **8 Oct pledge (verified).** "But Trump in a social media post on Thursday
  said the U.S. "will not be attacking Iran at any time prior to the Midterm
  Elections to be held in the United States on November 3rd." Trump added
  that his team has been "having productive discussions with the Islamic
  Republic of Iran."" Also: "Negotiations had appeared at a standstill since
  Trump late last month publicly rejected Iran's proposal to reopen the
  Strait of Hormuz within seven days if the U.S. met certain conditions."
  AP, 8 Oct 2026, via WCAX.
  https://www.wcax.com/2026/10/08/trump-says-us-will-not-resume-military-strikes-iran-before-midterm-elections/
- **Tanker attacks, first half of October (lead).** "Several shipping and
  maritime security officials told Bloomberg on October 20 that at least
  five of the 23 recorded attacks on vessels in or near the Strait of Hormuz
  in the first two weeks of October struck commercial vessels' engine
  rooms." ISW/CTP, 21 Oct 2026.
  https://www.criticalthreats.org/analysis/iran-update-october-21-2026
  - Same page: "The Washington Post, citing oil price-tracking firm Kpler,
    reported that the number of barrels of oil exported per day is
    approaching prewar daily averages after increasing from mid-August to
    late September." (Gulf exports generally; cuts against "the strait is
    closed".)
- **Post-midterm plans (lead).** "The New York Times reported on October 21
  that the US and Israeli militaries have developed specific plans for a
  short and intensive operation against Iran after the US midterm elections
  on November 3, citing US officials and other people briefed on the
  deliberations." ISW/CTP, 22 Oct 2026.
  https://www.criticalthreats.org/analysis/iran-update-october-22-2026
- **DNI memo (lead).** "Director of National Intelligence Jay Clayton warned
  on October 23 that US intelligence assessments indicate that Iran is in the
  "advanced stages" of planning attacks against US targets in the region."
  ISW/CTP, 24 Oct 2026.
  https://www.criticalthreats.org/analysis/iran-update-october-24-2026-6add17463a4cf
- **Houthi strikes on Saudi Arabia (lead).** "The Houthis have fired at least
  12 missiles and two drones targeting Saudi Arabia since October 24".
  ISW/CTP, 25 Oct 2026.
  https://www.criticalthreats.org/analysis/iran-update-october-25-2026
- **Unverified:** CENTCOM's 16 Oct "$25 billion" claim (Wikipedia citing The
  Hill and Iran International; centcom.mil 403, no archive copy of the
  release found).

---

## Blocked sources

- https://www.emro.who.int/images/stories/eha/ME-Sitrep-17-23-April-26.pdf
  and https://web29.bernama.com/nnn/news.php?id=2572119 — TLS error ("self
  signed certificate in certificate chain"); archive copies HTTP 503.
- https://press.un.org/en/2026/sc16315.doc.htm — client challenge; archive
  HTTP 406; https://docs.un.org/en/S/RES/2817(2026) is a JavaScript viewer.
- https://www.centcom.mil/MEDIA/PRESS-RELEASES/ — HTTP 403; archive copies
  of the 13 Apr blockade release hold only the page shell.
- https://apnews.com/hub/iran — HTTP 403 (AP text read via a syndicating
  station instead).
- https://understandingwar.org/research/middle-east/iran-update-october-24-2026/
  — HTTP 403 (security service); the criticalthreats.org mirror works.
