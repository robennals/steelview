import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BarChart } from '../bar-chart';
import { asylumEurope, asylumEuropeSource, careFiscal, irregularEntryTrends, oecdSource } from './fixtures/data';

const meta = {
  title: 'Data/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use for one measure across categories — "how does the UK compare". Bars start at zero, negative values extend left of a marked zero line, and every value is printed beside its bar and in the Table view. Highlight only the row the text is about.',
      },
    },
  },
  args: {
    title: 'Asylum claims per person across Europe',
    description: '2024, all EU+ countries and the UK. Applicants including dependants; the UK is highlighted.',
    valueLabel: 'Applicants per 10,000 residents',
    categoryLabel: 'Country',
    format: { unit: 'number', decimals: 2 },
    items: asylumEurope.map(row => ({ label: row.country, value: row.perTenThousand, highlight: row.country === 'United Kingdom' })),
    sources: [asylumEuropeSource],
    note: 'Includes applicants and dependants, not grants of protection or refugee resettlement. Rates use the source workbook’s population denominators.',
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Thirty-two rows: the dense layout tightens the rhythm. */
export const Dense: Story = {};

/** The same countries by count, top ten only. */
export const Counts: Story = {
  args: {
    title: 'Total asylum claims across Europe',
    description: '2024, the ten countries with the most claims. The UK is highlighted.',
    valueLabel: 'People claiming asylum',
    format: { unit: 'count' },
    items: asylumEurope.slice(0, 10).map(row => ({ label: row.country, value: row.claims, highlight: row.country === 'United Kingdom' })),
    note: undefined,
  },
};

/** Negative values extend left of zero. */
export const NegativeValues: Story = {
  args: {
    title: 'Irregular-entry detections moved in different directions in 2024',
    description: 'Change from 2023 within each reporting system. These are trends, not comparable illegal-entry shares.',
    valueLabel: 'Annual change in detections / encounters',
    categoryLabel: 'Reporting system',
    format: { unit: 'percent', decimals: 0, signed: true },
    items: irregularEntryTrends,
    sources: [oecdSource],
    note: undefined,
  },
};

/** Pounds, one negative and one positive, in the given order. */
export const PoundsUnsorted: Story = {
  args: {
    title: 'Care workers and other health workers have different fiscal projections',
    description: 'Main applicants in the MAC’s modelled cohort. Fiscal contribution does not measure the full social value of care.',
    valueLabel: 'Modelled lifetime net fiscal contribution',
    categoryLabel: 'Occupation',
    format: { unit: 'currency', currency: 'GBP' },
    sort: 'none',
    items: careFiscal.items,
    sources: [careFiscal.source],
    note: undefined,
  },
};
