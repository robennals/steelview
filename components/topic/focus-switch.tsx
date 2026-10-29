'use client';

import { useState, type ReactNode } from 'react';
import { ChoiceGroup } from '@/components/report';

/**
 * Switches a focus-window chart between its window and its full range. Both
 * plots are in the server-rendered markup; the switch only toggles `hidden`.
 * Without JavaScript the window shows, and the context strip above it and
 * the table still carry the full range.
 */
export function FocusSwitch({
  label,
  windowLabel,
  windowView,
  fullView,
}: {
  /** Names the group for assistive technology: "Brent crude oil — period shown". */
  label: string;
  /** The window's own name, from the series' `focus.label`. */
  windowLabel: string;
  windowView: ReactNode;
  fullView: ReactNode;
}) {
  const [view, setView] = useState<'window' | 'full'>('window');
  return (
    <div className="sv-chart__focus">
      <ChoiceGroup
        label={label}
        hideLabel
        choices={[{ value: 'window', label: windowLabel }, { value: 'full', label: 'Full range' }]}
        value={view}
        onChange={setView}
      />
      <div data-focus-view="window" hidden={view !== 'window'}>{windowView}</div>
      <div data-focus-view="full" hidden={view !== 'full'}>{fullView}</div>
    </div>
  );
}
