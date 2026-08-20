import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Link, Root, Text } from 'mdast';
import { anchorFor } from './types';

/**
 * Turn raw-HTML nodes into plain text before they reach rehype, so markup in
 * content is escaped and shown rather than executed — or, as remark-rehype
 * would otherwise do, silently dropped. Content is authored in this repo, but
 * a source quote that happens to contain angle brackets must survive to the
 * page intact: losing part of a citation is worse than showing it verbatim.
 */
function remarkEscapeHtml() {
  return (tree: Root) => {
    visit(tree, 'html', (node) => {
      // `Html` and `Text` nodes share the same `value: string` shape; only
      // the `type` tag differs, so mutating it in place is a narrow cast
      // rather than a structural change.
      (node as unknown as Text).type = 'text';
    });
  };
}

/**
 * The href prefix that makes an ordinary markdown link a fact citation:
 * `[net migration reached 944,000](#fact-net-migration-2024)`.
 *
 * Citations are deliberately plain markdown pointed at the anchor the fact
 * already has. No custom syntax means no second parser to keep in step with
 * remark, authors write links they already know how to write, and a citation
 * still works as a link when the JavaScript that upgrades it into a modal is
 * absent.
 */
const FACT_HREF_PREFIX = `#${anchorFor('fact', '')}`;

/** The id cited by `href`, or undefined if it is not a fact citation. */
function citedFactId(href: string): string | undefined {
  if (!href.startsWith(FACT_HREF_PREFIX)) return undefined;
  const id = href.slice(FACT_HREF_PREFIX.length);
  return id.length > 0 ? id : undefined;
}

/**
 * Mark fact citations so the page can style them and script can intercept
 * them: `class="sv-cite"` carries the citation treatment, `data-fact-id`
 * carries the fact without anything having to re-parse the href.
 */
function remarkMarkFactCitations() {
  return (tree: Root) => {
    visit(tree, 'link', (node: Link) => {
      const factId = citedFactId(node.url);
      if (!factId) return;
      const data = (node.data ??= {});
      const props = ((data as { hProperties?: Record<string, unknown> }).hProperties ??= {});
      props.className = ['sv-cite'];
      props['data-fact-id'] = factId;
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkEscapeHtml)
  .use(remarkMarkFactCitations)
  .use(remarkRehype)
  .use(rehypeStringify);

export async function renderMarkdown(md: string): Promise<string> {
  if (!md.trim()) return '';
  const file = await processor.process(md);
  return String(file).trim();
}

/**
 * Every fact id cited by a body, in document order, with duplicates kept —
 * validation reports the link it found, so it wants each occurrence.
 *
 * Parsed with the same remark pipeline that renders the body rather than with
 * a regex, so what validation sees and what the reader sees can never drift:
 * a `#fact-…` inside a code span or an autolink-looking string is not a link
 * to remark and so is not a citation here either.
 */
export function citedFactIds(md: string): string[] {
  if (!md.trim()) return [];
  const tree = unified().use(remarkParse).use(remarkGfm).parse(md) as Root;
  const ids: string[] = [];
  visit(tree, 'link', (node: Link) => {
    const factId = citedFactId(node.url);
    if (factId) ids.push(factId);
  });
  return ids;
}
