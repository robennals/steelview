import type { useRouter } from 'next/navigation';

/** Reveal a linked section without scrolling the topic behind an open dialog. */
export function revealEvidence(root: HTMLElement, hash: string): boolean {
  let id: string;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return false; }
  root.querySelectorAll('.sv-target').forEach(el => el.classList.remove('sv-target'));
  if (!id) return true;
  const target = Array.from(root.querySelectorAll<HTMLElement>('[id]')).find(el => el.id === id);
  if (!target) return false;
  for (let el: HTMLElement | null = target; el && el !== root; el = el.parentElement) {
    if (el instanceof HTMLDetailsElement) el.open = true;
  }
  target.classList.add('sv-target');
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  const scroll = root.querySelector<HTMLElement>('.sv-modal__scroll');
  if (scroll) scroll.scrollTop += target.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 24;
  else target.scrollIntoView({ block: 'start' });
  return true;
}

/** Reveal a section in an open fact sheet, and point its own-page links at it. */
export function showEvidenceInSheet(dialog: HTMLElement, hash: string) {
  dialog.querySelectorAll<HTMLAnchorElement>('a[data-fact-expand]').forEach((link) => {
    if (link.pathname === location.pathname) link.hash = hash;
  });
  revealEvidence(dialog, hash);
}

/**
 * Move an open fact sheet to another section of the same fact. The URL
 * follows without a new history entry, so Close still returns to the topic in
 * one step, and `scroll: false` leaves the scrolling to the reveal.
 */
export function moveSheetToEvidence(dialog: HTMLElement, hash: string, router: ReturnType<typeof useRouter>) {
  if (location.hash !== hash) router.replace(location.pathname + hash, { scroll: false });
  showEvidenceInSheet(dialog, hash);
}
