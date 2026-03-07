---
name: Canvaviagem Aquisição Diretor
description: Skill que comanda o Departamento de Aquisição — garante que novas assinaturas entrem todo dia, coordenando conteúdo orgânico, email marketing e tráfego pago para escalar de 35 para 150+ assinantes ativos.
---

# Canvaviagem Aquisição Diretor

## Contexto de Urgência (Dados Reais — 07/03/2026)

Nos últimos 5 dias (03/03 a 07/03), **zero novas assinaturas**. O fluxo de entrada parou completamente. Com churn ativo (4 cancelamentos em março), o negócio está perdendo assinantes líquidos.

**Estado atual:**
- Assinantes ativos: 35
- Novas na semana: 3 (concentradas nos dias 01-02/03)
- Dias sem nova assinatura: 5 consecutivos
- MRR: R$1.002 / Meta: R$30.000 (3,3%)
- Tráfego pago: BLOQUEADO (Meta Ads + Google Ads)

**Meta deste departamento:**
Garantir pelo menos **1 nova assinatura por dia** nas próximas 4 semanas.
1 assinante/dia × 30 dias = 30 novas assinaturas = ~R$870 de MRR adicional.

## Diagnóstico: Por Que as Assinaturas Pararam

Antes de agir, identificar a causa do bloqueio de 5 dias:

**Hipótese 1 — Conteúdo parou de ser publicado**
Se o @canvaviagem ficou 2+ dias sem postar, o alcance cai e o tráfego para.
Verificar: última data de publicação no Instagram.

**Hipótese 2 — Conteúdo publicado não teve CTA para assinatura**
Posts de valor puro educam mas não convertem. Sem CTA claro para /planos, ninguém assina.
Verificar: últimos 5 posts — algum tinha link para assinar?

**Hipótese 3 — Queda de alcance do Instagram**
Algoritmo penaliza contas que param de postar. Alcance demora 3-5 dias para se recuperar.
Verificar: métricas de alcance no Instagram Creator Studio.

**Hipótese 4 — Sazonalidade ou evento externo**
Feriado, evento nacional, período de menor interesse em viagens.
Verificar: contexto do calendário brasileiro.

## Fluxo de Trabalho do Diretor

Quando acionado:

**1. Diagnostica o bloqueio**
Identifica por que as assinaturas pararam. Usa as 4 hipóteses acima.

**2. Define prioridade semanal**
Com base na situação atual, distribui esforço entre:
- Orgânico (sempre — custo zero)
- Email (assinantes e leads existentes — custo zero)
- Tráfego pago (quando desbloqueado — investimento necessário)

**3. Aciona especialistas**
- Para conteúdo orgânico: `canvaviagem_aquisicao_conteudo`
- Para sequências de email: `canvaviagem_aquisicao_email`
- Para tráfego pago: `canvaviagem_aquisicao_trafego`

**4. Gera Relatório Semanal de Aquisição**

```
RELATÓRIO DE AQUISIÇÃO — SEMANA [N]
=====================================
Meta da semana:          7 novas assinaturas
Novas assinaturas:       [N]
Atingiu meta?            [sim/não]

Por canal:
  Orgânico (Instagram):  [N]
  Email/DM:              [N]
  Tráfego pago:          [N]
  Direto (sem origem):   [N]

Melhor dia:              [dia] — [N] assinaturas
Pior dia:                [dia] — 0 assinaturas
Correlação identificada: [post publicado / tipo de conteúdo]

Próxima semana:
  Conteúdos planejados:  [lista]
  Ação prioritária:      [ação]
=====================================
```

## Meta de Aquisição Mensal Progressiva

| Mês | Meta novas/mês | Meta assinantes ativos | Meta MRR |
|---|---|---|---|
| Março/26 | 30 | 50 | R$1.450 |
| Abril/26 | 50 | 85 | R$2.465 |
| Maio/26 | 80 | 140 | R$4.060 |
| Junho/26 | 120 | 220 | R$6.380 |
| Setembro/26 | 350 | 600 | R$17.400 |
| Março/27 | 700 | 1.200 | R$34.800 |

*Considerando churn reduzido para 5% após implementação do Dept Anti-Churn*

## Regra de Ouro de Aquisição

**Nenhum dia sem CTA.**

Todo post, story, vídeo e email do @canvaviagem e do Lucas pessoal deve terminar com uma forma clara de ir para a página de assinatura. Sem exceção.

Formatos de CTA por canal:
- Instagram post: "Link na bio pra assinar" ou "Comenta QUERO"
- Instagram story: Sticker de link direto para /planos
- YouTube: Descrição com link + CTA falado no vídeo
- Email: Botão no final + texto de oferta
- WhatsApp (lucas pessoal): Link com mensagem de recomendação

## Prioridade de Canais (Sem Tráfego Pago)

1. **Instagram @canvaviagem** — 2 posts/dia (Reels + Stories)
2. **Instagram pessoal Lucas** — 1 post/dia com collab
3. **YouTube Shorts** — 3 shorts/semana (conteúdo de viagem + menção do produto)
4. **TikTok** — 1 vídeo/dia (mesmo conteúdo do Reel)
5. **Email para leads** — 2 emails/semana para quem está no funil mas não assinou

## Protocolo de Emergência — 3 Dias Sem Assinatura

Se passar 3 dias consecutivos sem nova assinatura:

1. Lucas publica Story pessoal mostrando os bastidores do produto
2. Story com depoimento de assinante + link para assinar
3. Email para toda a lista de leads com oferta de "assine hoje com R$X desconto"
4. DM para últimos 20 seguidores que interagiram mas não assinaram
5. Post de venda direta no feed (com preço, o que inclui, CTA urgente)
