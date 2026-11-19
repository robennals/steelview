import type { SourceCredit, SourcePassage } from '@/components/report/types';
import type { Source } from './types';

/**
 * The words around a quote, from the source it was copied out of.
 *
 * A quote on the page is often a few words ("under the rubble"). Every
 * source carries the passage those words were copied from, verbatim, so the
 * fuller sentence can be shown beside the quote, its quoted words marked:
 * the reader sees what was said around them without leaving the figure.
 * Matching follows the verbatim check (rule F11): case, curly quotes and
 * spacing are ignored, and "…" in a quote separates fragments found
 * separately.
 */

/** A passage aims for at least this many characters, adding whole sentences until it does. */
const MIN_PASSAGE = 200;
/** And stops adding sentences past this; a single sentence longer than this is cut around the quoted words. */
const MAX_PASSAGE = 600;
/** Around the quoted words, a cut sentence keeps this many characters each side. */
const CUT_CONTEXT = 220;
/** A passage is widened until it adds at least this many characters to the quote, if the source has them. */
const MIN_ADDED = 25;
/** Fragments shorter than this are too short to place, as in F11. */
const MIN_FRAGMENT = 4;

/** Text compared as F11 compares it, and for each compared character the index it came from. */
export function normaliseWithOffsets(text: string): { text: string; offsets: number[] } {
  let out = '';
  const offsets: number[] = [];
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (/\s/.test(ch)) {
      if (out === '' || out.endsWith(' ')) continue;
      ch = ' ';
    } else if (/[‘’‚′]/.test(ch)) ch = "'";
    else if (/[“”„″]/.test(ch)) ch = '"';
    for (const lower of ch.toLowerCase()) {
      out += lower;
      offsets.push(i);
    }
  }
  if (out.endsWith(' ')) {
    out = out.slice(0, -1);
    offsets.pop();
  }
  return { text: out, offsets };
}

type Range = { start: number; end: number };

/** Where each fragment of `phrase` sits in `source`, in order, or nothing if any fragment is missing. */
function locate(phrase: string, source: string): Range[] | undefined {
  const normalised = normaliseWithOffsets(source);
  const fragments = phrase.split(/…|\.\.\./).map(f => normaliseWithOffsets(f).text).filter(f => f.length >= MIN_FRAGMENT);
  if (fragments.length === 0) return undefined;
  const ranges: Range[] = [];
  let from = 0;
  for (const fragment of fragments) {
    const at = normalised.text.indexOf(fragment, from);
    if (at < 0) return undefined;
    ranges.push({ start: normalised.offsets[at], end: normalised.offsets[at + fragment.length - 1] + 1 });
    from = at + fragment.length;
  }
  return ranges;
}

const ABBREVIATION = /(?:^|\s)(?:Mr|Mrs|Ms|Dr|Gen|Sen|Rep|Gov|Lt|Col|Sgt|St|No|Vol|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|U\.S|U\.K|e\.g|i\.e|vs|[A-Z])\.$/;

/**
 * The source's quote as runs of sentences. A sentence ends at ".", "!" or
 * "?" (and any closing quote or bracket) before a space and a capital or
 * opening quote. An omission mark in the source's quote ends a run: the
 * words either side of it were not next to each other in the original.
 */
function sentenceRuns(text: string): Range[][] {
  const runs: Range[][] = [];
  const omission = /\s*(?:…|\.\.\.)\s*/g;
  let runStart = 0;
  for (const m of [...text.matchAll(omission), { index: text.length, 0: '' }]) {
    const runEnd = m.index ?? text.length;
    const run = text.slice(runStart, runEnd);
    const sentences: Range[] = [];
    let start = 0;
    for (const end of run.matchAll(/[.!?]["”’')\]]*(?=\s+["“‘(\[]?[A-Z0-9])/g)) {
      const stop = (end.index ?? 0) + end[0].length;
      if (ABBREVIATION.test(run.slice(Math.max(0, stop - 6), stop))) continue;
      sentences.push({ start: runStart + start, end: runStart + stop });
      start = stop + (run.slice(stop).length - run.slice(stop).trimStart().length);
    }
    if (start < run.trimEnd().length) sentences.push({ start: runStart + start, end: runStart + run.trimEnd().length });
    if (sentences.length > 0) runs.push(sentences);
    runStart = runEnd + m[0].length;
  }
  return runs;
}

/**
 * The stretch of `text` to show around `ranges`: whole sentences, widened
 * until the passage is a fair length and says something the quote does not.
 * It widens within the run between omission marks first, the next sentence
 * before the one before, so the reader sees what the words led to; only a
 * quote with nothing around it in its own run reaches across an omission
 * mark, which stays in the passage. A sentence too long to show whole is cut
 * around the quoted words.
 */
function passageSpan(text: string, ranges: Range[]): Range | undefined {
  const first = ranges[0].start;
  const last = ranges[ranges.length - 1].end;
  const sentences = sentenceRuns(text).flatMap((run, r) => run.map(s => ({ ...s, run: r })));
  let lo = sentences.findIndex(s => s.end > first);
  let hi = sentences.findIndex(s => s.end >= last);
  if (lo < 0 || hi < 0) return undefined;
  const quoted = ranges.reduce((n, r) => n + r.end - r.start, 0);
  const length = (a: number, b: number) => sentences[b].end - sentences[a].start;
  const fits = (a: number, b: number) => length(a, b) <= MAX_PASSAGE;
  const sameRun = (a: number, b: number) => sentences[a].run === sentences[b].run;
  const short = () => length(lo, hi) < MIN_PASSAGE;
  const bare = () => length(lo, hi) - quoted < MIN_ADDED;
  while (short() || bare()) {
    if (hi + 1 < sentences.length && sameRun(hi, hi + 1) && fits(lo, hi + 1)) hi++;
    else if (lo > 0 && sameRun(lo - 1, lo) && fits(lo - 1, hi)) lo--;
    else if (!bare()) break;
    else if (hi + 1 < sentences.length && fits(lo, hi + 1)) hi++;
    else if (lo > 0 && fits(lo - 1, hi)) lo--;
    else break;
  }
  const start = sentences[lo].start;
  const end = sentences[hi].end;
  if (end - start <= MAX_PASSAGE) return { start, end };
  return { start: Math.max(start, wordStart(text, first - CUT_CONTEXT)), end: Math.min(end, wordEnd(text, last + CUT_CONTEXT)) };
}

function wordStart(text: string, at: number): number {
  const space = text.indexOf(' ', Math.max(0, at));
  return at <= 0 || space < 0 ? Math.max(0, at) : space + 1;
}

function wordEnd(text: string, at: number): number {
  const space = text.lastIndexOf(' ', at);
  return at >= text.length || space < 0 ? Math.min(text.length, at) : space;
}

/** The passage cut into plain and quoted parts, with "…" where it starts or stops mid-sentence. */
function parts(text: string, span: Range, ranges: Range[]): SourcePassage['parts'] {
  const out: SourcePassage['parts'] = [];
  const passage = text.slice(span.start, span.end);
  if (/^[a-z,;:]/.test(passage) || /[a-z,]$/i.test(text.slice(0, span.start).trimEnd())) out.push({ text: '…' });
  let at = span.start;
  for (const range of ranges) {
    if (range.start > at) out.push({ text: text.slice(at, range.start) });
    out.push({ text: text.slice(range.start, range.end), quoted: true });
    at = range.end;
  }
  if (span.end > at) out.push({ text: text.slice(at, span.end) });
  if (!/[.!?]["”’')\]]*$/.test(passage)) out.push({ text: '…' });
  return out.map(p => ({ ...p, text: p.text.replace(/\s+/g, ' ') }));
}

/**
 * For each phrase, the passage of the first cited source that holds it,
 * phrases falling in the same passage shown as one. A phrase no cited source
 * holds, or whose source holds no words but the quote's, gets none.
 */
export function sourcePassages(phrases: string[], citations: number[], sources: Source[], credit: (n: number) => SourceCredit): SourcePassage[] {
  const found: Array<{ n: number; text: string; ranges: Range[]; span: Range }> = [];
  for (const phrase of phrases) {
    for (const n of citations) {
      const source = sources[n - 1];
      if (!source) continue;
      const text = source.quote.normalize('NFC');
      const ranges = locate(phrase, text);
      const span = ranges && passageSpan(text, ranges);
      if (!ranges || !span) continue;
      const same = found.find(f => f.n === n && f.span.start < span.end && span.start < f.span.end);
      if (same) {
        same.span = { start: Math.min(same.span.start, span.start), end: Math.max(same.span.end, span.end) };
        same.ranges = mergeRanges([...same.ranges, ...ranges]);
      } else {
        found.push({ n, text, ranges, span });
      }
      break;
    }
  }
  return found
    .map(f => ({ source: credit(f.n), parts: parts(f.text, f.span, f.ranges) }))
    .filter(p => p.parts.some(part => !part.quoted && /\w/.test(part.text)));
}

function mergeRanges(ranges: Range[]): Range[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out: Range[] = [];
  for (const r of sorted) {
    const prev = out[out.length - 1];
    if (prev && r.start <= prev.end) prev.end = Math.max(prev.end, r.end);
    else out.push({ ...r });
  }
  return out;
}

/** The phrases a line of text quotes: the words between double quotation marks, straight or curly. */
export function quotedPhrases(...texts: Array<string | undefined>): string[] {
  return texts.flatMap(text => [...(text ?? '').matchAll(/"([^"]+)"|“([^”]+)”/g)].map(m => m[1] ?? m[2]));
}
