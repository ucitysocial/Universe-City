# Universe City Design System

This document is the current source of truth for visual and interaction decisions across Universe City.

Wording is governed by [LANGUAGE_STANDARD.md](LANGUAGE_STANDARD.md). Where this file and the Language Standard disagree on a word, the Language Standard governs.

When an older component, page, mockup, or note conflicts with this file, this file wins.

## Product surfaces are related, not identical

Universe City has two visual modes that belong to the same brand but serve different jobs.

### Public and marketing surfaces

Public pages should feel editorial, clear, calm, and easy to read.

They explain the agency, show how the product works, introduce the four departments, and help someone decide whether to apply.

Public pages should not look like an internal records system.

### Working surfaces

Resident and agent workspaces may be denser and more operational.

They can use records office language, system notation, timelines, status states, queues, follow ups, and other functional interface patterns when those patterns help someone manage real work.

Working surfaces should not inherit decorative marketing layouts merely for brand consistency.

### Shared brand language

Public and working surfaces still share:

- Montserrat as the primary typeface
- VT323 for system notation, figures, compact labels, and record language
- the same department colors
- strong rectangular geometry
- clear borders
- the Universe City wordmark
- the same core palette

They do not need to share the same page composition or interface grammar.

## Core palette

- Ink: `#140A0C`
- Ink 2: `#241417`
- Paper: `#F4EFE9`
- Paper 2: `#E8DED6`
- Paper 3: `#DCCEC3`
- Rule: `#C7B6AE`
- Dim text: `#8A7A74`
- Agency Assessment: `#5C0F1B`
- Housing Stability: `#A07818`
- Career Development: `#4A2A78`
- Life Management: `#2A4B3C`

## Typography

- Montserrat is the primary reading voice.
- VT323 is reserved for figures, labels, system notation, counters, statuses, and compact record language.
- Do not set full explanatory paragraphs in VT323.
- Large public headings should be direct, compact, and readable before decorative.
- Mobile body copy should not drop below a comfortable reading size merely to save vertical space.

## Public visual rules

- Public pages use editorial section composition, not records office layouts.
- Major sections should alternate surface families intentionally so adjacent sections do not visually merge.
- Avoid two neighboring major sections with nearly identical light backgrounds unless there is a deliberate visual divider.
- Department colors are functional identifiers.
- White and near white are focused surfaces, not the default background for every section.
- Avoid soft SaaS card language and decorative gradients.
- Avoid unnecessary boxes when typography and spacing can create hierarchy.
- Do not use hard shadows everywhere. Use them only when they materially support a control or focused surface.
- Keep public reading order obvious. Do not make a visitor choose between competing columns that repeat the same idea.
- On mobile, reduce density without removing meaning. Prefer one active decision or reading target at a time.

## Interaction rules

Universe City is built for people who may already be carrying significant executive function load.

Interfaces should therefore:

- break work into bite sized decisions
- keep one active decision visually dominant
- avoid flashing or replacing information before it can be read
- never require the user to chase disappearing content
- keep confirmed information available in a compact completed state
- turn unresolved questions into active follow ups or commitments
- avoid asking for confirmation when the agent can safely complete administrative work itself
- use interaction to reduce cognitive load, not prove how much context the system has

The agent interaction standard is defined in [SYSTEM_EXPLANATION_STANDARD.md](SYSTEM_EXPLANATION_STANDARD.md).

## Public shell standard

The homepage is the public shell reference.

Current public navigation:

- 58px ink navigation bar
- Montserrat `universe★city` wordmark
- VT323 `LIFE MANAGEMENT AGENCY` descriptor
- `Log in` in the top right
- ivory `Apply for residency` action in the top right
- bordered star menu control beside those actions

The star is reserved for opening the site menu. Do not reuse the same boxed star as a back button, previous section control, or chapter control.

### Star menu

The public menu is intentionally small.

UNIVERSE CITY:
- Home
- How it works
- Residency
- Founder

DEPARTMENTS:
- Agency Assessment
- Housing Stability
- Career Development
- Life Management

Apply for residency and Log in are in the header. The star menu does not repeat them.

Do not add placeholder navigation such as The show, For employers, Client rates, or Quarterly report unless a real destination exists and the product decision has been made to expose it publicly.

### Footer

The footer should remain compact.

UNIVERSE CITY:
- Home
- How it works
- Residency
- Founder

DEPARTMENTS:
- Agency Assessment
- Housing Stability
- Career Development
- Life Management

Account actions belong in the header rather than being duplicated in the footer.

## Public page hierarchy

The current homepage logic is:

1. Arrival
2. Residency and the four departments
3. Interactive agent example
4. Start where you are, combined with the agent job
5. Founder and trust
6. Footer

Copy can continue to evolve, but new work should preserve the reading logic unless the hierarchy is intentionally changed.

## Folder names

The forty eight folder names are fixed in [LANGUAGE_STANDARD.md](LANGUAGE_STANDARD.md) clause 2.6. They are repeated here.

### Agency Assessment
Time, Health, Language, Background, Identification, Finance, Legal, Mediation, Education, Employment, Regulation, Community

### Housing Stability
Inventory, Storage, Sanitation, Organization, Information, Administration, Law, Privacy, Transportation, Maintenance, Technology, Communal Space

### Career Development
Salary, Schedule, Skill, Scope, Integrity, Professionalism, Resources, Key Performance Indicators, Advancement, Leadership, Information Technology, Networking

### Life Management
Standards, Survival, Perception, Instinct, Identity, Ethics, Equilibrium, Boundary, Discernment, Prioritization, Systems, Socializing

Write Key Performance Indicators and Information Technology in full wherever a resident can read them.

## Language boundary

The defined terms are in [LANGUAGE_STANDARD.md](LANGUAGE_STANDARD.md) section 2. This section repeats the four that change the most text.

- Resident is the word for the person in all text the person can read. Client is the word for the same person in agent documents and in the agent console.
- The forty eight units are folders. A folder contains a record and a system. A system is the working product of one folder.
- The arrangement is a residency.
- The part of the website a resident logs in to is the Resident Portal. The action is Log in.

Genesis is an internal name. A resident never reads it.

## Public copy punctuation

Resident facing text contains no hyphen, no en dash, and no em dash. [LANGUAGE_STANDARD.md](LANGUAGE_STANDARD.md) clause 5.13 states the rule.

## Source of truth order

When decisions conflict, use this order:

1. [LANGUAGE_STANDARD.md](LANGUAGE_STANDARD.md), for every word
2. Current explicit product decisions documented in this file
3. [SYSTEM_EXPLANATION_STANDARD.md](SYSTEM_EXPLANATION_STANDARD.md)
4. Current production behavior and approved homepage patterns
5. Existing component implementation
6. Older briefs, mockups, or historical code

The repository should be updated when a product decision changes so old behavior does not silently return later.


## Department explanation quality

The department pages must do more than describe what a system could theoretically do.

[LANGUAGE_STANDARD.md](LANGUAGE_STANDARD.md) clause 6.7 governs these sections. A section states what the folder contains and gives the question the folder answers. It does not supply a scene from one kind of life.

Do not end the explanation at advice. If the resident still needs to confirm, review, answer, schedule, upload, call, attend, or decide something, that work must become a commitment or active follow up.

Different systems should still have different rhythms. Do not force every folder into the same sentence pattern.
