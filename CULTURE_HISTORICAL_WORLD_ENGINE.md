
# Culture + Historical World Engine — Phase C Specification

> Status: ACTIVE DESIGN
>
> Parent roadmap: GENESIS_MASTER_PLAN.md
>
> Depends on: HUMAN_TEXTURE_ENGINE.md and PERSONALITY_DEVELOPMENT_ENGINE.md
>
> Purpose: ensure that every resident is born into a historically, geographically, economically, technologically, linguistically, and culturally plausible world that continues changing independently of them.

## 1. Core rule

The resident does not generate the world around them.

The world already has:
- a date,
- a place,
- institutions,
- laws/rules,
- technology,
- media,
- prices,
- labor markets,
- transportation,
- schools,
- housing,
- public events,
- local norms,
- and other people.

Genesis places the resident inside that world and resolves what they are actually exposed to.

## 2. Three world modes

Every world fact must be tagged with a mode:

### Historical real
Before the simulation reference date and grounded in real historical data.

### Contemporary real
At/near the simulation reference date and grounded in current data.

### Simulated future
After the simulation reference date. This is explicitly hypothetical world state, never presented as known future fact.

A resident can live across all three modes.

Example:

~~~
Born: 1999 — historical real
Current simulation date: 2026 — contemporary real
Age 80 in 2079 — simulated future
~~~

## 3. Supported World Packs

Do not pretend to have equal precision for every place/year on Earth.

Create versioned World Packs.

~~~ts
type WorldPack = {
  id: string
  version: string

  geography_scope: LocationRef
  start_date: string
  end_date?: string

  coverage: {
    demographics: string
    economy: string
    education: string
    law: string
    technology: string
    media: string
    transport: string
    housing: string
    health_system: string
    culture: string
  }

  source_registry: SourceRef[]
  completeness_score: number
}
~~~

Genesis should prefer birth locations/time periods with strong pack coverage when accuracy mode is high.

## 4. Accuracy tiers

World facts should declare provenance/quality:

- Tier A: official primary data
- Tier B: authoritative historical/academic/reference source
- Tier C: reputable structured secondary source
- Tier D: modeled estimate
- Tier E: synthetic fallback

The engine must know when it is estimating.

## 5. Do not infer culture from race/ethnicity alone

Culture is generated from actual environmental exposure:
- family practices
- household language
- religion/faith if explicitly generated
- migration history
- neighborhood
- region
- school
- peers
- workplace
- media
- community organizations
- travel

Demographic identity may affect social context only when a specific historical/local mechanism is actually represented.

Never use demographic stereotypes as a shortcut for personality, slang, food, music, beliefs, religion, family dynamics, or behavior.

## 6. World state storage

Do not make one enormous world JSON document.

Use time-aware states.

Recommended architecture:

- locations
- organizations
- organization_locations
- world_state_periods
- organization_state_periods
- cultural_items
- cultural_item_availability
- jurisdiction_rules
- source_registry

World events should use the same general event backbone as resident events where possible.

Before SQL implementation, consider renaming life_events to events or adding event_scope so the same backbone can represent person, household, organization, location, and world events.

## 7. World state periods

~~~ts
type WorldStatePeriod = {
  id: string

  scope_type:
    | "global"
    | "country"
    | "region"
    | "city"
    | "neighborhood"

  scope_id?: string

  domain: string

  started_at: string
  ended_at?: string

  state: JSON

  world_mode:
    | "historical_real"
    | "contemporary_real"
    | "simulated_future"

  source_refs: SourceRef[]
  confidence: number
}
~~~

Possible domains:
- economy
- housing
- labor
- education
- transport
- technology
- media
- public_health
- climate
- public_safety
- infrastructure
- consumer_environment
- social_norms

## 8. Organizations also progress independently

Organizations may:
- open
- close
- move
- merge
- change programs
- change staffing
- change prices
- expand
- shrink

Use organization_state_periods for meaningful time-varying state.

A resident's employer must not remain frozen for 30 years unless its world history supports that.

## 9. Birth-place generation

The randomized birth seed should choose:

~~~
country
→ region/state/province
→ city/metro/rural area
→ plausible birth facility or setting
→ birth time
~~~

The location choice must be compatible with the generated family's current residence/migration history.

Do not randomly drop a birth into a location with no causal connection to the parents.

## 10. Migration / relocation context

Moves can occur because of:
- work
- family
- education
- housing cost
- relationship
- caregiving
- military/service
- immigration
- safety
- preference
- opportunity

A move changes exposure gradually.

The resident does not instantly acquire the local dialect, taste, or norms.

## 11. Household cultural environment

Generate a household culture state from actual household history.

Possible dimensions:
- household languages
- food practices
- holidays/rituals
- faith/religious practice if generated
- music/media environment
- family etiquette
- expectations around privacy
- expectations around education/work
- intergenerational contact
- migration stories
- regional traditions
- family-specific customs

This belongs primarily to household_state_periods, not demographic labels.

## 12. Language environment

Track:
- language spoken by caregivers
- language of school
- neighborhood/community languages
- literacy exposure
- second-language education
- language shift after moves
- code-switching contexts

Language ability should emerge through exposure and practice.

## 13. Historical technology availability

The Human Texture Engine needs a catalog of what exists when.

Examples:
- television formats
- home computers
- internet access
- mobile phones
- smartphones
- social platforms
- streaming
- gaming systems
- payment technology
- navigation
- health portals

A child in 1988 cannot have 2010s technology.

## 14. Cultural item catalog

Create reusable entities for historically available culture/consumer artifacts.

~~~ts
type CulturalItem = {
  id: string

  item_type:
    | "song"
    | "album"
    | "film"
    | "television"
    | "book"
    | "game"
    | "platform"
    | "technology"
    | "consumer_product"
    | "fashion_category"
    | "sport"
    | "other"

  name: string
  creator_or_brand?: string

  release_or_origin_date?: string

  metadata: JSON
}
~~~

Availability is separate.

## 15. Cultural availability

~~~ts
type CulturalItemAvailability = {
  cultural_item_id: string

  location_scope_id?: string

  started_at: string
  ended_at?: string

  availability_level:
    | "rare"
    | "limited"
    | "common"
    | "mass"

  audience_profile?: JSON

  source_refs: SourceRef[]
}
~~~

Release date does not equal universal exposure.

## 16. Exposure resolver

For every potential cultural/world exposure calculate:

~~~
EXISTS?
↓
AVAILABLE HERE?
↓
HOUSEHOLD HAS ACCESS?
↓
PERSON IS AGE/CONTEXT APPROPRIATE?
↓
SOCIAL/MEDIA CHANNEL REACHES PERSON?
↓
PERSON NOTICES/ENGAGES?
~~~

Only then can Human Texture generate familiarity/preference.

## 17. Economic context

World state should support historically plausible:
- wages
- unemployment
- major recessions/booms
- inflation
- housing cost
- rent pressure
- tuition
- transportation cost
- broad consumer price context

Do not require exact penny-perfect reconstruction for every item.

Use authoritative regional/time anchors and modeled household-level variation.

## 18. Household material conditions

Do not collapse socioeconomic context into one class label.

Generate actual conditions:
- income
- employment
- household size
- residence
- bedrooms
- vehicle access
- food security
- technology
- childcare
- insurance/health access
- savings/debt where appropriate
- neighborhood services

A derived socioeconomic description can be generated afterward.

## 19. Local opportunity field

A resident's possible choices depend on what exists nearby.

Model:
- schools
- colleges/training
- jobs
- employers
- public transit
- healthcare
- recreation
- community groups
- stores/services
- childcare
- housing

Opportunity generation must respect geography and transportation.

## 20. Education system context

World Packs should specify, where data supports:
- typical school starting age
- grade structure
- compulsory education
- school calendar
- public/private options
- college/training pathways
- credential structures
- broad tuition/funding environment

The resident's education history should be generated within the applicable jurisdiction.

## 21. Legal / administrative rules

Create versioned jurisdiction rules for facts that can invalidate events.

Examples:
- driving/license ages
- age of majority
- compulsory schooling
- marriage age/legal prerequisites
- voting eligibility where relevant
- employment restrictions for minors
- legal document eligibility

Do not build a complete legal simulator.

Store only rules needed to validate generated life events.

## 22. Transportation context

A resident's mobility depends on:
- road network / car culture
- transit availability
- walkability
- bike infrastructure
- family vehicle access
- licensing law
- rideshare availability by era
- rural/urban geography

Transportation changes the opportunity field.

## 23. Housing context

World Packs should support:
- common housing types
- rent/home-price conditions
- household density
- dorm/student housing where applicable
- suburban/urban/rural patterns
- broad neighborhood turnover

Housing choices still depend on the resident's finances and household structure.

## 24. Health-system context

Need enough context to generate plausible:
- insurance/access model
- primary care
- emergency care
- reproductive care access
- pharmacies
- dental/vision access
- major public-health events

Do not infer treatment availability without world context.

## 25. Public events

The world may generate events such as:
- recession
- pandemic
- natural disaster
- major local employer closure
- infrastructure failure
- major public celebration
- strike
- conflict/war where geographically relevant
- large migration/displacement event

Public events only become resident life events if exposure/impact rules connect them.

## 26. Public-event exposure

A national event does not affect every person equally.

Resolve:
- geographic proximity
- age
- household employment
- health risk
- school/work closure
- media access
- personal connection
- economic exposure

Store the resident-specific consequence separately from the world event.

## 27. Weather and climate

Climate is useful for:
- clothing
- transportation
- recreation
- home design
- seasonal routines

Exact daily historical weather is optional.

For ordinary generated days, statistically plausible weather may be enough.

For major weather events, use real historical events in historical-real mode when available.

## 28. Neighborhood texture

A neighborhood should have time-aware features such as:
- density
- housing mix
- walkability
- transit
- commercial access
- schools
- parks/recreation
- perceived local familiarity
- turnover

Avoid simplistic "good/bad neighborhood" labels.

Use actual dimensions.

## 29. Institution realism

A school/employer may be:

### Real-world entity
If validated from a source.

### Synthetic-but-plausible entity
Generated to fit location/time.

Tag entity provenance.

Do not invent false historical claims about a real named institution.

## 30. Synthetic organization generation

For fictional organizations:
- choose historically plausible name/style
- industry/type
- size
- location
- opening/closing period
- wages/schedules
- hierarchy
- workforce context

Keep the synthetic marker internally.

## 31. Real vs synthetic people

All resident-connected personal characters are simulated people.

Do not generate a false personal relationship with a real public figure unless the product explicitly enters a fictional mode.

For ordinary Genesis, connected people should be fictional.

## 32. Media popularity

Availability is not popularity.

Where data exists, include time/location audience popularity.

This helps generate:
- household exposure
- peer conversation
- common cultural references

But popularity never guarantees the resident likes something.

## 33. Fashion / grooming availability

Represent broad historically plausible:
- silhouettes/categories
- beauty/grooming products
- workplace/school dress norms
- fashion cycles

Do not force a decade stereotype onto every person.

A resident can dress unfashionably, conservatively, subculturally, practically, or idiosyncratically.

## 34. Historical food environment

Track broad local availability:
- grocery patterns
- restaurant categories
- common household staples
- food technology/convenience
- delivery availability

Family food still comes from actual household culture, budget, skill, and preference.

## 35. Historical consumer access

The engine should know when:
- online shopping becomes available
- delivery expands
- certain devices become common
- subscription models appear
- digital payment becomes common

This affects household and texture history.

## 36. Major economic events propagate causally

Example:

~~~
regional recession
→ employer reduces staff
→ parent loses job
→ household income falls
→ move becomes possible
→ child changes school
→ friendships change
~~~

The resident-specific chain must be generated from the world event rather than pasted in as a generic recession story.

## 37. Public events can create memories without material disruption

Example:
- resident remembers a major televised event,
- school discusses it,
- family reacts,
- but finances/routine remain unchanged.

Exposure and consequence are distinct.

## 38. Future-world simulation

After the real-world reference date:
- never claim certainty,
- generate scenario-consistent world changes,
- keep changes conservative unless the scenario explicitly calls for disruption,
- label all future world states simulated,
- version the future-world generator.

The resident's future remains fictional even if their past used real historical context.

## 39. Future technology

Do not generate specific impossible gadgets merely for novelty.

Use bounded categories:
- communication
- transport
- healthcare
- home automation
- work software
- media

Specific future products should be synthetic.

## 40. Source registry

~~~ts
type WorldSource = {
  id: string

  publisher: string
  dataset_or_source_name: string

  source_type: string

  url_or_identifier?: string

  geography_scope?: string
  time_scope?: string

  retrieved_at?: string

  quality_tier:
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"

  notes?: string
}
~~~

Every real-world state should be traceable to one or more source records.

## 41. U.S. authoritative-source preference

For U.S. packs, prefer sources such as:
- U.S. Census Bureau / ACS for population, household, housing, migration
- Bureau of Labor Statistics for employment, wages, inflation
- Bureau of Economic Analysis for regional economic context where useful
- NCES / state education agencies for education context
- federal/state/local agencies for legal eligibility rules
- NOAA/NCEI for climate and major weather context
- CDC/state health agencies for public-health context where appropriate

Other countries should use their equivalent national/statistical authorities where available.

## 42. World cache / snapshot

A simulation interval should receive a compact WorldContextSnapshot.

~~~ts
type WorldContextSnapshot = {
  as_of_date: string
  resident_location: LocationRef

  world_mode: string

  economy: StateRef[]
  housing: StateRef[]
  labor: StateRef[]
  education: StateRef[]
  transport: StateRef[]
  technology: StateRef[]
  media: StateRef[]
  health_system: StateRef[]
  jurisdiction_rules: RuleRef[]

  nearby_opportunities: EntityRef[]
  relevant_world_events: EventRef[]

  available_cultural_items: CulturalAvailabilityRef[]

  confidence_notes: string[]
}
~~~

This is derived/cached, not canonical source truth.

## 43. World advancement order

Each interval:

~~~
1. Advance global state.
2. Advance country/region/city state.
3. Advance organizations.
4. Resolve public/world events.
5. Recompute local opportunity field.
6. Resolve cultural/technology availability.
7. Create WorldContextSnapshot.
8. THEN simulate resident decisions/events.
~~~

The resident reacts to the world; the world does not wait for the resident.

## 44. Connected-person world consistency

People living in the same place/time share the same world state.

If a local school closes, every affected resident/secondary person should reference the same canonical world/organization event.

Do not independently hallucinate a different city for each person's branch.

## 45. Cross-location consistency

If the resident moves, old relationships remain in the old local world unless they move too.

Maya can still be living in Denver while the resident moves to Chicago.

Each person receives their own local WorldContextSnapshot.

## 46. Historical name realism

Synthetic names for businesses, schools, and organizations should match the era/region without copying real entities misleadingly.

People's names should also be generation-year and family-context plausible, but demographic naming must avoid stereotype shortcuts.

## 47. Cultural exposure weighting

When resolving exposure, weight:
- household
- close peers
- school/work
- neighborhood
- local popularity
- national media
- algorithmic/digital exposure where historically available

These sources change with age and era.

## 48. Household vs wider culture

A family can be culturally distinct from its neighborhood.

Example:

~~~
home language A
school language B
family music X
peer music Y
religious ritual at home
secular school environment
~~~

The resident can participate in multiple cultural contexts simultaneously.

## 49. Cultural adoption is individual

Exposure can produce:
- adoption
- partial adoption
- code-switching
- indifference
- rejection
- later rediscovery

Do not equate exposure with identity.

## 50. Completion criteria for Phase C

Phase C is conceptually complete when:

- world facts are time- and place-specific,
- historical real and simulated future are clearly separated,
- world coverage/confidence is explicit,
- local opportunities constrain resident choices,
- technology/media/consumer items have availability periods,
- culture comes from exposure rather than demographic stereotypes,
- households can differ from surrounding culture,
- organizations progress independently,
- shared world events remain canonical across people,
- moving changes world context without deleting old networks,
- future-world state is clearly hypothetical,
- the generator can produce a WorldContextSnapshot before every resident interval,
- and every specific historical reference can answer "was this available here, then, and how do we know?"

## Next phase

Phase D — Human Interaction / Dialogue Engine.

Dialogue must consume:
- HumanTextureSnapshot
- PersonalitySnapshot
- WorldContextSnapshot
- relationship history
- knowledge permissions
- current emotional state
- role/power context

so that two generated people do not merely have biographies; they can actually interact as themselves.
