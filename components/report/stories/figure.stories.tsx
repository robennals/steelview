import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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
