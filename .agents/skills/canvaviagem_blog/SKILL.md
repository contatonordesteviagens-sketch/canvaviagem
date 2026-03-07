---
name: Canvaviagem Blog Manager
description: Departamento completo de blog e conteúdo SEO do Canvaviagem. Coordena Redatores, Editor-Chefe, Estrategista de SEO e Especialista em Distribuição. Responsável por produzir artigos que ranqueiam no Google e convertem agentes de viagem em clientes pagantes.
---

# Canvaviagem Blog Manager — Departamento de Blog

Esse departamento é motor de crescimento orgânico do Canvaviagem. Cada artigo publicado é um vendedor 24h no ar, atraindo agentes de viagem que estão ativamente buscando soluções — exatamente o que o Canvaviagem oferece.

**Meta:** Ranquear no Top 3 do Google para pelo menos 20 palavras-chave de alta intenção do mercado de agências de viagem no prazo de 6 meses.

---

## Equipe do Departamento

### 📝 Editor-Chefe de Blog
Responsável por definir a pauta, revisar todos os artigos antes de publicar e garantir consistência de voz e qualidade.

**Responsabilidades:**
- Aprovar e priorizar pautas semanais com base em dados de busca
- Garantir que cada artigo: tem mínimo 1.200 palavras, palavra-chave no H1 e no primeiro parágrafo, e CTA claro para o produto
- Revisar clareza, gramática e tom de voz antes de publicar
- Garantir que o artigo está alinhado com a persona: agente de viagem autônomo ou dono de agência de pequeno porte

### ✍️ Redator Especialista em Agências de Viagem
Escreve os artigos com foco em SEO e conversão.

**Regras de escrita:**
- Tom: consultivo, próximo, sem enrolação. Fala para o agente de viagem como um colega especialista.
- Sempre inclui: exemplos práticos, listas acionáveis, dados ou estatísticas quando possível
- Nunca usa: jargão técnico desnecessário, frases genéricas como "no mundo de hoje"
- Estrutura padrão de cada artigo:
  1. **H1** — Título com a palavra-chave principal
  2. **Lead** (1º parágrafo) — dor do agente + promessa do artigo
  3. **Corpo** — H2s com subtópicos, listas, exemplos
  4. **CTA intermediário** — caixa de destaque com link para planos ou produto
  5. **Conclusão** — resumo prático + CTA final

### 📊 Estrategista de SEO e Palavras-chave
Pesquisa e seleciona as palavras-chave para cada artigo.

**Processo de seleção:**
1. Escolher palavras-chave de cauda longa (long-tail) — mais específicas, menos concorrência, alta intenção
2. Volume mínimo sugerido: 100-500 buscas/mês (nicho é pequeno — qualidade vale mais que volume)
3. Verificar a intenção: a pesquisa é informacional (aprender) ou transacional (comprar)?
4. Usar artigos informacionais para atrair e artigos transacionais para converter
5. Cada artigo tem: 1 palavra-chave principal + 3-5 secundárias naturalmente distribuídas

**Calendário de palavras-chave prioritárias (baseado em pesquisa real):**

| # | Palavra-chave Principal | Tipo | Volume Estimado |
|---|---|---|---|
| 1 | o que postar no instagram agência de viagem | Informacional | Alto |
| 2 | como criar conteúdo para agência de viagem sem gravar vídeo | Informacional | Médio |
| 3 | marketing digital para agência de viagem | Informacional | Alto |
| 4 | erros que agentes de viagem cometem no instagram | Informacional | Médio |
| 5 | como conseguir clientes pelo instagram sendo agente de viagem | Transacional | Médio |
| 6 | templates canva para agência de viagem | Transacional | Alto |
| 7 | como montar calendário de conteúdo agência de viagem | Informacional | Médio |
| 8 | canva para agência de viagem tutorial | Transacional | Médio |
| 9 | vídeos prontos para agência de viagem | Transacional | Alto |
| 10 | conteúdo pronto para agência de viagem instagram | Transacional | Médio |

### 📣 Especialista em Distribuição e Reaproveitamento
Garante que cada artigo seja espalhado em múltiplos canais.

**Checklist de distribuição por artigo:**
- [ ] Publicar no blog (`canvaviagem.com/blog/slug-do-artigo`)
- [ ] Criar 3 posts de Instagram baseados no artigo (usar skills de Feed e Stories)
- [ ] Criar 1 Reel resumindo o artigo em 30-60 segundos
- [ ] Postar no Google Meu Negócio (quando ativo) com trecho e link
- [ ] Enviar trecho por email para a base de leads (quando lista existir)
- [ ] Atualizar o sitemap.xml com a nova URL do artigo

---

## Processo de Publicação de Um Artigo

```
1. [Estrategista SEO] Seleciona palavra-chave da lista prioritária
2. [Editor-Chefe] Aprova pauta e define ângulo do artigo (título final)
3. [Redator] Escreve artigo completo (+1.200 palavras) com SEO on-page
4. [Editor-Chefe] Revisa e aprova
5. [Dev] Cria o componente BlogPost tsx e registra a rota no App.tsx
6. [Dev] Faz commit e push para o GitHub → Lovable faz deploy
7. [Especialista Distribuição] Distribui nos canais
8. [SEO Manager] Atualiza sitemap.xml com a nova URL
9. [CEO] Monitora performance no Google Search Console após 4 semanas
```

---

## Checklist SEO On-Page por Artigo

Antes de publicar, conferir:

- [ ] Palavra-chave no `<title>` (máximo 60 caracteres)
- [ ] Palavra-chave na `<meta description>` (máximo 155 caracteres)
- [ ] Palavra-chave no H1
- [ ] Palavra-chave no primeiro parágrafo
- [ ] H2s descritivos com palavras-chave secundárias
- [ ] Schema JSON-LD do tipo `Article` com `datePublished`, `author` e `publisher`
- [ ] Link `rel="canonical"` apontando para a URL correta
- [ ] CTA interno linkando para `/planos`
- [ ] URL amigável (slug com palavras-chave, sem acentos, com hífens)
- [ ] URL adicionada ao sitemap.xml

---

## Calendário de Publicação — Ritmo Recomendado

| Semana | Artigo | Status |
|---|---|---|
| Semana 1 | O que postar no Instagram da sua agência | ✅ Publicado |
| Semana 1 | Como criar conteúdo sem gravar vídeo | 🔄 Em criação |
| Semana 2 | Marketing digital para agência de viagem | ⏳ Aguardando |
| Semana 2 | Erros no Instagram — agentes de viagem | ⏳ Aguardando |
| Semana 3 | Como conseguir clientes pelo Instagram | ⏳ Aguardando |
| Semana 3 | Templates Canva para agência de viagem | ⏳ Aguardando |
| Semana 4 | Calendário de conteúdo para agência | ⏳ Aguardando |
| Semana 4 | Canva para agência de viagem — tutorial | ⏳ Aguardando |

**Meta:** 2 artigos por semana. Em 4 semanas, 8 URLs indexadas + domínio com autoridade crescente.

---

## KPIs do Blog (monitorar mensalmente)

| Métrica | Meta Mês 1 | Meta Mês 3 |
|---|---|---|
| Artigos publicados | 8 | 20 |
| Cliques orgânicos/mês | 50+ | 500+ |
| Impressões no Google | 1.000+ | 10.000+ |
| Posição média | Top 20 | Top 10 |
| Taxa de conversão blog → planos | 1-2% | 3-5% |

