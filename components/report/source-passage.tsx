import type { SourcePassage } from './types';

/** A passage's words, with the words an item quotes marked. */
export function PassageText({ passage }: { passage: SourcePassage }) {
  return <>{passage.parts.map((part, j) => (part.quoted ? <mark key={j}>{part.text}</mark> : part.text))}</>;
}

/**
 * The sentences an item's quoted words came from, under the item: the
 * source's own words, the quoted ones marked, so a few words in a title can
 * be read where they were said. The item's source line, next to it, says
 * which source they are from.
 */
export function SourcePassages({ passages, lang }: { passages?: SourcePassage[]; lang?: string }) {
  if (!passages || passages.length === 0) return null;
  return (
    <div className="sv-passage">
      {passages.map((passage, i) => (
        <blockquote key={i} className="sv-passage__text" cite={passage.source.href} lang={lang}>
          <p><PassageText passage={passage} /></p>
        </blockquote>
      ))}
    </div>
  );
}
