---
name: Canvaviagem Gestão de Tokens
description: Skill que monitora o consumo de tokens das ferramentas de IA, faz projeções de gasto por tarefa planejada, alerta sobre risco de esgotamento durante automações e recomenda a melhor sequência de uso para maximizar o resultado com os tokens disponíveis.
---

# Canvaviagem Gestão de Tokens

## O Que Esta Skill Faz

Antes de iniciar qualquer automação longa ou sequência de skills, esta skill:
1. Levanta o saldo atual de tokens/créditos por ferramenta
2. Estima o custo de cada tarefa planejada
3. Projeta se os tokens disponíveis são suficientes para completar tudo
4. Define a sequência ideal para maximizar resultado com o que tem
5. Emite alertas antes de iniciar tarefas que podem não terminar

**Filosofia:** Não economizar tokens — usar com inteligência. Um token mal usado em tarefa errada
na ordem errada é pior do que gastar 10x mais na tarefa certa.

---

## FERRAMENTAS MONITORADAS

### 1. Claude (Anthropic) — Principal

**Como verificar saldo/uso:**
- Acesse: https://console.anthropic.com/settings/billing
- Seção "Usage" mostra consumo do mês atual
- Seção "Billing" mostra créditos disponíveis e limite do plano

**Modelos e custo por 1M tokens (referência 2026):**

| Modelo | Input | Output | Uso ideal |
|---|---|---|---|
| claude-sonnet-4-6 | ~$3 | ~$15 | Tarefas complexas, raciocínio, código |
| claude-haiku-4-5 | ~$0,80 | ~$4 | Classificações, respostas curtas, triagem |
| claude-opus-4-6 | ~$15 | ~$75 | Análises profundas, estratégia |

**Regra de ouro:** Sonnet para 90% das tasks. Haiku para triagens e classificações.
Opus apenas para decisões estratégicas únicas do mês.

---

### 2. OpenAI (se em uso)
**Como verificar:** https://platform.openai.com/usage
Mostra uso diário e mensal em dólares.

### 3. Google Gemini / Vertex AI (se em uso)
**Como verificar:** https://console.cloud.google.com/billing

### 4. Perplexity / ferramentas de pesquisa web (se em uso)
**Como verificar:** painel da conta em perplexity.ai

---

## TABELA DE CUSTO ESTIMADO POR TAREFA

Estimativas para o ecossistema Canva Viagem com claude-sonnet-4-6:

### Tasks Leves (~500-2.000 tokens output)
| Tarefa | Tokens estimados | Custo aprox. |
|---|---|---|
| Resposta de atendimento (1 mensagem) | ~1.500 | ~$0,02 |
| Legenda de post Instagram | ~1.000 | ~$0,01 |
| Classificação de feedback | ~500 | ~$0,01 |
| Email simples (1 email) | ~1.500 | ~$0,02 |
| Análise de 1 métrica | ~800 | ~$0,01 |

### Tasks Médias (~2.000-8.000 tokens output)
| Tarefa | Tokens estimados | Custo aprox. |
|---|---|---|
| Calendário de conteúdo semanal | ~5.000 | ~$0,08 |
| Sequência de 3 emails | ~4.000 | ~$0,06 |
| Relatório visual semanal | ~6.000 | ~$0,09 |
| Script de Reel completo | ~3.000 | ~$0,05 |
| Análise de funil completa | ~7.000 | ~$0,11 |
| Plano de lançamento 7 dias | ~8.000 | ~$0,12 |

### Tasks Pesadas (~8.000-30.000 tokens output)
| Tarefa | Tokens estimados | Custo aprox. |
|---|---|---|
| Relatório mensal completo | ~15.000 | ~$0,23 |
| Sequência de automação múltipla (5+ skills) | ~20.000 | ~$0,30 |
| Pesquisa de mercado completa (YouTube + Social) | ~25.000 | ~$0,38 |
| Orquestração completa semanal | ~12.000 | ~$0,18 |
| Criação de nova skill completa | ~10.000 | ~$0,15 |

---

## PROTOCOLO DE VERIFICAÇÃO ANTES DE AUTOMAÇÃO LONGA

Quando for iniciar uma sequência de 3+ skills encadeadas, executar este checklist:

```
CHECKLIST PRÉ-AUTOMAÇÃO
========================
[ ] Qual é o saldo atual de créditos? (verificar console)
[ ] Qual é o limite mensal do plano?
[ ] Quanto já foi consumido este mês?
[ ] Quanto resta?

PLANO DA AUTOMAÇÃO:
Tarefa 1: [nome] → estimativa: X tokens
Tarefa 2: [nome] → estimativa: X tokens
Tarefa 3: [nome] → estimativa: X tokens
...
TOTAL ESTIMADO: X tokens / $X

MARGEM DE SEGURANÇA:
Saldo disponível: $X
Total estimado: $X
Sobra projetada: $X (meta: mínimo 30% de margem)

DECISÃO:
[ ] OK — iniciar automação
[ ] ATENÇÃO — reduzir escopo ou dividir em sessões
[ ] RISCO — aguardar recarga ou repriorizar
```

---

## PROJEÇÃO MENSAL DE CONSUMO

### Rotina Fixa do Canva Viagem (mensal)

| Frequência | Tarefa | Tokens/execução | Total mensal |
|---|---|---|---|
| Diária (30x/mês) | Orquestrador diário | 8.000 | 240.000 |
| Diária (30x/mês) | Post Instagram (legenda + copy) | 2.000 | 60.000 |
| Semanal (4x/mês) | Relatório visual semanal | 6.000 | 24.000 |
| Semanal (4x/mês) | Calendário de conteúdo | 5.000 | 20.000 |
| Semanal (4x/mês) | Análise de churn | 4.000 | 16.000 |
| Mensal (1x/mês) | Relatório produto completo | 15.000 | 15.000 |
| Mensal (1x/mês) | Pesquisa de mercado | 25.000 | 25.000 |
| Mensal (1x/mês) | Campanha de email (sequência) | 6.000 | 6.000 |
| Variável | Atendimento (10 casos/dia) | 1.500 | 45.000 |
| Variável | Win-back e retenção | 3.000 | 12.000 |
| **TOTAL BASE** | | | **~463.000 tokens/mês** |

**Em dólares com Sonnet 4.6:**
- Input (contexto + sistema): ~$0,70
- Output (463k tokens): ~$6,95
- **Total estimado: ~$7-10/mês na rotina base**

**Com lançamentos e automações extras:** ~$15-25/mês

---

## ESTRATÉGIA DE OTIMIZAÇÃO (SEM ECONOMIZAR)

### Regra 1 — Modelo certo para cada tarefa
- Triagem de mensagens, classificações → **Haiku** (6x mais barato, mesma qualidade para isso)
- Criação de conteúdo, estratégia, análise → **Sonnet**
- Decisão estratégica única do mês → **Opus** (vale o custo)

### Regra 2 — Contexto compartilhado em automações
Quando encadear skills, passar o contexto anterior como resumo, não como texto bruto.
Economiza 30-50% de tokens de input sem perder qualidade.

**Errado:** passar 5.000 tokens do relatório inteiro para a próxima skill
**Certo:** passar "resumo: MRR R$1.002, churn 38%, 5 dias sem nova assinatura" (200 tokens)

### Regra 3 — Batch de tarefas similares
Em vez de chamar o atendimento 10 vezes por dia (uma mensagem por vez),
agrupar todas as mensagens do dia em uma chamada só.
Reduz custo de contexto em ~70%.

### Regra 4 — Não repetir pesquisa já feita
Se o canvaviagem_produto_youtube já pesquisou tendências hoje,
as outras skills usam o resultado — não fazem nova pesquisa.
O resultado vive no contexto da sessão.

### Regra 5 — Priorizar output de alta alavancagem
R$0,15 para criar um calendário semanal inteiro = alto valor por token.
R$0,02 para uma legenda avulsa sem contexto = baixo valor por token.
Sempre preferir execuções em bloco com alto impacto.

---

## ALERTAS AUTOMÁTICOS

Esta skill emite alerta quando detectar qualquer condição abaixo:

**ALERTA VERMELHO — Parar imediatamente:**
- Saldo restante < 20% do limite mensal E ainda faltam mais de 10 dias no mês
- Automação estimada consome > 80% do saldo restante

**ALERTA LARANJA — Revisar plano:**
- Consumo do mês já > 70% antes do dia 20
- Uma única tarefa estimada em > 30.000 tokens

**ALERTA VERDE — Aprovado para executar:**
- Saldo restante > 50% do período que falta
- Tarefa estimada < 10% do saldo disponível

---

## RELATÓRIO DE USO (GERAR SEMANALMENTE)

```
RELATÓRIO DE TOKENS — SEMANA [N]
=================================
PLANO ATUAL:        [nome do plano / limite]
CONSUMO SEMANA:     ~X tokens / $X
CONSUMO ACUMULADO:  ~X tokens / $X
PROJEÇÃO MENSAL:    $X (no ritmo atual)
SALDO ESTIMADO:     $X restantes

TOP 3 TAREFAS QUE MAIS CONSUMIRAM:
1. [tarefa] — X tokens
2. [tarefa] — X tokens
3. [tarefa] — X tokens

STATUS:
[ ] No limite — continuar normalmente
[ ] Atenção — reduzir frequência de tasks pesadas
[ ] Crítico — priorizar apenas tarefas de alto impacto

RECOMENDACAO DA SEMANA:
[ação específica baseada nos dados]
=================================
```

---

## COMO USAR ESTA SKILL

**Antes de uma automação longa:**
> "Use canvaviagem_gestao_tokens. Vou rodar orquestrador + relatório semanal + campanha de email + win-back. Quanto isso vai custar e tenho tokens suficientes?"

**Para relatório semanal de uso:**
> "Use canvaviagem_gestao_tokens. Me gera o relatório de uso da semana e projeta o mês."

**Para decidir sequência de automação:**
> "Use canvaviagem_gestao_tokens. Tenho essas 6 tarefas pra fazer hoje. Me diz a ordem mais inteligente e se tem alguma que posso adiar sem impacto."

**Para verificar saldo atual:**
> "Use canvaviagem_gestao_tokens. Me diz o que preciso verificar para saber meu saldo atual e como checar em cada ferramenta."
