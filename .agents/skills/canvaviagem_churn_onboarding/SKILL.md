---
name: Canvaviagem Anti-Churn Onboarding
description: Skill que cria e executa o fluxo de boas-vindas dos primeiros 7 dias — garantindo que todo novo assinante entenda o produto, publique o primeiro conteúdo e sinta valor antes de completar a primeira semana.
---

# Canvaviagem Anti-Churn Onboarding

## Por Que Onboarding É a Causa #1 de Churn

Quem cancela nos primeiros 14 dias nunca teve a chance de ver valor. Pagou, entrou, ficou confuso, foi embora. Não é problema do produto — é problema de apresentação.

Com 35 assinantes ativos e 16 cancelamentos históricos, a chance de muitos terem cancelado na primeira semana é alta. Esta skill resolve isso.

## Objetivo

Fazer com que todo novo assinante:
- **Dia 1:** Acesse a plataforma e entenda o que tem disponível
- **Dia 3:** Baixe e publique o primeiro conteúdo
- **Dia 7:** Tenha postado pelo menos 3 conteúdos e sinta que o produto vale o investimento

**Meta:** Zero cancelamentos na primeira semana.

## Sequência de Onboarding — 7 Dias

### Mensagem 1 — Imediata (logo após a assinatura)

**Canal:** Email automático (já configurado no projeto via Supabase/Resend)
**Timing:** Imediatamente após confirmação de pagamento Stripe

```
Assunto: Seus vídeos estão aqui — veja como usar em 3 minutos

[Nome],

Seu acesso ao Canva Viagem está ativo.

Dentro da plataforma você tem:
• Centenas de vídeos prontos para Reels e Stories
• Artes para feed
• Conteúdo novo chegando todo mês

Para começar AGORA:
1. Acesse canvaviagem.com e faça login
2. Escolha um vídeo do destino que você mais vende
3. Baixe, coloque o logo da sua agência no Canva e publique

Primeiro post em menos de 10 minutos.

[ACESSAR MINHA CONTA →]

Lucas Henrique | Canva Viagem
```

### Mensagem 2 — Dia 3

**Assunto:** Você já publicou seu primeiro vídeo?

```
[Nome],

Você se lembra por que assinou o Canva Viagem?

Provavelmente porque precisava de conteúdo para postar sem
precisar criar do zero.

Se ainda não publicou nada, aqui vai o destino mais baixado
essa semana: [destino em alta].

Clique, baixe, publique. Isso é tudo.

[VER VÍDEOS DE [DESTINO] →]

Se tiver alguma dificuldade, responde esse email.
Eu leio todos.

Lucas
```

### Mensagem 3 — Dia 7

**Assunto:** 1 semana de Canva Viagem — você está aproveitando?

```
[Nome],

Faz uma semana que você tem acesso ao Canva Viagem.

Quero saber: você já usou?

Se sim — ótimo! Qual foi o primeiro vídeo que você publicou?
Me conta, quero divulgar sua experiência.

Se não — me diz o que está travando.
Responde esse email com o maior problema que você está tendo.
Prometo ler e responder.

O Canva Viagem só funciona se você usar.
E eu quero te ajudar a usar.

Lucas
```

## Quick Win — A Primeira Publicação em 10 Minutos

Criar um roteiro interno (para o Lucas enviar por WhatsApp se necessário) que guia o assinante no primeiro post:

```
ROTEIRO PRIMEIRO POST — 10 MINUTOS

1. Acesse canvaviagem.com (já logado)
2. Na aba "Vídeos", filtre por [destino mais vendido pela sua agência]
3. Clique no vídeo que mais gostou → Baixar
4. Abra o Canva → Novo design → Reel (9:16)
5. Importe o vídeo baixado
6. Adicione o logo da sua agência no canto
7. Exporte e publique no Instagram

Legenda sugerida:
"Viagem dos sonhos para [DESTINO] 🌎
Pacotes saindo de [CIDADE] a partir de [PREÇO]
Quer saber mais? Me chama no WhatsApp 👇"

CTA: Link na bio ou número de WhatsApp
```

## Checklist de Onboarding por Assinante

Para cada novo assinante, o Lucas (ou automatização) deve garantir:

```
[ ] Email 1 enviado imediatamente após pagamento
[ ] Email 2 enviado no dia 3
[ ] Email 3 enviado no dia 7
[ ] Assinante publicou pelo menos 1 conteúdo
[ ] Assinante respondeu algum email (sinal de engajamento)
[ ] Assinante não tem nenhum erro de acesso à plataforma
```

## Alerta de Risco

Se o assinante chegar no **dia 7 sem ter publicado nada**:

1. Enviar mensagem direta no WhatsApp (se tiver o número)
2. Oferecer uma sessão rápida de 15 minutos por videoconferência para mostrar como usar
3. Se não responder, é candidato a churn — sinalizar para o `canvaviagem_churn_engajamento`

## Melhoria Futura — Onboarding In-App

Sugestão para implementar no Lovable: quando o usuário faz login pela primeira vez, mostrar um modal de boas-vindas com:
- Vídeo tutorial de 2 minutos mostrando a plataforma
- Checklist de primeiros passos visível na tela
- Banner fixo "Você ainda não publicou seu primeiro conteúdo" enquanto não tiver usado

## Resultado Esperado

Com onboarding bem executado:
- Cancelamentos na semana 1 → próximos de zero
- Taxa de ativação (quem usa pelo menos 1x na primeira semana): de desconhecido → 80%+
- Feedback real de quem não está usando: em 7 dias, não em 30
