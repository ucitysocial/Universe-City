
# Human Texture Engine — Phase A Specification

> Status: ACTIVE DESIGN
>
> Parent roadmap: GENESIS_MASTER_PLAN.md
>
> Purpose: make every generated person recognizable as one specific human without breaking the event-first, provenance-first Genesis architecture.

## 1. Core principle

Human texture is not a bag of randomly assigned favorites and quirks.

Texture emerges through:

~~~
EXPOSURE
→ REACTION
→ REPEATED CONTACT
→ ASSOCIATION
→ PREFERENCE / AVERSION
→ HABIT / STYLE / IDENTITY
→ REVISION OVER TIME
~~~

Not every preference needs a dramatic cause. Some arise through ordinary repetition, novelty, convenience, sensory fit, peer influence, imitation, access, or chance.

The engine must preserve the difference between:
- what the person likes,
- what they do often,
- what they are good at,
- what they identify with,
- what other people associate with them,
- and what is merely currently available.

## 2. Storage rule

Do not create one giant human_texture canonical table.

Use the architecture already defined:

- person_state_periods for time-bounded texture state
- life_events for meaningful exposures, acquisitions, transitions, discoveries, and losses
- person_memories for remembered associations
- person_interpretations for meaning attached to experiences
- person_identity_claims when texture becomes part of self-definition
- person_narratives for larger stories such as "music was how I connected with my dad"
- assets + ownership periods for significant objects
- derived_observations for compact texture summaries or inferred recurring patterns

Recommended person_state_periods.domain values:

~~~
speech
communication
humor
expressive_behavior
sensory
food
music
media
style
grooming
space
leisure
hobby
social_ritual
affection
relationship_expression
comfort
digital_expression
personal_ritual
quirks
preferences
aversions
nostalgia
~~~

A domain may have multiple non-overlapping periods as the person changes.

## 3. Provenance requirement

Every meaningful texture item should be able to answer:

~~~
WHEN did this begin?
WHAT exposed the person to it?
WHY did it persist, if it persisted?
WHO influenced it?
WHERE does it show up?
WHAT exceptions exist?
WHAT later changed it?
~~~

Useful origin references:
- source events
- source people
- locations
- organizations
- media/world exposures
- memories
- repeated routine periods

Not every tiny preference requires a named origin story, but it must at least be historically possible given access and exposure.

## 4. Evidence ladder

Texture claims should carry an evidence type.

Strongest to weakest:

1. Observed repeated behavior
2. Direct resident statement
3. Persistent routine or purchase pattern
4. Repeated reports from close others
5. Single observed behavior
6. Inference from related behavior

A derived texture summary should never present level 6 as certain fact.

Example:

~~~
"Usually orders iced coffee"
= repeated behavior

"Favorite drink is iced coffee"
= canonical only if resident states it or long-term evidence strongly supports it
~~~

## 5. Preference model

Use a reusable preference structure inside state JSON:

~~~ts
type PreferenceState = {
  subject: string
  valence:
    | "strong_like"
    | "like"
    | "neutral"
    | "dislike"
    | "strong_dislike"

  strength: number
  first_observed_at: string
  contexts: string[]

  origin_refs: Reference[]
  reinforcement_refs: Reference[]
  exception_contexts?: string[]

  identity_relevance:
    | "none"
    | "low"
    | "moderate"
    | "high"

  social_visibility:
    | "private"
    | "close_circle"
    | "public"

  current: boolean
}
~~~

Preference is not the same as frequency. A person may love a food they rarely eat because it is expensive or unavailable.

## 6. Exposure before preference

The engine cannot casually generate a preference for something the person has never plausibly encountered.

Before assigning a specific food, artist, film, fashion style, sport, hobby, brand, technology, or cultural reference, check:
- historical availability,
- geographic availability,
- household access,
- peer/media exposure,
- financial access,
- age appropriateness.

Phase C — Culture + Historical World Engine will supply much of this catalog/context. Until then, Phase A defines the rule and uses generalized categories where historical availability is not grounded.

## 7. Familiarity is separate from liking

Track:

~~~
never encountered
aware of
briefly exposed
familiar
experienced
regularly consumed/used
expert/enthusiast
~~~

Someone can be highly familiar with something they dislike.

## 8. Speech fingerprint

Speech must emerge from caregivers, geography, peers, school, media, work, relationships, and moves.

State should be able to represent:

~~~ts
type SpeechTextureState = {
  primary_languages: string[]
  secondary_languages: string[]

  dialect_influences: Reference[]

  vocabulary_register: string
  typical_sentence_length: string
  speaking_pace: string
  pause_pattern: string

  filler_words: WeightedPhrase[]
  discourse_markers: WeightedPhrase[]

  hedging_level: number
  directness_by_context: Record<string, number>
  profanity_frequency_by_context: Record<string, number>

  slang_sources: Reference[]
  terms_of_address: WeightedPhrase[]
  habitual_phrases: WeightedPhrase[]

  storytelling_style: {
    detail_level: number
    chronology_preference: string
    tangent_frequency: number
    impression_use: number
    exaggeration_frequency: number
  }

  code_switch_profiles: Record<string, SpeechContextProfile>
}
~~~

Never assign speech from ethnicity stereotypes. Speech must come from actual exposure history.

## 9. Code-switching

The same person may speak differently with:
- parents
- siblings
- childhood friends
- romantic partner
- coworkers
- supervisor
- customers
- strangers
- online audiences

Code-switching is contextual adaptation, not inconsistency.

## 10. Texting / messaging fingerprint

Within communication or digital_expression state, track:
- capitalization
- punctuation
- emoji frequency
- emoji repertoire
- reaction use
- voice-note frequency
- response latency pattern
- double-text behavior
- paragraph vs short-burst messages
- meme/GIF use
- screenshot sharing
- link sharing
- typo correction behavior
- greeting/closing habits

These evolve as technology and peer groups change.

## 11. Humor engine

Avoid "sarcastic = true."

Represent:

~~~ts
type HumorTextureState = {
  primary_modes: WeightedMode[]

  delivery: {
    deadpan: number
    animated: number
    storytelling: number
    facial_expression: number
    timing: number
  }

  audience_sensitivity: number

  uses_humor_when: {
    nervous: number
    angry: number
    flirting: number
    comforting: number
    deflecting: number
    bonding: number
  }

  preferred_targets: string[]
  protected_topics: string[]

  teasing_style: string
  self_deprecation_frequency: number

  laugh_profile: {
    frequency: number
    volume: string
    physical_tells: string[]
  }

  influence_refs: Reference[]
}
~~~

Humor changes by audience. A person may roast siblings but never coworkers.

## 12. Expressive behavior / mannerisms

We need physical human signals without turning people into caricatures.

Track a small set of recurring mannerisms with probabilities and contexts:
- facial reactions
- eye contact pattern
- hand use while speaking
- posture shifts
- pacing
- hair touching
- covering face when laughing
- looking away when embarrassed
- quieting when angry
- speaking faster when excited
- checking phone when uncomfortable

Rule: a person should have a few strong recurring tells, not twenty gimmicks.

## 13. Emotional expression profile

Separate:

~~~
INTERNAL EMOTION
OUTWARD EXPRESSION
REGULATION ACTION
SOCIAL INTERPRETATION
~~~

Track common outward patterns for joy, embarrassment, nervousness, anger, disappointment, affection, grief, and excitement.

Do not infer psychiatric diagnosis from expressive style.

## 14. Sensory texture

Use person_state_periods.domain = sensory.

Possible dimensions:
- preferred lighting
- preferred room temperature
- noise tolerance
- background-noise preference
- texture preferences/aversions
- scent preferences/aversions
- food texture sensitivity
- crowd tolerance
- touch preferences
- sleep-environment preferences

A sensory preference may originate from simple fit rather than trauma or diagnosis.

## 15. Food texture

Food history should distinguish:

~~~
HOUSEHOLD FOOD
AVAILABLE FOOD
LIKED FOOD
COMFORT FOOD
CELEBRATION FOOD
ASPIRATIONAL FOOD
FOOD THE PERSON CAN COOK
FOOD THEY ACTUALLY BUY
~~~

Track:
- staple meals
- comfort meals
- disliked foods
- texture aversions
- spice tolerance
- sweetness preference
- restaurant behavior
- ordering tendencies
- cooking competence
- meal timing
- food rituals
- culturally/family-associated dishes
- foods tied to people or memories
- budget effects

Allergies and medically required restrictions belong to health, not preference.

## 16. Music texture

Music needs chronology.

Represent:
- first remembered music environment
- caregivers' music
- peer music
- personal discoveries
- genre preferences by period
- artists/songs where historically available
- always-skip styles
- live-music behavior
- listening contexts
- songs attached to memories
- relationship associations
- workout/driving/cleaning playlists
- nostalgia periods

Distinguish likes, knows, owns/saved, identifies with, and associates with a person/event.

## 17. Media texture

Track film, television, books, podcasts/radio where available, games, and online creators/platform content.

State may include:
- genre map
- comfort rewatch items
- social viewing habits
- solo viewing habits
- spoiler tolerance
- quote/reference habits
- fandom intensity
- abandoned tastes
- media tied to life periods

Availability comes from the World Engine.

## 18. Clothing and style

Do not generate one eternal aesthetic.

Create style eras.

Each may include:
- silhouettes
- formality
- comfort priorities
- color tendencies
- footwear
- accessories
- grooming coordination
- dress-code constraints
- budget/access
- style influences
- self-consciousness
- experimentation
- desired vs actual presentation

A style era can begin because of school transition, peer group, workplace, relationship, body change, new income, move, media exposure, or identity experimentation.

## 19. Grooming / beauty

Track where relevant:
- hair routines
- haircuts/colors
- skincare
- makeup
- shaving/facial hair
- nails
- fragrance
- bathing/shower routines
- professional grooming requirements

Avoid normative judgments such as "well groomed" unless tied to a specific context's documented expectations.

## 20. Photography / image behavior

Possible state:
- camera comfort
- selfie frequency
- posed vs candid preference
- smile behavior
- favorite angles
- photo editing intensity
- keeps vs deletes photos
- documents food/travel/events
- posts vs archives privately

Technology availability must be historically valid.

## 21. Space / home texture

Home is not only clean or messy.

Track:
- preferred lighting
- scent
- background sound
- decorating style
- sentimental display
- furniture priorities
- clutter hotspots
- surface-clearing habits
- guest readiness
- shoes in/out
- bed-making
- kitchen use
- favorite seat
- privacy habits
- hosting behavior
- seasonal decorating
- room personalization

Household state must distinguish individual preference from negotiated shared reality.

## 22. Objects and material attachment

Meaningful possessions must exist as assets when appropriate.

Texture may identify:
- always-carried items
- sentimental possessions
- collections
- kept-too-long items
- functional favorite objects
- inherited objects
- travel souvenirs
- old technology retained
- notebooks/letters/photos

Objects require an acquisition path. Do not materialize sentimental objects retroactively without an event or plausible prior ownership.

## 23. Hobbies and interests

Represent hobby periods with:
- first exposure
- active period
- frequency
- competence
- confidence
- social vs solo
- equipment
- spending
- identity relevance
- community around hobby
- hiatuses
- returns

~~~text
plays guitar
≠
good at guitar
≠
calls self a guitarist
~~~

Keep those separate.

## 24. Random expertise

People often know a surprising amount about something because of life history.

Random expertise must trace to:
- job
- hobby
- family member
- repeated problem
- fandom
- education
- personal project

This produces believable conversational depth.

## 25. Social rituals

Track recurring interpersonal habits:
- weekly call
- brunch
- birthday routine
- holiday tradition
- friend-group memes
- regular restaurant
- annual trip
- game night
- coffee walk
- work lunch

Social ritual requires participants and time.

## 26. Personal rituals

Examples:
- bedtime sequence
- morning drink
- leaving-home checklist
- shower order
- Sunday reset
- payday routine
- pre-interview routine
- travel packing ritual
- cleaning music

These are repeated behaviors stored as state/habit periods.

## 27. Comfort behavior

When tired, sick, lonely, overwhelmed, or disappointed, what does the person actually do?

Possible domains:
- food
- media
- music
- sleep
- cleaning
- calling someone
- going outside
- driving
- shopping
- gaming
- exercise
- isolation
- work

Comfort behavior must be learned from repeated actual responses, not assigned as an identity label.

## 28. Affection and relationship expression

For adults, track non-explicit interpersonal style such as:
- verbal affection
- physical affection
- practical help
- gift giving
- time together
- reassurance
- checking in
- privacy needs
- public affection comfort
- terms of endearment
- celebration style
- conflict repair gestures

For minors, keep all relationship/romantic content age-appropriate and non-explicit.

Sexual identity/orientation and intimate boundaries, when relevant, belong to identity/relationship history and should never be inferred from stereotypes.

## 29. Flirting style

Adult-only generation may represent:
- teasing
- compliments
- eye contact
- prolonged conversation
- acts of service
- direct expression
- nervous withdrawal
- playful texting

Context dependent, not a universal flirtiness score.

## 30. Gift-giving texture

Track:
- practical vs sentimental
- planned vs last-minute
- budget behavior
- wrapping/presentation
- handmade tendency
- experience gifts
- remembers dates
- buys when reminded
- keeps gift lists

Gift behavior can differ by relationship.

## 31. Hosting behavior

Possible dimensions:
- enjoys hosting vs avoids it
- advance planning
- food preparation
- cleanliness pressure
- playlist/music
- seating
- lighting
- cleanup
- overnight guest comfort
- make-yourself-at-home vs structured host

This interacts with household state.

## 32. Embarrassment profile

Track outward behaviors, not labels.

Examples:
- laughs
- goes quiet
- explains excessively
- changes subject
- blushes
- makes a joke
- becomes defensive
- avoids eye contact

Different contexts may produce different responses.

## 33. Anger / irritation texture

Differentiate irritation, anger, and conflict action.

Possible tells:
- clipped speech
- silence
- swearing
- direct confrontation
- leaving
- cleaning
- sending long message
- delayed conversation

Do not equate anger expression with moral character.

## 34. Pet peeves / micro-frictions

A believable person has low-stakes annoyances.

Examples:
- people blocking doorways
- wet bathroom floor
- loud chewing
- unreadable group chats
- lateness
- clutter on one specific surface
- low phone battery

Do not generate dozens. A few repeated annoyances can emerge from routine and preference collisions.

## 35. Alone-at-home behavior

A useful texture view can summarize:
- background sound
- clothing
- food
- phone use
- chores
- lighting
- movement through home
- bedtime drift
- self-talk / singing / silence
- hobbies
- privacy rituals

This should derive from routines and repeated behavior.

## 36. Leisure texture

Track what free time becomes when there is genuinely no obligation.

Distinguish:
- desired leisure
- actual leisure
- restorative leisure
- default time-killing behavior

Example:

~~~
says she wants to read
actually scrolls
feels restored by walking
~~~

Those can all coexist.

## 37. Nostalgia engine

Nostalgia should be tied to:
- places
- people
- songs
- smells
- foods
- seasons
- objects
- brands
- media
- school periods
- homes

Use memory associations. A sensory cue may activate a memory without changing canon.

## 38. Repeated stories

People retell some stories.

Track:
- story subject
- first known telling
- audiences
- frequency
- punchline or framing
- embellishment drift
- emotional role

A repeated story may become part of public identity.

## 39. Signature phrases

A phrase can originate from:
- family
- region
- friend
- media
- workplace
- self-created habit

Store source where known.

Signature phrases should be used probabilistically and sparingly in generated dialogue.

## 40. Texture inheritance / imitation

People imitate others.

Possible mechanisms:
- child adopts parent's phrase
- siblings share humor
- partner introduces music
- coworker changes professional speech
- friend changes slang
- grandparent influences cooking

This should create explicit influence links.

Influence does not mean identical outcome.

## 41. Texture divergence

The engine should deliberately permit:
- rejecting family taste
- developing opposite cleanliness standards
- avoiding parents' music
- refusing a community norm
- changing style after leaving home

Exposure can create adoption or rejection.

## 42. Contextual contradiction is expected

Examples:
- loves loud concerts but needs silence to sleep
- highly stylish outside, wears old clothes at home
- adventurous eater socially, repetitive eater alone
- talkative with friends, quiet at work
- very tidy kitchen, chaotic closet

Do not resolve these as data errors.

## 43. Current vs historical taste

Every texture query should support a time.

Questions:
- What did she listen to at 14?
- What did she wear at 22?
- What food did she hate as a child but like at 35?
- When did she start drinking coffee?
- Which hobby disappeared after becoming a parent?

Therefore states need clear start/end periods.

## 44. Availability vs affordability

Track separately:
- preference
- access
- affordability
- frequency

This matters for food, fashion, travel, hobbies, technology, beauty, and entertainment.

## 45. Identity relevance

Some tastes are just tastes. Others become identity.

Only promote to person_identity_claims when behavior or self-description supports it.

## 46. Socially learned taste

A person may consume something because:
- partner likes it
- friend group does
- workplace norm
- family ritual
- social aspiration

Consumption is not automatically personal preference.

## 47. Texture decay and return

Taste/habit states can:
- strengthen
- weaken
- go dormant
- be abandoned
- return through nostalgia or renewed access

A returned hobby should link to its earlier history rather than becoming a totally new unrelated fact.

## 48. Human Texture Snapshot

For use by dialogue/UI later, create a derived view, not a canonical table.

~~~ts
type HumanTextureSnapshot = {
  as_of_date: string

  speech_signature: string[]
  code_switch_contexts: string[]

  humor_signature: string[]
  expressive_tells: string[]

  strongest_current_preferences: PreferenceRef[]
  strongest_current_aversions: PreferenceRef[]

  food_signature: string[]
  music_signature: string[]
  media_signature: string[]

  style_signature: string[]
  grooming_signature: string[]

  home_signature: string[]

  active_hobbies: string[]
  random_expertise: string[]

  comfort_behaviors: string[]

  affection_style: string[]
  social_rituals: string[]
  personal_rituals: string[]

  significant_objects: AssetRef[]

  pet_peeves: string[]

  nostalgia_anchors: MemoryRef[]

  repeated_stories: string[]
  signature_phrases: string[]
}
~~~

Each item must link to source evidence.

## 49. Dialogue usage rule

The future Dialogue Engine will receive the texture snapshot, but it must treat texture as probabilistic context.

Do:
- occasionally use habitual phrasing
- preserve vocabulary and pacing
- change voice by audience
- use relevant humor style
- reference known tastes when contextually appropriate

Do not:
- mention five quirks in every message
- repeat signature phrases unnaturally
- turn preferences into gimmicks
- surface private knowledge the speaker does not have

## 50. Texture density rule

A person should feel rich, not cluttered.

Recommended at a given time:
- 2–5 strong speech markers
- 1–3 recognizable humor modes
- 2–4 expressive tells
- 5–12 meaningful current taste/preferences across major domains
- 2–6 active hobbies/interests
- 1–4 strong comfort behaviors
- 2–5 personal/social rituals
- 2–6 meaningful objects
- a small number of recurring pet peeves

Historical states can be much larger because old phases remain archived.

## 51. Childhood generation

Texture starts early.

Early sources:
- caregivers' voices
- household food
- household music
- comfort objects
- sensory environment
- favorite play
- recurring shows/books
- early clothing control
- family rituals
- imitation

Distinguish child choice from caregiver choice.

## 52. Adolescence generation

Increase:
- peer influence
- media influence
- private taste
- style experimentation
- slang
- music identity
- digital expression
- room personalization
- humor differentiation
- favorite places
- social rituals

Adolescence is a major texture-formation period but not the endpoint.

## 53. Adult generation

Adult texture responds to:
- independent money
- home control
- workplace
- partners
- children
- moves
- travel
- changing media
- income
- health
- time scarcity
- community
- aging

Preferences can expand, simplify, or reverse.

## 54. Later-life continuity

Do not genericize older adults.

Continue:
- fashion
- humor
- music
- media
- hobbies
- food
- dating/affection
- technology
- home aesthetics
- travel
- rituals

Later life should retain accumulated texture while allowing adaptation.

## 55. Generator flow for texture

During each simulation interval:

~~~
1. Load current texture state.
2. Identify actual exposures created by events/world/relationships.
3. Generate immediate reaction.
4. Check whether exposure repeats or matters.
5. Update familiarity.
6. Update preference/aversion if warranted.
7. Update habit/routine if behavior repeats.
8. Update identity only if evidence supports identity relevance.
9. Create memory association if salient.
10. Close/open state periods when a meaningful change occurs.
~~~

## 56. Texture event examples

Events that can alter texture:
- parent introduces food/music
- friend shares artist
- first concert
- move to new region
- begins restaurant job
- gets own bedroom
- first apartment
- partner introduces hobby
- child changes household media
- receives sentimental gift
- discovers grooming routine
- joins sports league
- gets camera/phone
- loses treasured object
- revisits childhood home
- retires and resumes hobby

## 57. Texture validation

Before accepting a specific texture item, ask:

### Temporal
Did this exist at the time?

### Exposure
How did the person encounter it?

### Access
Could they afford/access it?

### Context
Does the context make sense?

### Continuity
Does it conflict with prior state, or is there an event explaining the change?

### Knowledge
If it involves another person's preference or private information, does the resident know it?

### Stereotype
Was this generated from actual history, or from a demographic shortcut?

If the stereotype check fails, reject/regenerate.

## 58. Anti-stereotype rule

Do not infer food, music, slang, religion, hobbies, clothing, sexuality, personality, or family behavior from race/ethnicity/nationality alone.

Culture may affect exposure and availability through explicit family/place/world history, but individual response must still be generated.

## 59. Mundane detail rule

Human texture is allowed to be ordinary.

Examples:
- prefers the small spoon
- keeps receipts in one drawer
- hates wet socks
- always watches something while folding laundry
- orders the same side dish
- forgets umbrellas

These details should appear sparingly and through repeated life behavior.

They are valuable precisely because they are not dramatic.

## 60. Completion criteria for Phase A

Phase A is conceptually complete when:

- all major texture domains have a representation,
- every domain is time-aware,
- storage fits existing canonical architecture,
- preference is separated from frequency/access/identity,
- texture can trace to exposure and history,
- code-switching and contextual contradiction are supported,
- minors remain age-appropriate,
- older adults remain fully textured,
- the Dialogue Engine can consume a compact derived snapshot,
- no demographic shortcut is required,
- and we can generate a resident whose small details remain recognizable across decades.

## Next phase dependency

Phase B — Temperament → Personality Development Engine

Phase B will consume:
- observed behavior,
- response patterns,
- social presentation,
- communication texture,
- coping behavior,
- relationship behavior,
- skills/confidence,
- repeated choices,
- and context-specific tendencies.

It must not convert texture into simplistic permanent personality labels.
