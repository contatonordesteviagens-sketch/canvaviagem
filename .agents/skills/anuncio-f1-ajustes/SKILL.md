---
name: anuncio-f1-ajustes
description: Ajustes finos e cirúrgicos nas artes/anúncios gerados pela Fábrica (F1) do Canva Viagem. Ative sempre que o usuário disser "anúncio F1", "anuncio f1", "F1", "ajusta a V0..V8", "mover/subir/descer/espaçar/aumentar" texto, ícone, preço ou elemento de uma variação de imagem, ou pedir mudanças de layout em src/lib/fabrica-compose-art.ts.
---

# Ajustes finos — Anúncio F1 (motor Canvas 2D)

Gatilhos: "anúncio f1", "f1", "arte V1", "espaça os ícones", "sobe o preço 2px", "troca o ícone", "no story está colado".

## 0. Leitura obrigatória antes de editar
- `docs/fabrica/MANUAL_AJUSTES_ANUNCIOS_IA.md` (manual mestre)
- `V1_LAYOUT_SPEC.json` (só quando o alvo for a V1)
- `geração de imagens engenharia como funciona/DOC_ENGENHARIA_MOTOR_CANVAS.md` (arquitetura do proxy/recorder)

## 1. Arquitetura
Não é HTML/CSS. É **HTML5 Canvas 2D imperativo**.

| Arquivo | Papel |
|---|---|
| `src/lib/fabrica-compose-art.ts` | MOTOR. Todas as variantes V0–V8. Único arquivo de ajuste visual. |
| `src/pages/fabrica/Phase3ArtFactory.tsx` (+ `...ES.tsx`) | UI, formulário, rotação e `DISABLED_VARIANTS`. |
| `src/components/fabrica/ArtTweakEditor.tsx` | Editor visual admin (offsets sem código). |
| `src/lib/fabrica-art-recorder.ts` | Proxy que grava as modificações do editor. |
| `src/lib/fabrica-art-tweaks.ts` | Tipos/merge dos tweaks salvos. |

Entrada: `composeTravelAd()` (~linha 877). Seleção: `TOTAL_VARIANTS = 9` (~1369).
Cada arte é um branch isolado `if (variant === N) { ... }`. Feed (1080×1080) e Story (1080×1920) vivem no **mesmo branch**, separados por `format === "story"` / `isStory`.

Localize sempre antes de editar:
```bash
rg -n "if \(variant === N\)" src/lib/fabrica-compose-art.ts
```

## 2. Leis invioláveis
1. Altere **exclusivamente** o branch da variante pedida. Zero linhas fora dele.
2. Não refatore helpers globais: `safeFillText`, `drawMonoIcon`, `fillRoundRect`, `wrapTextSafe`, `fitCover`, `drawFinalBranding`, `drawPixLogo`. Se precisar de comportamento novo, use variável local no branch ou parâmetro opcional com default idêntico ao atual.
3. Texto de usuário sempre via `safeFillText(ctx, text, x, y, maxWidth, baseFontSize)` — nunca `ctx.fillText` cru.
4. Não altere `TOTAL_VARIANTS` (índice sem branch cai silenciosamente na V0).
5. Offset **local** no elemento, nunca na variável base compartilhada (`baseY`, `cardY`, `blockTop`) — evita cascata.
6. Nada sobrepõe logo / Instagram / telefone (`drawFinalBranding`) e nada sai do canvas.
7. Nomes compostos nunca perdem palavra: máx. 2 linhas, reduzir fonte progressivamente, linha 2 nunca começa com `DE/DA/DO/DOS/DAS/E`.

## 3. Conversão humano → pixel
1 cm ≈ **40 px** · 0,5 cm ≈ 20 px · 1 mm ≈ 4 px
"sobe" = subtrai Y · "desce" = soma Y · "esquerda" = subtrai X · "direita" = soma X
"um pouco" 2–5% · "médio" 6–10% · "muito" >10%
**Número em px é literal** — 2px significa exatamente 2px.

## 4. Receitas
- **Mover texto:** ajustar o argumento Y do `safeFillText` daquele texto.
- **Tamanho de fonte:** alterar `baseFontSize` ou o `ctx.font`; revisar a folga com o elemento de baixo.
- **Espaçar ícones/benefícios:** aumentar `gap`/`step`/`slotH` do loop **e** compensar `cardH`/largura, senão o último item vaza.
- **Trocar ícone:** só a string em `drawMonoIcon(ctx, iconName, ...)`; conferir se a chave existe no `switch` de `drawMonoIcon` (~609).
- **Cor:** usar `primaryColor`/`secondaryColor` com `getSafeColor(...)`; nunca hardcode.
- **Elemento novo:** adicionar no fim do branch (por cima) ou logo após o painel de fundo (por baixo); nomear variáveis com sufixo da variante (`badgeYV1`).
- **"Em todas as artes":** se for rodapé/branding → `drawFinalBranding`. Caso contrário, repetir o mesmo ajuste dentro de cada branch e listar quais mudaram. Não inventar helper novo.

## 5. Safe zones
Laterais mín. 65 px · Story: 250 px livres no topo e 250 px na base · área útil de texto no Story 1080×1420 · fundo sempre `fitCover`, sem borda preta.

## 6. Procedimento obrigatório
1. `rg -n "if \(variant === N\)"` para confirmar a linha real.
2. Ler o branch inteiro.
3. Reescrever o pedido e mostrar ao usuário:
   `VARIANTE / FORMATO / ELEMENTO / MUDANÇA / RESTRIÇÃO / NÃO ALTERAR`
   (se o formato não foi dito, perguntar antes de editar).
4. Edição mínima — idealmente 1 a 5 linhas.
5. Entregar **diff**, nunca o arquivo inteiro.
6. `npx tsc --noEmit`.
7. Declarar: linhas alteradas, variante, formatos, e o que ficou intocado.

### Checklist final
- [ ] Só o branch alvo mudou
- [ ] Feed e Story corretos
- [ ] Sem sobreposição de textos
- [ ] Nada fora do canvas / safe zones respeitadas
- [ ] Destino composto inteiro
- [ ] Preço não encosta no complemento ("POR PESSOA")
- [ ] Rodapé intacto
- [ ] `TOTAL_VARIANTS` inalterado
- [ ] `npx tsc --noEmit` passou

## 7. Erros proibidos
Refatorar V0–V5 para consertar V6+ · reescrever layout quando o pedido era 2px · `ctx.fillText` cru · fallback que corta palavra do destino · `TOTAL: TOTAL R$...` · inventar cidade de origem · cobrir logo/Instagram/telefone · devolver o arquivo de ~5.900 linhas reescrito.

## 8. Quando NÃO mexer no código
Se o pedido é apenas mover / escalar / esconder / girar / trocar texto de um elemento existente, o admin pode usar o `ArtTweakEditor`, que salva `{dx, dy, scale, rotate, hidden, text}` em `fabrica_art_tweak_presets` por `categoria::variante::formato`. Código só para: elemento novo, troca de ícone, lógica de quebra de texto, cor condicional, mudança estrutural.
