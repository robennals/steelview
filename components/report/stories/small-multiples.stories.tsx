import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SmallMultiples } from '../small-multiples';
import { nationalityPanels, onsLtimSource } from './fixtures/data';

const meta = {
  title: 'Data/SmallMultiples',
  component: SmallMultiples,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use for the same measure over time across several categories, when one chart with seven lines would tangle. Panels share one time range and, by default, one value scale, so sizes compare honestly; each panel prints its latest value.',
      },
    },
  },
  args: {
    title: 'Long-term immigration by nationality group',
    description: 'Arrivals per year ending December, 2021–2025. The four named nationalities are the largest the ONS publishes; “Other non-EU+” is the remainder.',
    panels: nationalityPanels,
    format: { unit: 'count' },
    valueLabel: 'Long-term immigrants',
    periodLabel: 'Year ending December',
    sources: [onsLtimSource],
    note: '“Other non-EU+” is the non-EU+ total after subtracting the named nationalities; it is not a region.',
  },
} satisfies Meta<typeof SmallMultiples>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One shared scale: the size of "Other non-EU+" next to Ukrainian is the point. */
export const SharedScale: Story = {};

/** Independent scales show shape only — the axis label says so. */
export const IndependentScales: Story = {
  args: { independentScales: true, description: 'Each panel has its own scale, to compare the shape of each rise and fall rather than its size.' },
};

/** Four panels. */
export const FewPanels: Story = {
  args: { panels: nationalityPanels.slice(0, 4), title: 'The four largest named non-EU+ nationalities' },
};
