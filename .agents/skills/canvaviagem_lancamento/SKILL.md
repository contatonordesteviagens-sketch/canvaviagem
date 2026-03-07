---
name: Canvaviagem Lancamento
description: Skill que planeja e executa lançamentos de novos produtos Hotmart e de campanhas de relançamento — desde o aquecimento até o fechamento do carrinho, com scripts prontos para cada etapa.
---

# Canvaviagem Lancamento

## Quando Usar Esta Skill

- Lançamento de produto novo na Hotmart
- Relançamento trimestral de produto existente
- Campanha sazonal (Carnaval, Julho, Fim de Ano)
- Campanha de conversão de leads para assinatura com prazo

**Pré-requisito para lançar produto novo:**
Assinantes ativos > 150 OU lista de leads > 1.000 emails.
Antes disso, priorizar retenção e crescimento orgânico.

## Estrutura do Lançamento de 7 Dias

### FASE 1 — AQUECIMENTO (Dias 1 a 3)

Objetivo: criar antecipação sem revelar o produto ainda.

**Dia 1 — Dor (sem mencionar produto):**
Post/Story: "Você sabe qual é o maior erro das agências de viagem no Instagram?"
Conteúdo educativo que expõe o problema que o produto resolve.
Sem CTA de venda. CTA de engajamento: "Comenta aqui se você já passou por isso."

**Dia 2 — Agitação (tornar a dor urgente):**
Post/Story: mostrar o custo de não resolver o problema.
Exemplo: "Enquanto você não posta, seu concorrente está ganhando o cliente que seria seu."
CTA: "Salva esse post — amanhã tenho uma solução."

**Dia 3 — Teaser:**
Story/Reel: "Amanhã vou mostrar algo que eu criei especialmente para [avatar]."
Email para lista: "Estou finalizando algo. Você vai ser o(a) primeiro(a) a saber."

### FASE 2 — LANÇAMENTO (Dia 4)

**Post principal de lançamento:**
Estrutura VSL ou Reel:
- Hook (primeiros 3 segundos): mostrar o resultado final
- Problema: a dor que o produto resolve
- Solução: o produto e como funciona
- Prova: depoimento ou demonstração
- Oferta: preço + bônus + garantia
- CTA: "Link na bio" ou "Swipe up"

**Email de lançamento:**
```
Assunto: Chegou — [nome do produto]

[Nome],

Passou os últimos [tempo] tentando [fazer algo difícil]?

Criei o [produto] especialmente para resolver isso.

[Descrição do produto em 2-3 linhas]

Por apenas R$[preço] — com garantia de 7 dias.

[QUERO O [PRODUTO] AGORA →]

Lucas
```

**Stories do dia 4:**
- Story 1: anúncio do lançamento (gif/imagem impactante)
- Story 2: demo do produto (screencast ou imagens)
- Story 3: depoimento de quem testou
- Story 4: CTA com link

### FASE 3 — SUSTENTAÇÃO (Dias 5 e 6)

Objetivo: converter os indecisos.

**Dia 5 — Prova Social:**
- Post com depoimento de quem comprou (ou de assinante que usa conteúdo similar)
- Resposta a objeções frequentes no Stories (caixinha de perguntas)
- Email: "Dúvidas sobre o [produto]? Respondo aqui."

**Dia 6 — Urgência:**
- Post: "Últimas horas com esse preço"
- Story countdown: temporizador até meia-noite
- Email: "Oferta encerra amanhã à meia-noite"

```
Assunto: Encerra amanhã — [produto]

[Nome],

Restam menos de 24 horas para garantir o [produto] por R$[preço].

Amanhã à meia-noite o preço volta para R$[preço normal] — ou encerro as vendas.

[GARANTIR MINHA VAGA →]

Lucas
```

### FASE 4 — FECHAMENTO (Dia 7)

**Manhã (10h):**
Story: "Hoje é o último dia."
Email: "Encerra hoje — última chamada"

**Tarde (17h):**
Story: "Em 7 horas fecha."

**Noite (21h) — email final:**
```
Assunto: Em 3 horas fecha — última chance

[Nome],

À meia-noite de hoje encerro as vendas do [produto].

Se você estava na dúvida, a hora é agora.

Garantia de 7 dias — se não gostar, devolvemos tudo.

[QUERO GARANTIR AGORA →]

Depois disso, o preço sobe ou as vagas encerram.

Lucas
```

**Meia-noite:** fechar o link ou subir o preço.

## Relançamento Trimestral (Produto Existente)

Estrutura mais enxuta — 4 dias:

**Dia 1:** Post de reaquecimento ("De volta por tempo limitado")
**Dia 2:** Demo + depoimento
**Dia 3:** Oferta com prazo de 48h
**Dia 4:** Fechamento

Email de relançamento:
```
Assunto: [Produto] está de volta — por 48 horas

[Nome],

[Produto] foi um dos mais pedidos.

Por isso estou relançando por 48 horas no mesmo preço: R$[preço].

Depois disso, o preço volta para R$[preço normal].

[QUERO O [PRODUTO] →]

Lucas
```

## Campanhas Sazonais

### Carnaval (Janeiro/Fevereiro)
Produto: Pack Destinos de Carnaval
Hook: "Seus clientes vão viajar no Carnaval — você está postando sobre isso?"
Oferta: R$47 com bump de stories de Carnaval (R$27)

### Julho — Férias de Inverno
Produto: Pack Destinos de Inverno + Praias
Hook: "Julho chegou — as famílias estão pesquisando viagem AGORA"
Oferta: R$47 com bump de roteiros prontos (R$27)

### Fim de Ano (Novembro/Dezembro)
Produto: Pack Réveillon e Natal
Hook: "Fim de ano: o maior movimento do turismo. Você está pronto?"
Oferta: R$97 (pack completo com scripts de WhatsApp para vender viagens)

## Métricas de Lançamento

| Métrica | Meta mínima | Meta boa |
|---|---|---|
| Taxa de abertura dos emails | 25% | 40% |
| CTR nos emails de venda | 5% | 12% |
| Conversão da página de vendas | 2% | 5% |
| Bump acceptance rate | 20% | 35% |
| Taxa de reembolso | < 10% | < 5% |
| ROI do lançamento | > 3x | > 7x |

## Integrações

**→ Produto:**
Feedback pós-lançamento alimenta `canvaviagem_produto_feedback`.

**→ Hotmart:**
Dados de vendas e bumps são monitorados por `canvaviagem_hotmart`.

**→ Aquisição:**
Lista de compradores não-assinantes vai para `canvaviagem_aquisicao_email`.

**→ Atendimento:**
Volume de DMs e suporte pós-lançamento gerenciado por `canvaviagem_atendimento`.

**→ Conteúdo:**
Calendário de aquecimento coordenado com `canvaviagem_aquisicao_conteudo`.
