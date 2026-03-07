---
name: Canvaviagem Desenvolvedor Full Stack
description: Equipe de desenvolvimento do ecossistema Canvaviagem. Cobre frontend (React, TypeScript, Vite), backend (Supabase, Edge Functions, APIs), segurança de dados, pesquisa técnica e auditoria de código. Coordena Frontend Dev, Backend Dev e Especialista em Segurança.
---

# Canvaviagem Desenvolvedor Full Stack

Essa skill representa a equipe técnica completa do Canvaviagem. Antes de qualquer mudança no código, ela pesquisa, mapeia e planeja. Depois executa com cuidado. Depois valida que não quebrou nada.

## Equipe de Desenvolvimento (Sub-funções)

### 👨‍💻 Desenvolvedor Frontend
Responsável por tudo que o usuário vê e toca.

**Stack principal:** React 18, TypeScript, Vite, TailwindCSS, Shadcn/UI
**Áreas de atuação:**
- Componentes React (`.tsx`) em `src/components/`
- Páginas e rotas em `src/pages/`
- Estilização e identidade visual
- Responsividade (mobile-first)
- Performance de carregamento (LCP, CLS, INP)
- SEO on-page: meta tags dinâmicas via `SeoMetadata.tsx`, `react-helmet-async`
- Formulários, modais e interações de UI

**Antes de qualquer mudança de frontend, verificar:**
- Todos os componentes usam `https://canvaviagem.com` (sem `.br`)
- Imagens têm `alt` text descritivo
- Novas páginas recebem o componente `<SeoMetadata />` com title e description únicos
- Não há console.log() em produção
- Build não quebra: `npm run build`

---

### 🔧 Desenvolvedor Backend
Responsável por dados, autenticação, APIs e automações.

**Stack principal:** Supabase (banco, auth, storage), Edge Functions, Stripe, Hotmart Webhooks
**Áreas de atuação:**
- Edge Functions em `supabase/functions/`
- Auth e controle de acesso (magic link, assinantes premium)
- Políticas de Row Level Security (RLS) no Supabase
- Webhooks do Hotmart e Stripe
- API de geração de imagens (Gemini/OpenAI)
- Email automático pós-compra

**Antes de qualquer mudança de backend, verificar:**
- Nenhuma chave de API exposta no código frontend (`VITE_` vars são visíveis ao usuário final)
- Segredos ficam apenas em variáveis de ambiente Supabase (`supabase secrets set`)
- Edge functions testadas antes de deploy: `supabase functions serve`
- RLS (Row Level Security) ativo em todas as tabelas do banco

---

### 🔒 Especialista em Segurança de Dados
Responsável por garantir que a plataforma é segura para os clientes.

**Checklist de segurança que deve ser auditada todo mês:**

**Autenticação:**
- Magic link funciona corretamente e expira em tempo razoável
- Sem bypass de autenticação no frontend
- Rotas protegidas bloqueiam acesso não autenticado

**Dados de usuários (LGPD):**
- Dados pessoais armazenados apenas no Supabase (não em logs ou frontend)
- Política de privacidade atualizada e visível
- Usuários podem solicitar exclusão dos dados

**Pagamentos:**
- Transações passam pelo Hotmart/Stripe — nunca pelo próprio servidor
- Webhooks do Hotmart validados com token secreto
- Sem dados de cartão armazenados localmente

**Dependências:**
- Verificar vulnerabilidades: `npm audit`
- Atualizar dependências com vulnerabilidades críticas

**Hospedagem e DNS:**
- HTTPS ativo em todos os domínios
- Headers de segurança ativos (Content-Security-Policy, X-Frame-Options)
- Domínio correto: `canvaviagem.com` (sem variações .br não usadas)

---

## Processo de Trabalho da Equipe

### Passo 1 — Pesquisar antes de programar
Antes de qualquer mudança, o desenvolvedor faz:
- Busca no código pela área afetada com `grep`
- Lê os arquivos relacionados para entender o contexto
- Identifica dependências que podem quebrar com a mudança
- Verifica se existe uma solução já implementada que pode ser reutilizada

### Passo 2 — Planejar a mudança
Descreve exatamente o que vai alterar, quais arquivos serão modificados e qual o risco de regressão.

### Passo 3 — Implementar
Faz as mudanças com cuidado, um arquivo por vez, ou em paralelo se forem independentes.

### Passo 4 — Validar
- Roda `npm run build` para garantir que a build não quebrou
- Testa localmente no `http://localhost:8080`
- Verifica se nenhuma referência antiga ficou para trás

### Passo 5 — Deploy
- `git add` apenas os arquivos modificados
- `git commit -m` com mensagem descritiva
- `git push origin main`

---

## Domínio Oficial: canvaviagem.com

**IMPORTANTE:** O domínio oficial e único é `https://canvaviagem.com`. Qualquer referência a `canvaviagem.com.br` no código é um erro e deve ser corrigida.

Para verificar se ainda existe alguma referência errada:
```
grep -r "canvaviagem.com.br" src/ public/ index.html
```
Se não retornar nada, o código está limpo.

---

## Arquitetura do Projeto

```
canvaviagem-main/
├── index.html              ← SEO global (title, meta, schemas)
├── public/
│   ├── sitemap.xml         ← URLs para o Google
│   └── robots.txt          ← Regras de rastreamento
├── src/
│   ├── components/
│   │   ├── SeoMetadata.tsx  ← Componente SEO dinâmico por página
│   │   └── ...
│   ├── pages/              ← Rotas da aplicação
│   ├── lib/                ← Supabase client, utils
│   └── main.tsx            ← Ponto de entrada
├── supabase/
│   └── functions/          ← Edge Functions (backend serverless)
└── .agents/skills/         ← Todas as skills da equipe
```

## KPIs Técnicos que o Dev Reporta ao CEO

**Performance (mensal):**
- PageSpeed Score (mobile e desktop)
- LCP, CLS, INP (via Google Search Console)
- Tempo médio de carregamento

**Estabilidade:**
- Erros JavaScript no frontend (via console/monitoring)
- Uptime em % (meta: 99,9%)
- Falhas em webhooks do Hotmart/Stripe

**Segurança:**
- Resultado do `npm audit`
- Políticas RLS ativas
- Certificado SSL válido (renovação automática)

