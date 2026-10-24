import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ClaimCheck } from '../claim-check';
import { assessedClaims } from './fixtures/claims';

const [illegalArrivals] = assessedClaims;

const meta = {
  title: 'Claims/ClaimCheck',
  component: ClaimCheck,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use to set a claim people make against what the data shows: the claim quoted as stated, who made it and where, its status in the site’s status alphabet, a one- or two-sentence finding with its sources, and a link to the full fact report. Use `compact` for a run of several checks.',
      },
    },
  },
  args: illegalArrivals,
} satisfies Meta<typeof ClaimCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A claim assessed on the site, with no single claimant: it circulates rather than having one author. */
export const Default: Story = {};

/** Illustrative attribution: a fictional speaker is given as the claimant. The claim, status and finding are real. */
export const Attributed: Story = {
  args: {
    claimant: { name: 'Speaker A', role: 'Party X spokesperson' },
    date: '2025-03-04',
    claimSource: { label: 'Illustrative data' },
  },
};

/** Compact checks in a list: every status the site has assessed a claim with. */
export const CompactList: Story = {
  args: { variant: 'compact' },
  render: args => (
    <div>
      {assessedClaims.map(claim => <ClaimCheck key={claim.claim} {...claim} variant={args.variant} />)}
    </div>
  ),
};
