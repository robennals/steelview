import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TileMap } from '../tile-map';
import { EUROPE_COUNTRY_TILES, UK_REGION_TILES, US_STATE_TILES, US_TERRITORY_TILES } from '../geo/tiles';
import { WORLD_COUNTRY_TILES } from '../geo/world-tiles';
import {
  ASYLUM_EUROPE_SOURCES,
  US_STATES_ILLUSTRATIVE,
  US_TERRITORIES_ILLUSTRATIVE,
  ASYLUM_PER_10K_2024,
  BORN_ABROAD_BY_REGION_ILLUSTRATIVE,
  CHANGE_BY_REGION_ILLUSTRATIVE,
  IDEA_POSTAL_SOURCES,
  IDEA_POSTAL_VOTING_2025,
  ILLUSTRATIVE,
  NCSL_VOTER_ID_SOURCES,
  US_VOTER_ID_RULES_2026,
  WORLD_SHARE_ILLUSTRATIVE,
} from './fixtures/maps';

const meta = {
  title: 'Maps/TileMap',
  component: TileMap,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A grid cartogram: every area one equal tile, placed roughly where it sits on the map, shaded on the same stepped scale as GeoMap and labelled with its code and value. Use it to compare areas of very different size fairly — European countries by asylum claims per head, states or regions by a rate — where a true-shape map would let the largest landmass dominate. Presets: `EUROPE_COUNTRY_TILES` (the EU27, the four EFTA states and the UK, ISO 2-letter ids), `US_STATE_TILES` (50 states plus DC, USPS codes; add `US_TERRITORY_TILES` for a row of the five territories), `UK_REGION_TILES` (ids match `UK_ITL1_REGIONS`) and `WORLD_COUNTRY_TILES` (one tile per sovereign state, ids matching `WORLD_COUNTRIES`; too dense to print values, so its tiles carry codes and marks and the grid scrolls sideways on a phone). Any `MapTile[]` grid works; a tile may span cells (`w`, `h`), as Alaska, California and Texas do in the US layout. To offer real shapes beside the tiles, use AreaMap.',
      },
    },
  },
  args: {
    title: 'Asylum applicants per 10,000 residents, 2024',
    description: 'EU+ countries and the UK. The UK is outlined; it ranked seventeenth per head. The colour steps are uneven because Cyprus and Greece sit far above the rest.',
    breaks: [0, 5, 10, 20, 30, 50, 100],
    tiles: EUROPE_COUNTRY_TILES,
    data: ASYLUM_PER_10K_2024,
    valueLabel: 'Asylum applicants per 10,000 residents',
    format: { unit: 'number', decimals: 1 },
    highlight: ['GB'],
    areaLabel: 'Country',
    sources: ASYLUM_EUROPE_SOURCES,
    note: 'Includes applicants and dependants, not grants of protection.',
  },
} satisfies Meta<typeof TileMap>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Real figures: the per-head comparison the asylum fact carries as a bar chart. */
export const EuropeAsylumPerHead: Story = {};

/** The fifty US states and DC, with one state missing from the source. */
export const UsStates: Story = {
  args: {
    title: 'Share of residents born abroad, by state',
    description: 'Illustrative data: values generated to exercise the layout, not Census Bureau figures. Wyoming is left out to show how a missing state reads.',
    tiles: US_STATE_TILES,
    data: US_STATES_ILLUSTRATIVE,
    valueLabel: 'Share of residents born abroad',
    format: { unit: 'percent', decimals: 0 },
    highlight: [],
    breaks: undefined,
    steps: 5,
    areaLabel: 'State',
    sources: ILLUSTRATIVE,
    note: undefined,
  },
};

/** The states and, under them, the five territories: the row a US map gains when its data covers one. */
export const UsStatesAndTerritories: Story = {
  args: {
    title: 'Share of residents born abroad, states and territories',
    description: 'Illustrative data: values generated to exercise the layout, not Census Bureau figures. The territories sit in their own row under the states; Wyoming is left out to show how a missing state reads.',
    tiles: [...US_STATE_TILES, ...US_TERRITORY_TILES],
    data: { ...US_STATES_ILLUSTRATIVE, ...US_TERRITORIES_ILLUSTRATIVE },
    valueLabel: 'Share of residents born abroad',
    format: { unit: 'percent', decimals: 0 },
    highlight: [],
    breaks: [0, 5, 10, 20, 30, 50],
    areaLabel: 'State or territory',
    sources: ILLUSTRATIVE,
    note: undefined,
  },
};

/** One country's regions, with two missing from the source. */
export const UkRegions: Story = {
  args: {
    title: 'Share of residents born outside the UK, by region',
    description: 'Illustrative data: rounded figures shaped like the 2021 Census pattern. Scotland and Northern Ireland are outside the England and Wales Census.',
    tiles: UK_REGION_TILES,
    data: BORN_ABROAD_BY_REGION_ILLUSTRATIVE,
    valueLabel: 'Share of usual residents born outside the UK',
    format: { unit: 'percent', decimals: 0 },
    highlight: [],
    breaks: undefined,
    areaLabel: 'Region',
    sources: ILLUSTRATIVE,
    note: undefined,
  },
};

/** Diverging scale on the UK grid. */
export const UkDiverging: Story = {
  args: {
    title: 'Change in the share born abroad, by region',
    description: 'Illustrative data, in percentage points.',
    tiles: UK_REGION_TILES,
    data: CHANGE_BY_REGION_ILLUSTRATIVE,
    valueLabel: 'Change, percentage points',
    format: { unit: 'number', decimals: 1, signed: true },
    scale: 'diverging',
    highlight: [],
    breaks: undefined,
    areaLabel: 'Region',
    sources: ILLUSTRATIVE,
    note: undefined,
  },
};

/**
 * Categorical mode: a rule per state rather than a number. Each category has
 * a tint, a pattern and a code printed on its tiles (SP, SN, P, N, —), so the
 * map reads in greyscale; the legend counts each category, and the table
 * groups the states under their rule.
 */
export const CategoricalVoterIdRules: Story = {
  args: {
    title: 'Voter ID rules at the polls, by state, 2026',
    description: 'Thirty-six states ask voters for identification at the polls; fourteen and Washington, D.C., ask for no document. "Strict" states make a voter without ID cast a provisional ballot that counts only after further steps.',
    tiles: US_STATE_TILES,
    ...US_VOTER_ID_RULES_2026,
    data: undefined,
    valueLabel: undefined,
    format: undefined,
    breaks: undefined,
    highlight: [],
    areaLabel: 'State',
    sources: NCSL_VOTER_ID_SOURCES,
    note: 'NCSL classifies each state by what happens to a voter who arrives without the requested ID. Table 2 of the same source lists the accepted documents state by state.',
  },
};

/**
 * Numeric figures the source qualifies: each keeps its colour, a bound adds
 * ▲ or ▼ to its tile, and every inexact tile is stippled, so "not exact"
 * reads in greyscale. The legend explains each mark that appears; the
 * readout and the Table view use the source's words.
 */
export const QualifiedValues: Story = {
  args: {
    title: 'Mail ballots rejected, by state',
    description: 'Illustrative: some states publish only a bound, an approximation or a range.',
    tiles: US_STATE_TILES,
    valueLabel: 'Rejected, % of returned mail ballots',
    format: { unit: 'percent', decimals: 1 },
    breaks: [0, 0.5, 1, 2, 4, 9],
    categories: undefined,
    categoryLabel: undefined,
    categoryData: undefined,
    data: {
      AR: { value: 8.8 },
      TX: { value: 2, qualifier: 'at least', asPublished: 'at least 2%' },
      CA: { value: 1, qualifier: 'under', asPublished: 'under 1%' },
      NY: { value: 1.5, qualifier: 'about', asPublished: 'about 1.5%' },
      FL: { low: 0.4, high: 0.8, asPublished: '0.4% to 0.8%' },
      OH: { value: 0.9 },
      GA: { value: 1.2 },
      PA: { value: 0.7, qualifier: 'nearly' },
    },
    highlight: [],
    areaLabel: 'State',
    sources: ILLUSTRATIVE,
    note: 'Illustrative: only eight states are given.',
  },
};

/**
 * The world as one tile per sovereign state: Liechtenstein, Tuvalu and
 * Palau are as easy to see and point at as their neighbours. The grid is
 * too dense to print a category's name, so each tile carries its mark.
 */
export const WorldCategorical: Story = {
  args: {
    title: 'Who may vote by post in their own country',
    description: 'Eleven countries open in-country postal voting to all voters and two to some, among those checked so far; every other country is not yet extracted from IDEA\'s tables. Liechtenstein is outlined.',
    tiles: WORLD_COUNTRY_TILES,
    ...IDEA_POSTAL_VOTING_2025,
    data: undefined,
    valueLabel: undefined,
    format: undefined,
    breaks: undefined,
    highlight: ['LI'],
    areaLabel: 'Country',
    sources: IDEA_POSTAL_SOURCES,
    note: 'Countries not yet extracted from IDEA\'s tables read No data.',
  },
};

/** A numeric world grid: values are read in the readout and the table, not printed on the tiles. */
export const WorldNumeric: Story = {
  args: {
    title: 'Share of residents born abroad, selected countries',
    description: 'Illustrative data: round numbers chosen to demonstrate the component, not checked against UN estimates.',
    tiles: WORLD_COUNTRY_TILES,
    data: WORLD_SHARE_ILLUSTRATIVE,
    valueLabel: 'Share of residents born abroad',
    format: { unit: 'percent', decimals: 0 },
    highlight: [],
    breaks: [0, 1, 5, 10, 20, 100],
    areaLabel: 'Country',
    sources: ILLUSTRATIVE,
    note: 'Illustrative: thirty countries are given; the rest read No data.',
  },
};
