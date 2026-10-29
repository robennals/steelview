import type { Series } from '@/lib/content/types';

/**
 * Series fixtures for the SeriesChart capabilities the Iran reports need,
 * with values taken from `content/drafts/us-iran-war/candidate-data.md`.
 * Each is a short excerpt of the real series and its story says so; a value
 * the draft does not contain is in a fixture whose name ends ILLUSTRATIVE.
 * The source quotes name the draft rather than quoting the publisher, since
 * the publishers' pages were read through mirrors and not copied verbatim.
 */

const point = (period: string, value: number) => ({ period, value });

/**
 * Executions in Iran by year, two counters on one axis. IHRNGO 2020–2025
 * (267, 333, 582, 834, 975, 1,639; the draft marks 2023 unverified) and
 * Amnesty's Iran figure 2023–2025 (853, 972, 2,159). The counters differ for
 * 2025 by more than 500, which is why they are two lines and never one.
 */
export const EXECUTIONS_PER_LINE_COVERAGE: Series = {
  title: 'Executions recorded in Iran, by counter, 2020–2025',
  description: 'Executions each year as two organisations count them. IHRNGO counts only executions confirmed by two sources, so its figure is a minimum; Amnesty counts differently and is higher.',
  periodLabel: 'Year',
  coverage: { from: '2020', to: '2025' },
  breaks: [],
  events: [],
  source: {
    stance: 'supports',
    quote: 'Story fixture: annual counts as recorded in the Iran candidate-data draft (C50), from IHRNGO’s 2025 annual report and the World Coalition’s copies of earlier reports.',
    title: 'Annual Report on the Death Penalty in Iran 2025',
    url: 'https://iranhr.net/en/articles/8673/',
    publisher: 'Iran Human Rights',
    date: '2026-04-13',
  },
  readings: [
    {
      id: 'executions',
      label: 'Executions a year',
      unit: 'count',
      valueLabel: 'Executions recorded',
      lines: [
        { name: 'IHRNGO', points: [point('2020', 267), point('2021', 333), point('2022', 582), point('2023', 834), point('2024', 975), point('2025', 1639)] },
        { name: 'Amnesty International', coverage: { from: '2023', to: '2025' }, points: [point('2023', 853), point('2024', 972), point('2025', 2159)] },
      ],
    },
  ],
};
