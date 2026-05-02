# O que eu entendi dos seus 3 prompts + áudio

Você quer **3 coisas**, nessa ordem, sem quebrar nada do que já está bom:

### 1. CONGELAR o que já funciona

- **V0, V1 e V2** das categorias **1/1/1** (Foto Real → Oferta → 1:1) e **2/1/1** (Sua Imagem → Oferta → 1:1) ficam **intocáveis**: layout, cores, tipografia, ícones, lógica.
- Eu só vou **adicionar** novas variantes, nunca reescrever as existentes.
- Hoje no código a função `composeTravelAd` recebe `forceVariant` e cicla `variation % N`. Vou tratar V0/V1/V2 como o bloco imutável e fazer V3/V4/V5 entrarem como **novos `case**` no seletor de variante — sem tocar nos antigos.

### 2. CRIAR V3, V4 e V5 baseadas nas 3 imagens de referência

- **V3 — "Oferta Box Forte" (Maceió/CVC)**: balão amarelo central grande, "PACOTE / DESTINO" no topo (1ª palavra mais grossa, 2ª mais fina e maior), linha de ícones monocromáticos, "a partir de" + selo "12X" + "sem juros" colado no preço gigante, "Total por pessoa: R$ X" e faixa azul-escura inferior "5% OFF À VISTA NO PIX" com ícone do Pix.
- **V4 — "Box Premium Central" (Portugal)**: fundo turístico, box central sólido (cor primária escura), tipografia grande e elegante alinhada à esquerda dentro do box, ícones monocromáticos pequenos, sensação internacional, muito espaçamento.
- **V5 — "Split Clean" (Maragogi)**: layout dividido — esquerda (35%) bege/neutro com headline "Conheça {DESTINO}!", lista vertical de info com ícones mono ("2 adultos / 5 noites / Passagens") e box pequeno de preço; direita (65%) foto do destino. Visual editorial, muito espaço em branco.
- Todas seguem **a mesma identidade** (cores primária/secundária do usuário, fontes Inter, mesmo sistema de inputs).

### 3. INTEGRAR V3/V4/V5 nas categorias existentes

- Adicionar nas categorias **1/1/1**, **2/1/1** e **3/1/1** (IA Pura → Oferta → 1:1).
- Apenas **adicionadas ao final** do ciclo de variação. Ordem atual preservada.
- O sistema continua gerando **1 banner por clique** (regra atual) e ciclando V0→V1→V2→V3→V4→V5 sem repetir as últimas, usando a guarda já existente.
- Padrão "escalável": quando você mandar novas imagens de referência no futuro, eu repito esse processo (analisar imagem → virar variante VN → plugar no seletor sem mexer nas anteriores).

---

# O que eu também entendi do **áudio** (importante)

Você listou ajustes que **NÃO estão nos 3 prompts escritos**, e quer aplicar junto:

### A. Painel de **Modo de exibição de preço** — adicionar mais opções

Hoje só tem `Parcelado / À vista / Entrada+parcelas`. Adicionar:

- **"Parcelado SEM JUROS"** (separa de "Parcelado" comum, com selo "sem juros" embutido — igual à referência CVC).
- **"A partir de"** (já existe `from` no compose, mas não está exposto no painel — vou expor).
- **"Total com desconto à vista"** (mostra "% OFF À VISTA NO PIX" — opção que liga/desliga a faixa azul do V3).
- **"Por casal" / "Por grupo" / "Total do pacote"** como opções de **complemento** que aparecem **mesmo sem apagar** o campo (hoje só aparecem quando o usuário limpa — bug). Vou colocar como `datalist` sempre visível + chips clicáveis.

### B. Campo **Valor** — opção "sem vírgula / sem centavos"

- Adicionar um toggle `[ ] Mostrar centavos` (ligado por padrão).
- Quando desligado, formata `1.499,90` → `1.499` em todas as variantes. (o balão se adapta na criação da imagem, se tem os centavos ele fica maior , se não tem os centavos fica menor na geração de imagem, se adapta , igual já tem e existe nos icones. 

### C. **Dados do anúncio** (passo 3) — adicionar nova categoria editável

Hoje tem só Título. Adicionar **2 colunas × 2 fileiras**:

- Coluna 1: **Destino** | **Nome da promoção**
- Coluna 2: **Título** | **Quantidade de dias** (com lista clicável:  7, 15 dias , janeiro, dezembro, data 12/8— editável)
- Cada campo segue o padrão do Título: clica → abre lista de presets → escolhe ou edita livremente.
- O campo "Quantidade de dias, mês, data" alimenta a linha "X dias ✈ 🚌 🏨 ☕ (icones deve seguir a mesma cor primária ou secundária selecionada" da V3 (hoje é extraída do primeiro highlight via regex — vai virar campo dedicado).

### D. Correção do **balão V3** (referência Maceió que você anexou)

- Primeira palavra do topo (`PACOTE`) **bold pesado**, segunda (`MACEIÓ`) **maior e mais fina**.
- Ícones **monocromáticos** (uma cor só, derivada da primária) — remover emojis coloridos atuais manter todos da mesma cor.
- "a partir de" pequeno acima, **selo `12X / sem juros**` colado à esquerda do `R$ 229` gigante.
- "Total por pessoa: R$ 2.739" abaixo (calculado automaticamente: `parcelas × valor` com pequeno desconto opcional).
- Faixa inferior `5% OFF À VISTA NO PIX 💠` com cor contrastante.

---

# Arquivos que vão ser tocados

```text
src/lib/fabrica-compose-art.ts        → adicionar drawV3 / drawV4 / drawV5 (sem tocar drawV0/V1/V2)
src/pages/fabrica/Phase3ArtFactory.tsx → expandir PAYMENT_PRESETS, toggle "sem centavos",
                                         novo bloco "Dados do anúncio" 2x2 com Dias/Promo,
                                         expor V3/V4/V5 no ciclo de variantes
src/hooks/useFabricaContext.tsx       → novos campos: lastDays, lastShowCents, lastPixDiscount
```

Sem mexer em: prompts da edge function, V0/V1/V2, lógica de PremiumGate, autenticação, qualquer outra área do app.

---

# Pergunta antes de eu codar

Confirma 3 pontos rápidos:

1. **V3/V4/V5 também na categoria 3/1/1 (IA Pura)?** Você falou "1/1/1, 2/1/1 e 3/1/1" no áudio — confirma que entra nas 3, mesmo na IA Pura (que gera a imagem inteira via Gemini, sem overlay canvas)? Se sim, na IA Pura as variantes V3/V4/V5 viram **prompts de imagem** (não overlay). Sim em todas as 3 categorias desde que seja formato oferta e feed. 
2. **"Total por pessoa" calculado** = `parcelas × valor` automático, ou campo editável manual também? Sim. 
3. O **toggle "sem centavos"** vale para todas as variantes (V0–V5) ou só nas novas? Todas as variaveis. 

Respondendo essas 3, eu já saio implementando exatamente como descrito acima.