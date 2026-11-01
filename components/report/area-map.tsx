import { useId, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { ReportFigure } from './figure';
import { slugify } from './format';
import { mapSentence } from './geo-map';
import type { MapEncoding } from './geo/categorical';
import { GeoDrawing, type MapInset } from './geo/geo-drawing';
import type { Bounds } from './geo/project';
import { mapShading } from './geo/shading';
import { TileGrid } from './geo/tile-grid';
import type { MapTile } from './geo/tiles';
import type { GeoRegion } from './geo/types';
import { tileSentence } from './tile-map';
import type { FigurePreview, SourceCredit } from './types';

/** The two drawings of an AreaMap; the table is the third view. */
export type AreaMapView = 'map' | 'tiles';

type AreaMapCommon = {
  /** The areas as a tile grid, e.g. `US_STATE_TILES`. They are the map's areas: the table lists them. */
  tiles: MapTile[];
  /** The same areas as outlines or dots, joined to the tiles by id, e.g. `US_STATES`. */
  regions: GeoRegion[];
  /** Neighbours drawn plainly in the real-shape view for orientation: not areas, not in the table. */
  contextRegions?: GeoRegion[];
  /** The lon/lat box the real-shape view shows. Defaults to the bounds of `regions`. */
  extent?: Bounds;
  /** Areas redrawn enlarged beside the real-shape view. */
  insets?: MapInset[];
  /** The view shown first, and the one a reader without JavaScript sees beside the table. Defaults to `map`. */
  defaultView?: AreaMapView;
  /** Areas to outline, in both views. Never changes the colour. */
  highlight?: string[];
  /** Column heading for the areas in the table. Defaults to "Area". */
  areaLabel?: string;
  id?: string;
  title?: string;
  description?: string;
  sources?: SourceCredit[];
  note?: string;
  /** Rendered after the source line: the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
  headingLevel?: 2 | 3;
  /**
   * Draw the compact preview: the linked title, the key and the `defaultView`
   * drawing alone, scaled to the space it is given — no switch, readout,
   * Table view or focus stops, and no insets: every area is already drawn,
   * small ones as dots, and an inset row would shrink the map itself.
   */
  preview?: FigurePreview;
};

/**
 * Shaded either by a number (`data`, `valueLabel`, `format`, `scale`, …) or
 * by a category (`categoryLabel`, `categories`, `categoryData`) — never both.
 */
export type AreaMapProps = AreaMapCommon & MapEncoding;

/**
 * One dataset drawn two ways from one legend: in real shapes, where the
 * reader sees where things are, and as equal tiles, where a small state
 * counts as much as a large one and every area is as easy to point at.
 * A switch moves between Map, Tiles and Table; `defaultView` picks the
 * first. Every area is focusable in both drawings, with the same readout.
 *
 * Use it for a map whose readers need both questions answered — where, and
 * which areas are higher. TileMap and GeoMap remain for a figure that only
 * needs one.
 */
export function AreaMap(props: AreaMapProps) {
  const { tiles, regions, contextRegions = [], extent, insets = [], defaultView = 'map', highlight = [], areaLabel = 'Area', id, title, description, sources, note, footer, panel, headingLevel, preview } = props;
  const what = props.categories ? props.categoryLabel : props.valueLabel;
  const label = title ?? what;
  const reactId = useId();
  const baseId = `sv-area-map-${id ?? slugify(label)}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const descriptionId = `${baseId}-desc`;
  const shading = mapShading(props, tiles, { caption: `${label}, by ${areaLabel.toLowerCase()}`, areaLabel, preview: preview !== undefined });

  const views: Record<AreaMapView, { label: string; graph: ReactNode }> = {
    map: {
      label: 'Map',
      graph: (
        <>
          {shading.legend}
          <p className="sv-visually-hidden" id={descriptionId}>{shading.summary(mapSentence(regions, shading.categorical))}</p>
          <GeoDrawing
            regions={regions}
            contextRegions={contextRegions}
            extent={extent}
            projection="auto"
            markers={[]}
            insets={preview ? [] : insets}
            highlight={highlight}
            lookFor={shading.lookFor}
            slots={shading.slots}
            categorical={shading.categorical}
            label={label}
            baseId={baseId}
            descriptionId={descriptionId}
            preview={preview !== undefined}
          />
        </>
      ),
    },
    tiles: {
      label: 'Tiles',
      graph: (
        <>
          {shading.legend}
          <p className="sv-visually-hidden" id={descriptionId}>{shading.summary(tileSentence(tiles, shading.categorical))}</p>
          <TileGrid tiles={tiles} lookFor={shading.lookFor} highlight={highlight} label={label} descriptionId={descriptionId} categorical={shading.categorical} preview={preview !== undefined} />
        </>
      ),
    },
  };
  const first = views[defaultView];
  const second = views[defaultView === 'map' ? 'tiles' : 'map'];

  if (preview) return <ReportFigure id={id} title={title} preview={preview} className="sv-area-map">{first.graph}</ReportFigure>;

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} headingLevel={headingLevel} className="sv-area-map">
      <ChartViewToggle label={label} graphLabel={first.label} graph={first.graph} alternate={second} table={shading.table} />
    </ReportFigure>
  );
}
