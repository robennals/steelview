import type { Series } from '@/lib/content/types';
import type { StripEvent } from '../../event-strip';
import type { PeriodCategory, PeriodRow } from '../../period-timeline';
import type { TimelineCategory, TimelineEvent } from '../../timeline';
import type { SourceCredit } from '../../types';

/**
 * UK immigration policy milestones. Every dated event cites the source in
 * Steelview's content that carries the date; the asylum-policy events the
 * content does not yet carry (the Rwanda scheme, the Illegal Migration Act)
 * are marked "Illustrative data" one by one rather than passed off as sourced.
 */

const HOME_OFFICE_WHITE_PAPER: SourceCredit = {
  label: 'Home Office, Restoring control over the immigration system (2025)',
  href: 'https://www.gov.uk/government/publications/restoring-control-over-the-immigration-system-white-paper/restoring-control-over-the-immigration-system-accessible',
};
const HOME_OFFICE_TECHNICAL_ANNEX: SourceCredit = {
  label: 'Home Office, white paper technical annex',
  href: 'https://www.gov.uk/government/publications/restoring-control-over-the-immigration-system-white-paper/restoring-control-over-the-immigration-system-technical-annex',
};
const MAC_SALARY_REVIEW: SourceCredit = {
  label: 'Migration Advisory Committee',
  href: 'https://www.gov.uk/government/publications/review-of-salary-requirements/review-of-salary-requirements-accessible',
};
const MIGRATION_OBSERVATORY_NET: SourceCredit = {
  label: 'The Migration Observatory',
  href: 'https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/',
};
const HOME_OFFICE_MIGRANT_JOURNEY: SourceCredit = {
  label: 'Home Office, Migrant journey: 2025 report',
  href: 'https://www.gov.uk/government/statistics/migrant-journey-2025-report/migrant-journey-2025-report',
};
const HOME_OFFICE_STUDY: SourceCredit = {
  label: 'Home Office',
  href: 'https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-december-2025/why-do-people-come-to-the-uk-study',
};
const HOME_OFFICE_SUMMARY: SourceCredit = {
  label: 'Home Office',
  href: 'https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/summary-of-latest-statistics',
};
const ONS_UKRAINE: SourceCredit = {
  label: 'ONS',
  href: 'https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/internationalmigration/datasets/longterminternationalimmigrationemigrationandnetmigrationflowsprovisional/yearendingdecember2025/may2026publicationspreadsheet.xlsx',
};
const ILLUSTRATIVE: SourceCredit = { label: 'Illustrative data' };

export const POLICY_CATEGORIES: TimelineCategory[] = [
  { id: 'work', label: 'Work visas' },
  { id: 'study', label: 'Study' },
  { id: 'eu', label: 'EU and free movement' },
  { id: 'humanitarian', label: 'Humanitarian routes' },
  { id: 'asylum', label: 'Asylum' },
];

export const POLICY_MILESTONES: TimelineEvent[] = [
  {
    date: '2020',
    endDate: '2025-07-22',
    title: 'Work-visa skill bar lowered to A-level equivalent',
    description: 'Introduced with the post-Brexit system: the skills threshold fell from degree level (RQF 6) to A-level equivalent (RQF 3), until it was raised back on 22 July 2025.',
    category: 'work',
    significance: 'major',
    source: HOME_OFFICE_WHITE_PAPER,
  },
  {
    date: '2020-08',
    title: 'Health and Care Worker visa introduced',
    category: 'work',
    significance: 'minor',
    source: HOME_OFFICE_WHITE_PAPER,
  },
  {
    date: '2021-01',
    title: 'Free movement ends for EU citizens',
    description: 'EU net migration had already begun to fall after the 2016 referendum.',
    category: 'eu',
    significance: 'major',
    source: MIGRATION_OBSERVATORY_NET,
  },
  {
    date: '2021',
    title: 'Graduate route introduced',
    description: 'Lets international graduates stay to work after their course.',
    category: 'study',
    significance: 'minor',
    source: HOME_OFFICE_MIGRANT_JOURNEY,
  },
  {
    date: '2022-02',
    title: 'Care workers made eligible for skilled work visas',
    description: 'The Health and Care Worker route was expanded to the social care workforce, most of whose roles are below degree level.',
    category: 'work',
    significance: 'major',
    source: HOME_OFFICE_WHITE_PAPER,
  },
  {
    date: '2022',
    title: 'Ukraine humanitarian routes open',
    description: 'After Russia’s full-scale invasion. ONS estimates 135,000 Ukrainian arrivals in 2022.',
    category: 'humanitarian',
    significance: 'major',
    source: ONS_UKRAINE,
  },
  {
    date: '2022-04',
    title: 'Rwanda asylum partnership announced',
    description: 'Date not yet carried in Steelview’s content.',
    category: 'asylum',
    significance: 'major',
    source: ILLUSTRATIVE,
  },
  {
    date: '2023-06',
    title: 'Asylum backlog peaks at 175,000 people',
    description: 'People awaiting an initial decision; 49,000 by the end of March 2026.',
    category: 'asylum',
    significance: 'minor',
    source: HOME_OFFICE_SUMMARY,
  },
  {
    date: '2023-07',
    title: 'Illegal Migration Act passed',
    description: 'Date not yet carried in Steelview’s content.',
    category: 'asylum',
    significance: 'major',
    source: ILLUSTRATIVE,
  },
  {
    date: '2024-01',
    title: 'Most students barred from bringing dependants',
    description: 'For courses starting from January 2024. Dependants per student fell from 0.31 in 2023 to 0.05 in 2025.',
    category: 'study',
    significance: 'major',
    source: HOME_OFFICE_STUDY,
  },
  {
    date: '2024',
    title: 'Spring 2024 work-visa rule changes',
    description: 'From May 2024 to January 2025, 48% of skilled-worker entry clearance visas were still for occupations below degree level.',
    category: 'work',
    significance: 'minor',
    source: HOME_OFFICE_TECHNICAL_ANNEX,
  },
  {
    date: '2024-07',
    title: 'Rwanda scheme abandoned',
    description: 'Date not yet carried in Steelview’s content.',
    category: 'asylum',
    significance: 'major',
    source: ILLUSTRATIVE,
  },
  {
    date: '2025-05-12',
    title: 'Immigration white paper published',
    category: 'work',
    significance: 'minor',
    source: HOME_OFFICE_WHITE_PAPER,
  },
  {
    date: '2025-07-22',
    title: 'Skill bar raised back to degree level',
    description: 'Ends the 2020 relaxation to RQF 3, citing visa growth and exploitation of overseas recruits.',
    category: 'work',
    significance: 'major',
    source: MAC_SALARY_REVIEW,
  },
];

export const POLICY_SOURCES: SourceCredit[] = [
  HOME_OFFICE_WHITE_PAPER,
  MAC_SALARY_REVIEW,
  MIGRATION_OBSERVATORY_NET,
  { label: 'Home Office immigration statistics', href: HOME_OFFICE_SUMMARY.href },
];

export const ROUTE_CATEGORIES: PeriodCategory[] = [
  { id: 'work', label: 'Work' },
  { id: 'study', label: 'Study' },
  { id: 'eu', label: 'EU' },
];

/**
 * Which rules were in force when. Dates are the sourced ones above; the
 * pre-2020 starts are the axis edge, not a claim about when those rules began.
 */
export const ROUTE_PERIODS: PeriodRow[] = [
  {
    label: 'EU citizens',
    periods: [
      { from: '2016', to: '2021-01', label: 'Free movement', category: 'eu' },
      { from: '2021-01', label: 'Visa needed', category: 'eu' },
    ],
  },
  {
    label: 'Skilled work: skill bar',
    periods: [
      { from: '2016', to: '2020', label: 'Degree (RQF 6)', category: 'work' },
      { from: '2020', to: '2025-07-22', label: 'A-level equivalent (RQF 3)', category: 'work' },
      { from: '2025-07-22', label: 'Degree (RQF 6)', category: 'work' },
    ],
  },
  {
    label: 'Care workers on skilled visas',
    periods: [{ from: '2022-02', to: '2025-07-22', label: 'Eligible', category: 'work' }],
  },
  {
    label: 'Graduate route',
    periods: [{ from: '2021', label: 'Open', category: 'study' }],
  },
  {
    label: 'Student dependants',
    periods: [
      { from: '2016', to: '2024-01', label: 'Allowed', category: 'study' },
      { from: '2024-01', label: 'Mostly barred', category: 'study' },
    ],
  },
];

export const ROUTE_EVENTS: StripEvent[] = [
  { date: '2022', label: 'Ukraine humanitarian routes open', source: ONS_UKRAINE },
  { date: '2023-06', label: 'Asylum backlog peaks at 175,000 people', source: HOME_OFFICE_SUMMARY },
];

/** ILLUSTRATIVE: dates the content does not yet carry, to show a sparse chart with short spans. */
export const GOVERNMENT_PERIODS_ILLUSTRATIVE: PeriodRow[] = [
  {
    label: 'Party in government',
    periods: [
      { from: '2010-05', to: '2024-07', label: 'Conservative-led' },
      { from: '2024-07', label: 'Labour' },
    ],
  },
  { label: 'Rwanda partnership', periods: [{ from: '2022-04', to: '2024-07', label: 'In force' }] },
  { label: 'Illegal Migration Act', periods: [{ from: '2023-07', to: '2024-07', label: 'Duty to remove' }] },
];

/** Asylum-policy events for the EventStrip demo; mixed sourced and illustrative, each one labelled. */
export const ASYLUM_EVENTS: StripEvent[] = [
  { date: '2002', label: 'Previous peak: 103,081 claims', source: { label: 'Home Office', href: 'https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/how-many-people-claim-asylum-in-the-uk' } },
  { date: '2022-04', label: 'Rwanda asylum partnership announced', source: ILLUSTRATIVE },
  { date: '2023-06', label: 'Asylum backlog peaks at 175,000 people', source: HOME_OFFICE_SUMMARY },
  { date: '2023-07', label: 'Illegal Migration Act passed', source: ILLUSTRATIVE },
  { date: '2024-07', label: 'Rwanda scheme abandoned', source: ILLUSTRATIVE },
];

const ASYLUM_CLAIMS: Array<[string, number]> = [
  ['2001', 71027], ['2002', 103081], ['2003', 60047], ['2004', 40623], ['2005', 30841], ['2006', 28328],
  ['2007', 28300], ['2008', 31314], ['2009', 30673], ['2010', 22644], ['2011', 25898], ['2012', 27978],
  ['2013', 29875], ['2014', 32344], ['2015', 39968], ['2016', 39357], ['2017', 34435], ['2018', 38483],
  ['2019', 45537], ['2020', 37603], ['2021', 57942], ['2022', 95007], ['2023', 87427], ['2024', 104764],
  ['2025', 100625],
];

/** Real: people claiming asylum, from the `asylum-claims-in-historical-and-european-context` fact. */
export const ASYLUM_CLAIMS_SERIES: Series = {
  title: 'People claiming asylum in the UK, 2001-2025',
  description: 'Every person recorded as claiming asylum in the UK in each calendar year, main applicants and dependants together.',
  periodLabel: 'Year',
  coverage: { from: '2001', to: '2025' },
  breaks: [],
  events: [],
  source: {
    stance: 'supports',
    quote: 'Asy_D01: Asylum claims, 2001 Q1 to 2026 Q1 - dataset',
    title: 'Asylum claims and initial decisions detailed datasets, year ending March 2026',
    url: 'https://assets.publishing.service.gov.uk/media/6a05df9d97000cb6073e4e25/asylum-claims-datasets-mar-2026.xlsx',
    publisher: 'Home Office',
    date: '2026-05-21',
  },
  readings: [
    {
      id: 'people',
      label: 'People claiming asylum',
      unit: 'count',
      valueLabel: 'People recorded as claiming asylum that year',
      lines: [{ name: 'All claimants', points: ASYLUM_CLAIMS.map(([period, value]) => ({ period, value })) }],
    },
  ],
};
