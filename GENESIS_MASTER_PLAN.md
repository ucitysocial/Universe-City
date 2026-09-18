# Genesis + Life Assessment — Master Build Plan

> Canonical anti-drift roadmap for Universe City.
>
> This document is the source of truth for what we are building, the order we are building it in, and the architectural rules that must remain consistent as implementation continues.

## North Star

Build a longitudinal human simulation and assessment system that can generate a coherent person from ancestry and birth through death, preserve what actually happened separately from what the person perceived or remembers, and later allow Universe City to assess only what the resident has disclosed or the Agency has legitimately documented.

The goal is not to generate a character sheet. The goal is to generate a traceable human life.

## Non-negotiable architecture laws

1. **Events before traits.** Biography, behavior, decisions, relationships, and consequences create the person. We do not generate a finished personality and backfill excuses for it.
2. **Canon and subjectivity are separate.** What happened, what was observed, what was believed, what was remembered, and what is said today may differ.
3. **No derived state without provenance.** Any conclusion such as financial strain, self-efficacy, relationship stability, or professional reputation must trace back to source records.
4. **People are persistent.** Parents, siblings, friends, partners, children, coworkers, managers, teachers, neighbors, etc. are real `people` records and can recur decades later.
5. **Connected people continue living.** Important secondary people progress independently; they do not freeze when the resident leaves the room.
6. **Relationships have two perspectives.** Closeness, trust, expectations, and grievances can differ by participant.
7. **Knowledge is permissioned.** A person only knows a fact if the knowledge graph explains how and when they learned it.
8. **Locked history is immutable.** Later interpretation can change; canonical past events do not.
9. **Age does not dictate functioning.** Later-life capacity follows health, resources, environment, and actual events—not stereotypes.
10. **Death is an event, not a stage.** The person's new actions stop; their effects on survivors continue.
11. **Genesis creates the life; Life Assessment examines it.** The assessment must never receive Author-only truth automatically.
12. **No melodrama engine.** Most life is mundane. Significant events should be comparatively rare.
13. **Adaptive time resolution.** Stable periods simulate coarsely; transitions zoom into days/weeks when needed.
14. **Seeded + versioned generation.** A Genesis run must be reproducible and tied to a generator version.
15. **Validation before canon.** Candidate events must pass temporal, relational, resource, causal, and knowledge checks.

---

# Lifecycle already designed

## Foundations
- Birth seed: randomized birth date, time, location
- Natal chart is **derived** from birth data, never canonical source data
- Multi-generation ancestry / family tree
- Parents as their own people with lives before the resident's birth
- Siblings as their own people with their own birth data/charts/history
- Pregnancy + birth record

## Developmental stages
1. Infancy (0–2)
2. Early Childhood (3–5)
3. Middle Childhood (6–10)
4. Early Adolescence (11–14)
5. Late Adolescence (15–17/18)
6. Emerging Adulthood (~18–25; chapter based)
7. Established Adulthood (~25–39; chapter based)
8. Mid-Adulthood (~40–59; chapter based)
9. Later Adulthood (60+; open ended)
10. Death / Life Closure event

Adult stages use meaningful **life chapters**, not one giant age blob.

## Stage handoffs
Stored in one transition table:
- Adult Launch Position
- Adult Foundation
- Midlife Entry State
- Later-Life Entry State
- Final Life State

---

# Core causal engine

Universal loop:

```
PRIOR STATE
→ PRESSURES + OPPORTUNITIES + ENVIRONMENT
→ EVENT
→ PERCEPTION
→ INTERPRETATION
→ EMOTIONAL RESPONSE
→ BEHAVIOR / DECISION
→ CONSEQUENCE
→ STATE CHANGE
→ MEMORY + LEARNING
→ UPDATED EXPECTATIONS / BELIEFS
→ NEXT EVENT
```

Not every event requires every psychological step. Ordinary events may simply change state.

Event classes:
- causal
- probabilistic
- exogenous/world

Long-running storylines are tracked as causal threads that may strengthen, weaken, go dormant, reactivate, transform, resolve, or close by death.

---

# Canonical data model

Everything belongs to one of eight classes:

```
PERSON
ENTITY
RELATIONSHIP
EVENT
STATE
SUBJECTIVE EXPERIENCE
KNOWLEDGE
DERIVATION
```

## Root people / simulation
- `people`
- `residents`
- `genesis_runs`

## Foundations
- `person_births`
- `person_parentage`

Ancestry/lineage is a recursive view over parentage, not a duplicate lineage truth table.

## World entities
- `locations`
- `organizations`
- `organization_locations`
- `residences`
- `households`
- `pets`
- `assets`
- `financial_accounts`
- `debts`
- `legal_documents`
- `digital_accounts`

Schools, employers, hospitals, community groups, etc. are all organizations with types.

## Membership / relationship edges
- `household_memberships`
- `household_residence_periods`
- `person_relationships`
- `relationship_state_periods`
- `relationship_perspectives`
- `education_enrollments`
- `employments`
- `employment_role_periods`
- `credentials`
- `caregiving_periods`
- `support_relationship_periods`
- `household_responsibility_periods`
- `pet_household_periods`

## Event backbone
- `life_events`
- `event_people`
- `event_entity_links`
- `event_person_experiences`

One event can belong to multiple lives.

## Decisions
- `decisions`
- `decision_participants`
- `decision_options`

Personal and household decisions share one architecture.

## Resource histories
- `asset_ownership_periods`
- `financial_account_access`
- `financial_account_snapshots`
- `debt_parties`
- `debt_snapshots`
- `financial_obligations`

## Health
- `health_conditions`
- `medication_periods`

Health visits, injuries, surgeries, births, reproductive transitions, etc. are life events plus state periods as appropriate.

Menstrual/reproductive continuity lives primarily in state periods; important transitions become events.

## Universal longitudinal state
- `person_state_periods`
- `household_state_periods`

State domains may include:
development, identity, appearance, communication, humor, routine, habit, domestic, autonomy, future orientation, career, finance, health/function, reproductive health, transportation, administration, digital life, capacity, priorities, strain, purpose, retirement, functional independence.

Do **not** create a new SQL table for every new profile/state concept.

## Chapters / stages / transitions
- `person_life_chapters`
- `person_development_periods`
- `person_transition_snapshots`

## Subjective layer
- `person_memories`
- `person_interpretations`
- `person_beliefs`
- `belief_evidence`
- `person_identity_claims`
- `person_narratives`
- `person_life_reviews`

Memory is not event. Belief is not fact. Narrative is not canon.

## Knowledge graph
- `information_items`
- `information_awareness`

Secrets are not a separate table; a secret is an information item with restricted awareness and/or intentional concealment.

## Causal organization
- `person_causal_threads`
- `causal_thread_links`

## Derived observations
- `derived_observations`
- `derived_observation_evidence`

Career arcs, professional reputation, self-efficacy, financial strain, network stability, residence suitability, maintenance load, repeated patterns, etc. should normally be derived here rather than duplicated as canonical history.

## Death / estate
- `person_deaths`
- `estate_cases`

Death consequences such as notifications, funerals, inheritance, household changes, employment closure, asset transfer, and survivor reactions are ordinary downstream life events.

---

# Generator architecture

`createResident()` is an orchestrator, never one giant model call.

High-level sequence:

```
createGenesisRun
→ generateResidentSeed
→ generateLineage
→ simulateParentsBeforeBirth
→ simulatePregnancyAndBirth
→ infancy
→ early childhood
→ middle childhood
→ early adolescence
→ late adolescence
→ Adult Launch snapshot
→ emerging-adult life chapters
→ Adult Foundation snapshot
→ established-adult life chapters
→ Midlife Entry snapshot
→ mid-adult life chapters
→ Later-Life Entry snapshot
→ later-life chapters
→ death if/when reached
→ Final Life State snapshot
→ validateGenesis
→ completeGenesisRun
```

Universal interval simulation:

```
load current state
→ advance connected world
→ detect pressures
→ detect opportunities
→ resolve commitments
→ propose causal events
→ propose probabilistic events
→ propose exogenous/world events
→ merge / conflict-resolve
→ validate candidates
→ process accepted events
→ update states
→ update causal threads
→ detect patterns
→ check life-chapter boundary
```

## Candidate event validation passes
1. Temporal
2. Relational
3. Resource
4. Causal
5. Knowledge

Reject, repair, or create a missing prerequisite. Never silently accept an impossible event.

---

# Secondary-person simulation tiers

- **Tier 1 — Full:** selected resident
- **Tier 2 — Deep:** parents, siblings, partner, children, best friends
- **Tier 3 — Contextual:** coworkers, extended family, regular friends, important neighbors
- **Tier 4 — Light:** teachers, old classmates, one-time managers, peripheral community members

People can move between tiers without duplication.

---

# Human-development systems already designed

The following are structurally accounted for and must remain longitudinal:
- household and residence history
- family tree and living family graph
- school and education
- jobs and career
- finances / debt / assets / recurring obligations
- transportation
- healthcare / body / reproductive history
- relationships / friendships / romance
- household economy / shared finances
- household labor and invisible administration
- parenting / children / childcare
- caregiving / aging parents
- community
- digital life
- routines / habits
- identity versions
- values / beliefs / standards / boundaries
- memory / reinterpretation
- retirement
- functional independence
- support networks
- death / estate / survivor consequences

---

# Remaining build plan — execute in this order

## Phase A — Human Texture Engine **NEXT**
Goal: make a generated resident recognizable as one specific human rather than a coherent résumé.

Design and generate, causally:
- speech fingerprint
- vocabulary, pacing, filler words, slang, profanity, code-switching
- texting style
- humor modes + delivery + laugh behavior
- facial/body mannerisms
- sensory preferences and aversions
- food habits, comfort foods, restaurant behavior
- music history and associative songs
- movies/TV/books/media taste
- clothing/style eras
- beauty/grooming
- home aesthetic and domestic quirks
- hobbies / fandoms / random expertise
- objects kept / sentimental items
- pet peeves
- gift-giving
- affection / flirting / embarrassment / anger behavior
- alone-at-home behavior
- nostalgia
- favorite stories and repeated phrases
- tiny recurring inconveniences and quirks

Rule: texture must be historically plausible and emerge from life/culture/context, not random trivia roulette.

## Phase B — Temperament → Personality Development Engine
Formalize:
- baseline temperament
- contextual tendencies
- learned behavior
- coping
- role behavior
- self-concept
- private vs presented vs perceived self
- state vs trait
- confidence vs competence
- domain-specific self-efficacy

Avoid universal one-number traits where context matters.

## Phase C — Culture + Historical World Engine
A resident must grow inside a real era/place context.

Model:
- geography
- language
- family culture
- socioeconomic/material context
- migration/immigration where generated
- school norms
- technology available at each age
- media environment
- music/fashion
- changing economic conditions
- major public events
- locally plausible institutions and opportunities

World must advance independently of resident need.

## Phase D — Human Interaction / Dialogue Engine
Conversation must obey:
- individual voice
- knowledge permissions
- secrets
- relationship history
- emotional state
- power/context
- code-switching
- conflict/repair style
- humor
- what the speaker intentionally withholds

Support:
family conversation, friendship, arguments, apologies, flirting, workplace conversation, texting, mentoring, etc.

## Phase E — Canonical Supabase SQL
Translate the audited model into real:
- migrations
- enums/check constraints
- foreign keys
- indexes
- JSONB contracts
- views
- RLS where appropriate
- recursive ancestry queries

Map existing repo schema into this model; migrate intentionally rather than blindly replacing.

## Phase F — Genesis Generator + Validators
Implement:
- seeded generation
- adaptive time resolution
- stage/chapter orchestration
- event proposal
- validation
- consequences
- causal threads
- connected-person progression
- state recomputation
- locking
- reproducibility

## Phase G — Generation QA / Reality Audit
Generate many test lives and try to break them.

Audit:
- chronology
- impossible pregnancy/age combinations
- employment overlaps
- travel/geography
- household continuity
- education
- money/resource feasibility
- family tree consistency
- relationship continuity
- knowledge leaks
- deceased people acting
- bad vs legitimate contradictions
- cultural stereotyping
- melodrama rate
- continuity over 80+ years

Required tool: **"Why is this true?" inspector** that traces any state/claim back to source evidence.

## Phase H — Genesis Studio / Review + Lock UI
Build `/genesis` to inspect:
- person at any age
- family tree
- full timeline
- relationships
- residences/households
- school/jobs
- state periods
- memories
- knowledge graph
- causal threads
- transition snapshots
- derived natal chart

Support scoped regeneration and canonical locking without rewriting unrelated history.

## Phase I — Universe City Life Assessment
Only after Genesis is trustworthy.

Assessment access:
- resident disclosures
- Agency-documented information
- never raw Author truth automatically

Build:
- conversational intake
- disclosure tracking
- clarification/correction
- discrepancy detection
- evidence routing
- four UC departments / 48 folders
- assessment outputs
- follow-up/check-in
- evolving Agency record

Genesis creates the person.
Life Assessment learns the person.

---

# Current progress marker

## Designed deeply
- birth-to-death structural lifecycle
- causal life engine
- multi-person continuity
- household economy
- adulthood / aging / retirement / death
- canonical schema model
- generation order
- event validation philosophy

## Next active phase
**Phase A — Human Texture Engine**

## Do not do yet
- invent more age stages
- add tables casually for every new concept
- build Life Assessment before Genesis truth/permissions are stable
- use personality labels to generate events backward
- let UI implementation dictate the ontology
- rewrite locked canonical history

---

# Accuracy / anti-drift workflow

For every future build session:

1. Read this roadmap before making structural changes.
2. Identify the active phase.
3. Reuse existing architecture before inventing a table/object.
4. If a new concept appears, classify it as Person, Entity, Relationship, Event, State, Subjective Experience, Knowledge, or Derivation.
5. Record architecture-changing decisions here.
6. Do not mark a phase complete merely because prose/spec exists; implementation phases require tests.
7. Prefer traceability over plausible prose.
8. When unsure, preserve raw evidence and uncertainty rather than inventing certainty.

# Definition of "accurate enough to move on"

A phase is ready to hand off only when:
- its conceptual model is internally consistent,
- its records have clear ownership and time semantics,
- its dependencies on earlier phases are explicit,
- it does not duplicate canonical truth,
- it distinguishes fact from inference,
- it has a clear validation strategy,
- and we know what the next phase consumes from it.

