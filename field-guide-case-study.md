Shipped work · Rural health research

# Field Guide: the directors blamed literacy, the paper said exhaustion.

An NIH-funded Pitt–WVU study in rural Appalachia. Participants traded health data for dental care, and the study was losing them to a 120+ question paper survey.

[IMAGE — HERO: `hero-image.webp`. Man in plaid shirt and ball cap, headphones on, holding the tablet in a clinic office. The screen shows the Social Connectivity section: Read Aloud toggle on, progress bar, "Do you feel alone or far away from your friends and family?" and five response buttons with Sometimes highlighted. Keep existing alt text.]

83% — Survey completion on the tablet instrument
15 min → 1 min — Household onboarding
23% → 0 — Participants rescheduled without seeing a dentist

*See how we measured this →*

---

## Context

The study directors blamed literacy. The paper sheets said something else: whole columns of identical answers, filled in by people who wanted to be done. Reading wasn't the barrier. Volume and density were, with 120-plus questions in research language, many of them long and multi-part. Either way, the obvious move, putting the instrument on a screen, was off the table.

The study was an NIH-funded collaboration between Pitt and WVU, running clinic days in rural Appalachia. The arrangement was explicit: participants completed a long health survey and handed over personal health data, and in return they received a dental exam, and treatment if they needed it. Many needed a great deal.

Two things were failing. Participants were dropping out, and the study's funding depended on their data. The data itself moved on paper, hand-entered afterward, slowly and with errors, so no partner institution could see it for a week or more.

What I was handed wasn't a brief. The team thought digitizing the survey might be worthwhile and didn't know what that would mean or whether it was possible. No device decision, no data pipeline, no spec.

**My role.** Sole designer. I defined the problem, rewrote the instrument with the researchers, designed the offline tablet survey and the data path behind it, and redesigned the clinic day after watching it fail in person.

[IMAGE — SERVICE BLUEPRINT: `Service_Blueprint_-_clinical_visit_8.png`. Six phases across the clinic visit — check-in and onboarding, self-report surveys, dental exam, DNA sample, remaining surveys, departure — with rows for participant actions, touchpoints and devices, people and environments, tablet actions, supporting processes, participant pain points and solution opportunities, divided by a line of interaction and a line of visibility.]

*The clinic visit, front stage and back: what the participant does, what the tablet does, and the server syncs behind both.*

---

## Objective

What the design had to satisfy:

- **Reading optional.** Every question and every answer could be heard instead of read, and the participant had to be able to work through the whole thing alone, since this was a self-report instrument.
- **One design across the full range.** The same instrument served an elder who had never used a piece of technology, a teenager on the youth version of the study, and parents somewhere in between.
- **Survive the length.** A single parent completed her own survey plus a child behavior instrument for every child under 12, up to four instruments in one visit, with the children in the room.
- **No connectivity, not poor connectivity.** Nothing could depend on reaching a network during the clinic day.
- **Protected health data, in the room and on the road.** Audio meant a participant's answers could be overheard, so headphones weren't a comfort choice, they were how the audio met HIPAA. The tablets also left the site each night, which the data path had to account for.
- **Same-day into the study database,** reachable by Pitt, WVU and NIH.

---

## Approach

### 1. Anything on the page, available as audio

The researchers didn't want the questions touched. No budget for a rewrite, and a real concern that changing the wording would change what each validated instrument measured. Rather than argue, I recorded one of the longest questions and played it aloud for the room. At the speed a participant would hear it, the question was plainly unanswerable.

The team agreed to two changes that afternoon: rewrite every question for readability, and record each one as audio. I took every rewrite back to the researchers for sign-off, so the instrument stayed scientifically valid rather than just shorter. The approved wording played through headphones, so a participant who had trouble reading could listen and answer on their own.

| Original | Rewrite | Grade level |
|---|---|---|
| "Is there any known consanguinity?" | "Are the child's parents related by blood?" | 11 → 4 |
| "Most people do not realize the extent to which their illnesses are controlled by accidental happenings." | "Getting sick is mostly by chance, not something you control." | 9 → 5 |
| "I know someone I would feel perfectly comfortable talking to about problems budgeting my time between school and my social life." | "When it's hard to keep up with both school and friends, I have someone to talk to." | 9 → 2 |

*Scored with the Flesch-Kincaid Grade Level formula.*

### 2. Design for no signal, not bad signal

The clinic ran in rural locations where connectivity couldn't be relied on, and the tablets traveled with the team. The survey ran fully offline. At checkout, each participant's data copied to a laptop and a portable external drive, so a lost or failed tablet never cost more than the session in progress. At the end of the day, once the team reached reliable connectivity, everything went up to the study database and every tablet was wiped. Nothing carrying protected health information rode around overnight.

The tablet was never the point. The study needed the data to land in a database Pitt, WVU and NIH could all reach, and to tell them it had landed. A successful upload did both. It wiped the tablets and sent the institutions an update notice, the same day instead of a week or more.

[IMAGE — DATA PATH: `data-diagram.png`. Four phases left to right. During the clinic day: tablet, offline. At each checkout: laptop plus external drive. End of day, on connectivity: study database. Same day, on successful upload: message sent, branching to Pitt, WVU and NIH. A return arrow from the study database back to the tablet, labelled Tablets wiped.]

### 3. The clinic day was the product

Participants gave up personal health data and were promised a dental exam in return, plus treatment if they needed it. Many needed a great deal. I spent clinic days on site watching the queue rather than reading reports about it, and the bottleneck turned out to be variance, not volume. When an exam becomes an hour of treatment, a block of arrivals becomes a backlog that never recovers.

23% were rescheduled, and in a rural catchment that largely meant the participant was lost. The study had the data and hadn't held up its end.

Two changes, neither an interface. I staggered arrival times so the queue metered itself, and took the queue data to the study directors, who authorized an overflow dental team. Rescheduling went to zero.

[IMAGE — JOURNEY MAP: `field-guide-journey-map.svg`. Five phases of a rural clinic visit with an emotion line rising and falling across them, participant quotes at each phase, a breakdowns row of eleven numbered problems, and an opportunities row answering them. Keep existing alt text.]

### 4. Stop drawing, start confirming

Onboarding took fifteen minutes per household because staff hand-drew a family pedigree for each participant. The study genuinely needed that pedigree, so the artifact stayed. What changed was who produced it. A computer draws a three-generation chart faster than any person can, from what the household gives at check-in. Staff confirmed the relationships on screen and added anyone who wasn't listed. One minute.

The fifteen minutes weren't going into judgment. They were going into construction, which is the part a machine does better. The human job was the part only a human could do: looking at the chart and saying yes, that's my family, and you're missing my stepson.

[IMAGE — PEDIGREE: `Pedigree_Chart_1.png`. Three generations of a household, with members living in the household marked in green and a consanguineous marriage shown in the legend.]

*The chart the study needed, drawn from what the household gave at check-in. Staff confirmed it and added anyone missing.*

---

## Outcomes & Impact

| Result | Figure |
|---|---|
| Survey completion on the tablet instrument | 83% |
| Clinic day to data available to Pitt, WVU and NIH | 8 hours, from a week or more |
| Household onboarding | 15 minutes → 1 minute |
| Participants rescheduled without seeing a dentist | 23% → 0 |

The study kept its funding.

Delivered: a plain-language instrument approved by the researchers; a voice-first tablet survey that ran offline; an end-of-day data procedure covering upload, backup and wipe; and a redesigned clinic day.

---

## Reflection

### The screen was the smallest part of it

The survey was what I was asked about. The queue, the staffing and the data path were what determined whether the study got its data, and none of them were interface problems. Starting in a design tool would have produced a good instrument delivered into a clinic day that still lost a quarter of its participants.

### What I'd check if I ran it again

- **Completion by instrument count.** Did the parents working through four instruments finish at the same rate as participants doing one?
- **The time-to-dentist distribution rather than the average.** The average was never the problem. The tail was.
- **Whether audio-only delivery changed response patterns** compared with the paper instrument. Nobody measured that, and on a study collecting health data it matters.

---

**Most of the constraints that shaped this work have since lifted. I rebuilt it to find out what the design becomes when they're gone. →** [LINK — separate case study, URL TBD]
