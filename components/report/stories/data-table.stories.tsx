import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DataTable } from '../data-table';
import { asylumEurope, asylumEuropeSource } from './fixtures/data';

const meta = {
  title: 'Data/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use when the table is the figure: many rows or columns a reader will look up rather than see as a shape. Headers sort (announced with aria-sort) and numbers use the same formats as the charts. Up to fifteen rows show in full; a longer table shows its first ten, fading, above a "Show all N rows" button (with JavaScript off, every row). A table wider than its column scrolls sideways with a shadow on the side that has more, and one of more than three columns runs past the text column on a wide screen (`width: \'wide\'`, the default there).',
      },
    },
  },
  args: {
    title: 'Asylum claims across Europe, 2024',
    description: 'All EU+ countries and the UK. Sort by any column; the UK is highlighted.',
    caption: 'One row per country. Applicants including dependants.',
    columns: [
      { key: 'country', label: 'Country', rowHeader: true },
      { key: 'eu', label: 'EU member', format: 'text' },
      { key: 'claims', label: 'People claiming asylum', format: { unit: 'count' } },
      { key: 'perTenThousand', label: 'Per 10,000 residents', format: { unit: 'number', decimals: 2 } },
    ],
    rows: asylumEurope,
    highlight: ['United Kingdom'],
    defaultSort: { key: 'claims', direction: 'descending' },
    sources: [asylumEuropeSource],
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Thirty-two rows: the first ten, fading out, above "Show all 32 rows". Sorting re-picks the ten. */
export const Sortable: Story = {};

/** Fifteen rows, the most that render in full with no button. */
export const FifteenRows: Story = {
  args: { rows: asylumEurope.slice(0, 15), title: 'The fifteen countries with most claims' },
};

/** Sorted by rate instead of count. */
export const SortedByRate: Story = {
  args: { defaultSort: { key: 'perTenThousand', direction: 'descending' } },
};

/** A short table with no scroll and no default sort (source order). */
export const Short: Story = {
  args: { rows: asylumEurope.slice(0, 6), defaultSort: undefined, title: 'The six countries with most claims' },
};

/** No rows. */
export const Empty: Story = {
  args: { rows: [], title: 'No matching countries' },
};

/** Cells with their own footnotes: each cited cell prints its text, then a "[n]" link per source. */
export const CitedCells: Story = {
  args: {
    title: 'Federal voting laws on registration and ID',
    description: 'Illustrative: each cell that states what a law does cites the source that says so.',
    caption: 'One row per law, bill or ruling',
    columns: [
      { key: 'year', label: 'Year', format: 'text' },
      { key: 'measure', label: 'Law, bill or ruling', rowHeader: true },
      { key: 'effect', label: 'What it does on registration and ID', sortable: false },
    ],
    rows: [
      { year: '2025', measure: 'SAVE Act', effect: { value: 'Documentary proof of citizenship to register', sources: [{ label: 'Illustrative source', href: '#source-example-2', number: 2 }] } },
      { year: '1993', measure: 'National Voter Registration Act', effect: { value: 'Registration when applying for a driving licence', sources: [{ label: 'Illustrative source', href: '#source-example-1', number: 1 }] } },
      { year: '1965', measure: 'Voting Rights Act', effect: { value: 'Bars registration practices that discriminate by race', sources: [{ label: 'Illustrative source', href: '#source-example-1', number: 1 }, { label: 'Second illustrative source', href: '#source-example-3', number: 3 }] } },
    ],
    highlight: [],
    defaultSort: { key: 'year', direction: 'ascending' },
    sources: [{ label: 'Illustrative source', href: '#source-example-1', number: 1 }, { label: 'Second illustrative source', href: '#source-example-3', number: 3 }],
  },
};

/**
 * Cells the source qualifies read in its own words — "at least 159",
 * "between 60 and 80" — and still sort by their number; a range sorts by its
 * midpoint.
 */
export const QualifiedValues: Story = {
  args: {
    title: 'Deaths and displacement by region, May 2026',
    description: 'Illustrative: sort the Deaths column to see bounds and ranges placed by their numbers.',
    caption: 'One row per region, in the counter’s own words where it qualifies a figure.',
    columns: [
      { key: 'region', label: 'Region', rowHeader: true },
      { key: 'deaths', label: 'Deaths', format: { unit: 'count' } },
      { key: 'displaced', label: 'Share displaced', format: { unit: 'percent', decimals: 0 } },
    ],
    rows: [
      { region: 'North', deaths: { value: 159, qualifier: 'at least', asPublished: 'at least 159', sources: [{ label: 'Illustrative source', number: 1 }] }, displaced: 12 },
      { region: 'Capital', deaths: 120, displaced: { value: 3, qualifier: 'under' } },
      { region: 'South', deaths: { value: 90, qualifier: 'about', asPublished: 'about 90' }, displaced: 8 },
      { region: 'East', deaths: { low: 60, high: 80, asPublished: 'between 60 and 80' }, displaced: { low: 4, high: 6 } },
      { region: 'West', deaths: { value: 40, qualifier: 'fewer than', asPublished: 'fewer than 40' }, displaced: null },
    ],
    highlight: [],
    defaultSort: { key: 'deaths', direction: 'descending' },
    sources: [{ label: 'Illustrative source', number: 1 }],
    note: undefined,
  },
};

/**
 * A date column: cells hold "2026", "2026-06" or "2026-06-12" as the source
 * dates them, print as "2026", "Jun 2026", "12 Jun 2026", and sort by date —
 * a coarser date before the finer dates inside it.
 */
export const DateColumn: Story = {
  args: {
    title: 'When each state changed its mail-ballot deadline',
    description: 'Illustrative data: dated to the precision each source gives. Sort the Changed column either way.',
    caption: 'One row per state and change.',
    columns: [
      { key: 'state', label: 'State', rowHeader: true },
      { key: 'changed', label: 'Changed', format: 'date' },
      { key: 'change', label: 'What changed', format: 'text', sortable: false },
    ],
    rows: [
      { state: 'Alpha', changed: '2024-06-12', change: 'Postmark deadline replaced by receipt deadline' },
      { state: 'Beta', changed: '2023', change: 'Grace period of seven days added' },
      { state: 'Gamma', changed: '2024', change: 'Drop boxes limited to one per county' },
      { state: 'Delta', changed: '2024-03', change: 'Cure period extended' },
      { state: 'Epsilon', changed: '2024-03-01', change: 'Signature match rules published' },
      { state: 'Zeta', changed: null, change: 'Date not published' },
    ],
    highlight: [],
    defaultSort: { key: 'changed', direction: 'ascending' },
    sources: [{ label: 'Illustrative data' }],
    note: undefined,
  },
};

/**
 * Six columns of long text, as a case table has. On a phone it scrolls
 * sideways with a shadow on the side that has more; on a wide screen it
 * runs past the text column (the default for more than three columns).
 */
export const Wide: Story = {
  args: {
    title: 'Documented cases, how each was done and what happened',
    description: 'Illustrative data: a table whose cells are sentences, wider than any text column.',
    caption: 'One row per case',
    columns: [
      { key: 'case', label: 'Case', rowHeader: true },
      { key: 'year', label: 'Year', format: 'text' },
      { key: 'method', label: 'Method' },
      { key: 'how', label: 'How it was done', sortable: false },
      { key: 'reaches', label: 'ID check reaches it?' },
      { key: 'outcome', label: 'Outcome, as of', sortable: false },
    ],
    rows: [
      { case: 'City A', year: '1878', method: 'Officials', how: 'Election judges added unvoted ballots to the box', reaches: 'No', outcome: 'Convicted; appeal heard 1879' },
      { case: 'City B', year: '1890s', method: 'In person', how: 'Repeat voters used the names of the dead and departed', reaches: 'Yes', outcome: 'No charges recorded' },
      { case: 'County C', year: '1948', method: 'Count', how: 'A late box was added after the count closed', reaches: 'No', outcome: 'Result stood' },
      { case: 'County D', year: '2018', method: 'Absentee', how: 'A contractor collected and altered absentee ballots', reaches: 'No', outcome: 'New election ordered, 2019' },
    ],
    highlight: ['City B'],
    defaultSort: undefined,
    sources: [{ label: 'Illustrative data' }],
  },
};

/** The same six columns kept to the text column with `width: 'text'`: it scrolls sideways at every width. */
export const WideKeptToText: Story = {
  args: { ...Wide.args, width: 'text' },
};
