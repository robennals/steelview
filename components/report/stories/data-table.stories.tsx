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
          'Use when the table is the figure: many rows or columns a reader will look up rather than see as a shape. Headers sort (announced with aria-sort), numbers use the same formats as the charts, the header stays pinned while the body scrolls, and wide tables scroll sideways on a phone.',
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

/** Thirty-two rows, scrolling under a pinned header. */
export const Sortable: Story = {};

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
