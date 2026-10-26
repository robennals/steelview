import { formatValue } from '../format';
import type { ValueFormat } from '../types';
import type { MapScale } from './choropleth';

/**
 * The stepped key shared by GeoMap and TileMap: equal swatches with the
 * boundary values written under the joins, then a hatched "No data" swatch
 * whenever an area is missing. Missing gets its own mark rather than the
 * palest colour because the palest colour means "lowest", and an area the
 * source does not cover is not the lowest.
 */
export function MapLegend({
  scale,
  format,
  valueLabel,
  showNoData,
}: {
  scale: MapScale;
  format?: ValueFormat;
  valueLabel: string;
  showNoData: boolean;
}) {
  const { bins } = scale;
  const bounds = [bins[0].from, ...bins.map(bin => bin.to)];
  const tick = (value: number) => formatValue(value, { ...format, signed: scale.kind === 'diverging' && value !== 0 ? true : format?.signed });
  return (
    <div className="sv-map-legend">
      <p className="sv-map-legend__title">{valueLabel}</p>
      <div className="sv-map-legend__body">
        <div className="sv-map-legend__scale" style={{ '--sv-steps': bins.length }}>
          <ol className="sv-map-legend__steps">
            {bins.map((bin, i) => (
              <li key={i} className="sv-map-legend__step" style={{ background: bin.color }}>
                <span className="sv-visually-hidden">
                  {tick(bin.from)} to {tick(bin.to)}
                </span>
              </li>
            ))}
          </ol>
          <div className="sv-map-legend__ticks" aria-hidden="true">
            {bounds.map((value, i) => (
              <span
                key={i}
                className="sv-map-legend__tick"
                data-edge={i === 0 ? 'start' : i === bounds.length - 1 ? 'end' : undefined}
                data-zero={scale.kind === 'diverging' && value === 0 ? 'true' : undefined}
                style={{ left: `${(i / bins.length) * 100}%` }}
              >
                {tick(value)}
              </span>
            ))}
          </div>
        </div>
        {showNoData && (
          <span className="sv-map-legend__nodata">
            <span className="sv-map-legend__hatch" aria-hidden="true" />
            No data
          </span>
        )}
      </div>
    </div>
  );
}
