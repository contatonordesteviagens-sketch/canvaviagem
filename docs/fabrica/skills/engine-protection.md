# Skill: Engine Protection & Layout Stability

## Overview
The "Fábrica de Anúncios" rendering engine (`fabrica-compose-art.ts`) is protected against text overflow and layout collisions. This skill ensures that generated ads always maintain a premium look, even with long titles or prices.

## Core Utility: `safeFillText`
All text rendering MUST use the `safeFillText` utility instead of the native `ctx.fillText`.

### Implementation
```typescript
function safeFillText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  baseFontSize: number
) {
  let fontSize = baseFontSize;
  ctx.font = `${fontSize}px Inter, sans-serif`;
  
  // Dynamic scaling
  while (ctx.measureText(text).width > maxWidth && fontSize > 8) {
    fontSize -= 0.5;
    ctx.font = `${fontSize}px Inter, sans-serif`;
  }
  
  ctx.fillText(text, x, y);
}
```

## Critical Rules
1. **Never use `ctx.fillText` directly** for user-generated content.
2. **Safe Zones**: Always respect Instagram Story safe zones (Top 15%, Bottom 20%).
3. **Variant Diversity**: The engine rotates through 5 variants (V0-V4). Any new variant must be added to the `composeTravelAd` switch and protected by `safeFillText`.

## Maintenance
If a layout starts breaking due to text length, check the `maxWidth` parameter passed to `safeFillText` in the corresponding variant function.
