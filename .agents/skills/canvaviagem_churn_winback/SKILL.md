---
name: Canvaviagem Anti-Churn Win-Back
description: Skill que reconquista assinantes cancelados — com sequência de mensagens, ofertas estratégicas e diagnóstico de motivo de cancelamento para recuperar receita perdida e transformar feedback de ex-clientes em melhoria de produto.
---

# Canvaviagem Anti-Churn Win-Back

## O Oportunidade Ignorada

16 pessoas já assinaram e cancelaram o Canva Viagem. A maioria dos negócios ignora esse grupo. Mas esses 16 ex-assinantes são os leads mais quentes do produto — eles já compraram uma vez, já viram o produto, e podem comprar de novo com a oferta certa e no momento certo.

Recuperar 5 desses 16 = 5 × R$29 = R$145/mês a mais de MRR sem custo de aquisição.

## Objetivos

1. Entender o motivo real de cada cancelamento
2. Classificar se é recuperável ou não
3. Executar sequência de win-back no momento certo
4. Transformar o feedback em melhoria de produto (alimentar `canvaviagem_produto_inovacao`)

## Diagnóstico de Cancelamento — Classificação

**Tipo A — Cancelou por falta de uso (recuperável)**
Motivo: "Não tive tempo", "Esqueci de usar", "Fiquei sem tempo esse mês"
Probabilidade de retorno: Alta — a dor ainda existe, só não estava ativo

**Tipo B — Cancelou por dificuldade técnica (recuperável com suporte)**
Motivo: "Tive dificuldade de baixar", "Não consegui colocar meu logo"
Probabilidade de retorno: Alta — resolve o problema e ele volta

**Tipo C — Cancelou por falta de resultado (recuperável com prova social)**
Motivo: "Postei mas não tive retorno", "Não veio cliente nenhum"
Probabilidade de retorno: Média — precisa de educação sobre estratégia de conteúdo

**Tipo D — Cancelou por preço (recuperável com oferta)**
Motivo: "Ficou caro", "Não estava no orçamento"
Probabilidade de retorno: Média — oferta de desconto ou plano anual

**Tipo E — Cancelou por produto não resolver (não recuperável agora)**
Motivo: "Não era o que eu precisava", "Minha agência é diferente"
Probabilidade de retorno: Baixa — alimentar inovação de produto para resolver no futuro

## Sequência de Win-Back

### Mensagem 1 — 7 dias após cancelamento

**Canal:** Email
**Tom:** Humano, sem pressão de venda

```
Assunto: Sentimos sua falta — o que aconteceu?

[Nome],

Vi que você cancelou a assinatura do Canva Viagem.

Não quero te mandar promoção agora.
Quero entender o que não funcionou.

Responde essa pergunta (1 linha já ajuda):
Por que você cancelou?

(a) Não tive tempo de usar
(b) Tive dificuldade de usar o produto
(c) Postei mas não vi resultado
(d) Ficou caro nesse momento
(e) O produto não era o que eu precisava

Sua resposta vai me ajudar a melhorar.
E quem sabe, quando a hora for certa, você volta.

Lucas | Canva Viagem
```

### Mensagem 2 — 21 dias após cancelamento (se não respondeu)

**Canal:** Email

```
Assunto: Tem algo aqui pra você

[Nome],

Desde que você saiu, lançamos [N] novos conteúdos na plataforma.

Incluindo [destino específico relevante] — que tem sido
muito pedido por agentes em [região].

Se quiser dar uma olhada, posso liberar 7 dias gratuitos
pra você testar sem compromisso.

É só responder esse email com "quero".

Lucas
```

### Mensagem 3 — 45 dias após cancelamento

**Canal:** WhatsApp (se tiver o número) ou email final

```
Assunto: Última mensagem — depois não vou mais incomodar

[Nome],

Essa é minha última mensagem.

Não vou mandar mais email se você não quiser.
Mas quero deixar uma coisa registrada:

O plano anual do Canva Viagem é R$197/ano.
Isso dá R$16,40/mês — quase metade do mensal.

Se a questão foi preço, esse é o melhor momento pra voltar.

[ASSINAR PLANO ANUAL →]

Se não quiser mais receber emails, é só responder "parar".

Lucas
```

## Ofertas de Win-Back por Tipo

**Para Tipo A (falta de uso):**
- Oferecer 1 mês grátis de extensão da assinatura se reativar essa semana
- Incluir guia "Como publicar 5 vezes por semana em 1 hora"

**Para Tipo B (dificuldade técnica):**
- Oferecer sessão de 20 minutos por videoconferência para resolver o problema
- Criar tutorial específico para o problema relatado

**Para Tipo C (falta de resultado):**
- Compartilhar depoimento de agente na mesma situação que viu resultado
- Oferecer guia de "Como transformar vídeo pronto em pedido de orçamento"

**Para Tipo D (preço):**
- Oferecer plano anual (R$197/ano = R$16,40/mês — 43% de desconto)
- Se necessário, oferecer 2 meses por R$39 como retorno

**Para Tipo E (produto não resolve):**
- Não insistir em venda
- Perguntar o que precisaria ter no produto para ser útil
- Alimentar `canvaviagem_produto_inovacao` com o feedback

## Rastreamento de Win-Back

Para cada ex-assinante, registrar:

```
Nome: [nome]
Data de cancelamento: [data]
Tipo classificado: [A/B/C/D/E]
Mensagem 1 enviada em: [data] | Resposta: [sim/não/o quê]
Mensagem 2 enviada em: [data] | Resposta: [sim/não/o quê]
Mensagem 3 enviada em: [data] | Resposta: [sim/não/o quê]
Resultado: [reativou / não reativou / em andamento]
Motivo real confirmado: [texto]
```

## Automação Futura

Implementar no Supabase/Resend: trigger automático quando `subscription.canceled` chega via webhook Stripe → inicia sequência de win-back automaticamente nos dias 7, 21 e 45.

## Meta

| Métrica | Atual | Meta 60 dias |
|---|---|---|
| Ex-assinantes totais | 16 | — |
| Contactados | 0 | 16 (100%) |
| Taxa de resposta | 0% | 50% |
| Taxa de win-back | 0% | 20% (3-4 reativações) |
| MRR recuperado | R$0 | R$87-116 |

Recuperar apenas 4 ex-assinantes = R$116/mês de MRR sem gastar nada em aquisição.
