import type { FactStatus } from '@/lib/content/types';

const LABELS: Record<FactStatus, string> = {
  'well-supported': 'Well supported',
  contested: 'Contested',
  'not-supported': 'Not supported',
  complicated: 'Complicated',
  unknown: 'Unknown',
};

/**
 * Status must never be carried by colour alone — a reader with any form of
 * colour blindness, or reading a printout, must get the same information. The
 * text label is the primary channel; Task 10 adds a second, non-colour visual
 * channel on top of it.
 */
export function StatusBadge({ status }: { status: FactStatus }) {
  return <span data-status={status}>{LABELS[status]}</span>;
}
