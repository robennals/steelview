import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EstimateRange } from '../estimate-range';
import { illustrativeWageEstimates } from './fixtures/data';

const meta = {
  title: 'Data/EstimateRange',
  component: EstimateRange,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use to compare estimates of one effect from several studies (a forest plot) — for example, the wage effect of immigration. Dots are central estimates, lines their intervals, and the dashed line is no effect; the table says in words whether each interval includes it. Illustrative data: these studies and numbers are invented.',
      },
    },
  },
  args: {
    title: 'Estimated wage effects of immigration',
    description: 'Illustrative data. Effect on wages of a 1 percentage point rise in the migrant share of the working-age population.',
    estimates: illustrativeWageEstimates,
    format: { unit: 'percent', decimals: 2 },
    valueLabel: 'Change in wages, % per 1pp rise in migrant share',
    intervalLabel: '95% confidence interval',
    sources: [{ label: 'Illustrative data' }],
  },
} satisfies Meta<typeof EstimateRange>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Grouped by who is affected. */
export const Grouped: Story = {};

/** One group, no headings. */
export const Ungrouped: Story = {
  args: { estimates: illustrativeWageEstimates.filter(e => e.group === 'Lowest-paid workers').map(e => ({ ...e, group: undefined })) },
};

/** A fixed axis narrower than the data: clipped intervals end in arrowheads. */
export const FixedDomain: Story = {
  args: { domain: [-0.5, 0.5] },
};

/**
 * Estimates with no natural "no effect" value, such as costs: no reference
 * line and no signs. A range without a central estimate has no dot; a lone
 * lower or upper bound runs to the axis end with an arrowhead. Illustrative.
 */
export const OpenBoundsAndNoNull: Story = {
  args: {
    title: 'Estimated cost, by estimator',
    description: 'Illustrative estimates of one cost, some given only as a range or a bound.',
    valueLabel: 'Estimated cost, US$ billion',
    format: { unit: 'number', decimals: 1 },
    intervalLabel: 'Range the estimator published',
    nullValue: null,
    estimates: [
      { label: 'Estimator A', year: 'Apr 2026', low: 25, high: 35, source: { label: 'Illustrative source', href: '#source-example-1', number: 1 } },
      { label: 'Estimator B', year: 'Jun 2026', estimate: 40, low: 34, high: 42, source: { label: 'Illustrative source', href: '#source-example-2', number: 2 } },
      { label: 'Estimator C', year: 'Jul 2026', low: 30, asPublished: 'at least $30 billion' },
      { label: 'Estimator D', year: 'Aug 2026', high: 45, asPublished: 'no more than $45 billion' },
      { label: 'Estimator E', year: 'Sep 2026', estimate: 43.6 },
    ],
  },
};
