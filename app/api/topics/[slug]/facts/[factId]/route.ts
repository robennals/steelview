import { allFactParams, loadFactPage } from '@/lib/content/fact-page';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = allFactParams;

export async function GET(_request: Request, { params }: {
  params: Promise<{ slug: string; factId: string }>;
}) {
  const { slug, factId } = await params;
  const data = await loadFactPage(slug, factId);
  if (!data) return new Response('Fact not found', { status: 404 });
  const { fact, bodyHtml, supporting, parent } = data;
  return Response.json({ fact, bodyHtml, supporting, parent });
}
