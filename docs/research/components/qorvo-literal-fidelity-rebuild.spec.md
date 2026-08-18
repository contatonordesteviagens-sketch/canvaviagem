# Qorvo literal-fidelity rebuild

## Non-negotiable direction

This rebuild must look like a direct clone of `https://qorvo.com.br/`, not a separate design inspired by it. Preserve the Qorvo composition, section rhythm, density, dark-only visual system, cards, typography hierarchy, numbered labels and controls. Replace only brand/content/assets with Canva Viagem carousel content.

Reference screenshots:
- `docs/design-references/qorvo.com.br/qorvo-hero-desktop-1440.png`
- `docs/design-references/qorvo.com.br/qorvo-hero-mobile-390.png`
- `docs/design-references/qorvo.com.br/qorvo-planos-desktop-1440.png`
- `docs/design-references/qorvo.com.br/qorvo-planos-mobile-390.png`

## Global visual rules

- Entire page stays near-black `#08080b`; no white/light sections.
- Foreground `#f5f5f7`; muted text `rgba(245,245,247,.60)`.
- Purple `#7c5cff`; green `#22d3a8`.
- Heading family Archivo/system; body Geist/system; italic accents Instrument Serif/Georgia; micro labels monospace.
- Desktop content width is 1200px, centered.
- Desktop section padding around 120–126px; mobile 76–88px.
- H1 78/77px desktop and 42/42px mobile. H2 roughly 54/56px desktop.
- No generic SaaS rounded white cards. Qorvo uses fine `rgba(255,255,255,.08)` borders, dark transparent panels and restrained radii.
- All content sections numbered `01 —`, `02 —`, etc exactly in Qorvo style.

## Header

- At top: transparent full-width fixed header, 64px internal height, no capsule and no visible border.
- After scroll: centered 1200px glass panel with border, 16px radius and dark translucent background.
- Desktop: logo at left, centered links Como funciona / Formatos / Resultados / Planos / FAQ, CTA right.
- Mobile: logo and CTA only.

## Hero — match screenshot composition

- First screen uses a 2-column 1200px grid with copy about 50% and one dominant visual stage about 50%.
- Top copy begins around 120px below header.
- Exact headline structure and line rhythm modeled on Qorvo:
  `Carrosséis de viagem que` / italic purple `prendem atenção,` / `prontos em` / underlined `poucos cliques.`
- Supporting line uses italic serif on `Feed e Stories`.
- Body is one dense paragraph, not multiple marketing cards.
- CTA pair same dimensions as Qorvo: purple main, outlined secondary.
- Main visual is ONE large rounded rectangular dark-purple scene with a central phone/insights composition and carousel cards floating partly outside. Do not use three unrelated floating cards on empty background.
- Under visual, include a large extended decorative composition so hero total desktop height resembles Qorvo before pains; use supplied tourism assets in a horizontal/overlapping reel.
- Metrics are a border-top four-column strip without a rounded enclosing card.

## Sections and source order

1. Hero
2. `01 — Você se reconhece?`: list on left/center and concluding paragraph, same open layout as Qorvo.
3. `02 — Como funciona`: H2 then three vertically spacious step rows/cards; dark only.
4. `03 — Formatos`: one heading/intro and three columns (Carrosséis / Artes para Feed / Stories) over dark background.
5. `04 — Por que funciona`: 4 compact columns, no large rounded cards.
6. `05 — O que você ganha`: 4 horizontal metrics/outcomes.
7. `06 — O que NÃO é`: centered, wide, dark violet radial background and four list rows.
8. `07 — Resultado real`: headline + Insights phone, followed immediately by a large `Feitos no Canva Viagem` horizontal gallery using all tourism assets, mimicking the Qorvo proof carousel.
9. `09 — Planos`: dark-only section, Qorvo intro, billing pill, cards; no light section before it.
10. `10 — Antes de você perguntar`: dark accordion.
11. Final CTA: very tall centered dark section, large heading with serif purple word.
12. Dark footer with multiple columns like Qorvo.

## Interaction

- Reveal animations are subtle fade/translate only.
- Header glass state switches after scrolling.
- Pricing segmented control and FAQ retain current function/a11y.
- Hover is restrained; do not create floating dashboard-card behavior.
- Honor reduced motion.

## Content scope

- Only arts, travel carousels and Stories.
- 10 models; formats 4:5, 1:1, 9:16; multiple slides/variations.
- No sites, CRM, leads, landing pages, generic campaigns or full marketing ecosystem.
- Keep real checkout prices and eligibility language.
- Insights screenshot must be described as external visual reference, never attributed to Canva Viagem or promised as guaranteed result.
