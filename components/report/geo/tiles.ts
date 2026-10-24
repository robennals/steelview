/**
 * Grid-cartogram layouts: every area as one equal tile, placed roughly where
 * it sits on the map. Equal tiles answer "which areas are higher" without the
 * bias of a true-shape map, where the largest areas dominate the eye
 * regardless of how many people live in them.
 *
 * Positions are a compromise between geography and a clean grid. Neighbours
 * stay neighbours where possible; exact adjacency cannot survive the grid.
 */

export type MapTile = {
  /** Joins to the data, as in GeoMap. */
  id: string;
  /** Two or three letters shown on the tile. */
  code: string;
  /** Full name, used in the readout and the table. */
  name: string;
  /** Zero-based grid position. */
  row: number;
  col: number;
};

/** The UK's twelve ITL1 regions, ids matching `UK_ITL1_REGIONS`. */
export const UK_REGION_TILES: MapTile[] = [
  { id: 'scotland', code: 'SCO', name: 'Scotland', row: 0, col: 2 },
  { id: 'north-east', code: 'NE', name: 'North East', row: 0, col: 3 },
  { id: 'northern-ireland', code: 'NI', name: 'Northern Ireland', row: 1, col: 0 },
  { id: 'north-west', code: 'NW', name: 'North West', row: 1, col: 2 },
  { id: 'yorkshire-and-the-humber', code: 'YH', name: 'Yorkshire and The Humber', row: 1, col: 3 },
  { id: 'wales', code: 'WAL', name: 'Wales', row: 2, col: 1 },
  { id: 'west-midlands', code: 'WM', name: 'West Midlands', row: 2, col: 2 },
  { id: 'east-midlands', code: 'EM', name: 'East Midlands', row: 2, col: 3 },
  { id: 'east', code: 'EAS', name: 'East of England', row: 2, col: 4 },
  { id: 'south-west', code: 'SW', name: 'South West', row: 3, col: 1 },
  { id: 'south-east', code: 'SE', name: 'South East', row: 3, col: 2 },
  { id: 'london', code: 'LDN', name: 'London', row: 3, col: 3 },
];

/**
 * The EU27 plus the UK, Norway, Switzerland and Iceland, keyed by ISO 3166-1
 * alpha-2 code ("GB" for the UK, shown as "UK"; "GR" for Greece, which
 * Eurostat writes "EL" — map Eurostat tables onto these ids when joining).
 */
export const EUROPE_COUNTRY_TILES: MapTile[] = [
  { id: 'IS', code: 'IS', name: 'Iceland', row: 0, col: 0 },
  { id: 'NO', code: 'NO', name: 'Norway', row: 0, col: 5 },
  { id: 'SE', code: 'SE', name: 'Sweden', row: 0, col: 6 },
  { id: 'FI', code: 'FI', name: 'Finland', row: 0, col: 7 },
  { id: 'IE', code: 'IE', name: 'Ireland', row: 1, col: 1 },
  { id: 'GB', code: 'UK', name: 'United Kingdom', row: 1, col: 2 },
  { id: 'DK', code: 'DK', name: 'Denmark', row: 1, col: 5 },
  { id: 'EE', code: 'EE', name: 'Estonia', row: 1, col: 7 },
  { id: 'NL', code: 'NL', name: 'Netherlands', row: 2, col: 4 },
  { id: 'DE', code: 'DE', name: 'Germany', row: 2, col: 5 },
  { id: 'PL', code: 'PL', name: 'Poland', row: 2, col: 6 },
  { id: 'LV', code: 'LV', name: 'Latvia', row: 2, col: 7 },
  { id: 'BE', code: 'BE', name: 'Belgium', row: 3, col: 3 },
  { id: 'LU', code: 'LU', name: 'Luxembourg', row: 3, col: 4 },
  { id: 'CZ', code: 'CZ', name: 'Czechia', row: 3, col: 5 },
  { id: 'SK', code: 'SK', name: 'Slovakia', row: 3, col: 6 },
  { id: 'LT', code: 'LT', name: 'Lithuania', row: 3, col: 7 },
  { id: 'FR', code: 'FR', name: 'France', row: 4, col: 3 },
  { id: 'CH', code: 'CH', name: 'Switzerland', row: 4, col: 4 },
  { id: 'AT', code: 'AT', name: 'Austria', row: 4, col: 5 },
  { id: 'HU', code: 'HU', name: 'Hungary', row: 4, col: 6 },
  { id: 'RO', code: 'RO', name: 'Romania', row: 4, col: 7 },
  { id: 'PT', code: 'PT', name: 'Portugal', row: 5, col: 1 },
  { id: 'ES', code: 'ES', name: 'Spain', row: 5, col: 2 },
  { id: 'IT', code: 'IT', name: 'Italy', row: 5, col: 4 },
  { id: 'SI', code: 'SI', name: 'Slovenia', row: 5, col: 5 },
  { id: 'HR', code: 'HR', name: 'Croatia', row: 5, col: 6 },
  { id: 'BG', code: 'BG', name: 'Bulgaria', row: 5, col: 7 },
  { id: 'MT', code: 'MT', name: 'Malta', row: 6, col: 4 },
  { id: 'GR', code: 'GR', name: 'Greece', row: 6, col: 7 },
  { id: 'CY', code: 'CY', name: 'Cyprus', row: 6, col: 8 },
];

/**
 * The fifty US states plus the District of Columbia, keyed by USPS
 * two-letter code. The widely used NPR-style layout, with Alaska and Hawaii
 * in the left-hand corners.
 */
export const US_STATE_TILES: MapTile[] = [
  { id: 'AK', code: 'AK', name: 'Alaska', row: 0, col: 0 },
  { id: 'ME', code: 'ME', name: 'Maine', row: 0, col: 11 },
  { id: 'VT', code: 'VT', name: 'Vermont', row: 1, col: 10 },
  { id: 'NH', code: 'NH', name: 'New Hampshire', row: 1, col: 11 },
  { id: 'WA', code: 'WA', name: 'Washington', row: 2, col: 1 },
  { id: 'ID', code: 'ID', name: 'Idaho', row: 2, col: 2 },
  { id: 'MT', code: 'MT', name: 'Montana', row: 2, col: 3 },
  { id: 'ND', code: 'ND', name: 'North Dakota', row: 2, col: 4 },
  { id: 'MN', code: 'MN', name: 'Minnesota', row: 2, col: 5 },
  { id: 'IL', code: 'IL', name: 'Illinois', row: 2, col: 6 },
  { id: 'WI', code: 'WI', name: 'Wisconsin', row: 2, col: 7 },
  { id: 'MI', code: 'MI', name: 'Michigan', row: 2, col: 8 },
  { id: 'NY', code: 'NY', name: 'New York', row: 2, col: 9 },
  { id: 'RI', code: 'RI', name: 'Rhode Island', row: 2, col: 10 },
  { id: 'MA', code: 'MA', name: 'Massachusetts', row: 2, col: 11 },
  { id: 'OR', code: 'OR', name: 'Oregon', row: 3, col: 1 },
  { id: 'NV', code: 'NV', name: 'Nevada', row: 3, col: 2 },
  { id: 'WY', code: 'WY', name: 'Wyoming', row: 3, col: 3 },
  { id: 'SD', code: 'SD', name: 'South Dakota', row: 3, col: 4 },
  { id: 'IA', code: 'IA', name: 'Iowa', row: 3, col: 5 },
  { id: 'IN', code: 'IN', name: 'Indiana', row: 3, col: 6 },
  { id: 'OH', code: 'OH', name: 'Ohio', row: 3, col: 7 },
  { id: 'PA', code: 'PA', name: 'Pennsylvania', row: 3, col: 8 },
  { id: 'NJ', code: 'NJ', name: 'New Jersey', row: 3, col: 9 },
  { id: 'CT', code: 'CT', name: 'Connecticut', row: 3, col: 10 },
  { id: 'CA', code: 'CA', name: 'California', row: 4, col: 1 },
  { id: 'UT', code: 'UT', name: 'Utah', row: 4, col: 2 },
  { id: 'CO', code: 'CO', name: 'Colorado', row: 4, col: 3 },
  { id: 'NE', code: 'NE', name: 'Nebraska', row: 4, col: 4 },
  { id: 'MO', code: 'MO', name: 'Missouri', row: 4, col: 5 },
  { id: 'KY', code: 'KY', name: 'Kentucky', row: 4, col: 6 },
  { id: 'WV', code: 'WV', name: 'West Virginia', row: 4, col: 7 },
  { id: 'VA', code: 'VA', name: 'Virginia', row: 4, col: 8 },
  { id: 'MD', code: 'MD', name: 'Maryland', row: 4, col: 9 },
  { id: 'DE', code: 'DE', name: 'Delaware', row: 4, col: 10 },
  { id: 'AZ', code: 'AZ', name: 'Arizona', row: 5, col: 2 },
  { id: 'NM', code: 'NM', name: 'New Mexico', row: 5, col: 3 },
  { id: 'KS', code: 'KS', name: 'Kansas', row: 5, col: 4 },
  { id: 'AR', code: 'AR', name: 'Arkansas', row: 5, col: 5 },
  { id: 'TN', code: 'TN', name: 'Tennessee', row: 5, col: 6 },
  { id: 'NC', code: 'NC', name: 'North Carolina', row: 5, col: 7 },
  { id: 'SC', code: 'SC', name: 'South Carolina', row: 5, col: 8 },
  { id: 'DC', code: 'DC', name: 'District of Columbia', row: 5, col: 9 },
  { id: 'OK', code: 'OK', name: 'Oklahoma', row: 6, col: 4 },
  { id: 'LA', code: 'LA', name: 'Louisiana', row: 6, col: 5 },
  { id: 'MS', code: 'MS', name: 'Mississippi', row: 6, col: 6 },
  { id: 'AL', code: 'AL', name: 'Alabama', row: 6, col: 7 },
  { id: 'GA', code: 'GA', name: 'Georgia', row: 6, col: 8 },
  { id: 'HI', code: 'HI', name: 'Hawaii', row: 7, col: 0 },
  { id: 'TX', code: 'TX', name: 'Texas', row: 7, col: 4 },
  { id: 'FL', code: 'FL', name: 'Florida', row: 7, col: 9 },
];
