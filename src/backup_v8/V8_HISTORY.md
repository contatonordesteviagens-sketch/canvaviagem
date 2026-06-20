# Historico Final da Versao V8 - Luxury Deal

Data do fechamento: 2026-06-19

## Status final

A V8 foi implementada e publicada no GitHub na branch `main`.

Arquivo principal em producao:

- `src/lib/fabrica-compose-art.ts`

Backup local atualizado:

- `src/backup_v8/fabrica-compose-art.ts`

Importante: a V8 foi adicionada sem alterar a V7 e sem depender de mudancas novas na UI. A interface da Fabrica ja estava preparada para listar a variante 8.

## Commits relevantes

- `8a03d21` - adiciona layout V8 estavel ao compositor.
- `35b64bf` - refina grade de icones/beneficios.
- `61fb852` - corrige corte e vazamento dos icones.
- `4de603f` - polimento de tamanho do card de beneficios.
- `09809e1` - torna o card de preco flexivel conforme centavos e valor total.

## Layout da V8

A V8 e um layout de oferta premium com foto full-bleed:

- Foto ocupa todo o fundo.
- Overlay escuro melhora leitura dos textos.
- Pill superior mostra a promocao, por exemplo `PROMOCAO DO DIA`.
- Headline fica solta no topo.
- Destino aparece em destaque abaixo da headline.
- Pill de periodo/data aparece abaixo do destino.
- Card preto de preco fica no lado esquerdo.
- Card colorido de beneficios fica no lado direito.
- CTA fica centralizado abaixo dos cards.
- Logo e contatos ficam na base via `drawFinalBranding`.

## Regras finais do card de preco

O card preto nao deve ter tamanho fixo.

Ele calcula largura e altura conforme os dados ativos:

- Com centavos: fica mais largo.
- Sem centavos: fica mais estreito.
- Com valor total: fica mais alto.
- Sem valor total: fica mais baixo, sem espaco vazio sobrando.

Linhas renderizadas:

- Prefixo: `a partir`, `preco`, `desde`, etc.
- Preco principal.
- Complemento: `por pessoa`, se existir.
- Valor total, apenas quando marcado pelo usuario.

Regra critica: nunca deixar o `a partir` colar no numero do preco. O `priceBaseY` deve nascer abaixo do prefixo.

## Regras finais do card de beneficios

O card de beneficios e calculado por quantidade de itens:

- Ate 4 beneficios: grade 2x2.
- 5 beneficios: duas colunas + ultimo item centralizado.
- Ate 6 beneficios: grade em duas colunas e tres linhas.

A solucao final usa slots verticais:

- Cada linha da grade tem um `benefitSlotH`.
- O icone fica no terco superior do slot.
- O texto fica abaixo do icone.
- Isso evita cortar icones no topo e evita texto vazando na parte inferior.

Icones na V8:

- Um pouco maiores que o primeiro ajuste.
- Circulo de fundo com mais presenca.
- Traco do icone mais grosso apenas na V8.
- Isso foi feito adicionando `strokeWidth` opcional em `drawMonoIcon`, mantendo compatibilidade com as outras versoes.

## Cores

A V8 respeita as cores escolhidas pelo usuario:

- `primaryColor` controla o card preto/escuro ou cor principal.
- `secondaryColor` controla card de beneficios, CTA e pill auxiliar.
- `getSafeColor` decide texto claro/escuro de acordo com contraste.

Observacao: quando o usuario escolhe azul/amarelo/preto, o layout deve manter contraste alto. Nao forcar branco no card de beneficios se a cor escolhida exige texto escuro.

## Problemas encontrados e resolucao

### 1. Caixa amarela/azul grande demais

Problema:
O card de beneficios ficava grande, principalmente com 4 itens.

Resolucao:
Reduzir `cardW`, `cardVerticalPad`, `maxBenefitGap` e usar slots internos.

### 2. Icones cortados ou texto vazando

Problema:
Ao compactar a grade, os icones de cima batiam na borda e os textos inferiores escapavam.

Resolucao:
Trocar centro livre por slots verticais:

- `slotTop`
- `benefitSlotH`
- `iconY = slotTop + benefitSlotH * 0.30`
- `textStartY = slotTop + benefitSlotH * 0.58`

### 3. Card de preco com espaco vazio

Problema:
Sem centavos ou sem valor total, a caixa preta sobrava demais.

Resolucao:
Calcular `priceBoxW` e `priceBoxH` com base em:

- `hasCents`
- `hasTotalLine`
- `suffixText`

### 4. V7 nao podia ser afetada

Resolucao:
Toda a logica nova ficou dentro de `if (variant === 8)`.
Mudanca compartilhada em `drawMonoIcon` recebeu parametro opcional com valor padrao, mantendo as chamadas antigas iguais.

## Como continuar com seguranca

1. Mexa somente dentro do bloco `if (variant === 8)` em `src/lib/fabrica-compose-art.ts`.
2. Nao altere V0 a V7.
3. Se alterar `drawMonoIcon`, mantenha compatibilidade por parametro opcional.
4. Antes de deploy, rode:

```powershell
npm run build
```

5. Se o build alterar `dist/index.html`, restaure antes de commitar:

```powershell
git restore -- dist/index.html
```

6. Commitar apenas o arquivo necessario:

```powershell
git add -- src/lib/fabrica-compose-art.ts
git commit -m "fix: ajuste cirurgico V8"
git push origin main
```

## Estado desejado visual

A V8 deve parecer uma arte de oferta premium:

- Titulo grande, limpo, com sombra.
- Destino bem legivel.
- Cards no centro inferior, sem colidir com CTA.
- Card de preco ajustado ao conteudo.
- Beneficios alinhados, legiveis e sem vazamento.
- CTA centralizado.
- Branding final preservado.
