import { factPath } from '@/lib/content/types';
import { notFound } from 'next/navigation';
import { allFactParams, loadFactPage } from '@/lib/content/fact-page';
import { FactArticle } from '@/components/topic/fact-article';
import { FactModal } from '@/components/topic/fact-modal';

export async function generateStaticParams() {
  return allFactParams();
}

export const dynamicParams = false;

/** The id the dialog is labelled by — the claim itself, so it is announced as its title. */
const TITLE_ID = 'sv-modal-title';

/**
 * The same fact, intercepted.
 *
 * `(.)facts/[factId]` catches a client-side navigation to a fact URL from
 * within this topic segment and renders it into the `@modal` slot instead of
 * replacing the page — so the reader keeps the topic they were reading, and
 * the URL is the fact's real address rather than something invented for a
 * panel. A cold load of that URL never reaches this file: it renders
 * `facts/[factId]/page.tsx`, the standalone page.
 *
 * There is no second copy of the fact to keep in step, because both routes
 * render `FactArticle` from the same loaded content.
 */
export default async function FactModalPage({
  params,
}: {
  params: Promise<{ slug: string; factId: string }>;
}) {
  const { slug, factId } = await params;
  const data = await loadFactPage(slug, factId);
  if (!data) notFound();
  const { fact, bodyHtml, supporting, parent } = data;

  return (
    <FactModal labelledBy={TITLE_ID} href={factPath(slug, factId)}>
      <FactArticle
        variant="modal"
        headingId={TITLE_ID}
        slug={slug}
        fact={fact}
        bodyHtml={bodyHtml}
        supporting={supporting}
        parent={parent}
      />
    </FactModal>
  );
}
