---
name: Canvaviagem Hotmart
description: Skill que gerencia os produtos vendidos na Hotmart — acompanha vendas, identifica compradores que não assinaram a plataforma e executa a ponte entre o comprador de produto avulso e o assinante recorrente, maximizando o LTV de cada cliente.
---

# Canvaviagem Hotmart

## O Ativo Separado do Stripe

O Canva Viagem tem dois mundos de receita:

**Mundo 1 — Stripe (assinatura mensal/anual):**
35 assinantes ativos, R$1.002 MRR, dados acessíveis.

**Mundo 2 — Hotmart (produtos one-time):**
Compradores do pack de 150 Vídeos (R$47), 1 Ano de Conteúdo (R$97), Pack Influencers (R$47), Agente Lucrativo (R$97) e outros.
Quantidade desconhecida, mas potencialmente muito maior que os assinantes do Stripe.

**O gap:** Compradores Hotmart pagaram uma vez e sumiram. A maioria nunca virou assinante da plataforma. Essa é a maior mina de ouro não explorada do negócio.

## Produtos Ativos na Hotmart

| Produto | Preço | Tipo | Funil |
|---|---|---|---|
| 150 Vídeos para Agência de Viagens | R$47 | Front-end | → upsell para assinatura |
| 1 Ano de Conteúdo para Agência | R$97 | Intermediário | → upsell para assinatura |
| Pack 200 Vídeos com Influencers IA | R$47 | Diferenciado | → upsell para assinatura |
| Agente Lucrativo | R$97 | Curso | → upsell para assinatura |
| Editor de Vídeo no Canva | R$97 | Curso | → upsell para assinatura |
| Seleção Inteligência Artificial | R$97 | Curso | → upsell para assinatura |

**Order Bumps:**
- Stories Criativos (R$27-47)
- Artes Prontas (R$27-47)
- Planilha de Orçamento (R$17-27)
- Agente de IA Vendedor (R$47)

## O Que Esta Skill Monitora

### 1. Métricas de Venda por Produto

Acessar o painel Hotmart → Relatórios → Vendas:
- Quantidade de vendas por produto (último 30 dias e histórico)
- Ticket médio (produto + bumps)
- Taxa de conversão dos bumps
- Taxa de reembolso por produto
- Origens de tráfego que mais convertem

### 2. Identificação de Compradores Não-Assinantes

O objetivo principal: cruzar a lista de compradores Hotmart com os assinantes do Stripe para identificar quem comprou produto avulso mas não assinou a plataforma.

**Como fazer:**
1. Exportar lista de compradores da Hotmart (CSV com email)
2. Comparar com a lista de clientes do Stripe (CSV com email)
3. A diferença = leads quentes para upsell de assinatura

Esses compradores já validaram que pagam por conteúdo pronto. São os leads mais quentes do negócio.

### 3. Performance dos Order Bumps

Para cada produto principal, analisar:
- Qual bump é mais comprado junto?
- Qual bump tem maior ticket adicional?
- Existe bump que pouquíssimas pessoas aceitam? (candidato a reformulação ou remoção)

## Estratégia de Upsell: Comprador Hotmart → Assinante Stripe

### Sequência de Email Pós-Compra (Hotmart → Assinatura)

**Email imediato (automação Hotmart):**
```
Assunto: Seu [produto] chegou — e tem uma oferta especial pra você

[Nome],

Obrigado pela compra do [produto]!

Você acabou de garantir [benefício do produto].

Antes de acessar: quero te contar sobre o Canva Viagem.

É a plataforma onde todo mês chegam vídeos, artes e stories novos —
para você nunca ficar sem conteúdo fresco.

Como você comprou o [produto], você já entende o valor de ter
conteúdo pronto. A assinatura é a versão que nunca acaba.

Por R$29/mês — menos do que você pagou hoje.

[CONHECER O CANVA VIAGEM →]

Lucas
```

**Email dia 7 (se não assinou):**
```
Assunto: Você está usando o [produto]?

[Nome],

Faz uma semana que você tem o [produto].
Já usou? Já publicou algum conteúdo?

Se sim — imagina ter conteúdo NOVO chegando todo mês.
Sem precisar comprar de novo. É exatamente isso que a assinatura faz.

Se não — me conta o que travou. Quero te ajudar.

[ASSINAR O CANVA VIAGEM — R$29/MÊS →]

Lucas
```

**Email dia 21 (última tentativa de upsell):**
```
Assunto: Oferta especial para quem comprou [produto]

[Nome],

Como você é cliente, tenho uma oferta exclusiva:

Assine o Canva Viagem por R$197/ano (12 meses).
Isso é R$16,40/mês — você economiza 43% em relação ao mensal.

Válido por 48 horas.

[ASSINAR PLANO ANUAL — R$197 →]

Lucas
```

## Otimização da Página de Vendas Hotmart

Para cada produto, verificar e otimizar:

**VSL (Vídeo de Vendas):**
- Hook nos primeiros 20 segundos (usar um dos 8 tipos da metodologia)
- Demonstração concreta do produto (não só falar — mostrar)
- Depoimentos reais (mínimo 3)
- Garantia de 7 dias visível e explícita
- CTA no final e no meio do vídeo

**Página:**
- Headline focada em resultado, não no produto
- Bullets com benefícios específicos (não genéricos)
- Seção de perguntas frequentes com objeções eliminadas
- Depoimentos com foto, nome e @instagram
- Botão de compra visível a cada 3 scrolls

## Calendário de Lançamento e Relançamento

**Relançamento trimestral:**
A cada 3 meses, fazer um mini-lançamento dos produtos Hotmart:
- 3 dias de conteúdo de aquecimento no Instagram
- 1 email de aquecimento para a lista
- 1 post de venda direta no dia do relançamento
- 1 email de oferta com prazo de 48 horas

**Sazonalidade:**
Criar versões sazonais de produtos ou packs temáticos para datas de alta demanda:
- Carnaval: pack de destinos de Carnaval
- Julho (férias): pack de destinos de inverno + praias
- Fim de ano: pack de Réveillon e Natal

## Integração com Outros Departamentos

**→ Aquisição:**
O comprador Hotmart é o lead mais quente para assinatura.
Alimentar `canvaviagem_aquisicao_email` com a lista de compradores não-assinantes.

**→ Produto:**
Avaliações e reembolsos na Hotmart alimentam `canvaviagem_produto_feedback`.

**→ Escala:**
O funil Hotmart → Assinatura é o caminho mais eficiente para aumentar MRR sem novo tráfego.
Cada comprador convertido = LTV de R$197+ vs. R$47 one-time.

## KPIs do Hotmart

| Métrica | Frequência de monitoramento |
|---|---|
| Vendas por produto (mês) | Semanal |
| Taxa de conversão de bump | Mensal |
| Taxa de reembolso | Mensal |
| Compradores convertidos para assinatura | Mensal |
| Receita Hotmart vs Stripe | Mensal |
