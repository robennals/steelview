import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Timeline } from '../timeline';
import { POLICY_CATEGORIES, POLICY_MILESTONES, POLICY_SOURCES } from './fixtures/timelines';

const meta = {
  title: 'Timelines/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A vertical list of dated events under year headings, each with its category, a short description and its own source. Use it for the sequence of decisions behind a trend — routes opened and closed, acts passed, schemes announced and dropped. Categories are shown by marker shape and colour together and named in words on every event; filled markers are major events. Category chips and a "Major only" switch filter the list, and the status line always says how many events are hidden. Events whose date is not yet in Steelview\'s content carry an "Illustrative data" source.',
      },
    },
  },
  args: {
    title: 'UK immigration policy milestones, 2020–2025',
    description: 'Rule changes behind the rise and fall in visas and asylum claims. Asylum-policy dates marked "Illustrative data" are not yet in Steelview’s sourced content.',
    events: POLICY_MILESTONES,
    categories: POLICY_CATEGORIES,
    sources: POLICY_SOURCES,
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Pre-filtered to one category, as a fact about care workers might embed it. */
export const FilteredByCategory: Story = {
  args: { initialCategories: ['work'] },
};

/** Major events only: the short version for an overview page. */
export const MajorOnly: Story = {
  args: { initialMajorOnly: true },
};

/** A filter combination that matches nothing says so instead of leaving a gap. */
export const EmptyResult: Story = {
  args: { initialCategories: ['eu'], initialMajorOnly: false, events: POLICY_MILESTONES.filter(e => e.category !== 'eu') },
};
