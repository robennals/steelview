# US war with Iran — visualization upgrades

Where a report uses a stopgap today, the figure it should become once the
components in spec PR #17
(`docs/superpowers/specs/2026-10-29-fact-report-visualizations.md` on branch
`bb/fact-visualization-spec-thr_2svsdu69zv`) land. Ordered by how much the
change would improve the report (5 = most).

## Upgrades, most valuable first

| Report | Artifact | Stopgap today | Target kind | Data it needs | Gain |
| --- | --- | --- | --- | --- | --- |
| iran-nuclear-programme | 60% and total stock lines end 13 Jun 2025 | series that stops; Implementation Day and 28 Feb 2026 kept out of the event strip | series "not measured since" band | a band 13 Jun 2025 → today with reason "IAEA has had no access"; events outside coverage | 5 |
| decisions-law-and-diplomacy | House and Senate war-powers votes by party | two series with a "crossovers" reading | SliceExplorer (deferred) | vote × party × position rows (in the file) | 4 |
| decisions-law-and-diplomacy | Ceasefire, blockade, MoU and strike-pause periods with the War Powers letters | point `events` on the Pew series | periodTimeline | spans: ceasefire 7 Apr–7 Jul; blockade 13 Apr–June (end unconfirmed), 14 Jul–open; MoU 17 Jun–7 Jul; strike pause 8 Oct–; letters as points | 4 |
| iran-government-and-its-people | Crackdown deaths by counter and method | markdown table | dataTable | rows in the file | 4 |
| iran-government-and-its-people | Openings and reversals, 1997–2026 | markdown table | timeline (opening / reversal / succession) | rows in the file | 4 |
| iran-actions-abroad | Court findings, convictions and charges | markdown table | timeline (court finding / conviction / charge only) | rows in the file | 4 |
| iran-nuclear-programme | IAEA and ODNI statements on weapons work | markdown table | quoteComparison / QuoteBrowser | 8 quotes in the file | 4 |
| iran-nuclear-programme | Breakout and weapon timelines | markdown table | estimateRange (grouped by measure) | 10 estimates in the file | 4 |
| outside-attempts-to-change-hostile-regimes | Studies with their definitions | markdown table | dataTable | 12 rows in the file | 4 |
| outside-attempts-to-change-hostile-regimes | Nuclear programmes 1939–2017 | comparison of states by stage reached | periodTimeline | Bleek Table 1 phase dates for 31 states | 4 |
| human-and-financial-costs-of-the-war | Iranian deaths by counter | grouped comparison | compositionBar | the three counters' splits | 4 |
| human-and-financial-costs-of-the-war | Cost estimates by estimator and date | comparison bars (AEI range as two ends) | estimateRange | ranges and dates per estimator | 4 |
| oil-shipping-and-prices | Brent and WTI | monthly series, split into two charts | series focus window + per-line coverage | daily RBRTE/RWTC | 4 |
| oil-shipping-and-prices | Hormuz transits | monthly means of daily counts | series focus window (daily) | PortWatch daily | 4 |
| oil-shipping-and-prices | All chokepoints | one-month comparison | SmallMultiples (deferred) | daily series for all 28 chokepoints | 4 |
| decisions-law-and-diplomacy | Polls by party (Gallup Jun, Quinnipiac Mar) | grouped comparisons plus a Pew series | SliceExplorer (deferred) | pollster × date × measure × party × answer | 3 |
| decisions-law-and-diplomacy | War Powers letters | markdown table | dataTable / timeline | in the file | 3 |
| decisions-law-and-diplomacy | Ceasefire incidents | markdown table | timeline (category = actor) | in the file | 3 |
| iran-government-and-its-people | Arrests after attacks and crackdowns | markdown table | dataTable or keyFigures | rows in the file | 3 |
| iran-government-and-its-people | January 2026 deaths by category | comparison with shareTotal | compositionBar | HRANA's four categories | 3 |
| iran-government-and-its-people | GAMAAN preferred system | comparison | compositionBar | Figure 17, seven categories | 3 |
| iran-government-and-its-people | Majlis turnout, three points | comparison | series with per-line coverage | IPU Parline full series | 3 |
| iran-government-and-its-people | IHRNGO vs Amnesty executions | separate charts | series with per-line coverage | Amnesty's Iran figures 1981–2022 | 3 |
| iran-nuclear-programme | Inspections, report by report | markdown table | timeline / dataTable | 11 dated rows | 3 |
| iran-nuclear-programme | Damage claims side by side | markdown table | quoteComparison | 6 quotes | 3 |
| iran-nuclear-programme | Total and 60% stock as separate charts | two series | series with per-line coverage | none new | 3 |
| outside-attempts-to-change-hostile-regimes | Credibility and cascade findings | markdown tables | quoteComparison | 2 + 3 quotes | 3 |
| human-and-financial-costs-of-the-war | Iraq prewar estimates vs appropriations | comparison | estimateRange | low/high of each estimate, outcome | 3 |
| human-and-financial-costs-of-the-war | Counter methods | markdown table | dataTable | in the file | 3 |
| oil-shipping-and-prices | US petrol | monthly series | series focus window | weekly GASREGW from 1990 | 3 |
| oil-shipping-and-prices | Real crude price | series with forecast months cut | estimated/forecast points | Sep 2026 estimate, Oct 2026 forecast | 3 |
| oil-shipping-and-prices | CENTCOM blockade tallies | markdown table | dataTable | in the file | 3 |
| decisions-law-and-diplomacy | Campaign lines, 2 Mar report, 8 Oct pledge | markdown table | QuoteBrowser (deferred) | in the file | 2 |
| decisions-law-and-diplomacy | Earlier votes 2011–2025 and CRS base rates | markdown table plus 168-vs-1 comparison | dataTable + keyFigures | 11 declarations, 5 wars, 168 reports, 1 citing 4(a)(1) | 2 |
| decisions-law-and-diplomacy | Allies, UN and negotiations | markdown tables | QuoteBrowser, dataTable | UNSCR 2817 and MoU text still needed | 2 |
| iran-government-and-its-people | GDP growth and inflation as two charts | two series | series with per-line coverage | none new | 2 |
| iran-government-and-its-people | Freedom House, 195 countries | comparison | barChart with rank emphasis | none new | 2 |
| iran-government-and-its-people, iran-actions-abroad | GAMAAN sample caveats; plot-count caveats | prose | caveatList | none new | 2 |
| iran-actions-abroad | State Sponsors of Terrorism list | markdown table | dataTable | current state.gov list | 2 |
| iran-actions-abroad | Levitt plot counts; MI5 totals | markdown table | dataTable plus caveatList | none new | 2 |
| human-and-financial-costs-of-the-war | Displacement against population | comparison with shareTotal | keyFigures | 3.2 m; 92,417,681 | 2 |
| human-and-financial-costs-of-the-war | CSIS interceptor estimates | markdown table | dataTable | in the file | 2 |
| oil-shipping-and-prices | CPI, September 2026 | comparison | keyFigures | in the file | 2 |
| all reports with dollar comparisons | Cost comparisons in US$ | `count` unit with a "US$ billions" value label | barChart (currency unit) | the same items | 2 |

Markdown tables render after every chart, so R7's planned reading order
(statements first) is lost until the tables become figures. In R5 the US
casualty series renders before the Iranian deaths comparison for the same
reason (series render before comparisons).
