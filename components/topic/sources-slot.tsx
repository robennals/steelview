'use client';

import { createContext, useContext, type ReactNode } from 'react';

const Slot = createContext<ReactNode>(null);

/**
 * Hands a chart its sources row, drawn on the server by whoever knows what the
 * chart's slide cites, without every kind of figure passing it along.
 */
export function SourcesSlot({ row, children }: { row: ReactNode; children: ReactNode }) {
  return <Slot.Provider value={row}>{children}</Slot.Provider>;
}

/** Where a panel chart's sources row sits: at its foot. */
export function PanelSources() {
  return useContext(Slot);
}
