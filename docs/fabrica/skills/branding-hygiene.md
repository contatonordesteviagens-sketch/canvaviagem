# Skill: Branding Hygiene & Conditional Rendering

## Overview
This skill governs the presentation of agency assets on generated ads. The goal is "Professionalism over Placeholders".

## The "Sua Agência" Ban
The generic placeholder "Sua Agência" is strictly forbidden. 

### Logic in `fabrica-compose-art.ts`
The `drawFinalBranding` function contains a hard filter:
```typescript
if (agencyName && agencyName.toUpperCase() !== "SUA AGÊNCIA") {
  // Draw wordmark
} else {
  // Skip wordmark entirely
}
```

## Conditional Footer
The dark footer gradient and contact icons are **conditional**. 
- If no logo AND no agency name are provided, the wordmark section is skipped.
- If no contacts (WhatsApp/Instagram) are provided, the contact bar is skipped.
- The footer background is only drawn if at least one branding element exists.

## Landing Page Builder
In `Phase4LandingBuilder.tsx` and `fabrica-html-export.ts`, the fallback for empty agency names is "Agência de Viagens" or "Consultoria", never "Sua Agência".

## How to Modify
To change the branding style, edit `drawFinalBranding` in `src/lib/fabrica-compose-art.ts`. Ensure you maintain the `agencyName.toUpperCase() !== "SUA AGÊNCIA"` check to prevent regressions.
