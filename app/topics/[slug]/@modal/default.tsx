/**
 * Nothing over the page.
 *
 * Required: without it, any hard navigation into this segment — a refresh, a
 * pasted fact URL — has no state for the `@modal` slot and 404s.
 */
export default function NoModal() {
  return null;
}
