import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ComparisonChart } from '@/components/topic/comparison-chart';
import { arrivalReasonsFact, asylumComparisonFact, internationalImmigrationFact, internationalImmigrationSources } from './fixtures/existing-charts';

const comparison = (fact: typeof asylumComparisonFact, id: string) => {
  const chart = fact.comparisons?.find(c => c.id === id);
  if (!chart) throw new Error(`No comparison "${id}" in ${fact.id}`);
  return chart;
};

const meta = {
  title: 'Existing/ComparisonChart',
  component: ComparisonChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The topic pages’ snapshot comparison: one value per item as horizontal bars, optionally broken into groups with a control to switch between them. Shown here with real frontmatter. Use it for a single period compared across places or categories; it takes the content `Fact` and one of its `comparisons`.',
      },
    },
  },
  args: {
    fact: asylumComparisonFact,
    chart: comparison(asylumComparisonFact, 'asylum-per-person'),
    sources: asylumComparisonFact.sources,
  },
} satisfies Meta<typeof ComparisonChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Asylum claims per person across 32 European countries, the UK highlighted: a dense comparison. */
export const AsylumPerPerson: Story = {};

/** Five reasons for arrival: a short comparison. */
export const ArrivalReasons: Story = {
  args: {
    fact: arrivalReasonsFact,
    chart: comparison(arrivalReasonsFact, 'arrival-reasons'),
    sources: arrivalReasonsFact.sources,
  },
};

/** International immigration by country, with grouped breakdowns and a group control. */
export const Grouped: Story = {
  args: {
    fact: internationalImmigrationFact,
    chart: comparison(internationalImmigrationFact, 'international-immigration'),
    sources: internationalImmigrationSources,
  },
};
