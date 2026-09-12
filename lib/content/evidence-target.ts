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
