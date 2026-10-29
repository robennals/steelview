import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ScatterPlot } from '../scatter-plot';
import { MAIL_COUNT_SPEED_GROUPS, MAIL_COUNT_SPEED_ILLUSTRATIVE, MAIL_COUNT_SPEED_SOURCES } from './fixtures/scatter';

const meta = {
  title: 'Data/ScatterPlot',
  component: ScatterPlot,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Two measures per area plotted against each other, every point labelled beside it, so the reader can see a relationship — or its absence — without hunting through a table. Both axes are round-numbered and include zero unless `includeZero: false`; `domain` fixes an axis exactly. Optional `groups` give points a series colour *and* a marker shape; `highlight` outlines points in ink and bolds their labels without recolouring them. Labels are placed clear of every other label and point where there is room; a label with nowhere free gets a paper halo. Hover or tab to a point for its full name and values; the Table switch lists every point. There is deliberately no trend line: a fitted line invites a causal reading the chart cannot support.',
      },
    },
  },
  args: {
    title: 'Hours to count 95% of the vote, against when mail processing may begin',
    description: 'Illustrative: the processing start dates are placeholders until NCSL Table 16 is read. The counting times are MIT Election Lab’s 2024 figures.',
    points: MAIL_COUNT_SPEED_ILLUSTRATIVE,
    x: { label: 'Days before Election Day processing may begin' },
    y: { label: 'Hours to count 95% of the vote, 2024' },
    pointLabel: 'State',
    sources: MAIL_COUNT_SPEED_SOURCES,
  },
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Five states, one marker style: without `groups`, every point is a circle in the first series colour. */
export const MailCountSpeed: Story = {};

/** The same points grouped by how the state mostly votes, with Arizona outlined. */
export const HighlightAndGroups: Story = {
  args: {
    groups: MAIL_COUNT_SPEED_GROUPS,
    highlight: ['az'],
  },
};
