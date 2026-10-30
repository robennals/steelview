export type TextPart = { text: string; quoted: boolean };

/**
 * Split a cell into the source's own words and the author's words around them,
 * so the two can be set differently. Quotation marks are dropped from a quoted
 * part: the `<q>` that prints it supplies them. A stray mark with no partner
 * stays in the plain text rather than turning the rest of the cell into a quote.
 */
export function splitQuoted(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let at = 0;
  for (const match of text.matchAll(/"([^"]+)"|“([^”]+)”/g)) {
    if (match.index > at) parts.push({ text: text.slice(at, match.index), quoted: false });
    parts.push({ text: match[1] ?? match[2], quoted: true });
    at = match.index + match[0].length;
  }
  if (at < text.length) parts.push({ text: text.slice(at), quoted: false });
  return parts;
}

/** Whether the whole text is one quotation, give or take closing punctuation. */
export function isWholeQuote(parts: TextPart[]): boolean {
  return parts[0]?.quoted === true && parts.slice(1).every(part => !part.quoted && /^[\s.,;:]*$/.test(part.text));
}
