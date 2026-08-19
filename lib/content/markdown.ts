import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// remark-rehype drops raw HTML nodes unless rehype-raw is added. That is the
// behaviour we want: content is authored in this repo, but escaping raw HTML
// keeps a copy-pasted quote from silently injecting markup into the page.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

export async function renderMarkdown(md: string): Promise<string> {
  if (!md.trim()) return '';
  const file = await processor.process(md);
  return String(file).trim();
}
