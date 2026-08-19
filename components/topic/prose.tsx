/**
 * Renders HTML produced by lib/content/markdown.ts. The HTML comes from
 * markdown in this repository, and renderMarkdown escapes raw HTML, so there
 * is no untrusted input on this path.
 */
export function Prose({ html }: { html: string }) {
  if (!html) return null;
  return <div className="prose-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
