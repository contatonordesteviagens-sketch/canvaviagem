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

## Estado do git (29/10/2026)
- Branch `feat/inicio-quiz-onboarding`, 39 arquivos alterados, **nada commitado**.
- `origin/main` está 19 commits à frente; só `src/pages/Index.tsx` se sobrepõe → fazer rebase antes do push.
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
