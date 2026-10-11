# Universe City Product Brain

> **Purpose:** one durable source of truth for what Universe City is becoming, what is already decided, what is still being explored, and what is ready to build.

This directory is the product brain for the resident experience. It should prevent good ideas from disappearing into chat history while also preventing brainstorming from silently becoming product requirements.

## Status language

Every meaningful concept should be treated as one of four states:

- **LOCKED** — explicitly decided. Build against it unless the decision is intentionally reopened.
- **WORKING** — strong current direction, but still being tested/refined.
- **RESEARCH** — supported by research or investigation; product application still requires judgment.
- **INBOX** — captured idea. Preserve it, but do not build from it yet.

When an idea changes state, update the relevant document and `DECISIONS.md`.

## Current product spine

### 1. One resident File

Universe City maintains one organized File for each resident.

The canonical taxonomy is already implemented in `lib/domain/folders.ts`:

- I — Agency Assessment
- II — Housing Stability
- III — Career Development
- IV — Life Management

Each department contains 12 folders. **All 48 folders remain in the taxonomy.**

The four current foundation folders are:

- Time
- Inventory
- Salary
- Standards

A folder is not merely navigation. Each folder ultimately represents a resident-specific system maintained by Universe City.

### 2. Universe City builds the systems

**LOCKED**

Universe City builds, configures, updates, tests, and maintains the resident's systems.

The resident provides the life:

- context
- corrections
- answers when necessary
- evidence/integrations when useful and consented to
- participation in tests and challenges
- approval when interpreted information is proposed for the File

Working line:

> Universe City builds the system. The resident provides the life. The agent keeps the two aligned.

The resident should not be asked to do Universe City's administrative work.

### 3. Record integrity

Existing repository rules remain foundational:

- Nothing is recorded merely because AI inferred it.
- AI may propose; it does not silently write interpreted facts.
- Resident corrections revise the record while preserving prior versions.
- Derived briefs are not the source of truth.
- Conversation and the permanent File are distinct.

See the repository root `README.md`.

### 4. Resident Portal home, File, Sessions, Agent

**WORKING / partially LOCKED**

The resident experience is becoming four connected layers:

**Resident Portal home** — useful, current information about the resident's life.

**File** — organized source of truth across the four departments and 48 folders.

**Sessions** — bounded records of work that explain how the File changed.

**Agent** — the easiest communication layer for maintaining the life and the systems.

Important distinction:

> Resident Portal home = what matters now.  
> File = what is currently maintained.  
> Session = how the File got there.  
> Agent = how the resident communicates with Universe City across all of it.

### 5. Time begins with Plan

**WORKING, strong**

The emerging Time model is centered on a very simple recurring question:

> Did today go as planned?

The daily work compares the Plan with what the resident reports happened. The exact sequence of daily interactions is under review.

A Plan is not the same as the Schedule.

- **Plan** = what the resident intends to happen on a specific day.
- **Actual** = what happened.
- **Difference** = what deserves understanding.
- **Schedule** = recurring structure that becomes increasingly accurate as Universe City learns from repeated Plans and Actuals.

See `systems/TIME.md`. Since October 11, 2026 that file holds the Version 4 specification. Where this section and the specification differ, the specification governs.

## Standards and unresolved entry sequence

`LANGUAGE_STANDARD.md` Version 4 governs terminology, including Application, Enrollment, Agency Assessment, File, Folder, Record, System, Start, Target, Position, and Report. Older notes in this product directory may contain retired words. Application comes before Enrollment, and residency begins at Enrollment. Entry sequence: Application, email confirmation, Enrollment through initial Agency Assessment, Orientation, then initial Time work. Payment timing remains unresolved. Do not build an entry flow from an older diagram.

## Product documents

### Intake and governance

- [Idea Inbox](./IDEA_INBOX.md)
- [Decisions](./DECISIONS.md)
- [Open Questions](./OPEN_QUESTIONS.md)

### Research

- [Planning Research](./research/PLANNING.md)

### Systems

- [Time, the specification](./systems/TIME.md)
- [Time Operations, how the system runs](./systems/TIME_OPERATIONS.md)
- [Time Developments, the dated log](./systems/TIME_DEVELOPMENTS.md)

### Product architecture

- [Resident Interface](./product/RESIDENT_INTERFACE.md)
- [Enrollment Audit](./product/ENROLLMENT_AUDIT.md)
- [Agent Model](./product/AGENT_MODEL.md)
- [Sessions](./product/SESSIONS.md)

## Build rule

Do not create an implementation issue directly from an INBOX idea.

The funnel is:

**INBOX → discuss/research → LOCKED or rejected → READY TO BUILD → GitHub Issue**

That keeps GitHub useful as both memory and execution without turning every thought into engineering scope.
