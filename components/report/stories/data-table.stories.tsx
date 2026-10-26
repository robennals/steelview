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
