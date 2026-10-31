import type { Fact } from '@/lib/content/types';

/** A transparent record of the measurements that would change a report. */
export function DataStillNeededList({ fact }: { fact: Pick<Fact, 'dataStillNeeded'> }) {
  return (
    <ul className="sv-data-needed__list">
      {fact.dataStillNeeded?.map(item => (
        <li key={item.measure}>
          <strong>{item.measure}</strong>
          <span>{item.why}</span>
        </li>
      ))}
    </ul>
  );
}
