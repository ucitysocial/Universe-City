# Time System

**Status:** WORKING PRODUCT MODEL

Time is the first system currently being rethought in depth.

This document captures the current direction so implementation can follow the product rather than fossilizing an early prototype.

---

## Mandate

Universe City maintains a Time System by understanding:

- how the resident's time is actually used
- how the resident wants their time to be used
- where Plan and reality diverge
- what changes improve alignment
- which patterns are stable enough to become part of the maintained Schedule

The resident does **not** build the Time System.

Universe City builds and maintains it from the resident's life.

---

## The core interaction: Plan

The emerging interaction primitive is the **daily Plan**.

The simplest opening/closing question:

> **Did today go as planned?**

That question is powerful because the Plan already gives Universe City the touchpoints that matter.

Instead of:

> What part of your schedule was different?

Universe City can ask:

> Did you get to work at the time you planned?

> Did you go grocery shopping like you said?

> Did you finish the project you wanted to finish?

> Did you make it to the gym?

The resident should not need to reconstruct an entire day from memory if Universe City already knows the intended day.

---

## Plan is not Schedule

### Plan

What the resident intends to happen on a specific day.

### Actual

What actually happened.

### Difference

Where actual life meaningfully diverged from the Plan.

### Schedule

The recurring structure Universe City maintains after learning enough from repeated Plans, Actuals, resident statements, and other appropriate evidence.

A claimed Schedule should not automatically override repeated evidence that life works differently.

---

## Daily loop

Current strongest model:

### Evening Close

1. Ask whether the day broadly went as planned.
2. Review only the Plan items that are useful/uncertain/important.
3. Capture meaningful additions or changes.
4. Understand relevant reasons for divergence.
5. Surface a learning only when warranted.
6. Present tomorrow's known structure.
7. Ask what should be different from usual tomorrow.
8. Confirm tomorrow's Plan.

Potentially:

> Here's what I have for tomorrow. Still the plan?

The interaction should often take well under a minute when nothing important changed.

### Morning

Not yet decided.

Possible behavior:

- no interaction
- simple "still the plan?" when useful
- proactive check only when something important changed overnight

Do not create two mandatory daily rituals without evidence that both help.

---

## Item outcomes

Working candidates:

- **As planned**
- **Changed**
- **Didn't happen**

Do not reduce changed behavior to failure.

Example:

Planned groceries at 5:30. Resident went at 7:00 because work ran late.

That is different from not grocery shopping at all.

---

## Follow-up logic

The Plan is a candidate list of touchpoints, not a requirement to interrogate every item.

Ask about an item when it is useful because of factors such as:

- it is new
- it is important to the resident
- it is part of an active Time challenge
- its timing is uncertain
- it has repeatedly diverged
- it affects another commitment
- the resident explicitly wants accountability
- it represents a meaningful change from usual life

Stop asking about stable behavior when it is established.

---

## Positive feedback

When the resident follows through on something meaningful:

> You said you'd do it, and you did.

Positive acknowledgement is useful.

Avoid childish gamification and avoid making every mundane action a celebration.

Success is not "how many tasks did you complete?"

A resident can successfully:

- protect rest
- decline an extra commitment
- follow a fallback
- change the Plan before it fails
- intentionally leave time open

---

## Usual vs progress

Time needs to distinguish:

### What normally happens

The resident's baseline reality.

### What the resident wants to move

Intentional change.

Universe City should first understand what already has the resident's time before adding aspirational work.

Possible internal planning categories:

- Fixed
- Maintain
- Move
- Protect

These labels are **not locked for resident-facing UI**.

Potential question:

> Is there anything you want tomorrow to be different from usual?

"Nothing" is a valid answer.

Not every day must become self-improvement homework.

---

## Friction / fallback

For a meaningful progress item, Universe City may ask:

> What usually makes that hard?

Then, when useful:

> If that happens tomorrow, what should we do instead?

Example:

Plan:
- Gym directly after work.

Known friction:
- If resident goes home first, they rarely leave again.

Fallback:
- If work runs too late, move gym to Thursday rather than scheduling it after arriving home.

A successful fallback can represent good planning.

---

## Planning physics

Over time the Time System should learn the resident's own behavioral constraints.

Examples:

- commute is usually 15 minutes longer than claimed
- plans after 8 PM rarely happen
- one after-work errand works; three usually collapse
- gym succeeds when scheduled before going home
- work frequently ends 45 minutes later than the stated shift
- two-hour focus blocks do not happen; 30-minute blocks do
- Saturday morning home tasks are highly reliable

This becomes the basis for suggestions.

A future suggestion should sound like:

> You've made this work most often when you go straight from work. Want to plan it that way again?

rather than:

> Experts recommend going to the gym after work.

---

## Suggestion standard

Plan suggestions should ideally contain:

1. resident-stated goal or priority
2. evidence from the resident's own life
3. realistic open space
4. limited/specific commitment
5. resident choice

Example:

> You said getting stronger matters to you. The two workouts that happened recently were both directly after work. Tuesday and Thursday are lighter this week. Want to try those two?

Do not silently add the suggestion to the Plan.

---

## Evidence rules

Preserve strict provenance.

A source only proves what it directly proves.

Examples:

- bank transaction does not prove why money was spent
- screen time does not prove time was wasted
- silence does not prove avoidance
- location does not automatically prove purpose
- a planned block does not prove it happened

Keep distinctions such as:

- resident-stated
- observed
- estimated
- inferred
- proposed
- confirmed

---

## The learning loop

Current product synthesis:

**PLAN → LIVE → REVIEW → LEARN → PLAN AGAIN**

When a pattern becomes meaningful, Universe City can:

- keep the Plan
- adjust tomorrow's Plan
- update the recurring Schedule
- propose a test/challenge
- stop asking about a stable behavior
- hand off a question to another folder/Desk when appropriate

---

## Example daily record

This is illustrative, not final schema.

```
OCT 09 · PLAN

Planned
✓ Work · arrive 8:30
~ Leave work · planned 5:00 / actual 5:42
✕ Groceries · did not happen
✓ Evening open

Added
+ Call from sister · 6:15–6:50

Day
Mostly went as planned

Learned
After-work errand was displaced when work ran late.

Tomorrow
Move groceries to 10:00 AM.
```

---

## What Time should not become

- a productivity score
- a punishment system
- a generic habit tracker
- an empty calendar the resident has to build
- a fixed questionnaire
- constant notifications
- a moral judgment about leisure
- a system that assumes every deviation should be corrected

---

## Open work

See `../OPEN_QUESTIONS.md` for unresolved mechanics, especially:

- Plan item schema
- outcome states
- evening/morning cadence
- Schedule promotion rules
- resident-facing planning categories
- active follow-up rules
- definition of configured/current


---

## First Plan onboarding

**LOCKED direction**

The first Time experience should coach a believable Plan rather than ask the resident to dump an ideal schedule.

Initial sequence:

1. What already has to happen tomorrow?
2. Is there one thing you want tomorrow to be different from usual?
3. How realistic does this Plan feel?
4. How should Universe City follow up?
5. When should Universe City itself be part of the Plan for Daily Close?

The first Plan should include a scheduled Universe City touchpoint so engagement time is not treated as something the resident must simply remember.

A resident who says the Plan feels ambitious or unlikely should be invited to simplify or move something before saving it.
