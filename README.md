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

The filename is the item's id, and the id is permanent — it's the URL anchor
for that item (`/topics/uk-immigration#net-migration-2024`), so renaming a
file breaks every link and cross-reference to it. Each file is YAML
frontmatter (the structured fields — claim, status, sources, cross-references
to other items) plus a markdown body (the prose). Facts render sorted by
`status`, not by filename, so file order in the directory doesn't matter.

## Invalid content fails the build

`lib/content/load.ts` loads and validates the whole tree at build time. A
malformed file, or a cross-reference to something that doesn't exist, fails
`pnpm build` (and CI) with a message naming the offending item — it never
renders a broken page. Beyond the zod schema shape, seven rules are enforced
and unit-tested:

1. Every id referenced in `citesFacts`, `acknowledges`, `setsAside`,
   `principles`, `heldBy`, `divides`, and `positions[].viewpoint` must
   resolve to a real item.
2. `citesFacts` may only contain `well-supported` or `contested` facts;
   `acknowledges` may only contain `well-supported` facts; a fact can appear
   at most once across those three lists on any one viewpoint.
3. A `well-supported` or `not-supported` fact needs at least one source.
4. A `contested` fact needs at least one `supports` source, at least one
   `contests` source, and a non-empty body.
5. Every viewpoint's `acknowledges` list is non-empty.
6. Every crux `divides` at least two viewpoints and gives a position for
   each one.
7. No orphans — every fact must appear in some viewpoint's `citesFacts`,
   `acknowledges`, or `setsAside`, and every principle must be held by at
   least one viewpoint.

## Adding a topic

Add a new directory under `content/topics/`, following the structure above.
The fact-status rubric (`well-supported` / `contested` / `not-supported` /
`complicated` / `unknown`) is the normative editorial standard for what
belongs in each status — it's detailed, so it lives in
[`docs/superpowers/specs/2026-08-18-steelview-design.md`](docs/superpowers/specs/2026-08-18-steelview-design.md)
rather than here. Run `pnpm build` to check the new content validates before
opening a PR.
