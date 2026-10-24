import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { KeyFigures } from '../key-figures';
import { asylumKeyFigures, workVisaKeyFigures } from './fixtures/data';

const meta = {
  title: 'Data/KeyFigures',
  component: KeyFigures,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use at the top of a fact report for the two to four numbers a reader should leave with. Every figure states its period, and a change is always against a named comparison. Direction is carried by the sign and the words, never by colour. Wraps to a stack on narrow screens.',
      },
    },
  },
  args: {
    title: 'Asylum in the latest year',
    figures: asylumKeyFigures.figures,
    sources: asylumKeyFigures.sources,
  },
} satisfies Meta<typeof KeyFigures>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Four figures, each with a change against a named comparison and a source mark. */
export const FourFigures: Story = {};

/** Three figures, one without a change: a peak needs no comparison. */
export const ThreeFigures: Story = {
  args: {
    title: 'Work visas',
    description: 'Work visas rose to a peak in 2023 and have since fallen; the graduate-level part barely moved.',
    figures: workVisaKeyFigures.figures,
    sources: workVisaKeyFigures.sources,
  },
};

/** Two figures and no heading — set inline after a paragraph. */
export const Pair: Story = {
  args: { title: undefined, figures: asylumKeyFigures.figures.slice(0, 2) },
};
