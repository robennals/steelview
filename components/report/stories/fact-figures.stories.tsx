import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FactArticle } from '@/components/topic/fact-article';
import { figureExamplesBodyHtml, figureExamplesFact } from './fixtures/figure-examples';

const meta = {
  title: 'Existing/FactFigures',
  component: FactArticle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A fact page whose frontmatter lists `figures`: its series, a comparison, a body section and one figure of every kind, in the order written, each with its Observations inside its frame. The fact is the fixture `lib/content/__fixtures__/figure-examples.md`; its sources are fixtures, not real quotes.',
      },
    },
  },
  args: {
    slug: 'figure-examples',
    variant: 'modal',
    fact: figureExamplesFact,
    bodyHtml: figureExamplesBodyHtml,
    topic: { lastUpdated: '2026-10-29', facts: [figureExamplesFact] },
  },
} satisfies Meta<typeof FactArticle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every kind, in reading order, as the sheet over a topic draws them. */
export const EveryKind: Story = {};
