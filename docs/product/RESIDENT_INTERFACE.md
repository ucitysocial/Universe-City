# Resident Interface

**Status:** WORKING with several LOCKED directional decisions

This document describes the resident information architecture. It is intentionally separate from the current implementation so interface prototypes do not accidentally become product truth.

---

## Design thesis

Universe City is a life-management environment.

The interface should make a resident's life:

- visible
- organized
- understandable
- maintainable
- easy to discuss with Universe City

The design should not make the resident learn internal bureaucracy or perform administrative work.

---

## Static shell

**LOCKED conceptual direction**

Desktop should use a stable three-part frame:

### Left — File

Persistent access to:

- resident File
- four departments
- 48 folders
- nested folder/session organization

### Center — Resident Portal content

Shows one primary context at a time:

- Resident Portal home
- folder/system
- Session
- record/detail
- review

### Right — Agent

Persistent communication surface.

The Agent can understand the current workspace context but should not require the resident to know which internal Desk owns the topic.

The frame is static.

**Do not build a draggable floating-window desktop.**

---

## Resident Portal home

**LOCKED: the Resident Portal home remains important.**

The Resident Portal home presents current information from the resident's systems.

It may eventually show:

- Today
- next planned commitment
- schedule
- money/obligations
- upcoming appointments/deadlines
- Needs You
- active tests/challenges
- current system work
- resident-selected persistent information

The Resident Portal home is **derived from maintained systems**.

It does not own duplicate truth.

Example:

- schedule view reads Time/Schedule
- registration deadline reads Regulation
- money obligation reads Finance
- work commitment may read Career Schedule
- active minimum reads Standards

---

## File

The File is the organized durable record.

Canonical hierarchy:

```
MY FILE

I · Agency Assessment
II · Housing Stability
III · Career Development
IV · Life Management
```

Each department contains its canonical 12 folders from `lib/domain/folders.ts`.

The File should feel organizationally closer to YAPTAIN's session/file browser than to a generic SaaS card dashboard.

Useful patterns:

- tree
- collapse/expand
- selected row
- current path/breadcrumb
- center content pane
- nested folders/records
- compact metadata
- status
- clear history

Avoid duplicating the same hierarchy as tree + department cards + folder tiles simultaneously.

One strong navigation metaphor is enough.

---

## Sessions

Sessions are a candidate organizational primitive beneath the permanent File.

See `SESSIONS.md`.

The File answers:

> What is true/current?

Sessions answer:

> What work happened that produced or changed this?

---

## Agent

The Agent is static in the shell rather than another destination the resident must remember to open.

See `AGENT_MODEL.md`.

The right rail should be useful even when quiet.

Do not allow it to dominate the center workspace.

---

## Visual identity

### Base

Use:

- black
- white
- ivory
- restrained neutral grays

Avoid:

- brown/sepia dominance
- excessive beige
- generic gradient SaaS UI
- giant rounded cards
- giant blocks of department color

### Department colors

Canonical colors:

- I Agency Assessment — `#5C0F1B`
- II Housing Stability — `#A07818`
- III Career Development — `#4A2A78`
- IV Life Management — `#2A4B3C`

Color should act as **semantic orientation**.

Potential uses:

- selected tree marker
- thin folder rule
- title accent
- breadcrumb marker
- small source indicator
- status/department dot

Example:

A dashboard row can show a thin purple marker for Career without turning the entire row purple.

### YAPTAIN influence

What to borrow:

- compact confident typography
- strong rules
- tactile file/folder organization
- clear tree/path
- restrained accent color
- hierarchy that feels like a real working record
- session organization

What not to borrow:

- broadcast studio
- floating window management
- production outputs
- scene/taskbar density
- .exe naming everywhere

---

## Information density principle

At any moment, there should be one obvious primary thing to understand in the center workspace.

Useful information can coexist without everything shouting equally.

Avoid:

- six full "windows" tiled at once
- repeated explanatory prose
- every status shown everywhere
- every folder exposed at once
- redundant navigation representations

---

## Responsive/mobile

Not yet locked.

Mobile should preserve the same conceptual model:

- Resident Portal home
- File
- Agent
- current context/path

But should not literally compress three desktop columns.

See open questions.


---

## First resident entry

**LOCKED direction**

Application comes first. Enrollment is the initial Agency Assessment. Residency starts at Enrollment. Orientation follows Enrollment. Initial Time work follows Orientation.

```
Application
→ Email confirmation
→ Enrollment: Agency Assessment, initial information, Start and Target
→ Orientation in the Resident Portal
→ Time: initial seven day schedule and commitments
→ Resident Portal home
```

Agency Assessment is Department I and provides the work of Enrollment. Enrollment establishes general information, Start and Target. The assessment gathers only the information the agent needs to begin representing the resident; individual folder intake continues during residency. The resident does not build the Time system during Enrollment. Orientation follows Enrollment, and initial Time work follows Orientation. Payment timing remains open.

Orientation should highlight the actual resident shell rather than use a disconnected slideshow.

Required concepts:

- walkthrough may be skipped
- orientation can be replayed later
- File, Resident Portal content, and Agent are introduced in place
- Time is explicitly identified as the first focus
- a new resident sees entry work before the normal Resident Portal home

The original decision to delay the normal Resident Portal home until initial Time information exists remains a working direction. Whether the resident establishes a seven day schedule, a daily Plan, or both immediately after Orientation still requires detailed design.
