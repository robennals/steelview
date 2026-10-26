import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PullQuote } from '../pull-quote';
import { detectionLimitsQuote, housingEstimateQuote, housingSummaryQuote } from './fixtures/quotes';

const meta = {
  title: 'Quotes/PullQuote',
  component: PullQuote,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use to set one quote apart inside a report — a source’s own summary of its finding, or a caveat the reader must not miss. `pull` sets it large between sections; `inline` sits in running prose. The attribution and source link always travel with it, however large it is set.',
      },
    },
  },
  args: { quote: housingSummaryQuote, variant: 'pull' },
} satisfies Meta<typeof PullQuote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pull: Story = {};

/** A long quote set large: the size steps down on narrow screens so it still reads as a paragraph. */
export const PullLong: Story = { args: { quote: detectionLimitsQuote } };

/** Inline, between paragraphs of the report it belongs to (prose from the housing-costs fact report). */
export const Inline: Story = {
  args: { quote: housingEstimateQuote, variant: 'inline' },
  render: args => (
    <div className="prose-body">
      <p>A MAC-commissioned review estimates that immigration could explain roughly 4–6% of the rise in UK house prices over three decades. This is an illustrative application of international evidence, not a precise causal estimate for the UK.</p>
      <PullQuote {...args} />
      <p>The review finds that immigration-driven demand is more likely to raise prices where housing supply cannot respond. Estimates vary across settings and methods.</p>
    </div>
  ),
};
