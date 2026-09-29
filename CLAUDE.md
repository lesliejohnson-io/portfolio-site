@AGENTS.md

# CLAUDE.md — lesliejohnson.io

## What this is

Portfolio site for Leslie Johnson, senior AI product designer. Next.js on Vercel. Currently in a redesign (September 2026) toward a wider, calmer, structure-first layout.

## Working rules (read first)

- **Never commit, push, or create branches without being asked.** Leslie reviews every change and makes all commits herself so they count on her GitHub contribution graph. When a task is done, summarize what changed and suggest a commit message. Don't run `git commit` or `git push`.
- Work in small steps: one change, then stop so Leslie can review it in the browser.
- Leslie is learning front-end engineering. When you make a non-obvious choice, explain it in a sentence or two.
- Run `npm run dev` and check the change in the browser before calling it done. Check both light and dark themes.

## References

- **Structure:** https://jackmoffett.com. A compact hero, then selected case studies as full-width stacked rows (text column plus image), wide page margins, simple nav. Match the structure, not the look.
- **Feel and the future Resources page:** https://emilycampbell.co. Editorial, restrained, custom-built. Her digital garden (curated, topic-filterable collection) is the model for Resources, after launch.

## Stack

- Next.js (App Router), React, Tailwind CSS v4
- MDX for all content. Case studies live in `content/work/*.mdx`; components render them. Leslie edits content without touching components.
- Static generation throughout. No CMS, no database.
- Deploy: Vercel. Domain lesliejohnson.io currently points to a holding page.

## Site map and nav

Nav, left to right: **Home · Work · About · Resources**, then a **Contact** button (`mailto:leslie@lesliejohnson.io`), then the theme toggle.

1. **Home** (`/`): compact hero, then "Selected case studies" (exactly 4), with an "All work" link to `/work`.
2. **Work** (`/work`): every case study, same row component as home.
3. **Case study** (`/work/[slug]`): one MDX template for all.
4. **About** (`/about`): renders `content/about.mdx`.
5. **Resources** (`/resources`): placeholder page at launch (title plus one line). The curated collection ships after launch. This is the one allowed placeholder page.
6. **Contact:** the nav button, plus the existing email affordance (copy email or open mail) in the footer.

## Layout

- **Wide container** (`.container-wide` in `globals.css`): max-width 1440px, side padding `clamp(1.5rem, 4vw, 4rem)`. Used by nav, footer, home, work, and resources. Case study and About pages keep their narrower reading layout for now.
- **Compact hero:** headline plus one supporting line. The first case study row must be visible on a typical laptop screen (about 1440×900) without scrolling.
- **Case study rows** (`components/WorkRow.tsx`): full-width stacked rows separated by hairline rules. Text column (5 of 12) on the left: name and tag line, outcome-led title, summary or result line, "Full case study" link. Visual (7 of 12) on the right. The whole row is clickable. Stacks to one column on mobile.

## Case studies

Featured on home (frontmatter `featured: true`), in `order`:
1. Field Guide (`field-guide.mdx`)
2. Common Project (`common-project.mdx`)
3. Client Portal (`client-portal.mdx`)
4. Synapse (`synapse.mdx`)

On `/work` only: ECSI / Student Portal (`ecsi.mdx`, order 5).

To change what's featured, move `featured: true` between frontmatter files. Don't hardcode the list in components.

## Typography

- **Headlines:** Archivo, bold (700), chosen September 2026. Load it in `layout.tsx` with `next/font/google` and point `--font-display` in `globals.css` at it. Use the `font-display` class for headlines. Tight letter-spacing (about -0.02em) at hero size.
- **Body:** Source Sans 3.
- **Labels and metadata:** JetBrains Mono.
- Newsreader is still loaded and used on case study and About pages. Once Archivo is in, decide whether Newsreader stays at all.

## Color

Near-monochrome warm off-white base with one blue accent, defined as CSS custom properties in `globals.css`. Never hardcode hex in components. Red is reserved for genuine error or warning semantics only, never decoration. Both light and dark palettes must pass WCAG AA.

## Motion

- **Headline reveal** (`components/Reveal.tsx`): each case study title slides up and fades in once as its row enters the viewport. This is the site's one signature motion. Don't add entrance animations to other sections.
- Existing: VisualSlot reveal and stat callout reveal on case study pages.
- Custom dot cursor: fine pointers only, off under reduced motion.
- Everything respects `prefers-reduced-motion`. No scroll-jacking, no parallax.

## Case study template (Joe Natoli method, unchanged)

1. Outcome-led title, never a bare project name.
2. Two-step disclosure: the row on home/work is step one; the page is step two.
3. ProjectSummary (TL;DR) at the very top.
4. Outcome numbers (StatCallout) right after the summary.
5. Short bursts, heavy subheads. Subheads are claims, not labels.
6. Section order: outcome/problem → users and needs → role → constraints → the story → impact restated.
7. Images as evidence, modest size, next to the claim they support.
8. Conversational voice.

MDX components: StatCallout, ProjectSummary, BeforeAfter, PersonaCard (always keeps its "representative composite" label), VisualSlot (renders a styled placeholder until an asset exists).

## Hard rules

1. **Never invent, inflate, or embellish content.** No fabricated metrics, quotes, testimonials, logos, or clients. Empty slots render as designed placeholders.
2. Every metric keeps its measurement caption exactly as written in the content files. Client Portal's outcome figures were deliberately softened to qualitative claims; don't reintroduce numbers.
3. Naming: "Common Project" (never "Common Ground"), "Paloma AI," "Student Portal" and "Client Portal" for ECSI surfaces ("Due Notice" is retired). CMU is "Human-Computer Interaction, Carnegie Mellon," phrased as study, never a degree.
4. Contact: leslie@lesliejohnson.io. Links: linkedin.com/in/lesliejohnsonn, github.com/lesliejohnson-io.
5. Accessibility: WCAG AA in both themes, visible focus states, semantic headings, reduced motion respected.

## Analytics

GA4 (`G-SFHY66M9X7`) via `@next/third-parties/google`, plus Vercel Analytics. Two custom events: `email_copy` and `email_click`. The nav Contact button also fires `email_click` with `location: "nav"`.

## Current status

- **Layout restructure:** a patch was prepared (wide container, compact hero, stacked rows, headline reveal, new nav, real `/work` page, `/resources` placeholder). Check whether it's applied: if `components/WorkRow.tsx` exists, it is. If not, implement it from this spec.
- Visuals: all case study rows and in-page visuals still show "Visual pending." Leslie supplies exports (2x PNG) from Figma; no fabricated screenshots.
- Vercel Analytics needs enabling in the Vercel dashboard (Project → Analytics).

## Next up, in order

1. Confirm the layout restructure is in and looks right at desktop and mobile widths.
2. Swap the headline font to Archivo.
3. Mobile nav: five items wrap to three lines on phones. Needs a compact menu.
4. Update the case study and About pages to the wide container where it helps, keeping prose at about 68ch.
5. Responsive and accessibility pass, OG/meta images, domain cutover from the holding page.

## After launch (don't build yet)

- **Resources collection:** curated, topic-filterable, list/grid views, modeled on Emily Campbell's garden.
- **Portfolio agent:** a conversational agent visitors can ask for work by topic. It could share the Resources topic tags.
- **Thinking animation:** an original drifting-dots animation, possibly as the agent's loading state.
- **Live product slices in case study rows:** replace static row images with small working pieces of each project (a Vantage AirLab fleet panel, the Field Guide voice survey, a machine-state indicator cycling its five states), one project at a time. Reference: laminar.sh, where each numbered section pairs a claim with a live slice of the product. Launch with static images first.
