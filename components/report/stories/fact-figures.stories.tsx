import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { panelCharts } from '@/components/topic/fact-figures';
import { factSlides } from '@/lib/content/preview';
import { figureExamplesFact } from './fixtures/figure-examples';

const meta = {
  title: 'Existing/FactFigures',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A fact whose frontmatter lists `figures`: its series, a comparison and one figure of every kind, as each is drawn in full. The fact is the fixture `lib/content/__fixtures__/figure-examples.md`; its sources are fixtures, not real quotes.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every kind, in step order, each drawn in full. */
export const EveryKind: Story = {
  render: () => <>{panelCharts(figureExamplesFact, { slug: 'figure-examples', asOf: '2026-10-29' }, factSlides('figure-examples', figureExamplesFact))}</>,
};
