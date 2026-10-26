/**
 * Real figures for the Data family's stories, copied from
 * content/topics/uk-immigration/facts. Each block names the fact it came
 * from; anything derived (a residual, a total) says how. The one invented
 * dataset is at the bottom and is labelled as such.
 */
import type { SourceCredit } from '../../types';

/* ------------------------------------------------- asylum-grant-rate-fell,
   asylum-backlog-and-hotel-use-have-fallen */

const HOME_OFFICE_SUMMARY_2026: SourceCredit = {
  label: 'Home Office',
  href: 'https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/summary-of-latest-statistics',
};

const HOME_OFFICE_ILLEGAL_ENTRY_2025: SourceCredit = {
  label: 'Home Office',
  href: 'https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-december-2025/how-many-people-come-to-the-uk-via-illegal-entry-routes',
};

export const asylumKeyFigures = {
  sources: [{ ...HOME_OFFICE_SUMMARY_2026, number: 1 }, { ...HOME_OFFICE_ILLEGAL_ENTRY_2025, number: 2 }],
  figures: [
    {
      value: 39,
      format: { unit: 'percent' as const, decimals: 0 },
      label: 'of asylum claims granted at initial decision',
      period: '2026-03',
      periodLabel: 'Year ending March 2026',
      change: { value: -10, format: { unit: 'number' as const, decimals: 0, signed: true }, comparison: 'percentage points on the previous year (49%)' },
      source: { ...HOME_OFFICE_SUMMARY_2026, number: 1 },
    },
    {
      value: 49000,
      label: 'people awaiting an initial asylum decision',
      period: '2026-03',
      periodLabel: 'End of March 2026',
      change: { value: -55, comparison: 'on end of March 2025' },
      source: { ...HOME_OFFICE_SUMMARY_2026, number: 1 },
    },
    {
      value: 21000,
      label: 'supported asylum seekers in hotels',
      period: '2026-03',
      periodLabel: 'End of March 2026',
      change: { value: -35, comparison: 'on a year earlier' },
      source: { ...HOME_OFFICE_SUMMARY_2026, number: 1 },
    },
    {
      value: 41472,
      label: 'small boat arrivals',
      period: '2025',
      periodLabel: 'Year ending December 2025',
      change: { value: 13, comparison: 'on year ending December 2024' },
      source: { ...HOME_OFFICE_ILLEGAL_ENTRY_2025, number: 2 },
    },
  ],
};

/* ---------------------------------------- work-visas-swung-to-low-skill-and-back */

export const workVisaKeyFigures = {
  sources: [
    { label: 'Home Office', href: 'https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/why-do-people-come-to-the-uk-work', number: 1 },
    { label: 'Migration Advisory Committee', href: 'https://www.gov.uk/government/publications/migration-advisory-committee-annual-report-2024/migration-advisory-committee-mac-annual-report-2024-accessible', number: 2 },
  ],
  figures: [
    {
      value: 252775,
      label: 'work visas issued, including dependants',
      period: '2026-03',
      periodLabel: 'Year ending March 2026',
      change: { value: -17, comparison: 'on year ending March 2025' },
      source: { label: 'Home Office', number: 1 },
    },
    {
      value: 613627,
      label: 'work visas at the peak, including dependants',
      period: '2023',
      periodLabel: 'Year ending December 2023',
      source: { label: 'Home Office', number: 1 },
    },
    {
      value: 74000,
      label: 'visas a year for graduate-level (RQF 6+) jobs, roughly flat',
      period: '2023',
      periodLabel: 'Yearly average, 2021–2023',
      source: { label: 'Migration Advisory Committee', number: 2 },
    },
  ],
};

/* ---------------------------------- asylum-claims-in-historical-and-european-context */

export const asylumEuropeSource: SourceCredit = {
  label: 'The Migration Observatory, University of Oxford',
  href: 'https://migrationobservatory.ox.ac.uk/resources/briefings/migration-to-the-uk-asylum/',
};

/** 2024, applicants including dependants. `eu` is EU membership, added for the table story. */
export const asylumEurope = [
  { country: 'Germany', claims: 250550, perTenThousand: 30.02, eu: 'EU' },
  { country: 'Spain', claims: 166145, perTenThousand: 34.17, eu: 'EU' },
  { country: 'Italy', claims: 158605, perTenThousand: 26.9, eu: 'EU' },
  { country: 'France', claims: 157850, perTenThousand: 23.05, eu: 'EU' },
  { country: 'United Kingdom', claims: 108138, perTenThousand: 16.0, eu: 'Non-EU' },
  { country: 'Greece', claims: 73680, perTenThousand: 70.84, eu: 'EU' },
  { country: 'Belgium', claims: 39510, perTenThousand: 33.43, eu: 'EU' },
  { country: 'Netherlands', claims: 33435, perTenThousand: 18.63, eu: 'EU' },
  { country: 'Switzerland', claims: 27615, perTenThousand: 30.81, eu: 'Non-EU' },
  { country: 'Austria', claims: 24915, perTenThousand: 27.2, eu: 'EU' },
  { country: 'Ireland', claims: 18565, perTenThousand: 34.69, eu: 'EU' },
  { country: 'Poland', claims: 16775, perTenThousand: 4.58, eu: 'EU' },
  { country: 'Bulgaria', claims: 12260, perTenThousand: 19.02, eu: 'EU' },
  { country: 'Sweden', claims: 11110, perTenThousand: 10.53, eu: 'EU' },
  { country: 'Cyprus', claims: 9185, perTenThousand: 95.05, eu: 'EU' },
  { country: 'Slovenia', claims: 5635, perTenThousand: 26.53, eu: 'EU' },
  { country: 'Norway', claims: 4940, perTenThousand: 8.9, eu: 'Non-EU' },
  { country: 'Finland', claims: 2915, perTenThousand: 5.2, eu: 'EU' },
  { country: 'Portugal', claims: 2655, perTenThousand: 2.5, eu: 'EU' },
  { country: 'Romania', claims: 2400, perTenThousand: 1.26, eu: 'EU' },
  { country: 'Denmark', claims: 2280, perTenThousand: 3.82, eu: 'EU' },
  { country: 'Luxembourg', claims: 2205, perTenThousand: 32.81, eu: 'EU' },
  { country: 'Iceland', claims: 1925, perTenThousand: 50.19, eu: 'Non-EU' },
  { country: 'Czechia', claims: 1355, perTenThousand: 1.24, eu: 'EU' },
  { country: 'Estonia', claims: 1355, perTenThousand: 9.86, eu: 'EU' },
  { country: 'Croatia', claims: 1115, perTenThousand: 2.89, eu: 'EU' },
  { country: 'Latvia', claims: 1040, perTenThousand: 5.56, eu: 'EU' },
  { country: 'Malta', claims: 725, perTenThousand: 12.87, eu: 'EU' },
  { country: 'Lithuania', claims: 360, perTenThousand: 1.25, eu: 'EU' },
  { country: 'Slovakia', claims: 150, perTenThousand: 0.28, eu: 'EU' },
  { country: 'Liechtenstein', claims: 85, perTenThousand: 21.24, eu: 'Non-EU' },
  { country: 'Hungary', claims: 30, perTenThousand: 0.03, eu: 'EU' },
];

/* ------------------------------------------------- how-people-actually-arrive */

export const oecdSource: SourceCredit = { label: 'OECD', href: 'https://www.oecd.org/en/publications/international-migration-outlook-2025_ae26c893-en/full-report/recent-developments-in-international-migration-movements-and-labour-market-inclusion-of-immigrants_203de29e.html' };

export const irregularEntryTrends = [
  { label: 'United Kingdom', value: 19, highlight: true },
  { label: 'EU external borders', value: -37 },
  { label: 'United States', value: -48 },
];

/* ---------------------------------------------- care-worker-route-fiscally-negative */

export const careFiscal = {
  source: { label: 'Migration Advisory Committee', href: 'https://assets.publishing.service.gov.uk/media/6938108633c7ace9c4a41e42/The_Fiscal_Impact_of_Immigration_Final__1_.pdf' },
  items: [
    { label: 'Care workers', value: -36000 },
    { label: 'Other health and care occupations', value: 166000 },
  ],
};

/* ---------------------------------------------- incoming-immigration-composition */

export const onsLtimSource: SourceCredit = {
  label: 'ONS',
  href: 'https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025',
};

export const homeOfficeOccSource: SourceCredit = {
  label: 'Home Office',
  href: 'https://www.gov.uk/government/statistical-data-sets/immigration-system-statistics-data-tables',
};

const YEARS_2019 = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];

/** Non-EU+ long-term immigration by stated reason (ONS Table 4b), year ending December. */
const reasonSeries: Record<string, number[]> = {
  Study: [120000, 112000, 259000, 430000, 461000, 274000, 294000],
  Work: [99000, 71000, 145000, 291000, 471000, 272000, 146000],
  Family: [78000, 56000, 68000, 67000, 89000, 84000, 47000],
  Humanitarian: [6000, 1000, 57000, 190000, 75000, 49000, 35000],
  Asylum: [42000, 35000, 55000, 85000, 75000, 87000, 88000],
};

export const reasonRows = Object.entries(reasonSeries).flatMap(([reason, values]) =>
  values.map((people, i) => ({ reason, year: YEARS_2019[i], people })),
);

const YEARS_2021 = ['2021', '2022', '2023', '2024', '2025'];

/** Sponsored work entry-clearance grants by industry (Home Office Occ_D02), calendar year. */
const industrySeries: Record<string, number[]> = {
  'Agriculture, forestry and fishing': [20680, 26171, 24840, 27240, 31660],
  'Health and social work': [32499, 76486, 142851, 28038, 14173],
  'Administrative and support services': [11258, 11632, 11130, 10967, 10185],
  'Professional, scientific and technical': [11767, 20466, 16066, 11241, 9948],
  'Information and communications': [14247, 22852, 14878, 11467, 8783],
  'Arts, entertainment and recreation': [6166, 10296, 9346, 8995, 8463],
  'Financial and insurance': [7201, 12630, 9646, 8428, 8157],
  'Other industries': [19488, 37289, 50744, 47861, 24478],
};

export const industryRows = Object.entries(industrySeries).flatMap(([industry, values]) =>
  values.map((grants, i) => ({ industry, year: YEARS_2021[i], grants })),
);

/** Long-term immigration by nationality group (ONS Tables 1 and 3e), year ending December. */
export const nationalityPanels = [
  { name: 'Indian', values: [150000, 274000, 300000, 164000, 139000] },
  { name: 'Nigerian', values: [48000, 129000, 180000, 57000, 47000] },
  { name: 'Pakistani', values: [34000, 53000, 100000, 81000, 56000] },
  { name: 'Ukrainian', values: [5000, 135000, 39000, 21000, 17000] },
  { name: 'Other non-EU+', values: [373000, 500000, 569000, 457000, 368000] },
  { name: 'EU+', values: [173000, 141000, 103000, 91000, 76000] },
  { name: 'British', values: [164000, 166000, 150000, 140000, 110000] },
].map(panel => ({ name: panel.name, points: panel.values.map((value, i) => ({ period: YEARS_2021[i], value })) }));

/**
 * The same series as three groups. Non-EU+ is the sum of the four named
 * nationalities and "Other non-EU+", which by the source's construction is
 * the non-EU+ total (2025: 627,000, as published).
 */
export const nationalityGroupRows = YEARS_2021.map((year, i) => {
  const value = (name: string) => nationalityPanels.find(p => p.name === name)!.points[i].value;
  return {
    label: year,
    values: {
      british: value('British'),
      eu: value('EU+'),
      nonEu: ['Indian', 'Nigerian', 'Pakistani', 'Ukrainian', 'Other non-EU+'].reduce((sum, name) => sum + value(name), 0),
    },
  };
});

/* ------------------------------------------- religious-composition-at-the-2021-census */

export const religionSource: SourceCredit = {
  label: 'ONS',
  href: 'https://www.ons.gov.uk/peoplepopulationandcommunity/culturalidentity/religion/bulletins/religionenglandandwales/census2021',
};

export const religionCategories = [
  { key: 'christian', label: 'Christian' },
  { key: 'none', label: 'No religion' },
  { key: 'muslim', label: 'Muslim' },
  { key: 'hindu', label: 'Hindu' },
  { key: 'other', label: 'Other responses' },
];

export const religionRows = [
  { label: '2001', values: { christian: 71.7, none: 14.8, muslim: 3.0, hindu: 1.1, other: 9.4 } },
  { label: '2011', values: { christian: 59.3, none: 25.1, muslim: 4.8, hindu: 1.5, other: 9.3 } },
  { label: '2021', values: { christian: 46.2, none: 37.2, muslim: 6.5, hindu: 1.7, other: 8.4 } },
];

/* -------------------------------------------- ethnic-composition-at-the-2021-census */

export const ethnicitySource: SourceCredit = {
  label: 'ONS',
  href: 'https://www.ons.gov.uk/peoplepopulationandcommunity/culturalidentity/ethnicity/bulletins/ethnicgroupenglandandwales/census2021',
};

/**
 * Published: White British, Other White, Asian, and the White total.
 * Derived: "White: Irish, Gypsy, Traveller, Roma" = White total − White
 * British − Other White; "Black, Mixed and other" = 100 − White − Asian.
 */
export const ethnicityCategories = [
  { key: 'whiteBritish', label: 'White British' },
  { key: 'otherWhite', label: 'Other White' },
  { key: 'whiteIrishGypsyRoma', label: 'White: Irish, Gypsy, Traveller, Roma' },
  { key: 'asian', label: 'Asian' },
  { key: 'blackMixedOther', label: 'Black, Mixed and other' },
];

export const ethnicityRows = [
  { label: '2011', values: { whiteBritish: 80.5, otherWhite: 4.4, whiteIrishGypsyRoma: 1.1, asian: 7.5, blackMixedOther: 6.5 } },
  { label: '2021', values: { whiteBritish: 74.4, otherWhite: 6.2, whiteIrishGypsyRoma: 1.1, asian: 9.3, blackMixedOther: 9.0 } },
];

/* ----------------------------------------------------------- Illustrative */

/**
 * ILLUSTRATIVE DATA — invented to show the forest plot. The shape (small,
 * mostly negative effects on the lowest-paid, intervals that often cross
 * zero) echoes the MAC's 2018 summary in wage-effects-small-and-uneven, but
 * none of these studies or numbers is real.
 */
export const illustrativeWageEstimates = [
  { label: 'Study A', year: 2008, estimate: -0.5, low: -0.9, high: -0.1, group: 'Lowest-paid workers' },
  { label: 'Study B', year: 2013, estimate: -0.2, low: -0.6, high: 0.2, group: 'Lowest-paid workers' },
  { label: 'Study C', year: 2015, estimate: -0.15, low: -0.3, high: 0.0, group: 'Lowest-paid workers', note: 'Semi-skilled services only' },
  { label: 'Study D', year: 2018, estimate: -0.1, low: -0.45, high: 0.25, group: 'Lowest-paid workers' },
  { label: 'Study A', year: 2008, estimate: 0.3, low: 0.0, high: 0.6, group: 'Highest-paid workers' },
  { label: 'Study B', year: 2013, estimate: 0.1, low: -0.2, high: 0.4, group: 'Highest-paid workers' },
  { label: 'Study D', year: 2018, estimate: 0.2, low: -0.05, high: 0.45, group: 'Highest-paid workers' },
];
