---
name: Canvaviagem Blog Automação Autônoma
description: Skill que opera o pipeline completo de blog de forma autônoma — pesquisa temas, escreve artigos SEO, publica via GitHub e monitora performance. Roda sem precisar de comandos manuais.
---

# 🤖 Blog Automação Autônoma — Pipeline Completo

Esta skill é responsável por manter o blog do Canvaviagem sempre crescendo, **sem que o Lucas precise pedir nada**. Ela opera em ciclos diários e semanais de forma contínua.

---

## 🔄 Ciclo Diário Autônomo (executa todo dia)

```
06h00 — GitHub Actions roda automaticamente
  ↓
Commit de atualização no repositório
  ↓
Lovable faz o redeploy do site
  ↓
Telegram notifica Lucas: "✅ Site atualizado"
  ↓
Google rastreia o site novamente (novo conteúdo)
```

### O que o GitHub Actions faz:
- Commit automático que ativa o redeploy no Lovable
- Notifica o Lucas no Telegram com status do dia
- Registra o deploy no histórico `.github/deploy-logs/history.txt`

---

## 📝 Ciclo de Criação de Artigos (semi-autônomo)

A cada novo artigo, este é o processo:

```
1. [SEO] Escolhe palavra-chave da lista prioritária
2. [Pesquisa] Busca o que o mercado está perguntando (YouTube, Google)
3. [Redator] Escreve o artigo +1.200 palavras com dados reais
4. [Designer] Gera imagem hero com generate_image
5. [Dev] Cria BlogPostN.tsx + registra rota no App.tsx
6. [Dev] Faz git commit + push → Lovable deploya
7. [SEO] Atualiza sitemap.xml com nova URL
8. [Telegram] Notifica Lucas: "📝 Artigo publicado: [título]"
```

---

## 📅 Fila de Artigos (próximos a criar)

| # | Título | Palavra-chave | Status |
|---|---|---|---|
| 4 | 7 Erros que Agentes Cometem no Instagram | erros agente viagem instagram | ⏳ Próximo |
| 5 | Como Conseguir Clientes pelo Instagram Sendo Agente de Viagem | como conseguir clientes agência viagem | ⏳ Aguardando |
| 6 | Templates Canva para Agência de Viagem: Guia Completo | templates canva agência viagem | ⏳ Aguardando |
| 7 | Como Montar Calendário de Conteúdo para Agência de Viagem | calendário conteúdo agência viagem | ⏳ Aguardando |
| 8 | IA para Agência de Viagem: Como Usar Sem Ser Técnico | IA agência de viagem | ⏳ Aguardando |
| 9 | Destinos em Alta 2026: O Que Postar na Sua Agência | destinos em alta 2026 agência viagem | ⏳ Aguardando |
| 10 | Instagram para Agente de Viagem Iniciante | instagram agente de viagem iniciante | ⏳ Aguardando |

---

## ⚡ Regras de Execução Autônoma

1. **Nunca esperar aprovação** para criar um artigo da fila
2. **Sempre usar dados reais** da pesquisa de mercado (não inventar)
3. **Sempre incluir CTA** para `/planos` com preços corretos (R$29/mês ou R$197/ano)
4. **Sempre gerar imagem** para cada artigo via `generate_image`
5. **Sempre commitar e dar push** após criar o artigo
6. **Sempre notificar o Lucas** no Telegram após publicar

---

## 🔔 Notificações Automáticas no Telegram

Mensagens que o bot envia autonomamente:

| Evento | Mensagem |
|---|---|
| Deploy diário | `✅ Deploy concluído — [data]` |
| Artigo publicado | `📝 Novo artigo: [título] — canvaviagem.com/blog/[slug]` |
| Nova venda Stripe | `💰 VENDA! Plano [mensal/anual] — Total do mês: R$X` |
| Alerta de erro | `⚠️ Falha no deploy — verificar GitHub Actions` |

---

## 📊 KPIs que esta skill monitora

| Métrica | Frequência | Meta |
|---|---|---|
| Artigos publicados/semana | Semanal | 10+ |
| URLs indexadas no Google | Mensal | +50/mês |
| Cliques orgânicos | Mensal | dobrar a cada 2 meses |
| Posição média Search Console | Mensal | subir 5 posições |
