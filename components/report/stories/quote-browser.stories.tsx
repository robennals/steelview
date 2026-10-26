import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QuoteBrowser } from '../quote-browser';
import { institutionQuotes } from './fixtures/quotes';
import { illustrativeDebateQuotes } from './fixtures/illustrative-quotes';

const meta = {
  title: 'Quotes/QuoteBrowser',
  component: QuoteBrowser,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use when a report gathers many sourced quotes — what officials, researchers or parties have said on a question — and a reader needs to narrow them by position, topic or words. Quotes are listed in date order, never grouped or ranked by position, and every quote carries its own anchor so it can be linked. The full list renders on the server.',
      },
    },
  },
  args: {
    title: 'What the official sources say',
    description: 'Verbatim quotes from the publishers cited in the UK immigration fact reports, oldest first.',
    quotes: institutionQuotes,
    tagLabel: 'Topic',
  },
} satisfies Meta<typeof QuoteBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Real quotes from institutions. They have no `position`, so only the topic filter appears. */
export const InstitutionalSources: Story = {};

/** Newest first, and a lower clamp so more long quotes fold behind "Read full quote". */
export const NewestFirstClamped: Story = {
  args: { defaultSort: 'newest', clampAt: 200 },
};

/** Illustrative data: fictional speakers and parties, showing the position filter. One quote is undated and sorts last. */
export const PoliticalStatements: Story = {
  args: {
    title: 'What the parties have said about Channel crossings',
    description: 'Illustrative data: fictional speakers and parties.',
    quotes: illustrativeDebateQuotes,
    positionLabel: 'Party',
    sources: [{ label: 'Illustrative data' }],
  },
};

/** Started with a search: the status line says how many of the whole collection are showing. */
export const Searched: Story = { args: { initialSearch: 'asylum' } };

/** A search that matches nothing says so, rather than leaving a gap. */
export const NoMatches: Story = { args: { initialSearch: 'lighthouse' } };
