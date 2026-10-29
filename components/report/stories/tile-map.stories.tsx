import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TileMap } from '../tile-map';
import { EUROPE_COUNTRY_TILES, UK_REGION_TILES, US_STATE_TILES } from '../geo/tiles';
import {
  ASYLUM_EUROPE_SOURCES,
  US_STATES_ILLUSTRATIVE,
  ASYLUM_PER_10K_2024,
  BORN_ABROAD_BY_REGION_ILLUSTRATIVE,
  CHANGE_BY_REGION_ILLUSTRATIVE,
  ILLUSTRATIVE,
  NCSL_VOTER_ID_SOURCES,
  US_VOTER_ID_RULES_2026,
} from './fixtures/maps';

const meta = {
  title: 'Maps/TileMap',
  component: TileMap,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A grid cartogram: every area one equal tile, placed roughly where it sits on the map, shaded on the same stepped scale as GeoMap and labelled with its code and value. Use it to compare areas of very different size fairly — European countries by asylum claims per head, states or regions by a rate — where a true-shape map would let the largest landmass dominate. Presets: `EUROPE_COUNTRY_TILES` (EU27 plus UK, Norway, Switzerland and Iceland, ISO 2-letter ids), `US_STATE_TILES` (50 states plus DC, USPS codes) and `UK_REGION_TILES` (ids match `UK_ITL1_REGIONS`). Any `MapTile[]` grid works.',
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
    note: 'Includes applicants and dependants, not grants of protection. Liechtenstein (21.2 per 10,000) is in the source but not in this tile layout.',
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
