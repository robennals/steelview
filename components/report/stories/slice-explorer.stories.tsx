import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SliceExplorer } from '../slice-explorer';
import { homeOfficeOccSource, industryRows, onsLtimSource, reasonRows } from './fixtures/data';

const reasonDimensions = [
  { key: 'reason', label: 'Reason', plural: 'reasons' },
  { key: 'year', label: 'Year', plural: 'years', values: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'] },
];

const meta = {
  title: 'Data/SliceExplorer',
  component: SliceExplorer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use when a report has a tidy table with two or more dimensions and a reader might reasonably want a different cut from the one the text uses. The reader picks what the bars are, filters the rest, and can split each bar by a second dimension. The status line always says what is shown and what has been added together. The default state is a complete bar chart, rendered on the server.',
      },
    },
  },
  args: {
    title: 'Why non-EU+ nationals moved to the UK',
    description: 'Long-term immigration of non-EU+ nationals by stated reason, year ending December. Includes dependants.',
    rows: reasonRows,
    dimensions: reasonDimensions,
    measures: [{ key: 'people', label: 'Long-term immigrants', format: { unit: 'count' } }],
    defaultBreakdown: 'reason',
    defaultFilters: { year: ['2025'] },
    sources: [onsLtimSource],
    note: 'Asylum is a reason for long-term immigration in this series, not a route of entry. EU+ and British arrivals are excluded.',
  },
} satisfies Meta<typeof SliceExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Reasons in the latest year — an ordinary ranked bar chart until the reader changes it. */
export const LatestYear: Story = {};

/** Years down the side, each bar stacked by reason: the 2021–23 surge and its make-up. */
export const SplitByReason: Story = {
  args: { defaultBreakdown: 'year', defaultSplit: 'reason', defaultFilters: {} },
};

/** The same split side by side, filtered to two reasons. */
export const GroupedAndFiltered: Story = {
  args: { defaultBreakdown: 'year', defaultSplit: 'reason', splitLayout: 'grouped', defaultFilters: { reason: ['Study', 'Work'] } },
};

/** Eight industries: with a low chip limit the industry filter becomes a select. No filter on year, so the status line says years are added together. The “Other industries” residual is pinned last rather than ranked. */
export const ManyValues: Story = {
  args: {
    title: 'Sponsored work visas by industry',
    description: 'Sponsored work entry-clearance grants, calendar years 2021–2025. An administrative measure, not the ONS immigration estimate.',
    rows: industryRows,
    dimensions: [
      { key: 'industry', label: 'Industry', plural: 'industries', last: ['Other industries'] },
      { key: 'year', label: 'Year', plural: 'years', values: ['2021', '2022', '2023', '2024', '2025'] },
    ],
    measures: [{ key: 'grants', label: 'Entry-clearance grants', format: { unit: 'count' } }],
    defaultBreakdown: 'industry',
    defaultFilters: {},
    chipLimit: 6,
    sources: [homeOfficeOccSource],
    note: 'Health and social work includes healthcare and social-care employers; it is not a count of care occupations alone.',
  },
};
