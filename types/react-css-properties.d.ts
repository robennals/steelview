import 'react';

// Custom properties the components set inline. React's CSSProperties has no
// entry for arbitrary `--*` names, so each one is declared here rather than
// cast past at the call site.
declare module 'react' {
  interface CSSProperties {
    /** Number of positions in a crux; `.sv-positions` sizes its grid from it. */
    '--sv-position-count'?: number;
  }
}
