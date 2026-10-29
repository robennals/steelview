/**
 * The fact-report component library. Import from here:
 *
 *   import { ReportFigure, BarChart, Timeline } from '@/components/report';
 *
 * Each component is demonstrated in Storybook (`pnpm storybook`), grouped by
 * family in the same order as below.
 */

// Foundations
export * from './types';
export { formatValue, formatDate, dateToYear, compareDates } from './format';
export { ReportFigure, SourceCredits, SourceLine } from './figure';
export { ChoiceGroup, FilterChips, type Choice } from './controls';

// Data
export * from './key-figures';
export * from './bar-chart';
export * from './slice-explorer';
export * from './composition-bar';
export * from './small-multiples';
export * from './estimate-range';
export * from './data-table';

// Maps
export * from './geo-map';
export * from './tile-map';
export type { GeoRegion, LonLat } from './geo/types';
export type { Bounds, ProjectionKind } from './geo/project';
export { partitionRegions } from './geo/regions';
export { WORLD_COUNTRIES } from './geo/world-countries';
export { EUROPE_COUNTRIES, EUROPE_EXTENT } from './geo/europe-countries';
export { UK_ITL1_REGIONS } from './geo/uk-itl1';
export { EUROPE_COUNTRY_TILES, US_STATE_TILES, UK_REGION_TILES, type MapTile } from './geo/tiles';

// Timelines
export * from './timeline';
export * from './period-timeline';
export * from './event-strip';

// Quotes
export type { Quote } from './quote-attribution';
export * from './quote-browser';
export * from './pull-quote';
export * from './quote-comparison';

// Claims
export * from './claim-check';
export * from './caveat-list';
