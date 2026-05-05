# Skill: AI Image Generation Mastery

## Overview
Image generation is handled by the `fabrica-generate-ad` Supabase Edge Function using Google Gemini Flash. This skill ensures consistent high-quality, professional tourism photography.

## Prompt Architecture
The function uses a multi-layered prompt strategy:
1. **Niche-Specific Scenes**: High-end descriptions for "Nordeste", "Sul", "Cruzeiro", etc.
2. **Global Quality Constraints**: Keywords like "Award-winning", "8K", "Cinematic lighting", "Editorial style".
3. **Strict Negative Constraints**:
   - `NO people` / `NO human figures`
   - `NO text` / `NO logos` / `NO UI elements`
   - `Negative Space`: Explicitly requested for UI overlays.

## Environment Variables
The function requires:
- `LOVABLE_API_KEY`: Gateway for Gemini 3.1 Flash.
- `USER_GEMINI_API_KEY`: Fallback or primary key if configured in the UI.

## Troubleshooting "Bad" Images
If AI images start showing people or text:
1. Open `supabase/functions/fabrica-generate-ad/index.ts`.
2. Strengthen the `negativeConstraints` variable.
3. Increase the temperature slightly (0.7 to 0.8) for more creative scenery, or decrease it for more literal landscapes.

## Reference Images
For "Oferta" category, a CVC-style reference image is passed to the AI to maintain a professional "retail" layout structure when generating composited ads.
