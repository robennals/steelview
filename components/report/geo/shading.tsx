import type { ReactNode } from 'react';
import { boundGlyph, isRange, pointValue, qualificationsIn } from '../qualified';
import { categoryRows, numericRows } from './area-rows';
import { AreaTable } from './area-table';
import { categoryAriaText, categoryCounts, categoryOf, categoryReadoutText, categorySlots, categorySummary, isCategorical, NO_DATA, type MapEncoding } from './categorical';
import { CategoryLegend } from './category-legend';
import { PREVIEW_CLOSING, datumText, isStippled, mapScale, mapSummary, readoutText, tileText } from './choropleth';
import { MapLegend } from './map-legend';

/** How one area is drawn and read, whichever way the map is shaded and whichever view draws it. */
export type AreaLook = {
  /** What the readout under the map says: "Arkansas: Strict photo ID — free ID on request". */
  readout: string;
  /** What a focused area is called: "Arkansas: Strict photo ID". */
  ariaLabel: string;
  /** Printed on a numeric tile: the value. Empty for a category, which its tint and pattern show. */
  tileText: string;
  /** Printed on a numeric tile too small for the value: a bound's ▲ or ▼. Empty for a category. */
  denseText: string;
  /** A bound's ▲ or ▼, drawn on the real-shape view where no value is printed. */
  glyph?: '▲' | '▼';
  /** Printed under an inset: the value, or the category's label. */
  insetText: string;
  /** A numeric area's colour on the scale. */
  color?: string;
  /** A categorical area's slot, 1 to 6: its tint and pattern. */
  slot?: number;
  missing: boolean;
  /** The figure is a bound, an approximation or a range: drawn with a stipple. */
  stippled: boolean;
  range: boolean;
  /** A deep sequential step, which takes paper-coloured text on a tile. */
  dark: boolean;
};

/** Everything a map shares between its views: one legend, one table, one description, and a look per area. */
export type MapShading = {
  categorical: boolean;
  lookFor: (area: { id: string; name: string }) => AreaLook;
  legend: ReactNode;
  table: ReactNode;
  /** The categorical slots in use, for the SVG patterns of the real-shape view. */
  slots: number[];
  /** The screen-reader description: `intro` (what the view draws) inside the encoding's own summary. */
  summary: (intro?: string, extra?: string) => string;
};

/**
 * The shading of one dataset over a set of areas, kept apart from any
 * drawing: TileMap, GeoMap and AreaMap's two views all read their colours,
 * marks, texts, legend and table from here, so a value looks and reads the
 * same in every view. For a `preview` the legend leaves out the key to the
 * qualification marks, which explains method, and the description points at
 * the full figure's table rather than a Table switch the preview lacks.
 */
export function mapShading(
  encoding: MapEncoding,
  areas: Array<{ id: string; name: string }>,
  { caption, areaLabel, preview = false }: { caption: string; areaLabel: string; preview?: boolean },
): MapShading {
  if (isCategorical(encoding)) {
    const slotOf = categorySlots(encoding.categories);
    const counts = categoryCounts(encoding.categoryData, areas.map(area => area.id), encoding.categories);
    return {
      categorical: true,
      lookFor: area => {
        const category = categoryOf(area.id, encoding);
        return {
          readout: categoryReadoutText(area.name, category, encoding.categoryData[area.id]?.note),
          ariaLabel: categoryAriaText(area.name, category),
          tileText: '',
          denseText: '',
          insetText: category?.label ?? 'No data',
          slot: category && slotOf.get(category.id),
          missing: !category,
          stippled: false,
          range: false,
          dark: false,
        };
      },
      legend: <CategoryLegend categoryLabel={encoding.categoryLabel} categories={encoding.categories} slots={slotOf} counts={counts} />,
      table: (
        <AreaTable
          caption={caption}
          areaLabel={areaLabel}
          valueLabel={encoding.categoryLabel}
          rows={categoryRows(areas, encoding, slotOf)}
          choices={[...encoding.categories.map(category => category.label), ...(counts.get(NO_DATA) ? [NO_DATA] : [])]}
        />
      ),
      slots: [...slotOf.values()],
      summary: (intro, extra) => [categorySummary(areas, encoding), intro, extra, preview ? PREVIEW_CLOSING : 'Use the Table switch to see every area.'].filter(Boolean).join(' '),
    };
  }

  const { data, valueLabel, format, scale: kind = 'sequential', steps, domain, breaks } = encoding;
  const scale = mapScale(data, { kind, steps, domain, breaks });
  const qualifications = preview ? [] : qualificationsIn(areas.flatMap(area => (data[area.id] ? [data[area.id]] : [])));
  return {
    categorical: false,
    lookFor: area => {
      const datum = data[area.id];
      const text = readoutText(area.name, datum, format);
      const color = datum ? scale.color(pointValue(datum)) : undefined;
      // Only the deepest sequential steps take paper-coloured text: on the
      // light theme ink stays above 4.5:1 up to about 75% of the hue, and the
      // dark theme keeps ink throughout (see maps.css).
      const binIndex = datum ? scale.bins.findIndex(bin => bin.color === color) : -1;
      const glyph = datum && boundGlyph(datum);
      return {
        readout: text,
        ariaLabel: text,
        tileText: tileText(datum, { ...format, compact: format?.compact ?? true }),
        denseText: glyph ?? '',
        glyph,
        insetText: datumText(datum, format),
        color,
        missing: !datum,
        stippled: isStippled(datum),
        range: datum !== undefined && isRange(datum),
        dark: kind === 'sequential' && binIndex >= 0 && (binIndex + 0.5) / scale.bins.length >= 0.8,
      };
    },
    legend: <MapLegend scale={scale} format={format} valueLabel={valueLabel} showNoData={areas.some(area => !data[area.id])} qualifications={qualifications} />,
    table: <AreaTable caption={caption} areaLabel={areaLabel} valueLabel={valueLabel} rows={numericRows(areas, data, format)} />,
    slots: [],
    summary: (intro, extra) => mapSummary([intro, `Shaded by ${valueLabel.toLowerCase()}.`].filter(Boolean).join(' '), areas, data, format, extra, preview ? PREVIEW_CLOSING : undefined),
  };
}
