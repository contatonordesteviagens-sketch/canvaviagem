# TravelAgencyContentHero specification

## Overview
- Target file: `src/components/travel-agency-content/TravelAgencyContentHero.tsx`
- Screenshot: `docs/design-references/qorvo.com.br/qorvo-hero-desktop-1440.png`
- Interaction model: anchor-click + scroll reveal

## DOM structure
Fixed glass nav, hero copy column, layered product collage, four credibility metrics, then pain-recognition block.

## Exact reference styles
- Page background: `#08080b`; text `rgb(245,245,247)`.
- H1 desktop: Archivo, 78/77.22 px, weight 590. Mobile: 42/41.58 px.
- Header padding: 18 px 0; fixed; inner background after scroll `rgba(10,10,12,.72)`.
- Accent: `#7c5cff`; green status: `#22d3a8`.
- Hero reference height: 2,111.67 px desktop including visual/metrics.

## Adapted content
- Eyebrow: `ANÚNCIOS · CARROSSÉIS · SITES · CRM · FEITO PARA TURISMO`
- H1: `Conteúdos que fazem sua agência vender viagens, prontos em poucos cliques.` Use Instrument Serif styling only on `vender viagens`.
- Subhead: `Do pacote à campanha completa, na mesma assinatura.`
- Body: explain that the agency enters destination, price and conditions and Canva Viagem turns them into professional ads, carousels and a sales page, while the CRM organizes interest.
- Primary CTA: `Ver planos` (calls provided `onScrollToPlans("hero_primary")`).
- Secondary CTA: `Ver como funciona` to `#como-funciona`.
- Trust line: `3 dias grátis · nada cobrado hoje · cancelamento online`.
- Metrics: `250+ vídeos editáveis`, `400+ artes`, `6 modelos de site`, `1 plataforma para vender`.
- Pain list: lack of time, generic travel templates, inconsistent agency profile, delays from designers, and packages expiring before promotion is ready.
- Pain close: one package should become a campaign, not another unfinished task.

## Assets
- Logo: `src/assets/logo.png`.
- Layered visual: `src/assets/images/showcase-ad-creation.png`, `showcase-premium-medias.png`, and `showcase-landing-pages.png`. Use real Canva Viagem assets, never Qorvo branding/assets.

## Responsive
- Desktop: two-column hero; visual on right.
- Mobile: one column; nav hides anchor list; buttons and visual fill width.
- Preserve accessible anchors and visible keyboard focus.

