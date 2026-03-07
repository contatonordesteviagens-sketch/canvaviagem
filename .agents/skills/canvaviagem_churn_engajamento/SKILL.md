---
name: Canvaviagem Anti-Churn Engajamento
description: Skill que monitora o engajamento dos assinantes ativos após a primeira semana — identifica quem está em risco de cancelar antes que cancele, e executa ações de reativação para manter o assinante usando o produto e vendo valor todo mês.
---

# Canvaviagem Anti-Churn Engajamento

## O Problema que Esta Skill Resolve

Um assinante que para de usar o produto por 2 semanas está a caminho do cancelamento. Não porque ficou insatisfeito — mas porque simplesmente esqueceu que assinou.

Com 35 assinantes ativos e 4 cancelamentos só em março, identificar os que estão "esfriando" antes que cancelem é a diferença entre um negócio que cresce e um que fica estagnado.

## Perfil de Risco: Quem Vai Cancelar

**Risco alto (provável cancelamento em 7-14 dias):**
- Não fez login na plataforma em mais de 14 dias
- Assinou há mais de 30 dias mas está no mês 2 ou 3
- Não abriu nenhum email nos últimos 15 dias
- Fez login mas não baixou nenhum conteúdo

**Risco médio (monitorar):**
- Fez login mas menos de 1 vez por semana
- Abriu emails mas não clicou em nenhum link
- Está no início do mês (perto da data de renovação)

**Saudável (manter engajado):**
- Faz login pelo menos 2x por semana
- Baixou pelo menos 4 conteúdos no mês
- Responde emails ou comenta nos posts

## Calendário Mensal de Engajamento

### Semana 1 — Conteúdo de Valor

**Ação:** Enviar email com os 5 conteúdos mais baixados do mês.

```
Assunto: Os 5 vídeos mais usados pelos agentes esse mês

[Nome],

Esses são os 5 conteúdos que os agentes mais estão baixando
e publicando essa semana:

1. [Destino 1] — Reel 30s (347 downloads)
2. [Destino 2] — Story promocional (289 downloads)
3. [Destino 3] — Carrossel de dicas (241 downloads)
4. [Destino 4] — Reel com oferta (198 downloads)
5. [Destino 5] — Story de urgência (176 downloads)

Esses formatos estão gerando pedidos de orçamento.
Clique e publique o que ainda não usou.

[VER CONTEÚDOS →]
```

### Semana 2 — Dica de Resultado

**Ação:** Compartilhar resultado real de um assinante.

```
Assunto: Essa agente recebeu 8 pedidos de orçamento em 1 semana

[Nome],

A [nome ou @] está usando o Canva Viagem há [X] meses.
Essa semana ela compartilhou comigo:

"[depoimento real]"

O que ela fez diferente: postou 5 vezes na semana usando
os vídeos do Canva Viagem + adicionou CTA em todos os posts.

Você está postando? Se quiser uma dica de legenda que
funciona, responde esse email.

Lucas
```

### Semana 3 — Destino em Alta

**Ação:** Enviar alerta de oportunidade de conteúdo.

```
Assunto: Destino em alta essa semana — conteúdo pronto para você

[Nome],

[DESTINO] está explodindo nas buscas essa semana.
Outros agentes estão recebendo pedidos de orçamento pra lá.

Você tem 3 vídeos prontos sobre [DESTINO] na plataforma.
Se publicar hoje, aproveita o momento enquanto o destino
está na cabeça dos clientes.

[VER VÍDEOS DE [DESTINO] →]
```

### Semana 4 — Antes da Renovação

**Ação:** Email enviado 5 dias antes da data de renovação.

```
Assunto: Sua renovação está chegando — aproveite essa semana

[Nome],

Sua assinatura renova em 5 dias.
Antes da renovação, quero te garantir que você está
aproveitando tudo que tem disponível.

Neste mês entraram [N] conteúdos novos:
• [N] vídeos novos de [destinos]
• [N] stories para promoção
• [N] artes para feed

Se tiver qualquer dúvida sobre o produto, responde esse email.
Se não estiver usando, me conta o que está travando.

Lucas
```

## Ações de Reativação por Risco

### Assinante em Risco Alto

**Sequência em 3 dias:**

**Dia 1 — Email:**
```
Assunto: Sumiu! Está tudo bem?

[Nome], vi que faz um tempo que você não acessa o Canva Viagem.

O que aconteceu? Está com dificuldade de usar?
Ficou sem tempo?

Me conta respondendo esse email — 1 minuto.
Quero garantir que você está aproveitando.

Lucas
```

**Dia 3 — WhatsApp (se tiver o número):**
```
Oi [Nome], aqui é o Lucas do Canva Viagem.
Vi que faz uns dias que você não entrou na plataforma.
Está tudo bem? Tem alguma dificuldade que posso te ajudar?
```

**Se não responder em 5 dias:** oferecer 1 mês extra gratuito em troca de feedback real.

### Assinante em Risco Médio

**Ação:** Personalizar o próximo email com base no destino mais relevante para a região do assinante (se souber) ou com base no histórico de downloads.

## Indicadores de Saúde por Assinante

Criar mentalmente (ou em planilha) um score por assinante:

| Ação | Pontos |
|---|---|
| Login nos últimos 7 dias | +3 |
| Download nos últimos 7 dias | +5 |
| Login nos últimos 14 dias | +1 |
| Nenhum login em 14 dias | -5 |
| Nenhum download no mês | -3 |
| Abriu email da semana | +1 |
| Respondeu algum email | +5 |
| Comentou no post do Lucas | +3 |

**Score acima de 5:** Saudável
**Score 0 a 5:** Monitorar
**Score abaixo de 0:** Risco — ativar reativação

## Meta de Engajamento

| Métrica | Atual (estimado) | Meta 30 dias | Meta 60 dias |
|---|---|---|---|
| Taxa de login semanal | desconhecida | 60% | 80% |
| Downloads por assinante/mês | desconhecido | 4+ | 8+ |
| Taxa de abertura de email | desconhecida | 40% | 55% |
| Assinantes que publicaram no mês | desconhecido | 70% | 90% |

## Conteúdo de Engajamento Recorrente

Além dos emails, o Lucas deve publicar semanalmente nos stories do @canvaviagem:

- "Qual destino você mais está vendendo agora?" (enquete)
- "Mostre o post que você publicou usando o Canva Viagem" (desafio)
- "Novo conteúdo chegou! Destino: [X]" (novidades)

Esses stories mantêm a marca na cabeça do assinante e criam senso de comunidade.
