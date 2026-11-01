---
# Every worked example in the visualization spec (section 2.11), in one fact,
# followed by the Phase 3 kinds (4.1, 4.2): a categorical tile map, a geo map
# and a scatter plot.
# Not a real report: the sources are fixtures whose quotes hold the words the
# figures quote, so the validation rules (F1–F12) pass. Kept outside
# __fixtures__/topics so the load tests keep their counts.
title: Every figure kind, in reading order
claim: A fixture fact that places a series, a comparison, a body section and one figure of every kind.
status: complicated
sources:
  - stance: supports
    quote: "The Agency cannot provide any information on the current size, composition or whereabouts of the stockpile of enriched uranium in Iran."
    title: "Fixture: IAEA report to the Board of Governors"
    url: https://example.org/fixture/1
    publisher: IAEA
    date: 2026-06
  - stance: supports
    quote: "A ceasefire took effect on 8 April 2026 and lapsed on 7 July 2026."
    title: "Fixture: ceasefire chronology"
    url: https://example.org/fixture/2
    publisher: Congressional Research Service
    date: 2026-07
  - stance: supports
    quote: "Iran was designated a state sponsor of terrorism on 19 January 1984. A naval blockade began on 13 April 2026."
    title: "Fixture: designations and blockade"
    url: https://example.org/fixture/3
    publisher: US Department of State
    date: 2026-04
  - stance: supports
    quote: "The President reported that hostilities with Iran \"have terminated\"."
    title: "Fixture: War Powers letter"
    url: https://example.org/fixture/4
    publisher: The White House
    date: 2026-05
  - stance: supports
    quote: "Arkansas rejected 8.8% of returned mail ballots, the highest rate of any state."
    title: "Fixture: EAVS 2024 Overview"
    url: https://example.org/fixture/5
    publisher: US Election Assistance Commission
    date: 2025-06
  - stance: supports
    quote: "On 4 February 2021 an Antwerp court convicted Assadolah Assadi of attempted terrorist murder."
    title: "Fixture: Antwerp judgment"
    url: https://example.org/fixture/6
    publisher: Court of First Instance, Antwerp
    date: 2021-02
  - stance: complicates
    quote: "Fixture source with no figure citing it."
    title: "Fixture: unused source"
    url: https://example.org/fixture/7
    publisher: Fixture Publisher
    date: 2026
  - stance: supports
    quote: "Farhad Shakeri was charged in New York in November 2024."
    title: "Fixture: criminal complaint"
    url: https://example.org/fixture/8
    publisher: US Department of Justice
    date: 2024-11
  - stance: supports
    quote: "Iran was designated a state sponsor of wrongful detention on 27 February 2026."
    title: "Fixture: wrongful-detention designation"
    url: https://example.org/fixture/9
    publisher: US Department of State
    date: 2026-02
  - stance: supports
    quote: "The Senate voted 50 to 50 on the Freedom to Vote Act and 52 to 48 against changing the filibuster."
    title: "Fixture: Senate roll calls"
    url: https://example.org/fixture/10
    publisher: US Senate
    date: 2022-01
  - stance: supports
    quote: "Auditors re-examined more than 7,200 signatures and judged 98.7% of county decisions appropriate. Rejection rates were 2.49% for Black voters, 1.59% for Native American voters, 1.57% for Hispanic voters, 1.24% for Asian or Pacific Islander voters and 0.63% for White voters."
    title: "Fixture: Washington State Auditor, ballot rejection review"
    url: https://example.org/fixture/11
    publisher: Washington State Auditor
    date: 2022-02
  - stance: supports
    quote: "As of 7 April, HRANA had recorded 1,701 civilian deaths, 1,221 military deaths and 714 deaths not yet classified."
    title: "Fixture: HRANA casualty count"
    url: https://example.org/fixture/12
    publisher: HRANA
    date: 2026-04
  - stance: supports
    quote: "Hengaw counted 1,030 civilians and 6,620 others killed by 8 April."
    title: "Fixture: Hengaw casualty count"
    url: https://example.org/fixture/13
    publisher: Hengaw
    date: 2026-04
  - stance: supports
    quote: "We estimate the cost so far at between $25 billion and $35 billion."
    title: "Fixture: AEI cost estimate"
    url: https://example.org/fixture/14
    publisher: American Enterprise Institute
    date: 2026-04
  - stance: supports
    quote: "Our central estimate is $40 billion, within a range of $34 billion to $42 billion."
    title: "Fixture: CSIS cost estimate"
    url: https://example.org/fixture/15
    publisher: CSIS
    date: 2026-06
  - stance: supports
    quote: "CBO estimates the cost at $38 billion. Section 2 of the Voting Rights Act bars voting practices, including registration procedures, that discriminate by race, colour or language-minority status; its preclearance formula was struck down in Shelby County (2013)."
    title: "Fixture: CBO cost estimate and VRA summary"
    url: https://example.org/fixture/16
    publisher: Congressional Budget Office
    date: 2026-08
  - stance: supports
    quote: "The Department reports costs of $43.6 billion through 3 September."
    title: "Fixture: Department of Defense cost report"
    url: https://example.org/fixture/17
    publisher: US Department of Defense
    date: 2026-09
  - stance: supports
    quote: "It's buried and we're watching it."
    title: "Fixture: press briefing"
    url: https://example.org/fixture/18
    publisher: US Department of Defense
    date: 2026-04
  - stance: complicates
    quote: "We see no identifiable route by which Iran could recover the material quickly."
    title: "Fixture: ISIS assessment"
    url: https://example.org/fixture/19
    publisher: Institute for Science and International Security
    date: 2026-06
  - stance: complicates
    quote: "Fixture source with no figure citing it."
    title: "Fixture: unused source"
    url: https://example.org/fixture/20
    publisher: Fixture Publisher
    date: 2026
  - stance: supports
    quote: "Absentee ballots remain the largest source of potential voter fraud. The commission found no evidence of extensive fraud."
    title: "Fixture: Building Confidence in U.S. Elections"
    url: https://example.org/fixture/21
    publisher: Commission on Federal Election Reform
    date: 2005-09
  - stance: contests
    quote: "One in five mail-in voters admit they cheated, the survey found."
    title: "Fixture: Heartland–Rasmussen survey release"
    url: https://example.org/fixture/22
    publisher: Heartland Institute
    date: 2023-12
  - stance: complicates
    quote: "The panel was an opt-in online sample, and the questions asked about behaviour that is not always illegal."
    title: "Fixture: survey methodology review"
    url: https://example.org/fixture/23
    publisher: Fixture Methods Review
    date: 2024-01
  - stance: supports
    quote: "Pressure inside a home is rarely reported. The SAVE Act passed the House 220 to 208 on 10 April 2025 and would require documentary proof of citizenship to register."
    title: "Fixture: household pressure and the SAVE Act"
    url: https://example.org/fixture/24
    publisher: Brennan Center
    date: 2025-04
  - stance: supports
    quote: "In the Cobb County audit a spouse-signed envelope passed signature review."
    title: "Fixture: Cobb County audit"
    url: https://example.org/fixture/25
    publisher: Georgia Secretary of State
    date: 2021-01
  - stance: complicates
    quote: "The database is a sample of cases its compilers found, not a count of all cases."
    title: "Fixture: Heritage election fraud database"
    url: https://example.org/fixture/26
    publisher: Heritage Foundation
    date: 2026
  - stance: supports
    quote: "Table 1 lists each state's voter ID requirement as strict photo, strict non-photo, non-strict photo, non-strict non-photo, or no document requested."
    title: "Fixture: NCSL voter ID requirements, Table 1"
    url: https://example.org/fixture/27
    publisher: National Conference of State Legislatures
    date: 2026
  - stance: supports
    quote: "In-country postal voting is available to all voters in Canada, Germany, Iceland, Korea, Liechtenstein, Luxembourg, New Zealand, Poland, Switzerland, the United Kingdom and the United States, and to some voters in France and Australia."
    title: "Fixture: International IDEA, Special Voting Arrangements"
    url: https://example.org/fixture/28
    publisher: International IDEA
    date: 2025-08
  - stance: supports
    quote: "Counting 95% of the vote took 147 hours in Arizona, 51 in Nevada, 8 in Pennsylvania, 6 in North Carolina and 5 in Georgia."
    title: "Fixture: how long it took to count the vote, 2024"
    url: https://example.org/fixture/29
    publisher: MIT Election Data and Science Lab
    date: 2025-01
  - stance: supports
    quote: "Fixture: the days before Election Day on which each state lets officials begin processing mail ballots."
    title: "Fixture: NCSL Table 16, when processing may begin"
    url: https://example.org/fixture/30
    publisher: National Conference of State Legislatures
    date: 2026
  - stance: supports
    quote: "Fixture: at least 159 deaths in the north, fewer than 40 in the west, about 90 in the south, between 60 and 80 in the east, and 120 in the capital. Of the dead, 62.5% were civilians, 30.1% combatants and 7.3% unidentified."
    title: "Fixture: deaths by region, as the counter qualifies them"
    url: https://example.org/fixture/31
    publisher: Fixture Casualty Counter
    date: 2026-05
  - stance: complicates
    quote: "Bei der Briefwahl ist die öffentliche Kontrolle der Stimmabgabe zurückgenommen. Die Zulassung der Briefwahl dient aber dem Ziel, eine möglichst umfassende Wahlbeteiligung zu erreichen."
    title: "Fixture: Federal Constitutional Court, 2 BvC 7/10"
    url: https://example.org/fixture/32
    publisher: Federal Constitutional Court of Germany
    date: 2013-07-09
  - stance: complicates
    quote: "All political parties welcomed and supported postal voting on demand. Until very recently, none has treated electoral fraud as representing a problem."
    title: "Fixture: Birmingham election court judgment"
    url: https://example.org/fixture/33
    publisher: Election Court
    date: 2005-04-04
  - stance: complicates
    quote: "It was argued that unrestricted postal voting undermines the fundamental secrecy of the ballot."
    title: "Fixture: Securing the ballot (Pickles review)"
    url: https://example.org/fixture/34
    publisher: UK Cabinet Office
    date: 2016-08
  - stance: supports
    quote: "There has been no evidence that undue influence on voters has been a problem in Oregon elections conducted by mail. Oregon voters report high satisfaction with voting by mail."
    title: "Fixture: Oregon's mail elections"
    url: https://example.org/fixture/35
    publisher: The Conversation
    date: 2020-09-03
  - stance: supports
    quote: "Fixture: counting 95% of the vote took 73 hours in Arizona in 2020 and 147 in 2024; 159 hours in Nevada in 2020 and 51 in 2024; 49 hours in Pennsylvania in 2020 and 8 in 2024; and at least 18 hours in Georgia in 2020, about 5 in 2024."
    title: "Fixture: hours to count, 2020 and 2024"
    url: https://example.org/fixture/36
    publisher: MIT Election Data and Science Lab
    date: 2025-03
  - stance: supports
    quote: "Fixture: Black registration was 14.2% in Alabama in 1958 and 19.4% in 1964; 31.7% in Louisiana in 1956 and 31.8% in 1965; 4.4% in Mississippi in 1954 and 6.4% in 1964."
    title: "Fixture: the Attorney General's registration estimates"
    url: https://example.org/fixture/37
    publisher: US Department of Justice
    date: 1965-03
  - stance: supports
    quote: "Fixture: on 15 September 2026 the House passed H.Con.Res. 93, 220 to 204: Republicans 7 yes and 203 no, Democrats 213 yes and 0 no. On 24 September the Senate rejected H.Con.Res. 89, 49 to 50: Republicans 4 yes and 49 no, Democrats 43 yes and 1 no, independents 2 yes and 0 no."
    title: "Fixture: war-powers roll calls by party"
    url: https://example.org/fixture/38
    publisher: Office of the Clerk, US House of Representatives
    date: 2026-09
  - stance: supports
    quote: "Fixture: ships a day, June to September 2026 — Strait of Hormuz 31, 22, 9, 4; Bab el-Mandeb 30, 29, 28, 27; Suez Canal 40, 41, 43, 42; Malacca Strait 228, 231, 225, 230."
    title: "Fixture: PortWatch daily chokepoint counts, monthly means"
    url: https://example.org/fixture/39
    publisher: IMF PortWatch
    date: 2026-10
  - stance: supports
    quote: "Fixture: the Kerch Strait counter began in July 2026: 12, 3 and 0 ships a day in July, August and September."
    title: "Fixture: Kerch Strait counter"
    url: https://example.org/fixture/40
    publisher: Fixture Ship Tracker
    date: 2026-10
  - stance: supports
    quote: "Fixture: asylum applicants per 10,000 residents in 2024 were 95.1 in Cyprus, 70.8 in Greece, 30.0 in Germany, about 21 in Liechtenstein, 16.0 in the United Kingdom and under 0.1 in Hungary."
    title: "Fixture: asylum applicants per head across Europe, 2024"
    url: https://example.org/fixture/41
    publisher: Fixture Migration Observatory
    date: 2025-03
series:
  title: Mail ballots rejected nationally, 2016–2024
  description: Share of returned mail ballots rejected in each federal general election.
  periodLabel: Election year
  coverage: { from: '2016', to: '2024' }
  readings:
    - id: rejected-share
      label: Share rejected
      unit: percent
      valueLabel: Rejected, % of returned mail ballots
      lines:
        - name: United States
          points:
            - { period: '2016', value: 1.0 }
            - { period: '2020', value: 0.8 }
            - { period: '2024', value: 0.9 }
  source:
    stance: supports
    quote: "Fixture: 1.0% of returned mail ballots were rejected in 2016, 0.8% in 2020 and 0.9% in 2024."
    title: "Fixture: EAVS rejection series"
    url: https://example.org/fixture/27
    publisher: US Election Assistance Commission
    date: 2025-06
comparisons:
  - id: senate-votes
    title: Senate votes on the Freedom to Vote Act, January 2022
    description: Votes cast for and against, by question.
    unit: count
    valueLabel: Senators
    sources: [10]
    items:
      - { label: For the bill, value: 50, detail: As the roll call records it }
      - { label: Against the bill, value: 50 }
figures:
  - kind: series
  - kind: comparison
    id: senate-votes
  - kind: dataTable
    id: federal-laws
    replaces: [federal-laws-list]   # the bulleted list this table replaced; old links land here
    title: Federal voting laws and bills on registration and ID, 1965–2026
    description: >-
      The federal laws in force on registration and ID, and the two parties'
      main bills of the past five years, with what became of each.
    caption: One row per law, bill or ruling
    columns:
      - { key: year, label: Year, format: text }
      - { key: measure, label: 'Law, bill or ruling', rowHeader: true }
      - { key: effect, label: What it does on registration and ID, sortable: false }
      - { key: status, label: Status, sortable: false }
    defaultSort: { key: year, direction: ascending }
    rows:
      - year: '2025'
        measure: SAVE Act (Republican)
        effect: { value: Documentary proof of citizenship to register, sources: [24] }
        status: { value: 'Passed House, 220–208, 10 Apr 2025', sources: [24] }
      - year: '1965'
        measure: Voting Rights Act
        effect:
          value: >-
            Section 2 bars voting practices, including registration procedures,
            that discriminate by race, colour or language-minority status
          sources: [16]
        status:
          value: In force; the preclearance formula was struck down in Shelby County (2013)
          sources: [16]
  - kind: section
    id: freedom-to-vote-act-provisions
  - kind: keyFigures
    id: audit-recheck
    title: How the State Auditor checked counties' signature decisions, 2020
    description: Auditors re-examined a sample of county decisions to accept or reject a ballot.
    figures:
      - value: 7200
        qualifier: more than
        asPublished: more than 7,200
        format: { unit: count }
        label: signatures re-examined
        period: '2020'
        periodLabel: November 2020 general election
        source: 11
      - value: 98.7
        format: { unit: percent, decimals: 1 }
        label: of county decisions judged appropriate
        period: '2020'
        source: 11
  - kind: timeline
    id: court-record
    title: Court findings, convictions and designations, 1984–2026
    description: >-
      Each dated legal finding or designation about Iranian plots abroad.
      Charges that have not been tried are shown as their own category.
    categories:
      - { id: designation, label: Designation }
      - { id: court-finding, label: Court finding }
      - { id: conviction, label: Conviction }
      - { id: charge, label: Charge only }
    events:
      # A date the source gives only roughly is written as it gives it: a decade or "c. 1984".
      - { date: 1980s, title: "Fixture: an event its source dates only to the decade", category: designation, source: 3 }
      - { date: '1984-01-19', title: Iran designated a state sponsor of terrorism, category: designation, source: 3 }
      - { date: '2021-02-04', title: Assadi convicted in Antwerp, category: conviction, significance: major, source: 6 }
      - { date: '2024-11', title: Shakeri charged in New York, category: charge, source: 8 }
      - { date: '2026-02-27', title: Wrongful-detention designation, category: designation, source: 9 }
  - kind: periodTimeline
    id: war-periods
    title: Ceasefire, blockade, memorandum and strike-pause periods, 2026
    description: >-
      When each arrangement was in force, against the War Powers letters sent
      to Congress. Open bars were still in force on the date of this report.
    rowLabel: Arrangement
    from: '2026-02-28'
    categories:
      - { id: ceasefire, label: Ceasefire }
      - { id: blockade, label: Blockade }
      - { id: agreement, label: Memorandum of understanding }
      - { id: pause, label: Strike pause }
    rows:
      - label: Ceasefire
        # A period may cite its own sources; several, like any item.
        periods: [{ from: '2026-04-08', to: '2026-07-07', category: ceasefire, label: Ceasefire, sources: [2, 4] }]
      - label: US naval blockade
        periods:
          - { from: '2026-04-13', to: '2026-06-18', category: blockade, label: First blockade, source: 3 }
          - { from: '2026-07-14', category: blockade, label: Second blockade }
      - label: Memorandum of understanding
        periods: [{ from: '2026-06-17', to: '2026-07-08', category: agreement, label: MoU }]
      - label: Strike pause
        periods: [{ from: '2026-10-08', category: pause, label: Pause }]
    events:
      - { period: '2026-05-01', label: 'Letter says hostilities "have terminated"', source: 4 }
    sources: [2, 3, 4]
  - kind: tileMap
    id: rejection-by-state
    title: Mail ballots rejected, by state, 2024
    description: >-
      Share of returned mail ballots each state rejected in the November 2024
      general election. The eight mostly-mail states and D.C. are outlined.
    map: us-states
    areaLabel: State
    valueLabel: Rejected, % of returned mail ballots
    format: { unit: percent, decimals: 1 }
    breaks: [0, 0.5, 1, 2, 4, 9]
    highlight: [CA, CO, HI, NV, OR, UT, VT, WA, DC]
    valuesFrom: EAVS 2024 Overview Table 1
    sources: [5]
    note: >-
      Fixture: only six states are given, so every other state reads "No
      data". A real report gives all 51 areas from the EAVS table.
    data:
      AR: { value: 8.8, asPublished: 8.8% }
      DE: 5.1
      OK: 4.3
      VT: 0.2
      ME: 0.2
      IN: 0.2
  - kind: barChart
    id: wa-by-race
    title: Mail ballots rejected in Washington, by race, 2020
    description: The State Auditor's rates for each group, before any controls for age or county.
    valueLabel: Rejected, % of returned ballots
    categoryLabel: Group
    format: { unit: percent, decimals: 2 }
    sources: [11]
    items:
      - { label: Black, value: 2.49 }
      - { label: Native American, value: 1.59, detail: The State Auditor's name for the group }
      - { label: Hispanic, value: 1.57 }
      - { label: Asian or Pacific Islander, value: 1.24 }
      - { label: White, value: 0.63 }
  - kind: compositionBar
    id: deaths-by-counter
    title: Iranian deaths in the war, by counter and category, early April 2026
    description: >-
      Each counter's total split into the categories it publishes. The
      counters use different categories and dates, so compare the splits, not
      only the totals.
    rowLabel: Counter
    showCounts: true
    categories:
      - { key: civilian, label: Civilian }
      - { key: military, label: Military }
      - { key: unclassified, label: Not yet classified }
      - { key: other, label: "Other (Hengaw's category)" }
    rows:
      - { label: 'HRANA, 7 Apr', values: { civilian: 1701, military: 1221, unclassified: 714 }, source: 12 }
      - { label: 'Hengaw, 8 Apr', values: { civilian: 1030, other: 6620 }, source: 13 }
    note: >-
      The government's count (3,375 to 21 July) gives no split and is not
      shown as a bar; it is in the Observations below.
  - kind: estimateRange
    id: cost-estimates
    title: Estimated cost of the war to the US, by estimator, 2026
    description: >-
      Each published estimate of the cost so far, with its range where the
      estimator gave one. Later estimates cover a longer war.
    valueLabel: Estimated cost, US$ billion
    itemLabel: Estimator
    format: { unit: number, decimals: 1 }
    intervalLabel: Range the estimator published
    nullValue: null
    estimates:
      - { label: AEI, year: 8 Apr 2026, low: 25, high: 35, source: 14 }
      - { label: CSIS, year: Jun 2026, estimate: 40, low: 34, high: 42, source: 15 }
      - { label: CBO, year: 1 Aug 2026, estimate: 38, source: 16 }
      - { label: Department of Defense, year: 3 Sep 2026, estimate: 43.6, source: 17 }
  - kind: quotes
    id: damage-claims
    question: What did the strikes do to Iran's enriched uranium?
    description: Four answers from the US government, an independent institute and the IAEA.
    quotes:
      - { text: "buried and we're watching it", speaker: Pete Hegseth, role: Secretary of Defense, date: '2026-04', source: 18 }
      - { text: no identifiable route, speaker: Institute for Science and International Security, date: '2026-06', source: 19 }
      - text: cannot provide any information on the current size, composition or whereabouts
        speaker: IAEA Director General
        context: Report to the Board of Governors
        date: '2026-06'
        source: 1
  # More than four quotes (spec 3): a list in date order, filtered by
  # category and speaker. A quote not in English carries its language and a
  # translation, shown beside it.
  - kind: quotes
    id: postal-secrecy
    question: Does postal voting give up the secrecy of the ballot?
    description: Two courts, a government review and a researcher, on what is lost when a ballot is filled in at home.
    categoryLabel: Who is speaking
    categories:
      - { id: court, label: Courts }
      - { id: review, label: Government reviews }
      - { id: research, label: Researchers }
    quotes:
      - text: Bei der Briefwahl ist die öffentliche Kontrolle der Stimmabgabe zurückgenommen … eine möglichst umfassende Wahlbeteiligung zu erreichen
        lang: de
        translation: With postal voting, public control of how the vote is cast is reduced … [it serves the aim of] the widest possible turnout. (This report's translation.)
        speaker: Federal Constitutional Court of Germany
        stance: court
        date: '2013-07-09'
        source: 32
      - text: Until very recently, none has treated electoral fraud as representing a problem.
        speaker: Richard Mawrey QC
        role: Election commissioner
        context: Birmingham election court judgment
        stance: court
        date: '2005-04-04'
        source: 33
      - text: unrestricted postal voting undermines the fundamental secrecy of the ballot
        speaker: Sir Eric Pickles's review
        context: Reporting submissions to the review
        stance: review
        date: '2016-08'
        source: 34
      - text: There has been no evidence that undue influence on voters has been a problem in Oregon elections conducted by mail.
        speaker: Priscilla Southwell
        stance: research
        date: '2020-09-03'
        source: 35
      - text: Oregon voters report high satisfaction with voting by mail.
        speaker: Priscilla Southwell
        stance: research
        date: '2020-09-03'
        source: 35
  - kind: pullQuote
    id: carter-baker
    description: >-
      The same report found "no evidence of extensive fraud" in US elections.
    quote:
      text: Absentee ballots remain the largest source of potential voter fraud.
      speaker: Commission on Federal Election Reform (Carter–Baker)
      date: '2005-09'
      source: 21
  - kind: claimCheck
    id: one-in-five
    claim: One in five mail-in voters admit they cheated
    claimant: { name: Heartland Institute and Rasmussen Reports }
    date: '2023-12'
    claimSource: 22
    status: not-supported
    finding: >-
      The survey asked an opt-in online panel about behaviour that is not
      always illegal, and measured no fraudulent ballots.
    sources: [22, 23]
    evidence: { fact: figure-examples, section: chart-detected-is-a-floor }
  - kind: caveatList
    id: detected-is-a-floor
    heading: Detected fraud is a floor, not a measure
    items:
      - measure: Household pressure
        why: Pressure inside a home is rarely reported, so it rarely becomes a case.
        sources: [24]
      - measure: Signature review
        why: In Cobb County's audit a spouse-signed envelope passed signature review.
        sources: [25]
      - measure: "Heritage's database"
        why: It is a sample of cases its compilers found, not a count of all cases.
        sources: [26]
  - kind: tileMap
    id: voter-id-rules
    title: ID asked of voters at the polls, by state, 2026
    description: >-
      The rule each state enforces when a voter arrives at the polls, from the
      strictest to none.
    map: us-states
    areaLabel: State
    categoryLabel: ID asked of voters at the polls
    sources: [27]
    categories:
      - { id: strict-photo, label: Strict photo ID, mark: SP }
      - { id: strict-non-photo, label: Strict non-photo ID, mark: SN }
      - { id: non-strict-photo, label: Non-strict photo ID, mark: P }
      - { id: non-strict-non-photo, label: Non-strict non-photo ID, mark: N }
      - { id: none, label: No document requested, mark: "—" }
    areas:
      AR: { category: strict-photo, note: A free voter ID card is issued on request }
      GA: strict-photo
      IN: strict-photo
      KS: strict-photo
      MS: strict-photo
      NH: strict-photo
      NC: strict-photo
      OH: strict-photo
      TN: strict-photo
      WI: strict-photo
      AZ: strict-non-photo
      IA: strict-non-photo
      ND: strict-non-photo
      WY: strict-non-photo
      AL: non-strict-photo
      FL: non-strict-photo
      ID: non-strict-photo
      KY: non-strict-photo
      LA: non-strict-photo
      MI: non-strict-photo
      MO: non-strict-photo
      MT: non-strict-photo
      NE: non-strict-photo
      RI: non-strict-photo
      SC: non-strict-photo
      SD: non-strict-photo
      TX: non-strict-photo
      WV: non-strict-photo
      AK: non-strict-non-photo
      CO: non-strict-non-photo
      CT: non-strict-non-photo
      DE: non-strict-non-photo
      OK: non-strict-non-photo
      UT: non-strict-non-photo
      VA: non-strict-non-photo
      WA: non-strict-non-photo
      CA: none
      DC: none
      HI: none
      IL: none
      MA: none
      MD: none
      ME: none
      MN: none
      NJ: none
      NM: none
      NV: none
      NY: none
      OR: none
      PA: { category: none, note: First-time voters show ID }
      VT: none
  - kind: geoMap
    id: postal-voting
    title: Who may vote by post from inside the country, 2025
    description: >-
      Countries where in-country postal voting is open to all voters or to
      some. The United States is outlined.
    regions: world
    areaLabel: Country
    categoryLabel: Who may vote by post in-country
    highlight: [US]
    insets:
      - { regionIds: [LU], label: Luxembourg }
    sources: [28]
    note: >-
      Fixture: only the thirteen countries the source names are assigned, so
      every other country reads "No data". Liechtenstein, too small for the
      world outlines, is drawn as a dot.
    categories:
      - { id: all, label: All voters, mark: A }
      - { id: some, label: Some voters, mark: S }
    areas:
      CA: all
      DE: all
      IS: all
      KR: all
      LI: all
      LU: all
      NZ: all
      PL: all
      CH: all
      GB: all
      US: all
      FR: some
      AU: { category: some, note: Voters who cannot attend a polling place }
  # One dataset drawn two ways (spec 4): `map` draws its preset's real shapes
  # and its tiles from one legend, with a Map / Tiles / Table switch;
  # `default` picks the view shown first. `tileMap` and `geoMap` above are
  # its older spellings, opening on tiles and on shapes.
  - kind: map
    id: asylum-per-head
    title: Asylum applicants per 10,000 residents, 2024
    description: >-
      Six of the EU+ countries and the UK by asylum applicants per head. The
      UK is outlined.
    preset: europe
    default: tiles
    areaLabel: Country
    valueLabel: Applicants per 10,000 residents
    format: { unit: number, decimals: 1 }
    breaks: [0, 5, 10, 20, 30, 50, 100]
    highlight: [GB]
    sources: [41]
    note: >-
      Fixture: only the six countries the source names are given, so every
      other country reads "No data".
    data:
      CY: 95.1
      GR: 70.8
      DE: 30.0
      LI: { value: 21, qualifier: about, asPublished: about 21 }
      GB: 16.0
      HU: { value: 0.1, qualifier: under, asPublished: under 0.1 }
  - kind: scatterPlot
    id: count-speed
    title: When mail processing may begin and how long the count took, 2024
    description: >-
      Each state's hours to count 95% of the vote against how many days
      before Election Day it lets officials start processing mail ballots.
    pointLabel: State
    x: { label: Days before Election Day processing may begin, format: { unit: number } }
    y: { label: Hours to count 95% of the vote, format: { unit: number } }
    groups:
      - { id: mostly-mail, label: Mostly mail }
      - { id: mostly-in-person, label: Mostly in person }
    highlight: [az]
    sources: [29, 30]
    note: >-
      Fixture: the processing-start days are illustrative until NCSL Table 16
      is read.
    points:
      - { id: az, label: AZ, name: Arizona, x: 14, y: 147, group: mostly-mail, yAsPublished: 147 hours, note: 73 hours in 2020. }
      - { id: nv, label: NV, name: Nevada, x: 15, y: 51, group: mostly-mail }
      - { id: pa, label: PA, name: Pennsylvania, x: 0, y: 8, group: mostly-in-person }
      - { id: ga, label: GA, name: Georgia, x: 21, y: 5, group: mostly-in-person }
      - { id: nc, label: NC, name: North Carolina, x: 35, y: 6, group: mostly-in-person }
  # Qualified numbers (spec 1.2): a bound, an approximation and a range, each
  # drawn with its own mark and read in the source's words in the table.
  - kind: barChart
    id: deaths-by-region
    title: Deaths by region, as the counter gives them, May 2026
    description: >-
      The counter gives some regions only as a bound, an approximation or a
      range; each bar shows which.
    valueLabel: Deaths
    categoryLabel: Region
    format: { unit: count }
    sources: [31]
    items:
      - { label: North, value: { value: 159, qualifier: at least, asPublished: at least 159 } }
      - { label: West, value: { value: 40, qualifier: fewer than, asPublished: fewer than 40 } }
      - { label: South, value: { value: 90, qualifier: about, asPublished: about 90 } }
      - { label: East, value: { low: 60, high: 80, asPublished: between 60 and 80 } }
      - { label: Capital, value: 120 }
  # Paired bars (spec 3): two measures per row, side by side and never
  # stacked; a value may be qualified like any bar's.
  - kind: barChart
    id: hours-to-count
    title: Hours to count 95% of the presidential vote, four states, 2020 and 2024
    description: Hours after polls closed until 95% of the vote had been reported, in each election.
    valueLabel: Hours
    categoryLabel: State
    format: { unit: count }
    sources: [36]
    series:
      - { key: y2020, label: '2020' }
      - { key: y2024, label: '2024' }
    items:
      - { label: Arizona, values: { y2020: 73, y2024: 147 }, detail: Two presidential elections }
      - { label: Nevada, values: { y2020: 159, y2024: 51 } }
      - { label: Pennsylvania, values: { y2020: 49, y2024: 8 } }
      - { label: Georgia, values: { y2020: { value: 18, qualifier: at least, asPublished: at least 18 hours }, y2024: { value: 5, qualifier: about, asPublished: about 5 } } }
  # A dumbbell (spec 3): two dots joined by a line, each end labelled with
  # its own year because the years differ by row.
  - kind: barChart
    id: pre-vra-registration
    title: Black voter registration before the Voting Rights Act, three states, 1954–1965
    description: The Attorney General's estimates at the earliest and latest year he gave for each state.
    valueLabel: Black voting-age residents registered, %
    categoryLabel: State
    format: { unit: percent, decimals: 1 }
    sources: [37]
    style: dumbbell
    series:
      - { key: earlier, label: Earliest estimate }
      - { key: latest, label: Latest estimate }
    items:
      - { label: Alabama, values: { earlier: 14.2, latest: 19.4 }, labels: { earlier: 1958, latest: 1964 } }
      - { label: Louisiana, values: { earlier: 31.7, latest: 31.8 }, labels: { earlier: 1956, latest: 1965 } }
      - { label: Mississippi, values: { earlier: 4.4, latest: 6.4 }, labels: { earlier: 1954, latest: 1964 } }
  # A slice explorer (spec 3): tidy rows the reader can break down, split
  # and filter. Separate roll calls are never added together
  # (`combinable: false`): the reader sees one vote at a time.
  - kind: sliceExplorer
    id: war-powers-votes
    title: Votes on resolutions to end the Iran war, by party, September 2026
    description: How each party voted on the last House and Senate war-powers resolutions.
    sources: [38]
    dimensions:
      - { key: vote, label: Roll call, plural: roll calls, combinable: false }
      - { key: party, label: Party, plural: parties, values: [Democratic, Independent, Republican] }
      - { key: position, label: Position, plural: positions, values: ['Yes', 'No'] }
    measures:
      - { key: members, label: Members voting, format: { unit: count } }
    defaultBreakdown: party
    defaultSplit: position
    rows:
      - { vote: 'House, 15 Sep 2026', party: Republican, position: 'Yes', members: 7 }
      - { vote: 'House, 15 Sep 2026', party: Republican, position: 'No', members: 203 }
      - { vote: 'House, 15 Sep 2026', party: Democratic, position: 'Yes', members: 213 }
      - { vote: 'House, 15 Sep 2026', party: Democratic, position: 'No', members: 0 }
      - { vote: 'Senate, 24 Sep 2026', party: Republican, position: 'Yes', members: 4 }
      - { vote: 'Senate, 24 Sep 2026', party: Republican, position: 'No', members: 49 }
      - { vote: 'Senate, 24 Sep 2026', party: Democratic, position: 'Yes', members: 43 }
      - { vote: 'Senate, 24 Sep 2026', party: Democratic, position: 'No', members: 1 }
      - { vote: 'Senate, 24 Sep 2026', party: Independent, position: 'Yes', members: 2 }
      - { vote: 'Senate, 24 Sep 2026', party: Independent, position: 'No', members: 0 }
  # Small multiples (spec 3): one small line per item on one shared scale,
  # each running across the whole published range; a panel with a shorter
  # range declares its own coverage and source.
  - kind: smallMultiples
    id: chokepoint-traffic
    title: Ships a day through five chokepoints, June–September 2026
    description: Monthly means of daily ship counts, all on one scale; Hormuz is highlighted.
    valueLabel: Ships a day, monthly average
    periodLabel: Month
    format: { unit: number, decimals: 0 }
    sources: [39]
    coverage: { from: '2026-06', to: '2026-09', note: Our monthly means of the daily counts. }
    panels:
      - name: Strait of Hormuz
        highlight: true
        points: [{ period: '2026-06', value: 31 }, { period: '2026-07', value: 22 }, { period: '2026-08', value: 9 }, { period: '2026-09', value: 4 }]
      - name: Bab el-Mandeb
        points: [{ period: '2026-06', value: 30 }, { period: '2026-07', value: 29 }, { period: '2026-08', value: 28 }, { period: '2026-09', value: 27 }]
      - name: Suez Canal
        points: [{ period: '2026-06', value: 40 }, { period: '2026-07', value: 41 }, { period: '2026-08', value: 43 }, { period: '2026-09', value: 42 }]
      - name: Malacca Strait
        points: [{ period: '2026-06', value: 228 }, { period: '2026-07', value: 231 }, { period: '2026-08', value: 225 }, { period: '2026-09', value: 230 }]
      - name: Kerch Strait
        coverage: { from: '2026-07', to: '2026-09', note: The counter began in July 2026. }
        source: 40
        points: [{ period: '2026-07', value: 12 }, { period: '2026-08', value: 3 }, { period: '2026-09', value: 0 }]
  # Parts that must add up (spec 1.4): percentages sum to 100 within rounding
  # (here 99.9, inside three parts' ±0.15), and print as published.
  - kind: compositionBar
    id: deaths-split
    title: Deaths by status, as the counter splits them, May 2026
    description: The counter's own percentages, which it rounds to one decimal place.
    rowLabel: Counter
    unit: percent
    sources: [31]
    categories:
      - { key: civilian, label: Civilian }
      - { key: combatant, label: Combatant }
      - { key: unidentified, label: Unidentified }
    rows:
      - { label: Fixture Casualty Counter, values: { civilian: 62.5, combatant: 30.1, unidentified: 7.3 } }
  # A date column (spec 1.3): "2026", "May 2026", "12 May 2026", sorted by date,
  # a coarser date before the finer dates inside it. Its cells may be qualified.
  - kind: dataTable
    id: count-releases
    title: The counter's releases by region, 2026
    description: When the counter last published each region's figure, and the figure as it gave it.
    caption: One row per region
    sources: [31]
    columns:
      - { key: region, label: Region, rowHeader: true }
      - { key: published, label: Last published, format: date }
      - { key: deaths, label: Deaths, format: { unit: count } }
    defaultSort: { key: published, direction: ascending }
    rows:
      - { region: North, published: '2026-05-12', deaths: { value: 159, qualifier: at least, asPublished: at least 159 } }
      - { region: East, published: '2026-05', deaths: { low: 60, high: 80, asPublished: between 60 and 80 } }
      - { region: Capital, published: '2026', deaths: 120 }
  - kind: section
    id: audit-method
  - kind: section
    id: remainder
---

## Provisions of the Freedom to Vote Act {#figure-examples--freedom-to-vote-act-provisions}

This section is placed between the federal-laws table and the key figures by a
`section` entry, not left at the end of the body.

## Observations {#figure-examples--observations-federal-laws}

### The record is mostly older law {#figure-examples--older-law}

Of the rows shown, the only one in force is the 1965 Act.

## Subtleties {#figure-examples--subtleties-wa-by-race}

### Rates before controls {#figure-examples--before-controls}

These rates are before any control for age or county.

## What the rest of the body says {#figure-examples--remainder}

A body section sits where its `section` entry places it.

### How the audit sample was drawn {#figure-examples--audit-method}

This `###` section is placed by its own `section` entry, after the last
figure; the `##` section it sits in has an entry of its own and follows it.
