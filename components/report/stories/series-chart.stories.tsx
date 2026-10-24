import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SeriesChart } from '@/components/topic/series-chart';
import { foreignBornShareSeries, foreignBornShareSourceCount, longRunMigrationSeries, longRunMigrationSourceCount } from './fixtures/existing-charts';

const meta = {
  title: 'Existing/SeriesChart',
  component: SeriesChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The topic pages’ time-series chart, shown here with real frontmatter from the fact reports. Use it when a fact’s claim is about a number that changes over time: it draws every reading of the series (for example people and share of population) across the full published range, marks method breaks, and offers Graph/Table so each value is checkable. It takes the content `Series` type directly.',
      },
    },
  },
  args: {
    factId: 'immigration-against-the-long-run',
    series: longRunMigrationSeries,
    sourceOffset: longRunMigrationSourceCount,
  },
} satisfies Meta<typeof SeriesChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Immigration, emigration and net migration, 1964–2025: two readings and three method breaks. */
export const LongRunMigration: Story = {};

/** One line, eight Census points: the foreign-born share of England and Wales, 1951–2021. */
export const SingleLine: Story = {
  args: {
    factId: 'share-of-the-population-born-abroad',
    series: foreignBornShareSeries,
    sourceOffset: foreignBornShareSourceCount,
  },
};
