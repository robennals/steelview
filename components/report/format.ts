import type { PartialDate, ValueFormat } from './types';

const MINUS = '−';

const DEFAULT_DECIMALS = { count: 0, currency: 0, percent: 1, number: 2 } as const;

/** "£" for GBP, "$" for USD, "€" for EUR: the narrow symbol, as prose writes it. */
function currencySymbol(code: string): string {
  const parts = new Intl.NumberFormat('en-GB', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
  return parts.find(part => part.type === 'currency')?.value ?? code;
}

const COMPACT_STEPS = [
  { at: 1e9, suffix: 'bn' },
  { at: 1e6, suffix: 'm' },
  { at: 1e3, suffix: 'k' },
] as const;

/**
 * One number, written the way every report writes it: en-GB grouping, a true
 * minus sign, the unit attached. Kept in one place so a figure reads the same
 * in a bar label, a table cell and a map tooltip.
 */
export function formatValue(value: number, format: ValueFormat = {}): string {
  const unit = format.unit ?? 'count';
  const decimals = format.decimals ?? DEFAULT_DECIMALS[unit];
  const magnitude = Math.abs(value);

  let body: string;
  const step = format.compact ? COMPACT_STEPS.find(s => magnitude >= s.at) : undefined;
  if (step) {
    body = `${(magnitude / step.at).toLocaleString('en-GB', { maximumFractionDigits: magnitude / step.at < 10 ? 1 : 0 })}${step.suffix}`;
  } else {
    body = magnitude.toLocaleString('en-GB', { maximumFractionDigits: decimals, minimumFractionDigits: format.fixed ? decimals : 0 });
  }

  if (format.unit === 'currency') body = `${currencySymbol(format.currency)}${body}`;
  if (unit === 'percent') body = `${body}%`;

  if (value < 0 && body.replace(/[^1-9]/g, '') !== '') return `${MINUS}${body}`;
  if (format.signed && value > 0) return `+${body}`;
  return body;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2024" → "2024", "2024-11" → "Nov 2024", "2024-11-28" → "28 Nov 2024". */
export function formatDate(date: PartialDate): string {
  const [year, month, day] = date.split('-');
  if (!month) return year;
  const name = MONTHS[Number(month) - 1];
  return day ? `${Number(day)} ${name} ${year}` : `${name} ${year}`;
}

/**
 * Placing and ordering partial dates is the content model's job, so the
 * report components use the same functions validate.ts does: a timeline and
 * a series chart can never disagree about where "2021-06" falls.
 */
export { periodToYear as dateToYear, comparePeriods as compareDates } from '@/lib/content/period';

/** A stable, DOM-safe id fragment from free text. */
export function slugify(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * "10 states", "1 country", "3 regions": a count with a table heading such as
 * "State" or "Country" as its noun, lower-cased. Regular English plurals only
 * — the headings a report uses for places and points are regular.
 */
export function countOf(count: number, noun: string): string {
  const word = noun.toLowerCase();
  if (count === 1) return `${count} ${word}`;
  if (/[^aeiou]y$/.test(word)) return `${count} ${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${count} ${word}es`;
  return `${count} ${word}s`;
}
