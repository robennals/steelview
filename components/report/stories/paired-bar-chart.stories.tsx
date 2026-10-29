import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PairedBarChart } from '../paired-bar-chart';

/*
 * Real figures, copied from the vote-by-mail and voter-ID reports
 * (content/topics/us-vote-by-mail/facts/ballot-deadlines-and-counting-speed.md,
 * absentee-fraud-and-manipulation-of-the-count.md and
 * us-voter-id/facts/election-fraud-and-voter-exclusion-history.md).
 */

const mit = { label: 'MIT Election Data and Science Lab', href: 'https://electionlab.mit.edu/' };

const meta = {
  title: 'Data/PairedBarChart',
  component: PairedBarChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use for two or more measures in the same unit per row — the same states in two elections, or a winning margin beside the ballots ruled invalid. Bars sit one under another, never stacked, each from zero; series differ by fill pattern as well as colour, and each figure is printed on its own line after its series\' mark. `style: dumbbell` joins exactly two measures with a line, a ring for the first and a disc for the second, and may label each end when the dates differ by row. The table has one column per measure. From content: a `barChart` figure with `series`.',
      },
    },
  },
  args: {
    title: 'Hours to count 95% of the presidential vote, seven battleground states, 2020 and 2024',
    description: 'Hours after polls closed until 95% of the two-party presidential vote had been reported.',
    valueLabel: 'Hours',
    categoryLabel: 'State',
    series: [{ key: 'y2020', label: '2020' }, { key: 'y2024', label: '2024' }],
    items: [
      { label: 'Arizona', values: { y2020: 73, y2024: 147 } },
      { label: 'Nevada', values: { y2020: 159, y2024: 51 } },
      { label: 'Pennsylvania', values: { y2020: 49, y2024: 8 } },
      { label: 'Georgia', values: { y2020: 18, y2024: 5 } },
      { label: 'Michigan', values: { y2020: 17, y2024: 9 } },
      { label: 'Wisconsin', values: { y2020: 8, y2024: 9 } },
      { label: 'North Carolina', values: { y2020: 3, y2024: 6 } },
    ],
    sources: [mit],
    note: 'MIT says the hours "may be overstated by the duration of the media reporting process, plus up to half an hour".',
  },
} satisfies Meta<typeof PairedBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two elections per state, in the order the source lists them. */
export const TwoElections: Story = {};

/** The same, ranked by the first measure (2020). */
export const RankedByFirst: Story = { args: { sort: 'value' } };

/**
 * Two different measures per case, one of them a bound: "at least 13"
 * illegal absentee ballots in Perth Amboy ends in an open arrowhead. One
 * case is highlighted.
 */
export const MarginAndInvalid: Story = {
  args: {
    title: 'Winning margin against ballots ruled invalid, voided elections involving absentee ballots',
    description: 'For each voided election whose record gives both numbers: the winning margin as first counted, and the ballots a court ruled invalid or illegal.',
    valueLabel: 'Votes or ballots',
    categoryLabel: 'Election',
    series: [{ key: 'margin', label: 'Winning margin' }, { key: 'invalid', label: 'Ballots ruled invalid' }],
    items: [
      { label: 'East Chicago, Ind., 2003 primary', values: { margin: 278, invalid: 155 }, highlight: true },
      { label: 'Vernon, Calif. (entry 2012)', values: { margin: 4, invalid: 7 } },
      { label: 'Weslaco, Tex., 2013', values: { margin: 16, invalid: 30 } },
      { label: 'Perth Amboy, N.J. (entry 2015)', values: { margin: 10, invalid: { value: 13, qualifier: 'at least' } } },
      { label: 'Wetumpka, Ala. (entry 2017)', values: { margin: 3, invalid: 8 } },
    ],
    sources: [{ label: 'Heritage Foundation' }, { label: 'Pabey v. Pastrick' }],
    note: undefined,
  },
};

/**
 * A dumbbell whose ends are dated differently in each row: the Attorney
 * General's earliest and latest estimate for each state.
 */
export const DumbbellWithEndLabels: Story = {
  args: {
    title: 'Black voter registration before the Voting Rights Act, three states, 1954–1965',
    description: "The Attorney General's estimates of the share of voting-age Black residents registered, at the earliest and latest year he gave for each state.",
    valueLabel: 'Black voting-age residents registered, %',
    categoryLabel: 'State',
    format: { unit: 'percent', decimals: 1 },
    style: 'dumbbell',
    series: [{ key: 'earlier', label: 'Earliest estimate' }, { key: 'latest', label: 'Latest estimate' }],
    items: [
      { label: 'Alabama', values: { earlier: 14.2, latest: 19.4 }, labels: { earlier: '1958', latest: '1964' } },
      { label: 'Louisiana', values: { earlier: 31.7, latest: 31.8 }, labels: { earlier: '1956', latest: '1965' } },
      { label: 'Mississippi', values: { earlier: 4.4, latest: 6.4 }, labels: { earlier: '1954', latest: '1964' } },
    ],
    sources: [{ label: 'US Department of Justice' }],
    note: undefined,
  },
};

/** A dumbbell of the counting hours: the line is the change between elections. */
export const DumbbellTwoElections: Story = { args: { style: 'dumbbell' } };
