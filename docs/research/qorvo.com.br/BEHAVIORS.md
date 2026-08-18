# Qorvo reference: behavior sweep

- Header: fixed at the top. At scroll, the inner wrapper uses `rgba(10, 10, 12, 0.72)`, rounded corners and a glass effect.
- Responsive navigation: desktop exposes anchor links; at 390 px only the logo and primary account CTA remain.
- Hero/sections: visual content reveals as the visitor scrolls; the page also contains animated video assets and layered imagery.
- Pricing cadence: click-driven segmented control. Monthly is the initial pressed state. Annual changes `aria-pressed`, card prices, charge text, annual savings and bonus copy.
- Reference annual argument: "2 meses grátis + 7 dias ilimitados". Canva Viagem adaptation must use its real prices: monthly R$97; annual R$482; equivalent R$40,16/month; R$682 saved versus twelve monthly payments.
- FAQ: click-driven single-item accordion. Clicking a question reveals its answer in place.
- CTAs: hero and final CTAs scroll smoothly to plans. Plan buttons start checkout.
- Mobile: sections stack into one column, heading drops from 78/77.22 px to 42/41.58 px, nav links disappear, buttons become full-width, and the visual follows the hero copy.
- Hover behavior to reproduce: CTA lifts slightly, border/background brightens, cards gain a subtle border glow. Honor `prefers-reduced-motion`.

