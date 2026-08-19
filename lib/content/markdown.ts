import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Root, Text } from 'mdast';

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

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkEscapeHtml)
  .use(remarkRehype)
  .use(rehypeStringify);

export async function renderMarkdown(md: string): Promise<string> {
  if (!md.trim()) return '';
  const file = await processor.process(md);
  return String(file).trim();
}
