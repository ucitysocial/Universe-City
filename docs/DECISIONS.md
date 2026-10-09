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

The dashboard may summarize it. Conversation may discuss it. Neither replaces it.

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
- **Center:** Dashboard or current folder/session/work
- **Right:** Agent

The frame should not behave like a movable-window desktop.

Responsive/mobile treatment remains open.

### D-008 — Dashboard remains a primary useful surface

**Status:** LOCKED

Universe City still has a main resident dashboard with useful current information.

The dashboard is a view into maintained systems, not a competing record.

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


### D-015 — Orientation precedes the normal resident dashboard

**Status:** LOCKED direction

After account creation, email confirmation, and membership activation, a new resident enters Orientation in the real resident interface. They may skip the walkthrough, and it must be replayable later.

A new resident does not begin on the normal dashboard before establishing an initial Time Plan.

### D-016 — Universe City engagement belongs on the Plan

**Status:** LOCKED direction

The resident should deliberately plan time to engage with Universe City. The first Plan asks when Daily Close belongs in the day rather than assuming the resident will remember to return.

### D-017 — First Plan includes a realism check

**Status:** LOCKED direction

Before accepting the first Plan, Universe City asks how realistic it feels. A Plan that already feels unlikely should be simplified, moved, or deliberately supported rather than recorded as if confidence were irrelevant.
