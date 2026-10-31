import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ObservationStep } from '@/components/topic/observation-bar';
import { ReportFigure } from '../figure';

const meta = {
  title: 'Foundations/ReportFigure',
  component: ReportFigure,
  args: {
    title: 'Net migration, year ending June',
    description: 'The frame every component sits in: heading, one sentence on what the figure shows, the source, and a collapsed method note.',
    sources: [{ label: 'ONS', href: '#source-example-1', number: 1 }, { label: 'Home Office', href: '#source-example-2', number: 2 }],
    note: 'Coverage, definitional changes and anything a reader must know to read the figure honestly go here.',
    children: <p className="sv-chart__desc">Component content goes here.</p>,
  },
} satisfies Meta<typeof ReportFigure>;

export default meta;
export const Default: StoryObj<typeof meta> = {};

const observations = [
  { id: 'a-finding', heading: 'What to notice', label: 'What to notice', html: '<p>Why it matters.</p>', subtlety: false, href: '#a-finding' },
  { id: 'a-catch', heading: 'What to be careful of', label: 'What to be careful of', html: '<p>Why it qualifies the chart.</p>', subtlety: true, href: '#a-catch' },
];

/** In a data panel: one line of More, listing what the bar steps through, over the bar and the graph. */
export const InADataPanel: StoryObj<typeof meta> = {
  args: { panel: true },
  render: args => <ObservationStep observations={observations} more="<p>What this chart counts and leaves out.</p>"><ReportFigure {...args} /></ObservationStep>,
};
