/** A [longitude, latitude] pair in degrees. */
export type LonLat = [number, number];

/**
 * One area on a map: GeoJSON MultiPolygon coordinates (polygons → rings →
 * points; the first ring of each polygon is its outline, any later rings are
 * holes) plus the id that data rows are joined on.
 */
export type GeoRegion = {
  id: string;
  /** The statistical code, e.g. "TLI" for London, for joining official tables. */
  code?: string;
  name: string;
  /** Empty for an area drawn only as a dot (see `point`). */
  coordinates: LonLat[][][];
  /**
   * Where to draw the area as a dot, for one too small for its outline to
   * show at the map's scale (Monaco, Tuvalu, Washington DC) or with no
   * outline in the set at all. The dot carries a wider invisible hit area,
   * so it can be pointed at and tabbed to like any outline.
   */
  point?: LonLat;
};
