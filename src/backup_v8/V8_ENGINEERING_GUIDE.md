# Guia de Engenharia para Novas Variacoes a partir da V8

Este guia ensina outro agente de IA a criar, ajustar ou derivar novas versoes usando a logica da V8 da Fabrica de Imagens.

## Principio principal

A V8 e uma variante isolada do compositor. A regra de ouro e:

> Nunca mexer em V7 ou em variantes antigas para resolver problema da V8.

O ponto de entrada fica em:

```ts
if (variant === 8) {
  // Toda a engenharia da V8 fica aqui.
}
```

## Arquivos importantes

- `src/lib/fabrica-compose-art.ts` - compositor real usado pela aplicacao.
- `src/backup_v8/fabrica-compose-art.ts` - copia de seguranca do compositor final.
- `src/backup_v8/V8_HISTORY.md` - historico final do que foi feito.
- `src/backup_v8/V8_ENGINEERING_GUIDE.md` - este guia.

## Anatomia do layout

1. Fundo:
   - Usa `fitCover`.
   - Renderiza a imagem em tela cheia.
   - Aplica overlay escuro para legibilidade.

2. Topo:
   - Pill de promocao.
   - Headline.
   - Destino.
   - Pill de data/periodo.

3. Meio/inferior:
   - Card preto de preco.
   - Card colorido de beneficios.
   - CTA.

4. Base:
   - Logo e contatos via `drawFinalBranding`.

## Card de preco flexivel

Nao usar altura fixa.

O card deve se adaptar a:

- Centavos ligados/desligados.
- Valor total ligado/desligado.
- Complemento ligado/desligado.

Variaveis importantes:

```ts
const hasCents = !!priceCents && !hideCents;
const hasTotalLine = rawShowTotal !== false && !!totalOverride && totalOverride.trim() !== "";
```

Largura:

- Com centavos: maior.
- Sem centavos, com total: media.
- Sem centavos e sem total: menor.

Altura:

- Soma prefixo + preco + complemento + total, apenas se cada linha existir.

## Card de beneficios

Nao posicionar por tentativa visual fixa.

Use uma grade por slots:

```ts
const benefitSlotH = (cardH - benefitPadY * 2) / Math.max(1, numRows);
const slotTop = cardY + benefitPadY + benefitSlotH * row;
const iconY = slotTop + benefitSlotH * 0.30;
const textStartY = slotTop + benefitSlotH * 0.58;
```

Isso evita:

- Icone cortado no topo.
- Texto vazando embaixo.
- Ultimo item desalinhado quando ha 5 beneficios.

## Icones

A V8 usa `drawMonoIcon` com espessura customizada:

```ts
drawMonoIcon(ctx, icon, cx, iconY, benefitIconSize, onGold, 1.85);
```

O parametro `strokeWidth` e opcional. Nao remova o valor padrao, senao outras versoes podem mudar.

## Como criar uma V9 baseada na V8

1. Duplicar o bloco `if (variant === 8)`.
2. Alterar para `if (variant === 9)`.
3. Aumentar `TOTAL_VARIANTS`.
4. Adicionar o seletor V9 na UI, se a UI ainda nao listar automaticamente.
5. Trocar apenas a composicao visual desejada.
6. Manter funcoes compartilhadas retrocompativeis.

## Checklist antes de deploy

- O layout funciona com 4, 5 e 6 beneficios?
- O preco funciona com e sem centavos?
- O preco funciona com e sem valor total?
- O texto do destino cabe em Feed e Story?
- O CTA nao colide com cards?
- O branding nao colide com CTA?
- Build passa?

Comando:

```powershell
npm run build
```

Se `dist/index.html` mudar por causa do build:

```powershell
git restore -- dist/index.html
```

Commit seguro:

```powershell
git add -- src/lib/fabrica-compose-art.ts
git commit -m "feat: add V9 layout"
git push origin main
```

## Observacao para agentes

O usuario trabalha visualmente. Quando ele disser "1 cm", "2 px" ou "um pouco", interprete como ajuste fino proporcional:

- Pequeno: 2% a 5%.
- Medio: 6% a 10%.
- Grande: acima de 10%.

Sempre preserve as versoes que ja estao funcionando.
