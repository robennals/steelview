/**
 * A random order of the indices `0 … count - 1` (a Fisher–Yates shuffle).
 * With two or more, it is never the same as `current`, so a reader who asks
 * for a new order always sees one.
 */
export function shuffledOrder(count: number, current: readonly number[] = [], random: () => number = Math.random): number[] {
  for (;;) {
    const order = Array.from({ length: count }, (_, i) => i);
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (count < 2 || order.some((n, i) => n !== current[i])) return order;
  }
}
