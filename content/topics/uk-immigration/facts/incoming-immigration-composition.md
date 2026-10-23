---
title: Incoming Immigrant Composition
claimSources: [1]
claim: >-
  In 2025, non-EU+ nationals accounted for 77% of UK long-term immigration;
  study was the largest stated reason for their move, followed by work.
status: well-supported
sources:
  - stance: supports
    quote: >-
      During the year ending December 2025, non-EU+ nationals accounted for
      77% of total immigration (627,000); British nationals made up 14%
      (110,000) and EU+ nationals made up 9% (76,000). Study-related arrivals
      were 294,000, work-related arrivals 146,000, and people immigrating for
      asylum 88,000.
    title: 'Long-term international migration, provisional: year ending December 2025'
    url: https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025
    publisher: Office for National Statistics
    date: '2026-05-21'
  - stance: complicates
    quote: >-
      The statistics presented here relate to people detected on, or shortly
      after, arrival through illegal methods of entry. They do not include all
      those who enter through illegal routes, nor the number currently present
      in the UK without permission; it is not possible to know the exact
      number in either group.
    title: 'How many people come to the UK via illegal entry routes?'
    url: https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/how-many-people-come-to-the-uk-via-illegal-entry-routes
    publisher: Home Office
    date: '2026-05-21'
  - stance: supports
    quote: >-
      Table 3e gives long-term immigration among the ten highest-contributing
      non-EU+ nationalities by reason, and Table 4b gives long-term immigration
      of non-EU+ nationals by reason, for each year ending from June 2019 to
      December 2025.
    title: 'Long-term international migration, December 2025: Tables 3e and 4b'
    url: https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/internationalmigration/datasets/longterminternationalimmigrationemigrationandnetmigrationflowsprovisional/yearendingdecember2025/may2026publicationspreadsheet.xlsx
    publisher: Office for National Statistics
    date: '2026-05-21'
  - stance: supports
    quote: >-
      Occ_D02 provides grants of sponsored work entry clearance visas by
      occupation, industry and nationality, using the Standard Occupational
      Classification 2020 framework, from 2021 to 2026 Q2.
    title: 'Sponsored work entry clearance visas by occupation and industry (SOC 2020), year ending June 2026'
    url: https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables
    publisher: Home Office
    date: '2026-08-27'
additionalSeries:
  - id: origin-flows
    title: 'Long-term immigration by nationality group, UK, 2021–2025'
    description: >-
      Long-term arrivals by nationality group. The ONS workbook publishes only
      its ten highest-contributing non-EU+ nationalities, so a complete annual
      regional split is not available.
    periodLabel: 'Year ending December'
    coverage:
      from: '2021'
      to: '2025'
      note: >-
        EU+ is a nationality grouping, not country of birth. “Other non-EU+”
        is the non-EU+ total after subtracting the named nationalities and
        remains larger than any named line even after the ten published
        nationalities, so it must not be relabelled as a region.
    breaks: []
    source:
      stance: supports
      quote: >-
        Table 3e gives long-term immigration among the ten highest-contributing
        non-EU+ nationalities by reason, while Table 1 gives EU+ and non-EU+
        immigration totals.
      title: 'Long-term international migration, December 2025: Tables 1 and 3e'
      url: https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/internationalmigration/datasets/longterminternationalimmigrationemigrationandnetmigrationflowsprovisional/yearendingdecember2025/may2026publicationspreadsheet.xlsx
      publisher: Office for National Statistics
      date: '2026-05-21'
    readings:
      - id: origin-people
        label: 'All long-term immigration by nationality group'
        unit: count
        valueLabel: 'Long-term immigrants'
        lines:
          - name: EU+
            points: [{period: '2021', value: 173000}, {period: '2022', value: 141000}, {period: '2023', value: 103000}, {period: '2024', value: 91000}, {period: '2025', value: 76000}]
          - name: British
            points: [{period: '2021', value: 164000}, {period: '2022', value: 166000}, {period: '2023', value: 150000}, {period: '2024', value: 140000}, {period: '2025', value: 110000}]
          - name: Other non-EU+
            points: [{period: '2021', value: 373000}, {period: '2022', value: 500000}, {period: '2023', value: 569000}, {period: '2024', value: 457000}, {period: '2025', value: 368000}]
          - name: Indian
            points: [{period: '2021', value: 150000}, {period: '2022', value: 274000}, {period: '2023', value: 300000}, {period: '2024', value: 164000}, {period: '2025', value: 139000}]
          - name: Pakistani
            points: [{period: '2021', value: 34000}, {period: '2022', value: 53000}, {period: '2023', value: 100000}, {period: '2024', value: 81000}, {period: '2025', value: 56000}]
          - name: Nigerian
            points: [{period: '2021', value: 48000}, {period: '2022', value: 129000}, {period: '2023', value: 180000}, {period: '2024', value: 57000}, {period: '2025', value: 47000}]
          - name: Ukrainian
            points: [{period: '2021', value: 5000}, {period: '2022', value: 135000}, {period: '2023', value: 39000}, {period: '2024', value: 21000}, {period: '2025', value: 17000}]
  - id: entry-reasons-over-time
    title: 'Stated reasons for non-EU+ long-term immigration, UK, 2019–2025'
    description: 'Annual long-term immigration by original stated reason, including main applicants and dependants where the series does.'
    periodLabel: 'Year ending December'
    coverage: {from: '2019', to: '2025', note: 'All complete December years in ONS Table 4b are shown. The series is for non-EU+ nationals only.'}
    breaks: []
    source:
      stance: supports
      quote: 'Table 4b gives long-term international immigration of non-EU+ nationals by reason, using the new approach to producing migration estimates.'
      title: 'Long-term international migration, December 2025: Table 4b'
      url: https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/internationalmigration/datasets/longterminternationalimmigrationemigrationandnetmigrationflowsprovisional/yearendingdecember2025/may2026publicationspreadsheet.xlsx
      publisher: Office for National Statistics
      date: '2026-05-21'
    readings:
      - id: reason-people
        label: 'Reason for moving'
        unit: count
        valueLabel: 'Long-term immigrants'
        note: 'Asylum is a reason for long-term immigration in this series, not a route of entry. Illegal-entry detections are not a compatible slice.'
        lines:
          - name: Study
            points: [{period: '2019', value: 120000}, {period: '2020', value: 112000}, {period: '2021', value: 259000}, {period: '2022', value: 430000}, {period: '2023', value: 461000}, {period: '2024', value: 274000}, {period: '2025', value: 294000}]
          - name: Work
            points: [{period: '2019', value: 99000}, {period: '2020', value: 71000}, {period: '2021', value: 145000}, {period: '2022', value: 291000}, {period: '2023', value: 471000}, {period: '2024', value: 272000}, {period: '2025', value: 146000}]
          - name: Family
            points: [{period: '2019', value: 78000}, {period: '2020', value: 56000}, {period: '2021', value: 68000}, {period: '2022', value: 67000}, {period: '2023', value: 89000}, {period: '2024', value: 84000}, {period: '2025', value: 47000}]
          - name: Humanitarian
            points: [{period: '2019', value: 6000}, {period: '2020', value: 1000}, {period: '2021', value: 57000}, {period: '2022', value: 190000}, {period: '2023', value: 75000}, {period: '2024', value: 49000}, {period: '2025', value: 35000}]
          - name: Asylum
            points: [{period: '2019', value: 42000}, {period: '2020', value: 35000}, {period: '2021', value: 55000}, {period: '2022', value: 85000}, {period: '2023', value: 75000}, {period: '2024', value: 87000}, {period: '2025', value: 88000}]
  - id: sponsored-work-industry
    title: 'Sponsored work entry-clearance grants by industry, UK, 2021–2025'
    description: >-
      Industry of sponsored work visa grants. This is an administrative entry
      clearance measure, not the ONS long-term immigration estimate and not a
      count of all foreign-born people currently in work.
    periodLabel: 'Calendar year'
    coverage: {from: '2021', to: '2025', note: 'All four quarters of each calendar year are summed from Home Office Occ_D02.'}
    breaks: []
    source:
      stance: supports
      quote: >-
        Occ_D02 provides grants of sponsored work entry clearance visas by
        occupation, industry and nationality, using SOC 2020, from 2021 to
        2026 Q2.
      title: 'Sponsored work entry clearance visas by occupation and industry (SOC 2020), year ending June 2026'
      url: https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables
      publisher: Home Office
      date: '2026-08-27'
    readings:
      - id: industry-grants
        label: 'Industry of sponsored work'
        unit: count
        valueLabel: 'Sponsored work entry-clearance grants'
        note: >-
          The named industries are the largest source-defined groups in 2025;
          “Other industries” combines every smaller SIC section. The residual
          is smaller than Agriculture, Forestry and Fishing, the largest named
          industry in 2025. Health and Social Work Activities includes both
          healthcare and social-care employers; it is not a count of care
          occupations alone.
        lines:
          - name: Agriculture, Forestry and Fishing
            points: [{period: '2021', value: 20680}, {period: '2022', value: 26171}, {period: '2023', value: 24840}, {period: '2024', value: 27240}, {period: '2025', value: 31660}]
          - name: Health and Social Work Activities
            points: [{period: '2021', value: 32499}, {period: '2022', value: 76486}, {period: '2023', value: 142851}, {period: '2024', value: 28038}, {period: '2025', value: 14173}]
          - name: Administrative and Support Service Activities
            points: [{period: '2021', value: 11258}, {period: '2022', value: 11632}, {period: '2023', value: 11130}, {period: '2024', value: 10967}, {period: '2025', value: 10185}]
          - name: Professional, Scientific and Technical Activities
            points: [{period: '2021', value: 11767}, {period: '2022', value: 20466}, {period: '2023', value: 16066}, {period: '2024', value: 11241}, {period: '2025', value: 9948}]
          - name: Information and Communications
            points: [{period: '2021', value: 14247}, {period: '2022', value: 22852}, {period: '2023', value: 14878}, {period: '2024', value: 11467}, {period: '2025', value: 8783}]
          - name: Arts, Entertainment and Recreation
            points: [{period: '2021', value: 6166}, {period: '2022', value: 10296}, {period: '2023', value: 9346}, {period: '2024', value: 8995}, {period: '2025', value: 8463}]
          - name: Financial and Insurance Activities
            points: [{period: '2021', value: 7201}, {period: '2022', value: 12630}, {period: '2023', value: 9646}, {period: '2024', value: 8428}, {period: '2025', value: 8157}]
          - name: Other industries
            points: [{period: '2021', value: 19488}, {period: '2022', value: 37289}, {period: '2023', value: 50744}, {period: '2024', value: 47861}, {period: '2025', value: 24478}]
relatedFacts:
  - how-people-actually-arrive
  - immigration-against-the-long-run
dataStillNeeded:
  - measure: 'A complete annual nationality or source-defined regional distribution of long-term immigration'
    why: >-
      The ONS workbook publishes only the ten highest-contributing non-EU+
      nationalities, insufficient to calculate Africa, Middle East or East Asia
      totals or to reduce the residual below the largest named group.
  - measure: 'Religion of annual immigrants and asylum applicants'
    why: 'Religion is not recorded in the migration-flow datasets.'
---
## Observations {#incoming-immigration-composition--observations}

### Incoming immigration is an annual flow {#incoming-immigration-composition--flow}

ONS estimated 813,000 long-term immigrants in the year ending December 2025.
Non-EU+ nationals made up 627,000, EU+ nationals 76,000 and British nationals
110,000. These are flows over a year, not the resident foreign-born population.
[1](#source-incoming-immigration-composition-1)

### Study and work are larger recorded reasons than asylum {#incoming-immigration-composition--entry-reasons}

Among non-EU+ arrivals in 2025, study-related moves were 294,000, work-related
moves 146,000 and asylum-related moves 88,000. “Illegal entry” is a detection
measure, not a comparable reason-for-moving category. [1](#source-incoming-immigration-composition-1)
[2](#source-incoming-immigration-composition-2)

### The mix changed substantially after 2019 {#incoming-immigration-composition--trends}

Study and work both rose sharply in 2021–23; humanitarian arrivals peaked in
2022, while asylum-related immigration rose more steadily. The published
nationality lines show part, rather than all, of the non-EU+ distribution.
[3](#source-incoming-immigration-composition-3)

### Sponsored work is not concentrated only in health and care {#incoming-immigration-composition--work-industry}

The industry series separately shows Health and Social Work Activities and
seasonal agriculture, alongside the other large sponsor industries. It measures
sponsored work entry clearance, not every long-term worker arriving in the UK.
[4](#source-incoming-immigration-composition-4)
