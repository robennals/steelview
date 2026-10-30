# Home page topic previews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's plain topic list with full-width topic rows — first open, with a carousel of balanced preview charts and one-line viewpoints — restyle the site's fonts to match, and add an About page.

**Architecture:** Topics declare `tags` and `previewCharts` in `topic.md`; the validator enforces that every viewpoint cites a previewed fact. The home page is a server component that resolves each preview to a fact chart and renders it through the shared `SeriesChart` / `ComparisonChart` in a new `preview` mode; a small client component handles the accordion and carousel as progressive enhancement over plain links and a scroll-snap strip.

**Tech Stack:** Next.js 16 App Router (read `node_modules/next/dist/docs/` before using any Next API), React 19, zod, `next/font/google`, plain CSS in `app/globals.css`, `node:test` via tsx, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-29-home-page-topic-previews-design.md`

## Global Constraints

- Every expensive command runs through `heavy run --` (tests, lint, build, E2E); dev servers through `heavy serve --`.
- Charts render only through `SeriesChart` / `ComparisonChart` (AUTHORING.md §Charts): years on time axes, every reading drawn, full item sets, publisher credit visible.
- No new home-page prose containing figures; slide text = fact `title`, chart `title`, chart `description`.
- Tagline copy exactly: "Every side of the argument, at its strongest." Link copy exactly: "What is Steelview?" → `/about`.
- Fonts: Inter Tight (headings), Inter (interface), Source Serif 4 (reading), defined once in `app/fonts.ts`.
- Works without JavaScript: row headings are links to `/topics/<slug>`; slides reachable by horizontal scroll.
- `prefers-reduced-motion` disables the row and carousel transitions.

## Review Focus

- **A topic whose preview chart is a series with several readings** — the slide shows every reading without overflowing the carousel; test in Task 3 (UK long-run slide renders both reading headings).
- **A dense comparison (>12 items) in preview** — all items present, highlighted item labelled with its rank; unit test in Task 2.
- **Rapid clicks on two different rows** — exactly one row open at the end; E2E in Task 4.
- **Keyboard only** — Tab to a collapsed row heading, Enter opens it; arrow keys move the focused carousel; E2E in Task 4.
- **JavaScript disabled** — heading navigates to the topic; E2E in Task 4.

---

### Task 1: Topic `tags` and `previewCharts`, validated

**Files:**
- Modify: `lib/content/schema.ts` (topicFrontmatterSchema), `lib/content/types.ts` (Topic picks them up via the schema), `lib/content/validate.ts`
- Modify: `content/topics/{uk-immigration,us-iran-war,us-vote-by-mail,us-voter-id}/topic.md`, `lib/content/__fixtures__/topics/example/topic.md`
- Modify: `content/AUTHORING.md` (new "Home-page preview charts" subsection under §Charts; two rows in §What the build enforces)
- Test: `lib/content/schema.test.ts`, `lib/content/validate.test.ts`

**Interfaces:**
- Produces: `Topic['tags']: string[]`, `Topic['previewCharts']: { fact: string; chart: string }[]`; `chartIdsOf(fact: Fact): string[]` exported from `lib/content/validate.ts` (`'series'` if `fact.series`, each `additionalSeries[].id`, each `comparisons[].id`).

- [ ] **Step 1: Failing tests.** schema: `tags` required, ≥1, unique; `previewCharts` defaults to `[]`, entries `{fact, chart}` non-empty strings. validate (build a topic from the example fixture): `topic: previewCharts is empty`; `topic: preview chart X/Y does not resolve`; `topic: preview chart X/Y is listed twice`; `topic: viewpoint V cites none of the preview charts' facts` when a viewpoint's body has no `#fact-<previewed fact>` link.
- [ ] **Step 2:** `heavy run -- pnpm test:unit` → the new tests fail.
- [ ] **Step 3:** Implement schema fields and the four checks in `validateTopic` (citations: reuse however `citationErrors` reads `#fact-` links from viewpoint bodies).
- [ ] **Step 4:** Add `tags` and `previewCharts` to the fixture and the four `topic.md` files — selections and tags exactly as in the spec's "Preview selections" and UK table.
- [ ] **Step 5:** AUTHORING.md: the four-point rule in the spec's words, the UK selection as worked example, the known *Better off* weakness; enforce-table rows.
- [ ] **Step 6:** `heavy run -- pnpm test:unit && heavy run -- pnpm check:integrity` → pass.
- [ ] **Step 7:** Commit "Let topics declare tags and preview charts, and check every viewpoint is previewed".

### Task 2: `preview` mode on the shared charts, plus thumbnails

**Files:**
- Modify: `components/topic/series-chart.tsx`, `components/topic/comparison-chart.tsx`, `app/globals.css`
- Create: `components/topic/chart-thumb.tsx`
- Test: `components/report/*.test.ts` pattern — add `lib/chart/comparison-preview.test.ts` for the pure helper below

**Interfaces:**
- Produces: `SeriesChart` prop `preview?: boolean`; `ComparisonChart` prop `preview?: boolean`; `rankOf(items: {label: string; value: number; highlight?: boolean}[]): { label: string; rank: number; of: number } | null` in `lib/chart/comparison-preview.ts`; `ChartThumb({ fact, chart }: { fact: Fact; chart: string })` (aria-hidden).

- [ ] **Step 1: Failing test** `rankOf`: highlighted UK at 16.0 among 32 values sorted descending → `{label:'United Kingdom', rank:17, of:32}`; no highlight → `null`; ties share the better rank.
- [ ] **Step 2:** run → fail. **Step 3:** implement `rankOf`. **Step 4:** run → pass.
- [ ] **Step 5:** `preview` on `SeriesChart`: every reading still drawn, years still on the axis; omit observations and the Graph/Table toggle (show graph only); keep "About this data" and the credit. `preview` on `ComparisonChart`: no group controls/breakdown table; when `items.length > 12`, render the dense preview — one thin column per item, all items, highlighted one coloured and labelled "`<label>` · `<value>` — `<rank>` of `<of>`" via `rankOf`; keep note disclosure and credit.
- [ ] **Step 6:** `ChartThumb`: series → main reading's first line drawn with `layoutReading`/`pathFor` at a small fixed size, no text; comparison → bars as CSS widths/heights. Decorative only.
- [ ] **Step 7:** Commit "Add a compact preview mode to the shared charts".

### Task 3: Home page rows and carousel

**Files:**
- Create: `lib/content/preview.ts`, `components/home/topic-rows.tsx` (server), `components/home/topic-accordion.tsx` (client), `components/home/preview-carousel.tsx` (client)
- Modify: `app/page.tsx`, `app/globals.css` (replace `.sv-topics*` / `.sv-index__lede` rules)
- Test: `lib/content/preview.test.ts`

**Interfaces:**
- Consumes: Task 1 `Topic['previewCharts'|'tags']`, Task 2 `preview` props and `ChartThumb`.
- Produces: `resolvePreviews(topic: Topic): PreviewSlide[]` where `PreviewSlide = { fact: Fact; chart: string; label: string; title: string; description: string; href: string }` — `label` = fact title (fallback: chart title), `title`/`description` from the series or comparison, `href` = `factPath(slug, fact.id) + '#' + fact.id + '--chart-' + chart`.

- [ ] **Step 1: Failing test** `resolvePreviews` on the loaded UK topic: 4 slides; first `chart === 'series'` with `title` "UK immigration, emigration and net migration, 1964–2025"; second `chart === 'arrival-reasons'`; hrefs start `/topics/uk-immigration/facts/`.
- [ ] **Step 2–4:** fail → implement → pass.
- [ ] **Step 5:** `TopicRows`: hero (tagline h1, About link), then for each topic an `<article>` with heading link (title), subtitle, tags, last-updated, thumbnails of first three slides; body with carousel (every slide server-rendered: label, title, description, chart in `preview` mode, "See this chart in full" link), viewpoints (`sortViewpoints` order, `name` only, one line, ellipsis, colour marker by order), "Read the full report" link, counts `N viewpoints · N disagreements · N facts` (cruxes, facts). First topic `open`.
- [ ] **Step 6:** `TopicAccordion` (client): intercepts plain left-click on a heading link (not modified clicks) to open that row and close the others; `aria-expanded`/`aria-controls` on the heading; keeps the clicked row's top fixed during the 0.55 s transition (scroll compensation per animation frame, as in the prototype); CSS `grid-template-rows: 0fr → 1fr`.
- [ ] **Step 7:** `PreviewCarousel` (client): enhances a scroll-snap strip with prev/next buttons, dots, "n / N · label" count, ArrowLeft/ArrowRight when focused; strip height = tallest slide (CSS grid stacking is not used; the strip is a flex row with `align-items: stretch`).
- [ ] **Step 8:** CSS from the approved prototype (`accordion-magnitude-v2.html`): page `#f6f5f2`, rows white, 1px `#e7e5e0`, radius 16px, open shadow, hover lift + accent title, reduced-motion overrides, phone layout below 760px (stack carousel over viewpoints, hide thumbnails).
- [ ] **Step 9:** `heavy run -- pnpm test:unit && heavy run -- pnpm lint` → pass; screenshot the dev page and compare with the prototype.
- [ ] **Step 10:** Commit "Show each topic as an expandable row with a carousel of its preview charts".

### Task 4: E2E for the home page

**Files:**
- Modify: `tests/index.spec.ts`

- [ ] **Step 1:** Tests: first row open and its carousel moves (`next` → count reads "2 / 4"); clicking the second heading opens it and closes the first, and its top moves < 4 px; rapid clicks on rows 2 then 3 leave only row 3 open; Tab to row 2 heading + Enter opens it; with `javaScriptEnabled: false` clicking a heading lands on `/topics/<slug>`; tags visible on each row.
- [ ] **Step 2:** `heavy run -- pnpm test:e2e tests/index.spec.ts` → pass.
- [ ] **Step 3:** Commit "Test the home page rows and carousel".

### Task 5: Fonts site-wide

**Files:**
- Modify: `app/fonts.ts`, `app/globals.css` (font tokens, heading rules), `.storybook/preview.tsx` only if it names the old fonts

- [ ] **Step 1:** `fonts.ts`: `Inter_Tight` → `--font-inter-tight`, `Inter` → `--font-inter`, `Source_Serif_4` (normal + italic) → `--font-source-serif`; export `fontVariables` as now.
- [ ] **Step 2:** Tokens: `--font-serif` → Source Serif 4 stack, `--font-sans` → Inter stack, new `--font-display` → Inter Tight stack; headline classes (`.sv-title`, section and item headings, wordmark) use `--font-display` with tight tracking (−0.02 to −0.035em, weight 600).
- [ ] **Step 3:** `heavy run -- pnpm test:e2e tests/appearance.spec.ts` (update snapshots only after checking the diff is just the fonts); screenshot a topic page and a fact page.
- [ ] **Step 4:** Commit "Switch the site to Inter Tight, Inter and Source Serif 4".

### Task 6: About page

**Files:**
- Create: `app/about/page.tsx`; Modify: `app/sitemap.ts`

- [ ] **Step 1:** Page with metadata title "About", content drafted from README's opening (what Steelview is, steelmanning, data with sources, what a reader should leave able to do), marked in a code comment as a first draft for the owner to revise.
- [ ] **Step 2:** Add `/about` to the sitemap; E2E: the home "What is Steelview?" link reaches `/about`.
- [ ] **Step 3:** Commit "Add a first-draft About page".

### Task 7: Full verification

- [ ] `heavy run -- pnpm check` (lint, unit, integrity, figures, build) → pass.
- [ ] `heavy run -- pnpm test:e2e` → pass.
- [ ] Before/after screenshots of the home page (open row, second row opened, phone width) and one topic page for the PR.
