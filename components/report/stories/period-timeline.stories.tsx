import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PeriodTimeline } from '../period-timeline';
import {
  GOVERNMENT_PERIODS_ILLUSTRATIVE,
  POLICY_SOURCES,
  ROUTE_CATEGORIES,
  ROUTE_EVENTS,
  ROUTE_PERIODS,
} from './fixtures/timelines';

const meta = {
  title: 'Timelines/PeriodTimeline',
  component: PeriodTimeline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Spans over a shared time axis, Gantt-style: one row per policy, route or government, each with one or more periods, plus optional numbered point events. Use it when the argument is about overlap and sequence — which rules were in force while a number rose. Periods without an end date are still in force and end in an arrowhead. Short labels sit in their bars; long ones drop beneath so they stay legible on a phone. The Table view lists every span with its dates.',
      },
    },
  },
  args: {
    title: 'Which rules were in force when',
    description: 'Work, study and EU rules, 2016 to today. Bars before 2020 start at the axis edge, not at the date those rules began.',
    rows: ROUTE_PERIODS,
    categories: ROUTE_CATEGORIES,
    events: ROUTE_EVENTS,
    from: 2016,
    to: 2027,
    rowLabel: 'Rule',
    sources: POLICY_SOURCES,
    note: 'The care-worker end date is the 22 July 2025 rise in the skill bar to degree level, which the Home Office describes as ending the 2020 relaxation; most care roles are below degree level.',
  },
} satisfies Meta<typeof PeriodTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One colour, no events: the plainest form. */
export const WithoutCategoriesOrEvents: Story = {
  args: { categories: [], events: [], note: undefined },
};

/** Illustrative data: a long span beside short ones, with labels that do not fit their bars. */
export const ShortSpans: Story = {
  args: {
    title: 'Governments and asylum schemes',
    description: 'Illustrative data: these dates are not yet in Steelview’s sourced content.',
    rows: GOVERNMENT_PERIODS_ILLUSTRATIVE,
    categories: [],
    events: [],
    from: 2010,
    to: 2027,
    rowLabel: 'Row',
    sources: [{ label: 'Illustrative data' }],
    note: undefined,
  },
};
