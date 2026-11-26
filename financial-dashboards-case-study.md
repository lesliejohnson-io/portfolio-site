Shipped work · Fintech

# Financial Dashboards: the reprints revealed which five to build.

Clients ordered reports through a form and waited a day for the file. The re-order queue showed which five reports actually mattered, and those became self-serve dashboards.

[IMAGE — HERO: desktop dashboard and phone side by side, Resolved Accounts view. Keep existing alt text.]

24 hours → overnight — Wait for an answer
38% — Fewer support tickets
20 hrs/month — Staff time back from running reports by hand

---

## Context

ECSI, a Global Payments company, services student loans for universities. Its client platform served the administrators and financial officers who manage those loan portfolios.

Every answer started with a form. A client ordered a report online, ECSI staff ran it in house, and the file arrived 24 hours later. A new question meant a new order and another day of waiting.

A report answered only the question asked when it was ordered. Clients couldn't change a date range or filter without ordering again, drill down from a total to the accounts behind it, or look up a single account.

[IMAGE — BEFORE FLOW: four-step diagram, "Before · how a report was ordered." Client submits the order form, ECSI runs the report in house, the file is uploaded 24 hours later, and a wrong parameter loops the client back to the form. Keep existing alt text.]

*One wrong parameter, and the 24-hour cycle started over.*

Orders peaked at the start and end of each semester, when clients needed answers fastest and ECSI staff had the least time to give. In meetings the reports came apart: everyone brought their own printout, and the conversation scattered across different pages.

Competitors had started giving their clients dashboards. ECSI leadership made catching up a priority.

**My role.** Sole designer, discovery through delivery. I led research, prototyping and testing, working with a PM, two client advisors, a marketing director and two developers. The client advisors were my line to what clients wanted, and their relationships opened doors I couldn't have opened cold. Discovery to launch of the first dashboards took about six weeks.

**The data was already there. Clients couldn't work with it, and they couldn't look at it together.**

---

## Objective

Put the data in clients' hands. Dashboards refresh overnight as accounts reconcile, so each morning a client can filter, drill down from totals to accounts, look up a single account, and put one shared view in front of the room.

Three constraints shaped every decision:

- **A legacy data model,** to design within rather than around.
- **A corporate rebrand** that landed mid-project.
- **Paper.** Reports still circulated in print, so every dashboard had to print cleanly.

---

## Approach

### 1. Start with what clients were already ordering

Discovery drew on report-order history, reprint requests, support tickets, client interviews and the client advisors.

The reprints told the clearest story. A reprint was a client re-ordering a report they had already received, because one parameter was wrong, and then waiting another 24 hours for the corrected file. Nobody was reading that queue as research. It was a list, in the clients' own behavior, of the questions the platform wasn't letting them ask.

### 2. Five reports carried most of the demand

Most orders came down to five. Each became a dashboard with one job. Everything else moved to self-serve ad hoc reports, off ECSI's queue entirely.

Account lookup was a requirement from day one. Drill-down from totals to accounts followed in a later release.

The rule: one dashboard, one story. Each screen makes a single argument instead of crowding every metric onto the page.

[IMAGE — ONE DASHBOARD, FULL SCREEN: left navigation column with report areas under the product name, date-range calendar picker, account lookup, and a single focused set of charts.]

### 3. One system replaced the style sheets

On mobile, the platform loaded outdated styles. Tracing it turned up so many conflicting style sheets that none could be trusted.

The answer was one system: a component library built in Axure, where interactions could be coded and tested before development. Developers built the components in Angular and documented them in Storybook, so design and code worked from the same source.

It paid off three ways. When the rebrand landed mid-project, it changed once at the system level instead of page by page. Every color and type combination was verified as accessible. And with design and code sharing components, QA bugs fell by about 25%.

[IMAGE — DESIGN SYSTEM, CARD 1: Color. Fifteen named swatches with hex values and the role each plays, from Navy 800 for the sidebar to Green 500 and Cyan 500 for the resolved and unresolved chart segments.]

[IMAGE — DESIGN SYSTEM, CARD 2: Typography. Eight roles against sample and spec, set in Open Sans with a 75% condensed width for labels, from the 27px bold KPI value down to 12px meta and axis type.]

[IMAGE — DESIGN SYSTEM, CARD 3: Components. KPI card, controls row with date-range field, chart tooltip, left navigation, 100% stacked bar chart, and the mobile month card with its notification badge, each with measurements.]

[IMAGE — DESIGN SYSTEM, CARD 4: Surfaces and spacing. Three corner radii for controls, cards and overlays, and the spacing scale.]

*One source of truth for design and code. The rebrand changed once. Recreated from the original Axure system.*

### 4. Testing changed three core patterns

Sessions included client staff, client leads and ECSI internal staff. Three changes came straight out of them.

**Navigation moved to the left column.** The first build ran the five report areas as tabs across the top. Eye-tracking showed users weren't finding them, and they went looking somewhere else entirely. The problem was the mental model, not the labels. Retesting found where users expected navigation to be: the left column, directly under the product name. That's where it went, and the rest of the navigation followed it there.

[IMAGE — NAVIGATION: eye-tracking heatmap of the first build with attention missing the top tabs, beside a before-and-after of the tabs moving into the left column.]

**A calendar replaced the slider, and semesters replaced dates.** The date-range slider came from a licensed data-visualization library, in use mainly because ECSI had already paid for it. Dragging to a date was slow and imprecise, and it carried a line of instructional text beneath it telling users to slide the handles to change the date. A control that ships with directions has already failed. A standard calendar picker took its place.

The better fix was underneath it. These clients don't think in date ranges, they think in terms: Semester 1, Semester 2. So the picker carries those as presets alongside the calendar, and most of the time nobody opens the calendar at all.

[IMAGE — DATE RANGE: the licensed slider with its instruction line, beside the calendar picker and semester presets that replaced it.]

**Account lookup belongs everywhere.** Clients needed to find a single account from wherever they happened to be, not by navigating to one screen first. Lookup became its own item in the left navigation and stayed available from inside each dashboard.

---

## Key decisions and trade-offs

| Decision | Why | Result |
|---|---|---|
| Self-serve dashboards over ordered reports | Every question cost a form and a 24-hour wait | Report orders stopped |
| Five dashboards, everything else ad hoc | Five reports carried most of the demand | Clients ran one-off reports themselves |
| Navigation in the left column, under the product name | Eye-tracking showed users missed the top tabs | Retesting confirmed it was where users looked |
| Calendar picker with semester presets, over the licensed slider | The slider was slow, imprecise and unfamiliar; clients work in semesters, not date ranges | A pattern users already knew, set to the unit they think in |
| Account lookup in the navigation and inside every dashboard | Clients look up an account from wherever they are | No navigating to a screen first |
| One design system, built in Axure | Conflicting style sheets broke the mobile view | Rebrand applied once; accessible color and type; about 25% fewer QA bugs |

---

## Outcomes

**For ECSI**

- **Staff time back.** About 20 hours a month no longer went to running and uploading reports by hand, including during the semester rushes when staff were stretched thinnest.
- **Support tickets down 38%.** With answers in the dashboards, clients needed support less often for reports and report fixes.
- **A feature sales could show.** The dashboards became a centerpiece of demos in new-client conversations.
- **Less time spent on fixes.** The design system absorbed a mid-project rebrand and cut QA bugs by about 25%.

**For clients**

- **No more waiting.** Data refreshed overnight replaced the 24-hour order cycle.
- **One view in the room.** Clients projected the dashboards in presentations instead of passing around printouts.
- **Questions they couldn't ask before.** Filter, drill down, look up a single account, without re-ordering anything.

---

## Reflection

### The pattern they know, fitted to how they think

I reached for distinctive components first, and the date slider is the clearest case. It was the more capable control and it cost users time, because they had never met one before. Switching to the standard calendar picker got them moving. The same thing happened with navigation: tabs across the top were a reasonable choice and the wrong one, because nobody looked there.

Standard wasn't the whole answer, though. These clients don't work in date ranges, they work in semesters, and it was the preset that made the control fast rather than merely familiar. The pattern people already know, set to the unit they actually think in.

### What I'd check if I ran it again

- **Which of the five actually got used,** and whether the ad hoc reports absorbed the rest or quietly recreated the old queue somewhere else.
- **Whether drill-down changed behavior** once it shipped in the later release, or whether clients had already settled into the totals.
- **Where the remaining support tickets came from.** A 38% drop says the reports were the problem. The other 62% is the more interesting list.
