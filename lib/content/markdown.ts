import { createHash } from 'node:crypto';
import { glossary } from './glossary';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { SKIP, visit } from 'unist-util-visit';
import type { Link, Nodes, Root, Text } from 'mdast';
import type { Root as HtmlRoot, Element } from 'hast';
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
    visit(tree, 'html', (node, index, parent) => {
      if (parent === undefined || index === undefined) return;
      const text: Text = { type: 'text', value: node.value };
      parent.children[index] = text;
    });
  };
}

/**
 * The href prefix that makes an ordinary markdown link a fact citation:
 * `[net migration reached 944,000](#fact-net-migration-2024/peak)`.
 *
 * Citations are deliberately plain markdown pointed at the anchor the fact
 * already has. No custom syntax means no second parser to keep in step with
 * remark, and authors write links they already know how to write.
 */
const FACT_HREF_PREFIX = `#${anchorFor('fact', '')}`;
const NEEDED_HREF = '#needed';

/** The id cited by `href`, or undefined if it is not a fact citation. */
function citedFactId(href: string): string | undefined {
  if (!href.startsWith(FACT_HREF_PREFIX)) return undefined;
  const id = href.slice(FACT_HREF_PREFIX.length).split('/')[0];
  return id.length > 0 ? id : undefined;
}

/**
 * Unwrap fact citations to their text. A citation records, in the source, the
 * finding a claim rests on: validation reads it, and it chooses the graph a
 * viewpoint's card is made with. Readers see the claim, and with
 * `citationMarker` a footnote marker after it that opens its sources' own
 * words; never text of ours. A `#needed` link is unwrapped the same way: it
 * records a premise queued for research.
 */
function remarkMarkFactCitations({ footnotes, citationMarker }: Required<Pick<RenderOptions, 'footnotes'>> & Pick<RenderOptions, 'citationMarker'>) {
  return (tree: Root) => {
    // Each marker made here, with the key of the finding it stands for.
    const markerKeys = new Map<Link, string>();
    visit(tree, 'link', (node: Link, index, parent) => {
      const factId = citedFactId(node.url);
      if (node.url === NEEDED_HREF || factId) {
        if (!parent || index === undefined) return;
        const marker = factId ? citationMarker?.(factId, node.url.slice(FACT_HREF_PREFIX.length).split('/')[1]) : undefined;
        const markers: Link[] = marker
          ? [{ type: 'link', url: `#${marker.key}`, data: { hProperties: { className: ['sv-source-marker'], 'data-sources': marker.key, 'aria-label': `Source ${marker.label}` } }, children: [{ type: 'text', value: marker.label }] }]
          : [];
        if (marker) markerKeys.set(markers[0], marker.key);
        parent.children.splice(index, 1, ...node.children, ...markers);
        return index + node.children.length + markers.length;
      }
      if (!footnotes && node.url.startsWith('#source-')) {
        if (!parent || index === undefined) return;
        // The space before a footnote goes with it, unless nothing else
        // would separate the words either side.
        const before = parent.children[index - 1];
        const after = parent.children[index + 1];
        if (before?.type === 'text' && (!after || (after.type === 'text' && /^\s/.test(after.value)))) before.value = before.value.trimEnd();
        parent.children.splice(index, 1);
        return index;
      }
    });
    // A finding cited several times in one paragraph keeps one marker, after its last citation.
    visit(tree, 'paragraph', paragraph => {
      const last = new Map<string, Link>();
      visit(paragraph, 'link', link => {
        const key = markerKeys.get(link);
        if (key) last.set(key, link);
      });
      visit(paragraph, 'link', (link, index, parent) => {
        const key = markerKeys.get(link);
        if (!key || last.get(key) === link || !parent || index === undefined) return;
        parent.children.splice(index, 1);
        return index;
      });
    });
  };
}

/** One processor per topic and footnote setting, the only things that vary between them. */
const processors = new Map<string, ReturnType<typeof buildProcessor>>();

function buildProcessor(namespace: string, { footnotes = true, citationMarker }: RenderOptions = {}) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkEscapeHtml)
    .use(remarkMarkFactCitations, { footnotes, citationMarker })
    .use(remarkEvidenceAnchors)
    .use(remarkRehype)
    .use(rehypeGlossary, { namespace })
    .use(rehypeEvidenceSections)
    .use(rehypeScrollableTables)
    .use(rehypeStringify)
    .freeze();
}

/** Where a featured chart opens in full over the page. */
export type PanelTarget = {
  fact: string;
  /** The cited section, as an element id: `<fact>--<section>`. It is the page's address while the panel is open. */
  observation: string;
};

type RenderOptions = {
  /**
   * A cited claim's footnote marker, if it has one: the key its sources are
   * read under, and the number it shows.
   */
  citationMarker?: (id: string, section: string | undefined) => { key: string; label: string } | undefined;
  /**
   * False leaves out `[n](#source-…)` footnotes: for a fact's prose shown away
   * from the fact, where the sources they point to are not on the page.
   */
  footnotes?: boolean;
};

export async function renderMarkdown(md: string, slug: string, options: RenderOptions = {}): Promise<string> {
  if (!md.trim()) return '';
  // A glossary term's pop-up needs an id unique to the text it is in.
  if (md.includes("#glossary-")) return String(await buildProcessor(createHash("sha256").update(slug + md).digest("hex").slice(0, 16), options).process(md)).trim();
  // Markers are numbered by the caller, render by render.
  if (options.citationMarker) return String(await buildProcessor(slug, options).process(md)).trim();
  const key = `${slug}:${options.footnotes !== false}`;
  let processor = processors.get(key);
  if (!processor) {
    processor = buildProcessor(slug, options);
    processors.set(key, processor);
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

/** The text of a node, ignoring formatting: `*different* rates` → "different rates". */
function plainText(node: Nodes): string {
  if ('value' in node) return node.value;
  if ('children' in node) return node.children.map(plainText).join('');
  return '';
}

/**
 * The claims a body marks `#needed`, as plain text, in order. Parsed by remark
 * for the same reason as `citedFactIds`: the list validation checks is exactly
 * the set of links the renderer unwraps.
 */
export function neededClaims(md: string): string[] {
  if (!md.trim()) return [];
  const tree: Root = unified().use(remarkParse).use(remarkGfm).parse(md);
  const claims: string[] = [];
  visit(tree, 'link', (node: Link) => {
    if (node.url === NEEDED_HREF) claims.push(plainText(node));
  });
  return claims;
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

/** The visible text of an element, for naming a region after it. */
function textOf(node: Element | HtmlRoot['children'][number]): string {
  if (node.type === 'text') return node.value;
  if (node.type !== 'element') return '';
  return node.children.map(textOf).join('');
}

/**
 * Wrap every table in a labelled, focusable region that scrolls sideways on
 * its own. A four-column table otherwise pushes the whole page sideways at
 * 390px. The region and its tab stop let a keyboard user scroll it; a bare
 * `overflow` on the table itself would drop its table semantics in some
 * screen readers. The label is the nearest heading or Observation title
 * before the table, so a screen-reader user hears which table it is.
 */
function rehypeScrollableTables() {
  return (tree: HtmlRoot) => {
    let label = 'Table';
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'h2' || node.tagName === 'h3' || node.tagName === 'summary') {
        label = textOf(node).trim() || label;
        return;
      }
      if (node.tagName !== 'table' || parent === undefined || index === undefined) return;
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['sv-prose-table'], role: 'region', tabIndex: 0, ariaLabel: label },
        children: [node],
      };
      // The table is now the wrapper's child; skip it rather than visit it twice.
      return [SKIP, index + 1];
    });
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
