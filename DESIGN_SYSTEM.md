# Universe City Design System

The public site, auth flow, application, resident interface, and agent interface are one product. They should never look like separate brands.

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

- Primary voice: Montserrat
- Record / system notation: VT323
- Small labels are uppercase with wide tracking.
- Large headings are direct, compact, and high contrast.

## Visual rules

- Do not build large pages on pure white backgrounds.
- Paper and Paper 2 are the default light surfaces.
- Ink and burgundy create major chapter breaks and high-contrast moments.
- White / near-white is reserved for cards, inputs, and focused surfaces.
- Use hard borders and hard-offset shadows. Avoid soft SaaS-style cards.
- Department colors are functional accents, not decorative gradients.
- Each major page should contain visible contrast between at least two surface families: dark / paper, paper / paper2, or department color / paper.
- Buttons use hard borders and direct rectangular shapes. No pill styling.
- Public and resident experiences use the same visual vocabulary as the marketing site.

## Language boundary

Resident-facing language:
- account
- membership
- systems
- Plan
- dashboard
- agent
- history

Internal / agent language may use:
- file
- member file
- case
- record
- Genesis

Residents should benefit from the internal file structure without being asked to understand it.

## Source of truth

`app/globals.css` and the palette above must stay aligned with the production marketing site. New pages should reuse existing page and surface classes before adding new one-off styles.
