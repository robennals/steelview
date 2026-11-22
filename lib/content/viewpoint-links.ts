import { createHash } from 'node:crypto';
import { z } from 'zod';

/**
 * A viewpoint is two files. `<id>.md` is its text: plain prose an editor can
 * own, with no links in it. `<id>.links.yaml` is the agent's: which phrase of
 * the text cites which data, which chart each card shows, and whether the
 * agent has checked each passage against the evidence. The loader joins them
 * into the linked markdown the rest of the site reads.
 */

/** One citation: the `occurrence`th appearance of `phrase` in its passage links to `href`. */
export const citationSchema = z.object({
  phrase: z.string().min(1),
  href: z.string().regex(/^#\S+$/),
  /** Which appearance of the phrase, counting every one in the passage; the first when absent. */
  occurrence: z.number().int().min(2).optional(),
});

export const VERIFICATION_STATUSES = ['unverified', 'verified', 'problems'] as const;

/**
 * Whether the agent has checked a passage's claims against what it cites. A
 * check holds for the text it was made on: `textHash` is that text's
 * `passageHash`, so any edit to the passage makes the check stale.
 */
export const verificationSchema = z.object({
  status: z.enum(VERIFICATION_STATUSES),
  textHash: z.string().optional(),
  checkedAt: z.string().optional(),
  /** What the agent found, addressed to the editor, who decides what to do with each. */
  notes: z.array(z.string().min(1)).optional(),
});

const passageFields = {
  citations: z.array(citationSchema).default([]),
  verification: verificationSchema.default({ status: 'unverified' }),
};

/**
 * The graph or quotes a card is made with, named by a citation target. `kind`
 * and `title` say what that is to a reader of this file, and are checked
 * against the chart the target resolves to.
 */
export const cardVisualSchema = z.object({
  cite: z.string().regex(/^#fact-[a-z0-9-]+\/[a-z0-9-]+$/),
  kind: z.string().min(1),
  title: z.string().min(1),
});

export const viewpointLinksSchema = z.object({
  summary: z.object(passageFields).default({ citations: [], verification: { status: 'unverified' } }),
  lead: z.object(passageFields).default({ citations: [], verification: { status: 'unverified' } }),
  cards: z.array(z.object({ heading: z.string().min(1), visual: cardVisualSchema.optional(), ...passageFields })).default([]),
  /**
   * Every claim the text needs data for and no report has yet, cited as
   * `#needed`. Readers see those claims as plain prose; this is the research
   * queue, kept in step with the `#needed` citations by `pnpm check:integrity`.
   */
  researchNeeded: z.array(z.string().min(1)).optional(),
});

export type Citation = z.infer<typeof citationSchema>;
export type Verification = z.infer<typeof verificationSchema>;
export type CardVisualRef = z.infer<typeof cardVisualSchema>;
export type ViewpointLinks = z.infer<typeof viewpointLinksSchema>;

/** A short hash of a passage's text, which a verification is recorded against. */
export function passageHash(text: string): string {
  return createHash('sha256').update(text.trim()).digest('hex').slice(0, 12);
}

/** A viewpoint body's passages: the lead, then each `###` card's heading and the text under it. */
export type Passages = { lead: string; cards: Array<{ heading: string; text: string }> };

/**
 * Split a body at its `###` headings. Each card's `text` is everything after
 * its heading line, whitespace included, so `joinPassages` rebuilds the body
 * exactly.
 */
export function splitPassages(body: string): Passages {
  const [lead, ...chunks] = body.split(/^(?=### )/m);
  return {
    lead,
    cards: chunks.map((chunk) => {
      const newline = chunk.indexOf('\n');
      const line = newline === -1 ? chunk : chunk.slice(0, newline);
      return { heading: line.slice('### '.length).trim(), text: newline === -1 ? '' : chunk.slice(newline) };
    }),
  };
}

export function joinPassages({ lead, cards }: Passages): string {
  return lead + cards.map(({ heading, text }) => `### ${heading}${text}`).join('');
}

/** The text a card's verification is recorded against: its heading and its text. */
export function cardText(card: { heading: string; text: string }): string {
  return `${card.heading}\n${card.text.trim()}`;
}

const LINK = /\[([^\]]+)\]\((#[^)\s]+)\)/g;

/** Take the links out of a passage: its plain text, and each link as a citation. */
export function unlinkify(linked: string): { text: string; citations: Citation[] } {
  let text = '';
  let last = 0;
  const found: Array<{ phrase: string; href: string; at: number }> = [];
  for (const match of linked.matchAll(LINK)) {
    text += linked.slice(last, match.index);
    found.push({ phrase: match[1], href: match[2], at: text.length });
    text += match[1];
    last = match.index + match[0].length;
  }
  text += linked.slice(last);
  const citations = found.map(({ phrase, href, at }) => {
    const occurrence = occurrencesOf(text, phrase).indexOf(at) + 1;
    return occurrence > 1 ? { phrase, href, occurrence } : { phrase, href };
  });
  return { text, citations };
}

/** Every index at which `phrase` starts in `text`, overlapping ones included. */
function occurrencesOf(text: string, phrase: string): number[] {
  const at: number[] = [];
  for (let i = text.indexOf(phrase); i !== -1; i = text.indexOf(phrase, i + 1)) at.push(i);
  return at;
}

/**
 * Put a passage's citations back into its text as links. A citation whose
 * phrase the text no longer holds, or which overlaps another, is left out
 * and reported, so an edit the agent has not caught up with renders as plain
 * prose rather than failing.
 */
export function linkify(text: string, citations: Citation[]): { linked: string; errors: string[] } {
  const errors: string[] = [];
  const spans: Array<{ start: number; end: number; href: string }> = [];
  for (const { phrase, href, occurrence = 1 } of citations) {
    const start = occurrencesOf(text, phrase)[occurrence - 1];
    if (start === undefined) {
      errors.push(`cites "${phrase}"${occurrence > 1 ? ` (appearance ${occurrence})` : ''}, which the text does not contain`);
      continue;
    }
    const end = start + phrase.length;
    if (spans.some((s) => start < s.end && s.start < end)) {
      errors.push(`cites "${phrase}", which overlaps another citation`);
      continue;
    }
    spans.push({ start, end, href });
  }
  let linked = text;
  for (const { start, end, href } of [...spans].sort((a, b) => b.start - a.start)) {
    linked = `${linked.slice(0, start)}[${linked.slice(start, end)}](${href})${linked.slice(end)}`;
  }
  return { linked, errors };
}

/** Why a passage is not yet ready to publish, or nothing when the agent has checked it as it stands. */
export function verificationProblem(verification: Verification, text: string): string | undefined {
  if (verification.status === 'unverified') return 'has not been checked against its evidence';
  if (verification.textHash !== passageHash(text)) return 'has changed since it was checked against its evidence';
  if (verification.status === 'problems') return `was checked, with problems: ${(verification.notes ?? []).join(' / ') || '(no notes)'}`;
  return undefined;
}

export type JoinedViewpoint = {
  body: string;
  summary: string;
  /** Each card's visual, by heading, where the links file names one. */
  visuals: Map<string, CardVisualRef>;
  /** Text and links that do not line up: a cited phrase gone, a card with no entry. */
  linkErrors: string[];
  /** Passages not yet verified as they stand, each with why. */
  unverified: string[];
};

/** Join a viewpoint's plain text and summary with its links file. */
export function joinViewpoint(text: string, summary: string, links: ViewpointLinks): JoinedViewpoint {
  const linkErrors: string[] = [];
  const unverified: string[] = [];
  /** Link one passage's text, noting what does not line up and whether its check still holds for `checkedText`. */
  const linkPassage = (where: string, passage: { citations: Citation[]; verification: Verification }, plain: string, checkedText = plain) => {
    const { linked, errors } = linkify(plain, passage.citations);
    linkErrors.push(...errors.map((e) => `${where} ${e}`));
    const problem = verificationProblem(passage.verification, checkedText);
    if (problem) unverified.push(`${where} ${problem}`);
    return linked;
  };

  const passages = splitPassages(text);
  const linkedSummary = linkPassage('the summary', links.summary, summary);
  const lead = linkPassage('the lead', links.lead, passages.lead);
  const entries = new Map(links.cards.map((card) => [card.heading, card]));
  const visuals = new Map<string, CardVisualRef>();
  const cards = passages.cards.map((card) => {
    const entry = entries.get(card.heading);
    entries.delete(card.heading);
    if (!entry) {
      linkErrors.push(`card "${card.heading}" has no entry in the links file`);
      unverified.push(`card "${card.heading}" has not been checked against its evidence`);
      return card;
    }
    if (entry.visual) visuals.set(card.heading, entry.visual);
    return { heading: card.heading, text: linkPassage(`card "${card.heading}"`, entry, card.text, cardText(card)) };
  });
  for (const heading of entries.keys()) linkErrors.push(`the links file has an entry for "${heading}", which is no card's heading`);

  return { body: joinPassages({ lead, cards }), summary: linkedSummary, visuals, linkErrors, unverified };
}
