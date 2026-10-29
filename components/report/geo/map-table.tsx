import type { ValueFormat } from '../types';
import { datumText, type MapData } from './choropleth';

/**
 * Every area and its figure, highest first, with areas the source does not
 * cover listed last as "No data". The table is the map's checkable form: a
 * reader who doubts a shade can find the number, and a screen-reader user
 * gets the whole map as one navigable grid.
 */
export function MapTable({
  caption,
  areaLabel,
  valueLabel,
  areas,
  data,
  format,
}: {
  caption: string;
  areaLabel: string;
  valueLabel: string;
  areas: Array<{ id: string; name: string }>;
  data: MapData;
  format?: ValueFormat;
}) {
  const rows = [...areas].sort((a, b) => {
    const va = data[a.id]?.value;
    const vb = data[b.id]?.value;
    if (va === undefined && vb === undefined) return a.name.localeCompare(b.name);
    if (va === undefined) return 1;
    if (vb === undefined) return -1;
    return vb - va;
  });
  return (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{areaLabel}</th>
            <th scope="col">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(area => (
            <tr key={area.id}>
              <th scope="row">{area.name}</th>
              <td data-missing={data[area.id] ? undefined : 'true'}>{datumText(data[area.id], format)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
