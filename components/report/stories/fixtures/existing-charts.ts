/*
 * GENERATED FROM content/topics/uk-immigration/facts — real frontmatter
 * copied verbatim so the existing charts are shown with the data they draw
 * on the site. Fact bodies are left empty: the charts do not read them.
 */
import type { Fact, Series, Source } from '@/lib/content/types';

/** "UK immigration, emigration and net migration, 1964–2025" — two readings, three method breaks. */
export const longRunMigrationSeries: Series = {
  "title": "UK immigration, emigration and net migration, 1964–2025",
  "description": "Annual long-term arrivals, departures and their difference, from 1964 to 2025. A long-term move means a stay of at least a year.",
  "periodLabel": "Year",
  "coverage": {
    "from": "1964",
    "to": "2025",
    "note": "1964 is where the series starts because it is where the ONS method starts — before it there is no continuous annual series to show."
  },
  "breaks": [
    {
      "period": "1991",
      "label": "LTIM replaces IPS-alone estimates",
      "note": "ONS: \"Annual LTIM estimates from 1991 onwards can be directly compared with one another. However, annual estimates before 1991 use a different methodology and cannot be directly compared with more recent figures.\""
    },
    {
      "period": "2012",
      "label": "Administrative data replaces the survey, backdated to here",
      "note": "ONS: \"These official statistics in development based on administrative data provide a more accurate picture of international migration over this period than our previously published estimates based on the International Passenger Survey (IPS), which underestimated migration of some groups.\""
    },
    {
      "period": "2021-06",
      "label": "Administrative data replaces the IPS outright",
      "note": "ONS: \"Due to changes in methodology, comparisons between pre-June 2021 and post-June 2021 estimates should be treated with caution.\""
    }
  ],
  "source": {
    "stance": "complicates",
    "quote": "Due to changes in methodology, comparisons between pre-June 2021 and post-June 2021 estimates should be treated with caution.",
    "title": "Immigration, emigration and net migration into the UK, 1964 - 2025 (data download)",
    "url": "https://www.ons.gov.uk/visualisations/dvc3417/line-chart/datadownload.xlsx",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  "readings": [
    {
      "id": "people",
      "label": "UK Migration Over Time",
      "unit": "count",
      "valueLabel": "People moving to or from the UK for a year or more",
      "lines": [
        {
          "name": "Immigration",
          "points": [
            {
              "period": "1964",
              "value": 211000
            },
            {
              "period": "1965",
              "value": 206000
            },
            {
              "period": "1966",
              "value": 219000
            },
            {
              "period": "1967",
              "value": 225000
            },
            {
              "period": "1968",
              "value": 222000
            },
            {
              "period": "1969",
              "value": 206000
            },
            {
              "period": "1970",
              "value": 226000
            },
            {
              "period": "1971",
              "value": 200000
            },
            {
              "period": "1972",
              "value": 222000
            },
            {
              "period": "1973",
              "value": 196000
            },
            {
              "period": "1974",
              "value": 184000
            },
            {
              "period": "1975",
              "value": 197000
            },
            {
              "period": "1976",
              "value": 191000
            },
            {
              "period": "1977",
              "value": 162000
            },
            {
              "period": "1978",
              "value": 187000
            },
            {
              "period": "1979",
              "value": 195000
            },
            {
              "period": "1980",
              "value": 173000
            },
            {
              "period": "1981",
              "value": 153000
            },
            {
              "period": "1982",
              "value": 201000
            },
            {
              "period": "1983",
              "value": 202000
            },
            {
              "period": "1984",
              "value": 201000
            },
            {
              "period": "1985",
              "value": 232000
            },
            {
              "period": "1986",
              "value": 250000
            },
            {
              "period": "1987",
              "value": 211000
            },
            {
              "period": "1988",
              "value": 216000
            },
            {
              "period": "1989",
              "value": 250000
            },
            {
              "period": "1990",
              "value": 267000
            },
            {
              "period": "1991",
              "value": 329000
            },
            {
              "period": "1992",
              "value": 268000
            },
            {
              "period": "1993",
              "value": 266000
            },
            {
              "period": "1994",
              "value": 315000
            },
            {
              "period": "1995",
              "value": 312000
            },
            {
              "period": "1996",
              "value": 318000
            },
            {
              "period": "1997",
              "value": 327000
            },
            {
              "period": "1998",
              "value": 391000
            },
            {
              "period": "1999",
              "value": 454000
            },
            {
              "period": "2000",
              "value": 479000
            },
            {
              "period": "2001",
              "value": 481000
            },
            {
              "period": "2002",
              "value": 516000
            },
            {
              "period": "2003",
              "value": 511000
            },
            {
              "period": "2004",
              "value": 589000
            },
            {
              "period": "2005",
              "value": 567000
            },
            {
              "period": "2006",
              "value": 596000
            },
            {
              "period": "2007",
              "value": 574000
            },
            {
              "period": "2008",
              "value": 590000
            },
            {
              "period": "2009",
              "value": 567000
            },
            {
              "period": "2010",
              "value": 591000
            },
            {
              "period": "2011",
              "value": 566000
            },
            {
              "period": "2012",
              "value": 643000
            },
            {
              "period": "2013",
              "value": 713000
            },
            {
              "period": "2014",
              "value": 778000
            },
            {
              "period": "2015",
              "value": 797000
            },
            {
              "period": "2016",
              "value": 772000
            },
            {
              "period": "2017",
              "value": 752000
            },
            {
              "period": "2018",
              "value": 825000
            },
            {
              "period": "2019",
              "value": 788000
            },
            {
              "period": "2020",
              "value": 662000
            },
            {
              "period": "2021",
              "value": 947000
            },
            {
              "period": "2022",
              "value": 1398000
            },
            {
              "period": "2023",
              "value": 1441000
            },
            {
              "period": "2024",
              "value": 1012000
            },
            {
              "period": "2025",
              "value": 813000
            }
          ]
        },
        {
          "name": "Emigration",
          "points": [
            {
              "period": "1964",
              "value": 271000
            },
            {
              "period": "1965",
              "value": 284000
            },
            {
              "period": "1966",
              "value": 302000
            },
            {
              "period": "1967",
              "value": 309000
            },
            {
              "period": "1968",
              "value": 278000
            },
            {
              "period": "1969",
              "value": 293000
            },
            {
              "period": "1970",
              "value": 291000
            },
            {
              "period": "1971",
              "value": 240000
            },
            {
              "period": "1972",
              "value": 233000
            },
            {
              "period": "1973",
              "value": 246000
            },
            {
              "period": "1974",
              "value": 269000
            },
            {
              "period": "1975",
              "value": 238000
            },
            {
              "period": "1976",
              "value": 210000
            },
            {
              "period": "1977",
              "value": 208000
            },
            {
              "period": "1978",
              "value": 192000
            },
            {
              "period": "1979",
              "value": 189000
            },
            {
              "period": "1980",
              "value": 228000
            },
            {
              "period": "1981",
              "value": 232000
            },
            {
              "period": "1982",
              "value": 257000
            },
            {
              "period": "1983",
              "value": 184000
            },
            {
              "period": "1984",
              "value": 164000
            },
            {
              "period": "1985",
              "value": 174000
            },
            {
              "period": "1986",
              "value": 213000
            },
            {
              "period": "1987",
              "value": 209000
            },
            {
              "period": "1988",
              "value": 237000
            },
            {
              "period": "1989",
              "value": 205000
            },
            {
              "period": "1990",
              "value": 231000
            },
            {
              "period": "1991",
              "value": 285000
            },
            {
              "period": "1992",
              "value": 281000
            },
            {
              "period": "1993",
              "value": 266000
            },
            {
              "period": "1994",
              "value": 238000
            },
            {
              "period": "1995",
              "value": 236000
            },
            {
              "period": "1996",
              "value": 264000
            },
            {
              "period": "1997",
              "value": 279000
            },
            {
              "period": "1998",
              "value": 251000
            },
            {
              "period": "1999",
              "value": 291000
            },
            {
              "period": "2000",
              "value": 321000
            },
            {
              "period": "2001",
              "value": 309000
            },
            {
              "period": "2002",
              "value": 363000
            },
            {
              "period": "2003",
              "value": 363000
            },
            {
              "period": "2004",
              "value": 344000
            },
            {
              "period": "2005",
              "value": 361000
            },
            {
              "period": "2006",
              "value": 398000
            },
            {
              "period": "2007",
              "value": 341000
            },
            {
              "period": "2008",
              "value": 427000
            },
            {
              "period": "2009",
              "value": 368000
            },
            {
              "period": "2010",
              "value": 339000
            },
            {
              "period": "2011",
              "value": 351000
            },
            {
              "period": "2012",
              "value": 448000
            },
            {
              "period": "2013",
              "value": 469000
            },
            {
              "period": "2014",
              "value": 494000
            },
            {
              "period": "2015",
              "value": 494000
            },
            {
              "period": "2016",
              "value": 523000
            },
            {
              "period": "2017",
              "value": 544000
            },
            {
              "period": "2018",
              "value": 549000
            },
            {
              "period": "2019",
              "value": 605000
            },
            {
              "period": "2020",
              "value": 569000
            },
            {
              "period": "2021",
              "value": 480000
            },
            {
              "period": "2022",
              "value": 508000
            },
            {
              "period": "2023",
              "value": 593000
            },
            {
              "period": "2024",
              "value": 680000
            },
            {
              "period": "2025",
              "value": 642000
            }
          ]
        },
        {
          "name": "Net migration",
          "points": [
            {
              "period": "1964",
              "value": -60000
            },
            {
              "period": "1965",
              "value": -78000
            },
            {
              "period": "1966",
              "value": -82000
            },
            {
              "period": "1967",
              "value": -84000
            },
            {
              "period": "1968",
              "value": -56000
            },
            {
              "period": "1969",
              "value": -87000
            },
            {
              "period": "1970",
              "value": -65000
            },
            {
              "period": "1971",
              "value": -40000
            },
            {
              "period": "1972",
              "value": -11000
            },
            {
              "period": "1973",
              "value": -50000
            },
            {
              "period": "1974",
              "value": -85000
            },
            {
              "period": "1975",
              "value": -41000
            },
            {
              "period": "1976",
              "value": -19000
            },
            {
              "period": "1977",
              "value": -46000
            },
            {
              "period": "1978",
              "value": -5000
            },
            {
              "period": "1979",
              "value": 6000
            },
            {
              "period": "1980",
              "value": -55000
            },
            {
              "period": "1981",
              "value": -79000
            },
            {
              "period": "1982",
              "value": -56000
            },
            {
              "period": "1983",
              "value": 17000
            },
            {
              "period": "1984",
              "value": 37000
            },
            {
              "period": "1985",
              "value": 58000
            },
            {
              "period": "1986",
              "value": 37000
            },
            {
              "period": "1987",
              "value": 2000
            },
            {
              "period": "1988",
              "value": -21000
            },
            {
              "period": "1989",
              "value": 44000
            },
            {
              "period": "1990",
              "value": 36000
            },
            {
              "period": "1991",
              "value": 44000
            },
            {
              "period": "1992",
              "value": -13000
            },
            {
              "period": "1993",
              "value": -1000
            },
            {
              "period": "1994",
              "value": 77000
            },
            {
              "period": "1995",
              "value": 76000
            },
            {
              "period": "1996",
              "value": 55000
            },
            {
              "period": "1997",
              "value": 48000
            },
            {
              "period": "1998",
              "value": 140000
            },
            {
              "period": "1999",
              "value": 163000
            },
            {
              "period": "2000",
              "value": 158000
            },
            {
              "period": "2001",
              "value": 179000
            },
            {
              "period": "2002",
              "value": 172000
            },
            {
              "period": "2003",
              "value": 185000
            },
            {
              "period": "2004",
              "value": 268000
            },
            {
              "period": "2005",
              "value": 267000
            },
            {
              "period": "2006",
              "value": 265000
            },
            {
              "period": "2007",
              "value": 273000
            },
            {
              "period": "2008",
              "value": 229000
            },
            {
              "period": "2009",
              "value": 229000
            },
            {
              "period": "2010",
              "value": 256000
            },
            {
              "period": "2011",
              "value": 205000
            },
            {
              "period": "2012",
              "value": 195000
            },
            {
              "period": "2013",
              "value": 244000
            },
            {
              "period": "2014",
              "value": 284000
            },
            {
              "period": "2015",
              "value": 303000
            },
            {
              "period": "2016",
              "value": 249000
            },
            {
              "period": "2017",
              "value": 208000
            },
            {
              "period": "2018",
              "value": 276000
            },
            {
              "period": "2019",
              "value": 184000
            },
            {
              "period": "2020",
              "value": 93000
            },
            {
              "period": "2021",
              "value": 467000
            },
            {
              "period": "2022",
              "value": 891000
            },
            {
              "period": "2023",
              "value": 848000
            },
            {
              "period": "2024",
              "value": 331000
            },
            {
              "period": "2025",
              "value": 171000
            }
          ]
        }
      ]
    },
    {
      "id": "share-of-population",
      "label": "As a Share of the UK Population",
      "unit": "percent",
      "valueLabel": "Percentage of the UK population that year",
      "note": "Derived, not published: ONS publishes no share-of-population migration series, so each year's flow here is divided by the ONS mid-year UK population estimate for the same year. Denominators for 1971–2025 are the UKPOP series; those for 1964–1970 come from an older ONS vintage that predates the Census 2021 rebasing, and differ from the current one by a few thousand where the two overlap. The denominator is not innocent either: the UK population grew from 54.0 million to 69.5 million across this series and immigration is part of why, so dividing by a population that immigration inflated understates the change slightly. Emigration has no share line because the derivation covers immigration and net migration.",
      "source": {
        "stance": "complicates",
        "quote": "Mid-year population estimates relate to the usually resident population. They account for long-term international migrants (people who change their country of usual residence for a period of 12 months or more) but do not account for short-term migrants (people who come to or leave the country for a period of less than 12 months).",
        "title": "United Kingdom population mid-year estimate (series UKPOP)",
        "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/timeseries/ukpop/pop",
        "publisher": "Office for National Statistics",
        "date": "2025-11-27"
      },
      "lines": [
        {
          "name": "Immigration",
          "points": [
            {
              "period": "1964",
              "value": 0.39
            },
            {
              "period": "1965",
              "value": 0.38
            },
            {
              "period": "1966",
              "value": 0.4
            },
            {
              "period": "1967",
              "value": 0.41
            },
            {
              "period": "1968",
              "value": 0.4
            },
            {
              "period": "1969",
              "value": 0.37
            },
            {
              "period": "1970",
              "value": 0.41
            },
            {
              "period": "1971",
              "value": 0.36
            },
            {
              "period": "1972",
              "value": 0.4
            },
            {
              "period": "1973",
              "value": 0.35
            },
            {
              "period": "1974",
              "value": 0.33
            },
            {
              "period": "1975",
              "value": 0.35
            },
            {
              "period": "1976",
              "value": 0.34
            },
            {
              "period": "1977",
              "value": 0.29
            },
            {
              "period": "1978",
              "value": 0.33
            },
            {
              "period": "1979",
              "value": 0.35
            },
            {
              "period": "1980",
              "value": 0.31
            },
            {
              "period": "1981",
              "value": 0.27
            },
            {
              "period": "1982",
              "value": 0.36
            },
            {
              "period": "1983",
              "value": 0.36
            },
            {
              "period": "1984",
              "value": 0.36
            },
            {
              "period": "1985",
              "value": 0.41
            },
            {
              "period": "1986",
              "value": 0.44
            },
            {
              "period": "1987",
              "value": 0.37
            },
            {
              "period": "1988",
              "value": 0.38
            },
            {
              "period": "1989",
              "value": 0.44
            },
            {
              "period": "1990",
              "value": 0.47
            },
            {
              "period": "1991",
              "value": 0.57
            },
            {
              "period": "1992",
              "value": 0.47
            },
            {
              "period": "1993",
              "value": 0.46
            },
            {
              "period": "1994",
              "value": 0.54
            },
            {
              "period": "1995",
              "value": 0.54
            },
            {
              "period": "1996",
              "value": 0.55
            },
            {
              "period": "1997",
              "value": 0.56
            },
            {
              "period": "1998",
              "value": 0.67
            },
            {
              "period": "1999",
              "value": 0.77
            },
            {
              "period": "2000",
              "value": 0.81
            },
            {
              "period": "2001",
              "value": 0.81
            },
            {
              "period": "2002",
              "value": 0.87
            },
            {
              "period": "2003",
              "value": 0.86
            },
            {
              "period": "2004",
              "value": 0.98
            },
            {
              "period": "2005",
              "value": 0.94
            },
            {
              "period": "2006",
              "value": 0.98
            },
            {
              "period": "2007",
              "value": 0.94
            },
            {
              "period": "2008",
              "value": 0.95
            },
            {
              "period": "2009",
              "value": 0.91
            },
            {
              "period": "2010",
              "value": 0.94
            },
            {
              "period": "2011",
              "value": 0.89
            },
            {
              "period": "2012",
              "value": 1.01
            },
            {
              "period": "2013",
              "value": 1.11
            },
            {
              "period": "2014",
              "value": 1.2
            },
            {
              "period": "2015",
              "value": 1.22
            },
            {
              "period": "2016",
              "value": 1.18
            },
            {
              "period": "2017",
              "value": 1.14
            },
            {
              "period": "2018",
              "value": 1.24
            },
            {
              "period": "2019",
              "value": 1.18
            },
            {
              "period": "2020",
              "value": 0.99
            },
            {
              "period": "2021",
              "value": 1.41
            },
            {
              "period": "2022",
              "value": 2.07
            },
            {
              "period": "2023",
              "value": 2.1
            },
            {
              "period": "2024",
              "value": 1.46
            },
            {
              "period": "2025",
              "value": 1.17
            }
          ]
        },
        {
          "name": "Net migration",
          "points": [
            {
              "period": "1964",
              "value": -0.11
            },
            {
              "period": "1965",
              "value": -0.14
            },
            {
              "period": "1966",
              "value": -0.15
            },
            {
              "period": "1967",
              "value": -0.15
            },
            {
              "period": "1968",
              "value": -0.1
            },
            {
              "period": "1969",
              "value": -0.16
            },
            {
              "period": "1970",
              "value": -0.12
            },
            {
              "period": "1971",
              "value": -0.07
            },
            {
              "period": "1972",
              "value": -0.02
            },
            {
              "period": "1973",
              "value": -0.09
            },
            {
              "period": "1974",
              "value": -0.15
            },
            {
              "period": "1975",
              "value": -0.07
            },
            {
              "period": "1976",
              "value": -0.03
            },
            {
              "period": "1977",
              "value": -0.08
            },
            {
              "period": "1978",
              "value": -0.01
            },
            {
              "period": "1979",
              "value": 0.01
            },
            {
              "period": "1980",
              "value": -0.1
            },
            {
              "period": "1981",
              "value": -0.14
            },
            {
              "period": "1982",
              "value": -0.1
            },
            {
              "period": "1983",
              "value": 0.03
            },
            {
              "period": "1984",
              "value": 0.07
            },
            {
              "period": "1985",
              "value": 0.1
            },
            {
              "period": "1986",
              "value": 0.07
            },
            {
              "period": "1987",
              "value": 0
            },
            {
              "period": "1988",
              "value": -0.04
            },
            {
              "period": "1989",
              "value": 0.08
            },
            {
              "period": "1990",
              "value": 0.06
            },
            {
              "period": "1991",
              "value": 0.08
            },
            {
              "period": "1992",
              "value": -0.02
            },
            {
              "period": "1993",
              "value": 0
            },
            {
              "period": "1994",
              "value": 0.13
            },
            {
              "period": "1995",
              "value": 0.13
            },
            {
              "period": "1996",
              "value": 0.09
            },
            {
              "period": "1997",
              "value": 0.08
            },
            {
              "period": "1998",
              "value": 0.24
            },
            {
              "period": "1999",
              "value": 0.28
            },
            {
              "period": "2000",
              "value": 0.27
            },
            {
              "period": "2001",
              "value": 0.3
            },
            {
              "period": "2002",
              "value": 0.29
            },
            {
              "period": "2003",
              "value": 0.31
            },
            {
              "period": "2004",
              "value": 0.45
            },
            {
              "period": "2005",
              "value": 0.44
            },
            {
              "period": "2006",
              "value": 0.44
            },
            {
              "period": "2007",
              "value": 0.45
            },
            {
              "period": "2008",
              "value": 0.37
            },
            {
              "period": "2009",
              "value": 0.37
            },
            {
              "period": "2010",
              "value": 0.41
            },
            {
              "period": "2011",
              "value": 0.32
            },
            {
              "period": "2012",
              "value": 0.31
            },
            {
              "period": "2013",
              "value": 0.38
            },
            {
              "period": "2014",
              "value": 0.44
            },
            {
              "period": "2015",
              "value": 0.47
            },
            {
              "period": "2016",
              "value": 0.38
            },
            {
              "period": "2017",
              "value": 0.32
            },
            {
              "period": "2018",
              "value": 0.42
            },
            {
              "period": "2019",
              "value": 0.28
            },
            {
              "period": "2020",
              "value": 0.14
            },
            {
              "period": "2021",
              "value": 0.7
            },
            {
              "period": "2022",
              "value": 1.32
            },
            {
              "period": "2023",
              "value": 1.24
            },
            {
              "period": "2024",
              "value": 0.48
            },
            {
              "period": "2025",
              "value": 0.25
            }
          ]
        }
      ]
    }
  ]
};

/** The sources of "UK Immigration Trends", which the series' readings number from. */
export const longRunMigrationSourceCount = 21;

/** "Foreign-born share of the resident population" — one line, eight Census points. */
export const foreignBornShareSeries: Series = {
  "title": "Foreign-born share of the resident population, England and Wales, Census 1951–2021",
  "description": "The share of usual residents born outside the UK at each Census. This is a resident stock, not a count of arrivals in the year shown.",
  "periodLabel": "Census year",
  "coverage": {
    "from": "1951",
    "to": "2021",
    "note": "The ONS historical Census series is available at ten-year intervals. The 1951–2011 values use the original published Census tables; 2021 is the later Census release for the same England-and-Wales geography."
  },
  "breaks": [],
  "source": {
    "stance": "supports",
    "quote": "Figure 1 reports the non-UK-born share of England and Wales as 4.3% in 1951, 5.0% in 1961, 6.4% in 1971, 6.7% in 1981, 7.3% in 1991, 8.9% in 2001 and 13.4% in 2011.",
    "title": "2011 Census analysis: Immigration Patterns of Non-UK Born Populations in England and Wales",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/immigrationpatternsofnonukbornpopulationsinenglandandwales/2013-12-17",
    "publisher": "Office for National Statistics",
    "date": "2013-12-17"
  },
  "readings": [
    {
      "id": "foreign-born-share",
      "label": "Born outside the UK",
      "unit": "percent",
      "valueLabel": "Share of usual residents born outside the UK",
      "lines": [
        {
          "name": "Born outside the UK",
          "points": [
            {
              "period": "1951",
              "value": 4.3
            },
            {
              "period": "1961",
              "value": 5
            },
            {
              "period": "1971",
              "value": 6.4
            },
            {
              "period": "1981",
              "value": 6.7
            },
            {
              "period": "1991",
              "value": 7.3
            },
            {
              "period": "2001",
              "value": 8.9
            },
            {
              "period": "2011",
              "value": 13.4
            },
            {
              "period": "2021",
              "value": 16.8
            }
          ]
        }
      ]
    }
  ]
};

export const foreignBornShareSourceCount = 6;

/** Asylum claims per person across Europe (32 countries), with the UK highlighted. */
export const asylumComparisonFact: Fact = {
  "id": "asylum-claims-in-historical-and-european-context",
  "body": "",
  "title": "Asylum Applications in the UK and Europe",
  "claim": "Around 108,000 people claimed asylum in the UK in 2024, the highest since records began in 1979 and just above the 2002 peak — but per head of population that was only the seventeenth-largest intake in the EU+, at 16 claims per 10,000 residents",
  "status": "well-supported",
  "sources": [
    {
      "stance": "supports",
      "quote": "In 2024, around 108,000 people claimed asylum in the UK, the highest since records began in 1979. This surpassed the previous record of around 103,000 people in 2002, driven by wars in Somalia, Afghanistan, and Iraq (Figure 1).",
      "title": "Asylum and refugee resettlement in the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/migration-to-the-uk-asylum/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2025-08-01"
    },
    {
      "stance": "supports",
      "quote": "In 2024, the UK received around 108,100 asylum applicants, the 5 th highest when compared with the EU+ (the EU-27 plus Switzerland and the three EEA countries, Iceland, Liechtenstein, and Norway). When adjusted by population size, it received the 17 th highest number of applications: 16 per 10,000 residents.",
      "title": "Asylum and refugee resettlement in the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/migration-to-the-uk-asylum/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2025-08-01"
    },
    {
      "stance": "supports",
      "quote": "in the YE December 2025, the UK received the fifth largest number of asylum seekers in the EU+, after Germany, France, Spain and Italy and the fifteenth largest intake when measured ‘per head of population’",
      "title": "Immigration system statistics, year ending March 2026: summary of latest statistics",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/summary-of-latest-statistics",
      "publisher": "Home Office",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "94,000 people claimed asylum, in the YE March 2026, 12% less than the previous year",
      "title": "Immigration system statistics, year ending March 2026: summary of latest statistics",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/summary-of-latest-statistics",
      "publisher": "Home Office",
      "date": "2026-05-21"
    },
    {
      "stance": "complicates",
      "quote": "Changes over time in the number of people claiming asylum in the UK are driven in a large part by geopolitical events, since asylum seekers come mainly from countries with political and military conflicts. For example, the spike in people who came to the UK to seek asylum from 1998 to 2002 were mainly nationals of Somalia, Afghanistan, Iraq, and the former Yugoslavia, which were then sites of war (Figure 1).",
      "title": "Asylum and refugee resettlement in the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/migration-to-the-uk-asylum/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2025-08-01"
    },
    {
      "stance": "complicates",
      "quote": "In the same year, the UK granted asylum or another form of legal status to around 39,600 people (at initial decision, excluding appeals), placing it fourth in the league table. Germany ranked first on both measures, receiving around 250,000 asylum applicants in 2024, and granting asylum-related protection to around 133,700 people at initial decision that year (Figure 18).",
      "title": "Asylum and refugee resettlement in the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/migration-to-the-uk-asylum/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2025-08-01"
    },
    {
      "stance": "complicates",
      "quote": "Adjusting grants for population size, the UK ranked 14 th when compared with the EU+, having granted protection in 2024 to six asylum seekers per 10,000 of its resident population.",
      "title": "Asylum and refugee resettlement in the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/migration-to-the-uk-asylum/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2025-08-01"
    },
    {
      "stance": "supports",
      "quote": "Figure 1 shows an initial peak in the number of people claiming asylum in the UK at 103,081 in the YE December 2002.",
      "title": "How many people claim asylum in the UK?",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/how-many-people-claim-asylum-in-the-uk",
      "publisher": "Home Office",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "After 2002, the number of people claiming asylum decreased. Between 2004 and 2020, asylum claim numbers remained below the YE December 2002 peak, with yearly totals ranging between 22,000 and 46,000 and seeing some gradual increase over the period.",
      "title": "How many people claim asylum in the UK?",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/how-many-people-claim-asylum-in-the-uk",
      "publisher": "Home Office",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "Since the second half of 2021, there has been a notable increase in claims, surpassing the YE December 2002 level and reaching a peak of 110,051 in the YE September 2025. While the number of people claiming asylum has fallen in the most recent year, it remains high compared with levels seen over the previous 2 decades.",
      "title": "How many people claim asylum in the UK?",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/how-many-people-claim-asylum-in-the-uk",
      "publisher": "Home Office",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "A total of 93,525 people claimed asylum in the UK in the YE March 2026. This was 12% less than in the YE March 2025.",
      "title": "How many people claim asylum in the UK?",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/how-many-people-claim-asylum-in-the-uk",
      "publisher": "Home Office",
      "date": "2026-05-21"
    },
    {
      "stance": "complicates",
      "quote": "Data for 2001 relates to main applicants only and does not include dependants. Quarterly data for dependants begins in 2002.",
      "title": "Asylum claims and initial decisions detailed datasets, year ending March 2026",
      "url": "https://assets.publishing.service.gov.uk/media/6a05df9d97000cb6073e4e25/asylum-claims-datasets-mar-2026.xlsx",
      "publisher": "Home Office",
      "date": "2026-05-21"
    },
    {
      "stance": "complicates",
      "quote": "Due to improvements in data quality and processing, the totals for 2001-2009, while largely similar, should not be directly compared to those found in the previously published as_01_q, as_02_q, and as_08_q.",
      "title": "Asylum claims and initial decisions detailed datasets, year ending March 2026",
      "url": "https://assets.publishing.service.gov.uk/media/6a05df9d97000cb6073e4e25/asylum-claims-datasets-mar-2026.xlsx",
      "publisher": "Home Office",
      "date": "2026-05-21"
    }
  ],
  "comparisons": [
    {
      "id": "asylum-per-person",
      "title": "Asylum claims per person across Europe",
      "description": "2024, all EU+ countries and the UK. The UK is highlighted; each chart is ranked from highest to lowest.",
      "unit": "count",
      "valueLabel": "Applicants per 10,000 residents",
      "sources": [
        2
      ],
      "items": [
        {
          "label": "Cyprus",
          "value": 95.04690256787032
        },
        {
          "label": "Greece",
          "value": 70.84124945196102
        },
        {
          "label": "Iceland",
          "value": 50.1867991771972
        },
        {
          "label": "Ireland",
          "value": 34.690034775989076
        },
        {
          "label": "Spain",
          "value": 34.172365746021235
        },
        {
          "label": "Belgium",
          "value": 33.43461033065992
        },
        {
          "label": "Luxembourg",
          "value": 32.81005877538874
        },
        {
          "label": "Switzerland",
          "value": 30.81254746292731
        },
        {
          "label": "Germany",
          "value": 30.02179171083413
        },
        {
          "label": "Austria",
          "value": 27.20349392657295
        },
        {
          "label": "Italy",
          "value": 26.89531827638664
        },
        {
          "label": "Slovenia",
          "value": 26.530768864977453
        },
        {
          "label": "France",
          "value": 23.054780466056222
        },
        {
          "label": "Liechtenstein",
          "value": 21.242034237161064
        },
        {
          "label": "Bulgaria",
          "value": 19.021078488944426
        },
        {
          "label": "Netherlands",
          "value": 18.634067924869846
        },
        {
          "label": "United Kingdom",
          "value": 15.997621171573,
          "highlight": true
        },
        {
          "label": "Malta",
          "value": 12.867317545874204
        },
        {
          "label": "Sweden",
          "value": 10.529102068508914
        },
        {
          "label": "Estonia",
          "value": 9.856789218200216
        },
        {
          "label": "Norway",
          "value": 8.900552897301132
        },
        {
          "label": "Latvia",
          "value": 5.555905767564408
        },
        {
          "label": "Finland",
          "value": 5.20177999022458
        },
        {
          "label": "Poland",
          "value": 4.580708812464552
        },
        {
          "label": "Denmark",
          "value": 3.824701836813057
        },
        {
          "label": "Croatia",
          "value": 2.8871297968107963
        },
        {
          "label": "Portugal",
          "value": 2.4953650122193
        },
        {
          "label": "Romania",
          "value": 1.258681229328783
        },
        {
          "label": "Czechia",
          "value": 1.2430559728380803
        },
        {
          "label": "Lithuania",
          "value": 1.2474483617018106
        },
        {
          "label": "Slovakia",
          "value": 0.2765136495432824
        },
        {
          "label": "Hungary",
          "value": 0.0313001225817134
        }
      ],
      "note": "Data from the Migration Observatory’s Figure 18 and downloadable AsylumYEDec2024 Tableau workbook (EU asy extract). Includes applicants and dependants, not grants of protection or refugee resettlement. Per-person rates use the workbook’s population denominators and are displayed to two decimal places, with nonzero rates below 0.01 labelled <0.01. The complete comparator set is retained."
    },
    {
      "id": "asylum-count",
      "title": "Total asylum claims across Europe",
      "description": "2024, all EU+ countries and the UK. The UK is highlighted; each chart is ranked from highest to lowest.",
      "unit": "count",
      "valueLabel": "People claiming asylum",
      "sources": [
        2
      ],
      "items": [
        {
          "label": "Germany",
          "value": 250550
        },
        {
          "label": "Spain",
          "value": 166145
        },
        {
          "label": "Italy",
          "value": 158605
        },
        {
          "label": "France",
          "value": 157850
        },
        {
          "label": "United Kingdom",
          "value": 108138,
          "highlight": true
        },
        {
          "label": "Greece",
          "value": 73680
        },
        {
          "label": "Belgium",
          "value": 39510
        },
        {
          "label": "Netherlands",
          "value": 33435
        },
        {
          "label": "Switzerland",
          "value": 27615
        },
        {
          "label": "Austria",
          "value": 24915
        },
        {
          "label": "Ireland",
          "value": 18565
        },
        {
          "label": "Poland",
          "value": 16775
        },
        {
          "label": "Bulgaria",
          "value": 12260
        },
        {
          "label": "Sweden",
          "value": 11110
        },
        {
          "label": "Cyprus",
          "value": 9185
        },
        {
          "label": "Slovenia",
          "value": 5635
        },
        {
          "label": "Norway",
          "value": 4940
        },
        {
          "label": "Finland",
          "value": 2915
        },
        {
          "label": "Portugal",
          "value": 2655
        },
        {
          "label": "Romania",
          "value": 2400
        },
        {
          "label": "Denmark",
          "value": 2280
        },
        {
          "label": "Luxembourg",
          "value": 2205
        },
        {
          "label": "Iceland",
          "value": 1925
        },
        {
          "label": "Czechia",
          "value": 1355
        },
        {
          "label": "Estonia",
          "value": 1355
        },
        {
          "label": "Croatia",
          "value": 1115
        },
        {
          "label": "Latvia",
          "value": 1040
        },
        {
          "label": "Malta",
          "value": 725
        },
        {
          "label": "Lithuania",
          "value": 360
        },
        {
          "label": "Slovakia",
          "value": 150
        },
        {
          "label": "Liechtenstein",
          "value": 85
        },
        {
          "label": "Hungary",
          "value": 30
        }
      ],
      "note": "Data from the Migration Observatory’s Figure 18 and downloadable AsylumYEDec2024 Tableau workbook (EU asy extract). Includes applicants and dependants, not grants of protection or refugee resettlement. Per-person rates use the workbook’s population denominators and are displayed to two decimal places, with nonzero rates below 0.01 labelled <0.01. The complete comparator set is retained."
    }
  ]
};

/** Reasons for arrival — a short comparison of five items. */
export const arrivalReasonsFact: Fact = {
  "id": "how-people-actually-arrive",
  "body": "",
  "title": "UK Immigration Routes",
  "claim": "The UK recorded 46,497 detections of arrivals via illegal routes in 2025, compared with 813,000 long-term immigrants. That ratio is 5.7%; it is not an exact illegal share, because detections miss some arrivals and the two measures have different coverage.",
  "status": "well-supported",
  "sources": [
    {
      "stance": "supports",
      "quote": "The provisional estimate for total long-term immigration YE December 2025 is 813,000, a decrease of 20% from the updated YE December 2024 estimate of 1,012,000; this continues a downward trend in our long-term immigration estimates from the peak at 1,469,000 in March 2023.",
      "title": "Long-term international migration, provisional: year ending December 2025",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "When looking at the reasons for immigration of non-EU+ nationals in YE December 2025, 47% came for study-related reasons, 23% for work-related reasons, 14% were asylum applicants, and 7% and 6% were for family- and humanitarian-related reasons, respectively.",
      "title": "Long-term international migration, provisional: year ending December 2025",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "In YE December 2025, there were 46,497 detected arrivals via illegal routes, 7% more than in the previous year. Small boat arrivals accounted for 89% of detected arrivals via illegal routes.",
      "title": "How many people come to the UK via illegal entry routes?",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-december-2025/how-many-people-come-to-the-uk-via-illegal-entry-routes",
      "publisher": "Home Office",
      "date": "2026-02-26"
    },
    {
      "stance": "supports",
      "quote": "Small boat arrivals were relatively low from 2018 to 2020, with 10,608 arrivals in total across these 3 years. However, since YE December 2021 there have been between 29,000 and 46,000 small boat arrivals each year, with the highest number of arrivals in YE December 2022 (45,774). Despite the decrease in YE December 2023, small boat arrivals increased in YE December 2025 (41,472), 13% higher than in YE December 2024.",
      "title": "How many people come to the UK via illegal entry routes?",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-december-2025/how-many-people-come-to-the-uk-via-illegal-entry-routes",
      "publisher": "Home Office",
      "date": "2026-02-26"
    },
    {
      "stance": "complicates",
      "quote": "The statistics presented here relate to the number of people detected on, or shortly after, arrival to the UK through various illegal methods of entry. They do not include all those who enter the UK through illegal routes, nor the number of people currently present in the UK without permission. It is not possible to know the exact number of people currently resident in the UK without permission, nor the total number of people who enter the UK via illegal routes, and so we have not produced any official estimates for this number.",
      "title": "How many people come to the UK via illegal entry routes?",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/how-many-people-come-to-the-uk-via-illegal-entry-routes",
      "publisher": "Home Office",
      "date": "2026-05-21"
    },
    {
      "stance": "complicates",
      "quote": "just over half of asylum seekers arrived through illegal entry routes, such as small boats, while a further 39% of claimants had previously arrived in the UK on a visa or with other leave",
      "title": "Immigration system statistics, year ending March 2026: summary of latest statistics",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/summary-of-latest-statistics",
      "publisher": "Home Office",
      "date": "2026-05-21"
    },
    {
      "stance": "complicates",
      "quote": "the number of people immigrating for asylum was broadly stable, with a small increase to 88,000 in the year ending December 2025, from 87,000 the previous year; these estimates include people who claimed asylum after arriving via a regular route and by illegal entry routes, such as small boats",
      "title": "Long-term international migration, provisional: year ending December 2025",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    },
    {
      "stance": "complicates",
      "quote": "decreased rapidly in 2024 (‑37% to 240 000) … (‑48% to 1.1 million) … increased by 19% to 44 000.",
      "title": "International Migration Outlook 2025: irregular border crossings and data limitations",
      "url": "https://www.oecd.org/en/publications/international-migration-outlook-2025_ae26c893-en/full-report/recent-developments-in-international-migration-movements-and-labour-market-inclusion-of-immigrants_203de29e.html",
      "publisher": "OECD",
      "date": "2025-11-03"
    },
    {
      "stance": "supports",
      "quote": "Small boat arrivals from Albania to the UK fell by over 90% in 2023",
      "title": "UK and Albania working innovatively to build on migration partnership success",
      "url": "https://www.gov.uk/government/news/uk-and-albania-working-innovatively-to-build-on-migration-partnership-success",
      "publisher": "Foreign, Commonwealth & Development Office",
      "date": "2024-05-22"
    }
  ],
  "comparisons": [
    {
      "id": "international-trends",
      "title": "Irregular-entry detections moved in different directions in 2024",
      "description": "Change from 2023 within each reporting system. These are trends, not comparable illegal-entry shares.",
      "unit": "percent",
      "valueLabel": "Annual change in detections / encounters",
      "sources": [
        8
      ],
      "items": [
        {
          "label": "United Kingdom",
          "value": 19,
          "highlight": true
        },
        {
          "label": "EU external borders",
          "value": -37
        },
        {
          "label": "United States",
          "value": -48
        }
      ],
      "note": "UK detections, EU external-border events and US Border Patrol encounters have different coverage and can count repeated attempts. The EU is a region, not a country. This is the OECD comparison discussed in the source; it does not rank illegal immigration levels."
    },
    {
      "id": "arrival-reasons",
      "title": "Study and work accounted for most non-EU+ arrivals",
      "description": "Initial reason for long-term immigration, 2025; includes dependants. Asylum is not an entry route.",
      "unit": "percent",
      "valueLabel": "Share of non-EU+ long-term arrivals",
      "sources": [
        2
      ],
      "items": [
        {
          "label": "Study",
          "value": 47
        },
        {
          "label": "Work",
          "value": 23
        },
        {
          "label": "Asylum",
          "value": 14
        },
        {
          "label": "Family",
          "value": 7
        },
        {
          "label": "Humanitarian routes",
          "value": 6
        }
      ],
      "note": "These are the five categories specified in the cited ONS summary, not a partition of all immigration. Shares do not sum to 100%; other reasons and rounding account for the remainder. EU+ and British arrivals are excluded."
    }
  ]
};

/** International immigration by country, with a grouped breakdown. */
export const internationalImmigrationFact: Fact = {
  "id": "immigration-against-the-long-run",
  "body": "",
  "title": "UK Immigration Trends",
  "claim": "Long-term immigration to the UK was 813,000 in 2025 — down from the peak of 1,469,000 in the year to March 2023, but still around two and a half times the 1990s average of about 325,000 a year",
  "status": "well-supported",
  "sources": [
    {
      "stance": "supports",
      "quote": "A provisionally estimated 813,000 people made a long-term move to the UK in year ending (YE) December 2025. Immigration dropped compared with our updated estimate for YE December 2024, when it was 1,012,000, continuing a downward trend from the peak of 1,469,000 in March 2023. Net migration in YE December 2025 was 171,000. This was down from the peak of 944,000 in YE March 2023.",
      "title": "Long-term international migration, provisional: year ending December 2025",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "We have been measuring long-term international migration in and out of the UK for over 60 years.",
      "title": "What is international migration and how do we estimate it?",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/whatisinternationalmigrationandhowdoweestimateit/2025-11-18",
      "publisher": "Office for National Statistics",
      "date": "2025-11-18"
    },
    {
      "stance": "supports",
      "quote": "From the late 1960s to the early 1980s, net migration was consistently negative, meaning in most years, more people moved out of the country than moved into it.",
      "title": "What is international migration and how do we estimate it?",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/whatisinternationalmigrationandhowdoweestimateit/2025-11-18",
      "publisher": "Office for National Statistics",
      "date": "2025-11-18"
    },
    {
      "stance": "supports",
      "quote": "In the late 1990s, this trend reversed, and net migration began to rise.",
      "title": "What is international migration and how do we estimate it?",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/whatisinternationalmigrationandhowdoweestimateit/2025-11-18",
      "publisher": "Office for National Statistics",
      "date": "2025-11-18"
    },
    {
      "stance": "complicates",
      "quote": "Due to changes in methodology, comparisons between pre-June 2021 and post-June 2021 estimates should be treated with caution.",
      "title": "Immigration, emigration and net migration into the UK, 1964 - 2025 (data download)",
      "url": "https://www.ons.gov.uk/visualisations/dvc3417/line-chart/datadownload.xlsx",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    },
    {
      "stance": "complicates",
      "quote": "Net migration fell from its peak of 944,000 in the year to March 2023 to 171,000 in 2025, lower than the levels seen during the 2010s and a sharp decline from the unusually high levels in 2022 and 2023. In 2025, 67% of non-EU immigration was for work and study purposes. … it reintroduced a post-study work route … made care and senior care workers eligible for work visas.",
      "title": "Net migration to the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2026-05-27"
    },
    {
      "stance": "supports",
      "quote": "Health and Care Worker visas had fallen prior to the changes",
      "title": "Why do people come to the UK? Work",
      "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/why-do-people-come-to-the-uk-work",
      "publisher": "Home Office",
      "date": "2026-07-16"
    },
    {
      "stance": "complicates",
      "quote": "Poland and Slovakia did not include refugees from Ukraine",
      "title": "Immigration in Europe, 2024: migr_imm8 and demo_pjan",
      "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260227-1",
      "publisher": "Eurostat",
      "date": "2026-02-27"
    },
    {
      "stance": "supports",
      "quote": "labour shortages were reported as a factor limiting production in Malta",
      "title": "Council recommendation on the economic policies of Malta",
      "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024H06825",
      "publisher": "Council of the European Union",
      "date": "2024-10-21"
    },
    {
      "stance": "supports",
      "quote": "Net migration of non-EU citizens increased after 1997 and peaked in 2004.",
      "title": "International migration: a recent history",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/internationalmigrationarecenthistory/2015-01-15",
      "publisher": "Office for National Statistics",
      "date": "2015-01-15"
    },
    {
      "stance": "supports",
      "quote": "Economic growth and a structural demand for migrant labour",
      "title": "Determinants of Migration to the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/determinants-of-migration-to-the-uk/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2017-10-11"
    },
    {
      "stance": "complicates",
      "quote": "Immigration by age group, sex and citizenship",
      "title": "Immigration by citizenship, 2024 (migr_imm1ctz)",
      "url": "https://ec.europa.eu/eurostat/databrowser/view/migr_imm1ctz/default/table?lang=en",
      "publisher": "Eurostat",
      "date": "2026-09-11"
    },
    {
      "stance": "supports",
      "quote": "Net migration for EU+ nationals in YE December 2025 was negative 42,000, it has been negative since YE June 2022.",
      "title": "Long-term international migration, provisional: year ending December 2025",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "Most people immigrating into the UK in YE December 2025 were non-EU+ nationals, provisionally estimated at 627,000, a decline from 780,000 in YE December 2024.",
      "title": "Long-term international migration, provisional: year ending December 2025",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "Freedom of movement between the EU+ countries and the UK ended in January 2021.",
      "title": "Long-term international migration, provisional: year ending December 2025",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    },
    {
      "stance": "supports",
      "quote": "EU net migration subsequently turned negative in 2022, as the post-Brexit immigration system greatly reduced opportunities for EU citizens to move to the UK.",
      "title": "Net migration to the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2026-05-27"
    },
    {
      "stance": "supports",
      "quote": "Those born in the European Union (EU) made up 3.6 million (36.4% of all non-UK born usual residents) of the population, an increase from 2.5 million (32.7%) in 2011",
      "title": "International migration, England and Wales: Census 2021",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/internationalmigrationenglandandwales/census2021",
      "publisher": "Office for National Statistics",
      "date": "2022-11-02"
    },
    {
      "stance": "complicates",
      "quote": "Although policy towards EU citizens did not change until January 2021, EU net migration began to fall immediately after the referendum.",
      "title": "Net migration to the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2026-05-27"
    },
    {
      "stance": "complicates",
      "quote": "This is because EU emigration is driven by people who arrived before Brexit, when EU immigration was higher.",
      "title": "Net migration to the UK",
      "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/",
      "publisher": "The Migration Observatory, University of Oxford",
      "date": "2026-05-27"
    },
    {
      "stance": "complicates",
      "quote": "For estimates up to YE March 2021 this category includes nationals of the countries of the European Union (EU) for each given time period (excluding British nationals).",
      "title": "Long-term international migration, provisional: year ending December 2025 (Table 1 data download)",
      "url": "https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/internationalmigration/datasets/longterminternationalimmigrationemigrationandnetmigrationflowsprovisional/yearendingdecember2025/may2026publicationspreadsheet.xlsx",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    },
    {
      "stance": "complicates",
      "quote": "The number of non-EU+ nationals arriving for work-related reasons fell by 47% in 2025",
      "title": "Long-term international migration, provisional: year ending December 2025",
      "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
      "publisher": "Office for National Statistics",
      "date": "2026-05-21"
    }
  ],
  "comparisons": [
    {
      "id": "international-immigration",
      "title": "International Comparison by Nationality, 2024",
      "description": "EU+ and non-EU+ bars count foreign nationals; each country’s own nationals are separate. EU+ means EU and EFTA; other foreign nationals are non-EU+. Poland and Slovakia exclude Ukrainians under temporary protection.",
      "unit": "percent",
      "valueLabel": "Annual arrivals as % of resident population",
      "sources": [
        12,
        1,
        23
      ],
      "note": "Eurostat migr_imm1ctz, 2024, age TOTAL, sex T, unit NR, age definition REACH; divided by demo_pjan population on 1 January 2024. EU+ foreign nationals = EU27_2020_FOR + EFTA_FOR. Non-EU+ foreign nationals = NEU27_2020_FOR − EFTA_FOR. Own-country nationals = NAT. Unknown/stateless = STLS + UNK. Eurostat components sum to TOTAL before rounding. Other / rounding comprises unknown citizenship and stateless arrivals in Eurostat, and the 1,000-person gap between independently rounded UK groups and the rounded UK total; the UK gap is a rounding adjustment, not another measured nationality group. All 30 available EU/EFTA countries are shown; Portugal has no 2024 data. UK: ONS December 2024 nationality estimates (780,000 non-EU+, 91,000 EU+, 140,000 British) divided by 69,281,000 mid-2024 residents; the UK population reference date differs from Eurostat’s start-year denominator. Nationality is not previous residence, birthplace or ethnicity. British citizens are own-country nationals in the UK and non-EU+ foreigners in EU/EFTA countries. Refugee coverage and registration methods vary. Downloaded 11 September 2026: https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/migr_imm1ctz?time=2024&age=TOTAL&sex=T&unit=NR .",
      "items": [
        {
          "label": "Malta",
          "value": 6.04018507639637,
          "values": [
            4.29129477160955,
            1.3128213501631931,
            0.43606895462362655,
            0
          ]
        },
        {
          "label": "Cyprus",
          "value": 4.1879621054156555,
          "values": [
            3.1126955135999337,
            0.8337429439187057,
            0.24152364789701616,
            0
          ]
        },
        {
          "label": "Spain",
          "value": 2.6502881188374383,
          "values": [
            1.9673467717146311,
            0.3849756770378753,
            0.29686529296409614,
            0.0011003771208354968
          ]
        },
        {
          "label": "Liechtenstein",
          "value": 3.2487817068599276,
          "values": [
            1.6618767962014245,
            1.0920904660752218,
            0.47732100462326627,
            0.017493439960014994
          ]
        },
        {
          "label": "Luxembourg",
          "value": 3.8278401904620196,
          "values": [
            1.5314336730897997,
            2.0162190313220743,
            0.2723011680678521,
            0.007886317982292983
          ]
        },
        {
          "label": "Ireland",
          "value": 2.3854934552339726,
          "values": [
            1.3830607616560104,
            0.3628205791787664,
            0.6313530272077128,
            0.008259087191482451
          ]
        },
        {
          "label": "Croatia",
          "value": 1.8226722289444732,
          "values": [
            1.3498302807869669,
            0.12850964288405364,
            0.34412515694722406,
            0.0002071483262285773
          ]
        },
        {
          "label": "Slovenia",
          "value": 1.5547925114962742,
          "values": [
            1.204501614680955,
            0.12556798680194298,
            0.22472291001337602,
            0
          ]
        },
        {
          "label": "United Kingdom",
          "highlight": true,
          "value": 1.460717945757134,
          "values": [
            1.1258498000894905,
            0.1313491433437739,
            0.20207560514426756,
            0.0014433971796019112
          ]
        },
        {
          "label": "Lithuania",
          "value": 1.7964988975675105,
          "values": [
            1.0978238609843545,
            0.04272510638828701,
            0.6548064358633088,
            0.0011434943315599931
          ]
        },
        {
          "label": "Czechia",
          "value": 1.136731111397539,
          "values": [
            0.9908394572569929,
            0.11940676415099964,
            0.026448194610274433,
            0.00003669537927197285
          ]
        },
        {
          "label": "Finland",
          "value": 1.1414471940813558,
          "values": [
            0.915923710319921,
            0.10399991006184853,
            0.12045288142029473,
            0.0010706922792915086
          ]
        },
        {
          "label": "Germany",
          "value": 1.2923018338575714,
          "values": [
            0.9125582215164881,
            0.2871164096022044,
            0.08598777955509394,
            0.00663942318378495
          ]
        },
        {
          "label": "Iceland",
          "value": 2.5930280759293685,
          "values": [
            0.7696178242653826,
            1.3496990095602595,
            0.4716255569431156,
            0.002085685160610793
          ]
        },
        {
          "label": "Denmark",
          "value": 1.7064209195086464,
          "values": [
            0.738502954666044,
            0.650736112516018,
            0.3104718491041055,
            0.006710003222479048
          ]
        },
        {
          "label": "Estonia",
          "value": 1.3555085630401684,
          "values": [
            0.7376951989798405,
            0.23117989767852612,
            0.3795773146905441,
            0.007056151691257719
          ]
        },
        {
          "label": "Switzerland",
          "value": 2.3719245752577085,
          "values": [
            0.7358078734176141,
            1.383446002112414,
            0.2514433304642647,
            0.0012273692634155366
          ]
        },
        {
          "label": "Netherlands",
          "value": 1.436297347447258,
          "values": [
            0.7308500467760526,
            0.4795311716439812,
            0.21335408652605575,
            0.012562042501168427
          ]
        },
        {
          "label": "Belgium",
          "value": 1.3787312889731962,
          "values": [
            0.7118077063941937,
            0.5266860826043894,
            0.13707259380815726,
            0.003164906166455786
          ]
        },
        {
          "label": "Greece",
          "value": 1.27363151282161,
          "values": [
            0.6914382401141738,
            0.08109282362243397,
            0.5011004490850023,
            0
          ]
        },
        {
          "label": "Norway",
          "value": 1.190533030954003,
          "values": [
            0.6859388746681878,
            0.37049095321378334,
            0.13086007845118458,
            0.0032431246208472013
          ]
        },
        {
          "label": "Sweden",
          "value": 1.1012151872678042,
          "values": [
            0.66500140688137,
            0.2535040065081413,
            0.1792695722123444,
            0.0034402016659484578
          ]
        },
        {
          "label": "Austria",
          "value": 1.4063600382148218,
          "values": [
            0.6574587143442063,
            0.6488767571993995,
            0.09643237341340248,
            0.0035921932578135665
          ]
        },
        {
          "label": "Italy",
          "value": 0.7657683246559381,
          "values": [
            0.5965366501597474,
            0.07001888887174305,
            0.09914665168082809,
            0.00006613394361962604
          ]
        },
        {
          "label": "Poland",
          "value": 0.8205571834935012,
          "values": [
            0.48793355282506173,
            0.09025976100578438,
            0.24217545302595753,
            0.00018841663669749874
          ]
        },
        {
          "label": "Romania",
          "value": 1.5027500087058785,
          "values": [
            0.4771083644821974,
            0.05612144931269711,
            0.9691478350473076,
            0.00037235986367643165
          ]
        },
        {
          "label": "Bulgaria",
          "value": 0.8096990744368031,
          "values": [
            0.41550041028745566,
            0.11063565310331377,
            0.28244594934032075,
            0.0011170617057128863
          ]
        },
        {
          "label": "Hungary",
          "value": 0.9224980794766453,
          "values": [
            0.41203481366567524,
            0.10209056648735522,
            0.4083622659494209,
            0.000010433374193904468
          ]
        },
        {
          "label": "France",
          "value": 0.6387512044501166,
          "values": [
            0.3560411848071328,
            0.09837000966792979,
            0.18434000997505393,
            0
          ]
        },
        {
          "label": "Latvia",
          "value": 0.7825612498835554,
          "values": [
            0.286653447426906,
            0.01857791144883755,
            0.474934458299509,
            0.002395432708302836
          ]
        },
        {
          "label": "Slovakia",
          "value": 0.12579527629889062,
          "values": [
            0.041569218648006785,
            0.017254451731500822,
            0.06697160591938299,
            0
          ]
        }
      ],
      "groups": [
        "Non-EU+ nationals",
        "EU+ nationals",
        "Own-country nationals",
        "Other / rounding"
      ],
      "groupLabel": "nationality",
      "allGroupsLabel": "All arrivals",
      "defaultGroup": 0
    }
  ]
};

/**
 * Every source of that fact in page order — its own, then its series' and
 * their readings' — as the fact page numbers them (see allSources in
 * fact-article.tsx). Its comparison cites numbers from this whole list.
 */
export const internationalImmigrationSources: Source[] = [
  {
    "stance": "supports",
    "quote": "A provisionally estimated 813,000 people made a long-term move to the UK in year ending (YE) December 2025. Immigration dropped compared with our updated estimate for YE December 2024, when it was 1,012,000, continuing a downward trend from the peak of 1,469,000 in March 2023. Net migration in YE December 2025 was 171,000. This was down from the peak of 944,000 in YE March 2023.",
    "title": "Long-term international migration, provisional: year ending December 2025",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  {
    "stance": "supports",
    "quote": "We have been measuring long-term international migration in and out of the UK for over 60 years.",
    "title": "What is international migration and how do we estimate it?",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/whatisinternationalmigrationandhowdoweestimateit/2025-11-18",
    "publisher": "Office for National Statistics",
    "date": "2025-11-18"
  },
  {
    "stance": "supports",
    "quote": "From the late 1960s to the early 1980s, net migration was consistently negative, meaning in most years, more people moved out of the country than moved into it.",
    "title": "What is international migration and how do we estimate it?",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/whatisinternationalmigrationandhowdoweestimateit/2025-11-18",
    "publisher": "Office for National Statistics",
    "date": "2025-11-18"
  },
  {
    "stance": "supports",
    "quote": "In the late 1990s, this trend reversed, and net migration began to rise.",
    "title": "What is international migration and how do we estimate it?",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/whatisinternationalmigrationandhowdoweestimateit/2025-11-18",
    "publisher": "Office for National Statistics",
    "date": "2025-11-18"
  },
  {
    "stance": "complicates",
    "quote": "Due to changes in methodology, comparisons between pre-June 2021 and post-June 2021 estimates should be treated with caution.",
    "title": "Immigration, emigration and net migration into the UK, 1964 - 2025 (data download)",
    "url": "https://www.ons.gov.uk/visualisations/dvc3417/line-chart/datadownload.xlsx",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  {
    "stance": "complicates",
    "quote": "Net migration fell from its peak of 944,000 in the year to March 2023 to 171,000 in 2025, lower than the levels seen during the 2010s and a sharp decline from the unusually high levels in 2022 and 2023. In 2025, 67% of non-EU immigration was for work and study purposes. … it reintroduced a post-study work route … made care and senior care workers eligible for work visas.",
    "title": "Net migration to the UK",
    "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/",
    "publisher": "The Migration Observatory, University of Oxford",
    "date": "2026-05-27"
  },
  {
    "stance": "supports",
    "quote": "Health and Care Worker visas had fallen prior to the changes",
    "title": "Why do people come to the UK? Work",
    "url": "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-march-2026/why-do-people-come-to-the-uk-work",
    "publisher": "Home Office",
    "date": "2026-07-16"
  },
  {
    "stance": "complicates",
    "quote": "Poland and Slovakia did not include refugees from Ukraine",
    "title": "Immigration in Europe, 2024: migr_imm8 and demo_pjan",
    "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260227-1",
    "publisher": "Eurostat",
    "date": "2026-02-27"
  },
  {
    "stance": "supports",
    "quote": "labour shortages were reported as a factor limiting production in Malta",
    "title": "Council recommendation on the economic policies of Malta",
    "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024H06825",
    "publisher": "Council of the European Union",
    "date": "2024-10-21"
  },
  {
    "stance": "supports",
    "quote": "Net migration of non-EU citizens increased after 1997 and peaked in 2004.",
    "title": "International migration: a recent history",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/articles/internationalmigrationarecenthistory/2015-01-15",
    "publisher": "Office for National Statistics",
    "date": "2015-01-15"
  },
  {
    "stance": "supports",
    "quote": "Economic growth and a structural demand for migrant labour",
    "title": "Determinants of Migration to the UK",
    "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/determinants-of-migration-to-the-uk/",
    "publisher": "The Migration Observatory, University of Oxford",
    "date": "2017-10-11"
  },
  {
    "stance": "complicates",
    "quote": "Immigration by age group, sex and citizenship",
    "title": "Immigration by citizenship, 2024 (migr_imm1ctz)",
    "url": "https://ec.europa.eu/eurostat/databrowser/view/migr_imm1ctz/default/table?lang=en",
    "publisher": "Eurostat",
    "date": "2026-09-11"
  },
  {
    "stance": "supports",
    "quote": "Net migration for EU+ nationals in YE December 2025 was negative 42,000, it has been negative since YE June 2022.",
    "title": "Long-term international migration, provisional: year ending December 2025",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  {
    "stance": "supports",
    "quote": "Most people immigrating into the UK in YE December 2025 were non-EU+ nationals, provisionally estimated at 627,000, a decline from 780,000 in YE December 2024.",
    "title": "Long-term international migration, provisional: year ending December 2025",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  {
    "stance": "supports",
    "quote": "Freedom of movement between the EU+ countries and the UK ended in January 2021.",
    "title": "Long-term international migration, provisional: year ending December 2025",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  {
    "stance": "supports",
    "quote": "EU net migration subsequently turned negative in 2022, as the post-Brexit immigration system greatly reduced opportunities for EU citizens to move to the UK.",
    "title": "Net migration to the UK",
    "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/",
    "publisher": "The Migration Observatory, University of Oxford",
    "date": "2026-05-27"
  },
  {
    "stance": "supports",
    "quote": "Those born in the European Union (EU) made up 3.6 million (36.4% of all non-UK born usual residents) of the population, an increase from 2.5 million (32.7%) in 2011",
    "title": "International migration, England and Wales: Census 2021",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/internationalmigrationenglandandwales/census2021",
    "publisher": "Office for National Statistics",
    "date": "2022-11-02"
  },
  {
    "stance": "complicates",
    "quote": "Although policy towards EU citizens did not change until January 2021, EU net migration began to fall immediately after the referendum.",
    "title": "Net migration to the UK",
    "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/",
    "publisher": "The Migration Observatory, University of Oxford",
    "date": "2026-05-27"
  },
  {
    "stance": "complicates",
    "quote": "This is because EU emigration is driven by people who arrived before Brexit, when EU immigration was higher.",
    "title": "Net migration to the UK",
    "url": "https://migrationobservatory.ox.ac.uk/resources/briefings/long-term-international-migration-flows-to-and-from-the-uk/",
    "publisher": "The Migration Observatory, University of Oxford",
    "date": "2026-05-27"
  },
  {
    "stance": "complicates",
    "quote": "For estimates up to YE March 2021 this category includes nationals of the countries of the European Union (EU) for each given time period (excluding British nationals).",
    "title": "Long-term international migration, provisional: year ending December 2025 (Table 1 data download)",
    "url": "https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/internationalmigration/datasets/longterminternationalimmigrationemigrationandnetmigrationflowsprovisional/yearendingdecember2025/may2026publicationspreadsheet.xlsx",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  {
    "stance": "complicates",
    "quote": "The number of non-EU+ nationals arriving for work-related reasons fell by 47% in 2025",
    "title": "Long-term international migration, provisional: year ending December 2025",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/yearendingdecember2025",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  {
    "stance": "complicates",
    "quote": "Due to changes in methodology, comparisons between pre-June 2021 and post-June 2021 estimates should be treated with caution.",
    "title": "Immigration, emigration and net migration into the UK, 1964 - 2025 (data download)",
    "url": "https://www.ons.gov.uk/visualisations/dvc3417/line-chart/datadownload.xlsx",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  {
    "stance": "complicates",
    "quote": "Mid-year population estimates relate to the usually resident population. They account for long-term international migrants (people who change their country of usual residence for a period of 12 months or more) but do not account for short-term migrants (people who come to or leave the country for a period of less than 12 months).",
    "title": "United Kingdom population mid-year estimate (series UKPOP)",
    "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/timeseries/ukpop/pop",
    "publisher": "Office for National Statistics",
    "date": "2025-11-27"
  },
  {
    "stance": "complicates",
    "quote": "Comparisons between estimates before and after June 2021 should be treated with caution because of changes in methodology.",
    "title": "Long-term international migration, provisional: year ending December 2025 (Table 1 data download)",
    "url": "https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/internationalmigration/datasets/longterminternationalimmigrationemigrationandnetmigrationflowsprovisional/yearendingdecember2025/may2026publicationspreadsheet.xlsx",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21"
  },
  {
    "stance": "supports",
    "title": "Long-term international migration, December 2025: Tables 1 and 3e (Ukrainian arrivals)",
    "url": "https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/internationalmigration/datasets/longterminternationalimmigrationemigrationandnetmigrationflowsprovisional/yearendingdecember2025/may2026publicationspreadsheet.xlsx",
    "publisher": "Office for National Statistics",
    "date": "2026-05-21",
    "quote": "Ukrainian … 135000 … 39000 … 17000"
  }
];
