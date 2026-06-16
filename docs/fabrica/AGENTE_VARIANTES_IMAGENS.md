# Agente de Variantes de Imagens - Fabrica de Anuncios

Data: 2026-06-16

Este documento treina outro agente de IA para criar, corrigir e publicar novas variantes de imagem no motor Canvas da Fabrica de Anuncios, sem quebrar as versoes existentes.

## Missao Do Agente

O agente deve transformar uma referencia visual enviada pelo usuario em uma variante real do motor de geracao de imagens.

Ele tambem deve fazer ajustes finos por print, como:

- mover texto 2px para cima ou para baixo;
- aumentar ou reduzir preco;
- evitar sobreposicao de textos;
- impedir que nomes compostos sumam ou quebrem em linhas ruins;
- preservar as variantes que ja funcionam;
- documentar cada decisao.

## Arquivos Principais

```text
src/lib/fabrica-compose-art.ts
src/pages/fabrica/Phase3ArtFactory.tsx
src/pages/fabrica/Phase3ArtFactoryES.tsx
docs/fabrica/
docs/fabrica/skills/
```

O arquivo mais sensivel e `src/lib/fabrica-compose-art.ts`. Nele ficam os branches das variantes, por exemplo:

```ts
if (variant === 6) {
  // layout da V6
}
```

## Regra De Ouro

Nunca refatore V0-V5 para corrigir V6. Nunca altere uma variante antiga para criar uma nova.

Para corrigir uma variante:

1. Localize o branch exato, exemplo `if (variant === 6)`.
2. Altere somente tokens e calculos internos daquele branch.
3. Nao mexa em helpers globais sem necessidade.
4. Documente a mudanca em `docs/fabrica/`.
5. Rode uma validacao antes de commitar.

## Como Criar Uma Nova Versao V7+

1. Receba a imagem de referencia do usuario.
2. Identifique se ela e realmente uma estrutura nova ou apenas ajuste de uma variante existente.
3. Escreva a anatomia percentual:

```text
Foto: x=0% y=0% w=100% h=55%
Bloco inferior: x=0% y=55% w=100% h=45%
Coluna esquerda: x=0% y=55% w=50% h=45%
Coluna direita: x=50% y=55% w=50% h=45%
```

4. Mapeie cada texto para campo real do formulario:

```text
Destino -> destination
Titulo -> titleText/titleOverride/titleVariations
Dias/data -> travelPeriod
Preco -> price/mainPrice/currencySymbol
Prefixo -> pricePrefix/paymentLabel
Complemento -> paymentSuffix/bottomSuffix
Pix/desconto -> pixBannerText
Logo/contatos -> drawFinalBranding
```

5. Crie o novo branch no compositor:

```ts
if (variant === 7) {
  // nova anatomia
}
```

6. Atualize o total de variantes:

```ts
const TOTAL_VARIANTS = 8;
```

7. Atualize seletores e rotacao nas telas PT/ES.
8. Documente a nova variante em `docs/fabrica/V7_NOME_DA_VARIANTE.md`.
9. Valide sintaxe/build.
10. Commit e push.

## Como Fazer Ajustes Por Print

Quando o usuario mandar um print e pedir ajustes, nao tente redesenhar tudo.

Traduza o pedido para deslocamentos e tokens:

```text
"desce o destino 2px" -> somar +2 no Y do destino
"sobe final de semana 2px" -> subtrair 2 no Y do pill de periodo
"aumenta preco" -> aumentar priceSize levemente
"a partir de desce" -> somar no Y do label
"preco sobe" -> subtrair no baseline do preco
```

Depois aplique somente essas mudancas.

## Licoes Da V6

A V6 ensinou varias regras que devem ser reaplicadas em variantes futuras.

### 1. Nomes Compostos Nunca Podem Sumir

Problema encontrado:

```text
FERNANDO
DE
NORONHA
```

ou pior:

```text
FERNANDO
DE
```

Regra correta:

- destino curto pode ficar em 1 linha;
- destino composto deve ficar em no maximo 2 linhas;
- nenhuma palavra pode ser descartada;
- se nao couber, reduza a fonte progressivamente;
- evite iniciar a segunda linha com conectores como `DE`, `DA`, `DO`, `DOS`, `DAS`, `E`.

Padrao recomendado:

```ts
const words = destinationV6.split(/\s+/).filter(Boolean);
for (let size = baseSize; size >= minSize; size -= 1) {
  ctx.font = `900 ${size}px Inter, Arial, sans-serif`;
  // tentar splits em 2 linhas
}
```

### 2. Pontuacao Do Titulo

Se o titulo selecionado for:

```text
Voce precisa conhecer {destino}!
```

e o destino for removido para virar kicker, o `!` nao deve ficar solto no kicker.

Correto:

```text
VOCE PRECISA CONHECER
FERNANDO DE NORONHA
```

Use:

```ts
.replace(/\s+([!?.,])/g, "$1")
.replace(/[!?.,]+$/g, "")
```

### 3. Microajustes Devem Ser Literais

Se o usuario pedir 2px, aplique 2px.

Exemplo real da V6:

```ts
safeFillText(ctx, line, leftCx, leftY + 2 + idx * titleLineH, ...);
```

### 4. Preco E Complemento

O preco usa baseline, nao topo. Quando aumentar o preco, revise a distancia do complemento `POR PESSOA`.

Se o usuario pedir para subir so o preco:

```ts
const priceBaseY = rightY + T.priceSize - 24;
```

Nao suba o bloco inteiro se o pedido foi apenas o preco.

### 5. Periodo/Dias

O pill de periodo deve seguir a cor primaria quando o usuario escolhe azul para a arte:

```ts
const periodBg = primaryColor || "#0C2340";
fillRoundRect(ctx, x, y, w, h, h / 2, periodBg);
ctx.fillStyle = getSafeColor(periodBg, "#ffffff");
```

Para destino de 1 linha, aproxime o pill do destino:

```ts
const periodY = baseY - (titleLines.length === 1 ? 5 : 2);
```

## Checklist Antes De Committar

- A variante alterada e a variante certa?
- V0-V5 ficaram intocadas?
- Nome grande aparece completo?
- Nome composto tem no maximo 2 linhas?
- Nenhum texto sobrepoe outro?
- O preco nao encosta no complemento?
- O rodape continua legivel?
- Feed e story ainda usam o mesmo branch com `format === "story"`?
- Documentacao foi atualizada?

## Validacao Recomendada

No worktree limpo usado para deploy:

```powershell
git status --short
git diff --check
```

Quando `node_modules` nao existir no worktree limpo, valide sintaxe usando o TypeScript do workspace principal:

```powershell
@'
const ts = require('C:/Users/win 10/Desktop/CANVA E FABRICA - JUNHO 26/node_modules/typescript');
const fs = require('fs');
const file = 'C:/tmp/canva-v6-deploy/src/lib/fabrica-compose-art.ts';
const source = fs.readFileSync(file, 'utf8');
const result = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext
  },
  reportDiagnostics: true,
  fileName: file
});
const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
if (errors.length) process.exit(1);
console.log('typescript syntax ok');
'@ | node -
```

## Fluxo Git Seguro

Use worktree limpo quando o workspace principal estiver sujo:

```powershell
git worktree add --detach C:\tmp\canva-v6-deploy HEAD
```

Depois:

```powershell
git add src/lib/fabrica-compose-art.ts docs/fabrica/
git commit -m "Describe variant adjustment"
git fetch origin main
git rebase origin/main
git push origin HEAD:main
```

## Prompt De Handoff Para Outro Agente

Use este prompt para iniciar outro agente:

```text
Voce e o agente especialista da Fabrica de Anuncios do Canva Viagem.

Objetivo: criar e ajustar variantes de imagens no motor Canvas sem quebrar versoes existentes.

Leia antes:
- docs/fabrica/AGENTE_VARIANTES_IMAGENS.md
- docs/fabrica/V6_SPLIT_DESTINATION_PRICE.md
- src/lib/fabrica-compose-art.ts

Regras:
- Mexa somente na variante pedida.
- Para V6, trabalhe dentro de `if (variant === 6)`.
- Para nova versao, crie branch novo `if (variant === N)`.
- Nomes compostos nunca podem sumir nem passar de 2 linhas quando a variante exigir isso.
- Microajustes de print devem ser literais em px.
- Sempre documente o que fez em docs/fabrica.
- Valide sintaxe e `git diff --check`.
- Commit pequeno e push para main apenas quando estiver pronto.
```

## Status

Este treinamento foi criado depois da iteracao da V6 Split Destination Price, com prints reais de Gramado, Fernando de Noronha, Buzios e Porto de Galinhas.

