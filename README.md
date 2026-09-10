# Steelview

Steelview presents all sides of a divisive news issue on one page: the facts
that are actually established, the strongest version of each major viewpoint,
the moral principles underneath them, and the specific reasons the sides
disagree. Each viewpoint is steelmanned — written so that a partisan reading
their own position finds it better argued than the version they would have
written themselves, and reads the others as recognisable rather than
caricatured. A reader who arrives holding one view should leave able to state
the other views in a form their holders would endorse.

This milestone ships one topic, UK immigration, as a statically rendered
page. There is no auth, no comments, and nothing deployed yet — those are
future milestones (see the design spec below).

## Commands

```bash
pnpm dev        # dev server at localhost:3000
pnpm test:unit  # node:test via tsx — content validation and pure logic
pnpm test:e2e   # Playwright — builds the app, then drives it in a browser
pnpm lint       # eslint
pnpm check:figures  # audits figures asserted in prose against the quoted sources
pnpm build      # production build (this is what fails if content is invalid)
```

## Content

One directory per topic, one markdown file per item:

```
content/topics/uk-immigration/
  topic.md
  facts/
    net-migration-2024.md
    wage-effect-low-skill.md
  viewpoints/
    control-first.md
  principles/
    national-self-determination.md
  cruxes/
    will-integration-keep-pace.md
```

The filename is the item's id, and the id is permanent — it forms the URL
anchor for that item, prefixed with its kind (`/topics/uk-immigration#fact-net-migration-2024`),
so renaming a file breaks every link and cross-reference to it. Each file is YAML
frontmatter (the structured fields — claim, status, sources, cross-references
to other items) plus a markdown body (the prose).

Neither facts nor file order decide reading order. **Fact order is derived**:
each viewpoint ranks the facts it cites and then those it acknowledges, and
the page interleaves those rankings round-robin, so no viewpoint's second
fact appears before every viewpoint has had its first
(`lib/content/rank-facts.ts`). **Viewpoint order is an explicit `order` field**
on each viewpoint, chosen so the sides alternate rather than cluster.

## Invalid content fails the build

`lib/content/load.ts` loads and validates the whole tree at build time. A
malformed file, or a cross-reference to something that doesn't exist, fails
`pnpm build` (and CI) with a message naming the offending item — it never
renders a broken page. Beyond the zod schema shape, these rules are enforced
and unit-tested:

1. Every id referenced in `citesFacts`, `acknowledges`, `setsAside`,
   `principles`, `heldBy`, `divides`, and `positions[].viewpoint` must
   resolve to a real item.
2. `citesFacts` may only contain `well-supported` or `contested` facts;
   `acknowledges` may only contain `well-supported` facts; a fact can appear
   at most once across those three lists on any one viewpoint.
3. Every fact needs at least one source, whatever its status — nothing is
   presented as a fact without a quoted source.
4. Every fact needs a non-empty body giving its context.
5. A `contested` fact needs at least one `supports` source and at least one
   `contests` source.
6. Every viewpoint's `acknowledges` list is non-empty.
7. Every crux `divides` at least two viewpoints and gives a position for
   each one.
8. No orphans — every fact must appear in some viewpoint's `citesFacts`,
   `acknowledges`, or `setsAside`, and every principle must be held by at
   least one viewpoint.
9. A topic needs at least 1 fact and at least 2 viewpoints.
10. A principle's `heldBy` and a viewpoint's `principles` must agree with
    each other — each is the same relationship stated from the other end.

`pnpm check:figures` extends the sourcing rule to prose: a money, percentage
or thousands figure asserted in any markdown body must appear in a quoted
source on the same topic. It runs in CI.

## Adding a topic

**Read [`content/AUTHORING.md`](content/AUTHORING.md) first.** It is the
authoring guide: the fact-status rubric, how to phrase a claim and its body,
the sourcing and time-series rules, what makes a viewpoint a steelman, the
prose patterns to avoid, which rules the build enforces and which are
editorial judgement, and a checklist to run before opening a PR.

Then add a new directory under `content/topics/`, following the structure
above, and run `pnpm build` and `pnpm check:figures` to check the new content
validates.

## Licence

Code is MIT — see [`LICENSE`](LICENSE). Editorial content under `content/`
is CC BY 4.0 — see [`content/LICENSE`](content/LICENSE), which also states
the boundary: the quoted source material inside each fact is not Steelview's
to license and carries its own terms.
