import { CiteNav } from '@/components/topic/cite-nav';

/**
 * The topic segment, and the modal slot that sits over it.
 *
 * `@modal` is a parallel route: it renders alongside `children` in the same
 * layout, so the topic page stays mounted — and stays scrolled where the
 * reader left it — while a fact is open above it. The interception itself
 * lives in `@modal/(.)facts/[factId]`; on a cold load of a fact URL nothing
 * intercepts, the slot falls back to `@modal/default.tsx`, and `children` is
 * the fact's own page.
 */
export default function TopicLayout({
  children,
  modal,
}: LayoutProps<'/topics/[slug]'>) {
  return (
    <>
      <CiteNav />
      {children}
      {modal}
    </>
  );
}
