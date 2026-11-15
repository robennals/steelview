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

/** A panel chart's sources row, which its More panel shows (see `ChartAbout`). */
export function usePanelSources(): ReactNode {
  return useContext(Slot);
}
