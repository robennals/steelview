import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GeoMap, type GeoMapProps } from '../geo-map';
import { EUROPE_COUNTRIES, EUROPE_EXTENT } from '../geo/europe-countries';
import { partitionRegions } from '../geo/regions';
import { UK_ITL1_REGIONS } from '../geo/uk-itl1';
import { WORLD_COUNTRIES } from '../geo/world-countries';
import {
  ASYLUM_EUROPE_SOURCES,
  ASYLUM_PER_10K_2024,
  BORN_ABROAD_BY_REGION_ILLUSTRATIVE,
  CHANGE_BY_REGION_ILLUSTRATIVE,
  DETENTION_MARKERS_ILLUSTRATIVE,
  IDEA_POSTAL_SOURCES,
  IDEA_POSTAL_VOTING_2025,
  ILLUSTRATIVE,
  WORLD_SHARE_ILLUSTRATIVE,
} from './fixtures/maps';

const europe = partitionRegions(EUROPE_COUNTRIES, Object.keys(ASYLUM_PER_10K_2024));
const world = partitionRegions(WORLD_COUNTRIES, Object.keys(WORLD_SHARE_ILLUSTRATIVE));

const meta = {
  title: 'Maps/GeoMap',
  component: GeoMap,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A choropleth over real outlines — any `GeoRegion[]`. Presets: `WORLD_COUNTRIES` and `EUROPE_COUNTRIES` (Natural Earth, ISO 2-letter ids) and `UK_ITL1_REGIONS` (ONS). Use it when *where* matters: a regional pattern, or point locations drawn as markers. The drawing takes its proportions from the geography, and the projection is chosen from the extent — a local projection for one country, equal-area Equal Earth for a continent or the world. Covered areas with no figure are hatched as "No data", never shaded as zero; neighbours outside the dataset go in `contextRegions` and are drawn plainly (`partitionRegions` splits a preset for you). Small areas can be redrawn in enlarged `insets`. Hover or tab to an area for its value; the Table switch lists every figure. When the only question is which areas are higher, prefer TileMap.',
      },
    },
  },
  args: {
    title: 'Asylum applicants per 10,000 residents, 2024',
    description: 'EU+ countries and the UK. The colour steps are uneven because Cyprus and Greece sit far above the rest. Malta and Luxembourg are too small to see at this scale, so they are enlarged below the map.',
    regions: europe.regions,
    contextRegions: europe.context,
    extent: EUROPE_EXTENT,
    data: ASYLUM_PER_10K_2024,
    valueLabel: 'Asylum applicants per 10,000 residents',
    areaLabel: 'Country',
    format: { unit: 'number', decimals: 1 },
    breaks: [0, 5, 10, 20, 30, 50, 100],
    insets: [{ regionIds: ['MT'] }, { regionIds: ['LU'] }],
    sources: ASYLUM_EUROPE_SOURCES,
  },
} satisfies Meta<typeof GeoMap>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A continent: real data, neighbours as plain context, two small states enlarged. */
export const Europe: Story = {};

/** The whole world on the equal-area Equal Earth projection. */
export const World: Story = {
  args: {
    title: 'Share of residents born abroad, selected countries',
    description: 'Illustrative data: round numbers chosen to demonstrate the component, not checked against UN estimates. Countries outside the illustrative set are drawn plainly as context.',
    regions: world.regions,
    contextRegions: world.context,
    extent: undefined,
    data: WORLD_SHARE_ILLUSTRATIVE,
    valueLabel: 'Share of residents born abroad',
    format: { unit: 'percent', decimals: 0 },
    breaks: undefined,
    steps: 5,
    insets: undefined,
    sources: ILLUSTRATIVE,
  },
};

// `satisfies`, not a type annotation: GeoMapProps is a union of the numeric
// and categorical encodings, and a spread typed as that union carries the
// categorical branch, which forbids the numeric fields each story adds.
const ukRegions = {
  regions: UK_ITL1_REGIONS,
  contextRegions: undefined,
  extent: undefined,
  areaLabel: 'Region',
  breaks: undefined,
  insets: [{ regionIds: ['london'] }],
  sources: ILLUSTRATIVE,
} satisfies Partial<GeoMapProps>;

/** One country's regions, with a capital enlarged and two regions the source does not cover. */
export const CountryRegions: Story = {
  args: {
    ...ukRegions,
    title: 'Share of residents born outside the UK, by region',
    description: 'Illustrative data: rounded figures shaped like the 2021 Census pattern, not checked against the ONS tables. Scotland and Northern Ireland are outside the England and Wales Census, so they show as No data.',
    valueLabel: 'Share of usual residents born outside the UK',
    data: BORN_ABROAD_BY_REGION_ILLUSTRATIVE,
    format: { unit: 'percent', decimals: 0 },
    steps: 5,
  },
};

/** Diverging scale for a change that is negative in some areas. */
export const Diverging: Story = {
  args: {
    ...ukRegions,
    title: 'Change in the share born abroad, by region',
    description: 'Illustrative data, in percentage points. Falls are shaded towards the other end of the scale; zero is a bin boundary.',
    valueLabel: 'Change in share born abroad, percentage points',
    data: CHANGE_BY_REGION_ILLUSTRATIVE,
    format: { unit: 'number', decimals: 1, signed: true },
    scale: 'diverging',
    steps: 6,
  },
};

/** Point markers sized by value, grouped into kinds by shape. */
export const WithMarkers: Story = {
  args: {
    ...ukRegions,
    title: 'Immigration removal centres and arrival points',
    description: 'Illustrative data: real places, invented sizes. Symbols are scaled by area; kinds are told apart by shape.',
    valueLabel: 'Share of usual residents born outside the UK',
    data: BORN_ABROAD_BY_REGION_ILLUSTRATIVE,
    format: { unit: 'percent', decimals: 0 },
    steps: 5,
    markers: DETENTION_MARKERS_ILLUSTRATIVE,
    markerValueLabel: 'People held',
  },
};

/**
 * Categorical mode on the world map: who may vote by post, by country. Each
 * category is a tint with its own pattern, so it reads in greyscale; the
 * legend counts each one. Only the thirteen countries the research draft
 * confirms are assigned — the rest of IDEA's lists are still to be extracted
 * from its tables, so every other country is hatched as "No data".
 */
export const CategoricalIdeaPostalVoting: Story = {
  args: {
    title: 'Who may vote by post in their own country',
    description: 'Eleven countries open in-country postal voting to all voters and two to some, among those checked so far. Every other country is not yet extracted from IDEA\'s tables, so it shows as No data, not as "no postal voting". Liechtenstein (all voters) is too small to draw at this scale.',
    regions: WORLD_COUNTRIES,
    contextRegions: undefined,
    extent: undefined,
    ...IDEA_POSTAL_VOTING_2025,
    data: undefined,
    valueLabel: undefined,
    format: undefined,
    breaks: undefined,
    insets: [{ regionIds: ['LU'] }],
    areaLabel: 'Country',
    sources: IDEA_POSTAL_SOURCES,
  },
};
