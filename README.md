# lesliejohnson.io

**Live site:** [lesliejohnson.io](https://lesliejohnson.io)

## How it's built

Designed and specified by Leslie, built with [Claude Code](https://claude.com/claude-code) working from the specs in this repo:

- [`CLAUDE.md`](CLAUDE.md): site structure, design system, content rules, and working conventions
- [`CASE_STUDY_LAYOUT.md`](CASE_STUDY_LAYOUT.md): the case study page template

Every change is reviewed and committed by hand.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- MDX for all content, via `next-mdx-remote` and `gray-matter`
- Static generation throughout: no CMS, no database
- Deployed on [Vercel](https://vercel.com), with Vercel Analytics and GA4

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
app/                 Routes: home, /work, /work/[slug], /about, /resources
components/          UI components
  case-study/        Case study page sections (hero, stats, related studies)
  mdx/               Components available inside MDX content
content/
  about.mdx          About page
  work/*.mdx         One file per case study
lib/
  work.ts            Case study content model and loaders
  resources.ts       Working Library entries
public/
  work/<slug>/       Case study media and partner logos
  resources/         Working Library images and media
```

## Editing content

Content lives in MDX and plain data files, so copy changes never require touching components.

### Case studies

Each case study is a file in `content/work/`. Frontmatter controls how it appears across the site; the full model is documented in `lib/work.ts`. The most-used fields:

| Field | Purpose |
| --- | --- |
| `title` | Outcome-led title, used on rows and the page |
| `order` | Position on the home and work pages |
| `featured` | Include in "Selected case studies" on the home page |
| `layout: "v2"` | Use the template in `CASE_STUDY_LAYOUT.md` |
| `category` | Pill label above the title |
| `hero` / `heroAlt` | Wide hero image or looping video |
| `stats` | Up to three measured outcomes, each with a caption saying how it was measured |
| `visual` | Media for the home and work rows |
| `logos` | Partner and funder marks under the title |

**To add a case study:** create `content/work/<slug>.mdx`, fill in the frontmatter, write the body in the section order from `CASE_STUDY_LAYOUT.md`, and put its media in `public/work/<slug>/`. Missing visuals render as designed "Visual pending" placeholders, so a study can go live before every asset exists.

### Working Library

The `/resources` page is driven by `lib/resources.ts`.

## Design principles

- **Accessible by default.** WCAG AA in light and dark themes, visible focus states, semantic headings.
- **Motion with restraint.** One signature motion (headlines that slide in on scroll). Everything respects `prefers-reduced-motion`, and off-screen animations and video pause.
- **One token system.** Colors and type are CSS custom properties in `app/globals.css`, with no hardcoded values in components.

Type: Archivo (headlines), Source Sans 3 (body), Newsreader (serif, used for pull-quotes in the Working Library), JetBrains Mono (labels and metadata).
