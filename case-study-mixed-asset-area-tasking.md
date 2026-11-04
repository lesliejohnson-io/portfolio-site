# Case Study · Mixed-Asset Area Tasking

Nov 4, 2026 · Leslie Johnson

**Title:** One operator, 38 autonomous assets, and a plan that shows its coverage before anything launches

**Subtitle:** A search-and-rescue tasking console where the autonomy proposes, the operator decides, and every gap is visible before launch.

**Top stat strip**

| 38 | 4 | 1,200 km² |
| --- | --- | --- |
| assets to task in one plan | asset types with different range, endurance and sensors | flooded coastal search area |

## Context

This project was a design take-home for [TBD: company name, or "an autonomy company"]. The brief described a fictional disaster: a Category 4 hurricane made landfall 14 hours earlier near Charleston, South Carolina. Cell towers are down, roads are flooded, and people are stranded on rooftops across a 1,200 km² coastal region.

A two-person team runs the search. The mission operator makes every tasking decision; the supervisor watches the same view and can veto before launch. The operator works on a large desktop display, often in a dim room, under time pressure.

The fleet is 38 autonomous assets of four types, and they are not interchangeable:

| Asset | Count | Strength | Limit |
| --- | --- | --- | --- |
| Roc (fixed-wing) | 6 | Covers large sectors fast | Low detail per pass |
| Hydra (quadrotor) | 24 | Close inspection | 15 km range from a forward staging site |
| Griffin (VTOL) | 4 | Radar and comms relay | Few available |
| Kraken (surface drone) | 4 | Goes where crewed boats can't | Slow, about 12 knots |

Two Rocs are in maintenance, so 36 are available. Today the operator assigns them one at a time. That takes about 20 minutes and leaves coverage gaps nobody sees until the debrief.

**Role:** Leslie was the sole designer, responsible for the screens, edge-case states, component library, engineering annotations and one coded interaction on Vercel. She worked with Claude through the Figma MCP for file production and Claude Code for the build.

**The core problem:** The operator has to commit 36 different assets to four sectors in minutes, and trust that the plan actually covers the area before anything moves.

## Objective

The autonomy proposes a full tasking plan, and the operator can verify it, change it and launch it in under five minutes, with nothing launching unseen.

- **Coverage at a glance:** which sectors are covered, by what, and how well.
- **The weakest sector is obvious:** the operator can name it without hunting.
- **Every autonomy choice is explained** in one readable line.
- **The operator stays in control:** accept the plan whole, change any assignment, or lock assets so a re-propose won't move them.
- **Warnings inform, never block:** a high-priority sector below 60% coverage gets an in-place warning, and launch stays available.
- **Out of scope:** live flight control, route planning (the autonomy owns it), and anything involving weapons or targeting.

## Approach

### 1. A plan can't be trusted if its own numbers don't add up

The first draft of Screen 2 had the right structure, but the data broke it. Unit IDs repeated across sectors, the cards added up to 10 Rocs when only 4 were available, and the two maintenance Rocs were missing.

- Rebuilt the roster as a single source: 38 units, each with a real ID, type, sector and status.
- Kept ROC-05 and ROC-06 on screen as unavailable, with the reason.
- Renamed "zones" to "sectors" to match the brief, and lettered them A to D.

An operator who catches one wrong count stops trusting every other number on the screen.

*Visual: Screen 2, before and after the data fix.*

### 2. Group units where the question is "how much," show them individually where it's "where"

On the review screen the operator is judging a plan, so the map groups assets per sector (HYD ×7). A group of one shows its ID instead of "×1," which matches the rail and reads as intentional. Selecting a group fans it out into its units, which is where a single Hydra gets dragged to another sector.

Individual positions appear only on Screen 3, once assets are flying and position matters.

### 3. Coverage owns the fill, priority owns the chip

The brief asked how to show sector priority without competing with coverage color. The answer was to give each signal one channel.

- **Coverage** fills the sector on the map and drives a thin bar on each card, with a tick at the 60% target.
- **Priority** is a HIGH, MEDIUM or LOW chip beside the sector name, never a color.
- **Selection** is a white outline, so fill always means coverage.
- **Color is earned:** amber appears only where the operator should decide, and blue only on things the operator can act on.

*Visual: Screen 2 map with coverage fills and the stat bar.*

### 4. Warnings lead with the cost, then the cause, and never block

The first Sector D warning named the cause (Hydras at max range from staging) but not what it cost. The rewrite puts the cost first, in the operator's terms:

> ◆ 47% coverage, 13 pts below target for a HIGH sector
> Hydras at max range from Staging A: little time on station.
> See options · Stage anyway

"Stage anyway" makes the rule visible: the warning informs, and the operator can still stage and launch without changing anything. A stat bar above the map names the weakest sector, so the operator never has to hunt for it.

### 5. Mark the exception, not the default

Most of the plan comes from the autonomy, so autonomy rows carry no marker, only their one-line reason ("KRK-01–02 added: water too deep for ground crews"). Operator changes are the exception, so they get the marker:

- A teal left bar and a source line: "Set by operator · moved from Sector B · 08:41."
- Purple stays reserved for the Autonomous status in the legend, so the two never blur.
- The status badge in each row was replaced by a lock control, since lock is the action the operator takes there. Locks and priority chips align in fixed columns down every card, so the rail scans in one pass.

*Visual: tasking row, autonomy vs operator variants.*

### 6. Build the parts once, then assemble three screens from them

Screen 2 was the key decision, so its parts became the system: a sector card with 8 variants (staged, selected, low coverage), a tasking row with 4, and priority chip, lock, status and asset-marker components, all bound to 21 color tokens.

- **Screen 1, Area overview:** the same layout before a plan exists. The rail becomes the roster, and 24 Hydras with identical status collapse into one row, which keeps 38 assets scannable.
- **Screen 3, Tasking live:** the same cards switch to planned versus actual coverage. When a Griffin relay drops, the operator sees one incident card with the root cause first and the affected Hydras grouped under it, instead of nine separate alerts.

*Visual: component system frame (tokens and components).*

## Engineering Handoff

The brief asked for one coded interaction: drag an asset between sectors, with coverage updating live. Leslie scoped it to a single page that proves the core behavior, and wrote the handoff so the build could not drift from the design.

- **One data file:** all 38 units and a simple coverage rule, tuned so the default plan reproduces the Figma screens exactly (A 92%, B 83%, C 87%, D 82%, 86% overall).
- **Tokens as a table:** the 21 Figma color tokens mapped to code, with visual rules (selection is white, never blue; amber only where the operator decides).
- **Two kinds of annotation:** note cards beside each frame explain the design reasoning; native Figma annotations sit on the exact layers engineering will build.
- **A one-drag demo:** moving ROC-04 from Sector D to Sector B drops D to 44%, shows the inline warning, names D as weakest in the stat bar, and marks ROC-04 as set by operator.

[TBD: link to the live Vercel build, plus a short recording of the drag.]

## Outcomes & Impact

- Three screens at desktop size, dark theme: Area overview, Review proposed tasking, Tasking live.
- [TBD: 8 of 8] edge-case states as frames, including the empty state, an unreachable sector, a supervisor veto and a lost relay link.
- A component library of 8 component sets bound to 21 color tokens, reused across all three screens.
- A launch summary that lists every unit before launch, so no assignment goes out unseen.
- The brief's open design questions answered on the canvas: priority versus coverage color, operator versus autonomy choices, warning strength, and a 38-row roster that stays scannable.
- [TBD: Live drag-between-sectors interaction on Vercel.]

| Under 5 min | 0 | 60% |
| --- | --- | --- |
| Target time to task 38 assets, down from about 20 today. A design target from the brief, not yet tested with operators. | Assets launched with an assignment the operator did not see. Enforced by the launch summary. | Coverage floor for HIGH sectors. Below it, an inline warning shows the cost; launch is never blocked. |

## Reflection

### The coverage model needs an operator before it needs polish

Every percentage on these screens comes from an invented rule. The 60% floor, the per-type search rates and the five-minute target all deserve a session with a real mission operator before more visual refinement. Watching one tasking run would test the assumptions faster than any frame.

### Data and tokens should come first, in code

The data errors in the first draft cost time to unwind. Today Leslie would start from the roster file and the token table, then build Figma and the coded prototype from the same source, so the design and the build can't disagree.

### The product questions shape the design, so they go first

Whether the supervisor can edit or only veto, what counts as good enough to launch, and whether the autonomy may ever move a locked asset all change the screens. Stating an assumption for each at kickoff would have saved rework later.

[TBD: confirm these reflections are Leslie's own, and edit to her words.]

## To confirm after Friday

- [ ] Company name, or keep it anonymous
- [ ] Final count of edge-case states shipped
- [ ] Vercel link and drag recording
- [ ] Product-question assumptions as stated in the Screen 2 annotations
- [ ] Reflection wording
- [ ] Swap each *Visual* line for its Figma screenshot
