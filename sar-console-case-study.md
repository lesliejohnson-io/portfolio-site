Physical AI · Operator console · 2026

36 autonomous assets.
One operator.
No surprises after launch.

A search-and-rescue tasking console where the autonomy proposes, the operator decides, and every coverage gap is visible up front.

[HERO IMAGE — Screen 3, Tasking live. Keep existing alt text.]

36 — Available assets to task in one plan (2 Rocs in maintenance)
4 — Asset types with different range, endurance and sensors
1,200 — km² of flooded coastal search area

---

## Context

A Category 4 hurricane made landfall 14 hours ago near Charleston, South Carolina. Cell towers are down, roads are flooded, and people are stranded on rooftops across 1,200 km² of coast.

A two-person team runs the search. The mission operator makes every tasking decision; the supervisor watches the same view and can veto before launch. They work on a large desktop display, often in a dim room, under time pressure.

**My role.** Sole designer. I designed the three screens and the five edge-case states, and built the component library behind them: 8 component sets bound to 21 color tokens named for what they mean rather than what they look like, each carrying its own usage rule. I wrote the engineering annotations and the spec for the coded interaction, and used Claude through the Figma MCP to produce the files. The scenario and the fleet came from an autonomy company's brief. Everything after that is mine.

The fleet is 38 assets of four types, and they are not interchangeable.

| Asset | Count | Strength | Limit |
|---|---|---|---|
| Roc (fixed-wing) | 6 | Covers large sectors fast | Low detail per pass |
| Hydra (quadrotor) | 24 | Close inspection | 15 km range from a forward staging site |
| Griffin (VTOL) | 4 | Radar and comms relay | Few available |
| Kraken (surface drone) | 4 | Goes where crewed boats can't | Slow, about 12 knots |

Two Rocs are in maintenance, so 36 are available. Today the operator assigns them one at a time. That takes about 20 minutes and leaves coverage gaps nobody sees until the debrief.

**The operator has to commit 36 different assets to four sectors in minutes, and trust the plan covers the area before anything moves.**

---

## Objective

The autonomy proposes a full tasking plan. The operator verifies it, changes it and launches it in under five minutes, with nothing launching unseen.

- **Coverage at a glance:** which sectors are covered, by what, and how well.
- **The weakest sector is obvious.** The operator can name it without hunting.
- **Every autonomy choice is explained in one readable line.**
- **The operator stays in control:** accept the plan whole, change any assignment, or lock assets so a re-propose won't move them.
- **Warnings inform, never block.** A HIGH-priority sector below 60% coverage gets an in-place warning, and launch stays available.

Out of scope: live flight control, route planning (the autonomy owns it), and anything involving weapons or targeting.

---

## Approach

### 1. One source, every count reconciles

The first draft of the review screen had the right structure, but the data broke it. The counts didn't reconcile with the fleet, and an operator who catches one wrong number stops trusting every other number on the screen.

I rebuilt the roster as a single source: 38 units, each with a real ID, type, sector and status. ROC-05 and ROC-06 stay on screen as unavailable, with the reason and when they're expected back. "Zones" became "sectors" to match the brief, lettered A to D.

[IMAGE — asset roster beside the map. Keep existing alt text.]

### 2. Plan in groups, fly as individuals

On the review screen the operator is judging a plan, so the map groups assets per sector (HYD ×7). A group of one shows its ID instead of "×1," which matches the rail and reads as intentional. Selecting a group fans it out into its units, which is where a single Hydra gets dragged to another sector. Individual positions appear only once assets are flying and position matters.

The same logic keeps the roster scannable before a plan exists: 24 Hydras with identical status, site and link collapse into one row, so 38 assets fit in a single view.

[IMAGE — map and roster before a plan exists. Keep existing alt text.]

### 3. Coverage owns the fill, priority owns the chip

The brief asked how to show sector priority without competing with coverage color. The answer was to give each signal one channel.

- Coverage fills the sector on the map and drives a thin bar on each card, with a tick at the 60% target.
- Priority is a HIGH, MEDIUM or LOW chip beside the sector name, never a color.
- Selection is a white outline, so fill always means coverage.
- Color is earned: amber appears only where the operator should decide, blue only on things the operator can act on.

[IMAGE — Screen 2, Review proposed tasking. Keep existing alt text.]

### 4. Lead with the cost, never block

The first Sector D warning named the cause, Hydras at max range from staging, but not what it cost. The rewrite puts the cost first, in the operator's terms:

> ◆ 44% coverage, 16 pts below target for a HIGH sector
> Hydras at max range from Staging A: little time on station.
> See options · Stage anyway

"Stage anyway" makes the rule visible. The warning informs, and the operator can still stage and launch. A stat bar above the map names the weakest sector, so the operator never has to hunt for it.

[IMAGE — mission header above the Sector D card. Keep existing alt text.]

### 5. Mark the exception, not the default

Most of the plan comes from the autonomy, so autonomy rows carry no marker, only their one-line reason: "KRK-01–02 added: water too deep for ground crews." Operator changes are the exception, so they get the marker.

- A teal left bar and a source line: "Set by operator · moved from Sector B · 08:41."
- Purple stays reserved for the Autonomous status, so the two never blur.
- The status badge in each row became a lock control, since locking is the action the operator takes there. Locks and priority chips align in fixed columns, so the rail scans in one pass.

[IMAGE — Sector D card with autonomy and operator rows. Keep existing alt text.]

### 6. The edge cases are the job

I designed five states, centered on one failure caught before launch and one handled during the mission.

**Before launch: a sector the fleet can only partly reach.** As soon as the operator draws Sector D, the console flags that Hydras can only partly reach it, because most of the sector sits beyond their 15 km limit from Staging A. Selecting the sector shows exactly what can reach it: Roc from the airfield, Kraken from the marina, Griffin relay coverage, and Hydra only along the NE edge. The gap is visible before a plan is even proposed.

[IMAGE — Screen 1, Area overview. Keep existing alt text.]

**During the mission: a sector falls behind plan.** Two Hydras return for battery, and Sector B drops 18 points behind where the plan expected it to be. The card shows planned against actual coverage, explains why in one line, and offers a choice: re-propose Sector B, or keep the current plan. The autonomy proposes; the operator decides.

[IMAGE — Screen 3, Tasking live. Keep existing alt text.]

Also built: the empty state, with no sectors drawn and nothing to propose; a HIGH sector below its coverage target; and unavailable assets with the reason and expected return.

**What I'd build next:** a lost relay link, shown as one incident card with the root cause first; a supervisor veto; and a re-propose that conflicts with a locked asset.

---

## Engineering handoff

The review screen was the key decision, so its parts became the system: a sector card with 8 variants (staged, selected, low coverage), a tasking row with 4, and priority chip, lock, status and asset-marker components, all bound to 21 color tokens and reused across all three screens.

The tokens are named for meaning, not appearance: `--status-needs-operator`, `--status-operator-set`, `--status-autonomous`, `--interaction-primary`. A token called `--amber-500` tells the next person what it looks like. These tell them when it applies. Each one carries a USE WHEN and an AVOID rule, written so engineers and AI agents apply color the same way the operator reads it.

The brief asked for one coded interaction: drag an asset between sectors, with coverage updating live. I wrote the handoff so the build could not drift from the design.

- **One data file.** All 38 units and a simple coverage rule, tuned so the default plan reproduces the Figma screens exactly: A 92%, B 83%, C 87%, D 82%, 86% overall.
- **Tokens as a table.** The 21 Figma color tokens mapped to code, with the visual rules attached. Selection is white, never blue. Amber only where the operator decides.
- **Two kinds of annotation.** Note cards beside each frame explain the design reasoning; native Figma annotations sit on the exact layers engineering will build.
- **A one-drag acceptance test.** Moving ROC-04 from Sector D to Sector B should drop D to 44%, raise B to 97%, drop overall from 86% to 80%, show the inline warning, name D as weakest in the stat bar, and mark ROC-04 as set by operator.

[IMAGE — handoff frame. Keep existing alt text.]

The tokens carry the rule, not just the value, so the next person building a screen knows when amber is allowed.

---

## Outcomes

- Three screens at desktop size, dark theme: Area overview, Review proposed tasking, Tasking live.
- Five edge-case states, from the empty state through a sector falling behind plan.
- A component library of 8 component sets bound to 21 color tokens.
- A launch summary listing every unit before launch, so no assignment goes out unseen.
- The brief's open design questions answered on the canvas: priority against coverage color, operator against autonomy choices, warning strength, and a 38-row roster that stays scannable.

**<5** — Target minutes to task 36 assets
Down from about 20 today. A design target from the brief, not yet tested with operators.

**0** — Assets launched with an assignment the operator did not see
Enforced by the launch summary.

**60%** — Coverage floor for HIGH sectors
Below it, an inline warning shows the cost. Launch is never blocked.

---

## Reflection

### Cohesion came from taking color away

Early versions looked like three products stitched together, because every signal was competing for the same channel. The fix was rationing. Coverage owns the fill, priority owns the chip, selection owns the outline, and amber appears only where the operator has to decide. Nothing on the screen is colored to look important. It's colored because it means one specific thing.

### Currently validating

- **Time to task.** Running the review flow with SAR coordinators, measuring time from proposal to launch against today's 20 minutes. Target: under 5.
- **The five-second glance.** Showing the review screen briefly and asking which sector is weakest. If operators have to hunt, the coverage fill isn't working.
- **Override rate, and why.** Tracking how often operators change the autonomy's assignments. Constant overrides mean they don't trust the plan. Zero overrides might mean they've stopped checking. The goal is calibrated trust, not maximum trust.

### The open product questions shape the screens

- Can the supervisor edit, or only veto?
- Can the autonomy ever move a locked asset?
- What counts as good enough to launch?
