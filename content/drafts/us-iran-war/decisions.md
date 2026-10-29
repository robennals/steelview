# US war with Iran — decisions made on the human's behalf

The human waived the stage-4, stage-5 and stage-6 gates for this round. Each
choice below was made without asking; each names the alternative rejected so
it can be reversed.

## Stage 5 — reports

1. **Report ids.** `iran-nuclear-programme`, `iran-actions-abroad`,
   `iran-government-and-its-people`, `outside-attempts-to-change-hostile-regimes`,
   `human-and-financial-costs-of-the-war`, `oil-shipping-and-prices`,
   `decisions-law-and-diplomacy`. Short subject names without year ranges, so
   the ids stay true as the war goes on. *Rejected:* ids carrying the years in
   the 3c titles (they would go stale).
2. **No "Other facts" report.** Israel's role in planning (Q4.4) still has no
   candidate, and the DNI memo and post-midterm plans fit in
   `decisions-law-and-diplomacy`. *Rejected:* an Other report holding only gaps.
3. **Topic principles.** The eight shared principles the outline names, with no
   new principle. *Rejected:* a new "constitutional war powers" principle;
   `democratic-consent-over-membership` ("Democratic consent") and
   `rules-must-mean-what-they-say` already carry the war-powers case.
4. **Reports built by four builder agents** (R1+R4, R2+R3, R5+R6, R7 plus the
   timeline recheck), from one shared brief. *Rejected:* building all seven in
   one session (too large to keep every quote checked).
5. **New sources used as the human supplied them.** MI5's two threat updates go
   in `iran-actions-abroad` as MI5's own unaudited totals; GovTrack closes the
   "Senate votes after 10 Oct" gap (none after 24 Sept); the CENTCOM releases
   replace the Khaleej Times relay for blockade tallies. CENTCOM's 16 Oct
   "$25 billion" claim is dropped as still unverified. *Rejected:* keeping the
   relay or the Wikipedia citation.
6. **Dollar comparisons use `count` with a "US$ billions" value label.**
   ComparisonChart's units are count, percent and pounds only. Logged in
   visualization-upgrades.md for spec #17's barChart, which handles currency.
   *Rejected:* adding a dollars unit to the shared schema in this branch.

## Stage 6 — viewpoints and cruxes

7. **Viewpoint frontmatter carries only `name`, `summary` and `order`**
   (AUTHORING.md wins over the round's brief, per the coordinator). What a
   viewpoint rests on or concedes is shown by its inline observation pills;
   principles are linked inline as `#principle-<id>` pills; headline report
   order is `dataOrder` in topic.md. *Rejected:* `citesFacts`,
   `acknowledges`, `setsAside` and `principles` lists (accepted by the schema
   only for migration; no code reads them).
8. **Each viewpoint's opening paragraph carries its gist on its own**, since
   main (PR #7) no longer displays `summary`; a short `summary` is kept because
   the validator still checks its links. *Rejected:* dropping the summary or
   leaving the gist only in it.
9. **R1's stock series starts Feb 2017, not 2016.** The four 2016 IAEA reports
   say only that the stock "has not exceeded" the limit, with no quantity.
   Implementation Day and the 28 Feb 2026 end of verification fall outside the
   series and sit in the inspections table. *Rejected:* plotting 2016 at the
   cap value, which the source never published.
10. **Outline revised by notes plus targeted patches.** Draft 5's per-viewpoint
    changes are in Revision notes, with the few outdated body lines (MoU
    collapse, DNI memo, costs) fixed in place. *Rejected:* rewriting every
    outline section, now superseded by the viewpoint files themselves.
11. **Viewpoint order alternates hawk and dove:** nuclear (1), lost-path (2),
    finish-job (3), war-powers (4), regime-change (5), america-first (6),
    deal-now (7). *Rejected:* the outline's order, which put the three
    pro-war views together at the ends.
12. **Eight cruxes**, the outline's seven plus a `priority` crux on whether
    lawful process comes before a security need (war-powers vs nuclear and
    finish-job). It passes the strict test: if the threat comes first,
    war-powers' conclusion falls. *Rejected:* leaving war-powers in no crux.
13. **Constitution quoted in R7.** War-powers' central premise needed an
    observation, so the National Archives transcript of Article I §8 ("To
    declare War") and Article II §2 was added as source 51 of
    `decisions-law-and-diplomacy` (Cornell LII refused the fetch).
    *Rejected:* leaving the premise unsourced.
14. **Two 8 Oct events removed from R6's monthly Brent and WTI series**,
    which end Sept 2026, because the validator rejects events outside
    coverage; the event remains on the other R6 series. The builder's
    generator template (outside the repo) still has them — edit it if the
    file is regenerated. *Rejected:* extending coverage past EIA's last
    full month.
15. **`dataOrder`:** nuclear programme, decisions and law, costs, actions
    abroad, government and people, oil and shipping, outside attempts — the
    war's core questions first, the comparative research last. *Rejected:*
    plan order (R1–R7), which put the research table fourth.
