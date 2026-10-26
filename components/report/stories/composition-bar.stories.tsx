import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CompositionBar } from '../composition-bar';
import { ethnicityCategories, ethnicityRows, ethnicitySource, nationalityGroupRows, onsLtimSource, religionCategories, religionRows, religionSource } from './fixtures/data';

const meta = {
  title: 'Data/CompositionBar',
  component: CompositionBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use to compare how a whole divides into parts across a few rows — census years, or groups of arrivals. Each bar is 100%, so it shows shares, not sizes; pass counts with `showCounts` when size matters too. Labels sit inside segments only where they fit; the legend and Table view name every part.',
      },
    },
  },
  args: {
    title: 'Religious affiliation, England and Wales',
    description: 'Share of all usual residents at each census. “Other responses” combines smaller religions and people who did not answer.',
    categories: religionCategories,
    rows: religionRows,
    rowLabel: 'Census',
    sources: [religionSource],
    note: 'The voluntary Census religion question began in 2001. It measures the religion with which a person connects or identifies, not belief or practice.',
  },
} satisfies Meta<typeof CompositionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three censuses, five parts given as percentages. */
export const Religion: Story = {};

/** Counts as input: shares are computed and the counts are printed beside them. */
export const WithCounts: Story = {
  args: {
    title: 'Long-term immigration by nationality group',
    description: 'Year ending December. Non-EU+ is the published non-EU+ total.',
    categories: [
      { key: 'nonEu', label: 'Non-EU+' },
      { key: 'british', label: 'British' },
      { key: 'eu', label: 'EU+' },
    ],
    rows: nationalityGroupRows,
    rowLabel: 'Year',
    showCounts: true,
    sources: [onsLtimSource],
    note: 'EU+ is a nationality grouping, not country of birth.',
  },
};

/** Two small White categories folded into one part with `otherThreshold`, so every remaining label fits. */
export const GroupedSmallParts: Story = {
  args: {
    title: 'Ethnic group, England and Wales',
    description: 'Share of usual residents, Census 2011 and 2021. Ethnic identity, not citizenship or country of birth.',
    categories: ethnicityCategories,
    rows: ethnicityRows,
    otherThreshold: 7,
    otherLabel: 'Other White groups',
    rowLabel: 'Census',
    sources: [ethnicitySource],
    note: 'White British, Other White, Asian and the White total are published. “White: Irish, Gypsy, Traveller, Roma” and “Black, Mixed and other” are derived as residuals from them.',
  },
};
