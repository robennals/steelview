import { z } from 'zod';
import { collectQuotes, quoteCorpus, quotedSomewhere } from './figures';

export const derivedFigureSchema = z.discriminatedUnion('method', [
  z.object({ method: z.literal('ratio-percent'), figure: z.string(), numerator: z.number(), denominator: z.number().positive(), decimals: z.number().int().min(0).max(4) }),
  z.object({ method: z.literal('complement-percent'), figure: z.string(), percent: z.number().min(0).max(100), decimals: z.number().int().min(0).max(4) }),
  z.object({ method: z.literal('series-mean'), figure: z.string(), reading: z.string(), line: z.string(), from: z.number().int(), to: z.number().int(), roundTo: z.number().positive() }),
]);

/** Accept a derived figure only after checking its arithmetic and its source inputs. */
export function verifiedDerivedFigures(data: Record<string, unknown>): string[] {
  const calculations = z.array(derivedFigureSchema).parse(data.derivedFigures ?? []);
  const corpus = quoteCorpus(collectQuotes(data));
  return calculations.map(c => {
    let result: number;
    if (c.method === 'ratio-percent') {
      if (![c.numerator, c.denominator].every(n => quotedSomewhere(String(n), corpus))) throw new Error(`Unquoted input for ${c.figure}`);
      result = Number((100 * c.numerator / c.denominator).toFixed(c.decimals));
    } else if (c.method === 'complement-percent') {
      if (!quotedSomewhere(`${c.percent}%`, corpus)) throw new Error(`Unquoted input for ${c.figure}`);
      result = Number((100 - c.percent).toFixed(c.decimals));
    } else {
      const series = data.series as { readings?: Array<{ id: string; lines: Array<{ name: string; points: Array<{ period: string; value: number }> }> }> } | undefined;
      const points = series?.readings?.find(r => r.id === c.reading)?.lines.find(l => l.name === c.line)?.points.filter(p => Number(p.period) >= c.from && Number(p.period) <= c.to);
      if (!points?.length || points.length !== c.to - c.from + 1 || new Set(points.map(p => p.period)).size !== points.length) throw new Error(`Incomplete annual series for ${c.figure}`);
      result = Math.round(points.reduce((n, p) => n + p.value, 0) / points.length / c.roundTo) * c.roundTo;
    }
    const expected = Number(c.figure.replace(/[,%]/g, ''));
    if (result !== expected || (c.method !== 'series-mean' && !c.figure.endsWith('%'))) throw new Error(`Incorrect calculation for ${c.figure}: got ${result}`);
    return c.figure;
  });
}
