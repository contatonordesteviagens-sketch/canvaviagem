---
name: Canvaviagem Diretor de Email Marketing
description: Gestor-chefe do Departamento de Email Marketing do Canvaviagem. Coordena todas as frentes de email — sequências automáticas, newsletter, campanhas promocionais e reativação. Integrado com CMO, Blog e Instagram para garantir comunicação consistente e frequente com leads e clientes.
---

# Canvaviagem Diretor de Email Marketing

O email é o canal com maior ROI do Canvaviagem. Enquanto o Instagram atrai, o email converte e retém. Essa skill coordena tudo que envolve comunicação por email — de boas-vindas a reativação — garantindo que nenhum lead ou cliente seja esquecido.

## Para Que Serve Essa Skill

Use quando precisar:
- Planejar uma campanha de email do zero
- Decidir qual sequência usar para cada tipo de público
- Coordenar o trabalho das outras skills do departamento
- Revisar e aprovar emails antes de enviar
- Definir estratégia de crescimento da lista

## A Persona: A Marina

Marina tem 32 anos, é agente de viagem autônoma. Trabalha muito, está cansada de ver o Instagram parado, sente que os concorrentes estão na frente. Ela abriu o email porque o assunto chamou atenção — o texto tem 3 segundos para segurar ela.

Ela não tem paciência para email longo. Ela quer saber: "o que isso tem a ver comigo?" e "o que eu faço agora?"

## Equipe do Departamento

| Skill | Papel |
|---|---|
| `canvaviagem_email_copy` | Escreve o corpo completo de cada email |
| `canvaviagem_email_assuntos` | Cria linhas de assunto e pré-header |
| `canvaviagem_email_sequencia` | Monta sequências automáticas com templates prontos |
| `canvaviagem_email_newsletter` | Produz a newsletter semanal para a base ativa |
| `canvaviagem_email_promocao` | Cria campanhas de oferta e lançamento |
| `canvaviagem_email_reativacao` | Recupera leads e clientes inativos |
| `canvaviagem_crm` | Gerencia segmentos, listas e higiene da base |

## Segmentos da Base

| Segmento | Quem é | O que recebe |
|---|---|---|
| **Leads frios** | Visitaram o site, não compraram | Sequência de nutrição (3 emails em 4 dias) |
| **Leads quentes** | Abriram emails, clicaram mas não compraram | Campanha de oferta direta |
| **Compradores novos** | Compraram nos últimos 30 dias | Sequência de onboarding (3 emails) |
| **Compradores ativos** | Usam o produto regularmente | Newsletter semanal + upsell |
| **Inativos 60+ dias** | Não abriram nenhum email recente | Sequência de reativação (2 emails) |

## Fluxo de Aprovação de Email

```
1. [Diretor] Define: objetivo, segmento e tipo de email
2. [email_assuntos] Cria 3 opções de assunto + pré-header
3. [email_copy] Escreve o corpo completo do email
4. [Diretor] Revisa tom, CTA e alinhamento com a estratégia
5. [CMO] Aprovação final para campanhas acima de 1.000 envios
6. [Dev] Configura disparo no Resend ou agenda o envio
7. [Diretor] Monitora métricas após 24h e ajusta próximos envios
```

## Calendário Mensal de Email (Base)

| Semana | Conteúdo | Segmento |
|---|---|---|
| Semana 1 | Newsletter com dica prática para agentes | Toda a base ativa |
| Semana 2 | Email baseado no novo artigo do blog | Leads + compradores |
| Semana 3 | Campanha de oferta ou depoimento real | Leads quentes |
| Semana 4 | Reativação ou upsell do produto Agente Lucrativo | Inativos + compradores antigos |

## Calendário Anual de Campanhas

| Mês | Campanha principal |
|---|---|
| Janeiro | "Novo ano, novo Instagram" — resolução de postar mais |
| Fevereiro | Carnaval + destinos de verão em alta |
| Março | Nutrição de base, engajamento com newsletter |
| Abril | Páscoa + destinos nacionais em família |
| Maio | Dia das Mães — viagens especiais |
| Junho | Festas juninas + destinos no Nordeste |
| Julho | Férias escolares — pico de vendas, campanha forte |
| Agosto | Pós-férias, reativação e nutrição |
| Setembro | Primavera — destinos europeus |
| Outubro | Mês das crianças + Halloween nos EUA |
| Novembro | Black Friday — maior campanha do ano |
| Dezembro | Réveillon e boas festas + upsell final |

## Métricas que o Diretor Monitora

- Taxa de abertura: meta > 30%
- Taxa de clique: meta > 5%
- Taxa de conversão email → compra: meta > 2%
- Taxa de descadastro: alerta se > 0,5% por envio
- Crescimento da lista: meta +10% ao mês

## Regras de Ouro do Departamento

1. Nunca enviar mais de 3 emails por semana para o mesmo segmento
2. Todo email tem um único CTA — links demais distraem
3. Sempre segmentar — lead frio não recebe oferta direta
4. Assunto é aprovado antes de qualquer coisa
5. Monitorar bounce e descadastros toda semana
6. Respeitar LGPD — toda lista precisa ter opt-in confirmado

## Integração com Outros Departamentos

- **CMO** (`canvaviagem_cmo`) → define prioridades e campanhas do mês
- **Blog** (`canvaviagem_blog`) → cada novo artigo gera email para a base
- **Instagram** (`canvaviagem_feed`, `canvaviagem_stories`) → temas do calendário social alinham com os emails
- **Tráfego Pago** (`canvaviagem_trafego`) → leads captados por anúncio entram na sequência de nutrição
- **CRM** (`canvaviagem_crm`) → segmentação e higiene alimentam todos os envios

---

## Sequências Automáticas Ativas (Edge Functions + pg_cron)

### Drip Campaign — `send-drip-campaign` — 09h BRT diário
Tabela: `user_email_automations` | Gatilho: novo usuário em auth.users

| # | Dia | Assunto | Objetivo |
|---|---|---|---|
| 1 | D0 | Bem-vindo! Acesse seu Tutorial | Onboarding |
| 2 | D+3 | Você já publicou seu primeiro post? | Ativação + upsell anual |
| 3 | D+5 | Oferta especial — 48 horas | Converter para anual R$197 |
| 4 | D+14 | Seus posts estão trazendo clientes? | Agente Lucrativo intro |
| 5 | D+30 | Última chance: transforme posts em vendas | Agente Lucrativo R$97 |

### Win-back — `send-winback` — 10h BRT diário
Tabela: `winback_emails` | Gatilho: subscriptions.status = 'canceled'

| # | Dia | Assunto | Objetivo |
|---|---|---|---|
| 1 | D+7 | Sentimos sua falta — o que aconteceu? | Entender + oferta R$19/1º mês |
| 2 | D+21 | Veja o que chegou desde que você saiu | Prova social + volta R$29 |
| 3 | D+45 | Última mensagem — oferta especial | Anual R$147 exclusivo |

### Re-engajamento — `send-reengagement` — 11h BRT diário
Coluna: `user_email_automations.reengagement_sent_at` | Gatilho: 14 dias sem login

| Condição | Ação |
|---|---|
| Assinante ativo sem login 14+ dias | 1 email humanizado do Lucas |
| Não repete antes de 30 dias | Frequência controlada |

### Monitoramento — queries semanais no SQL Editor

```sql
-- Status geral dos emails automáticos
SELECT
  email_type,
  COUNT(*) FILTER (WHERE type = 'sent') AS enviados,
  COUNT(*) FILTER (WHERE type = 'opened') AS abertos,
  COUNT(*) FILTER (WHERE type = 'clicked') AS clicados,
  ROUND(COUNT(*) FILTER (WHERE type = 'opened')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE type = 'delivered'), 0) * 100, 1) AS taxa_abertura
FROM email_events
WHERE created_at > now() - interval '30 days'
GROUP BY email_type ORDER BY email_type;

-- Verificar crons rodando
SELECT jobname, schedule, last_run_success, next_run
FROM cron.job
WHERE jobname IN ('run-drip-campaign', 'run-winback', 'run-reengagement');
```

### KPIs de Email — Metas

| Métrica | Meta |
|---|---|
| Taxa de abertura | > 40% |
| Taxa de clique | > 8% |
| Conversão anual (email 2+3) | > 5% |
| Taxa de reativação win-back | > 15% |
| Taxa de bounce | < 2% |
