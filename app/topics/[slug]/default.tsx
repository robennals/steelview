import TopicPage from './page';

/**
 * The fallback for the implicit `children` slot.
 *
 * `children` is a parallel slot like any other, so when Next.js cannot
 * recover its active state — a reload while a fact is open over the topic, a
 * pasted URL — it needs something to render here or the segment 404s. What
 * belongs behind an open fact is the topic itself, so this is the topic page.
 */
export default TopicPage;
