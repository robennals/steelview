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
    sources: [{ label: 'The Migration Observatory, University of Oxford', href: trustQuotes[0].sources?.[0]?.href }],
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

/**
 * A quote not in English: the court's words verbatim, read aloud in German
 * (`lang`), with the report's translation beside them. Real quote from the
 * vote-by-mail report; the translation is that report's own.
 */
export const Translated: Story = {
  args: {
    question: 'Does postal voting give up the secrecy of the ballot?',
    description: 'A court and a government review, on what is lost when a ballot is filled in at home.',
    quotes: [
      {
        id: 'bverfg-2013',
        text: 'Bei der Briefwahl ist die öffentliche Kontrolle der Stimmabgabe zurückgenommen … Die Zulassung der Briefwahl dient aber dem Ziel, eine möglichst umfassende Wahlbeteiligung zu erreichen … Das ist derzeit jedoch offenkundig nicht der Fall.',
        lang: 'de',
        translation: 'With postal voting, public control of how the vote is cast is reduced, but admitting it serves the widest possible participation; election principles being hollowed out is “plainly not the case at present”. (This report’s translation.)',
        speaker: 'Federal Constitutional Court of Germany',
        date: '2013-07-09',
        sources: [{ label: 'Bundesverfassungsgericht' }],
      },
      {
        id: 'pickles-2016',
        text: 'It was argued that unrestricted postal voting undermines the fundamental secrecy of the ballot and that despite existing safeguards can never guarantee that the voter has not been influenced in some way.',
        speaker: 'Sir Eric Pickles’s review into electoral fraud',
        context: 'Reporting submissions to the review',
        date: '2016-08',
        sources: [{ label: 'UK Cabinet Office' }],
      },
    ],
    sources: [{ label: 'Bundesverfassungsgericht' }, { label: 'UK Cabinet Office' }],
  },
};
