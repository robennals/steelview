import 'react';

// Custom properties the components set inline. React's CSSProperties has no
// entry for arbitrary `--*` names, so each one is declared here rather than
// cast past at the call site.
declare module 'react' {
  interface CSSProperties {
    /** Number of positions in a crux; `.sv-positions` sizes its grid from it. */
    '--sv-position-count'?: number;

    // Fact-report library (components/report).
    /** Bar rows: label and value column widths, and the number of bars in a grouped row. */
    '--sv-bars-label'?: string;
    '--sv-bars-value'?: string;
    '--sv-bars-count'?: number;
    /** Event strip: plot insets that line it up with the chart above, and marker stacking. */
    '--sv-strip-left'?: string;
    '--sv-strip-right'?: string;
    '--sv-strip-left-narrow'?: string;
    '--sv-strip-right-narrow'?: string;
    '--sv-strip-left-wide'?: string;
    '--sv-strip-right-wide'?: string;
    '--sv-strip-levels'?: number;
    '--sv-strip-level'?: number;
    /** Period timeline: the category colour of a span or legend swatch. */
    '--sv-period-color'?: string;
    /** Timeline: the category colour of an event marker. */
    '--sv-timeline-color'?: string;
    /** Tile map: grid dimensions. */
    '--sv-tile-cols'?: number;
    '--sv-tile-rows'?: number;
    /** Map legend: number of colour steps. */
    '--sv-steps'?: number;
  }
}
