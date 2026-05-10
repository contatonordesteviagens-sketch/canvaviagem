# 🔬 RAIO-X COMPLETO — MOTOR DE RENDERIZAÇÃO E ARQUITETURA DA FÁBRICA
Este documento consolida os padrões estruturais de renderização de imagens, posicionamento, formato, z-index, fluxo de dados e a arquitetura interna do arquivo [fabrica-compose-art.ts](file:///c:/Users/win%2010/Desktop/CANVA_VIAGEM_ESTAVEL_24_ABRIL/src/lib/fabrica-compose-art.ts). Ele serve como o mapa definitivo para guiar qualquer alteração ou depuração sem introduzir regressões visuais ou quebras de layout.

---

## 1️⃣ ÂNCORAS E COORDENADAS — Híbrido (Constantes + Cálculos Manuais)

O canvas possui dimensões de pixel fixas, definidas no início do fluxo principal:
* **Quadrado (1:1):** $1080 \times 1080$ pixels.
* **Stories (9:16):** $1080 \times 1920$ pixels.

```ts
const width  = 1080;
const height = format === "story" ? 1920 : 1080;
```

A partir disso, o objeto `RULES` atua como a régua mestra de segurança:

```ts
const RULES = {
  LEFT, RIGHT,
  SAFE_TOP:    isStory ? 280 : 60,    // Zona morta superior (redes sociais)
  SAFE_BOTTOM: isStory ? 480 : 120,   // Zona morta inferior (rodapé do Instagram + branding)
  PANEL_BOTTOM: height - (isStory ? 480 : 120),
};
const left = RULES.LEFT;
const panelBottom = RULES.PANEL_BOTTOM; // Teto inferior limite para conteúdo dinâmico
```

**Conclusão Crítica:** O sistema NÃO é proporcional puro (`y = height * 0.3`). Ele é um híbrido frágil:
- As âncoras macro dependem de `RULES.*` (que conhecem o formato).
- O posicionamento dos elementos internos dentro de cada variante (V0 a V4) usa **números crus (hardcoded)** como `badgeY = 310`, `titleY = 160`, `priceBlockY = height - 680`, `iconSize0 = 60`. Cada variante possui sua própria calibração manual independente.

---

## 2️⃣ GERENCIAMENTO DE ESPAÇO — Sequencial e Estático (Sem Refluxo)

O motor não possui um gerenciador de layout dinâmico (como Flexbox ou CSS Grid). O fluxo de posicionamento é puramente sequencial e imperativo:

```ts
let titleY = format === "story" ? 160 : Math.max(badgeY + badgeH + topPaddingBeforeTitle + titleSize, ...);
let cursorY = titleY + titleSize + gap;       // Empilha o próximo bloco manualmente
for (const h of highlights) { 
  drawPill(..., cursorY); 
  cursorY += pillH + gap; 
}
const priceBlockY = format === "story" ? height - 680 : height - 370; // Ancorado de baixo para cima
```

* **Sem auto-fit de altura:** Se um título quebrar em 3 ou mais linhas, o cursor `cursorY` colide com o bloco seguinte. O código **não recalcula o refluxo vertical** dos elementos inferiores automaticamente.
* **Mitigação Horizontal Limitada:** A função `wrapTextSafe` encolhe a fonte (`font-size`) horizontalmente se o texto ultrapassar a largura limite, mas não previne sobreposições verticais caso o volume total de texto exceda o espaço disponível no card de conteúdo.
* **Respiros Isolados:** Espaçamentos (`gap = 12`, `pillH = 88`) são locais. Modificar um espaçamento na variante `V2` não afeta as outras, gerando inconsistência de manutenção.

---

## 3️⃣ SEPARAÇÃO DE FORMATOS (1:1 vs 9:16) — Ramificação Inline (`isStory`)

Não há separação de funções por formato de saída. A mesma função de cada variante atende a ambos os formatos, bifurcando-se dezenas de vezes através de condicionais e operadores ternários internos.

| Variante | Frequência de `format === "story"` ou `isStory` |
|---|---|
| **V0** | ~15 ocorrências inline (coordenadas, tamanhos de ícones, fontes) |
| **V1** | Concentrado nos cálculos de posicionamento do preço e rodapé |
| **V2** | Ramificações pontuais de escala de imagem e margens |
| **V3** | Tratamento de contrastes e áreas de sangria superiores |
| **V4** | Controle de grids de fotos e colunas de benefícios |

**Acoplamento Extremo:** Qualquer alteração em um formato exige a revisão cuidadosa dos dois ramos do ternário. O `drawFinalBranding` faz uma verificação de aspecto autônoma (`const isStory = ch > cw;`) para garantir que o rodapé seja desenhado na posição correta independente dos parâmetros de entrada da variante.

---

## 4️⃣ ORDEM DE DESENHO (Z-INDEX) — Sequência de Instruções Canvas 2D

O Canvas 2D não possui propriedade de camada (`z-index`). A ordem de exibição é ditada unicamente pela **sequência cronológica de chamadas de desenho**:

```
[Camada Inferior]  1. ctx.drawImage(backgroundPhoto)          ← Foto de fundo (cinematográfica)
                   2. applyVignette() / gradient overlays     ← Vinheta e contraste de leitura
                   3. applyFilmGrain()                        ← Textura estética de ruído (V0/V1/V2)
                   4. fillRoundRect(...)                      ← Cards e painéis translúcidos
                   5. drawMonoIcon() / Pix logos              ← Elementos de apoio e badges
                   6. ctx.fillText()                          ← Textos, títulos e preços
[Camada Superior]  7. drawFinalBranding()                     ← SEMPRE POR ÚLTIMO (Logo + Contatos)
```

**Risco de Oclusão Silenciosa:** Como não há detecção de colisões ativa entre as chamadas, se o cursor dinâmico `cursorY` estrapolar os limites do painel inferior (`panelBottom`), os textos e elementos de conteúdo invadirão a área protegida do branding. O método `drawFinalBranding` desenhará o rodapé por cima dos dados extravasados, ocultando informações vitais do anúncio sem disparar alertas ou erros.

---

## 5️⃣ MAPEAMENTO DE CATEGORIAS — A Flag Controladora `isExperience`

A variável que controla todo o switch do tipo de anúncio é `options.isExperience: boolean` (definida no contrato em `ComposeTravelAdOptions`, linha 204).

### O "Y" do Roteamento Final (Linhas 3192-3208):
```ts
if (isExperience) {
  const v = typeof forceVariant === "number" ? forceVariant : variation;
  const variant = ((v % 5) + 5) % 5;
  if (variant === 0) return await renderV0Experiencia();   // luxo
  if (variant === 1) return await renderV1Experiencia();
  if (variant === 2) return await renderV2Experiencia();
  if (variant === 3) return await renderV3Experiencia();
  if (variant === 4) return await renderV4Experiencia();
  return await renderV0Experiencia();                       // fallback
}
// Caminho OFERTA:
return await renderSafeSquareOffer();   // contém os "if (variant === N)" de Oferta
```

Existem dois universos paralelos de V0-V4:
- **Oferta de Pacote:** Blocos `if (variant === N)` dentro de `renderSafeSquareOffer` (linhas 1280-2900) — leem `price`, `installments`, `pixBanner`, `total`.
- **Experiência de Destino:** Funções `renderV{0..4}Experiencia` (linhas 2906-3189) — renderizam a arte sem preço.

### Por que uma variante de Oferta (como V3) pode renderizar como Experiência (sem preço)?
1. **Payload Incorreto:** `isExperience: true` é enviado por engano no payload original da categoria (origem provável no `Phase3ArtFactory` ou `fabrica-categories.ts`).
2. **Sanitização de Blindagem (Linhas 873-877):**
   ```ts
   const price        = isExperience ? "" : sanitizeAdText(rawPrice || "");
   const installments = isExperience ? "" : sanitizeAdText(rawInstallments || "");
   const showTotal    = isExperience ? false : (rawShowTotal !== false);
   const showPixBanner= isExperience ? false : (rawShowPixBanner !== false);
   ```
   Se `isExperience` for `true`, os quatro campos de preço são anulados na origem. O preço sumirá mesmo se enviado no payload.
3. **Fallback por Exceção Silenciosa (Linhas 3209-3214):** O `try/catch` global captura qualquer erro de renderização do caminho de Oferta e força um fallback direto para `renderV0Experiencia()`, transformando um erro de código invisível em um anúncio sem preço ("degradado").

---

## 6️⃣ CONDICIONAIS DE RENDERIZAÇÃO — Falta de Fluidologia Visual

Campos opcionais possuem lógicas independentes que geram vazios ao invés de refluir a arte de forma fluida:

| Dado Ausente | Comportamento do Motor | Conseqüência no Layout (Reflow) |
|---|---|---|
| `logoDataUrl` / `hasLogo: false` | `drawProminentLogo` retorna `0` (bypass). `drawFinalBranding` ignora logo (linha 446). | **Parcial**: V0 e V1 reduzem a área útil superior (`logoH` / `logoReserve`), mas V2/V3/V4 mantêm coordenadas fixas, deixando um buraco vazio na tela. |
| `installments` ausente | Default hardcoded fallback: `"12X"` ou `"10x"` (linhas 1199, 2642). | **Nula**: Renderiza o valor fallback do código mesmo sem dados do usuário. |
| `whatsapp` / `instagram` ausentes | `drawFinalBranding` pula a linha do contato omitido. | **Nula**: O ícone simplesmente some, mantendo o gap original estático. |
| `highlights: []` (Vantagens) | `shownHighlights = highlights.slice(0, 6)`. Loop vazio. | **Nula**: Os benefícios não são desenhados e a área fica cinza/vazia. Título e preços não se reajustam. |
| `price = ""` (Experiência) | Bloco de preço é inteiramente pulado pelas funções `renderV{0..4}Experiencia`. | **Sim**: As funções de experiência são otimizadas para ocupar o espaço sem o preço. |
| `promoName = ""` | Badge de oferta superior não é desenhada. | **Nula**: V0/V1 mantêm `badgeY` estático e reservado, gerando vácuo. |
| Erro em runtime | Redirecionamento por catch-all para `renderV0Experiencia()`. | **Sim**: Força layout de experiência degradado. |

---

## 7️⃣ PADRÕES DE PAYLOAD DA GERAÇÃO (CONTRATO)

### Payload Completo — Oferta de Pacote (Exemplo V3 CVC Square)
```ts
{
  isExperience: false,           // ⚠️ CRÍTICO: false = Oferta, true = Experiência

  imageUrl: "https://.../foto-destino.jpg",
  format: "square",              // "square" | "story"

  destination: "Cancún",
  city: "Cancún - México",

  primaryColor: "#0B2B7A",       // Cor corporativa principal
  secondaryColor: "#FFD60A",     // Cor de destaque/CTA

  price: "899",                  // Valor string sem moeda ou pontuação
  installments: "12x",
  paymentMode: "installments",   // "installments" | "entry_plus" | "cash"
  paymentSuffix: "por pessoa",
  currencySymbol: "R$",
  hideCents: true,
  totalOverride: "R$ 1.798 por casal",
  showTotal: true,
  pixBannerText: "10% OFF À VISTA NO PIX",
  showPixBanner: true,

  promoName: "OFERTA DA SEMANA",
  titleOverride: "5 dias no paraíso",

  highlights: [
    { text: "Voos inclusos",      icon: "plane" },
    { text: "Hotel 5 estrelas",   icon: "hotel" },
    { text: "Transfer privativo", icon: "bus"   },
    { text: "Café da manhã",      icon: "coffee" },
  ],

  variation: 0,
  forceVariant: 3,                // Força variante 3 (CVC)

  hasLogo: true,
  logoDataUrl: "data:image/png;base64,...",
  whatsapp: "85986411294",
  instagram: "@canvaviagem"
}
```

### Payload Completo — Experiência de Destino
```ts
{
  isExperience: true,            // ⚠️ Ativa roteamento Experiência

  imageUrl: "https://.../foto-destino.jpg",
  format: "square",

  destination: "Cancún",
  travelPeriod: "Janeiro · 7 dias", // Usado como subtítulo cinematográfico

  primaryColor: "#0B2B7A",
  secondaryColor: "#FFD60A",

  promoName: "EXPERIÊNCIA ÚNICA",
  titleOverride: "Descubra o México",

  highlights: [
    { text: "Resort All Inclusive", icon: "hotel" },
    { text: "Passeios inclusos",     icon: "star"  }
  ],

  variation: 0,
  forceVariant: 3,

  hasLogo: true,
  logoDataUrl: "data:image/png;base64,...",
  whatsapp: "85986411294",
  instagram: "@canvaviagem"
  
  // Nota: price, installments, totalOverride e pixBannerText são ignorados e zerados.
}
```

---

## Part 4: Anatomia Arquitetural de `fabrica-compose-art.ts`

O arquivo funciona como um monolito único de aproximadamente 3.265 linhas, controlado por uma única função pública orquestradora (`composeTravelAd`) contendo todas as variações acopladas de forma inline em blocos `if (variant === N)`.

### 1. Funções Globais Compartilhadas (Escopo de Módulo)
Declaradas fora da função principal e consumidas por todas as variações:
* **Primitivas de Desenho**, **Ícones de Contato** e **Logo/Branding** (`drawFinalBranding`) são chamadas no fim de cada bloco para sobrepor todo o conteúdo gerado de forma imperativa.

### 2. Ausência de Isolamento Prático (Closures Internas)
A estrutura interna de `composeTravelAd` define funções utilitárias que capturam o escopo léxico de toda a execução, expondo o processamento a vazamentos acidentais de estado:
* `drawProminentLogo`, `drawBadge`, `drawHighlightsBlock` e `drawPriceCard` enxergam silenciosamente as variáveis declaradas no cabeçalho de `composeTravelAd`.

---

### 3. Os 5 Vetores de Vazamento (Por que alterar V2 quebra V0/V1)

```
                ┌─────────────────────────────────────────┐
                │  Funções módulo-globais (fora da func)  │
                │  drawFinalBranding · drawMonoIcon ·     │
                │  fillRoundRect · drawWhatsAppIcon ...   │
                └────┬───────┬───────┬───────┬───────┬────┘
                     │       │       │       │       │
       ┌─────────────┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐
       │  Closures de   │ │ V0  │ │ V1  │ │ V2  │ │ V3  │ V4
       │ composeTravelAd│ │     │ │     │ │     │ │     │
       │ drawBadge      │ │1765 │ │2105 │ │2352 │ │1314 │2608
       │ drawHighlights │ │     │ │     │ │     │ │     │
       │ drawPriceCard  │ │     │ │     │ │     │ │     │
       │ drawProminent  │ │     │ │     │ │     │ │     │
       └────────┬───────┘ └─────┘ └─────┘ └─────┘ └─────┘
                │            ▲       ▲       ▲       ▲     ▲
                └────────────┴───────┴───────┴───────┴─────┘
                  (todas chamam as closures + as globais)
```

* **🩸 Vetor A — Closures Compartilhadas:** Alterar parâmetros como gaps ou raios internos nas closures afeta as variantes V0, V1, V2 e V4 globalmente.
* **🩸 Vetor B — Monolito `drawFinalBranding`:** Uma única função renderiza o rodapé para todas as variantes.
* **🩸 Vetor C — Escopo Superior Unificado:** Variáveis como `left`, `panelBottom`, `shownHighlights` etc., residem no topo e são referenciadas indiscriminadamente.
* **🩸 Vetor D — Chamadas de `drawProminentLogo`:** Ponto comum chamado por mais de 11 ramificações do fluxo.
* **🩸 Vetor E — Falta de Namespace Local:** Falta de prefixos isoladores (`v2_`) nas declarações internas do bloco.

---

## 🧭 DIRETRIZES DE MANUTENÇÃO SEGURA E BLINDAGEM

1. **Localização Estrita:** Limite todas as alterações exclusivamente ao bloco interno do condicional da variante alvo (ex: `if (variant === 2) { ... }`).
2. **Namespace Dedicado:** Apenas declare e edite variáveis locais que possuam sufixo ou prefixo específico da variante correspondente.
3. **Imutabilidade de Closures:** **Nunca** altere o comportamento interno das closures compartilhadas ou funções globais de módulo.
4. **Desacoplamento por Extensão:** Se uma variante exigir comportamento ligeiramente diferente em uma closure compartilhada, **duplique e crie uma nova função de escopo local dedicada** (ex: crie `drawPriceCardV2`), mantendo o restante do arquivo intacto.

---

## 🧐 Análise Crítica do Desenvolvedor (Brutalmente Honesta)

O estado atual do motor de renderização da Fábrica de Anúncios revela graves falhas arquitetônicas que oneram e fragilizam qualquer processo de manutenção:

1. **Monolito de Manutenção Intolerável:** Ter um único arquivo com mais de 3.200 linhas contendo o código de desenho de 5 variantes complexas mais 5 ramificações de experiências é um convite permanente a falhas colaterais. O arquivo deveria ser quebrado em módulos limpos, onde cada variante residisse em seu próprio arquivo isolado (`renderV0.ts`, `renderV1.ts`...) importando primitivas de desenho limpas.
2. **Aposta Fraca na "Sorte" do Layout:** O sistema empilha elementos verticalmente sem qualquer motor real de fluxo vertical. Ele "torce" para que o texto inserido pelo usuário caiba e, quando não cabe, a única defesa é diminuir a fonte até o limite de ficar ilegível em dispositivos móveis, ao invés de empurrar o layout dinamicamente ou omitir benefícios de forma controlada.
3. **Ausência Absoluta de Testes de Regressão Visual:** Sem uma suíte de testes automatizados baseada em snapshots de canvas, cada alteração em uma linha do arquivo força um ciclo ineficiente de validação manual. Isso gera dependência humana constante para detectar se um ajuste sutil na V2 desalinhou a marca d'água na V0.
4. **Acoplamento Abusivo na Flag `isExperience`:** Usar um booleano simples para controlar simultaneamente o roteamento de fluxos visuais paralelos (`renderVXExperiencia`) e a higienização de dados do payload (`price`, `installments`) é um erro de responsabilidade única. Se um componente da UI errar ao passar essa flag, o sistema anula silenciosamente o preço em fonte e renderiza uma experiência degradada sem dar qualquer aviso ou log de erro. É uma falha silenciosa "por design".
