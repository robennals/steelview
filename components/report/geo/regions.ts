import type { GeoRegion } from './types';

/**
 * Splits an outline set into the areas a dataset covers and the rest, drawn
 * as context. Pass the first as `regions` and the second as `contextRegions`:
 * a map of 31 European countries then shows its neighbours plainly instead
 * of hatching them as missing values.
 */
export function partitionRegions(all: GeoRegion[], coveredIds: Iterable<string>): { regions: GeoRegion[]; context: GeoRegion[] } {
  const covered = new Set(coveredIds);
  return {
    regions: all.filter(region => covered.has(region.id)),
    context: all.filter(region => !covered.has(region.id)),
  };
}
