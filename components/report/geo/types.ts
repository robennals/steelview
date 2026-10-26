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
  coordinates: LonLat[][][];
};
