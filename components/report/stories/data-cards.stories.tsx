import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DataCards } from '../data-cards';

const source = { label: 'Illustrative source', href: '#source-example-1', number: 1 };

const meta = {
  title: 'Data/DataCards',
  component: DataCards,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A table\'s rows as cards, for when a reader reads each row rather than compares a column: rulings, laws and studies, whose cells run to sentences and quote their sources. Quoted words are set in the serif, so a source\'s words stand apart from the summary around them.',
      },
    },
  },
  args: {
    title: 'Who may set the rules: what the courts say',
    description: 'The main rulings, oldest first.',
    caption: 'One card per ruling',
    layout: 'timeline',
    leadColumn: 'says',
    dateColumn: 'date',
    columns: [
      { key: 'date', label: 'Date', format: 'text' },
      { key: 'name', label: 'Text or ruling', rowHeader: true },
      { key: 'says', label: 'What it says' },
      { key: 'status', label: 'Status' },
    ],
    rows: [
      { date: '1788', name: 'Elections Clause', says: { value: '"shall be prescribed in each state by the legislature thereof"', sources: [source] }, status: 'In force' },
      { date: '17 Jun 2013', name: 'Arizona v. Inter Tribal Council', says: { value: 'Congress\'s power is "paramount"; the clause covers "how federal elections are held, but not who may vote in them"', sources: [source] }, status: null },
      { date: '27 Jun 2023', name: 'Moore v. Harper', says: { value: 'State courts may review state legislatures\' election rules', sources: [source] }, status: 'Good law' },
    ],
    sources: [source],
  },
} satisfies Meta<typeof DataCards>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Rows in order of time, strung along a rule. */
export const Timeline: Story = {};

/** Rows with no order of time, in a grid as wide as the page allows. */
export const Cards: Story = { args: { layout: 'cards', dateColumn: undefined } };

/** One card picked out. */
export const Highlighted: Story = { args: { highlight: ['Moore v. Harper'] } };
