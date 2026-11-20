'use client';

import { useState, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { ChoiceGroup } from './controls';

/**
 * An estimate chart that shows one group of rows at a time: the plots are
 * drawn on the server, one per group, and the dropdown picks which is shown.
 * The table, which lists every group, does not change.
 */
export function EstimateGroupSwitch({
  label,
  groupLabel,
  defaultGroup,
  graphs,
  table,
}: {
  label: string;
  /** Names the dropdown: "Compare". */
  groupLabel: string;
  defaultGroup: string;
  graphs: Array<{ group: string; graph: ReactNode }>;
  table: ReactNode;
}) {
  const [group, setGroup] = useState(defaultGroup);
  const shown = graphs.find(g => g.group === group) ?? graphs[0];
  return (
    <ChartViewToggle
      label={label}
      graph={shown.graph}
      table={table}
      controls={[{
        key: 'group',
        label: groupLabel,
        summary: shown.group,
        single: true,
        panel: <ChoiceGroup label={groupLabel} hideLabel choices={graphs.map(g => ({ value: g.group, label: g.group }))} value={shown.group} onChange={setGroup} />,
      }]}
    />
  );
}
