---
name: Canvaviagem Aquisição Email
description: Skill que ativa a lista de leads que ainda não assinaram — com sequências de nutrição, emails de oferta e campanhas de conversão para transformar contatos existentes em assinantes sem gastar em tráfego.
---

# Canvaviagem Aquisição Email

## O Ativo Ignorado

Há 69 clientes no Stripe e uma lista de leads no funil de email (user_email_automations). Parte dessas pessoas entrou em contato com o produto mas não assinou. Isso é um banco de leads quentes que custa R$0 para ativar.

**Regra:** antes de buscar leads novos, converter os que já existem.

## Tipos de Contatos na Lista

**Tipo 1 — Leads quentes (entraram no funil mas não assinaram)**
Receberam email 1, 2 ou 3 mas não converteram. Já conhecem o produto.

**Tipo 2 — Ex-assinantes (cancelaram)**
Já pagaram. Possuem dados de pagamento no Stripe. Alta intenção histórica.
→ Encaminhar para `canvaviagem_churn_winback`

**Tipo 3 — Clientes de outros produtos (Hotmart)**
Compraram 150 Vídeos ou outro produto one-time mas não assinaram.
Esse é o grupo com maior potencial de conversão para assinatura.

## Sequência de Nurture para Leads que Não Converteram

### Email A — Reativação de Lead Frio

**Para:** Quem recebeu a sequência automática mas não assinou
**Timing:** Enviar 15+ dias após último contato automático

```
Assunto: Você ainda pensa em ter conteúdo pronto para sua agência?

[Nome],

Há alguns dias você demonstrou interesse no Canva Viagem.

Não sei o que travou.
Talvez o preço. Talvez o momento não fosse ideal. Talvez ficou na dúvida.

Mas se a sua agência ainda não tem uma rotina de conteúdo no Instagram —
a situação provavelmente continua a mesma.

O Canva Viagem custa R$29/mês.
Cancela quando quiser.
Sem fidelidade, sem contrato.

Se quiser testar antes de decidir, me manda um email respondendo aqui.
Posso te mostrar o que tem dentro em 5 minutos.

Lucas | Canva Viagem
[ASSINAR POR R$29/MÊS →]
```

### Email B — Prova Social + Urgência

**Para:** Quem não respondeu o Email A após 5 dias

```
Assunto: 35 agências postando todo dia — e sua agência?

[Nome],

Atualmente 35 agências de viagem no Brasil usam o Canva Viagem
para postar todo dia no Instagram.

Elas param de travar. Começam a receber mensagens. Viram referência.

Você pode ser a 36ª.

Por R$29/mês — menos que um almoço de trabalho.

[ASSINAR AGORA →]

Qualquer dúvida, responde esse email.
Lucas
```

### Email C — Oferta Especial (Conversão Final)

**Para:** Quem não converteu após Email A e B

```
Assunto: Última chance: R$197 por 1 ano inteiro

[Nome],

Esta é a última mensagem que vou enviar sobre isso.

O plano anual do Canva Viagem é R$197.
São 12 meses de acesso por menos de R$17/mês.

Se você vai usar o produto de qualquer forma,
faz mais sentido travar o preço por 1 ano agora
do que pagar R$29 todo mês.

[ASSINAR PLANO ANUAL — R$197 →]

Se não quiser mais receber mensagens sobre o Canva Viagem,
é só responder "parar". Sem problema.

Lucas
```

## Campanha para Compradores de Produtos Hotmart (Não-Assinantes)

Esse é o segmento mais valioso. Alguém que comprou o pack de 150 Vídeos já validou que paga por conteúdo pronto. A pergunta é: por que não assinou?

**Email para compradores one-time:**

```
Assunto: Você já tem os 150 vídeos. Agora imagine ter conteúdo novo todo mês.

[Nome],

Você comprou o pack de 150 Vídeos. Isso significa que você
entende o valor de ter conteúdo pronto para usar.

O pack que você tem é estático — os mesmos 150 vídeos.

A assinatura do Canva Viagem é diferente: todo mês chegam
vídeos novos, artes novas, stories novos. Você nunca repete o mesmo conteúdo.

Por R$29/mês, é como renovar seu pack automaticamente todo mês.

[ASSINAR E TER CONTEÚDO NOVO TODO MÊS →]

Se quiser, posso te mostrar o que entrou de novo esse mês.
Responde esse email.

Lucas
```

## Emails de Campanha Sazonal

### Lançamento de Conteúdo Novo

Toda vez que entrar conteúdo novo na plataforma, enviar para toda a lista:

```
Assunto: [N] novos vídeos entraram agora — acesse

[Nome],

Acabou de entrar conteúdo novo no Canva Viagem:

• [N] vídeos de [destino 1]
• [N] stories de promoção de [época]
• [N] artes para feed de [tema]

Assinantes já têm acesso.

Se você ainda não é assinante, agora é a hora.
[ASSINAR →]

Lucas
```

### Datas Estratégicas do Calendário de Viagens

Criar emails de campanha 10 dias antes de cada data:

| Data | Tema do Email | Urgência |
|---|---|---|
| Carnaval | "Conteúdo pronto para os pacotes de Carnaval" | Alta |
| Semana Santa | "Vídeos de destinos religiosos e turísticos" | Alta |
| Junho/Festas | "Destinos nordestinos em alta" | Média |
| Julho (férias) | "A semana mais movimentada do ano — você está pronto?" | Alta |
| Outubro (férias) | "Pacotes de fim de ano — comece a postar agora" | Alta |
| Dezembro | "Réveillon, Natal, virada — conteúdo pronto" | Alta |

## Métricas de Email para Monitorar

| Métrica | Meta |
|---|---|
| Taxa de abertura | 35%+ |
| Taxa de clique | 5%+ |
| Taxa de conversão (clique→assinatura) | 2%+ |
| Taxa de descadastro | abaixo de 0,5% |

## Frequência de Envio

- **Leads não-assinantes:** 2 emails por semana máximo
- **Assinantes ativos:** 1 email por semana (engajamento — ver `canvaviagem_churn_engajamento`)
- **Ex-assinantes:** sequência win-back (ver `canvaviagem_churn_winback`)
- **Compradores Hotmart:** 1 email por semana com foco em upsell para assinatura
