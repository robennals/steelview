import { NO_DATA, type MapCategory } from './categorical';

/**
 * The key of a categorical map: one entry per category, in the author's
 * order, each a swatch carrying the slot's fill, pattern and mark, then the
 * label and how many areas are in it; then "No data" with its count when any
 * area is missing. The swatch shows all three cues the map uses, so the key
 * can be matched to a tile in greyscale as well as in colour.
 */
export function CategoryLegend({
  categoryLabel,
  categories,
  slots,
  counts,
}: {
  categoryLabel: string;
  categories: MapCategory[];
  slots: Map<string, number>;
  counts: Map<string, number>;
}) {
  const missing = counts.get(NO_DATA) ?? 0;
  return (
    <div className="sv-map-legend sv-category-legend">
      <p className="sv-map-legend__title">{categoryLabel}</p>
      <ul className="sv-category-legend__list">
        {categories.map(category => (
          <li key={category.id} className="sv-category-legend__item">
            <span className="sv-category-legend__swatch sv-cat-fill" data-slot={slots.get(category.id)} aria-hidden="true">
              <span>{category.mark}</span>
            </span>
            <span>
              {category.label} <span className="sv-category-legend__count">({counts.get(category.id) ?? 0})</span>
            </span>
          </li>
        ))}
        {missing > 0 && (
          <li className="sv-category-legend__item sv-category-legend__item--nodata">
            <span className="sv-map-legend__hatch sv-category-legend__swatch" aria-hidden="true" />
            <span>
              {NO_DATA} <span className="sv-category-legend__count">({missing})</span>
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
