# Founder Design Session — Guided Life, Time and Agent Portal
**Date:** October 12, 2026  
**Status:** Working design record for later founder/Claude review, **not a sixth canonical Time document**, not a deployment instruction, and not a declaration of feature completion.  
**Source:** Founder’s October 12 product-design conversation, recent Founder Test observations, and linked GitHub issues/PRs. This records decisions separately from suggestions and open questions.  
**Privacy:** Examples are illustrative. Raw Founder Test messages, screenshots, credentials and personal records are not reproduced in this public repo.

## 0. Read this first — the core product model

> **Time** creates and maintains the resident's real calendar and planned commitments. **A commitment** establishes what must happen and what counts as complete. **A task sequence** organizes the smaller actions involved. **Guided Life** is the resident-selectable execution experience that helps discover, prepare, understand and perform those actions — with as much or as little help as the resident needs.

The resident may already know *what* to do but not *how to start*, or may not yet understand the full scope of a task. The guide's job is not to demand a fully formed checklist. It helps make the work intelligible without pretending to know the resident's actual responsibilities.

**A commitment can be scheduled before its task sequence is fully understood.** Do not gate a usable calendar on completing a detailed task interview. Conversely, merely creating a calendar entry is not the whole Time service where the resident needs execution assistance.

Use this document as a **decision/change-capture sheet**. Before implementing, reconcile it against the current canonical Time, Operations, Developments, Curriculum, Research, Language Standard, permissions and deployed code.

## 1. Status vocabulary

- **FOUNDER-DECIDED:** Explicit preference/ruling in the session; implement subject to existing authority/privacy rules and detailed technical acceptance.
- **FOUNDER-DIRECTION:** Desired experience clear, precise interaction/technical mechanics still require review.
- **PROPOSED:** Assistant design proposal that the founder found useful or has not expressly approved in full.
- **OPEN:** Needs a specific founder decision.
- **CODE STATE:** Refer to PR/issue and current repo tests; do not infer shipped behavior from a design mockup.

## 2. Decisions: schedule, daily foundations, and what remains available

**FOUNDER-DECIDED — calendar first.** The actual Day/Week/Month calendar is Time's working system. The agent builds it from the File and natural conversation; resident-editable blocks and agent updates operate on the *same* source-linked records. The resident should not have to fill an empty grid. Schedule visibility starts during Time intake.

**FOUNDER-DECIDED — basic daily anchors.** Establish actual fixed obligations as applicable, then proactively discover planned sleep and waking, eating, morning/night routines and resident-selected personal care. These are foundational commitments, not incidental facts. Their timing may differ by shift, day and night; never assume a weekday/9–5 pattern or assign universal habits. A bedtime routine, time reserved for sleep and morning routine are distinct activities.

**FOUNDER-DIRECTION — understated calendar meaning.** Sleep must be visually distinct, likely using existing near-black Universe City Ink with a clear label/icon. Other routine blocks should be muted, not another batch of bright competing departmental colors. Preserve a separate visual encoding for time uncertainty; avoid a hatch pattern simultaneously meaning “sleep” and “tentative.” View remains accessible without color. Crossing midnight must be represented correctly.

**FOUNDER-DECIDED — the point is to see what time is left.** Sleep, meals, routines, work and appointments occupy the grid so the resident can understand the remaining *unallocated* time. Unallocated does **not** automatically mean genuinely free: missing commute/preparation/unknown obligations matter. Avoid pretending to calculate exact free time when the inputs are incomplete.

**FOUNDER-DECIDED — unresolved actionable work persists.** When a flexible commitment has not been reported complete, its *open work* should carry forward into subsequent days without deleting its historical origin. It must stay visible until completed, revised or deliberately withdrawn. If tomorrow is crowded, display the conflict; do not automatically move unrelated commitments. Do not fabricate a tomorrow start time, a missed outcome, or a fictitious rescheduling of a third-party appointment/shift. Recurring sleep/routine instances cannot generate an infinite pile of previous-day copies. See [#40](https://github.com/ucitysocial/Universe-City/issues/40).

**FOUNDER-DECIDED — second intentional postponement support.** After **two genuine resident-initiated forward postponements of the same commitment**, offer gentle, optional step-by-step help even if the resident has not expressly admitted struggling. A system-generated daily carry-forward is **not** one of the two postponed actions. A correction, no-op, earlier move, changed end-time, rejected proposal or move of a different commitment is not a qualifying postponement. Do not assume laziness, pathology or failed execution. See [#38](https://github.com/ucitysocial/Universe-City/issues/38).

## 3. The meaning of Guided Life — applies to ANY scheduled block

**FOUNDER-DECIDED.** Expandable steps are *not* exclusive to morning/night routines. They should be available for cleaning, work shifts, studying, research, project planning, commuting preparation and other complex or unfamiliar commitments.

Distinguish the objects:
1. **Time calendar block:** planned date/time, confidence, relevant File source/owner.
2. **Parent commitment:** what is agreed and its independent completion condition/outcome.
3. **Optional ordered task sequence:** the concrete actions that make carrying it out possible.
4. **Guided Life session:** the resident's active execution through those steps.
5. **Ongoing work:** a different, larger existing Time object that may contain several independent commitments and follow-ups. Do **not** equate this automatically with a checklist.

Do not turn every checklist item into a separate calendar commitment or demand an individual approval for brushing teeth, carrying out a morning routine, or each mail-sorting action. A truly independently timed or consequential step may become a separate linked commitment **when appropriately authorized**.

**FOUNDER-DIRECTION — levels of support.**
- **Simple:** resident sees the block and works independently.
- **Structured:** resident opens it to see and optionally edit/check an ordered sequence.
- **Guided:** resident chooses one action at a time and can start, mark done/next, pause, resume, skip, re-order, add a step, or ask for help; see actual reported progress.
- The mode is optional, not a universal forced workflow and not a separate department or standalone parallel calendar.

**FOUNDER-DECIDED — execution truth.** Step progress is based on resident action or explicit reporting; elapsed time alone does not prove work occurred. A countdown reaching zero or checking the last step must **not** automatically mark the parent commitment executed, successful or consequentially complete. Preserve original completion condition, actual outcome, source and history. Step count is progress in the sequence, not an assessment score or grade.

**FOUNDER-DIRECTION — context switching.** While a resident is working on an active commitment, the guide should prioritize that work and the next relevant action. Do not respond to low motivation by unrequested cancellation/postponement. Do not instantly pivot from a step in progress into sleep/weekly intake because the wider schedule is incomplete. The resident may pause, change course or request help without losing the original Plan.

## 4. How the guide DISCOVERS the task sequence (central new model)

**FOUNDER-DECIDED — curiosity before assumption.** Ask *what usually happens* during a commitment and what the resident actually does. A high-level task name or job title is not enough to invent a full work procedure.

**FOUNDER-DIRECTION — flexible task discovery flow:**
1. **Hear the commitment.** Establish essential when/what/outcome information and place it on the calendar if ready. A broad title like “Work shift,” “Clean office” or “Study for exam” may be enough to reserve time but not to understand execution.
2. **Ask one purposeful context question.** Example: “What do you usually work on during that shift?” or “What parts of cleaning the office need to happen?” Do not bombard the resident with ten questions.
3. **Accept the depth provided.** If the resident details the workflow, organize those exact facts. If the answer is broad (“administrative work”), ask one useful narrowing question. No need to interrogate someone about a trivial/familiar task.
4. **Prepare a lightweight evolving draft.** It may contain a few known actions, grouped tasks, missing information and carefully labeled *suggested* possibilities. A draft is **a working understanding**, not an invented confirmed step sequence. The guide can use it to decide what to ask next.
5. **Refine as the resident works.** Actual order, blockers, interruptions, discovered dependencies, new instructions and reported outcomes improve the reusable procedure over time.
6. **Keep details out of the main chat.** The chat should briefly indicate that a task plan is prepared/needs review; the organized steps, context and progress live **inside the commitment** and open in the central working pane.

**What not to do:** Never presume what a resident's employer requires from their job title, infer company-specific procedures, claim a task was completed from a timer, or demand the resident write the entire sequence before the agent helps.

**Example — broad office work:** The guide knows the resident works an eight-hour shift. It asks about usual activities. The resident may confirm processing mail and maintaining the office kitchen. Those become *resident-confirmed* task groups. Possible additional duties from general administrative job descriptions are *research-informed questions*, not filed responsibilities.

**Example — overwhelming cleanup:** “Clean office” can become “remove office trash” as the first achievable action, followed by resident-approved further steps. The first actionable step can be useful even while the rest of the plan is being developed.

**Example — study/research/planning:** The agent often needs to help formulate the objective, material, method and stopping point. Subsequent steps may be discovered during work; not every Guided Life sequence is fixed on day one.

**Example — commute:** A preparation/arrival sequence may be useful, but guidance during driving should minimize interaction and avoid unnecessary prompts.

## 5. Sources and research — curiosity backed by honest provenance

**FOUNDER-DIRECTION:** The agent may use general knowledge, role descriptions, occupational research, manuals and comparable job postings to understand a type of work and ask informed questions. This is especially useful when the resident cannot initially explain every responsibility.

Always keep source categories separate:
- **Resident-established:** “I actually do this.” Suitable to build a confirmed task plan subject to the normal File/approval contract.
- **Agent-proposed:** plausible steps derived from the resident's goal but not yet verified.
- **Research-informed:** publicly described duties/instructions/approaches that *might* apply; never automatically recorded as that person's work.
- **Employer or organization SOP:** where provided and current, authoritative for that environment over a generic job advertisement; still respect permissions and ambiguity.

**OPEN — research initiative.** Founder is considering allowing the guide to proactively **offer** job/role research. Whether the agent autonomously researches silently, requests explicit permission every time, or uses a standing research preference has **not** been decided. Do not quietly treat a research offer as an authorization to fetch or file personal/company information.

**FOUNDER-DIRECTION:** The guide uses outside knowledge to ask better questions and propose a draft; confirmation remains necessary before a possible duty becomes “what this resident does.” Organizational safety/security steps should not be improvised.

## 6. Resident-facing design: conversations stay clean; Guided Life holds depth

**FOUNDER-DECIDED:** The main Conversation is an ongoing purpose-driven thread, not a wall of tool history or an expanding checklist. Detailed work appears in the selected commitment/Guided Life pane. The File is the authoritative memory and revision history.

For a successful straightforward schedule update, one compact **UPDATED** action status is sufficient; do not echo the old and new times in the model reply, review a previous mistake in multiple sentences, or jump into unrelated intake. A relevant question is warranted when it truly advances the current objective.

**PROPOSED interaction hierarchy:**
- A schedule block displays its title, planned timing, truth/confidence, and optional discreet progress.
- Selecting it opens **commitment details**, including source, approved completion condition, unfinished questions and a compact optional task plan.
- **Start Guided Life** opens the larger in-commitment execution pane with one current action, visible ordered steps, progress, and pause/resume/modify controls.
- The guide may propose new steps inline for review; drafts and unknowns are visually distinguished from confirmed instructions.
- Resident controls whether to work from a simple list or active guided mode. Restoring main Conversation never loses the active step.

**OPEN — exact entry flow.** Founder was asked whether selecting a calendar block should enter Guided Life immediately or first show details with a “Start Guided Life” option. The *details first* approach was proposed, not expressly decided.

**Style direction already liked:** Compact rectangular status/commitment cards and restrained progress/checklist panels, using Universe City Ink/Paper/dept accents and its typography. Keep the day grid uncluttered; the sequence belongs inside the block's expanded view, not as separate micro-events everywhere.

## 7. Agent Portal — same real data, different work and authority

**FOUNDER-DECIDED:** Build an Agent Portal that **matches the current Resident Portal closely** and is ultimately synchronized to the founder's actual test account. The standalone interactive HTML prototype is a **visual/interaction reference**, not a working Supabase-connected portal. Founder likes some design choices but expects Claude to rebuild against existing React components and refine together.

**Core invariant:** There is one source-linked File, one Time calendar, one conversation record/history, one set of commitments and steps. Agent and resident surfaces read those same facts, not separate copied databases.

**Agent-specific work to develop:**
- Navigate authorized residents' Files and their 48-folder structure; decide roster/assignment flow.
- Review actual **agent-owned follow-ups** in an inbox, including source, unread/read, status and what action is needed. Reading does not silently resolve them.
- See active commitments, Guided Life sequence/progress, pending decisions, conflicts and history.
- Propose/perform only appropriately authorized changes, with provenance, accountability, and resident approvals where required.
- Maintain faded schedule ideas and guidance without editing source code for every wording change. These are suggestions, not commitments. Global program library vs resident-specific overrides was discussed; default for all residents is **not yet approved**.
- Preserve a separate internal agent note channel if needed; do not conflate it with resident messages without founder decision.

**Known source finding:** Existing resident faded suggestions were six code-defined prompts. [Draft PR #41](https://github.com/ucitysocial/Universe-City/pull/41) is a **limited suggestion-editing Agent Studio**, not the full authorized agent portal; it has not been merged as of this record. The older /agent page is a separate implementation. Claude should not blindly copy that model over the founder pilot.

**Founder Test observation:** Agent-directed follow-ups existed but there was no visible, verified human-agent inbox/read receipt. Steps inside a multi-step shift were squeezed into a bounded completion text field rather than persistent child steps. Address actual record integration and the step model before merely adding sample cards.

**OPEN:** Resident selection/assignment, which agent edits can execute versus only propose, program vs resident suggestion library, private agent notes, handoff/notification/read statuses, and how founder-only access expands to other human agents.

## 8. Persistence, authority and “what the system knows”

**FOUNDER-DIRECTION — target data contract:**
- Preserve parent commitment ID, time, planned/actual outcome, completion condition, original File source, revisions, owner/dept links.
- Separate ordered execution steps with their own identity, sequence, optional instructions/support content, source type, proposal/confirmation state, status and history.
- Preserve the current step, explicit done/skip/pause/resume changes and revision provenance across chats, devices and calendar days.
- Offer reusable resident-confirmed routine/work procedure templates and day-specific exceptions, without silently overwriting previous occurrences.
- Model the distinction between a task's documented procedure, a proposed procedure, an active execution run and an independently scheduled next commitment.
- Keep agent edits in an auditable permissioned pathway; ghost-suggestion editing is categorically different from moving a resident commitment.
- Don't conflate reschedule history with “failure.” Automatic unfinished-work carry-forward is also not evidence of a deliberate resident postponement.

**CODE STATE:** The deployed founder pilot has source-linked commitments, revisions and visual calendar code, but the [#36](https://github.com/ucitysocial/Universe-City/issues/36) persistent ordered child-step workflow was not verified as delivered during this discussion. Do not treat the standalone HTML demo's checked boxes as real product functionality.

## 9. Specific open product decisions to workshop with Claude

These are genuine open choices; avoid inventing approvals:
1. **Draft trigger:** Does every apparently multi-action commitment quietly get an initial task draft, or only when resident complexity/preferences suggest benefit? How much is okay to propose before asking?
2. **Question economy:** When to ask “What usually happens?” vs “Does this have multiple steps?” vs narrow follow-ups, without making Time intake an interview.
3. **Research opt-in:** When may the agent search public roles/resources, how does it label results, what is the default when employer-specific SOPs are unavailable?
4. **Review/entry:** Click block → details first or immediate Guided Life; resident start button, default panel sizing and mobile design.
5. **Persistent step schema:** Draft vs approved vs done/skipped/blocked/deferred, who can edit, what counts as progress, how to undo or reorder.
6. **Autogenerated templates:** Standard/resident-owned sequences and when recurrent tasks reuse old steps versus ask for review.
7. **Tracking time:** Does Start simply activate a step, run an optional timer, or capture self-reported actual duration? Don't mistake timer data for observed execution.
8. **Guidance adaptation:** How to respect a resident who wants no prompts, while honoring the **approved second manual postponement** gentle offer.
9. **Agent access:** Client roster and assignments; global vs resident-specific faded suggestion defaults; approval/read receipts/private agent notes.
10. **Complex/outside-world work:** How Guided Life handles deadlines, dependencies, interruptions, unknown workplace procedure, commutes/driving, study and open-ended research.

## 10. Five canonical Time documents — revision impact

| Governing source | Needs to absorb after founder review |
| --- | --- |
| [TIME.md](../systems/TIME.md) | Define Guided Life as optional execution **inside** a commitment; calendar-first intake, anchors, parent vs steps, plan/outcome separation, repeated postponement and carry-forward truth. |
| [TIME_OPERATIONS.md](../systems/TIME_OPERATIONS.md) | Persisted step/proposal/status model; transitions and read queries; per-resident agent rights; recurrence; timezone/overnight; carry-forward and idempotency; UI actions and tests. |
| [TIME_DEVELOPMENTS.md](../systems/TIME_DEVELOPMENTS.md) | Dated founder rulings and actual implementation versions; preserve old entries; record unresolved design decisions and corrections. |
| [TIME_CURRICULUM.md](../systems/TIME_CURRICULUM.md) | The guide's curiosity questions, learning from work, tiered guidance, productive step-by-step support, daily essentials and task research boundaries; retain approved assessment structure. |
| [TIME_RESEARCH.md](../systems/TIME_RESEARCH.md) | Clearly separate founder product decisions from verified studies; only append evidence when actually checked. Do not claim research proves a particular UI, timer, sleep schedule or second-postponement threshold. |

**Also affected:** Resident Interface/Agent Portal architecture, authenticated multi-resident access, Language Standard, prompt/tool implementations, guide source prompts, tests and change log. The prior [five-document comparison PR #37](https://github.com/ucitysocial/Universe-City/pull/37) maps October 12 gaps and remains a *draft audit*, not a completed governing-document revision.

**Important generated-doc dependency:** after changes to the five Time files, regenerate the pilot's built-in Time document bundle via the repository's documented build command, check alignment and re-run tests before deployment.

## 11. Implementation sequencing proposed for later Claude review

**Phase A — model and screen interaction.** Confirm parent commitment → optional proposed steps → approved ordered steps → guided session and outcome semantics. Design a simple resident-first block detail and Guided Life pane. Keep current main chat quiet.

**Phase B — safe shared data and permissions.** Add source-linked persistent child steps and action history/authorization; expose the same records in agent and resident portals, without cloning resident files. Preserve open unknowns and never auto-file execution.

**Phase C — behavior and adaptation.** Make the guide curious; collect actual process, propose lightly, label research/suggestions honestly, support residents struggling to begin, and persist progress. Add second postponement support and safe unfinished-work carry-forward under their separate issues.

**Phase D — product validation and docs.** Demonstrate with synthetic routines, housework, an unfamiliar office role, an eight-hour shift, a commute and a study/research block; check chat noise, unknowns, conflict, sleep baseline, cross-midnight, mobile, partial progress, two manual postponements and agent inbox visibility. Then align the five Time documents and generate runtime doc bundle.

## 12. Acceptance scenarios to preserve

1. **High-level job title:** A resident says “I do administrative work.” Guide does not invent duties; asks what usually happens, organizes confirmed duties, offers optional research-informed possibilities *as questions*, and saves only authorized work tasks.
2. **Detailed worker:** Resident describes their shift in depth. Guide efficiently organizes tasks without redundant interrogation, and makes the work view accessible without flooding chat.
3. **Vague cleanup:** Block exists. Resident is overwhelmed. Guide offers one small actionable starting step and optional checklist. Start, pause, resume and progress are preserved; parent success is not auto-claimed.
4. **Study/research:** Guide helps determine objective and a tentative process; updates steps based on discoveries rather than imposing a fixed template.
5. **Routine and commute:** Consistent morning/night steps can recur; steps reflect resident preferences, not standard moral expectations. Driving interaction is low-demand.
6. **Long work shift:** Shift calendar time remains one parent block unless an independently timed responsibility is authorized. Guided Life shows tasks, actual current action, possible interruptions and follow-through.
7. **Agent sync:** Agent opens the same resident File and current shift, sees real steps/proposals and an actual assigned follow-up; no sample data, unauthorized impersonation or phantom read receipt.
8. **Two postponements and rollover:** Distinct resident-initiated forward moves trigger an optional first-step suggestion; automatic daily carry-forward does not count. Old calendar history remains accurate and unresolved work remains visible.
9. **Minimal chat:** One concise system status and an actual next relevant question when needed; full task detail belongs in Guided Life, not an overlong explanation in Conversation.
10. **Sources:** A generic online job description is never silently filed as an employer-mandated task; a resident's confirmed details and any official SOP retain their source labels.

## 13. GitHub index and implementation status — verified October 12, 2026

- [Master Founder Test handoff #21](https://github.com/ucitysocial/Universe-City/issues/21) — shared issue index for Claude.
- [Calendar #29](https://github.com/ucitysocial/Universe-City/issues/29) — closed; independently verify current build behavior before inferring all related Time work complete.
- [Daily anchor intake #35](https://github.com/ucitysocial/Universe-City/issues/35) — open.
- [Guided task steps #36](https://github.com/ucitysocial/Universe-City/issues/36) — open.
- [Two genuine postponements #38](https://github.com/ucitysocial/Universe-City/issues/38) — open with founder-approved trigger.
- [Unfinished work next-day #40](https://github.com/ucitysocial/Universe-City/issues/40) — open.
- [Agent Portal / suggestions #42](https://github.com/ucitysocial/Universe-City/issues/42) — open, prototype integration direction captured.
- [Time documentation PR #31](https://github.com/ucitysocial/Universe-City/pull/31) — merged.
- [Open end-time / task support PR #33](https://github.com/ucitysocial/Universe-City/pull/33) — merged.
- [Five-document audit PR #37](https://github.com/ucitysocial/Universe-City/pull/37) — **open draft**, unmerged.
- [Concise calendar replies PR #39](https://github.com/ucitysocial/Universe-City/pull/39) — **merged** as of this record; verify live dialogue separately.
- [Agent suggestion Studio PR #41](https://github.com/ucitysocial/Universe-City/pull/41) — **open draft**, unmerged; not the full Agent Portal.
- [Founder Test Log](./FOUNDER_TEST_LOG.md) — evidence and decisions FT-001–FT-018.

## 14. Next Claude meeting — desired agenda

1. **Agree the four-part model**: Time/calendar → parent commitment → developing task plan → Guided Life execution.
2. **Review how the agent learns**, using both a detailed resident and one who knows only their role name. Demonstrate an actual curious question, plausible *draft* and proper uncertainty/source labels.
3. **Set boundaries**: when the guide proposes steps, when research is offered, what needs confirmation, how to avoid long main-chat messages.
4. **Choose one interaction flow** for opening a block, reviewing a proposed plan, starting, advancing, pausing and resuming on desktop/mobile.
5. **Identify current code vs work required** for persistent child steps, real agent inbox, next-day carry-forward, two-postponement assistance and synced File/Time views.
6. **Decide the open questions before altering authoritative docs**. Then revise the five documents deliberately, with Developments entries, runtime doc regeneration, checks and preview review.
7. **Do not rebuild the resident shell** or the legacy /agent dashboard from scratch; use the current Resident Portal components and the separate visual HTML as an interaction reference.

**Handoff reminder:** This is a durable capture of a fast-moving brainstorm. Preserve founder-approved behavior, preserve uncertainty around unapproved details, and keep prototypes/read-only drafts distinct from live implementation.
