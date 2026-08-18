# TravelAgencyContentMechanism specification

## Overview
- Target files: `TravelAgencyContentMechanism.tsx` and `TravelAgencyContentBenefits.tsx` in `src/components/travel-agency-content/`.
- Interaction model: static sections with CSS hover and scroll-reveal affordances.

## Exact reference styles
- Section padding: 108 px desktop.
- H2: Archivo 54/56.16 px, weight 560.
- Step H3: 30/48 px, weight 560.
- Card H3: 21/33.6 px, weight 570.
- Near-black surfaces with `rgba(255,255,255,.08)` borders and violet/green highlights.

## Mechanism content
- Section label: `02 — COMO FUNCIONA`.
- H2: `Do pacote à campanha pronta em 3 passos.`
- Step 1 `Informe o pacote.`: destination, dates, hotel, price, installment and conditions.
- Step 2 `Escolha o que quer criar.`: ad, carousel or landing page; platform applies agency identity.
- Step 3 `Publique e venda.`: export, send to Instagram/WhatsApp, capture leads in CRM.

## Format cards
- Section label `03 — UMA ASSINATURA`.
- H2: `Tudo que sua agência precisa para divulgar e vender.`
- Cards: `Anúncios e carrosséis`, `Site e páginas de pacote`, `Conteúdo e CRM`.
- Use local assets `showcase-ad-creation.png`, `showcase-landing-pages.png`, `showcase-crm.png`.

## Reasons/results
- Four reason cards: `Pensado para turismo`, `Sua marca em cada peça`, `Do pacote ao post`, `Do clique ao atendimento`.
- Four outcome rows: `+ presença`, `+ velocidade`, `− dependência`, `− custo por campanha`.
- Objection section: not generic Canva templates; not a marketing agency; not an AI chat that returns raw copy; not a static image bank.

## Responsive
- Three-column cards desktop; stacked mobile.
- Preserve image aspect ratios and lazy-load below-fold assets.

