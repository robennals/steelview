import { z } from 'zod';
import { collectQuotes, quoteCorpus, quotedSomewhere } from './figures';

export const derivedFigureSchema = z.discriminatedUnion('method', [
  z.object({ method: z.literal('ratio-percent'), figure: z.string(), numerator: z.number(), denominator: z.number().positive(), decimals: z.number().int().min(0).max(4) }),
  z.object({ method: z.literal('complement-percent'), figure: z.string(), percent: z.number().min(0).max(100), decimals: z.number().int().min(0).max(4) }),
  z.object({ method: z.literal('series-mean'), figure: z.string(), reading: z.string(), line: z.string(), from: z.number().int(), to: z.number().int(), roundTo: z.number().positive() }),
]);

/** A derived figure whose inputs are not all in the item's quotes, and the inputs that are missing. */
export type UnquotedDerivation = { figure: string; inputs: string[] };

/**
 * Check every derived figure's arithmetic and source inputs. A figure whose
 * input is not quoted is returned in `unquoted` for check:figures to report
 * — one unsourced input must not stop the whole audit — and is left out of
 * `verified`, so prose leaning on it is unmatched too. A wrong calculation or
 * an incomplete series is an authoring error in the derivation itself and
 * still throws.
 */
export function checkDerivedFigures(data: Record<string, unknown>): { verified: string[]; unquoted: UnquotedDerivation[] } {
  const calculations = z.array(derivedFigureSchema).parse(data.derivedFigures ?? []);
  const corpus = quoteCorpus(collectQuotes(data));
  const verified: string[] = [];
  const unquoted: UnquotedDerivation[] = [];
  for (const c of calculations) {
    let result: number;
    if (c.method === 'ratio-percent') {
      const missing = [c.numerator, c.denominator].map(String).filter(n => !quotedSomewhere(n, corpus));
      if (missing.length) {
        unquoted.push({ figure: c.figure, inputs: missing });
        continue;
      }
      result = Number((100 * c.numerator / c.denominator).toFixed(c.decimals));
    } else if (c.method === 'complement-percent') {
      if (!quotedSomewhere(`${c.percent}%`, corpus)) {
        unquoted.push({ figure: c.figure, inputs: [`${c.percent}%`] });
        continue;
      }
      result = Number((100 - c.percent).toFixed(c.decimals));
    } else {
      const series = data.series as { readings?: Array<{ id: string; lines: Array<{ name: string; points: Array<{ period: string; value: number }> }> }> } | undefined;
      const points = series?.readings?.find(r => r.id === c.reading)?.lines.find(l => l.name === c.line)?.points.filter(p => Number(p.period) >= c.from && Number(p.period) <= c.to);
      if (!points?.length || points.length !== c.to - c.from + 1 || new Set(points.map(p => p.period)).size !== points.length) throw new Error(`Incomplete annual series for ${c.figure}`);
      result = Math.round(points.reduce((n, p) => n + p.value, 0) / points.length / c.roundTo) * c.roundTo;
    }
    const expected = Number(c.figure.replace(/[,%]/g, ''));
    if (result !== expected || (c.method !== 'series-mean' && !c.figure.endsWith('%'))) throw new Error(`Incorrect calculation for ${c.figure}: got ${result}`);
    verified.push(c.figure);
  }
  return { verified, unquoted };
}

/** The derived figures that pass: arithmetic checked, every input quoted. */
export function verifiedDerivedFigures(data: Record<string, unknown>): string[] {
  return checkDerivedFigures(data).verified;
}
