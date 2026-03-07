# MAPA COMPLETO DO ECOSSISTEMA DE AGENTES
# Canva Viagem | Lucas Henrique
# Atualizado: Março/2026

---

## COMO USAR ESTE MAPA

Este documento é o índice vivo de todos os departamentos e skills do negócio.
Antes de acionar qualquer skill, consulte aqui para saber qual usar e qual
a sequência correta de execução.

**Regra de ouro:** Sempre comece pelo `canvaviagem_orquestrador`.
Ele lê os dados, diagnostica o estado do negócio e diz qual skill acionar a seguir.

---

## HIERARQUIA GERAL

```
ORQUESTRADOR DIÁRIO
canvaviagem_orquestrador
        │
        ├── CEO
        │   canvaviagem_ceo
        │           │
        │     (coordena tudo)
        │
        ├──────────────────────────────────────────
        │  DEPT 1: DADOS E INTELIGÊNCIA
        ├──────────────────────────────────────────
        │   canvaviagem_dados_stripe
        │   canvaviagem_dados_analytics
        │   canvaviagem_relatorio_visual
        │           ↓ alimenta todos os outros departamentos
        │
        ├──────────────────────────────────────────
        │  DEPT 2: ANTI-CHURN (RETENÇÃO)
        ├──────────────────────────────────────────
        │   canvaviagem_churn_diretor
        │   ├── canvaviagem_churn_onboarding
        │   ├── canvaviagem_churn_engajamento
        │   └── canvaviagem_churn_winback
        │
        ├──────────────────────────────────────────
        │  DEPT 3: AQUISIÇÃO
        ├──────────────────────────────────────────
        │   canvaviagem_aquisicao_diretor
        │   ├── canvaviagem_aquisicao_conteudo
        │   │       ↓ usa
        │   │   canvaviagem_copywriter
        │   │   canvaviagem_designer
        │   │   canvaviagem_feed
        │   │   canvaviagem_stories
        │   ├── canvaviagem_aquisicao_email
        │   └── canvaviagem_aquisicao_trafego
        │               ↓ conecta com
        │           canvaviagem_trafego (skill original)
        │
        ├──────────────────────────────────────────
        │  DEPT 4: ESCALA
        ├──────────────────────────────────────────
        │   canvaviagem_escala_diretor
        │   ├── canvaviagem_escala_funil
        │   └── canvaviagem_escala_anual
        │
        ├──────────────────────────────────────────
        │  DEPT 5: PRODUTO E MERCADO
        ├──────────────────────────────────────────
        │   canvaviagem_produto_diretor
        │   ├── canvaviagem_produto_youtube
        │   ├── canvaviagem_produto_social
        │   │       ↓ conecta com
        │   │   canvaviagem_mercado (skill original)
        │   ├── canvaviagem_produto_feedback
        │   └── canvaviagem_produto_inovacao
        │               ↓ alimenta
        │           canvaviagem_cmo (novas campanhas)
        │           canvaviagem_ceo (novos produtos)
        │
        ├──────────────────────────────────────────
        │  DEPT 7: RELACIONAMENTO E EXPANSÃO
        ├──────────────────────────────────────────
        │   canvaviagem_atendimento   (DMs, WhatsApp, email, suporte)
        │   canvaviagem_comunidade    (grupo de assinantes)
        │   canvaviagem_hotmart       (produtos avulsos + upsell)
        │   canvaviagem_lancamento    (novos produtos e relancamentos)
        │   canvaviagem_collab        (parcerias e influenciadores)
        │
        └──────────────────────────────────────────
           DEPT 6: MARKETING E CONTEÚDO (original)
        ──────────────────────────────────────────
            canvaviagem_cmo
            ├── canvaviagem_copywriter
            ├── canvaviagem_designer
            ├── canvaviagem_feed
            ├── canvaviagem_stories
            ├── canvaviagem_seo
            ├── canvaviagem_blog
            ├── canvaviagem_revisor
            ├── canvaviagem_mercado
            └── canvaviagem_trafego
```

---

## FLUXO DE DADOS ENTRE SKILLS

```
DADOS ENTRAM AQUI:
canvaviagem_dados_stripe     → MRR, assinantes, churn, receita
canvaviagem_dados_analytics  → page views, cliques, fontes de tráfego

        ↓ alimentam

canvaviagem_relatorio_visual → gera relatório integrado visual

        ↓ distribui para

canvaviagem_churn_diretor    → age no churn
canvaviagem_aquisicao_diretor → age na aquisição
canvaviagem_escala_diretor   → age na escala
canvaviagem_produto_feedback → age no produto
canvaviagem_ceo              → decisão estratégica
```

---

## FLUXO DE CONTEÚDO ORGÂNICO

```
canvaviagem_mercado          → identifica oportunidades de tema
canvaviagem_produto_youtube  → identifica tendências e destinos em alta
canvaviagem_produto_social   → captura linguagem real do avatar

        ↓ alimentam

canvaviagem_aquisicao_conteudo → define o que criar essa semana
canvaviagem_cmo              → aprova calendário editorial

        ↓ delega execução para

canvaviagem_copywriter       → escreve hook, legenda, CTA
canvaviagem_designer         → cria a arte/thumbnail
canvaviagem_feed             → monta o post de feed
canvaviagem_stories          → monta os stories do dia

        ↓ passa por

canvaviagem_revisor          → revisa antes de publicar
```

---

## FLUXO ANTI-CHURN

```
canvaviagem_dados_stripe → identifica cancelamentos e novos assinantes

        ↓

canvaviagem_churn_diretor → diagnostica causa raiz do churn
        │
        ├── Cancelamento semana 1-2?
        │   → canvaviagem_churn_onboarding
        │     (sequência de boas-vindas + primeiro uso garantido)
        │
        ├── Assinante sem login há 14+ dias?
        │   → canvaviagem_churn_engajamento
        │     (email de reativação + WhatsApp pessoal)
        │
        └── Já cancelou?
            → canvaviagem_churn_winback
              (sequência de 3 mensagens: D7, D21, D45)
              ↓ se recuperar → volta ao onboarding
              ↓ feedback → alimenta canvaviagem_produto_feedback
```

---

## FLUXO DE ESCALA

```
canvaviagem_escala_diretor → monitora MRR vs meta toda semana
        │
        ├── MRR crescendo? → escalar aquisição
        │   → canvaviagem_aquisicao_diretor
        │
        ├── Churn alto? → priorizar retenção
        │   → canvaviagem_churn_diretor
        │
        ├── Funil com baixa conversão? → otimizar página
        │   → canvaviagem_escala_funil
        │
        └── Poucos assinantes anuais? → campanha de migração
            → canvaviagem_escala_anual
```

---

## FLUXO DE INOVAÇÃO DE PRODUTO

```
canvaviagem_produto_youtube   ↘
canvaviagem_produto_social    →  canvaviagem_produto_diretor
canvaviagem_produto_feedback  ↗       ↓
canvaviagem_mercado           →  canvaviagem_produto_inovacao
                                      ↓
                              Sugestões de novos produtos
                                      ↓
                              canvaviagem_ceo (aprova)
                                      ↓
                              canvaviagem_cmo (planeja lançamento)
                                      ↓
                              canvaviagem_dev (implementa)
```

---

## ÍNDICE COMPLETO DE SKILLS

### ORQUESTRADOR
| Skill | Quando Usar |
|---|---|
| `canvaviagem_orquestrador` | Toda manhã. Ponto de entrada obrigatório. |

### LIDERANÇA
| Skill | Quando Usar |
|---|---|
| `canvaviagem_ceo` | Decisões estratégicas, revisão mensal, aprovações |
| `canvaviagem_cmo` | Estratégia de marketing, plano do mês, coordenação |

### DEPT DADOS E INTELIGÊNCIA
| Skill | Quando Usar |
|---|---|
| `canvaviagem_dados_stripe` | Buscar números reais do Stripe (assinantes, MRR) |
| `canvaviagem_dados_analytics` | Buscar dados de tráfego, page views, cliques |
| `canvaviagem_relatorio_visual` | Gerar relatório visual integrado (diário/semanal/mensal) |
| `canvaviagem_gestao_tokens` | Antes de automação longa — verificar saldo, estimar custo, projetar uso |

### DEPT ANTI-CHURN
| Skill | Quando Usar |
|---|---|
| `canvaviagem_churn_diretor` | Quando tiver cancelamento ou churn alto |
| `canvaviagem_churn_onboarding` | Para todo novo assinante (semana 1) |
| `canvaviagem_churn_engajamento` | Assinantes que não abrem email ou não logam |
| `canvaviagem_churn_winback` | Para os 16 ex-assinantes cancelados |

### DEPT AQUISIÇÃO
| Skill | Quando Usar |
|---|---|
| `canvaviagem_aquisicao_diretor` | Quando assinaturas pararem ou precisar escalar |
| `canvaviagem_aquisicao_conteudo` | Para planejar conteúdo orgânico da semana |
| `canvaviagem_aquisicao_email` | Para campanhas de email para leads e compradores |
| `canvaviagem_aquisicao_trafego` | Para planejar e executar tráfego pago |

### DEPT ESCALA
| Skill | Quando Usar |
|---|---|
| `canvaviagem_escala_diretor` | Revisão semanal de progresso da meta |
| `canvaviagem_escala_funil` | Otimizar /planos e o checkout |
| `canvaviagem_escala_anual` | Converter mensais para anual |

### DEPT PRODUTO E MERCADO
| Skill | Quando Usar |
|---|---|
| `canvaviagem_produto_diretor` | Reunião mensal de melhoria de produto |
| `canvaviagem_produto_youtube` | Pesquisa de tendências e concorrentes no YouTube |
| `canvaviagem_produto_social` | Monitorar comentários e grupos de agentes |
| `canvaviagem_produto_feedback` | Analisar avaliações e pedidos de cancelamento |
| `canvaviagem_produto_inovacao` | Sugerir novos produtos e melhorias |

### DEPT RELACIONAMENTO E EXPANSÃO
| Skill | Quando Usar |
|---|---|
| `canvaviagem_atendimento` | Responder DMs, WhatsApp, emails de suporte e cancelamentos |
| `canvaviagem_comunidade` | Gerir grupo WhatsApp de assinantes, engajamento, desafios |
| `canvaviagem_hotmart` | Monitorar vendas Hotmart e converter compradores em assinantes |
| `canvaviagem_lancamento` | Planejar e executar lançamento ou relançamento de produto |
| `canvaviagem_collab` | Identificar e fechar parcerias com influenciadores e complementares |

### DEPT MARKETING E CONTEÚDO (original)
| Skill | Quando Usar |
|---|---|
| `canvaviagem_copywriter` | Escrever copy de post, email, anúncio |
| `canvaviagem_designer` | Criar briefing de arte para Canva |
| `canvaviagem_feed` | Montar post de feed do Instagram |
| `canvaviagem_stories` | Montar sequência de stories |
| `canvaviagem_seo` | Otimizar páginas e artigos para Google |
| `canvaviagem_blog` | Criar artigos de blog |
| `canvaviagem_revisor` | Revisar qualquer conteúdo antes de publicar |
| `canvaviagem_mercado` | Pesquisa de concorrentes e oportunidades |
| `canvaviagem_trafego` | Gestão de anúncios pagos (original) |

---

## SEQUÊNCIAS RECOMENDADAS

### Rotina Diária (5 minutos)
```
1. canvaviagem_orquestrador → briefing do dia
2. canvaviagem_aquisicao_conteudo → definir o post do dia
3. canvaviagem_copywriter → escrever a legenda
4. canvaviagem_revisor → revisar antes de publicar
```

### Segunda-feira (planejamento semanal)
```
1. canvaviagem_dados_stripe → números da semana anterior
2. canvaviagem_relatorio_visual → relatório semanal
3. canvaviagem_escala_diretor → análise de progresso
4. canvaviagem_aquisicao_conteudo → calendário da semana
5. canvaviagem_churn_diretor → verificar cancelamentos
```

### Reunião Mensal de Produto
```
1. canvaviagem_produto_youtube → tendências do mês
2. canvaviagem_produto_social → voz do mercado
3. canvaviagem_produto_feedback → feedback de assinantes
4. canvaviagem_produto_inovacao → sugestões de melhoria
5. canvaviagem_produto_diretor → relatório consolidado para o CEO
```

### Quando Assinaturas Pararem (emergência)
```
1. canvaviagem_dados_stripe → confirmar o problema
2. canvaviagem_aquisicao_diretor → diagnóstico de causa
3. canvaviagem_aquisicao_conteudo → post de venda hoje
4. canvaviagem_aquisicao_email → email de conversão para leads
5. canvaviagem_churn_winback → ativar win-back dos ex-assinantes
```

---

## O QUE AINDA FALTA CRIAR

### Prioridade Alta — CONCLUIDO
- `canvaviagem_comunidade` — gestao da comunidade de assinantes (WhatsApp/grupo) [CRIADO]
- `canvaviagem_hotmart` — gestao dos produtos Hotmart e upsell para assinatura [CRIADO]
- `canvaviagem_atendimento` — respostas a DMs, WhatsApp e emails de suporte [CRIADO]

### Prioridade Media — CONCLUIDO
- `canvaviagem_lancamento` — playbook completo para lancar novo produto [CRIADO]
- `canvaviagem_collab` — estrategia de colaboracoes e parcerias [CRIADO]

### Prioridade Media — PENDENTE
- `canvaviagem_youtube` — estrategia de canal YouTube (Shorts + videos longos)

### Prioridade Baixa (escala futura)
- `canvaviagem_afiliados` — programa de afiliados para escalar distribuicao
- `canvaviagem_mentoria` — skill para produto de mentoria premium
- `canvaviagem_white_label` — skill para vender para grandes agencias
