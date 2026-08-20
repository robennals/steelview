import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Link, Root, Text } from 'mdast';
import { anchorFor, factPath } from './types';

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
 * Rewrite fact citations to the cited fact's own URL, and mark them.
 *
 * The *authoring* syntax is unchanged and deliberately so: an author writes
 * `[reached 944,000](#fact-net-migration-2024)`, exactly as before, and
 * validation still reads that form. What ships to the page is a real link to
 * `/topics/<slug>/facts/<id>` — the fact's canonical address — so a citation
 * is an ordinary link that a crawler can follow, an importer can resolve and a
 * reader with no JavaScript can click. `class="sv-cite"` carries the citation
 * treatment; `data-fact-id` names the fact so the client router can turn the
 * click into a modal without re-parsing the href.
 */
function remarkMarkFactCitations(slug: string) {
  return (tree: Root) => {
    visit(tree, 'link', (node: Link) => {
      const factId = citedFactId(node.url);
      if (!factId) return;
      node.url = factPath(slug, factId);
      const data = (node.data ??= {});
      const props = ((data as { hProperties?: Record<string, unknown> }).hProperties ??= {});
      props.className = ['sv-cite'];
      props['data-fact-id'] = factId;
    });
  };
}

/**
 * `slug` is required rather than optional: a citation rendered without one
 * could only fall back to the old in-page anchor, which no longer exists on
 * any page — a silent dead link is exactly what the citation rules exist to
 * prevent, so the type system asks for the topic instead.
 */
/** One processor per topic — the only thing that varies between them is the slug. */
const processors = new Map<string, ReturnType<typeof buildProcessor>>();

function buildProcessor(slug: string) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkEscapeHtml)
    .use(remarkMarkFactCitations, slug)
    .use(remarkRehype)
    .use(rehypeStringify)
    .freeze();
}

export async function renderMarkdown(md: string, slug: string): Promise<string> {
  if (!md.trim()) return '';
  let processor = processors.get(slug);
  if (!processor) {
    processor = buildProcessor(slug);
    processors.set(slug, processor);
  }
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
