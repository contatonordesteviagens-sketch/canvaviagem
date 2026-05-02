## Objetivo
Elevar a qualidade das imagens geradas no modo **Foto Real / Oferta de Pacote** da Fábrica, mantendo (e reforçando) a **variação obrigatória** entre gerações consecutivas.

## Escopo
Apenas o fluxo: **modo IA** + categoria **Oferta de Pacote** (templates `oferta_*`). Experiência e Autoridade ficam intactos nesta passada.

## 6 Mudanças Técnicas

### 1. Compressão dos prompts (master-prompts.ts)
Reescrever os builders de **Oferta** em 4 blocos curtos e diretos (~350 tokens cada, hoje ~800):
```
[FORMAT]   → 1:1 ou 9:16 + safe zones
[SCENE]    → cena fotográfica do destino (1 frase + âncora de câmera)
[LAYOUT]   → 1 layout fixo por template (sem variações conflitantes)
[TEXT]     → no máximo 2 blocos renderizados (Preço + Destino)
```
Gemini perde fidelidade em prompts longos — cortar ruído melhora drasticamente o texto renderizado.

### 2. Âncoras fotográficas reais
Adicionar referências profissionais à cena:
- *"shot on Sony A7R IV, 35mm f/1.8, golden hour"*
- *"Condé Nast Traveler editorial aesthetic"*
- *"Hasselblad medium format, ultra sharp"*
Isso força o modelo para fotografia real, eliminando o aspecto "render IA".

### 3. Negative prompt padronizado (em inglês curto)
Bloco fixo no final de todo prompt de Oferta:
```
STRICTLY NO: people, faces, text overlap, watermarks, logos other than brand,
blurry text, distorted letters, multiple price boxes, duplicate icons,
cartoon style, 3d render, illustration
```

### 4. Limite rígido de texto renderizado
Hoje o card tenta exibir: destino + preço + parcelas + duração + selo PIX + CTA + ícones (avião/hotel/ônibus). Resultado: letras ilegíveis.
Novo padrão de **Oferta**: somente **DESTINO (topo)** + **PREÇO + PARCELAS (caixa única)**. O resto vai como overlay HTML/CSS na composição final (já existe `fabrica-compose-art.ts`), não como pixel gerado.

### 5. Temperature ajustada
`index.ts`: reduzir `imageTemperature` de **1.1 → 0.85** apenas quando `isOferta = true`. Mantém criatividade em Experiência (1.1) e baixa alucinação de texto em Oferta. `topP` cai de 0.96 → 0.92.

### 6. Variação garantida (mantida e reforçada)
A variação **continua obrigatória** entre cliques. O sistema atual já faz isso via:
- `creativeSeed` único por chamada (`tpl.id-v{N}-{timestamp}-{rand}`)
- `GenerationGuard` (localStorage) com histórico das últimas 4 gerações bloqueando layout + headline + paleta repetidos

Vou **fortalecer** adicionando ao prompt final um bloco dinâmico:
```
[VARIATION LOCK seed={creativeSeed}]
Avoid these prior compositions: {forbiddenLayouts.join(", ")}
Avoid these prior headlines: {forbiddenHeadlines.join(", ")}
Pick a DIFFERENT camera angle, time of day and color temperature from the last generation.
```
Combinado com 3 ângulos rotativos (aérea drone / nível do mar / lateral cinematográfica) escolhidos por `seed % 3`, garante que cada nova geração de Oferta seja visualmente distinta da anterior.

## Arquivos Afetados
- `supabase/functions/fabrica-generate-ad/master-prompts.ts` — reescrever builders dos templates de Oferta (compressão + âncoras + negative + limite de texto + variação)
- `supabase/functions/fabrica-generate-ad/index.ts` — temperature/topP condicional por categoria + injeção do bloco VARIATION LOCK

## Não muda
- Fluxo de Experiência (vitrine/gancho) e Autoridade (dark)
- `GenerationGuard` (continua ativo)
- Composição final em canvas (`fabrica-compose-art.ts`)
- UI do Phase3ArtFactory

## Próximo passo
Após aprovação, aplico as duas edições, faço deploy da edge function e você testa gerando 3 ofertas seguidas para validar variação + qualidade. Aí você me manda as 3 imagens de referência que mencionou para refinarmos o estilo visual alvo.