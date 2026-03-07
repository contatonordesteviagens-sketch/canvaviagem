---
name: Canvaviagem Aquisição Tráfego
description: Skill que planeja e executa a estratégia de tráfego pago — Google Ads e Meta Ads — para escalar novas assinaturas de forma previsível e lucrativa, com foco no CAC abaixo de R$58 (2 meses de assinatura).
---

# Canvaviagem Aquisição Tráfego

## Contexto

Tráfego pago está BLOQUEADO no momento (Meta Ads + Google Ads). Esta skill existe para:
1. Preparar tudo para quando o bloqueio for resolvido
2. Executar imediatamente após o desbloqueio
3. Garantir que o investimento em tráfego seja lucrativo desde o primeiro dia

**CAC aceitável:** Máximo R$58 (2 meses de assinatura mensal).
Com churn reduzido para 5%, LTV estimado: R$580. CAC de R$58 = ROAS de 10x.

## Prioridade de Canais

### 1. Google Ads (Prioridade Máxima)

**Por quê Google antes de Meta?**
Busca ativa tem intenção declarada. Quem digita "conteúdo pronto para agência de viagem" já quer comprar. É mais fácil e barato converter do que em redes sociais onde a pessoa está apenas navegando.

**Palavras-chave para Search:**

Grupo 1 — Intenção de compra direta:
```
"conteúdo pronto para agência de viagem"
"vídeos prontos agência de viagem"
"pack de vídeos agência de viagem"
"marketing para agência de viagem"
"conteúdo instagram agência de viagem"
```

Grupo 2 — Dor do avatar:
```
"o que postar agência de viagem"
"como criar conteúdo agência de viagem"
"instagram para agência de viagem"
"como ter mais clientes agência de viagem"
```

Grupo 3 — Concorrente / alternativa:
```
"canva agência de viagem"
"templates viagem instagram"
"vídeos turismo instagram"
```

**Estrutura de campanha sugerida:**
- Campanha 1: Intenção de compra → Landing page /planos
- Campanha 2: Dor do avatar → Landing page com conteúdo educativo + oferta
- Orçamento inicial: R$30-50/dia para teste (2 semanas de dados)
- Meta CPC: abaixo de R$3
- Meta CTR: acima de 5%
- Meta conversão: acima de 2%

**Headline de anúncio:**
```
"Vídeos Prontos Para Agência de Viagem | R$29/mês"
"Conteúdo Instagram para Agência de Viagem | Cancele Quando Quiser"
"Pare de Travar no Instagram | Conteúdo Pronto por R$29"
```

### 2. Meta Ads (Prioridade após Google)

**Audiência principal:**
- Brasil
- Interesse: agência de viagem, turismo, marketing digital, redes sociais
- Idade: 25-45 anos
- Excluir: quem já é assinante (custom audience via Stripe/Supabase)

**Tipos de campanha:**

**Campanha de Conversão — Assinatura direta:**
Criativo: Demonstração da plataforma (vídeo 30s mostrando os conteúdos prontos)
Objetivo: Conversão (assinar)
Orçamento: R$50/dia após aprovação da conta
Meta CPA: abaixo de R$58

**Campanha de Tráfego — Público frio:**
Criativo: Reel educativo (hook polêmico → dor → solução → CTA)
Objetivo: Tráfego para /planos
Orçamento: R$20/dia

**Campanha de Retargeting — Visitou /planos mas não assinou:**
Criativo: Depoimento de assinante + urgência
Objetivo: Conversão
Audiência: Visitantes de /planos últimos 30 dias
Orçamento: R$15/dia

**Criativos validados para testar primeiro:**
1. Demo da plataforma (mostra o conteúdo por dentro) — tipo 8 hook
2. Depoimento de assinante — tipo 6 hook
3. Hook polêmico + oferta — tipo 1 hook
4. Antes e depois (Instagram parado vs. ativo) — tipo 6 hook

### 3. TikTok Ads (Prioridade 3)

Testar com orçamento menor. O CPC no TikTok ainda é mais barato que Meta.

**Formato:** TopView ou In-Feed ads de 15-30s
**Criativo:** Mesmo vídeo de demonstração da plataforma
**Audiência:** Semelhante ao Meta (interesses em turismo, negócios, redes sociais)

## Plano de Desbloqueio do Meta Ads

**Situação atual:** Conta bloqueada.

**Protocolo de desbloqueio:**

Opção A — Reativação da conta atual:
1. Entrar em contato com suporte Meta Business: business.facebook.com/support
2. Solicitar revisão manual da conta com justificativa do produto
3. Aguardar 7-14 dias úteis
4. Se negado: passar para Opção B

Opção B — Nova conta (CNPJ diferente):
1. Criar nova conta Business Manager no CNPJ da empresa
2. Usar cartão de crédito empresarial DIFERENTE do anterior
3. Não usar o mesmo endereço de IP do início — usar VPN ou celular com dados
4. Aquecer conta: criar anúncio simples (R$5/dia) por 14 dias antes de escalar
5. Nunca vincular à conta bloqueada anterior

**Regras críticas para nova conta:**
- Nunca reutilizar cartão ou conta bancária da conta bloqueada
- Não usar o mesmo pixel do site (criar novo)
- Não vincular ao mesmo Business Manager anterior
- Aguardar 30 dias com anúncios simples antes de anunciar produto digital

## Métricas e KPIs de Tráfego Pago

| Métrica | Meta |
|---|---|
| CAC (custo por assinante) | abaixo de R$58 |
| CPC (custo por clique) | abaixo de R$2 |
| CTR (taxa de clique) | acima de 3% |
| Taxa de conversão landing | acima de 3% |
| ROAS | acima de 3x no primeiro mês |
| Orçamento mensal inicial | R$1.500-2.000 |
| Meta assinaturas/mês via pago | 30-50 |

## Orçamento Sugerido para Escala

Com MRR atual de R$1.002 e churn em queda:

**Fase 1 (quando churn < 15%):** Investir 30% do MRR = R$300/mês em tráfego
**Fase 2 (quando assinantes > 100):** Investir R$2.000/mês
**Fase 3 (quando MRR > R$5.000):** Investir R$5.000/mês — ROI positivo garantido

## Rastreamento de Conversão

Para que o tráfego pago funcione, os pixels precisam estar corretos:

**Google Ads:**
- Tag de conversão configurada no evento de assinatura confirmada
- Verificar se está disparando após retorno do Stripe checkout

**Meta Ads:**
- Pixel instalado (meta-pixel.ts já existe no projeto)
- Evento `Subscribe` configurado para disparar após assinatura
- API de Conversões (CAPI) configurada — o projeto já tem `meta-conversions-api` Edge Function

**Verificar:** A Edge Function `meta-conversions-api` está ativa e disparando no webhook do Stripe após pagamento confirmado.
