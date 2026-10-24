/*
 * GENERATED FROM content/topics/uk-immigration/facts — each claim is a fact's
 * `assessedClaim`, its status the fact's `status`, its finding the fact's
 * `claim`, and its sources the fact's `claimSources`. Caveats are the
 * facts' `dataStillNeeded` entries, verbatim.
 */
import type { ClaimCheckProps } from '../../claim-check';
import type { Caveat } from '../../caveat-list';

type ClaimFixture = Pick<ClaimCheckProps, 'claim' | 'status' | 'finding' | 'sources' | 'evidence'>;

export const assessedClaims: ClaimFixture[] = [
  {
    "claim": "The rise in UK immigration after 2021 was driven by people arriving illegally",
    "status": "not-supported",
    "finding": "Detected illegal arrivals numbered 46,497 in 2025, compared with 813,000 long-term arrivals in the same year. That ratio is 5.7%; detections do not measure every irregular entry.",
    "sources": [
      {
        "label": "Home Office",
        "href": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-december-2025/how-many-people-come-to-the-uk-via-illegal-entry-routes"
      },
      {
        "label": "Office for National Statistics",
        "href": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025"
      },
      {
        "label": "Home Office",
        "href": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/how-many-people-come-to-the-uk-via-illegal-entry-routes"
      }
    ],
    "evidence": {
      "href": "/topics/uk-immigration/facts/illegal-arrivals-drove-the-net-migration-rise",
      "label": "See the evidence: Irregular Arrivals and Overall Migration"
    }
  },
  {
    "claim": "People coming to the UK on visas can claim benefits",
    "status": "complicated",
    "finding": "The No Recourse to Public Funds condition normally prevents people on work, study and family visas from accessing most mainstream benefits before settlement; eligibility differs by immigration status.",
    "sources": [
      {
        "label": "The Migration Observatory, University of Oxford",
        "href": "https://migrationobservatory.ox.ac.uk/resources/briefings/the-fiscal-impact-of-immigration-in-the-uk/"
      }
    ],
    "evidence": {
      "href": "/topics/uk-immigration/facts/migrants-access-to-benefits",
      "label": "See the evidence: Immigration Status and Access to Benefits"
    }
  },
  {
    "claim": "The British public wants immigration reduced",
    "status": "complicated",
    "finding": "In April 2023, 52% wanted immigration reduced, while 32% described immigration as bad. The questions measure different attitudes and should not be treated as interchangeable.",
    "sources": [
      {
        "label": "The Migration Observatory, University of Oxford",
        "href": "https://migrationobservatory.ox.ac.uk/resources/briefings/uk-public-opinion-toward-immigration-overall-attitudes-and-level-of-concern/"
      }
    ],
    "evidence": {
      "href": "/topics/uk-immigration/facts/public-opinion-on-immigration",
      "label": "See the evidence: Immigration Polling and Question Wording"
    }
  },
  {
    "claim": "Rising local immigration lowers trust and cohesion within the receiving community",
    "status": "unknown",
    "finding": "British studies disagree about the relationship between ethnic diversity and social trust; some find no strong erosion of cohesion after accounting for deprivation. These studies do not directly establish the effect of immigration.",
    "sources": [
      {
        "label": "The Migration Observatory, University of Oxford",
        "href": "https://migrationobservatory.ox.ac.uk/resources/briefings/immigration-diversity-and-social-cohesion/"
      },
      {
        "label": "The Migration Observatory, University of Oxford",
        "href": "https://migrationobservatory.ox.ac.uk/resources/briefings/immigration-diversity-and-social-cohesion/"
      },
      {
        "label": "The Migration Observatory, University of Oxford",
        "href": "https://migrationobservatory.ox.ac.uk/resources/briefings/immigration-diversity-and-social-cohesion/"
      }
    ],
    "evidence": {
      "href": "/topics/uk-immigration/facts/immigration-and-local-social-trust",
      "label": "See the evidence: Immigration, Diversity and Social Trust"
    }
  },
  {
    "claim": "Britain is becoming a Muslim country, and immigration is why",
    "status": "complicated",
    "finding": "In England and Wales, 6.5% identified as Muslim in 2021, up from 4.9% in 2011; 37.2% reported no religion, up from 25.2%. Religious affiliation is not a measure of immigration.",
    "sources": [
      {
        "label": "Office for National Statistics",
        "href": "https://www.ons.gov.uk/peoplepopulationandcommunity/culturalidentity/religion/bulletins/religionenglandandwales/census2021"
      },
      {
        "label": "Office for National Statistics",
        "href": "https://www.ons.gov.uk/peoplepopulationandcommunity/culturalidentity/religion/bulletins/religionenglandandwales/census2021"
      }
    ],
    "evidence": {
      "href": "/topics/uk-immigration/facts/religious-composition-at-the-2021-census",
      "label": "See the evidence: Religious Composition of the Population"
    }
  }
];

/** From "Incoming Immigrant Composition". */
export const compositionDataNeeded: Caveat[] = [
  {
    "measure": "A complete annual nationality or source-defined regional distribution of long-term immigration",
    "why": "The ONS workbook publishes only the ten highest-contributing non-EU+ nationalities, insufficient to calculate Africa, Middle East or East Asia totals or to reduce the residual below the largest named group."
  },
  {
    "measure": "Religion of annual immigrants and asylum applicants",
    "why": "Religion is not recorded in the migration-flow datasets."
  }
];

/** From "Population Composition". */
export const populationDataNeeded: Caveat[] = [
  {
    "measure": "A comparable religion trend before 2001",
    "why": "England and Wales first asked the voluntary religion question in the 2001 Census, so no equivalent official Census series exists before it."
  },
  {
    "measure": "A comparable ethnicity trend before 1991",
    "why": "The England-and-Wales Census first asked an ethnic-group question in 1991. Earlier categories are not a comparable population series."
  }
];
