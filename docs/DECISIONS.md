# Product Decisions

This file contains decisions that are safe to build against.

Do not add an item here merely because it was discussed. If a decision is intentionally reopened, mark it **REOPENED** rather than silently deleting history.

---

## Core architecture

### D-001 — Keep all 48 folders

**Status:** LOCKED

Universe City has four departments with twelve folders each. All 48 remain in the canonical taxonomy.

Canonical implementation: `lib/domain/folders.ts`.

### D-002 — Foundation folders

**Status:** LOCKED as current product model

The four foundation folders are:

- Time
- Inventory
- Salary
- Standards

They are the current operational entry points; they are not the only systems.

### D-003 — Universe City owns system-building labor

**Status:** LOCKED

Universe City builds, configures, tests/challenges, updates, and maintains the systems.

The resident supplies the life/context and necessary approvals/corrections.

Do not phrase resident work as "build your Time System."

### D-004 — Conversation is not automatically the permanent record

**Status:** LOCKED

Preserve the repository rule:

- AI proposes interpreted information.
- Resident confirmation is required before interpreted information becomes canonical File data.
- Corrections preserve prior record versions.

### D-005 — File is the organized source of truth

**Status:** LOCKED

The resident's File is the durable organized record across the four departments / 48 folders.

The Resident Portal home may display information derived from it. Conversation may discuss it. Neither replaces it.

---

## Interface

### D-006 — Borrow YAPTAIN's organization, not its production OS

**Status:** LOCKED

The relevant YAPTAIN inspiration is:

- folder tree
- nested containers
- session organization
- open content pane
- breadcrumbs/path
- compact metadata/status
- predictable location of work

Do not import the broadcast studio metaphor, scene controls, outputs, floating production windows, or general production density.

### D-007 — Static resident shell

**Status:** LOCKED at the conceptual level

The desktop resident experience should be structurally stable:

- **Left:** File/navigation
- **Center:** Resident Portal home or current folder/session/work
- **Right:** Agent

The frame should not behave like a movable-window desktop.

Responsive/mobile treatment remains open.

### D-008 — Resident Portal home remains a primary useful surface

**Status:** LOCKED

The Resident Portal includes a home view of current information. It reads from maintained systems. The File remains the source of record.

### D-009 — Universe City visual palette

**Status:** LOCKED direction

Use a restrained base of black, white, ivory, and neutral support colors.

The four department colors remain the semantic organizational accent system:

- I Agency Assessment — `#5C0F1B`
- II Housing Stability — `#A07818`
- III Career Development — `#4A2A78`
- IV Life Management — `#2A4B3C`

Avoid beige/brown/sepia dominance and avoid overwhelming the UI with department color fills.

---

## Time / Plan

### D-010 — Plan is a core Time interaction primitive

**Status:** LOCKED direction; mechanics still being defined

Time should not begin as a static calendar populated from a long intake.

A resident-specific daily Plan is a central way Universe City learns and maintains Time.

Core question:

> Did today go as planned?

### D-011 — Review the Plan using its actual touchpoints

**Status:** LOCKED direction

Do not ask only, "What part of your schedule didn't match?"

If the resident planned specific meaningful things, follow up specifically:

- Did you arrive at work when you planned?
- Did groceries happen?
- Did the project get finished?
- Did the gym happen?

A miss is learning material, not a failure state.

### D-012 — Success is not productivity volume

**Status:** LOCKED principle

Universe City should not reward "doing the most."

A resident may successfully protect rest, change a plan, or use a fallback.

The central question is whether the resident's actual life is increasingly aligned with their intended life.

---

## Agent

### D-013 — Agent can use Plan context

**Status:** LOCKED direction

The Agent should be able to see relevant planned items and use them as contextual reasons to engage.

Plan-aware communication is preferable to generic engagement prompts.

### D-014 — Agent should not follow up on everything

**Status:** LOCKED principle

Proactive contact must be selective.

Importance, uncertainty, active system work, patterns, and resident preference should determine whether a planned item deserves follow-up.

The product should become quieter as it learns what is stable.

---

## Decision history

Created October 9, 2026 as the initial decision register.


### D-015 — Entry into the Resident Portal

**Status:** LOCKED sequencing; Time details remain WORKING

Application precedes Enrollment. Enrollment consists of the initial Agency Assessment, which establishes general information, Start, and Target. Residency begins at Enrollment. Orientation follows Enrollment in the actual Resident Portal. Initial Time work follows Orientation. The resident does not build the Time system during Enrollment.

The Orientation walkthrough can be skipped and replayed. Initial Time work precedes the normal Resident Portal home. The exact schedule and Plan requirements await review. Payment timing remains unresolved.

### D-016 — Universe City engagement belongs on the Plan

**Status:** LOCKED direction

The resident should deliberately plan time to engage with Universe City. The first Plan asks when Daily Close belongs in the day rather than assuming the resident will remember to return.

### D-017 — First Plan includes a realism check

**Status:** LOCKED direction

Before accepting the first Plan, Universe City asks how realistic it feels. A Plan that already feels unlikely should be simplified, moved, or deliberately supported rather than recorded as if confidence were irrelevant.


### D-018 — “File” is structural language, not the resident journey

**Status:** LOCKED

Universe City may use **File** as a quiet structural noun for the organized body of a resident's systems, history, and supporting information.

Do not use File as the main resident-facing action or marketing concept.

Avoid:
- create your File
- confirm your File
- open your File
- your File is waiting
- repetitive “on file” copy

Prefer:
- create account
- begin enrollment
- confirm email
- your systems
- your schedule
- your history
- your information

File can still appear where it genuinely names the organized structure, especially in Agent/internal context and restrained interface labeling.


## Time, Version 4

### D-019: Three Time documents in the repository

**Status:** LOCKED, October 11, 2026

`docs/systems/TIME.md` is the finished Time specification and the authoritative copy. `docs/systems/TIME_OPERATIONS.md` holds the mechanics and marks each undecided one as To define. `docs/systems/TIME_DEVELOPMENTS.md` is the dated log of how the thinking changed. A Word file is an export. Open thinking does not go in `TIME.md`.

The Time Curriculum and the Time Research are not in the repository yet and are not revised.

### D-020: Integrity reads Time

**Status:** LOCKED, October 11, 2026

Integrity covers every commitment the resident made, at work and outside work. Integrity reads the commitment entries already kept in Time. It creates no second schedule and no second copy of a commitment. Time holds when a commitment is scheduled and what happened to it.

### D-021: Software carries out permitted work

**Status:** LOCKED, October 11, 2026

The agent is the accountable human representative. Software carries out defined work under rules and permissions. With a standing permission, software carries out the permitted action with no person releasing it. Software is never called the agent.

A person is required when the permission does not clearly cover the action, when judgment is needed beyond the established rule, when the action would change the resident's File or obligations in a way that requires interpretation, or when the resident asks for review by a person.

### D-022: Contact

**Status:** LOCKED direction, October 11, 2026. Settings and delivery are marked To define in Time Operations.

Contact has three origins: resident requested, permitted automatic, and agent initiated. Contact takes place at three points in the day: the Morning Plan, during the day, and Daily Close. Daily Close is the regular contact and is not the only one. The resident chooses how much contact they receive and when. Routine authorized work proceeds with no reply from the resident.

### D-023: Time Version 4 resolutions

**Status:** LOCKED, October 11, 2026

A purchase amount is filed in Finance. The Resident Portal home opens when the first seven day schedule is on file and the first Plan is confirmed. Time is operational on three conditions. The free first day is retired. `docs/systems/TIME_DEVELOPMENTS.md` 2.9 lists every resolution and where it sits in the specification.

### D-024: Order of questions, and two results for execution

**Status:** LOCKED, October 11, 2026

The fixed rule of lowest Position first is retired for Time. The agent selects the next question by the information still missing, the importance of the commitment, the consequences on file, and the resident's preferences. Contact frequency follows the resident's contact preferences.

Executed and confirmed successful are two results. A commitment is executed when its Completion condition is met. It is confirmed successful only when the resident has confirmed that no commitment or condition was affected. Consequences that are not established are never counted as no harm.

`LANGUAGE_STANDARD.md` 3.20 still states order of work by Position. That clause is unreviewed under clause 12.7 and needs the matching change.
