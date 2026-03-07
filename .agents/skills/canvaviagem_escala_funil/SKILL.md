---
name: Canvaviagem Escala Funil
description: Skill que otimiza cada etapa do funil de conversão — da visita à página de preços até o checkout concluído — para maximizar a taxa de conversão de visitantes em assinantes sem aumentar o investimento em tráfego.
---

# Canvaviagem Escala Funil

## O Funil Atual

```
Visitante do site
       ↓
  /planos (página de preços)
       ↓
  Clica em "Assinar"
       ↓
  Stripe Checkout (buy.stripe.com)
       ↓
  Assinante ativo
```

O problema não é só trazer mais pessoas — é converter melhor as que já chegam.
Se a página /planos converte 2% e passar para 4%, dobra o número de assinantes sem aumentar 1 real de gasto.

## Diagnóstico do Funil Atual

**Dados necessários (buscar via `canvaviagem_dados_analytics`):**
- Visitantes em /planos (últimos 30 dias)
- Cliques no botão de assinar
- Assinaturas concluídas
- Taxa de abandono no checkout do Stripe

**Pontos de vazamento mais comuns:**

**Vazamento 1 — Visitante sai de /planos sem clicar**
Causa: Página não convence. Copy fraco, falta de prova social, oferta confusa.
Solução: Otimizar copy, adicionar depoimentos, clarificar o que está incluído.

**Vazamento 2 — Clicou mas não completou o Stripe checkout**
Causa: Formulário de pagamento gera desconfiança, preço parece alto no momento final.
Solução: Adicionar garantia visível, selos de segurança, simplificar o checkout.

**Vazamento 3 — Completou mas não ativou a conta**
Causa: Email de boas-vindas fraco, não sabe o que fazer depois de pagar.
Solução: Onboarding imediato (ver `canvaviagem_churn_onboarding`).

## Otimizações Prioritárias da Página /planos

### 1. Headline Principal

**Atual (verificar no código):**
Avaliar se o headline comunica o resultado (o que o assinante vai conseguir) ou apenas o produto (o que está sendo vendido).

**Padrão de headline que converte:**
> "Conteúdo Pronto Para Postar Todo Dia na Sua Agência de Viagem"
> (resultado) sem (obstáculo) por (preço)

Exemplo:
> "Poste Todo Dia no Instagram da Sua Agência — Sem Criar, Sem Editar, Sem Gravar"

### 2. Prova Social Visível Acima da Dobra

Antes de rolar a página, o visitante precisa ver:
- Quantas agências já usam: "35 agências ativas"
- Depoimentos com foto e nome real (mínimo 3)
- Estrelas de avaliação se tiver

### 3. Comparação de Planos Clara

O visitante não pode ficar confuso sobre qual plano escolher.

Estrutura recomendada:
```
[MENSAL]              [ANUAL — MAIS POPULAR]
R$29/mês              R$197/ano
                      (= R$16,40/mês — economiza R$151)

• Acesso imediato     • Acesso imediato
• Cancela quando      • 12 meses garantidos
  quiser              • Melhor custo-benefício
                      • [BÔNUS: algo exclusivo do anual]

[ASSINAR MENSAL]      [ASSINAR ANUAL]
```

O plano anual deve parecer a escolha óbvia — não apenas uma alternativa.

### 4. Eliminação de Objeções na Página

**Objeção 1: "E se eu não gostar?"**
→ Garantia de 7 dias explícita e visível. Não escondida no rodapé.

**Objeção 2: "É difícil de usar?"**
→ Frase: "Você baixa o vídeo, coloca seu logo no Canva e publica. Em 10 minutos."

**Objeção 3: "Os vídeos são genéricos?"**
→ Mostrar screenshots ou prévia dos conteúdos dentro da plataforma.

**Objeção 4: "Vou ter que contratar alguém para usar?"**
→ Frase: "Não precisa saber nada de design. Se você consegue usar o WhatsApp, consegue usar o Canva Viagem."

### 5. CTA (Call to Action) Forte

O botão de assinar deve:
- Estar visível sem precisar rolar (acima da dobra)
- Aparecer pelo menos 3 vezes na página (topo, meio, rodapé)
- Ser específico: não "Assinar" — mas "Começar Agora por R$29/mês"
- Ter urgência quando possível: "Vagas com este preço" ou "Oferta válida até [data]"

## Testes A/B a Implementar

Priorizar pela facilidade de implementação:

| Teste | Variante A (atual) | Variante B (testar) | Métrica |
|---|---|---|---|
| Headline | [atual] | Headline focado em resultado | CTR para checkout |
| CTA Button | "Assinar" | "Começar Agora por R$29" | CTR |
| Garantia | No rodapé | Acima da dobra | Conversão |
| Plano destaque | Ambos iguais | Anual como "mais popular" | Mix anual/mensal |
| Prova social | Ausente | 3 depoimentos com foto | Conversão geral |

## Otimização do Checkout Stripe

O checkout do Stripe ocorre fora do site (buy.stripe.com). Mas há configurações que melhoram a conversão:

1. **Nome do produto claro:** Não "subscription_monthly" — mas "Canva Viagem — Plano Mensal"
2. **Descrição com benefício:** "Acesso a centenas de vídeos, artes e stories prontos para sua agência"
3. **Logo da marca visível no checkout**
4. **Campos mínimos:** Pedir apenas email + dados de pagamento
5. **Frase de garantia no checkout:** "Garantia de 7 dias. Cancele quando quiser."

## Métricas do Funil para Monitorar

| Etapa | Meta de Taxa |
|---|---|
| Visitante → /planos | 15% dos visitantes do site |
| /planos → clique no botão | 20% dos visitantes da página |
| Clique → checkout iniciado | 80% (quase todos que clicam) |
| Checkout → assinatura concluída | 60% (perda por abandono) |
| **Conversão geral (visita → assinante)** | **2,4%** |

Com essas taxas, cada 1.000 visitantes = 24 novos assinantes.
