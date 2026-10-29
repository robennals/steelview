import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AreaMap, type AreaMapProps } from '../area-map';
import { EUROPE_COUNTRIES, EUROPE_EXTENT } from '../geo/europe-countries';
import { partitionRegions } from '../geo/regions';
import { EUROPE_COUNTRY_TILES, UK_REGION_TILES, US_STATE_TILES, US_TERRITORY_TILES } from '../geo/tiles';
import { UK_ITL1_REGIONS } from '../geo/uk-itl1';
import { US_STATES, US_TERRITORIES } from '../geo/us-states';
import { WORLD_COUNTRIES } from '../geo/world-countries';
import { WORLD_COUNTRY_TILES } from '../geo/world-tiles';
import {
  ASYLUM_EUROPE_SOURCES,
  ASYLUM_PER_10K_2024,
  BORN_ABROAD_BY_REGION_ILLUSTRATIVE,
  IDEA_POSTAL_SOURCES,
  IDEA_POSTAL_VOTING_2025,
  ILLUSTRATIVE,
  NCSL_VOTER_ID_SOURCES,
  US_STATES_ILLUSTRATIVE,
  US_TERRITORIES_ILLUSTRATIVE,
  US_VOTER_ID_RULES_2026,
} from './fixtures/maps';

const europe = partitionRegions(EUROPE_COUNTRIES, EUROPE_COUNTRY_TILES.map(tile => tile.id));
const world = partitionRegions(WORLD_COUNTRIES, WORLD_COUNTRY_TILES.map(tile => tile.id));

const meta = {
  title: 'Maps/AreaMap',
  component: AreaMap,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One dataset drawn two ways from one legend: real shapes (GeoMap\'s drawing), where a reader sees where things are, and equal tiles (TileMap\'s), where a small state counts as much as a large one and is as easy to point at. A switch moves between Map, Tiles and Table; `defaultView` picks the view shown first, which is also what a reader without JavaScript sees beside the table. Pass a tile layout and the outlines with the same ids — `US_STATE_TILES` with `US_STATES`, `EUROPE_COUNTRY_TILES` with `EUROPE_COUNTRIES`, `UK_REGION_TILES` with `UK_ITL1_REGIONS`, `WORLD_COUNTRY_TILES` with `WORLD_COUNTRIES` — and any other outlines as `contextRegions`. Content reaches it as the `map` figure kind. Areas too small to outline are dots in the map view; every area is focusable in both views with the same readout.',
      },
    },
  },
  args: {
    title: 'Share of residents born abroad, by state',
    description: 'Illustrative data: values generated to exercise the layout, not Census Bureau figures. Wyoming is left out to show how a missing state reads.',
    tiles: US_STATE_TILES,
    regions: US_STATES,
    data: US_STATES_ILLUSTRATIVE,
    valueLabel: 'Share of residents born abroad',
    format: { unit: 'percent', decimals: 0 },
    steps: 5,
    areaLabel: 'State',
    sources: ILLUSTRATIVE,
  },
} satisfies Meta<typeof AreaMap>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The US in real shapes, Alaska and Hawaii moved below the 48 as usual. Washington DC is a dot. */
export const UsStatesMap: Story = {};

/** The same data opening on its tiles: Alaska, California and Texas span several cells. */
export const UsStatesTiles: Story = { args: { defaultView: 'tiles' } };

/** A dataset that covers the territories: a row under the tiles, dots beside moved Hawaii and east of Florida on the map. */
export const UsStatesAndTerritories: Story = {
  args: {
    title: 'Share of residents born abroad, states and territories',
    description: 'Illustrative data, not Census Bureau figures. Puerto Rico is outlined.',
    tiles: [...US_STATE_TILES, ...US_TERRITORY_TILES],
    regions: [...US_STATES, ...US_TERRITORIES],
    data: { ...US_STATES_ILLUSTRATIVE, ...US_TERRITORIES_ILLUSTRATIVE },
    breaks: [0, 5, 10, 20, 30, 50],
    steps: undefined,
    highlight: ['PR'],
    areaLabel: 'State or territory',
  },
};

/** Categorical, on tiles: each rule a tint, a pattern and a printed mark, in both views. */
export const UsCategoricalTiles: Story = {
  args: {
    title: 'Voter ID rules at the polls, by state, 2026',
    description: 'Thirty-six states ask voters for identification at the polls; fourteen and Washington, D.C., ask for no document.',
    ...US_VOTER_ID_RULES_2026,
    data: undefined,
    valueLabel: undefined,
    format: undefined,
    steps: undefined,
    defaultView: 'tiles',
    sources: NCSL_VOTER_ID_SOURCES,
  },
};

// `satisfies`, not a type annotation: AreaMapProps is a union of the numeric
// and categorical encodings, and a spread typed as that union carries the
// categorical branch, which forbids the numeric fields each story adds.
const europeArgs = {
  title: 'Asylum applicants per 10,000 residents, 2024',
  description: 'EU+ countries and the UK; the UK is outlined. Liechtenstein, a dot on the map, is a full tile in the grid.',
  tiles: EUROPE_COUNTRY_TILES,
  regions: europe.regions,
  contextRegions: europe.context,
  extent: EUROPE_EXTENT,
  data: ASYLUM_PER_10K_2024,
  valueLabel: 'Asylum applicants per 10,000 residents',
  format: { unit: 'number', decimals: 1 },
  breaks: [0, 5, 10, 20, 30, 50, 100],
  steps: undefined,
  highlight: ['GB'],
  insets: [{ regionIds: ['MT'] }, { regionIds: ['LU'] }],
  areaLabel: 'Country',
  sources: ASYLUM_EUROPE_SOURCES,
} satisfies Partial<AreaMapProps>;

/** Europe in real shapes, its neighbours as plain context and two small states enlarged. */
export const EuropeMap: Story = { args: europeArgs };

/** Europe as tiles: the EU27, the EFTA states and the UK. */
export const EuropeTiles: Story = { args: { ...europeArgs, defaultView: 'tiles' } };

const ukArgs = {
  title: 'Share of residents born outside the UK, by region',
  description: 'Illustrative data shaped like the 2021 Census pattern. Scotland and Northern Ireland are outside the England and Wales Census.',
  tiles: UK_REGION_TILES,
  regions: UK_ITL1_REGIONS,
  data: BORN_ABROAD_BY_REGION_ILLUSTRATIVE,
  valueLabel: 'Share of usual residents born outside the UK',
  format: { unit: 'percent', decimals: 0 },
  insets: [{ regionIds: ['london'] }],
  areaLabel: 'Region',
} satisfies Partial<AreaMapProps>;

/** UK regions in real shapes, London enlarged. */
export const UkRegionsMap: Story = { args: ukArgs };

/** UK regions as tiles. */
export const UkRegionsTiles: Story = { args: { ...ukArgs, defaultView: 'tiles' } };

const worldArgs = {
  title: 'Who may vote by post in their own country',
  description: 'Eleven countries open in-country postal voting to all voters and two to some, among those checked so far. Liechtenstein is outlined: a dot between Switzerland and Austria on the map, a tile of its own in the grid.',
  tiles: WORLD_COUNTRY_TILES,
  regions: world.regions,
  contextRegions: world.context,
  ...IDEA_POSTAL_VOTING_2025,
  data: undefined,
  valueLabel: undefined,
  format: undefined,
  steps: undefined,
  highlight: ['LI'],
  areaLabel: 'Country',
  sources: IDEA_POSTAL_SOURCES,
  note: 'Countries not yet extracted from IDEA\'s tables read No data. Territories such as Greenland are drawn plainly: they are not countries in the dataset.',
} satisfies Partial<AreaMapProps>;

/** The world in real shapes: the 29 states too small to outline are dots, Liechtenstein highlighted. */
export const WorldMap: Story = { args: worldArgs };

/** The world as one tile per sovereign state: Liechtenstein as big as Germany. */
export const WorldTiles: Story = { args: { ...worldArgs, defaultView: 'tiles' } };

/**
 * Numeric figures the source qualifies, in both views: a bound adds ▲ or ▼
 * to its tile, every inexact area is stippled, and the legend explains each
 * mark that appears.
 */
export const QualifiedValues: Story = {
  args: {
    title: 'Mail ballots rejected, by state',
    description: 'Illustrative: some states publish only a bound, an approximation or a range.',
    valueLabel: 'Rejected, % of returned mail ballots',
    format: { unit: 'percent', decimals: 1 },
    breaks: [0, 0.5, 1, 2, 4, 9],
    steps: undefined,
    data: {
      AR: { value: 8.8 },
      TX: { value: 2, qualifier: 'at least', asPublished: 'at least 2%' },
      CA: { value: 1, qualifier: 'under', asPublished: 'under 1%' },
      NY: { value: 1.5, qualifier: 'about', asPublished: 'about 1.5%' },
      FL: { low: 0.4, high: 0.8, asPublished: '0.4% to 0.8%' },
      OH: { value: 0.9 },
    },
    note: 'Illustrative: only six states are given.',
  },
};
