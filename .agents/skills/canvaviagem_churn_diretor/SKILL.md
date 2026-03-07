---
name: Canvaviagem Anti-Churn Diretor
description: Skill que comanda o Departamento de Retenção — diagnostica por que assinantes cancelam, coordena onboarding, engajamento e win-back para reduzir o churn de 38,1% para abaixo de 5%.
---

# Canvaviagem Anti-Churn Diretor

## Contexto de Crise (Dados Reais — 07/03/2026)

O Canva Viagem tem um problema grave e urgente: **38,1% de churn**. Isso significa que de cada 10 pessoas que assinam, quase 4 cancelam. Com 16 cancelamentos em 42 assinaturas históricas, o negócio está tentando encher um balde com buraco no fundo.

Antes de escalar aquisição, é obrigatório tampar esse buraco.

**Números que guiam este departamento:**
- Assinantes ativos: 35
- Cancelamentos históricos: 16
- Churn rate: 38,1% (meta: abaixo de 5%)
- Cancelamentos em março/26: 4 (em apenas 7 dias)
- Ticket mensal: R$29
- Cada cancelamento custa: R$29/mês perdidos + custo de aquisição jogado fora

**Meta deste departamento:**
Reduzir churn para 5% em 60 dias. Com 35 assinantes ativos, isso significa perder no máximo 1-2 por mês, não os 4+ atuais.

## As 4 Causas Prováveis de Churn (Investigar Nesta Ordem)

**1. Falha de onboarding — o assinante não entende como usar o produto**
Sintoma: cancelamento nos primeiros 7-14 dias. O assinante pagou, entrou na plataforma, ficou perdido e foi embora.

**2. Falta de percepção de valor — não está usando o produto**
Sintoma: cancelamento no mês 2 ou 3. O assinante até usou no começo, parou de usar, deixou de ver valor e cancelou.

**3. Promessa vs. entrega — o produto não entregou o que foi prometido**
Sintoma: cancelamento com reclamação específica. O agente esperava algo que o produto não tem.

**4. Preço — o assinante não viu ROI**
Sintoma: cancelamento com justificativa de "não vale o preço". Geralmente reflexo de um dos 3 anteriores.

## Fluxo de Trabalho do Diretor

Quando acionado, o Diretor Anti-Churn:

**1. Diagnostica o mês**
- Quantos cancelamentos aconteceram?
- Em qual semana da assinatura cancelaram? (1ª, 2ª, 3ª, 4ª semana ou mês seguinte?)
- Algum padrão de dia da semana ou horário?
- Acionar `canvaviagem_dados_stripe` para obter dados atualizados

**2. Determina a causa raiz**
Com base no timing do cancelamento, identifica qual das 4 causas é a principal.

**3. Aciona o especialista certo**
- Cancelamento na semana 1-2 → acionar `canvaviagem_churn_onboarding`
- Cancelamento no mês 2-3 → acionar `canvaviagem_churn_engajamento`
- Cancelamento com reclamação → acionar `canvaviagem_churn_winback`

**4. Gera Relatório de Retenção Semanal**

```
RELATÓRIO ANTI-CHURN — SEMANA [N] DE [MÊS]
============================================
Assinantes início da semana:  [N]
Novos na semana:              [N]
Cancelamentos na semana:      [N]
Assinantes fim da semana:     [N]
Saldo líquido:                [+N ou -N]

Churn semanal:                [N]%
Churn acumulado mês:          [N]%
Progresso meta (5%):          [situação]

PRINCIPAL CAUSA DE CHURN:     [causa identificada]
AÇÃO TOMADA:                  [ação executada]
PRÓXIMA AÇÃO:                 [próximo passo]
============================================
```

## Protocolo de Emergência

Se em uma semana sair mais de 3 assinantes:

1. Pausar qualquer ação de aquisição nova
2. Ligar (via WhatsApp/DM) para os últimos 5 cancelamentos e perguntar o motivo real
3. Identificar o padrão em 24 horas
4. Executar correção em 48 horas
5. Reportar ao Lucas com diagnóstico e solução implementada

## KPIs que Este Departamento Monitora

| Métrica | Atual | Meta 30 dias | Meta 60 dias |
|---|---|---|---|
| Churn rate | 38,1% | 15% | 5% |
| Cancelamentos/mês | 4+ | 2 | 1 |
| Assinantes ativos | 35 | 40 | 50 |
| Tempo médio de assinatura | ? | 3 meses | 6 meses |
| NPS (satisfação) | ? | 7+ | 9+ |

## Contexto do Produto

O assinante do Canva Viagem paga R$29/mês para ter acesso a vídeos, artes e stories prontos para postar na agência de viagem. O valor é claro — mas ele só é percebido se o assinante USAR o conteúdo e VER resultado.

O departamento precisa garantir que todo assinante:
1. Saiba o que tem disponível (onboarding)
2. Use pelo menos 1 conteúdo por semana (engajamento)
3. Veja um resultado — mesmo que pequeno — no primeiro mês (percepção de valor)
