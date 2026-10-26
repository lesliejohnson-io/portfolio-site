# OpenBook case study (with visual placements)

Visual placeholders use this format:

[VISUAL: id]
Shows: what the image contains
Caption: text to display under the image
Source: original asset or rebuild in Figma
[/VISUAL]

If a visual is rebuilt in Figma rather than recovered from the original work, add "Recreated from the original." to the end of its caption.

---

**Product Design · Fintech**

# Financial Dashboards: Putting the data in clients' hands

Self-serve dashboards that let university finance teams answer their own questions, plus a concept extension where an AI agent recommends collection-agency placements.

[VISUAL: hero-placement-agent]
Shows: The placement agent's recommendation for one account. The university's selected agencies ranked on compliance, data security, and collection performance, each with a confidence score and a short rationale. Approve and Override controls.
Caption: The agent ranks the agencies and explains why. A person makes the call.
Source: New build (synthetic data)
[/VISUAL]

## Context

ECSI, a Global Payments company, services student loans for universities. Its client platform served the administrators and financial officers who manage those loan portfolios.

Every answer started with a form. A client ordered a report online, ECSI staff ran it in house, and the file arrived 24 hours later. A new question meant a new order and another day of waiting.

Orders peaked at the start and end of each semester, when clients needed answers fastest and ECSI staff had the least time to give.

A report answered only the question asked when it was ordered. Clients couldn't:

- Change a date range or filter without ordering again
- Drill down from a total to the accounts behind it
- Look up a single account

[VISUAL: old-report-cycle]
Shows: A simple flow diagram of the old process. Online order form → ECSI runs the report in house → file uploaded 24 hours later → wrong parameter → order again (loop arrow back to the start).
Caption: One wrong parameter, and the 24-hour cycle started over.
Source: Rebuild in Figma
[/VISUAL]

In meetings, the reports came apart. Everyone brought their own printout, and the conversation scattered across different pages.

Meanwhile, competitors had started giving their clients dashboards. ECSI leadership made catching up a priority.

**My role:** Sole designer, from discovery through delivery. I led research, prototyping, and testing, working with a PM, two client advisors, a marketing director, and two developers. The client advisors were my line to what clients wanted. Their relationships opened doors I couldn't have opened cold. Discovery to launch of the first dashboards took about six weeks.

The data was there. Clients couldn't work with it, and they couldn't see it together.

## Objective

Put the data in clients' hands. Dashboards refreshed overnight as accounts reconciled, so each morning clients could filter, drill down from totals to accounts, look up a single account, and put one shared view in front of the room.

Three constraints shaped every decision:

- **A legacy data model**, to design within, not around.
- **A corporate rebrand** that landed mid-project.
- **Paper.** Reports still circulated in print, so every dashboard had to print cleanly.

[VISUAL: before-after-strip]
Shows: Two panels side by side. Left, "Before": order form, 24-hour wait, static file. Right, "After": data refreshed overnight, dashboard ready every morning, filter, drill down, look up an account.
Caption: From a 24-hour order cycle to data waiting every morning.
Source: Rebuild in Figma
Note: First to cut if the page feels heavy.
[/VISUAL]

## Approach

### 1. Start with what clients were already ordering

Discovery drew on report-order history, reprint requests, support tickets, client interviews, and the client advisors. The reprints told the clearest story: clients re-ordering a report because one parameter was wrong, then waiting another 24 hours for the fix.

### 2. Five reports carried most of the demand

Most orders came down to five reports. Each became a dashboard with one job. Everything else moved to self-serve ad hoc reports, off ECSI's queue. Account lookup was a requirement from day one. Drill-down from totals to accounts followed in a later release.

The rule: one dashboard, one story. Each screen makes a single argument instead of crowding every metric onto the page.

[VISUAL: dashboard-full]
Shows: One of the five dashboards, full screen. Left navigation column with the report areas listed under the product name, date-range calendar picker, account lookup, and a single focused set of charts.
Caption: One dashboard, one story.
Source: Original screenshot if found, otherwise rebuild in Figma
[/VISUAL]

### 3. One unified design system replaced outdated styles

On mobile, the platform loaded outdated styles. Tracing the problem turned up so many conflicting style sheets that none could be trusted. The answer was one system: a component library built in Axure, where interactions could be coded and tested before development. Developers built the components in Angular and documented them in Storybook, so design and code worked from the same source.

It paid off three ways. When the rebrand hit mid-project, it changed once, at the system level, not page by page. Every color and type combination was verified as accessible. And with design and code sharing components, QA bugs fell by about 25%.

[VISUAL: design-system]
Shows: The design system's colors, type, and core components with their states (buttons, cards, tables, chart containers, form controls), in the post-rebrand styling.
Caption: One source of truth for design and code. The rebrand changed once. Recreated from the original Axure system.
Source: Rebuild in Figma from the original Axure library
[/VISUAL]

### 4. Testing changed two core patterns

Sessions included client staff, client leads, and ECSI internal staff. Two changes came straight out of them.

**Navigation moved to the left column.** The first build ran the five report areas as tabs across the top. Eye-tracking showed users weren't finding them. They went looking for navigation somewhere else entirely. The problem was the mental model, not the labels. Retesting found where users expected it: in the left column, directly under the product name. That's where it went.

[VISUAL: nav-pivot]
Shows: Two parts. Left: eye-tracking heatmap of the first build, with attention missing the top tabs. Right: before-and-after of the navigation, top tabs moving into the left column under the product name.
Caption: Users missed the top tabs. They looked for navigation under the product name.
Source: Original heatmap if found; navigation before-and-after can be rebuilt in Figma
[/VISUAL]

**A calendar replaced the slider.** The date-range slider came from a licensed data-visualization library, in use mainly because ECSI had already paid for it. Dragging to a date was slow and imprecise, and no one expected it. A standard calendar picker took its place.

[VISUAL: date-picker]
Shows: Small side-by-side. Left: the licensed slider for selecting a date range. Right: the standard calendar picker that replaced it.
Caption: A familiar calendar in place of an imprecise slider.
Source: Rebuild in Figma
Note: Second to cut if the page feels heavy.
[/VISUAL]

### 5. Print in one click

Paper wasn't going away, so every dashboard got a print button. One click sent the current view to a preformatted page and printed it. No rebuilding, no reformatting.

[VISUAL: print-view]
Shows: A dashboard with its print button highlighted, next to the preformatted print page it produces.
Caption: The live view, print-ready in one click.
Source: Original screenshot if found, otherwise rebuild in Figma
[/VISUAL]

### 6. From reporting on collections to recommending placements

When an account goes to collections, the university chooses the agency, working from its own short list.

At ECSI, agency performance shipped as reporting on amounts collected. The concept extension is a placement agent. It gathers data on each of the university's selected agencies, reviews the borrower's history and balance, and ranks the agencies on compliance, data security, and collection performance.

Every recommendation carries a confidence score and a rationale. A person at the university approves it or overrides it. When confidence is low, the agent doesn't guess. It marks the account **Needs human review**.

[VISUAL: needs-human-review]
Shows: An account flagged "Needs human review." Low confidence score, the rationale explaining what made the recommendation uncertain, and controls for a person to choose the agency.
Caption: When the agent isn't sure, it says so and hands the decision to a person.
Source: New build (synthetic data)
[/VISUAL]

A concept, built on synthetic data modeled on ECSI's reporting.

## Key decisions and trade-offs

| Decision | Why | Result |
|---|---|---|
| Self-serve dashboards over ordered reports | Every question cost a form and a 24-hour wait | Report orders stopped |
| Five dashboards, everything else ad hoc | Five reports carried most of the demand | Clients ran one-off reports themselves |
| Navigation in the left column, under the product name | Eye-tracking showed users missed the top tabs | Retesting confirmed it was where users looked |
| Calendar picker over the licensed slider | The slider was slow, imprecise, and unfamiliar | Easier to use; a pattern users already knew |
| One design system, built in Axure | Conflicting style sheets broke the mobile view | Rebrand applied once; accessible color and type; about 25% fewer QA bugs |

## Outcomes & Impact

[STAT STRIP]
Stat 1: 100% | Client adoption
Stat 2: 38% | Fewer support tickets
Stat 3: +32 pts | Client NPS
Placement: Directly under the "Outcomes & Impact" heading, above the bullets.
Styling: Typographic, no image. One large figure per stat with a small label beneath. Three across on desktop, stacked on mobile.
[/STAT STRIP]

Styling note: "For ECSI" and "For clients" are small subheads. Each bullet's lead-in phrase is bold (for example, "Staff time back."). Make sure the bold renders.

### For ECSI

- **Staff time back.** About 20 staff hours a month no longer went to running and uploading reports by hand, including during the semester rushes when staff were stretched thinnest.
- **Support tickets down 38%.** With answers in the dashboards, clients needed support less often for reports and report fixes.
- **A feature sales could show.** The dashboards became a centerpiece of sales demos in new-client conversations.
- **Less time spent on fixes.** The design system absorbed a mid-project rebrand and cut QA bugs by about 25%.

### For clients

- **Every client on board.** All client institutions adopted the dashboards.
- **No more waiting.** Data refreshed overnight replaced the 24-hour order cycle.
- **One view in the room.** Clients projected the dashboards in presentations instead of passing around printouts.
- **Higher satisfaction.** Client NPS rose 32 points, from 42 to 74.

## Reflection

**Fewer patterns, faster adoption.** A few familiar patterns got users working sooner than a richer toolkit would have. Swapping the licensed slider for a standard calendar picker is the clearest example.
