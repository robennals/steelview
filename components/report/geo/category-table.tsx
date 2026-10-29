import { countOf } from '../format';
import { categoryOf, NO_DATA, type CategoryEncoding } from './categorical';

/**
 * A categorical map as a table: one row group per category, in the author's
 * order, headed by the category and its count ("Strict photo ID — 10
 * states"), then each area in it alphabetically with its note. Areas with no
 * assignment come last under "No data". The Note column appears only when
 * some area has a note, so a map without notes is not a table of blanks.
 */
export function CategoryTable({
  caption,
  areaLabel,
  areas,
  encoding,
}: {
  caption: string;
  areaLabel: string;
  areas: Array<{ id: string; name: string }>;
  encoding: CategoryEncoding;
}) {
  const sorted = [...areas].sort((a, b) => a.name.localeCompare(b.name));
  const groups = [
    ...encoding.categories.map(category => ({ key: category.id, label: category.label, areas: sorted.filter(area => categoryOf(area.id, encoding)?.id === category.id) })),
    { key: NO_DATA, label: NO_DATA, areas: sorted.filter(area => !categoryOf(area.id, encoding)) },
  ].filter(group => group.key !== NO_DATA || group.areas.length > 0);
  const hasNotes = sorted.some(area => categoryOf(area.id, encoding) && encoding.categoryData[area.id]?.note);
  const columns = hasNotes ? 2 : 1;

  return (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table sv-category-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{areaLabel}</th>
            {hasNotes && <th scope="col" className="sv-data__th-text">Note</th>}
          </tr>
        </thead>
        {groups.map(group => (
          <tbody key={group.key} data-missing={group.key === NO_DATA ? 'true' : undefined}>
            <tr>
              <th colSpan={columns} scope="rowgroup" className="sv-category-table__group">
                {group.label} — {countOf(group.areas.length, areaLabel)}
              </th>
            </tr>
            {group.areas.map(area => (
              <tr key={area.id}>
                <th scope="row">{area.name}</th>
                {hasNotes && <td className="sv-data__td-text sv-category-table__note">{group.key === NO_DATA ? '' : encoding.categoryData[area.id]?.note ?? ''}</td>}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
