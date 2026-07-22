@AGENTS.md

# CLAUDE.md — lesliejohnson.io rebuild

## What this is

Portfolio site for Leslie Johnson, senior AI product designer. Replaces an expiring Webflow site. Deploys to Vercel. Hard deadline: ~3 days. A live deploy on day one matters more than polish on day one.

Reference site #1 (quality bar, feel): https://emilycampbell.co — editorial, restrained, custom-built, no template smell.

Reference site #2 (structure, simplicity): https://sergevasil.com — one-sentence hero, work-grid-as-homepage, two-item nav, dark/light toggle, single-line colophon. This is the closer structural model for this build. We are not copying either site; we are matching their level of intention.

## Stack

- Next.js (App Router) + React
- Tailwind CSS
- MDX for all page content and case studies — content lives in markdown files, components render it. Leslie edits content without touching components.
- Deploy: Vercel. Domain lesliejohnson.io cut over from Webflow after the site is complete (DNS is the time-sensitive step; leave hours, not minutes).
- No CMS, no database. Static generation throughout.

## Site map

1. **Home** (`/`) — hero + work grid, no separate scroll section needed
2. **Work** (`/work`) — case study index (same grid as home, or home IS this — see Home below)
3. **Case studies** (`/work/[slug]`) — one MDX template, multiple studies
4. **About** (`/about`)
5. **Contact** — not a page; a persistent email affordance (see below)

Nav (super simple, Serge-model): **Work · About**, plus a persistent email icon/affordance (not a text nav item — see Contact). No dropdowns, no mega-menu. Footer: name mark, tagline "Intelligent Systems Meet Human Design," LinkedIn, GitHub, © year, colophon line.

No password-gated case studies. Every case study on the site is fully public — this differs from the Serge Vasil reference, which gates some work. All four launch case studies ship complete and open.

## Content sources (do not rewrite; render as provided)

- `content/about.mdx` ← final copy exists (about-page.md). Do not edit the prose.
- `content/work/ecsi.mdx` ← final copy exists (ecsi-case-study.md). Includes its own Who/What/Result card copy at top — that block renders on the Work grid, not the study page.
- ~~**Launch scope is exactly four case studies: ECSI, Field Guide, Common Project, Paloma AI.** No stubs, no "coming soon" cards, no fifth project (CHAD-01 and Synapse are out of scope for this launch — do not reference or scaffold them).~~ **Superseded during Day 2** — see the case study roadmap in Implementation notes below for the current lineup and order (Synapse is now in scope; Paloma AI is not currently on the list). The "no stubs, only complete real cards" rule still applies regardless of which projects are in scope.
- `content/work/field-guide.mdx`, `common-project.mdx`, `paloma-ai.mdx` ← content pending, to be supplied the same way ECSI was (final MDX handed off when ready).
- Homepage copy: see Home below.

## Page briefs

### Home
- Hero (confirmed, final):
  > **Intelligent systems *meet human design.***
  > I design the human side of AI systems — so the products organizations build earn trust instead of losing it.
- **The work grid IS the homepage body.** No separate "Home" content sandwiched above it — hero, then straight into the grid, Serge-style. `/work` can either redirect to `/#work` or be a thin duplicate of the same grid component; do not build two different layouts for the same four cards.
- Grid order: **ECSI first** (only project with hard numbers in the card copy), then Field Guide, then Common Project, then Paloma AI.
- Each card: thumbnail/video, project name, one-line role/domain tag (Serge-style: "Video & AI platform," "Full-cycle brokerage"), one-line description, link to full case study. Where a project has numbers (ECSI, and Field Guide once its numbers arrive), lead the description with the result, Natoli-style — the WhoWhatResult density from the case study files can compress into this one line.
- About block: **cut from the homepage.** With the grid as the main event and About living at `/about`, a second bio block on the home page is redundant — Serge's homepage has zero bio copy beyond the hero. Move the action photo (`videoShot1.png`) to the About page instead of home.
- Close: persistent email affordance (see Contact) — no separate "open to opportunity" paragraph needed if the hero already states positioning clearly.

### Work
- `/work` renders the same grid as home (see above) — do not diverge the two.
- No "tier" distinction needed in the UI now that scope is fixed at four; they're just ordered ECSI → Field Guide → Common Project → Paloma AI.

### Case study template
Structure follows Joe Natoli's method exactly (see his "How to Write a Compelling Case Study" — this is the authoritative structure for this site, not the Serge Vasil reference, which optimizes for narrative/visual flow rather than the screener-first scannability Natoli argues for):

1. **Descriptive, outcome-led title.** Never a generic project name — the title states the outcome or problem ("Cutting Payment Abandonment 84% by Rebuilding ECSI's Payment System," not "ECSI Case Study").
2. **Two-step progressive disclosure.** Step one lives on the Work grid card: WHO / WHAT / RESULT rows, kept exactly as short bullets, plus a clear "Full Case Study →" link. Step two is the case study page itself.
3. **Project Summary (TL;DR) at the very top of the page**, visually distinct from body text — one or two sentences max, stating the outcome and the work involved, before any other content. This is the ProjectSummary component.
4. **Give away the ending first.** The outcome numbers (StatCallout components) appear immediately after the summary, not saved for the end.
5. **Short bursts, heavy subheads, no long paragraphs.** Every subhead must alone convey the gist if someone reads nothing else. Subheads are claims, not labels ("The fix: kill the ID, prove 2FA to compliance," not "Solution").
6. **Standard section order:** Outcome/Problem statement → Users & needs → Role & the work you did → Constraints → the story itself (short, dated/sequenced bursts) → Impact, restated.
7. **Images as evidence, not decoration.** Each image must be introduced by the text it supports and must earn its place — Natoli's rule is that two strong images beat six mediocre ones. No image gallery, no bulk visual sections. This rules out Serge's full-bleed/grid rhythm as the organizing principle; images stay modest in size, embedded next to the specific claim they support.
8. Conversational voice, read-aloud test — if it doesn't sound like something Leslie would actually say, rewrite it.

Components that implement this (MDX-mapped, conventions already used in the content files):
- **StatCallout** — big number, label, measurement caption (renders the `> **84%**` blockquote pattern). Placed high on the page per rule 4, not just at the end.
- **ProjectSummary** — the TL;DR box, rule 3, top of page.
- **BeforeAfter** — paired before/after rows, used sparingly as evidence per rule 7.
- **PersonaCard** — composite persona block (must carry its "representative composite" label — never strip it).
- **VisualSlot** — placeholder-aware figure component; renders image when provided, styled placeholder when the `*[Visual: …]*` marker has no asset yet. Keep images modest — inline with the claim they support, not full-bleed.
- Prose measure ~65–75ch, generous whitespace, but density comes from subhead scannability, not from image size.

### About
- Renders content/about.mdx as-is. Hero line "Most AI builders start with the system. I started with the human." is the page h1.
- **Action photo lives here now** (moved from Home): `videoShot1.png` — Leslie speaking on stage. Place near the top of the page, before or beside the opening paragraphs. Optimize via next/image, meaningful alt text: "Leslie Johnson speaking at an event."
- "What I Bring" pillars (01./02./03.) get distinct visual treatment — numbered, scannable.

### Contact
- No form (nothing to maintain, nothing to break in 3 days). No calendar/scheduling link — email is the single contact path.
- **Not a nav text item.** Persistent email icon/affordance in the nav bar (Serge-model: small email icon, always visible, every page) that opens a lightweight interaction: **Copy email** (clipboard + confirmation state) and **Send me an email** (mailto: leslie@lesliejohnson.io?subject=Portfolio%20Inquiry). Same affordance repeats in the footer.

## Design direction

- **Feel:** precision instrument, not brochure. Leslie's aesthetic vocabulary is industrial telemetry (see her CHAD-01 hardware project) tempered by editorial warmth. Confident whitespace. Nothing decorative that isn't informative.
- **Type (decided):** Newsreader (display serif — use its true italic for the emphasized-phrase move inside headings), Source Sans 3 (body), JetBrains Mono (labels, metadata, stat captions, WHO/WHAT/RESULT rows, nav). All via next/font/google, self-hosted at build time. Newsreader has optical size axes — use larger optical sizes for display, text sizes for any serif body use. This replaces the old site's Cormorant Garamond / DM Sans / DM Mono; do not carry those forward.
- **Color:** restrained near-monochrome base with one accent. Red is reserved exclusively for genuine warning/error semantics — this is a running theme in her work (the ECSI case study literally features a red-tab-as-error design failure). Never use red decoratively anywhere on this site.
- **Motion:** minimal and purposeful. No scroll-jacking, no parallax. Subtle reveal on stat callouts is acceptable.
- **Cursor:** custom dot cursor (Emily Campbell reference). A small dot replaces the default cursor, scales up over interactive elements (links, buttons, cards). Implementation rules: pointer-fine devices only (`@media (pointer: fine)`) so touch is untouched; native cursor restored over text inputs and text selection; fully disabled under `prefers-reduced-motion`; the dot is decoration layered on top — never remove focus states or hit targets to accommodate it. Build from scratch, no cursor libraries.
- **Accessibility:** WCAG AA contrast, visible focus states, reduced-motion respected, semantic headings.
- **Dark / light mode:** Serge-model day/night toggle, always visible (nav or corner affordance). Implementation: CSS custom properties for all colors (never hardcode hex in components), a theme provider using `next-themes` or equivalent, default to system preference (`prefers-color-scheme`) on first visit, then respect explicit user toggle via localStorage. Both themes must independently satisfy WCAG AA contrast — this is not "invert the colors," it's two designed palettes sharing one accent-and-semantics system (including the red-for-error-only rule, which applies in both modes). Every component built after the toggle exists must be tested in both themes before being considered done.
- Read /mnt/skills/public/frontend-design/SKILL.md before building any components.

## Hard rules (non-negotiable)

1. **Never invent, inflate, or embellish content.** No fabricated testimonials, quotes, metrics, logos, or clients. If a content slot is empty, it renders as a designed placeholder or is omitted.
2. Naming: "Common Project" (never "Common Ground"), "Paloma AI," "Student Portal"/"Client Portal" for ECSI surfaces ("Due Notice" is retired), CMU is "Human-Computer Interaction, Carnegie Mellon" — phrased as study, never as a degree earned.
3. Persona cards always carry their "representative composite" label.
4. Every metric shown must include its measurement caption (source + period) exactly as written in the content files.
5. Contact email: leslie@lesliejohnson.io. Links: linkedin.com/in/lesliejohnsonn, github.com/lesliejohnson-io.

## Build order (3-day plan)

1. **Day 1:** Scaffold, color system as CSS custom properties (light values only is fine for day 1), layout shell, nav/footer with email affordance, Home = hero + work grid with ECSI card live (Field Guide/Common Project/Paloma cards added as their content arrives — do not add empty stub cards), About rendering final content with photo, deploy to Vercel preview URL. Ship ugly-but-live by end of day.
2. **Day 2:** Case study template polished against ECSI. Remaining three case studies' content ported as it arrives, added to the grid as each goes live. Dark mode implemented once the component set has stabilized (adding it after components exist is faster than designing both themes simultaneously from scratch). Custom cursor.
3. **Day 3:** Both themes tested across every page, responsive + accessibility pass, colophon, OG/meta/social images, then domain cutover from Webflow.

## Analytics

- Google Analytics 4, measurement ID `G-SFHY66M9X7`, via `@next/third-parties/google` (`<GoogleAnalytics gaId="G-SFHY66M9X7" />` in the root layout).
- GA4's enhanced measurement covers pageviews, scroll, and outbound clicks automatically. Add exactly two custom events: `email_copy` (the Copy email button) and `email_click` (the mailto link) — these are the site's conversion actions.
- Also enable Vercel Analytics (free tier) at deploy for server-side traffic numbers that ad blockers can't suppress; GA4 alone undercounts a design-literate audience.

## Assets

- All project visuals sourced from Leslie's Figma files and local folders (not the old Webflow CDN — the site has expired; do not attempt to fetch from cdn.prod.website-files.com). Leslie exports and supplies images; export at 2x for retina, prefer PNG for UI screenshots, WebP/AVIF conversion handled by next/image.

## Colophon (its own small section at the foot of /about)

Modeled on the reference site's colophon, but every claim in it must be true of *this* build. Draft to complete once real decisions are made:

"Built with Next.js and Tailwind CSS. Text is set in Newsreader, Source Sans 3, and JetBrains Mono. Case studies are authored in Markdown. All components, including the cursor and the day/night toggle, were built from scratch. Designed and coded in conversation with Claude."

Rules: do not name fonts, tools, or inspirations that weren't actually used (the reference site's Caslon Ionic / Century Old Style / Red Hat Mono are Emily Campbell's licensed choices, not ours — pick and license Leslie's own). If a line isn't true of this site, it doesn't go in the colophon. The colophon is a craftsmanship signature; it only works if it's honest.

## Implementation notes / status

**Environment**
- The `/mnt/skills/public/frontend-design/SKILL.md` path referenced above does not exist in this Windows environment — it was not available to consult.

**Day 1 — done** (scaffold, color system, fonts, layout shell + email affordance, Home hero + ECSI grid card, About with photo + colophon). Not deployed to Vercel yet — the Vercel connector needs interactive OAuth that couldn't be completed from the build session; import the existing GitHub repo (lesliejohnson-io/portfolio-site) in the Vercel dashboard to finish this.

**Day 2 — done (buildable scope):**
- ECSI case study template built. `/work/[slug]` is a real, statically-generated route (`/work/ecsi`). The Natoli components (ProjectSummary, StatCallout, PersonaCard, BeforeAfter, VisualSlot) are mapped onto the markdown blockquote/`*[Visual: …]*` conventions in the content files — the content is rendered, not rewritten. Future case studies authored in the same convention render for free. `remark-breaks` preserves authored line structure inside multi-line blockquotes.
- Day/night toggle: built from scratch (no next-themes). Two designed palettes on CSS custom properties, pre-hydration theme script (no FOUC), always-visible nav toggle, system-default then localStorage. Both palettes verified WCAG AA. Also fixed a pre-existing light `fg-muted` AA miss (#767b84 → #5f646c).
- Custom dot cursor: built from scratch. Fine-pointer only, disabled under reduced-motion, native caret over text inputs, transform/opacity-only animation.
- Colophon updated to truthfully credit the toggle and cursor as built from scratch.
- Common Project case study added (`content/work/common-project.mdx`). It has no hard metric, so the data model was extended rather than force-fit: `WorkItem.result` is now optional, plus new `summary` (descriptive card blurb, used when there's no result to lead with) and `role` (byline under name/tag on the case study page) fields. `remark-gfm` added for its "Key decisions and trade-offs" table; table/list styling added to `.prose-case`, verified in both themes.

**Case study roadmap (current order — set 2026-07-22, supersedes the Day 1 four-project scope):**
1. Field Guide — **live** (`content/work/field-guide.mdx`)
2. Common Project — **live** (`content/work/common-project.mdx`)
3. Client Portal — **live** (`content/work/client-portal.mdx`) — separate case study from ECSI, same client (ECSI, a Global Payments company), different product surface
4. Synapse — **live** (`content/work/synapse.mdx`) (previously out of scope; now included per direct instruction)
5. Student Portal (+ design system) — filled by the existing **ECSI** case study (`content/work/ecsi.mdx`, order: 5). Its name/tag/title/content were left exactly as previously built and approved ("Global Payments, Mobile-First Loan Payments Platform") rather than renamed to "Student Portal" — renaming would mean inventing new card copy neither written nor approved yet. Flagged for Leslie to confirm; provide the exact new name/tag/title if a rename to match this slot's label is wanted.

Paloma AI is not on this list — status unclear, not currently being built. CHAD-01 remains out of scope (not mentioned in the new order).

- Field Guide case study added (`content/work/field-guide.mdx`, order: 1). Same treatment as Common Project: no hard metric, so `summary` drives the card. Header line splits the source's single "descriptor · institution · role" line across the two existing header slots (`tag` = descriptor, `role` = "institution · role"), rather than adding a third frontmatter field. Two GFM tables (question rewrites, key decisions) render via the existing table CSS. Its "One honest flag before this goes near a screener" section (Leslie's own note that some figures in an earlier draft looked fabricated/inconsistent) is excluded from the page for the same reason as Common Project's "One note on evidence" — it's addressed to Leslie, not case-study prose. The version handed off is already clean of the specific numbers that note warns about.
- Client Portal case study added (`content/work/client-portal.mdx`, order: 3). This one flagged its own outcome numbers as unverified ("Numbers to verify before publishing (see note at end)") but the referenced end note wasn't in the handoff — Leslie confirmed to treat them as unverified. Specific outcome percentages and percentage-equivalent metrics (60% sales lift, NPS 42→72, 25% QA-bug reduction, 30% navigation-time loss, 40+ support requests/month) were softened to their qualitative claims; plain process/scope facts (CFOs presented to, executives tested with, design-system module count) were left in — they describe what was built/done, not a measured outcome needing field-data confirmation. Its "Card summary" section was explicitly labeled grid-card-only by the author, so (unlike Field Guide/Common Project) it isn't also repeated as an "At a glance" section in the body.
- Synapse case study added (`content/work/synapse.mdx`, order: 4). All five roadmap slots are now filled (Field Guide, Common Project, Client Portal, Synapse, Student Portal/ECSI); the grid is complete pending the ECSI-rename question below.
  - Its closing "One note on framing and evidence" (excluded from the page, addressed to Leslie) explicitly instructed two checks: source or soften a "millions of TBI caregivers" market figure (doesn't appear anywhere in this draft, nothing to change), and keep the "almost no apps built for the caregiver" claim qualitative rather than a hard zero. The draft was inconsistent on the second one — softened "No one built for the person beside them" (H3) and "In every existing product…" (body) to match the "almost no one"/qualitative phrasing already used correctly elsewhere in the same draft, so a single counterexample can't dent the argument.
- **Blocked on content:** none currently — all five roadmap case studies have content and are live.

**Still open (Day 2/3):**
- GA4 (`G-SFHY66M9X7` via `@next/third-parties`) + the two custom events (`email_copy`, `email_click`) and Vercel Analytics — not wired yet.
- ECSI grid card + in-page visuals render styled "Visual pending" placeholders; no image assets supplied yet (no fabricated screenshots).
- Responsive + accessibility pass, OG/meta/social images, domain cutover — Day 3.
