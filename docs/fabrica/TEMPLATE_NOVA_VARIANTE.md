# TEMPLATE DE BRIEFING — NOVA VARIANTE DE ANÚNCIO (`composeTravelAd`)

Copie esta ficha, preencha TODOS os campos e envie junto com a imagem de referência. Campos vazios = liberdade para alucinar. Tudo preenchido = código matemático e previsível.

---

## 🧬 0. IDENTIDADE DA VARIANTE

```text
NOME INTERNO:        V7 (próximo índice livre)
APELIDO/REFERÊNCIA:  "CVC Black Friday" / "Decolar Premium" / etc.
INSPIRAÇÃO:          marca/conta de Instagram/print anexado
CATEGORIA:           [ ] Oferta de Pacote   [ ] Experiência de Destino
FORMATOS A GERAR:    [ ] 1:1 (1080×1080)   [ ] 9:16 (1080×1920)
DIFERENCIAL ÚNICO vs V0–V5 (1 frase):
  → ex: "única variante com foto sangrada à direita + card vidro à esquerda"
```

> ⚠️ Se o "diferencial único" couber em qualquer variante existente, não é uma variante nova — é refator.

---

## 🖼️ 1. ANATOMIA DO CANVAS (em %)

Sempre em porcentagem da largura/altura — nunca em pixels absolutos (eu converto). Use o sistema de coordenadas Canvas: `(0,0)` = topo-esquerda.

```text
FORMATO 1:1 (1080×1080)
┌─────────────────────────────────────┐
│ FOTO:        x=0%  y=0%  w=100% h=55%
│ PAINEL/CARD: x=5%  y=58% w=90%  h=37%
│ LOGO:        x=5%  y=2%  w=15%
│ BADGE TOPO:  x=5%  y=6%  w=40%  h=6%
└─────────────────────────────────────┘

FORMATO 9:16 (1080×1920)
┌─────────────────────────────────────┐
│ (mesma tabela acima, refeita para story)
└─────────────────────────────────────┘
```

Preencha esta tabela para CADA formato:

| Bloco | x% | y% | w% | h% | Observação |
|---|---|---|---|---|---|
| Foto (BG) | | | | | `fitCover fy=?` (0=topo, 0.5=centro, 1=baixo) |
| Overlay/gradiente | | | | | direção + 2-3 stops rgba |
| Card principal | | | | | preenchimento sólido / vidro / borda |
| Bloco título | | | | | |
| Bloco benefícios | | | | | grid 1 ou 2 colunas? |
| Card preço | | | | | retângulo, círculo, pílula |
| Faixa Pix | | | | | só se aplicável |
| Footer contato | | | | | já é renderizado por `drawFinalBranding` |

---

## 🎨 2. PALETA E MATERIAIS

```text
primaryColor (fundo card):     #______  | uso: ____________
secondaryColor (destaque):     #______  | uso: ____________
Texto sobre primary:           [ ] auto (ensureContrast)  [ ] fixo #______
Texto sobre secondary:         [ ] auto                  [ ] fixo #______

OVERLAYS:
  Gradiente?   [ ] não  [ ] sim → direção: ___° | stops: rgba(...), rgba(...)
  Sombra card? blur=__  offsetY=__  cor=rgba(0,0,0,0.__)
  Borda card?  width=__  cor=______  estilo=[ ] sólida [ ] glow [ ] dashed

OPACIDADE DO CARD (se vidro/glass): rgba(primary, 0.__)
```

---

## ✍️ 3. TIPOGRAFIA E HIERARQUIA

Liste do maior ao menor. Tamanhos em px para a base (square 1080). Story = multiplicar por ~1.15.

```text
1. PREÇO GIGANTE         | font: Inter 900 | size: __px | cor: ______ | align: __
2. TÍTULO/HEADLINE       | font: ___ ___   | size: __px | cor: ______ | align: __
                         | wrap: [ ] 1 linha (auto-shrink) [ ] N linhas (wrapTextSafe)
                         | maxLines: __  | minSize: __px
3. DESTINO/SUBTÍTULO     | font: ___ ___   | size: __px | cor: ______ | align: __
4. BENEFÍCIOS            | font: Inter 700 | size: __px | cor: ______ | ícone: sim/não
5. TAGLINE/PROMO         | font: Inter 900 | size: __px | cor: ______
6. SUFIXO PREÇO          | font: Inter 600 | size: __px | cor: ______
7. FAIXA PIX             | font: Inter 800 | size: __px | cor: ______
```

Regra obrigatória de blindagem: se um texto pode exceder a largura disponível, marque qual proteção usar:
- `safeFillText` → 1 linha com auto-shrink
- `wrapTextSafe` → múltiplas linhas com auto-shrink (preferida para títulos longos)

---

## 📏 4. SAFE ZONES (não-negociável)

```text
Margem mínima do canvas:        40 px (todos os lados em 1:1)
                                40 px laterais / 120 px topo+rodapé (story)
Reserva para logo prominente:   topo: logoH + 28 px
Reserva para footer branding:   bottom: ~140 px (square) / ~220 px (story)
Distância mínima entre blocos:  16 px
Gap entre ícone e texto:        12-16 px
Border-radius padrão dos cards: 24-28 px
```

Confirme se a sua variante respeita TODAS as 6 regras acima. Se quebra alguma, justifique.

---

## 🔢 5. DADOS DINÂMICOS QUE A VARIANTE CONSOME

Marque o que será exibido (e o que deve ser ignorado mesmo se preenchido):

```text
[ ] destination       [ ] city (Saindo de)     [ ] travelPeriod
[ ] titleText         [ ] promoName             [ ] highlights[] (até __ itens)
[ ] mainPrice / price [ ] installments          [ ] paymentMode (cash/installments/down_plus)
[ ] pricePrefix       [ ] paymentSuffix         [ ] paymentLabel
[ ] totalOverride     [ ] showTotal             [ ] pixBannerText  [ ] showPixBanner
[ ] logo              [ ] footer (WhatsApp/Instagram/site)
```

---

## 📱 6. ADAPTAÇÃO SQUARE ↔ STORY

Diga explicitamente uma das três opções:

```text
[ ] BRANCH ÚNICO + parametrização (preferido)
    → mesma matemática, valores trocados por isStory ? A : B
[ ] DOIS BRANCHES separados
    → justificar: "story tem layout fundamentalmente diferente porque ___"
[ ] SÓ UM FORMATO
    → outro formato cai em fallback / outra variante
```

E descreva o que muda entre os dois:
- Foto: cobre 100% nos dois? Ou só 55% no square e 65% no story?
- Card: mesma proporção ou recoloca em Y diferente?
- Tamanhos de fonte: multiplicador para story?

---

## 🧪 7. CASOS DE TESTE OBRIGATÓRIOS

A variante precisa renderizar corretamente nestes cenários extremos:

```text
[1] Título curto    (1 palavra: "Maragogi")
[2] Título longo    ("Caribe Brasileiro com All Inclusive em Porto de Galinhas e Maragogi")
[3] Sem promoName / Sem city / Sem travelPeriod
[4] 6 benefícios com textos longos
[5] Preço pequeno ("R$ 99") e gigante ("R$ 12.499,90")
[6] paymentMode = "cash" e "down_plus"
[7] Sem logo (hasLogo=false)
[8] Cores extremas: primary=#FFFFFF + secondary=#FFFF00 (teste de contraste)
```

---

## 🛡️ 8. CHECKLIST FINAL (eu validarei antes de codificar)

- [ ] Todos os blocos têm coordenadas em % (não px absolutos)
- [ ] Hierarquia tipográfica tem tamanhos numéricos definidos
- [ ] Cada texto tem proteção declarada (`safeFillText` ou `wrapTextSafe`)
- [ ] Adaptação square↔story explicitada
- [ ] Diferencial único vs V0–V5 é real (não é só "outra cor")
- [ ] Imagem de referência anexada em alta resolução (mínimo 800px no lado menor)
- [ ] Você marcou na imagem (rabisco/setas) onde está cada bloco da tabela

---

## 📎 9. ANEXOS QUE DEVEM VIR JUNTO

1. Print original da peça de referência (limpa).
2. Print marcado (com retângulos por cima dos blocos — pode ser à mão no celular).
3. (Opcional) Print da peça em outro formato se a marca já fez square+story.

---

## COMPLEMENTOS CRÍTICOS QUE FALTARAM NO TEMPLATE

### 1. 🖼️ COMPORTAMENTO DA FOTO

ENQUADRAMENTO:
  [ ] cover (corta para preencher) — padrão
  [ ] contain (mostra a foto inteira, sobra cor)
  [ ] split (foto só em parte da tela)

PONTO FOCAL VERTICAL (fy):
  0.0 = mostra topo da foto    (céu, horizonte alto)
  0.5 = centro                  (padrão)
  1.0 = base                    (pessoas, praia, chão)
  → escolha em função do TIPO de foto que vai entrar

TRATAMENTO DA FOTO:
  [ ] vinheta (escurece bordas)  intensidade: 0.0–1.0
  [ ] film grain                 amount: 0.0–0.1
  [ ] overlay escuro             opacidade: 0.__
  [ ] dessaturação               [ ] preto e branco

GRADIENTE SOBRE A FOTO:
  direção: top→bottom / bottom→top / radial
  stops: rgba(0,0,0,0.0) → rgba(0,0,0,0.7)
  cobre: foto inteira / só os 40% inferiores / só atrás do card

### 2. 🔄 ORDEM DE EMPILHAMENTO (z-index do Canvas)

Canvas 2D pinta na ordem em que você manda. Liste do fundo para a frente:
1. _________ (ex: foto)
2. _________ (ex: gradiente sobre foto)
3. _________ (ex: vinheta)
4. _________ (ex: card)
5. _________ (ex: borda glow do card)
6. _________ (ex: textos)
7. _________ (ex: logo prominente)
8. _________ (ex: footer branding)

### 3. 🧮 PRIORIDADE QUANDO O CONTEÚDO NÃO CABE

Marque a ordem (1 = primeiro a encolher/sumir):
[ ] Reduzir tamanho do título
[ ] Reduzir tamanho do preço
[ ] Cortar benefícios para __ no máximo
[ ] Esconder faixa Pix
[ ] Esconder linha "Total"
[ ] Esconder badge "Saindo de"
[ ] Esconder travelPeriod
[ ] Aumentar altura do card (empurra footer)

### 4. 🎯 ÍCONES DOS BENEFÍCIOS

ESTILO:
  [ ] mono (linha simples, 1 cor) — drawMonoIcon
  [ ] preenchido (filled)
  [ ] emoji nativo (✈️ 🏨 ☕)
  [ ] sem ícone (só texto)

POSIÇÃO RELATIVA AO TEXTO:
  [ ] esquerda  [ ] direita  [ ] acima  [ ] dentro de pill
TAMANHO: __px (geralmente 1.2× a fonte do texto)
COR: [ ] mesma cor do texto  [ ] secondaryColor  [ ] cor fixa #______
GAP ícone↔texto: __px

### 5. 🏷️ LOGO E FOOTER — INTERAÇÃO COM O LAYOUT

LOGO PROMINENTE (topo):
  [ ] aparece                  posição: x=__% y=__%  size=__px
  [ ] não aparece nesta variante
  [ ] aparece SOBRE a foto        → preciso de fundo/sombra atrás?
  [ ] aparece SOBRE o card

FOOTER (WhatsApp/Instagram/site):
  [ ] usa o footer padrão (recomendado)
  [ ] footer customizado nesta variante (descrever)
  
RESERVA INFERIOR para o footer não colidir: __px

### 6. 🌍 LOCALIZAÇÃO (PT vs ES)

TEXTOS HARDCODED na variante (cuidado!):
  [ ] "PACOTE"     → traduzir? ES = "PAQUETE"
  [ ] "a partir de" → ES = "desde"
  [ ] "por pessoa"  → ES = "por persona"
  [ ] "Saindo de"   → ES = "Saliendo de"
  [ ] "Total"       → ES = "Total" (igual)
  [ ] outro: ________

### 7. 🧨 ANTI-PADRÕES PROIBIDOS

[ ] NÃO usar pixels absolutos sem derivar de width/height
[ ] NÃO duplicar branch story/square se a matemática é a mesma
[ ] NÃO criar helpers locais (fmtBRv7, pfsV7...) — reusar do escopo
[ ] NÃO usar ctx.fillText direto em texto dinâmico — sempre safeFillText/wrapTextSafe
[ ] NÃO hardcodar cor de texto — usar ensureContrast/getSafeColor
[ ] NÃO desenhar logo antes da foto (fica atrás)
[ ] NÃO esquecer ctx.save()/ctx.restore() ao mudar shadow/alpha/transform
[ ] NÃO assumir que highlights tem N itens — sempre validar length
[ ] NÃO repetir o promoName dentro do titleText
