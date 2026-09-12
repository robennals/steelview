import { createHash } from 'node:crypto';
import { glossary } from './glossary';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Link, Root, Text } from 'mdast';
import type { Root as HtmlRoot, Element } from 'hast';
import type { Fact } from './types';
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
    visit(tree, 'html', (node, index, parent) => {
      if (parent === undefined || index === undefined) return;
      const text: Text = { type: 'text', value: node.value };
      parent.children[index] = text;
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
  const id = href.slice(FACT_HREF_PREFIX.length).split('/')[0];
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
function remarkMarkFactCitations({ slug, facts }: { slug: string; facts: Fact[] }) {
  return (tree: Root) => {
    visit(tree, 'link', (node: Link) => {
      const factId = citedFactId(node.url);
      if (!factId) return;
      const fact = facts.find((item) => item.id === factId);
      const section = node.url.slice(FACT_HREF_PREFIX.length).split('/')[1];
      const target = section ? `${factId}--${section}` : fact?.supports ? `evidence-${factId}` : '';
      node.url = factPath(slug, fact?.supports ?? factId) + (target ? `#${target}` : '');
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

function buildProcessor(slug: string, facts: Fact[] = [], namespace = slug) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkEscapeHtml)
    .use(remarkMarkFactCitations, { slug, facts })
    .use(remarkEvidenceAnchors)
    .use(remarkRehype)
    .use(rehypeGlossary, { namespace })
    .use(rehypeEvidenceSections)
    .use(rehypeStringify)
    .freeze();
}

export async function renderMarkdown(md: string, slug: string, facts: Fact[] = []): Promise<string> {
  if (!md.trim()) return '';
  let processor = md.includes("#glossary-") ? buildProcessor(slug, facts, createHash("sha256").update(slug + md).digest("hex").slice(0, 16)) : facts.length ? buildProcessor(slug, facts) : processors.get(slug);
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
  const tree: Root = unified().use(remarkParse).use(remarkGfm).parse(md);
  const ids: string[] = [];
  visit(tree, 'link', (node: Link) => {
    const factId = citedFactId(node.url);
    if (factId) ids.push(factId);
  });
  return ids;
}

/** Explicit heading IDs survive editorial retitling; source links stay native anchors. */
function remarkEvidenceAnchors() {
  return (tree: Root) => {
    visit(tree, 'heading', (node) => {
      const last = node.children.at(-1);
      if (last?.type !== 'text') return;
      const match = last.value.match(/ \{#([a-z0-9-]+)\}$/);
      if (!match) return;
      last.value = last.value.slice(0, -match[0].length);
      node.data = { ...node.data, hProperties: { id: match[1] } };
    });
    visit(tree, 'link', (node) => {
      if (!node.url.startsWith('#source-')) return;
      node.data = { ...node.data, hProperties: { className: ['sv-footnote'], 'aria-label': `Source ${node.children.map(n => n.type === 'text' ? n.value : '').join('')}` } };
    });
  };
}

export function citedFactTargets(md: string): Array<{ id: string; section?: string }> {
  const tree: Root = unified().use(remarkParse).use(remarkGfm).parse(md);
  const targets: Array<{ id: string; section?: string }> = [];
  visit(tree, 'link', (node) => {
    const id = citedFactId(node.url);
    if (id) targets.push({ id, section: node.url.slice(FACT_HREF_PREFIX.length).split('/')[1] });
  });
  return targets;
}

/** A finding's heading and explanation form one scroll/highlight target. */
function rehypeEvidenceSections() {
  return (tree: HtmlRoot) => {
    const children: HtmlRoot['children'] = [];
    let section: Element | undefined;
    let disclosures = false;
    for (const node of tree.children) {
      if (node.type === 'element' && /^h[1-3]$/.test(node.tagName)) {
        section = undefined;
        if (node.tagName === 'h1' || node.tagName === 'h2') {
          disclosures = node.tagName === 'h2' && (
            /--(observations|subtleties)$/.test(String(node.properties.id ?? '')) ||
            node.children.map(child => child.type === 'text' ? child.value : '').join('').trim().toLowerCase().match(/^(observations|subtleties)$/) !== null
          );
        }
        if (node.tagName === 'h3' && disclosures) {
          const summary: Element = { type: 'element', tagName: 'summary', properties: {}, children: node.children };
          section = { type: 'element', tagName: 'div', properties: { className: ['sv-observation__body'] }, children: [] };
          children.push({ type: 'element', tagName: 'details', properties: { ...(node.properties.id ? { id: node.properties.id } : {}), className: ['sv-observation'] }, children: [summary, section] });
          continue;
        }
        if (node.tagName === 'h3' && node.properties.id) {
          section = { type: 'element', tagName: 'section', properties: { id: node.properties.id, className: ['sv-evidence-section'] }, children: [node] };
          delete node.properties.id;
          children.push(section);
          continue;
        }
      }
      if (section) section.children.push(node as Element);
      else children.push(node);
    }
    tree.children = children;
  };
}

/** Native popovers stay above a fact dialog and work without hydration. */
function rehypeGlossary({ namespace }: { namespace: string }) {
  return (tree: HtmlRoot) => {
    let index = 0;
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a' || typeof node.properties.href !== 'string' || !node.properties.href.startsWith('#glossary-')) return;
      const key = node.properties.href.slice('#glossary-'.length);
      const entry = glossary[key];
      if (!entry) throw new Error(`Unknown glossary term: ${key}`);
      const id = `glossary-${namespace}-${index++}`;
      const label = node.children;
      node.tagName = 'span';
      node.properties = { className: ['sv-glossary'] };
      node.children = [
        { type: 'element', tagName: 'button', properties: { type: 'button', className: ['sv-glossary__term'], popovertarget: id, 'aria-haspopup': 'dialog' }, children: label },
        { type: 'element', tagName: 'span', properties: { id, popover: 'auto', role: 'dialog', 'aria-label': entry.title, className: ['sv-glossary__popup'] }, children: [
          { type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: entry.title }] },
          { type: 'element', tagName: 'span', properties: { className: ['sv-glossary__definition'] }, children: [{ type: 'text', value: entry.definition }] },
          { type: 'element', tagName: 'button', properties: { type: 'button', popovertarget: id, popovertargetaction: 'hide', className: ['sv-glossary__close'], 'aria-label': 'Close definition', autoFocus: true }, children: [{ type: 'text', value: '×' }] },
        ] },
      ];
    });
  };
}
