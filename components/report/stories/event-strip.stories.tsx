import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SeriesChart } from '@/components/topic/series-chart';
import { EventStrip } from '../event-strip';
import { ASYLUM_CLAIMS_SERIES, ASYLUM_EVENTS, POLICY_MILESTONES, ROUTE_EVENTS } from './fixtures/timelines';

const milestone = (date: string) => {
  const event = POLICY_MILESTONES.find(e => e.date === date)!;
  return { date: event.date, label: event.title, source: event.source };
};

const meta = {
  title: 'Timelines/EventStrip',
  component: EventStrip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A thin strip of numbered event markers on a time axis, meant to sit directly under a line chart so a trend can be read against the decisions around it; the events are listed in a numbered key below. With `align="series-chart"` (the default) its axis lines up with the plot area of the topic SeriesChart at both of that chart\'s sizes. It marks when things happened and nothing more — a marker beside a turn in the line is an invitation to look, not a claim of cause.',
      },
    },
  },
  args: {
    from: 2001,
    to: 2025,
    events: ASYLUM_EVENTS,
    align: 'series-chart',
    showAxis: true,
  },
} satisfies Meta<typeof EventStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Under the real asylum-claims chart. The claims are real (Home Office); three
 * of the five events are illustrative and say so in their source line.
 */
export const UnderSeriesChart: Story = {
  render: args => (
    <>
      <SeriesChart factId="story-asylum" series={ASYLUM_CLAIMS_SERIES} />
      <EventStrip {...args} />
    </>
  ),
};

/** On its own, full width, with markers close enough together to stack. */
export const Standalone: Story = {
  args: {
    from: 2020,
    to: 2026,
    align: 'none',
    events: [...ROUTE_EVENTS, milestone('2022-02'), milestone('2021-01')],
    keyTitle: 'Events',
  },
};
