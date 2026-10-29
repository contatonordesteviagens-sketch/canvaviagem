---
tags: [canva-viagem, regras, deploy, pendencias]
criado: 2026-10-29
---
# Regras, pendências e como publicar
← [[00 - Índice (comece aqui)]]

## Regras que nunca podem ser quebradas
- `crm_form_submissions` tem **leads reais**: nunca criar rotina que apague, trunque ou resete.
- Cada agência isolada por RLS (`owner_id = user.id`) — nunca remover.
- `Phase5Dashboard.tsx`: nunca trocar a lista de leads por `[]` em erro de busca; nunca remover `setLeadsList`.
- Artes: nunca mexer visualmente nas variantes antigas **V0–V5**; mudanças isoladas em `if (variant === N)`; `TOTAL_VARIANTS = 9`.
- Antes de commit: `npx tsc --noEmit` (0 erros) e depois build.
- Push na `main` = **produção** (Lovable). Commit e push só com autorização do Lucas. Nunca deploy pelo Vercel.

## Estado do git (29/10/2026) — PUBLICADO
- Commit `a06f6a67` (58 arquivos, só o trabalho desta rodada) + merge `570e2dbe` com os 19 commits do Lovable (1 conflito em `fabrica-html-export.ts`, resolvido).
- Push em `origin/main` às 06:20 UTC de 29/10 → Lovable publica em produção.
- Testado antes do push, logado como admin no navegador: Gestão (293 usuários), home (busca, chips, Mais, atalhos, barra do celular), Fábrica (Primeiros passos, pacote em uma frase), anúncio gerado nos modelos 6 e 9 com preço/parcelas/total, carrossel (6 slides), site (aviso de rascunho, botão único, prévia), republicação do `breadi.canvaviagem.com` (contador de visitas saiu com a chave), CRM em cartões no celular, `/inicio` e `/onboarding`. Zero erros de console.

### Segunda publicação (29/10, mais tarde)
- `db61c577` (agente da Woovi: funções `woovi-*`, modal de Pix) + `82ba6fb8` (nova `/inicio`, `/checkout`, quiz, botão Google condicional, `email_captures`, `/inicio2`). Push na `main`; publicar no Lovable (Publish → Update).
- **No Lovable Cloud depois do publish:** aplicar as migrações `20261029120000_suspend_unpaid_sites.sql` (após a consulta de prévia da nota 07) e `20261029150000_email_captures.sql`; confirmar deploy das functions `create-checkout`, `send-magic-link`, `woovi-*`; ligar **Google** em Users → Auth settings (o botão só aparece quando o provedor está ligado).
- Voltar só esta rodada: `git push origin 570e2dbe:main --force`. Voltar tudo: `a22142a6`.
- **Conferido no ar (29/10 noite):** Lucas publicou; `/inicio`, `/inicio2`, `/login`, `/checkout` OK no celular. Migrações, functions `woovi-*` e Google **ainda não ativados** no Lovable Cloud (detalhe e comandos de conferência em [[10 - Estado da produção e checklist pós-publicação (29-10, noite)]]).
- Sem commit ainda: `ProtectedRoute.tsx` passou a guardar a query no redirect do login (`/checkout?plano=…&metodo=…`).

### Ponto de retorno (versão publicada ANTES desta rodada)
- Tag e branch `backup/producao-2026-10-29` = commit **`a22142a6`** ("Consolidou e publicou vídeos"), já no GitHub.
- **Voltar tudo ao que era:** `git push origin a22142a6:main --force` (o Lovable republica a versão antiga em minutos).
- **Voltar a testar a nova depois:** `git push origin 570e2dbe:main --force`.
- O código novo continua salvo na branch `feat/inicio-quiz-onboarding`.
- `npm run build` falha no `prebuild` (`validate-official-supabase.mjs`) porque o `.env` não tem `VITE_SUPABASE_PROJECT_ID`; usar `npx vite build` para validar.

## Pendências do Lucas (não dá para fazer pelo código)
1. SQL no Supabase:
   `ALTER TABLE public.fabrica_diagnosticos DROP CONSTRAINT IF EXISTS fabrica_diagnosticos_user_id_key; DROP INDEX IF EXISTS public.fabrica_diagnosticos_user_id_key;`
2. No admin da arte: zerar o padrão da V2 ("Zerar todos os ajustes" → "Salvar como padrão").
3. Corrigir o WhatsApp da conta Iland Noronha.
4. Republicar os sites breadi e enrico (texto em espanhol).
5. Publicar a função `fabrica-transcribe-audio`.
6. Stripe: URL de retorno dos Payment Links → `https://canvaviagem.com/fabrica`.
7. Ativar login Google no Supabase.
8. Trocar a capa do card "Maragogi - AL".

## Decisões em aberto
- Corrigir ou não as variantes protegidas V0/V3/V5 (texto sobreposto, "sem juros" automático).
- Como tratar os números de exemplo do site (hoje: escondidos no publicado, marcados na prévia).

## Efeitos colaterais dos testes na conta admin
- Carrossel "Fernando de Noronha" ficou com 3 slides, formato Stories, estilo Confiança.
- Arte "Noronha TESTE QA" na galeria.
- Pacote "TESTE QA Maragogi" foi criado e já removido.

## Como publicar (quando autorizado)
1. `git fetch origin` → rebase da branch sobre `origin/main` (resolver `Index.tsx`).
2. `npx tsc --noEmit` → `npx vite build`.
3. Commit → push para `origin main` (Lovable publica).
4. Testar em produção: `/`, `/inicio`, `/onboarding`, `/fabrica` (anúncio, carrossel, site, CRM) no celular.
