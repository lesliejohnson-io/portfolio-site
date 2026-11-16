# Field Guide

**Hero stats**

- **83%** — Survey completion rate
- **Same day** — Data reaching all institutions, down from a week or more

[VISUAL: hero image. The tablet survey screen and the coordinator dashboard shown together.]

---

## The assignment

Open-ended. A Pitt–WVU study across rural Appalachia was losing participants faster than it could replace them, and its NIH funding depended on the data those families provided. No one had identified why. The study described its participants as illiterate and asked whether tablets would help.

Role: UX designer and researcher, leading design from field research through in-clinic testing over an eight-week engagement, with updates through the following year. Worked with research teams at Pitt and WVU, clinicians, developers, and community partners.

## What was actually happening

Every survey was a paper bubble sheet. Sheets traveled between sites for a week or more before being keyed into the database by hand, collecting errors on the way, and the institutions did not receive the data at the same time.

The sheets showed a second problem. Whole columns of identical answers, filled in by people who wanted to be done. Those surveys were complete, and the study could not use them.

Literacy was not the barrier. Volume and density were. The survey ran more than 120 questions, written for researchers rather than for the families answering them, many of them long and multi-part.

Three findings, three different kinds of problem: a data pipeline, an instrument, and a clinic day.

## Who the study was asking

[VISUAL: three persona cards — The Householder, The Gatekeeper, The Independent.]

The households in the study were not one audience. A parent answering with small children in the room, an elder who would answer a spoken question but would not touch a tablet, and a teenager comfortable with any device all had to complete the same instrument on the same afternoon.

The Gatekeeper set the requirement the rest of the design followed. A survey that had to be read would lose her. A survey that could be heard would not.

## Objective

Reliable data came first. Participants needed questions they could follow by ear and answer without reading or writing. They also needed their exam visit to run on time. Clinicians needed accurate records without losing hours to paperwork.

All of it had to work in rural clinics with:

- **Reading could not be required.** Nothing in the survey could depend on reading or writing.
- **Unreliable internet.** The tablets had to work offline and sync later.
- **Thin trust.** A participant who had a bad visit might not come back.

---

# The original work

## 1. Turning 120+ questions into speech

The research team did not want the questions rewritten. They had no time or budget for a rewrite, and they were concerned that changing the wording would change what each validated instrument measured.

Rather than argue the point, one of the longest and most complex questions was recorded and played aloud for the room.

The room went quiet. At the speed a participant would hear it, the question was plainly unanswerable.

The team agreed to two changes: rewrite the questions for readability, and record each one as audio so participants could listen instead of read.

| Original | Rewrite | Grade level |
|---|---|---|
| "Is there any known consanguinity?" | "Are the child's parents related by blood?" | 11 → 4 |
| "Most people do not realize the extent to which their illnesses are controlled by accidental happenings." | "Getting sick is mostly by chance, not something you control." | 9 → 5 |
| "I know someone I would feel perfectly comfortable talking to about problems budgeting my time between school and my social life." | "When it's hard to keep up with both school and friends, I have someone to talk to." | 9 → 2 |

Scored with the Flesch-Kincaid Grade Level formula.

Most of the effort went into protecting each question's meaning while the words got simpler. Researchers approved every rewrite against what the original was validated to measure. The approved versions were recorded as audio prompts and loaded onto tablets, which ran offline and uploaded to a shared database at the end of each clinic day.

Hand-keying disappeared from the pipeline, and with it the errors it introduced.

## 2. Watching the clinic day

Time spent in the clinic, watching visits unfold from arrival to exam, surfaced two problems that had nothing to do with the survey:

- **Onboarding.** Clinicians spent about 15 minutes with each household, collecting names and drawing three-generation pedigrees by hand.
- **The exam queue.** Emergencies took priority, as they should, and families with routine exams waited for hours.

Mapping the full service, from the participant's path to staff workflows and the handoffs between them, showed how the two problems were connected.

[VISUAL: participant journey map of a rural clinic visit.]

[VISUAL: service blueprint of the clinic day.]

## 3. Family pedigrees in a minute

The study needed a pedigree for every household, mapping the people living there and their extended family. Clinicians drew each one by hand at check-in, and with most families arriving at once, everyone else waited.

On the tablet, participants confirmed the family members already listed, added anyone missing, and the system drew the pedigree. Onboarding went from 15 minutes per household to 1, and clinicians got that time back for checking families in.

[VISUAL: generated three-generation pedigree chart, household members marked.]

The rebuild keeps this flow. [VISUAL: tablet screen 2, the household screen, where tapping each member builds the chart.]

## 4. Clearing the exam backlog

When someone arrived with an emergency, such as an infection, clinicians treated them first. The families behind them waited, sometimes for hours, and some went home without an exam.

A screen could not solve this, and staffing belonged to the directors. The case went to them in the study's terms: each family that left was a participant, and a set of data, the study might not get back. The directors agreed to add an overflow dental team for emergencies. Urgent cases still got care, and scheduled exams started on time.

---

## Key decisions and trade-offs

| Decision | Why | Result |
|---|---|---|
| Rewrite every question in plain spoken language; participants listen and tap | Many participants could not get through dense written questions, and the paper sheets came back straightlined | Reading level fell from grades 9–11 to 2–5, and 83% of tablet surveys were completed in full, with researchers confirming each rewrite still measured what the original did |
| Study the whole clinic day, not just the survey | The tablets were in use, but participation was still being lost somewhere | Surfaced two problems outside the survey: 15-minute onboarding and the exam queue |
| Participants pick household members from a list and the system draws the pedigree | Clinicians were drawing three-generation pedigrees by hand | Onboarding went from 15 minutes per household to 1 |
| Take the emergency staffing problem to the study's directors, outside the design scope | No screen could stop families leaving without an exam | An overflow dental team was added; urgent cases still came first and scheduled exams started on time |

## Outcomes

Participants completed 83% of tablet surveys in full, and data reached every institution the same day instead of a week or more later. The study recovered enough participation and data quality to keep its NIH funding.

| Metric | Result | How it was measured |
|---|---|---|
| Survey completion rate | 83% | Share of tablet surveys completed in full |
| Data availability | Same day | 8 hours to reach all institutions, down from a week or more |
| Onboarding per household | 15× faster | 15 minutes down to 1 minute |

Once an overflow team took on emergencies, the exam queue kept moving and every participant was seen.

## What the project taught

Map the whole service before designing screens.

The blueprint came after the problems had already turned up in the clinic. It explained them, but drawn earlier, it would have found them sooner. That habit shaped the rebuild.

---

# The rebuild: the survey and the clinic as one system

The original solved the two problems separately, with tablets for the survey and an added team for emergencies. In the rebuild they share one set of data, so the participant's tablet and the clinic's dashboard describe the same day.

Role: designed and coded the rebuild in React and Next.js. The ElevenLabs API generates each question's audio ahead of time so the tablets work offline. The Anthropic API drafts plain-language versions of questions for researchers to review.

Design principle: all AI work happens before clinic day. Nothing at the clinic needs an internet connection.

[VISUAL: the six participant tablet screens as a flow. Setup, household, standard question, simpler question, break offered, called to the exam.]

## Sounding like home

In the original, every prompt was recorded in one voice, at one pace, for 700 households.

The rebuild generates the prompts in Appalachian-accented voices. The population this study depended on had good reason to be wary of institutions, and a survey that sounds like a neighbor asks less of a participant than one that sounds like a university. Accent is not decoration here. It is the difference between a question that gets answered and one that gets straightlined.

[VISUAL: tablet screen 1, setup. Headphones are checked before anything else, and the voice is introduced by name. The voice stays named in the header for the rest of the survey.]

## Answering without reading

Each answer is a large target carrying a mark that grows toward both ends of the scale. Intensity is size, not color, so the scale still reads for a participant with color vision deficiency, which affects roughly one man in twelve. The audio carries the labels for anyone who cannot read them.

[VISUAL: the five answer targets, marks growing from Neither to each pole.]

## When a question doesn't land

If a participant replays a question twice, the tablet offers a simpler version. Each validated question measures one specific thing, and loose rewording can change what it measures without anyone noticing. A model drafts the alternatives, and researchers approve each one before it reaches a tablet.

[VISUAL: tablet screens 3 and 4 side by side. The same question at standard and simpler reading levels, with the reading level named on each screen.]

After a few questions, the tablet calls the participant to the dental chair. When they come back, the survey resumes where they stopped. People answer questions during time they would otherwise spend waiting.

[VISUAL: tablet screen 6, called to the dental chair.]

## When someone gets tired

The tablet compares how long each answer takes against that person's own pace, and counts replays. It also watches for the old paper problem: answers tapped before the question finishes, or the same answer chosen again and again.

The response escalates rather than firing all at once:

1. Slow the speech.
2. Switch to the simpler approved wording.
3. Offer a break.
4. Flag the household to the dashboard so staff can check in.

Rules run offline, and researchers can see exactly why a flag was raised.

[VISUAL: fatigue detection chart, with the escalation steps labeled on the timeline.]

[VISUAL: tablet screen 5, the break offered. The survey states plainly that answers are saved and that it will resume in the same place.]

## Seeing the clinic day at a glance

The coordinator's screen stays quiet until someone needs a person. The same escalation that slows a tablet's speech ends, if nothing helps, as a flag on this screen.

[VISUAL: coordinator dashboard.]

The lead can spot a growing queue early and move staff before families start leaving.

## See it working

[DEMO: live link or embed.]

The demo follows one participant from the first question to the dental chair and back, including a replay, a simpler version, and a fatigue check-in. The clinic dashboard updates alongside it.

---

## Closing

On paper, participants answered questions they could not follow, and the study could not trust the answers. The original tablet and the rebuild both start from the same idea: research about a community only works when that community can take part in it.
