# Field Guide case study — final copy

Nov 18, 2026 · @Leslie

Replacement copy for the Field Guide page. Two restores applied, years removed, rebuild section included without a link so the page can ship now.

## Hero

**Label:** Shipped work · Rural health research

**Title:** Field Guide: a 120-question health survey, for people who couldn't read it

**Summary:** An NIH-funded Pitt–WVU study in rural Appalachia. Participants gave up their health data in exchange for dental care, and the study was losing them.

| Figure | Label |
| --- | --- |
| 83% | survey completion on the tablet instrument |
| 15 min → 1 min | household onboarding |
| 23% → 0 | participants rescheduled without seeing a dentist |

*\[Image: hero composite — spec in Production notes\]*

## Context

The study was an NIH-funded collaboration between Pitt and WVU, running clinic days in rural Appalachia. The arrangement was explicit: participants completed a long health survey and handed over personal health data, and in return they received a dental exam, and treatment if they needed it. Many needed a great deal.

Two things were failing. Participants were dropping out, and the study's funding depended on their data. The data itself moved on paper, hand-entered afterward, slowly and with errors, so no partner institution could see it for a week or more.

What I was handed wasn't a brief. The team thought digitizing the survey might be worthwhile and didn't know what that would mean or whether it was possible. No device decision, no data pipeline, no spec.

The study characterized its participants as illiterate. The paper sheets said something else: whole columns of identical answers, filled in by people who wanted to be done. Literacy wasn't the barrier. Volume and density were — 120-plus questions in research language, many of them long and multi-part. Either way, the obvious move, putting the instrument on a screen, was off the table.

**My role.** Sole designer, through p2design. I defined the problem, rewrote the instrument with the researchers, designed the offline tablet survey and the data path behind it, and redesigned the clinic day after watching it fail in person.

*\[Image: partner logos, small and inline — provenance, not a feature\]*

## Objective

What the design had to satisfy:

- **No reading required.** Every question had to be heard, and the participant had to be able to work through it alone, since this was a self-report instrument.
- **One design across the full range.** The same instrument served an elder who wouldn't touch a handheld, a teenager on the youth version of the study, and parents somewhere in between.
- **Survive the length.** A single parent completed her own survey plus a child behavior instrument for every child under 12, up to four instruments in one visit, with the children in the room.
- **No connectivity, not poor connectivity.** Nothing could depend on reaching a network during the clinic day.
- **Protected health data on devices that travel.** The tablets left the site each night, so the design had to meet the study's HIPAA obligations, not just good intentions.
- **Same-day into the study database,** reachable by Pitt, WVU and NIH.

## Approach

### 1. If it can't be read, it has to be heard

The researchers didn't want the questions touched. No budget for a rewrite, and a real concern that changing the wording would change what each validated instrument measured. Rather than argue, I recorded one of the longest questions and played it aloud for the room. At the speed a participant would hear it, the question was plainly unanswerable.

The team agreed to two changes that afternoon: rewrite every question for readability, and record each one as audio. I took every rewrite back to the researchers for sign-off, so the instrument stayed scientifically valid rather than just shorter. The approved wording played through headphones, so a participant who had trouble reading could listen and answer on their own.

| Original | Rewrite | Grade level |
| --- | --- | --- |
| "Is there any known consanguinity?" | "Are the child's parents related by blood?" | 11 → 4 |
| "Most people do not realize the extent to which their illnesses are controlled by accidental happenings." | "Getting sick is mostly by chance, not something you control." | 9 → 5 |
| "I know someone I would feel perfectly comfortable talking to about problems budgeting my time between school and my social life." | "When it's hard to keep up with both school and friends, I have someone to talk to." | 9 → 2 |

Scored with the Flesch-Kincaid Grade Level formula.

### 2. Design for no signal, not bad signal

The clinic ran in rural locations where connectivity couldn't be relied on, and the tablets traveled with the team. The survey ran fully offline. At checkout, each participant's data copied to a laptop and a portable external drive, so a lost or failed tablet never cost more than the session in progress. At the end of the day, once the team reached reliable connectivity, everything went up to the study database and every tablet was wiped. Nothing carrying protected health information rode around overnight.

The tablet was never the point: the study needed the data to land in a database Pitt, WVU and NIH could all reach, and to tell them it had landed. A successful upload did both. It wiped the tablets and sent the institutions an update notice, the same day instead of a week or more.

*\[Image: data-path diagram, three phases — spec in Production notes\]*

### 3. The clinic day was the product

Participants gave up personal health data and were promised a dental exam in return, plus treatment if they needed it. Many needed a great deal. I spent clinic days on site watching the queue rather than reading reports about it, and the bottleneck turned out to be variance, not volume. When an exam becomes an hour of treatment, a block of arrivals becomes a backlog that never recovers.

23% were rescheduled, and in a rural catchment that largely meant the participant was lost: the study had the data and hadn't held up its end.

Two changes, neither an interface. I staggered arrival times so the queue metered itself, and took the queue data to the study directors, who authorized an overflow dental team. Rescheduling went to zero.

*\[Image: clinic day, before and after — spec in Production notes\]*

### 4. Replace the artifact, not the format

Onboarding took fifteen minutes per household because staff hand-drew a family pedigree for each participant. I replaced the drawing with on-screen confirmation. Staff confirmed or corrected relationships instead of constructing them. One minute.

The gain wasn't paper becoming a screen. It was changing what the staff was asked to produce: nobody needed a drawn artifact, the study needed confirmed relationships, and confirming is faster than constructing.

## Outcomes & Impact

| Result | Figure |
| --- | --- |
| Survey completion on the tablet instrument | 83% |
| Clinic day to data available to Pitt, WVU and NIH | 8 hours, from a week or more |
| Household onboarding | 15 minutes → 1 minute |
| Participants rescheduled without seeing a dentist | 23% → 0 |

The study kept its funding.

**Delivered:** a plain-language instrument approved by the researchers; a voice-first tablet survey that ran offline; an end-of-day data procedure covering upload, backup and wipe; and a redesigned clinic day.

## Reflection

### The screen was the smallest part of it

The survey was what I was asked about. The queue, the staffing and the data path were what determined whether the study got its data, and none of them were interface problems. Starting in a design tool would have produced a good instrument delivered into a clinic day that still lost a quarter of its participants.

### What I'd check if I ran it again

- Completion by instrument count: did the parents working through four instruments finish at the same rate as participants doing one?
- The time-to-dentist distribution rather than the average. The average was never the problem; the tail was.
- Whether audio-only delivery changed response patterns compared with the paper instrument. Nobody measured that, and on a study collecting health data it matters.

## The rebuild

Most of the constraints that shaped this work have since lifted. Offline-first is ordinary now. Speech no longer needs a recording session and a researcher's calendar. A model can notice that someone is struggling with a question and offer a simpler wording that a researcher already approved, which at the time meant printing a second instrument.

So I rebuilt it as a working prototype, in React and Next.js, to find out what this design becomes when the constraints go away. Regional voices rather than neutral narration. Fatigue handling for the parent on her fourth instrument. A coordinator view that shows the clinic day falling behind while there is still time to do something about it.

*\[Image: one screenshot, most likely the coordinator view. This section is a door, not a summary.\]*

## Production notes

Not page copy. Working notes for the build.

### Images

| Placement | Status |
| --- | --- |
| Hero: staged composite, interface over an over-the-shoulder shot | Done |
| Context: partner logos | Exists |
| Approach 1: before/after question table | Exists, keep as a table |
| Approach 1: question screen with audio control | Optional |
| Approach 2: data path diagram | Done |
| Approach 3: clinic day before/after | Journey map exists; may need redrawing |
| Rebuild: one screenshot | Pending the rebuild |

**Hero caption and alt text.** Caption it as a composite. Alt: A man in a flannel shirt and cap sits in a worn clinic office holding a tablet, headphones around his neck plugged into it, while a staff member reaches in to point at the screen. Caption: Illustration. The survey was self-administered on a tablet with audio through headphones; staff showed participants how to use it.

**Data path diagram.** Three phases, not a flat chain. During the clinic day: tablet, offline, nothing leaves it until checkout. At checkout: data copies to a laptop and a portable external drive. End of day, at connectivity: upload to the study database, every tablet wiped. Then one success event with two one-way branches — tablets wiped, update notice to Pitt, WVU and NIH — not a two-way arrow. The existing four-box diagram is the right skeleton but shows none of the timing, the redundancy or the wipe, which are the three things this point argues. A laptop, not a PC.

**Approach 3 image.** Either the existing journey map or a simpler two-state diagram: block arrival with a growing queue, against staggered arrival with two dental stations. If the journey map is dense, redraw it. This point carries the case study and the picture should read at a glance.

### Open items

- [ ] Confirm or replace the three bullets under "What I'd check if I ran it again" — these are proposals, not measures the study ran. Two confirmed beats three proposed.
- [ ] Add "Read the rebuild →" to the rebuild section once that page exists. Until then, no link.
- [ ] State the 83% bare. There is no paper baseline, so any phrasing implying an improvement over paper is a number that can't be defended in an interview.

### Editorial rules carried over

- Shipped pages lead with outcomes. Prototype pages lead with scope. Mixed-Asset keeps 36 assets / 4 types / 1,200 km² in its hero because it has no outcomes to lead with.
- Three stats is the limit for a scan. The eight-hours figure stays out of the hero and goes in Outcomes; it needs a sentence of context to land.
- No years anywhere on the page.
