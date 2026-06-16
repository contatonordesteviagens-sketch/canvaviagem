# V6 - Split Destination Price

Data: 2026-06-16

## Objetivo

Adicionar uma nova variante real ao motor `composeTravelAd`, baseada na referencia simples de anuncio de viagem com foto hero no topo e bloco inferior dividido em duas colunas.

Esta variante foi criada para ser diferente das V0-V5:

- Nao e painel superior como V0.
- Nao e painel lateral como V1.
- Nao e editorial com card centralizado como V2.
- Nao e box CVC sobre foto cheia como V3.
- Nao e card central vertical como V4.
- Nao e glassmorphism premium como V5.

## Anatomia

### Feed 1080x1080

```text
Foto hero:       x=0%   y=0%   w=100% h=55%
Bloco inferior:  x=0%   y=55%  w=100% h=45%
Coluna esquerda: x=0%   y=55%  w=50%  h=45%
Coluna direita:  x=50%  y=55%  w=50%  h=45%
Footer:          drawFinalBranding por ultimo
```

### Story 1080x1920

```text
Foto hero:       x=0%   y=0%   w=100% h=62%
Bloco inferior:  x=0%   y=62%  w=100% h=38%
Coluna esquerda: x=0%   y=62%  w=50%  h=38%
Coluna direita:  x=50%  y=62%  w=50%  h=38%
Footer:          drawFinalBranding por ultimo
```

## Dados Do Formulario Consumidos

| Campo | Uso na V6 |
|---|---|
| `imageUrl` | Foto hero no topo com `fitCover` |
| `destination` | Titulo grande da coluna esquerda |
| `city` | Linha `SAINDO DE {city}` quando preenchida |
| `travelPeriod` | Linha de dias/data abaixo do destino |
| `primaryColor` | Texto da esquerda e pill Pix/desconto |
| `secondaryColor` | Fundo da coluna direita |
| `price` | Valor principal |
| `currencySymbol` | Simbolo de moeda |
| `installments` | Pill `10X DE` quando modo parcelado |
| `paymentMode` | Decide label de preco |
| `paymentLabel` | Label customizado quando aplicavel |
| `pricePrefix` | Label principal, ex: `a partir de` / `desde` |
| `paymentSuffix` | Complemento, ex: `por pessoa` |
| `showTotal` / `totalOverride` | Linha opcional de total |
| `showPixBanner` / `pixBannerText` | Pill opcional de desconto/Pix |
| `logoDataUrl` / contatos | Footer padrao via `drawFinalBranding` |

## Arquivos Alterados

- `src/lib/fabrica-compose-art.ts`
  - `TOTAL_VARIANTS` passou de 6 para 7.
  - Novo branch `if (variant === 6)` criado dentro de `renderSafeSquareOffer`.
  - V6 usa `fitCover`, `wrapTextSafe`, `safeFillText`, `ensureContrast`, `getSafeColor`, `fillRoundRect` e `drawFinalBranding`.

- `src/pages/fabrica/Phase3ArtFactory.tsx`
  - Rotacao PT atualizada para 7 variantes.
  - Modulo dos lotes atualizado de `% 6` para `% 7`.
  - Seletor manual agora mostra V0..V6.

- `src/pages/fabrica/Phase3ArtFactoryES.tsx`
  - Rotacao ES atualizada para 7 variantes.
  - Modulo dos lotes atualizado de `% 6` para `% 7`.
  - Seletor manual agora mostra V0..V6.

## Regras De Engenharia Aplicadas

- Branch isolado: V0-V5 nao foram reescritas.
- Layout em funcao de `width` e `height`, sem coordenadas absolutas soltas.
- Texto dinamico protegido com `wrapTextSafe` ou `safeFillText`.
- Footer desenhado por ultimo.
- Contraste calculado com helpers.
- V6 respeita `format === "story"` sem criar branch duplicado.

## Ajustes Pos-Teste Visual

Aplicados apos teste com Maragogi e Fernando de Noronha:

- `SAINDO DE FORTALEZA` nao aparece mais quando Fortaleza chega como fallback/padrao do formulario.
- Destinos longos agora podem ocupar ate 3 linhas, evitando cortar `Fernando de Noronha`.
- O titulo selecionado no formulario aparece como kicker curto acima do destino quando aplicavel, exemplo: `PACOTE`.
- `travelPeriod` aparece como pill com leve borda, exemplo: `5 DIAS`.
- Linha de total nao duplica mais `TOTAL:` quando o texto ja vem com esse prefixo.
- Pill de Pix/desconto ganhou mais distancia da linha de total.
- Rodape recebeu gradiente escuro inferior para dar contraste a logo, telefone e Instagram em fundos claros.

Aplicados apos teste com Gramado em feed e story:

- O kicker do titulo usa o texto selecionado no formulario sem o destino e sem pontuacao final solta, exemplo: `VOCE PRECISA CONHECER`.
- O destino voltou a ter hierarquia forte: fonte maior, peso 900 e alinhamento pela mesma esquerda do kicker.
- O bloco de data/periodo deixou de ser apenas contorno e passou a ser um pill preenchido com preto translucido em torno de 34%.
- O bloco de preco subiu como grupo: label, valor, complemento, total e Pix ficam mais proximos do topo da coluna direita.
- A distancia entre valor e complemento foi ajustada para a virgula dos centavos nao encostar em `POR PESSOA`.
- A sombra inferior do rodape foi reforcada para ajudar logo, Instagram e telefone quando a cor de fundo e clara.

Hotfix apos teste com Porto de Galinhas:

- O titulo da coluna esquerda voltou a usar calculo por topo visual, evitando que o destino cubra o kicker.
- O tamanho do destino foi reduzido para um limite seguro em nomes de duas linhas.
- O bloco de data agora respeita o limite superior do rodape para nao colidir com a logo.

Rollback parcial solicitado:

- Desfeito o aumento de titulo/destino aplicado no ajuste anterior.
- Desfeito o tratamento que removia a pontuacao final do kicker do titulo.
- Desfeito o alinhamento a esquerda do bloco de titulo; a coluna esquerda voltou a usar composicao centralizada.

Ajuste fino apos comparacao Gramado/Fernando de Noronha:

- O kicker mantem a pontuacao escolhida, mas remove espaco indevido antes de `!`, `?`, `.` ou `,`.
- Destinos compostos agora sao balanceados em no maximo 2 linhas, evitando o caso `FERNANDO / DE / NORONHA`.
- O pill de periodo/dias usa a cor primaria da arte, igual ao destaque de Pix/desconto, em vez de cinza.
- Em destinos de uma linha, o pill de periodo sobe 3px para ficar mais proximo do nome.
- O label `A PARTIR DE` ficou 5% menor e desceu 2px; o preco principal subiu 2px.

## Como Testar

1. Abrir a Fabrica de Anuncios.
2. Selecionar modo `Foto Real` ou `Sua Imagem`.
3. Abrir `Variacoes`.
4. Selecionar `V6`.
5. Testar em formato quadrado.
6. Trocar para story e gerar novamente.

Dados recomendados para primeiro teste:

```text
Destino: Fernando de Noronha
Nome da promocao: OFERTA ESPECIAL
Titulo: Pacote {destino}
Dias/data: 5 dias, Janeiro
Modo: Parcelado
Parcelas: 10x
Valor: R$ 149,90
Prefixo: a partir de
Complemento: por pessoa
Mostrar total: ligado
Faixa Pix/desconto: ligada
```

## Como Repetir O Processo Para V7+

1. Receber uma imagem de referencia.
2. Identificar se a estrutura e realmente diferente das variantes existentes.
3. Converter a referencia em anatomia percentual.
4. Mapear cada texto da imagem para campos reais do formulario.
5. Criar branch isolado no compositor.
6. Atualizar `TOTAL_VARIANTS` no motor e nas telas PT/ES.
7. Atualizar os operadores de modulo nos lotes.
8. Documentar a nova variante nesta pasta.
9. Rodar `npm run build`.

