import type { ScatterPoint } from '../../scatter-plot';
import type { SourceCredit } from '../../types';

/**
 * ILLUSTRATIVE x values. Hours to count 95% of the vote in the 2024 general
 * election are from MIT Election Lab, "How long did it take to count the vote
 * in 2024?" (D22 in the vote-by-mail draft): AZ 147, NV 51, PA 8, GA 5,
 * NC 6. Days before Election Day that mail-ballot processing may begin are
 * placeholders until NCSL Table 16 is read — they are not the states' rules.
 * Groups: AZ and NV vote mostly by mail.
 */
export const MAIL_COUNT_SPEED_ILLUSTRATIVE: ScatterPoint[] = [
  { id: 'az', label: 'AZ', name: 'Arizona', x: 14, y: 147, group: 'mostly-mail', note: '73 hours in 2020.' },
  { id: 'nv', label: 'NV', name: 'Nevada', x: 15, y: 51, group: 'mostly-mail', note: '159 hours in 2020.' },
  { id: 'pa', label: 'PA', name: 'Pennsylvania', x: 0, y: 8, group: 'mostly-in-person', note: '49 hours in 2020.' },
  { id: 'ga', label: 'GA', name: 'Georgia', x: 21, y: 5, group: 'mostly-in-person' },
  { id: 'nc', label: 'NC', name: 'North Carolina', x: 35, y: 6, group: 'mostly-in-person' },
];

export const MAIL_COUNT_SPEED_GROUPS = [
  { id: 'mostly-mail', label: 'Mostly mail' },
  { id: 'mostly-in-person', label: 'Mostly in person' },
];

export const MAIL_COUNT_SPEED_SOURCES: SourceCredit[] = [
  { label: 'MIT Election Data and Science Lab (hours to count)', href: 'https://electionlab.mit.edu/articles/how-long-did-it-take-count-vote-2024' },
  { label: 'Illustrative (processing start)' },
];
