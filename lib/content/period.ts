/**
 * Periods on this page are partial dates — `1964`, `2021-06`, `2021-06-30` —
 * because that is the precision the sources publish at. Comparing and placing
 * them therefore needs two different answers, and they are not the same
 * function:
 *
 * - **ordering** must treat `1964` and `1964-01` as the same instant, so a
 *   series that mixes granularity still sorts the way a reader would sort it;
 * - **placement** on a time axis needs a real number, so a break annotated at
 *   `2021-06` lands halfway through 2021 rather than on its 1 January.
 *
 * Both live here rather than in the chart, because validate.ts checks
 * ordering and coverage and must agree with what the chart draws.
 */

/** Pad a partial date to `YYYY-MM-DD`, so plain string comparison orders them. */
export function normalizePeriod(period: string): string {
  const [year, month = '01', day = '01'] = period.split('-');
  return `${year}-${month}-${day}`;
}

/** `< 0`, `0`, `> 0` — the usual comparator contract, over partial dates. */
export function comparePeriods(a: string, b: string): number {
  const na = normalizePeriod(a);
  const nb = normalizePeriod(b);
  return na < nb ? -1 : na > nb ? 1 : 0;
}

/**
 * A period as a fractional year, for positioning on the time axis. `1964` is
 * 1964.0; `2021-06` is 2021 + 5/12, which is where a mid-2021 methodology
 * break actually belongs.
 */
export function periodToYear(period: string): number {
  const [year, month, day] = normalizePeriod(period).split('-').map(Number);
  return year + (month - 1) / 12 + (day - 1) / 372;
}

/** The year a period falls in — what the time axis labels. */
export function periodYear(period: string): number {
  return Number(normalizePeriod(period).slice(0, 4));
}
