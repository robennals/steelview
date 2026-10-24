import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CaveatList } from '../caveat-list';
import { compositionDataNeeded, populationDataNeeded } from './fixtures/claims';

const meta = {
  title: 'Claims/CaveatList',
  component: CaveatList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use at the end of a report, or under a figure, to say what it does not show: each missing measure and why it matters. Kept apart from the findings so an absence of data is never read as a finding. The heading is configurable — "Data still needed", "What this does not show".',
      },
    },
  },
  args: { items: compositionDataNeeded, heading: 'Data still needed' },
} satisfies Meta<typeof CaveatList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** From the "Incoming Immigrant Composition" fact report. */
export const DataStillNeeded: Story = {};

/** From the "Population Composition" fact report, under a different heading. */
export const WhatThisDoesNotShow: Story = {
  args: { items: populationDataNeeded, heading: 'What this does not show' },
};

/** Adapted from the "What this does not claim" note in the illegal-arrivals fact report. */
export const SingleItem: Story = {
  args: {
    heading: 'What this does not show',
    items: [{ measure: 'The true number of illegal entries', why: 'The Home Office counts detections and says explicitly that it cannot estimate the rest.' }],
  },
};
