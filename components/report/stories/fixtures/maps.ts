import type { MapData } from '../../geo/choropleth';
import type { MapMarker } from '../../geo-map';
import type { SourceCredit } from '../../types';

export const ILLUSTRATIVE: SourceCredit[] = [{ label: 'Illustrative data' }];

/**
 * ILLUSTRATIVE. Rounded figures shaped like the 2021 England and Wales Census
 * pattern of residents born outside the UK (London far above everywhere else,
 * the North East and Wales lowest). Not checked against the ONS tables — the
 * regional breakdown is not yet in Steelview's content. Scotland and Northern
 * Ireland are absent on purpose: the England and Wales Census does not cover
 * them, which is exactly the case the "No data" hatching exists for.
 */
export const BORN_ABROAD_BY_REGION_ILLUSTRATIVE: MapData = {
  london: { value: 41 },
  'south-east': { value: 16 },
  east: { value: 15 },
  'west-midlands': { value: 15 },
  'east-midlands': { value: 12 },
  'north-west': { value: 11 },
  'yorkshire-and-the-humber': { value: 10 },
  'south-west': { value: 9 },
  'north-east': { value: 7 },
  wales: { value: 7 },
};

/** ILLUSTRATIVE. A change in percentage points, with falls as well as rises, to show the diverging scale. */
export const CHANGE_BY_REGION_ILLUSTRATIVE: MapData = {
  london: { value: 3.8 },
  'south-east': { value: 2.6 },
  east: { value: 3.1 },
  'west-midlands': { value: 2.9 },
  'east-midlands': { value: 2.2 },
  'north-west': { value: 2.4 },
  'yorkshire-and-the-humber': { value: 1.7 },
  'south-west': { value: 1.2 },
  'north-east': { value: 1.5 },
  wales: { value: -0.6 },
  scotland: { value: 0.8 },
  'northern-ireland': { value: -1.4 },
};

/**
 * ILLUSTRATIVE values at real places: five immigration removal centres and
 * the Dover arrival point. The sizes are invented to demonstrate scaled
 * symbols; they are not capacities or populations.
 */
export const DETENTION_MARKERS_ILLUSTRATIVE: MapMarker[] = [
  { label: 'Harmondsworth', lon: -0.47, lat: 51.49, value: 640, kind: 'Removal centre' },
  { label: 'Brook House', lon: -0.17, lat: 51.15, value: 400, kind: 'Removal centre' },
  { label: "Yarl's Wood", lon: -0.48, lat: 52.21, value: 280, kind: 'Removal centre' },
  { label: 'Derwentside', lon: -1.85, lat: 54.85, value: 80, kind: 'Removal centre' },
  { label: 'Dungavel', lon: -4.12, lat: 55.63, value: 120, kind: 'Removal centre' },
  { label: 'Dover', lon: 1.31, lat: 51.12, kind: 'Arrival point' },
];

/**
 * Asylum applicants per 10,000 residents, 2024, EU+ and the UK. Real figures:
 * the Migration Observatory's Figure 18 extract, as carried in the
 * `asylum-claims-in-historical-and-european-context` fact. Liechtenstein
 * (21.2) is in the source but not in the tile preset.
 */
export const ASYLUM_PER_10K_2024: MapData = {
  CY: { value: 95.05 },
  GR: { value: 70.84 },
  IS: { value: 50.19 },
  IE: { value: 34.69 },
  ES: { value: 34.17 },
  BE: { value: 33.43 },
  LU: { value: 32.81 },
  CH: { value: 30.81 },
  DE: { value: 30.02 },
  AT: { value: 27.2 },
  IT: { value: 26.9 },
  SI: { value: 26.53 },
  FR: { value: 23.05 },
  BG: { value: 19.02 },
  NL: { value: 18.63 },
  GB: { value: 16.0 },
  MT: { value: 12.87 },
  SE: { value: 10.53 },
  EE: { value: 9.86 },
  NO: { value: 8.9 },
  LV: { value: 5.56 },
  FI: { value: 5.2 },
  PL: { value: 4.58 },
  DK: { value: 3.82 },
  HR: { value: 2.89 },
  PT: { value: 2.5 },
  RO: { value: 1.26 },
  CZ: { value: 1.24 },
  LT: { value: 1.25 },
  SK: { value: 0.28 },
  HU: { value: 0.03, label: '<0.1' },
};

export const ASYLUM_EUROPE_SOURCES: SourceCredit[] = [
  { label: 'The Migration Observatory, University of Oxford', href: 'https://migrationobservatory.ox.ac.uk/resources/briefings/migration-to-the-uk-asylum/' },
];

/**
 * Illustrative only: round numbers for a spread of countries on every
 * continent, chosen to exercise a world map. Not UN estimates.
 */
export const WORLD_SHARE_ILLUSTRATIVE: MapData = {
  US: { value: 15 }, CA: { value: 21 }, MX: { value: 1 }, BR: { value: 1 }, AR: { value: 5 }, CL: { value: 9 },
  GB: { value: 14 }, FR: { value: 13 }, DE: { value: 18 }, ES: { value: 15 }, IT: { value: 11 }, SE: { value: 20 },
  PL: { value: 2 }, RU: { value: 8 }, TR: { value: 7 }, SA: { value: 38 }, AE: { value: 88 }, IR: { value: 3 },
  IN: { value: 0.4 }, CN: { value: 0.1 }, JP: { value: 2 }, KR: { value: 3 }, ID: { value: 0.1 }, AU: { value: 30 },
  NZ: { value: 29 }, ZA: { value: 5 }, NG: { value: 0.6 }, EG: { value: 0.5 }, KE: { value: 2 }, ET: { value: 1 },
};

/** Illustrative only: generated values for every state except Wyoming. Not Census Bureau figures. */
export const US_STATES_ILLUSTRATIVE: MapData = { AK: { value: 9 }, ME: { value: 5 }, VT: { value: 11 }, NH: { value: 20 }, WA: { value: 3 }, ID: { value: 4 }, MT: { value: 15 }, ND: { value: 4 }, MN: { value: 9 }, IL: { value: 17 }, WI: { value: 3 }, MI: { value: 15 }, NY: { value: 6 }, RI: { value: 3 }, MA: { value: 4 }, OR: { value: 11 }, NV: { value: 11 }, SD: { value: 4 }, IA: { value: 6 }, IN: { value: 4 }, OH: { value: 15 }, PA: { value: 11 }, NJ: { value: 3 }, CT: { value: 17 }, CA: { value: 4 }, UT: { value: 6 }, CO: { value: 20 }, NE: { value: 20 }, MO: { value: 17 }, KY: { value: 3 }, WV: { value: 17 }, VA: { value: 17 }, MD: { value: 11 }, DE: { value: 3 }, AZ: { value: 6 }, NM: { value: 3 }, KS: { value: 15 }, AR: { value: 5 }, TN: { value: 8 }, NC: { value: 11 }, SC: { value: 5 }, DC: { value: 15 }, OK: { value: 4 }, LA: { value: 17 }, MS: { value: 8 }, AL: { value: 15 }, GA: { value: 20 }, HI: { value: 5 }, TX: { value: 4 }, FL: { value: 17 } };
