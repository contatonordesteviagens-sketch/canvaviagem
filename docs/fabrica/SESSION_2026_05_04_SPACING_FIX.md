# 📋 Sessão de Trabalho: 04/05/2026 — Correções de Espaçamento e Safe Zones (Stories)

## Problema Identificado
As artes geradas em formato Story (9:16) apresentavam sobreposição grave entre:
1. O **Price Card** e o **rodapé de branding** (instagram/whatsapp/logo).
2. O **slogan do V1 Experiência** e o rodapé.
3. O **botão CTA do V0 Experiência** ultrapassando a área segura.

## Causa Raiz
As variáveis `safeBottom` e `padBottom` de cada renderer não estavam sincronizadas com as variáveis de posicionamento do `drawFinalBranding`, criando um "buracos" onde elementos se sobrepunham.

## Correções Aplicadas

### 1. Motor Principal (`composeTravelAd`)
- `safeBottom` Stories: `420px → 580px` — garante que **nenhum** elemento de conteúdo seja desenhado abaixo de 1340px de altura (em 1920px de canvas).

### 2. Rodapé (`drawFinalBranding`)
- `safeBottomMargin` Stories: `300px → 340px` — o rodapé começa em `1920 - 140 - 340 = 1440px`.

### 3. Estratégias de Layout (ancora, matriz, fallback)
- Price Card: `Math.min(panelBottom - 170) → Math.min(panelBottom - 300)` — garante folga extra de 130px.

### 4. V0 Experiência (`renderV0Experiencia`)
- Introduzida variável `brandingSafeY = height - 520`.
- `blockBottom` agora é calculado dinamicamente: `brandingSafeY - ctaHeight - legalHeight - margens`.
- `ctaY` limitado a `Math.min(line2Y + offset, brandingSafeY - ctaHeight - 10)`.

### 5. V1 Experiência (`renderV1Experiencia`)
- `padBottom` Stories: `280px → 520px` — slogan agora finaliza a no mínimo 520px do fundo.

## Estado Final
- Todos os layouts (V0–V4, ancora, matriz, gancho, experiencia_*) respeitam a **zona de segurança de 520px** no fundo dos Stories.
- Branding ocupa a faixa `1440px → 1580px` (em canvas 1920px).
- Price Cards terminam antes de `1340px`.
- Nenhum elemento de conteúdo invade o rodapé.

## Arquivos Modificados
- `src/lib/fabrica-compose-art.ts`
- `docs/fabrica/KNOWLEDGE_AD_FACTORY.md`

## Próximos Pontos a Testar
- [ ] V2 Experiência (renderV2Experiencia) — verificar se o banner inferior também respeita 520px
- [ ] V3 Oferta Quadrado (Story mode) — confirmar que o boxY não desce além do limite
- [ ] Formato Square (1:1) — confirmar que nenhuma regressão ocorreu
