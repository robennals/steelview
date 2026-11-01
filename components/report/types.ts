/**
 * Shapes shared by every fact-report component.
 *
 * Components take plain data, not content-model types such as `Fact`, so the
 * same component can be fed from frontmatter, a derived calculation, or a
 * story fixture. The adapter from content to props lives with the page.
 */

import type { PreviewFit } from '@/lib/chart/series-chart';

/**
 * A date as precise as the source is: "2024", "2024-11" or "2024-11-28".
 * Same convention as the content schema, so a period copied out of a source
 * table never has to be invented down to the day.
 */
export type PartialDate = string;

/**
 * A pointer to the source behind a figure. On a fact page `href` is the
 * in-page anchor of the numbered reference (`#source-<fact>-<n>`), which
 * carries the quote; elsewhere it can be the publisher's URL.
 */
export type SourceCredit = {
  /** What the reader sees: usually the publisher, e.g. "ONS". */
  label: string;
  href?: string;
  /** The reference number on a fact page, rendered as "[n]" after the label. */
  number?: number;
};

/**
 * A figure drawn as a compact preview, as on a home-page carousel slide: its
 * title, linked to the full figure on `href` (the fact's page), and the graph
 * alone. The description, controls, Table view, keys that explain method,
 * source line, Observations and "About this data" all stay on the full
 * figure, a click away. Never a subset of the data: every item, area, event
 * and the full range are still drawn, clamped to fit when there are many.
 */
export type FigurePreview = {
  /** Where the title leads, if anywhere. */
  href?: string;
  /** The shape of the space it sits in, for a figure drawn at set shapes (default: wide, as a carousel slide is). */
  fit?: PreviewFit;
};

/**
 * How a number is written. `count` is people or things (1,441,000),
 * `percent` takes values in percentage points (2.1 means 2.1%), `currency`
 * prefixes the symbol of the given ISO 4217 code (£, $, €), and `number` is a
 * bare figure such as an index or a ratio.
 */
export type ValueUnit = 'count' | 'percent' | 'currency' | 'number';

type FormatOptions = {
  /** Maximum decimal places. Defaults: 0 for count/currency, 1 for percent, 2 for number. */
  decimals?: number;
  /** Always show exactly `decimals` places, so a table column lines up ("16.0" beside "26.9"). */
  fixed?: boolean;
  /**
   * Write large values as 1.4m / 820k / £2.3bn. `decimals`, when given, is
   * kept at any magnitude ($43.6bn); otherwise one place under ten, none above.
   */
  compact?: boolean;
  /** Prefix positive values with "+" — for changes, never for levels. */
  signed?: boolean;
};

/** A currency has no sensible default — a report about any country names its own. */
export type ValueFormat = FormatOptions & (
  | { unit?: Exclude<ValueUnit, 'currency'>; currency?: never }
  | { unit: 'currency'; /** ISO 4217 code, e.g. "GBP", "USD", "EUR". */ currency: string }
);
