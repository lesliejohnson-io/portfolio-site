# Case study page layout

Template for every page at `/work/[slug]`. Modeled on the structure of Jack Moffett's case studies (e.g. jackmoffett.com/case-studies/redesigning-ux-career-architecture-to-scale-craft-clarity-and-retention): simple, one column, fixed section order, nothing decorative. Match the structure, not the look. Colors, type and tokens come from `globals.css`.

## Page structure, top to bottom

### 1. Header (body column width)
- **Category pill:** small, rounded, accent-tinted label from frontmatter `category` (e.g. "Physical AI", "Health Research", "Fintech"). One category per case study.
- **Title:** the outcome-led `title`, as the page's only `h1`. Archivo bold, large (about 3.5rem desktop, 2.25rem mobile), tight leading, left-aligned. The pill and title sit at the body column measure (about 680px), sharing the same left and right margins as every paragraph below them. The logo strip and hero run the full page column.
- **Status note:** optional. One line from frontmatter `status`, under the title, for a study whose work is still in progress. Rendered with a bold "Status:" label. Omit the field and nothing renders — most studies have no status line.
- **Logo strip:** the frontmatter `logos` marks, under the title. White-on-transparent artwork, inverted to near-black on the light theme and held at low opacity. Used instead of a text list of institutions.

### 2. Hero visual (wide container, full width)
- One wide visual directly under the title, full container width, landscape (about 21:9 to 16:9).
- Source: frontmatter `hero` (image or looping video, same rules as the home page rows). If missing, render the designed VisualSlot placeholder at the same size.
- No caption.

### 3. Key outcomes strip (body column width)
- Up to three outcome numbers in a row, from frontmatter `stats` (value, label, caption). Big number, short label.
- **Captions are hidden here** and shown only in the Outcomes & Impact row, so the strip stays scannable. Both rows render from the same `stats`, in the same size, and sit at the body column measure so they line up with the text.
- Each number counts down from 100 to its real value the first time it scrolls into view. Values with no leading digit (a phrase, a range) render as written.
- This deviates from Jack (he puts numbers only at the end). It keeps the "outcome up front" rule for skimming hiring managers. If a case study has no hard numbers, omit the strip entirely. Never pad it.

### 4. Body (narrow column, centered)
- Single column, max about 680px (about 68ch), centered in the page. All body sections sit here.
- Section headings (`h2`) are the fixed structural labels below, Archivo bold at 2.25rem (1.875rem on small screens), with generous space above (5rem desktop, 3.5rem small). Sub-section `h3` is 1.5rem.
- Sub-sections (`h3`) inside a section are claims, not labels, e.g. "1. Voice cut survey time in half for older participants." Numbered in Approach.
- Paragraphs are short. Bulleted lists are fine for lists of facts, as in Jack's pages.

Fixed section order:

1. **Context:** the organization, the situation, what was broken, and Leslie's role and team. Ends with the core problem in one or two sentences.
2. **Objective:** what success had to mean, as a short statement plus a bulleted list of goals or constraints.
3. **Approach:** the story, as numbered `h3` steps (usually 3 to 6). Each step is a short claim-led subhead, a few short paragraphs or bullets, and optionally one visual as evidence.
4. **Optional extra section**, only when the story needs it (e.g. "Stakeholder Alignment," "Rollout"). At most one.
5. **Outcomes & Impact:** a bulleted list of results, then a row of up to three stats (same component as the top strip). This row shows the measurement captions.
6. **Reflection** (optional): what Leslie would do differently, and how she would build it today, as claim-led `h3` subheads.

### 5. Visuals inside the body
- Default: visual fills the body column width, placed right after the claim it supports. Always inline — nothing floats beside the text in this template.
- **Wide:** can break out of the column to about 1000px for dense diagrams or dashboards.
- **Gallery:** a two- or three-column grid of related images, used at most once per page.
- Every visual has alt text. Captions only when the image needs explanation.
- Use VisualSlot placeholders until real assets exist. Never fabricate screenshots.

### 6. Other case studies (wide container)
- Heading "Other case studies" on the left, "See all case studies" button on the right linking to `/work`.
- Two cards, side by side on desktop, stacked on mobile. Pick the next two case studies by `order`, wrapping around, excluding the current one.
- Each card: category pill, title, one stat (value plus label) if the case study has one, and its visual on the right. The whole card links to the case study.

### 7. Footer
- The existing site footer. (Jack uses a dark footer band with a closing line like "Let's build better design organizations together." That's a possible later change, not part of this template.)

## Frontmatter fields

Existing fields stay. Add:

```yaml
layout: "v2"                     # opt in to this template; omit to keep the old page
category: "Physical AI"          # pill label
status: "working prototype…"     # optional; one line under the title
hero: "/work/synapse/hero.png"   # image or .mp4/.webm; optional
heroAlt: "…"                     # required if hero is set
heroPending: "…"                 # what the hero will show, for the placeholder
logos:                           # optional institution marks under the title
  - src: "/work/<slug>/nih.png"
    alt: "National Institutes of Health"
stats:                           # optional, max 3, only real measured numbers
  - value: "84%"
    label: "Drop in payment abandonment"
    caption: "Measured over …"   # exactly as sourced; never invented
```

## MDX skeleton for a case study body

```mdx
## Context

Short paragraphs on the organization, the situation, and Leslie's role.

## Objective

One-sentence goal.

- Goal or constraint
- Goal or constraint

## Approach

### 1. Claim-led subhead for the first step

Short paragraphs or bullets.

<VisualSlot label="What this visual will show" />

### 2. Claim-led subhead for the second step

Short paragraphs or bullets.

## Outcomes & Impact

- Result
- Result

<StatRow />
```

`<StatRow />` renders the frontmatter `stats`, so numbers live in one place.

## Rules

- Never invent, inflate, or reword metrics, quotes, or captions. Empty slots render as designed placeholders.
- Keep existing MDX components (StatCallout, ProjectSummary, BeforeAfter, PersonaCard, VisualSlot) working inside the body column. ProjectSummary is replaced by Context and Objective in this layout. Don't delete it until every case study has been moved over.
- WCAG AA in both themes, one `h1` per page, headings in order.
- Case study pages animate on scroll: section headings float up into view, visuals float up via VisualSlot, and stat values count down from 100. Each fires once. All of it is disabled under `prefers-reduced-motion`, and nothing is hidden when JavaScript does not run. (This reverses the earlier "no entrance animations on case study pages" rule, changed 2026-09-29.)

## Build steps (stop after each for review)

**Field Guide was used as the test page instead of Synapse.** Studies opt in with
`layout: "v2"`; every other study keeps the original page until migrated, so the
two layouts coexist.

1. ~~Build the page shell: header, hero, outcomes strip, body column, other case studies.~~ **Done** on `/work/field-guide`.
2. ~~Add the new frontmatter fields and `StatRow`.~~ **Done.** `category` also added to Common Project ("Coaching AI") and Client Portal ("Fintech") for the related-study cards.
3. ~~Move the content into the new section order.~~ **Done** for Field Guide.
4. Move the remaining case studies over one at a time: Common Project, Client Portal, Synapse, ECSI.

Outstanding on Field Guide: no `hero` asset yet (placeholder is sized and
waiting), and the in-body visuals are still VisualSlot placeholders.
