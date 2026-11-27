'use client';

import { useEffect, useState } from 'react';
import { shuffledOrder } from '@/lib/shuffle';
import { useRowIsOpen } from './topic-accordion';

/**
 * An open topic row's list of its viewpoints' names, in a random order dealt
 * again each time the row opens, as the topic page shuffles its viewpoints so
 * that none is always the one read first. A viewpoint keeps its marker's
 * colour wherever it moves.
 *
 * The page is built once, ahead of time, so the server sends the content's
 * order; without JavaScript the list stays in it.
 */
export function ShuffledViewpointList({ viewpoints }: { viewpoints: { id: string; name: string }[] }) {
  const isOpen = useRowIsOpen();
  const [order, setOrder] = useState<number[] | null>(null);

  useEffect(() => {
    // Deal on each opening, including the row that starts open once the page loads.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setOrder(current => shuffledOrder(viewpoints.length, current ?? []));
  }, [isOpen, viewpoints.length]);

  return (
    <ul className="sv-row__viewpoints">
      {(order ?? viewpoints.map((_, i) => i)).map(i => (
        <li key={viewpoints[i].id}>
          <i className="sv-row__marker" style={{ background: `var(--sv-series-${(i % 8) + 1})` }} />
          <span>{viewpoints[i].name}</span>
        </li>
      ))}
    </ul>
  );
}
