---
name: Canvaviagem Comunidade
description: Skill que cria e gerencia a comunidade de assinantes do Canva Viagem — grupo de WhatsApp exclusivo, conteúdo de comunidade semanal e dinâmicas de engajamento que transformam assinantes isolados em membros de um grupo, reduzindo o churn e aumentando o LTV organicamente.
---

# Canvaviagem Comunidade

## Por Que Comunidade Reduz Churn

Assinante que usa o produto sozinho cancela quando esquece.
Assinante que faz parte de um grupo cancela muito menos — porque cancelar significa sair da comunidade, não só do produto.

Uma comunidade ativa transforma R$29/mês de produto em R$29/mês de pertencimento.

**Dados que justificam:**
Com churn atual de 38,1%, o LTV médio é R$74.
Comunidades bem geridas reduzem churn para 5-8%, elevando o LTV para R$360-580.
São os mesmos 35 assinantes valendo 5x mais — sem custo de aquisição.

## Estrutura da Comunidade

### Grupo de WhatsApp — "Canva Viagem | Agentes"

**Quem entra:** Todo assinante ativo (convidado via link no email de onboarding)
**Quem administra:** Lucas Henrique
**Tamanho ideal:** Até 150 membros no mesmo grupo; criar subgrupos após isso

**Regras do grupo:**
```
Bem-vindo ao grupo do Canva Viagem!

Aqui você:
✓ Recebe novidades antes de todo mundo
✓ Compartilha resultados dos posts
✓ Tira dúvidas de marketing para agência
✓ Acessa conteúdo exclusivo de membros

Não é permitido:
✗ Spam ou divulgação de outros produtos
✗ Links sem autorização
✗ Críticas públicas a concorrentes

O Lucas está aqui. Responde todas as dúvidas.
```

### Estrutura Semanal do Grupo

**Segunda — Abertura da semana:**
```
"Boa semana, pessoal! 🚀

Essa semana o foco é [destino/tema].
Já está disponível na plataforma: [novos conteúdos].

Quem vai postar sobre [tema] essa semana?
Marca aqui embaixo com um ✈️"
```

**Quarta — Dica da semana:**
```
"Dica rápida de quarta:

[Dica de marketing específica para agência de viagem — 3-5 linhas]

Alguém já testou isso? Como foi?"
```

**Sexta — Vitórias da semana:**
```
"Sexta das vitórias 🏆

Quem conseguiu resultado essa semana usando o Canva Viagem?
Pedido de orçamento, novo seguidor, post que viralizou — conta aqui!

Compartilha um print, uma história — o que for.
Os melhores vão aparecer nos stories do @canvaviagem."
```

**Domingo — Teaser da semana seguinte:**
```
"Semana que vem chegando conteúdo novo:
• [N] vídeos de [destino]
• [N] stories de [tema]
• Surpresa especial para quem é anual 👀

Prepara o Canva! 🎨"
```

## Dinâmicas de Engajamento

### Desafio Mensal — "30 Dias Postando"

No início de cada mês:
```
"Desafio do mês: 30 dias postando no Instagram.

Quem postar pelo menos 20 vezes em março usando o Canva Viagem
e mandar o print pra mim, ganha [benefício — mês extra, conteúdo exclusivo, etc.].

Quem topa? Manda 🔥 aqui embaixo."
```

### Destaque de Assinante

Uma vez por semana, o Lucas destaca um assinante no @canvaviagem:
```
Story: "Olha o perfil da [nome/@] — ela usou o Canva Viagem e olha o resultado!"
```

Isso gera:
- Prova social para aquisição
- Motivação para os outros assinantes usarem mais
- Senso de comunidade e reconhecimento

### Enquete Semanal (Stories do @canvaviagem direcionada para o grupo)

```
"Qual destino você mais quer conteúdo novo esse mês?"
A) Cancún
B) Europa
C) Nordeste
D) Maldivas

Manda sua resposta no grupo!
```

O vencedor da enquete vira prioridade de produção de conteúdo novo.

## Integração com Outros Departamentos

**→ Anti-Churn:**
O grupo detecta assinantes em risco antes que cancelem. Quem para de responder no grupo está esfriando. Sinalizar para `canvaviagem_churn_engajamento`.

**→ Produto:**
As dúvidas e pedidos do grupo são pesquisa de mercado gratuita. Alimentar `canvaviagem_produto_feedback` semanalmente com os temas mais discutidos.

**→ Aquisição:**
As vitórias compartilhadas no grupo são depoimentos espontâneos. Pedir autorização e usar no feed. Alimentar `canvaviagem_aquisicao_conteudo` com provas sociais reais.

**→ Onboarding:**
Quando novo assinante entra no grupo, os membros antigos o recebem organicamente.
Mensagem do Lucas ao novo membro:
```
"Bem-vindo(a) [nome]! 🎉
Sua agência acaba de entrar para o grupo de agentes que postam todo dia.
Qual destino você mais vende?"
```

## Fases de Crescimento da Comunidade

**Fase 1 (0-50 membros):** 1 grupo único, Lucas responde tudo pessoalmente
**Fase 2 (50-150 membros):** 1 grupo + conteúdo semanal estruturado + moderador voluntário
**Fase 3 (150+ membros):** Múltiplos grupos por região + moderadores + conteúdo exclusivo para anuais
**Fase 4 (300+ membros):** Comunidade em plataforma própria (Discord, Circle ou integrada ao app)

## Benefício Exclusivo Para Anuais

O grupo de WhatsApp é aberto para todos os assinantes.
Mas criar um subgrupo VIP apenas para anuais aumenta o valor percebido do plano anual:

```
"Assinantes do Plano Anual têm acesso ao grupo VIP:
• Conteúdo novo antes de todo mundo
• Acesso direto ao Lucas para tirar dúvidas
• Sessão de perguntas e respostas mensal por vídeo
• Votação nos próximos destinos a adicionar"
```

Esse benefício sozinho pode ser o motivo de migração do mensal para o anual.
Conectar com `canvaviagem_escala_anual`.

## KPIs da Comunidade

| Métrica | Meta |
|---|---|
| % de assinantes no grupo | 80%+ |
| Taxa de resposta nas enquetes | 30%+ |
| Vitórias compartilhadas/mês | 5+ |
| Assinantes que citam a comunidade como razão de ficar | rastrear nas pesquisas de churn |
