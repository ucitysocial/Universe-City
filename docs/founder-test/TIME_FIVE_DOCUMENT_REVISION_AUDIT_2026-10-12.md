# Folder 01 Time — Five-Document Revision Audit

**Audit date:** October 12, 2026  
**Type:** Documentary and deployed-source reconciliation, **not** a sixth governing Time document.  
**Status:** Proposed corrections and verified source findings. No production changes.  
**Change authority:** The founder's requirements are documented in FT-010, FT-014 and FT-015; unresolved implementation details are **not** unilaterally approved by this audit.  
**Canonical document set:** `docs/systems/TIME.md`, `TIME_OPERATIONS.md`, `TIME_DEVELOPMENTS.md`, `TIME_CURRICULUM.md`, `TIME_RESEARCH.md`.  
**Related tracking:** [Founder Test master #21](https://github.com/ucitysocial/Universe-City/issues/21); [visual calendar #29](https://github.com/ucitysocial/Universe-City/issues/29); [sleep/routine intake #35](https://github.com/ucitysocial/Universe-City/issues/35); [expandable in-block steps #36](https://github.com/ucitysocial/Universe-City/issues/36); [conversation fixes PR #33](https://github.com/ucitysocial/Universe-City/pull/33).

## 1. How revisions are already governed

**The permanent dated revision history is `TIME_DEVELOPMENTS.md`.** Its sections 2, 3, 4 and 5 distinguish changes, discovered errors, unresolved matters and ideas. History is appended; prior entries are not silently deleted. The Founder Test Log documents screenshots, exported behaviors, acceptance/retesting and UX feedback. `docs/DECISIONS.md` holds product decisions safe to build against. Git history/PRs show the actual files modified and tested code.

**Proposed workflow:** (1) audit and crosswalk; (2) founder direction vs open design choices; (3) revise governing Time and Operations; (4) revise Curriculum using the *same approved teaching and twelve-question architecture*; (5) add a dated Developments entry describing exact clauses and code version; (6) append Research only when genuinely necessary and supported; (7) regenerate `lib/pilot/time-docs.ts` with `npm run pilot:docs`; (8) run all tests, review preview, and merge deliberately. Do not silently edit generated `time-docs.ts` itself.

## 2. What was actually compared

### Published deployed source

- **Resident Portal / Founder Test:** Netlify project `universecitystage`, **ready** production deployment [6acc7ad31787e000080ba69c](https://app.netlify.com/projects/universecitystage/deploys/6acc7ad31787e000080ba69c), published October 12, 2026, approximately 06:15 UTC. Reports GitHub commit [0404abe457486bfd88e23474a3beaf302419d869](https://github.com/ucitysocial/Universe-City/commit/0404abe457486bfd88e23474a3beaf302419d869), `main`, for the Next application.
- **Public marketing site `ucitysocial.com`:** a different Netlify project with a ready deployment [6acc65db98a6ce0008decaed](https://app.netlify.com/projects/gregarious-marshmallow-e2adf6/deploys/6acc65db98a6ce0008decaed), published October 12 around 04:46 UTC from [8e705971962559d905b684c3eff5a2de93855c03](https://github.com/ucitysocial/Universe-City/commit/8e705971962559d905b684c3eff5a2de93855c03). **Do not confuse its production deploy with the actual portal build.**
- The audit read the portal commit's source on `main`, the five Time docs, existing prompt/tool code, file/calendar components, the SQL schema, and the Founder Test findings. It did **not** log into the founder's account, examine actual private resident records, execute the application with the live model, or validate that every data path works after deployment. **Present in deployed source** is not the same as **tested end-to-end**.

### Two coexisting Time implementations

| Layer | Actual source | Current finding |
| --- | --- | --- |
| Older resident Time | `supabase/migrations/0001_init.sql`; `lib/domain/time.ts`; `app/(resident)/portal/time/page.tsx` | Uses public `blocks` and `block_revisions`; includes eleven categories and a numerical block/week summary. A genuine older implementation, not the basis of the new interactive founder File calendar. |
| Founder Portal Time | `supabase/pilot/0001_founder_test.sql`; `lib/pilot/tools.ts`, `browse.ts`, `calendar.ts`; `app/(pilot)/portal/file/[[...path]]/page.tsx` | Uses separate `uc_pilot` schema with `schedule_items`, `commitments`, `plans`, `pending`, `follow_ups`, `work`, `statements`, `actions`, `revisions`. Code for calendar day/week/month, record detail, editing and history is deployed; overall correct behavior still needs interactive tests. |
| Model behavior | `lib/pilot/prompt.ts`, `tools.ts`, `turn.ts`, `guard.ts` | Conversation purpose/filing and tools are separately implemented; not every governing Curriculum passage is included in the always-present prompt. The model can use `read_time_document`, whose generated texts come from the five GitHub documents. |
| Calendar presentation | `lib/pilot/calendar.ts` and `app/(pilot)/portal/file/[[...path]]/calendar.tsx` | Code renders day/week grids, month cells and date-linked entries. With known start but no end it **draws a one-hour visual placeholder with an open bottom**, not a confirmed one-hour duration; verify that text/interaction cannot mislead. Overnight rendering and edge cases remain test subjects. |
| In-block step execution | Search of pilot schema, tools and calendar/entry code | **No deployed persisted child-step/checklist model or Start/Next/Pause/Resume action contract found.** Existing records hold completion criteria and ongoing work, but neither substitutes for step progress inside one parent block. |

**Key finding:** The Operations statement that commitments, follow-ups and ongoing work are "not built" is **stale if read as describing the founder portal**; the respective `uc_pilot` tables and tool actions exist. Some Operations statements were written for the older `blocks` implementation and remain historically accurate for that code path. The correction must **identify the implementation being described**, not erase one of the two models.

## 3. Founder decisions that must be carried through

### A. The calendar is Time's working system (FT-010)

Time delivers an immediately navigable Day / Week / Month calendar, which becomes populated as the guide learns obligations. Confirmed changes through conversation and edits through the UI affect the same canonical entry. Do not invent start, end or duration. Time must not stop at filing raw statements or numerical weekly totals. After Time intake, Plans, execution, Daily Close, review and follow-through all work from the schedule.

**Already expressed:** `TIME.md` 2.4.1, 2.9, 9.3, 11.2–11.4.2; Founder Test #29.  
**Gap:** `TIME.md` 14.2–14.4 and `TIME_OPERATIONS.md` 4.1–4.14 still describe October 11 build status and leave several details unverified. Update as a **new dated implementation inventory**, preserving the old inventory as historical.

### B. Establish the daily essentials, not just external appointments (FT-014)

The intake should establish fixed work/other commitments when appropriate, **then proactively ask** about planned sleep and wake times, eating, and resident-selected morning/night routines, before treating the baseline week as understood. Questions are contextual and one at a time; it is **not** an eleven-category questionnaire. Different shifts, nights, days off, and sleep across midnight must be accommodated. Distinguish intended sleep, going to bed, getting ready for bed, waking, estimated patterns, and observed outcomes. Do not assign universal bedtime, hygiene frequency, meal times or duration.

**Gap:** `TIME_CURRICULUM.md` 18.7.3 currently asks about sleep only after a reported conflict or resident mention. `lib/pilot/prompt.ts` describes question order in terms of recurring work, fixed days, empty dates and missing appointment times; it does not express foundational sleep/wake/meal/routine intake as an early priority. `TIME_OPERATIONS.md` contains old `sleep` and `getting ready` block kinds but no approved routine-template/exception behavior on `uc_pilot`.

### C. Optional steps and guided progress within **any** block (FT-015)

A calendar commitment is the scheduled **container**; the smaller actions needed to start and carry it out may be contained **inside it**. On demand, or when the resident requests help or repeatedly struggles to start, the guide offers to turn a vague task into an ordered, small actionable sequence. The resident can start, finish or skip the current step, go next, pause, resume and see real progress. This applies to cleaning, long work shifts, studying, meal preparation, bedtime/wake routines and other scheduled work. Most residents need no required checklist for every block.

**Critical semantic separation:** A checklist step is not automatically another commitment on the calendar; an independently timed or consequential activity may be a separate linked commitment **if authorized**. Ongoing work contains linked commitments and follow-ups and should not be redefined as a step list. One checked step never by itself confirms completion of the whole commitment; likewise elapsed time is neither step execution nor a failed commitment. The parent commitment's own Completion condition and outcome remain authoritative. Distinguish the duration budget of a block from real time spent on its steps; a step needs no invented minute estimate.

**Gap:** `TIME.md` 3.1 recognizes only blocks, commitments, follow ups and ongoing work; 3.3 sets parent outcome rules, and 3.5 defines larger ongoing work but neither gives a persisted child-step contract. `uc_pilot` schema has no step table or equivalent in current calendar/entry/actions. `TIME_OPERATIONS.md` lacks order, progress, status, attribution, authorization, corrections, reusing a routine template, or resume mechanics.

### D. One next useful action, not punishment or disengagement

A resident reporting they feel overwhelmed by an existing block should get an actionable next step **without having to invent the breakdown themselves**. Keep the larger Plan on file and restore overview on request; don't auto-cancel/postpone, as though lack of motivation were withdrawal. Support can be progressively offered from explicit request, resident-stated preferences or documented repeat difficulties; do **not** silently diagnose the person or compel a task flow. The resident controls pace and changes.

**Existing partial support:** `TIME_CURRICULUM.md` 4.15 says recommend one step when the client cannot start but also says to **put the whole Plan aside until requested**. `TIME.md` 5.9 and pilot prompt require purposeful, resident-directed questions. PR #33 proposes a behavioral improvement, but is separate from the persistent UI/data structure.

## 4. Five-document change matrix

| Authoritative document | Findings | Proposed changes | Constraint |
| --- | --- | --- | --- |
| **1. TIME.md**, Version 4.1 | The calendar as system is already defined, but execution substeps, progressive optional Guided Life mode, and essentials as a baseline are not specified. Build inventory is older than the published founder code. | New version after founder review: expand 2.4/3.3/3.5/5.3/5.9/9.3/11.2–11.4 for baseline intake, parent-versus-step semantics, real progress, the resident choosing support, and reusing step sequences. Distinguish completion from progress; update dated build-status sections 14.* for old vs founder implementation. | Do not change the definition of successful execution, Plan confirmation, who approves, or client autonomy by accident. Do not add step as a separate fifth folder entry without deciding its authority. |
| **2. TIME_OPERATIONS.md**, Version 1.1 | Describes old public `blocks` mechanics while reporting pilot commitments/work not built; calendar read contract defined but no child-step one. | Reconcile **legacy vs `uc_pilot`** schema with a precise status table. Define child-step schema/relationship, ordered actions, progress and pause/resume, source and edit history, recurrence templates/exceptions, permissions/rollback, direct UI and agent actions, mobile support, tests. Revisit unknown-time/overnight rendering. | Do not add new tables or statuses solely from a screenshot. Authorize safe migration/permissions, data exposure boundaries and dual-code transition explicitly. |
| **3. TIME_DEVELOPMENTS.md**, Version 1.1 | Already serves as the correct append-only revision record, but the latest founder direction and portal implementation status have no dated entry in this file. It records earlier Curriculum/Research source-status changes. | Append dated **October 12** entries for FT-014/FT-015 and this audit; distinguish founder decisions, unresolved mechanics, code shipped, code pending, tests, and document versions. Mark historical open entries superseded *only when* actual implementation or later ruling resolves them. | Never erase or rewrite earlier dated history or mark code complete without retest. |
| **4. TIME_CURRICULUM.md**, Version 2 | Strong existing twelve-question and Schedule intake/teaching framework. Sleep asked only reactively; current 4.15 is not the desired experience of optional task breakdown *within* a block. Mentions "Steps" 19.21.2 without an implemented model. References missing Time clauses `3.3.21`, `5.11`, `5.12.13`, `5.13.4`. | Preserve twelve Start/Target options unless founder separately changes assessment. Revise 4.*, 18.5–18.7 and 19.* to teach assembling daily essentials, choosing support depth, preparing actionable steps, guiding Start/Next/Resume/Review, and interpreting progress separately from completed commitments. Correct or reinstate cross-reference clauses deliberately. | No generic questionnaire or moral judgment; no instruction that support lowers the resident's assessment. Curriculum lessons must not gate calendar usage. |
| **5. TIME_RESEARCH.md**, dated October 11 | Already discusses implementation planning, monitoring, reminders, repeat habits and use of support, with qualifications. Some cited findings are health-based and do not prove a particular app flow. | **No rewrite is needed merely because the founder approved a product feature.** Record an October 12 research question for task decomposition/guided execution, evidence scope and limitations. Append a dated evidence review *only after* verifying additional relevant studies. | Do not invent citations or claim evidence proves Start/Next UI, checklist progress %, optimal time blocks, or prescribed sleep/hygiene patterns. Preserve earlier research, including caveats. |

## 5. Concrete cross-document conflicts / hygiene findings

1. **Operations 2.2–2.4 vs pilot SQL:** commitment, follow-up and work tables exist in `uc_pilot` though Operations says "not built." Operations 2.5 also asks whether Plans have their own table; `uc_pilot.plans` exists with draft/confirmed, while the legacy `public.blocks` first Plan differs. This needs a dual-implementation statement and a chosen long-term canonical path.
2. **Time 14.3 vs deployed calendar:** `TIME.md` labels day, month and visual weekly view to build **as of Oct 11**. Published pilot source includes those React views. Leave the dated past account, then add a new dated status with exact code, tested/unverified labels; do not simply replace "not built" with "fully operational."
3. **Curriculum cross references are broken:** `TIME_CURRICULUM.md` 1.6, 4.15, 19.4 and 19.21.2 reference `TIME.md` clauses 5.11, 5.13.4, 5.12.13 and 3.3.21, which are not in current `TIME.md`. Resolve alongside Guided Life's true rules, not by making the links disappear.
4. **Guide runtime vs Curriculum:** `lib/pilot/prompt.ts` and `lib/pilot/tools.ts` require continuity and File accuracy but no persistent guided checklist contract. The model is told to read the Curriculum for Schedule intake, yet the explicit always-present schedule-priority prompt does not identify core daily essentials or guided execution as first-class. Reconcile without adding repetitive prompts on every turn.
5. **Calendar visualization with unknown end:** `lib/pilot/calendar.ts` lines 116–121 draws a one-hour open-ended placeholder for layout when a real end is unknown. The uncertainty state is preserved in the type and visible edge, but verify the display and selection never imply an actual one-hour duration and that interactions can't write the placeholder back as a time.
6. **Source-of-truth separation:** A scheduled shift can have a Time commitment linked to a Career Development Schedule source folder; these are one timed entry with department ownership, not a second appointment. Child steps should similarly stay linked to their parent and subject without duplicating every step across folders.
7. **Prompt/code fixes await rollout:** [PR #33](https://github.com/ucitysocial/Universe-City/pull/33) contains proposed clear-end and support changes that are **not in published prompt Version `founder-test-2026-10-12.9`**. Audit them on the PR branch and use preview/CI before folding into production. Do not mark those fixes shipped because tests on a branch passed.
8. **Automatic document bundle is a real build constraint:** `scripts/pilot-docs.mjs` assembles the five Time documents into `lib/pilot/time-docs.ts`. After any edit to any one of the five, run `npm run pilot:docs`, include generated file and run sync tests; otherwise the guide can read an outdated document at runtime despite GitHub displaying the newer text.

## 6. Implementation stages and definition of done

### P0 — Authoritative working model and behavior
- **Agree what a "step" means**: optional child task of an existing calendar commitment; not automatically an independent commitment, follow-up, or a definition of successful execution.
- Define what Start/Next/Done/Skip/Pause/Resume records, what the guide may propose, what the resident must decide, and how correction/undo and progress work.
- Reconcile the older `blocks` and current `uc_pilot` implementation and identify the canonical operational target **before changing schema**.
- Resolve sleep/wake and essential routines as explicit intake priorities while respecting varying schedules, resident choice, and an active task needing help.
- Align the prompt/action permission surface with these definitions; avoid silently writing inferred step completions.

### P1 — Operations and UI completion
- Implement source-linked, resident-authorized persisted child steps and progress under existing row-level access protections. Display inside selected Time blocks while using existing department/folder linking and preserving history.
- Allow selected residents to use single-step guided view or simple expanded checklist; do not force either workflow.
- Support reusable resident-chosen routine/work sequences and day-specific changes without unintended changes to every recurrence.
- Re-test day/week/month, overnight shifts, unknown ends, mobile interaction and progress after navigation/reload.

### P2 — Teaching, evidence and maintenance
- Revise teaching text for optional resident-chosen support, how to build the daily baseline, and what progress actually means.
- Repair broken clause references against the final Time spec and Language Standard.
- Append Developments decisions and actual deployment/test status, check existing Research evidence, regenerate and test the model's document bundle.

### Test scenarios required before changing live `main`

| Scenario | Expected result |
| --- | --- |
| Resident with irregular work shifts wants a usable week | Calendar is visible from Time intake; established fixed dates entered first as relevant, then sleep/wake, meals and chosen routines are proactively established through conversational follow ups. Nothing is invented to fill empty hours. |
| "Office cleanup" scheduled for an hour | Resident opens the block, optionally accepts/edits 4 small steps, presses Start, completes step 1, pauses. Returning later preserves 1/4 progress without marking whole commitment executed. |
| Resident cannot start a vague task | Guide offers an actual first action rather than postponing unrequested or abandoning the original work. No compulsory step-level time estimates. |
| Work shift with tasks | Open shift shows work-specific sequence in one block; only independently authorized, timed responsibilities become distinct linked calendar entries. |
| Nighttime routine and sleep | Routine steps remain inside their parent block; sleep period across midnight displays both dates accurately; differing work/night patterns do not overwrite the general schedule. |
| Timer reaches zero | No automatic claim that steps or parent commitment were executed or failed. Actual outcomes and completion criteria remain separate. |
| Same entry updated by chat and by UI | Source-linked change occurs once and appears everywhere; repeated confirmation is idempotent; unknown end and uncertainty remain honest. |
| Documentation changes ship | All 5 canonical docs, dated Developments log, generated `time-docs.ts` and relevant tests are consistent; GitHub and Netlify commit IDs match reviewed code. |

## 7. Decisions still required before writing the implementation specification

These are **unsettled choices**, not grounds for another round of abstract documents:

1. **Step state model:** Is "Skipped" a distinct final step state or a user-report flag? Define the difference between skipped, undone, and postponed; no automatic failure labels.
2. **Reusable templates:** Are resident-confirmed steps reused automatically on every recurrence, or offered by the guide for confirmation when context varies? Decide defaults and a one-day exception rule.
3. **Support adaptation:** When residents repeatedly delay a block, should the guide merely suggest a breakdown or may a standing preference enable automatic expansion? Preserve the resident's control and avoid unauthorized inference.
4. **Running time:** Should a Start button track elapsed task time, or just activate the first step? Tracking must be clearly distinguished from actual reported work and consented to.
5. **What ends guided mode:** A resident may pause/end guidance while the calendar commitment remains open; decide how context should be resumed later.

**Next document action:** After founder review, update `TIME.md` and `TIME_OPERATIONS.md` together, then `TIME_CURRICULUM.md`. Add corresponding dated entries to `TIME_DEVELOPMENTS.md`, and update `TIME_RESEARCH.md` only where supported. This audit belongs outside the five-document set and should be merged or filed only as a review artifact, not misrepresented as the new final specification.

## 8. Proposed visual treatment — daily essentials and usable time (founder feedback, October 12)

**Founder observation:** Sleep is a basic schedule anchor and should look distinct on the Time calendar, possibly black, an alternate restrained color, or a subtly slashed/hatched treatment. The goal is to see the day clearly: what time is already accounted for, and how much remains to be planned or protected. This is **a founder design direction and recommendation, not a finalized color/accessibility ruling**.

### Proposed semantics for review

- **Sleep / planned rest:** use Universe City's existing Ink `#140A0C` or secondary Ink `#241417` with readable paper-colored text and a small **Sleep** label/icon, independent of the department accent. It should read as a stable foundation on day and week grids. The existing palette is authoritative; **do not invent an unrelated brightly colored department** merely for sleep.
- **Pattern is a second channel of information:** The founder is open to diagonal hatching. In the deployed calendar, tentative time already uses a `rough` class and unknown ends use `open-end`. Avoid silently making hatch simultaneously mean both *sleep* and *tentative*. Prefer **solid dark sleep** plus a minimal label/icon, reserving dashed/hatched/gradient cues for **estimated/unconfirmed timing**, or propose two independently distinguishable patterns if the founder chooses hatching for sleep.
- **Routine / meals:** resident-selected blocks should be visibly separate from sleep (and from one another by label/icon when desired) but remain low-saturation, within the brand's paper/ink language. Do not use the four department colors as an invented universal fixed palette for sleep vs meals vs chores. A block's source-folder color still has a legitimate meaning, so distinguish *kind* from *department*.
- **Other obligations:** retain the department color accents for source-folder ownership; the existing execution/pending and uncertainty states retain clear, separately encoded labels/borders. Never infer that a color says the resident completed something.
- **Grid readability/accessibility:** treatment must work in day/week/month, high contrast and on mobile; meaningful text (Sleep, end unknown, planned, estimate) remains available when color/pattern are not perceived. Test low zoom, dark screen and print. Avoid dense patterns or heavy solid fills overwhelming a month view.
- **Overnight blocks:** sleep from one evening to the following morning should visibly occupy its appropriate portion of **both calendar dates** with correct local date and timezone interpretation; no truncation at midnight or double-counting.
- **Availability should be a derived view, not a new independently stored schedule:** First establish the resident's known sleep/wake anchors, essential routines and fixed obligations, then show remaining *unallocated* windows. Travel, preparation, transitions, other confirmed commitments and overlaps also matter. A blank hour is not automatically discretionary/free: use **Unscheduled / not yet accounted for** until the known constraints are sufficient. Don't infer freedom or mark an unconfirmed estimate as a firm unavailable block.
- **Optional quiet summary:** where enough information exists, show a restrained daily/weekly summary like “Planned / Unallocated / Unknown” or a similar small indicator. Never claim an exact number of “free hours” when time, overlaps, sleep, work or commitments remain unknown. The legacy controlled-time figure in Time 2.4.5 is based on **observed** time and **must not** be silently redefined as the complement of planned obligations.

### Acceptance for visual review

1. In a hypothetical schedule with a confirmed overnight sleep interval, a morning routine, eating and work, the dark sleep span is instantly recognizable; other events retain their identity and the calendar is not visually noisy.
2. Sleep respects true date/time crossings, daylight-saving behavior, edited exceptions, and recurring shifts.
3. A visual comparison of a confirmed sleep entry and a tentative sleep entry communicates category, provenance and uncertainty separately.
4. Time left over is described as **unallocated** unless enough data supports a stronger availability claim. Known overlapping blocks never produce negative or double-counted free time.
5. The founder reviews the design treatment in the actual preview; this document records the proposal, not approval of final styling.

### Five-document impact

- `TIME.md`: affirm daily anchors and accurate interpretation of remaining *unallocated* time, without changing observed-only controlled-time rules.
- `TIME_OPERATIONS.md`: block kind versus folder origin versus schedule status, accessible CSS/legend tokens, nightly cross-date rendering and a derived availability query/summary (if implemented).
- `TIME_DEVELOPMENTS.md`: append the October 12 design rationale and what the founder eventually selects as the canonical treatment.
- `TIME_CURRICULUM.md`: explain how the guide helps the resident see and plan around sleep/wake, meals and chosen routines before allocating remaining time; do not impose a universal daily schedule.
- `TIME_RESEARCH.md`: no new evidence claim required to choose visual colors/patterns. If an availability or sleep-related behavioral claim is later proposed, separately verify the research.

**Related:** [#35 — Sleep and daily routines](https://github.com/ucitysocial/Universe-City/issues/35), [#29 — Visual calendar](https://github.com/ucitysocial/Universe-City/issues/29), [#36 — In-block guided steps](https://github.com/ucitysocial/Universe-City/issues/36).

## 9. Conversation economy and a history of postponed work (FT-017)

**Founder screenshot, October 12:** One reschedule resulted in both an extensive conversational recap and an UPDATE status containing the same information, followed by an unrelated sleep question. The resident explicitly finds this overwhelming. The model needs to keep the response focused on the resident's current act and reserve full history for the File.

**Source inventory:**
- `lib/pilot/tools.ts` `change_commitment` returns both `detail` and `brief`. The latter currently contains the new date/time and optional previous values. `lib/pilot/turn.ts` `briefOf` exposes these short effects under the reply.
- `lib/pilot/prompt.ts` asks for short replies but also strongly directs the guide to end almost every ongoing-work exchange with a next question, which can create an unrelated intake pivot after an isolated rescheduling. Clarify when no question is warranted. Don't silence genuinely necessary approval/conflict decisions.
- `uc_pilot.revisions` can identify successive forward schedule changes for the same commitment ID with date/start before and after, without a separate "avoidance" label or inferred failure. Track only real changes; don't count no-ops, changed end only, edits that move earlier, declined proposals, or changes to other tasks.
- `TIME.md` 7.14 and 7.15 address some repeated timing changes in other situations, but **do not directly establish** a proactive support trigger for multiple deliberate postponements. Its ordinary execution/outcome fields must stay separate from a planned timing history.
- `TIME_DEVELOPMENTS.md` 5.2 and 5.7 contain older unapproved ideas about task difficulty and outcome patterns; founder FT-017 supplies the direction to support a resident after real repeated deferrals without treating those older drafts as approved in full.

**Resident-facing acceptance:** One short, trustworthy UPDATE line is enough after an uncomplicated time change. A guide may give one relevant human response, but should not echo the same before/after, self-correct at length, or jump to an unrelated sleep/wake intake question. When repeated postponements of the **same** commitment have been objectively established, consider an optional small first step already on file; do not infer psychological cause or nag. Do not claim the four referenced office-cleaning steps have a persisted `uc_pilot` checklist until step storage is actually verified.

**Five-document revisions:** Time (selective agent follow-up for repeated postponements), Operations (derivation from revisions and threshold/eligibility/permission contract), Developments (dated founder observation, correction and tests), Curriculum (how support and task decomposition help without blame, while not lowering ability assessment), Research (do not assert a study validates rescheduling count thresholds or the specific UI). This belongs with [FT-017](https://github.com/ucitysocial/Universe-City/blob/main/docs/founder-test/FOUNDER_TEST_LOG.md#ft-017--one-line-rescheduling-and-awareness-of-repeated-postponements) and [issue #38](https://github.com/ucitysocial/Universe-City/issues/38); **no behavior shipped in this audit**.
