
# Human Interaction + Dialogue Engine — Phase D Specification

> Status: ACTIVE DESIGN
>
> Parent roadmap: GENESIS_MASTER_PLAN.md
>
> Depends on:
> - HUMAN_TEXTURE_ENGINE.md
> - PERSONALITY_DEVELOPMENT_ENGINE.md
> - CULTURE_HISTORICAL_WORLD_ENGINE.md
>
> Purpose: allow simulated people to interact as themselves while respecting what they know, what they want, who they are speaking to, the relationship history, the medium, the surrounding world, and what they intentionally choose not to say.

## 1. Dialogue is not generated from personality alone

Canonical order:

~~~
CONTEXT
→ SPEAKER GOAL
→ SPEAKER KNOWLEDGE
→ SPEAKER BELIEFS / MEMORY
→ RELATIONSHIP + POWER
→ DISCLOSURE DECISION
→ SEMANTIC MESSAGE
→ VOICE / HUMOR / TEXTURE RENDER
→ LISTENER PERCEPTION
→ LISTENER INTERPRETATION
→ RESPONSE
→ CONSEQUENCES
~~~

Voice comes late.

A catchphrase must never cause the content.

## 2. Interaction scope

Support:
- in-person conversation
- phone
- text message
- direct message
- group chat
- email
- video call
- workplace communication
- public/social post where relevant
- asynchronous no-response / delayed response

The World Engine determines whether a medium exists and is available in the current era.

## 3. Interaction persistence

Do not store full transcripts of every mundane exchange.

Use two persistence levels.

### Ordinary interaction
Store:
- participants
- context
- broad content
- outcome
- relationship/knowledge changes if any

### Salient interaction
Store:
- interaction session
- meaningful turns or exact generated utterances
- interpretations
- decisions
- knowledge transfer
- emotional/relationship consequences

This prevents database explosion while preserving important dialogue.

## 4. Interaction session

A justified new relational container:

~~~ts
type InteractionSession = {
  id: string

  started_at: string
  ended_at?: string

  medium:
    | "in_person"
    | "phone"
    | "text"
    | "dm"
    | "group_chat"
    | "email"
    | "video"
    | "public_post"
    | "other"

  location_id?: string

  participant_ids: string[]

  relationship_context: string
  role_context?: string

  privacy_context:
    | "private"
    | "semi_private"
    | "group"
    | "public"

  initiating_event_id?: string

  summary?: string

  salience: number
}
~~~

Recommended SQL implementation later:
- interaction_sessions
- interaction_participants
- interaction_turns only for turns worth preserving

## 5. Conversation goal

Each active speaker may have one or more goals:

- inform
- ask
- coordinate
- seek support
- offer support
- bond
- entertain
- flirt
- reassure
- repair
- apologize
- confront
- negotiate
- persuade
- impress
- protect privacy
- avoid
- delay
- end conversation
- fulfill professional role

Goal strength may change during the interaction.

## 6. Explicit goal and hidden motive are separate

Example:

~~~
EXPLICIT
"Just checking whether you're coming."

PRIVATE MOTIVE
wants reassurance that friend still values relationship
~~~

Do not require hidden motives for every conversation.

Most coordination can simply be coordination.

## 7. Knowledge gate

Before a speaker can state a factual claim, determine:

1. Does the relevant information item exist?
2. Does the speaker know/suspect/believe it?
3. How confident are they?
4. Where did they learn it?
5. Is their memory accurate?
6. Are they willing to disclose it here?

A speaker cannot use Author-only truth.

## 8. Knowledge does not equal disclosure

The speaker may know something and choose not to say it because of:
- privacy
- loyalty
- shame
- professional role
- fear of conflict
- strategic withholding
- uncertainty
- audience presence
- social norm

Disclosure is a decision.

## 9. Sparse metaknowledge

Realistic dialogue sometimes requires:

> What does A believe B knows?

Add an optional sparse structure only where needed.

Recommended future table:

~~~ts
information_meta_awareness {
  information_item_id
  observer_person_id
  target_person_id

  believed_awareness_state
  confidence

  formed_at
  updated_at
}
~~~

Do not populate this exhaustively.

Create it when:
- someone explicitly told another person,
- knowledge secrecy matters,
- disclosure strategy depends on it,
- misunderstanding about who knows becomes important.

## 10. Memory gate

A person can reference:
- a canonical event they remember,
- an inaccurate/reconstructed memory,
- something learned secondhand.

Dialogue should use the person's memory record, not raw Author canon.

Example:

~~~
CANON
event occurred at age 8

CURRENT MEMORY
believes it happened around age 10

DIALOGUE
"I think I was about ten..."
~~~

That is correct character behavior.

## 11. Truth status of utterances

A spoken claim can be:

- believed_true
- uncertain
- mistaken
- intentionally_misleading
- intentionally_false
- playful/fictional
- sarcastic/nonliteral

Do not interpret every false statement as a lie.

## 12. False information propagation

If Person A confidently tells Person B something false:

~~~
A false belief
→ utterance
→ B hears it
→ B may believe it
~~~

This can create a false information item / awareness state for B.

Canon remains unchanged.

## 13. Semantic message before style

Generate the underlying communicative act first.

Example:

~~~
SEMANTIC MESSAGE
I am hurt that you did not invite me,
but I do not want to directly accuse you.

VOICE RENDER
depends on this person's speech/humor/context.
~~~

This prevents style from replacing meaning.

## 14. Voice rendering

After semantic content is chosen, apply:
- vocabulary
- syntax
- sentence length
- pacing
- directness
- hedging
- profanity
- slang
- habitual discourse markers
- terms of address
- code-switching
- humor
- texting conventions

Use HumanTextureSnapshot.

## 15. Do not caricature dialect

Avoid heavy phonetic spelling of accents/dialects as a default.

Prefer:
- vocabulary
- syntax
- discourse markers
- rhythm descriptions where needed
- context-specific code-switching

The goal is recognizable speech, not parody.

## 16. Age-appropriate language

Vocabulary, topic, self-awareness, humor, and reasoning must fit:
- age
- education
- language exposure
- developmental stage
- context

A six-year-old should not speak with the reflective narrative sophistication of their 42-year-old future self.

## 17. Multilingual interaction

Language choice depends on:
- proficiency
- listener proficiency
- relationship habit
- topic
- emotional context
- social setting

If the system cannot reliably render a language, it may store:
- language used
- semantic content
- translated display version

rather than pretending fluent native dialogue.

## 18. Relationship gate

The same semantic message renders differently with:
- mother
- sibling
- best friend
- new date
- supervisor
- subordinate
- stranger

Use:
- relationship state
- relationship perspective
- trust
- intimacy
- grievances
- history
- power
- contact norms

## 19. Power / role gate

Role affects:
- directness
- disclosure
- politeness
- consequences
- interruption
- acceptable humor
- response obligation

Relevant contexts:
- parent/child
- teacher/student
- manager/employee
- client/service
- caregiver/care recipient
- professional authority

Power is contextual, not a permanent personal score.

## 20. Audience gate

A person may say something privately that they will not say:
- in a group chat
- around family
- in front of children
- at work
- publicly online

Privacy_context must influence generation.

## 21. Current state

Interaction generation consumes current:
- fatigue
- time pressure
- emotional state
- intoxication only if canonically generated
- health discomfort
- recent conflict
- current priorities

Temporary state can change ordinary voice without rewriting personality.

## 22. Listener perception

The listener does not receive pure semantic intent.

They receive:
- actual words
- tone cues
- medium limitations
- relationship expectations
- their own emotional state
- their own beliefs
- prior grievances

Therefore intended meaning and perceived meaning can differ.

## 23. Listener interpretation

Store important misunderstandings as interpretations.

Example:

~~~
SPEAKER INTENT
needs space because overwhelmed

LISTENER INTERPRETATION
"she is losing interest in me"
~~~

That interpretation can influence later behavior even if canonically inaccurate.

## 24. Miscommunication should be plausible, not constant

Potential sources:
- ambiguous wording
- missing tone in text
- delayed response
- partial knowledge
- language difference
- prior grievance
- assumption about motive
- message sent to wrong audience

Do not generate drama merely because miscommunication is possible.

## 25. Repair sequence

Interactions can contain:
- clarification
- correction
- apology
- reassurance
- humor
- rephrasing
- evidence
- pause
- later follow-up

Repair may fully work, partly work, or fail.

## 26. Conflict dialogue

Conflict generation must consume:
- actual trigger
- underlying pressures
- each person's interpretation
- conflict behavior tendencies
- relationship history
- current capacity
- stakes

Do not make every disagreement expose childhood trauma.

Most conflicts can stay mundane.

## 27. Silence is behavior

A person can:
- not answer
- delay
- leave
- change topic
- read without replying
- give minimal response
- decline to discuss

No-response can have consequences and interpretations.

## 28. Response latency

Messaging behavior should account for:
- work/school
- sleep
- device access
- era
- relationship norms
- urgency
- intentional delay
- ordinary distraction

Do not turn every late reply into relationship meaning.

## 29. Group conversations

In groups, track:
- who is present
- who can hear/see each turn
- side conversations
- alliances
- role/status
- jokes that depend on shared knowledge
- information that becomes newly public

A secret disclosed in a group updates awareness for everyone who plausibly received it.

## 30. Humor use

Humor rendering consumes:
- humor profile
- audience
- protected topics
- relationship trust
- current state

Do not make a funny person joke every turn.

Timing and restraint are part of humor.

## 31. Flirting / affection

For adults, generate non-explicit relational interaction through:
- attention
- teasing
- compliments
- checking in
- eye contact
- invitations
- practical gestures
- affectionate terms
- playful texting

The relationship and consent/boundary context matter.

For minors, romantic content remains age-appropriate and non-explicit.

## 32. Professional communication

Work dialogue should consume:
- organization culture
- hierarchy
- role scope
- relationship history
- professional reputation
- current objective
- stakes

A resident may have a distinct professional persona.

## 33. Family communication

Family conversations may contain:
- old roles
- shorthand
- family-specific references
- inherited phrases
- recurring conflicts
- established rituals

But childhood patterns do not automatically control every adult family interaction.

## 34. Conversation can change knowledge

After each salient utterance:
- identify conveyed information items,
- update listener awareness,
- note uncertainty,
- update metaknowledge when speaker knows they disclosed it.

This is essential for future consistency.

## 35. Conversation can change relationship state

Do not update relationship quality from every sentence.

Meaningful interactions may alter:
- trust
- closeness
- grievance
- attraction
- perceived status
- reliability expectation

Changes require sufficient salience.

## 36. Conversation can create memories

Potentially memorable interactions:
- confession
- breakup
- proposal
- apology
- major argument
- meaningful praise
- bad news
- first meeting
- family story
- surprising disclosure

Ordinary logistics usually do not need durable memory records.

## 37. Conversation can create decisions

Example:

~~~
friend offers roommate arrangement
→ conversation
→ options become known
→ resident considers move
→ decision process opens
~~~

Dialogue can create opportunities without instantly determining outcomes.

## 38. Interaction can be a causal-thread node

Long-running threads may include conversations:
- repeated promotion requests
- unresolved sibling disagreement
- relationship repair
- parent-care coordination

Link salient interaction events to causal threads.

## 39. Digital communication evolves historically

The World Engine constrains:
- SMS
- email
- social networks
- smartphones
- voice notes
- group chats
- read receipts
- video calls

Do not backfill current messaging norms into earlier decades.

## 40. Public posting is not private conversation

A social post has:
- intended audience
- actual reachable audience
- public persona
- platform norm
- persistence
- potential secondary viewers

It may create information awareness for many people.

## 41. Conversation privacy and Assessment access

Author Truth may include all generated interaction.

The Universe City Life Assessment does not automatically receive:
- private texts
- private conversations
- other people's undisclosed thoughts
- hidden motives

Assessment access requires:
- resident disclosure,
- Agency interaction,
- legitimate documented source.

This rule must survive implementation.

## 42. Agency/Agent dialogue later uses the same foundations

The eventual Universe City Agent should use:
- resident-disclosed knowledge
- Agency record
- communication preferences where legitimately known
- conversational history

But it is not omniscient Genesis.

Genesis can simulate the human.
The Agent must earn knowledge through intake and ongoing interaction.

## 43. Dialogue validation passes

Before preserving a generated utterance:

### Knowledge
Could speaker know this?

### Memory
Is speaker recalling the version they actually remember?

### Temporal/world
Do referenced technology, media, places, organizations, and events exist at that time?

### Language
Does speaker have the relevant proficiency?

### Relationship
Would disclosure/style be plausible for this relationship?

### Role/power
Does the utterance ignore obvious professional/family constraints without a reason?

### Voice
Does it fit the current speech texture without becoming caricature?

### Privacy
Who heard it, and should awareness update?

### Developmental
Is the language/topic age appropriate?

## 44. Interaction generation flow

~~~
1. Create interaction context.
2. Resolve participants.
3. Load each participant's knowledge.
4. Load relevant memories/beliefs.
5. Load relationship state/perspectives.
6. Load goals and current emotional state.
7. Determine disclosure boundaries.
8. Generate semantic act for speaker.
9. Render semantic act through voice/medium.
10. Validate utterance.
11. Determine listener perception.
12. Generate listener interpretation.
13. Update knowledge if information transferred.
14. Generate response or silence.
15. Repeat until interaction naturally ends.
16. Summarize ordinary interaction or persist salient turns.
17. Apply relationship/state/memory/decision consequences.
~~~

## 45. Turn storage

For salient turns:

~~~ts
type InteractionTurn = {
  id: string
  interaction_session_id: string

  sequence: number
  speaker_person_id: string

  occurred_at: string

  semantic_intent: string
  utterance_text?: string

  truth_status?: string

  information_items_conveyed: string[]

  intentional_withholding?: string[]

  emotional_state?: JSON

  source_memory_ids?: string[]

  validation: JSON
}
~~~

Do not store private chain-of-thought style reasoning. Store only modeled semantic intent, observable utterance, state, and structured decision context.

## 46. No hidden internal monologue transcript

The simulator can maintain structured private state:
- goal
- belief
- emotion
- interpretation
- intended disclosure

It should not require prose "thought transcripts" as canon.

This keeps the model inspectable and avoids confusing generated narration with actual internal fact.

## 47. Dialogue quality test

A strong interaction should pass these tests:

- If names are removed, can the voices still be distinguished?
- Does each person only use knowledge they possess?
- Does each speaker sound different with different audiences when appropriate?
- Are misunderstandings traceable?
- Can the conversation materially change knowledge/relationship state?
- Do people sometimes communicate plainly rather than theatrically?
- Are signature quirks used sparingly?
- Does the interaction fit the historical medium?
- Could a future interaction correctly remember what was said?

## 48. Completion criteria for Phase D

Phase D is conceptually complete when:

- semantic content is generated before stylistic rendering,
- knowledge permissions gate speech,
- optional metaknowledge handles "who knows that they know,"
- memory can differ from canon,
- lies/mistakes/sarcasm are distinguishable,
- relationship and power context shape disclosure,
- group conversations update awareness correctly,
- silence and latency are behaviors,
- dialogue can create knowledge, memories, decisions, and relationship changes,
- ordinary interactions can be summarized without transcript explosion,
- historical communication technology is respected,
- minors remain age appropriate,
- the Life Assessment access boundary remains intact,
- and every preserved utterance can answer "why could this person say this, here, to this person, at this time?"

## Next phase

Phase E — Canonical Supabase SQL.

Before implementation, Phase E must reconcile the master schema with the new justified additions from Phases C and D:
- world_state_periods
- organization_state_periods
- cultural_items
- cultural_item_availability
- jurisdiction_rules
- source_registry
- optional information_meta_awareness
- interaction_sessions
- interaction_participants
- interaction_turns

It should also decide whether the event backbone should be renamed from life_events to the more general events table or retain life_events with an explicit event_scope.
