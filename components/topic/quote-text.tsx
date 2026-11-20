import type { ReactNode } from 'react';
import type { QuotePart } from '@/lib/content/quote-highlight';

/** One line of a quote: its runs, each picked out or not. */
type Line = QuotePart[];

/** A quote's runs cut into lines at its line breaks, each line keeping which of its runs are picked out. */
function lines(parts: QuotePart[]): Line[] {
  const out: Line[] = [[]];
  for (const { text, key } of parts) {
    text.split('\n').forEach((piece, i) => {
      if (i > 0) out.push([]);
      if (piece) out[out.length - 1].push({ text: piece, key });
    });
  }
  return out;
}

const plain = (line: Line) => line.map(run => run.text).join('');

/** A line with its first `count` characters dropped: a list item's `- `. */
function dropStart(line: Line, count: number): Line {
  let left = count;
  return line.flatMap(run => {
    const cut = Math.min(left, run.text.length);
    left -= cut;
    return cut < run.text.length ? [{ ...run, text: run.text.slice(cut) }] : [];
  });
}

/** A line's text split into table cells at ` | `, each keeping its picked-out runs. */
function cells(line: Line): Line[] {
  const out: Line[] = [[]];
  for (const run of line) {
    run.text.split(/\s*\|\s*/).forEach((piece, i) => {
      if (i > 0) out.push([]);
      if (piece) out[out.length - 1].push({ ...run, text: piece });
    });
  }
  return out;
}

function Runs({ line }: { line: Line }) {
  return line.map((run, i) => (run.key ? <mark key={i}>{run.text}</mark> : <span key={i}>{run.text}</span>));
}

const isItem = (line: Line) => /^- /.test(plain(line));
const isRow = (line: Line) => plain(line).includes(' | ');

/**
 * A source's quote, laid out as its source sets it. A quote is stored as plain
 * text in which a blank line starts a paragraph, a line beginning `- ` is a
 * bullet, a block of lines whose cells are split by ` | ` is a table (its first
 * line the header), and any other line break is kept. The words are the
 * source's, unchanged; only the layout is ours.
 */
export function QuoteText({ parts }: { parts: QuotePart[] }) {
  const blocks: Line[][] = [[]];
  for (const line of lines(parts)) {
    if (plain(line).trim() === '') blocks.push([]);
    else blocks[blocks.length - 1].push(line);
  }
  const out: ReactNode[] = [];
  blocks.filter(block => block.length > 0).forEach((block, b) => {
    // A block can mix lines of prose with a list under them, so it is read in runs of the same kind.
    let i = 0;
    while (i < block.length) {
      const kind = isItem(block[i]) ? 'item' : isRow(block[i]) ? 'row' : 'text';
      let j = i;
      while (j < block.length && (isItem(block[j]) ? 'item' : isRow(block[j]) ? 'row' : 'text') === kind) j++;
      const run = block.slice(i, j);
      const key = `${b}-${i}`;
      if (kind === 'item') {
        out.push(<ul key={key}>{run.map((line, n) => <li key={n}><Runs line={dropStart(line, 2)} /></li>)}</ul>);
      } else if (kind === 'row') {
        const [head, ...body] = run.map(cells);
        out.push(
          <div key={key} className="sv-quote-table">
            <table>
              <thead><tr>{head.map((cell, n) => <th key={n} scope="col"><Runs line={cell} /></th>)}</tr></thead>
              <tbody>{body.map((row, r) => <tr key={r}>{row.map((cell, n) => <td key={n}><Runs line={cell} /></td>)}</tr>)}</tbody>
            </table>
          </div>,
        );
      } else {
        out.push(<p key={key}>{run.map((line, n) => <span key={n}>{n > 0 && <br />}<Runs line={line} /></span>)}</p>);
      }
      i = j;
    }
  });
  return out;
}
