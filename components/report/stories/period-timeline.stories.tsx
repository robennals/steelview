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
          'Spans over a shared time axis, Gantt-style: one row per policy, route or government, each with one or more periods, plus optional numbered point events. Use it when the argument is about overlap and sequence — which rules were in force while a number rose. Periods without an end date run to the axis end in an arrowhead, read "still in force" when the axis ends on the report\'s date (`asOf`) and "no end by <axis end>" otherwise. A label sits in its bar if it fits, else just right of it if that part of the row is free, else it is left off the graph — the legend, the hover-and-focus readout and the Table view name every period — so a row is always one line. A span under eighteen months gets month ticks.',
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
    asOf: '2027',
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

/** Illustrative stages coded as never ending, drawn over one another on 31 crowded rows: only labels with room inside their bar are drawn; the rest are in the readout and table. */
export const CrowdedRows: Story = {
  args: {
    title: 'States that explored, pursued and acquired a capability',
    description: 'Illustrative data: each stage starts a new bar over the last, and none is coded as ending.',
    rows: Array.from({ length: 31 }, (_, i) => {
      const start = 1939 + ((i * 7) % 60);
      return {
        label: `State ${i + 1}`,
        periods: [
          { from: String(start), category: 'explore', label: 'Explore' },
          ...(i % 3 === 0 ? [] : [{ from: String(start + 2 + (i % 5)), category: 'pursue', label: 'Pursue' }]),
          ...(i % 4 === 0 ? [{ from: String(Math.min(start + 12, 2012)), category: 'acquire', label: 'Acquire' }] : []),
        ],
      };
    }),
    categories: [{ id: 'explore', label: 'Explore' }, { id: 'pursue', label: 'Pursue' }, { id: 'acquire', label: 'Acquire' }],
    events: [],
    from: 1939,
    to: '2017-06',
    asOf: '2026-10-29',
    rowLabel: 'State',
    sources: [{ label: 'Illustrative data' }],
    note: undefined,
  },
};

/** Illustrative: eight months, so the axis counts months; a long label beside a short bar where the row is free. */
export const ShortSpan: Story = {
  args: {
    title: 'Ceasefire, blockade and strike pause, 2026',
    description: 'Illustrative data: the axis runs from 28 February to the report date, 29 October.',
    rows: [
      { label: 'Ceasefire', periods: [{ from: '2026-04-08', to: '2026-07-07', category: 'ceasefire', label: 'Ordered 8 April' }] },
      { label: 'Blockade', periods: [{ from: '2026-04-13', to: '2026-06-18', category: 'blockade', label: 'First' }, { from: '2026-07-14', category: 'blockade', label: 'Second blockade' }] },
      { label: 'Strike pause', periods: [{ from: '2026-10-08', category: 'pause', label: 'Pause' }] },
    ],
    categories: [{ id: 'ceasefire', label: 'Ceasefire' }, { id: 'blockade', label: 'Blockade' }, { id: 'pause', label: 'Strike pause' }],
    events: [],
    from: '2026-02-28',
    to: '2026-10-29',
    asOf: '2026-10-29',
    rowLabel: 'Arrangement',
    sources: [{ label: 'Illustrative data' }],
    note: undefined,
  },
};

/** The same rules with data that stops before the report date: an open period reads "no end by 2025", not "still in force". */
export const OpenEndedBeforeReportDate: Story = {
  args: { from: 2016, to: 2025, asOf: '2026-10-29', events: [] },
};
