
# Temperament → Personality Development Engine — Phase B Specification

> Status: ACTIVE DESIGN
>
> Parent roadmap: GENESIS_MASTER_PLAN.md
>
> Depends on: HUMAN_TEXTURE_ENGINE.md
>
> Purpose: create a personality system that is stable enough for a person to remain recognizable, flexible enough to change across decades, contextual enough to permit contradiction, and traceable enough that every personality conclusion can be explained from behavior and history.

## Scientific design stance

Longitudinal personality research supports both stability and change across the lifespan. Broad traits become more stable across development, but meaningful individual change continues through adulthood and later life. The engine therefore must never choose between "personality is fixed" and "personality is completely fluid." It must support both continuity and development.

Useful conceptual distinction:
- person as actor: recurring patterns of behavior, thought, and emotion
- person as agent: goals, motives, plans, values, and strivings
- person as author: the narratives used to make sense of the life

Genesis already has records for all three layers. This phase connects them without collapsing them.

## 1. Personality is layered

Canonical model:

~~~
AUTHOR-ONLY LATENT PREDISPOSITIONS
        ↓
OBSERVED BEHAVIOR
        ↓
CONTEXTUAL TENDENCIES
        ↓
LEARNED STRATEGIES / COPING
        ↓
GOALS + MOTIVES + VALUES
        ↓
SELF-CONCEPT / IDENTITY CLAIMS
        ↓
SOCIAL REPUTATION
        ↓
LIFE NARRATIVE
~~~

These layers influence one another but are not interchangeable.

## 2. Do not create one personality truth table

Use existing architecture.

- person_state_periods for current/period-specific behavioral, coping, goal, and role states
- life_events for actual behavior and outcomes
- decisions for choices
- person_interpretations for appraisals
- person_beliefs for learned propositions
- person_identity_claims for self-definition
- person_narratives for life-story meaning
- relationship_perspectives for how the person experiences a specific relationship
- derived_observations for trait summaries, personality frameworks, repeated behavior patterns, and external interpretations

Recommended new state domains:

~~~
temperament_expression
personality_context
coping
goals_motivation
self_efficacy
role_behavior
conflict_behavior
risk_behavior
help_seeking
social_presentation
~~~

## 3. Latent predispositions are simulation parameters, not human facts

Genesis may need stable probabilistic priors so the same child does not behave randomly from one event to the next.

Generate deterministic Author-only priors from:
- genesis seed
- family/genetic variation model where implemented
- developmental stage
- current physiology/health where relevant

These priors are not automatically shown to the resident, Agent, or Life Assessment.

They are not canonical claims such as "this child is introverted."

They are internal probability weights used to make behavior coherent.

Because seed + generator version are stored, latent priors can be reproduced rather than requiring a separate canonical table.

## 4. Early temperament dimensions

Use a small set of behaviorally meaningful priors rather than adult personality labels in infancy.

Possible simulation dimensions:
- approach toward novelty
- social approach
- activity level
- emotional reactivity
- recovery speed after upset
- frustration tolerance
- attention persistence
- inhibitory control / impulse restraint as developmentally appropriate
- adaptability to routine change
- reward sensitivity
- sensory sensitivity

These are probabilistic biases, not diagnoses or destiny.

## 5. Temperament becomes observed only through behavior

Example:

~~~
LATENT
higher novelty caution

OBSERVATIONS
hesitates before entering unfamiliar play group
watches new babysitter before approaching
needs repeated exposure to new activity

DERIVED OBSERVATION
currently shows cautious approach to unfamiliar social environments
~~~

Do not jump directly from the latent parameter to a canonical trait statement.

## 6. Trait, state, role, identity, and reputation must remain separate

Example:

~~~
TRAIT-LIKE TENDENCY
usually socially energetic with familiar people

CURRENT STATE
exhausted today

ROLE
manager leading a meeting

IDENTITY CLAIM
"I'm actually pretty shy"

REPUTATION
coworkers see her as outgoing
~~~

All five can be true simultaneously.

## 7. Context matrix

No universal "assertiveness = 72."

A tendency is represented by context.

Possible context axes:
- alone
- family
- sibling
- close friend
- acquaintance
- romantic
- school
- work peer
- authority
- subordinate
- customer/public
- online
- high-stakes
- unfamiliar environment

Example:

~~~
assertiveness:
family = high
romantic conflict = low
work = moderate-high
authority = moderate
strangers = low-moderate
~~~

Contextual differences are expected, not errors.

## 8. Core tendency families

Derived personality observations may summarize repeated evidence in domains such as:

- sociability
- social energy
- warmth
- assertiveness
- trust/guardedness
- novelty seeking
- curiosity
- aesthetic openness
- planning
- orderliness
- reliability
- persistence
- impulse restraint
- flexibility
- emotional reactivity
- emotional recovery
- rejection sensitivity
- conflict approach
- independence
- help seeking
- competitiveness
- cooperation
- risk tolerance

Do not assume every person needs a score in every domain.

## 9. Behavioral probability, not scripted behavior

A tendency should influence probability.

Example:

~~~
high observed planning tendency
does NOT mean
always plans.

It means:
planning is more likely,
especially when time and information permit it.
~~~

Fatigue, urgency, role pressure, relationship dynamics, resources, and unusual events can override ordinary tendencies.

## 10. Person × situation rule

Behavior is generated from:

~~~
LATENT PREDISPOSITION
+
LEARNED EXPECTATION
+
CURRENT STATE
+
RELATIONSHIP
+
ROLE
+
SITUATIONAL DEMAND
+
AVAILABLE OPTIONS
+
RESOURCE CONSTRAINTS
+
RANDOM VARIATION
~~~

This is the basic personality-expression equation.

## 11. Reinforcement learning

Recurring strategies strengthen when they work.

Example:

~~~
child makes joke when nervous
→ peers laugh
→ embarrassment decreases
→ humor under pressure becomes more likely
~~~

Or:

~~~
resident directly asks manager for clarification
→ problem resolved quickly
→ direct problem-solving becomes more likely at work
~~~

The immediate outcome and delayed outcome both matter.

## 12. Maladaptive does not mean irrational

A behavior may persist because it solves an immediate problem.

Example:

~~~
avoids difficult email
→ anxiety drops immediately
→ avoidance reinforced
→ deadline problem grows later
~~~

The engine must model short-term reward and long-term cost separately.

## 13. Learned coping state

Use person_state_periods.domain = coping.

Possible coping actions:
- problem solving
- planning
- seeking information
- seeking support
- humor
- distraction
- rest
- withdrawal
- postponement
- confrontation
- accommodation
- overwork
- exercise
- creative activity
- ritual/routine
- consumption behavior where generated

Do not label coping globally "healthy" or "unhealthy" as canonical truth.

Store outcomes and context.

## 14. Coping is context-specific

Someone can:
- ask for help with money,
- avoid help in relationships,
- problem-solve at work,
- shut down in family conflict.

Do not derive one universal coping style unless evidence truly supports it.

## 15. Goals and motives are part of personality but not traits

Use goals_motivation state to track:
- current goals
- approach goals
- avoidance goals
- status goals
- security goals
- belonging goals
- autonomy goals
- mastery goals
- family goals
- creative goals
- service/community goals
- immediate vs long-term goals

Goals can conflict.

## 16. Goal hierarchy

Represent:

~~~
LIFE DIRECTION
↓
MEDIUM-TERM GOAL
↓
CURRENT PROJECT
↓
NEXT ACTION
~~~

Example:

~~~
financial independence
↓
increase earnings
↓
complete certification
↓
study tonight
~~~

This connects personality to actual behavior without inventing vague motivation.

## 17. Goal importance and commitment are different

Someone may strongly value becoming a writer while putting little time into writing.

Track:
- importance
- commitment
- current effort
- perceived attainability
- priority
- obstacles

Do not infer low value solely from low execution.

## 18. Values remain revisionable

A value should gain strength through:
- upbringing
- repeated decisions
- admired people
- meaningful success
- conflict
- loss
- role investment
- reflection

Values may also weaken or become more nuanced.

## 19. Self-efficacy is domain specific

Continue the earlier rule.

Possible domains:
- school
- work
- leadership
- money
- relationships
- conflict
- household
- parenting
- health management
- bureaucracy
- social
- creative
- crisis management
- technology

Self-efficacy comes from:
- prior success/failure
- feedback
- observation
- mentoring
- training
- repeated practice

Confidence may exceed or lag actual skill.

## 20. Competence and confidence remain separate

Example:

~~~
skill = high
confidence = low

or

skill = moderate
confidence = very high
~~~

That mismatch itself can shape decisions.

## 21. Social presentation

A person may intentionally manage how others see them.

Use social_presentation state to track:
- desired impression
- contexts where impression management is strong
- traits intentionally emphasized
- traits intentionally hidden
- style of self-disclosure
- vulnerability threshold
- professional persona
- online persona

Presented self is not automatically deceptive. It is ordinary social adaptation.

## 22. Private self, presented self, perceived self

Preserve the Stage 08 rule permanently:

~~~
PRIVATE / INTERNAL
what I experience myself as

PRESENTED
what I intentionally show

PERCEIVED
what other people believe they see
~~~

There may be multiple perceived selves because different groups know different versions.

## 23. Reputation is group-specific

Never create one global reputation.

Possible contexts:
- family
- childhood friends
- workplace A
- workplace B
- community group
- online audience
- partner's family

Examples:

~~~
family: reliable, stubborn
work: calm, competent
friends: funny, chaotic
~~~

All can coexist.

## 24. Feedback changes personality indirectly

Social feedback may affect:
- self-efficacy
- identity claims
- behavior frequency
- goals
- role investment

But one comment does not immediately rewrite personality.

Repeated or highly salient feedback is more influential.

## 25. Role investment

Roles can strengthen behavior patterns.

Examples:
- becoming manager increases practice with assertive communication
- becoming parent increases planning demands
- becoming caregiver increases coordination behavior
- becoming performer increases public-expression practice

Do not assume the role changes everyone in the same way.

The role creates demands and opportunities for repeated behavior.

## 26. Roles can also produce compensatory behavior

Someone naturally spontaneous may become highly organized at work because the role requires it.

Therefore:

~~~
ROLE-ADAPTED BEHAVIOR
≠
GLOBAL PERSONALITY CHANGE
~~~

If the adapted behavior spreads across contexts over time, then broader change becomes plausible.

## 27. Personality change requires accumulated evidence

A single event should usually alter:
- state
- belief
- goal
- behavior probability

not instantly alter a broad personality descriptor.

Broad change should require:
- repeated new behavior,
- sustained role/environment change,
- repeated feedback,
- major sustained life restructuring,
- or a long-running causal thread.

## 28. Inflection periods

The engine may detect periods of unusually strong personality development.

Possible causes:
- adolescence
- first independence
- major move
- new career
- sustained relationship
- parenthood
- caregiving
- repeated success/failure
- recovery from prolonged instability
- retirement

Do not assume all transitions create change.

## 29. Personality stability also requires reinforcement

A trait-like pattern stays stable because:
- the person repeatedly chooses compatible environments,
- others respond to them in expected ways,
- the behavior keeps working,
- identity reinforces it,
- skills make the behavior easier,
- routines preserve it.

Stability is also a causal process.

## 30. Person–environment transaction

People shape their environments as environments shape people.

Example:

~~~
socially energetic resident
→ chooses customer-facing work
→ receives social practice/reward
→ becomes more confident socially
~~~

Or:

~~~
high need for quiet
→ chooses solitary workspace
→ receives less casual peer interaction
→ social work behavior stays limited
~~~

The engine must permit selection effects.

## 31. Relationship models

Do not assign one permanent attachment label as objective truth.

Instead store learned relationship beliefs and patterns such as:
- expected responsiveness
- comfort requesting support
- comfort with dependence
- jealousy triggers
- abandonment concerns
- privacy needs
- contact expectations
- repair expectations

These can differ across relationships and change with experience.

A standardized attachment-style label, if ever shown, should be a derived lens with uncertainty.

## 32. Conflict behavior

Use conflict_behavior state by context/relationship.

Track probabilities for:
- direct discussion
- delay
- withdrawal
- humor
- defensiveness
- negotiation
- appeasement
- escalation
- seeking third-party help
- ending interaction

Also track repair behavior.

## 33. Boundaries are behavioral, not slogans

Continue the earlier distinction:

~~~
STATED STANDARD
ASPIRATIONAL STANDARD
ACTUAL ENFORCEMENT
EXCEPTION
CONSEQUENCE
~~~

"I don't tolerate X" is a self-statement.

Whether the boundary is enacted is separate evidence.

## 34. Risk behavior

Risk tolerance must be domain-specific.

Someone may be:
- financially conservative,
- romantically adventurous,
- professionally cautious,
- physically thrill-seeking.

No universal risk score unless supported by evidence across domains.

## 35. Help-seeking

Track:
- whether help is recognized as needed
- who is considered safe to ask
- delay before asking
- shame/comfort around asking
- reciprocity expectations
- domains where help is avoided

Help-seeking is both personality-relevant and resource-dependent.

## 36. Response to praise and criticism

Behavioral texture may include:
- accepts praise
- deflects
- jokes
- becomes energized
- distrusts praise
- seeks additional feedback

Criticism response can include:
- curiosity
- defensiveness
- withdrawal
- problem solving
- rumination
- dismissal

Again: context and source person matter.

## 37. Standardized trait models are derived lenses

The Big Five can be useful as a compact research-oriented summary because it is widely used in personality science.

If implemented:
- derive it from accumulated behavior/state evidence,
- include confidence and evidence coverage,
- retain facets/context,
- never use the Big Five score as the original cause of canonical events.

It is a summary of the person, not the person.

## 38. Typology systems are optional lenses

Frameworks such as MBTI, Enneagram, or similar "personality type" systems may be used only as optional interpretive/creative lenses.

They are not canonical psychological truth and must not be used as evidence in the Life Assessment.

If a resident personally believes in a system, that belief can be part of their identity/narrative.

## 39. Natal chart separation

The resident's natal chart is derived from canonical birth date/time/location.

For accuracy:

- astrology is not treated as empirical psychological evidence,
- chart placements do not count as proof of personality,
- the Life Assessment must not infer traits from astrology unless explicitly operating in a user-selected symbolic/tarot lens,
- Genesis may optionally use the chart as an Author-level creative motif to diversify character generation, but any resulting behavior still needs actual lived evidence before becoming canonical personality.

This preserves the creative Universe City concept without confusing symbolic systems with observed psychology.

## 40. Identity claims can stabilize behavior

Once a person says:
- "I'm organized"
- "I'm shy"
- "I'm a leader"
- "I'm bad with money"

that claim may influence future choices.

But the engine also tracks contradicting evidence.

Identity can become self-reinforcing without becoming objectively true in every context.

## 41. Narrative identity develops later than basic behavior

Young children can have temperament and learned patterns without a sophisticated life narrative.

Narrative identity should become richer through adolescence and adulthood as people begin linking past, present, and future into stories.

Do not backfill adult-level narrative sophistication into infancy.

## 42. Actor / Agent / Author model

For any adult period, Genesis should be able to summarize:

### Actor
How does this person characteristically behave in major contexts?

### Agent
What are they currently trying to achieve, protect, avoid, or become?

### Author
What story do they currently tell about who they are and how they got here?

These layers may disagree.

That disagreement is valuable.

## 43. Contradiction is data

Examples:
- sees self as independent but frequently seeks family help
- seen as confident at work but feels uncertain privately
- values spontaneity but lives by a rigid schedule
- thinks they are bad with money despite years of responsible behavior

Do not automatically "fix" the contradiction.

Store it.

## 44. Personality uncertainty

Every derived personality claim needs:
- evidence count
- evidence diversity
- time coverage
- context coverage
- confidence
- contradicting evidence

A person observed only at work should not receive high-confidence conclusions about romantic behavior.

## 45. Personality change log

Broad changes should be represented as derived observation periods.

Example:

~~~
AGE 18–23
low social confidence in unfamiliar groups

AGE 23–29
increasing confidence after repeated customer-facing work

AGE 29+
moderate-high confidence in professional unfamiliar-group settings
~~~

Do not overwrite the earlier pattern.

## 46. Current Personality Snapshot

Create a derived view for use by Dialogue Engine / UI.

~~~ts
type PersonalitySnapshot = {
  as_of_date: string

  stable_tendencies: DerivedTraitRef[]
  context_specific_tendencies: DerivedTraitRef[]

  current_states: StateRef[]

  strongest_goals: GoalRef[]
  strongest_values: ValueRef[]

  self_efficacy: Record<string, DerivedObservationRef>

  coping_patterns: DerivedObservationRef[]
  conflict_patterns: DerivedObservationRef[]

  private_identity_claims: IdentityClaimRef[]
  presented_self: StateRef[]
  reputations: ReputationRef[]

  active_roles: RoleRef[]

  relationship_models: BeliefRef[]

  major_personality_change_periods: Reference[]

  important_contradictions: DerivedObservationRef[]

  uncertainty_notes: string[]
}
~~~

Every item must be traceable to evidence.

## 47. Generation flow

During simulation:

~~~
1. Load latent reproducible priors.
2. Load current state and context.
3. Load learned expectations/beliefs.
4. Load role demands.
5. Load relationship-specific history.
6. Generate behavior probabilities.
7. Choose behavior under constraints.
8. Persist actual behavior/event.
9. Apply consequences.
10. Update short-term state.
11. Update reinforcement history.
12. Periodically detect repeated tendencies.
13. Only after sufficient evidence, create/update derived personality observations.
14. Update self-concept only through actual reflection/social feedback/events.
~~~

## 48. Prevent circular generation

Forbidden loop:

~~~
"She is conscientious"
→ therefore she plans
→ planning proves she is conscientious
~~~

Correct loop:

~~~
latent planning bias + learned success with planning
→ repeated planning behavior
→ planning works repeatedly
→ planning tendency strengthens
→ derived observation: strong planning/reliability pattern
~~~

The derived label comes last.

## 49. Age/development rule

The same behavior can mean different things at different developmental stages.

Do not interpret:
- toddler inhibition,
- teenage social caution,
- adult workplace reserve

as automatically the same stable trait.

Developmental context matters.

## 50. Culture rule

Personality expression is affected by norms for:
- emotional display
- deference
- independence
- family obligation
- conversational style
- gender roles
- authority
- public/private behavior

Phase C supplies historical/cultural norms.

The engine must avoid turning norm-conforming behavior into simplistic personality labels.

## 51. Clinical boundary

Do not derive psychiatric or personality-disorder diagnoses from personality patterns.

A diagnosis requires appropriate generated clinical evaluation.

The personality engine describes:
- tendencies,
- behaviors,
- beliefs,
- coping,
- goals,
- self-concept,
- reputation.

It does not diagnose.

## 52. Completion criteria for Phase B

Phase B is conceptually complete when:

- temperament can bias behavior without becoming canonical fact,
- behavior can be context-specific,
- trait/state/role/identity/reputation are separated,
- personality can remain recognizable while changing,
- goals and motives are represented,
- coping and self-efficacy are domain-specific,
- role investment can shape behavior,
- person–environment feedback loops exist,
- standardized trait models are derived rather than causal,
- astrology/typologies are cleanly separated from empirical evidence,
- uncertainty and contradictory evidence are first-class,
- the future Dialogue Engine can consume a current Personality Snapshot,
- and every personality conclusion can answer "what evidence supports this?"

## Next phase

Phase C — Culture + Historical World Engine.

Phase C must provide the environments that personality and texture develop inside:
- era
- geography
- language
- local institutions
- household material conditions
- technology
- media
- social norms
- economic conditions
- public events
- available opportunities
- historically plausible products/culture
