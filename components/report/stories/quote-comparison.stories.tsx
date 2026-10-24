import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QuoteComparison } from '../quote-comparison';
import { trustQuotes } from './fixtures/quotes';
import { illustrativeChannelAnswers, illustrativeDebateQuotes } from './fixtures/illustrative-quotes';

const meta = {
  title: 'Quotes/QuoteComparison',
  component: QuoteComparison,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use when two to four positions answer the same question and the reader should see them side by side. Columns run in the order given, at equal width and in the same type; they stack on narrow screens. The question is the heading.',
      },
    },
  },
  args: {
    question: 'What should happen to Channel crossings?',
    description: 'Illustrative data: fictional speakers and parties.',
    quotes: illustrativeChannelAnswers,
    sources: [{ label: 'Illustrative data' }],
  },
} satisfies Meta<typeof QuoteComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Illustrative data: three fictional parties answer one question. */
export const ThreePositions: Story = {};

/** Real quotes: three findings from one research review. The position labels are editorial summaries of each quote. */
export const ResearchFindings: Story = {
  args: {
    question: 'Does ethnic diversity lower trust in a neighbourhood?',
    description: 'Three summaries of the British research, from the Migration Observatory’s review of immigration, diversity and social cohesion.',
    quotes: trustQuotes,
    sources: [{ label: 'The Migration Observatory, University of Oxford', href: trustQuotes[0].source?.href }],
  },
};

/** Illustrative data: two answers sit two-up from a narrower width. */
export const TwoPositions: Story = { args: { quotes: illustrativeChannelAnswers.slice(0, 2) } };

/** Illustrative data: the maximum of four columns. */
export const FourPositions: Story = {
  args: {
    question: 'What should be done about asylum and crossings?',
    quotes: [illustrativeDebateQuotes[0], illustrativeDebateQuotes[1], illustrativeDebateQuotes[5], illustrativeDebateQuotes[6]].map(q => ({ ...q, position: q.position ?? 'Independent' })),
  },
};
