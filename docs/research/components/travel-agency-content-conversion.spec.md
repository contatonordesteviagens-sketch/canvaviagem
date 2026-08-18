# TravelAgencyContentConversion specification

## Overview
- Target file: `src/components/travel-agency-content/TravelAgencyContentConversion.tsx`
- Interaction model: pricing cadence click, FAQ accordion click, CTA checkout click.

## Reference styles
- Pricing section has violet radial background and glass cards.
- Cadence control is a two-state pill group with `aria-pressed`.
- Cards use small mono eyebrow, very large price, uppercase charge detail and checklist.
- FAQ is a single-open-item accordion.

## Proof section
- Title: `Não é promessa vazia. É ferramenta nascida dentro da rotina de agências.`
- Use truthful internal proof only: creator worked with 40+ travel agencies; platform assets available include 250+ videos, 400+ arts, 6 site models. Do not reuse Qorvo's 1M-view claim or screenshots.
- Visual gallery may use `showcase-premium-medias.png`, `showcase-ad-creation.png`, `showcase-scheduler.png`, `showcase-crm.png`.

## Pricing behavior and truth source
- Use `ELITE_OFFER` from `src/lib/eliteOffer.ts`.
- Cycles: monthly, semiannual, annual.
- Monthly: R$97/month.
- Semiannual: R$347 per 6 months (display equivalent R$57,83/month).
- Annual: R$482 per 12 months; equivalent R$40,16/month; compare with R$1.164 for 12 monthly payments; savings R$682 (59%).
- Annual selling argument: `Pague o equivalente a 5 mensalidades e use por 12 meses.` This is arithmetically rounded and must appear with the exact charged total.
- All plans provide 3-day trial according to `ELITE_OFFER` and route through the provided `onCheckout(cycle, value)` callback.
- Annual is initial/default highlighted cadence.
- Feature list: full Elite platform, ads and carousels, premium media library, site builder, CRM, WhatsApp support, online cancellation.

## FAQ
- Is it only carousels? No: ads, carousels, videos/arts, sites and CRM.
- Do I need Canva/design skill? No.
- Is it for autonomous agents and agencies? Both.
- Is the annual charge monthly? No, R$482 once after trial for 12 months.
- What happens after clicking? Existing secure flow continues to account identification and Stripe checkout.
- Can I cancel? Online; trial copy must not promise anything beyond existing policy.

## Final CTA
- H2: `Seu próximo pacote pode virar campanha hoje.`
- Button: `Escolher meu plano`.
- Footer links: Terms, Privacy, WhatsApp.

## Responsive
- Pricing cards/benefits stack at 390 px.
- CTA remains easy to tap; do not introduce a mobile sticky CTA that covers content.

