---
tags: [canva-viagem, sites, suspensao, gestao, visitas]
criado: 2026-10-29
---
# Sites de quem não paga + visitas na Gestão
← [[00 - Índice (comece aqui)]]

## Decisão do Lucas
Não pagou → **site sai do ar** e quem abrir o endereço vai para o Canva Viagem (`/inicio`). Sem os 7 dias de aviso. Nada é apagado: pagou de novo, o site volta sozinho.

## Como os sites funcionam
`agencia.canvaviagem.com` → Cloudflare Worker `dry-snowflake-d942` (código em `cloudflare/agency-router`) → lê `public_sites` no Supabase **só se `is_active = true`**.
A suspensão já existia desde 12/08 (migração `revenue_guard_admin_intelligence`), e está na produção.

## Por que tinha cliente sem pagar com site no ar
1. A suspensão só rodava quando a linha da assinatura **mudava**. Plano vencido pela data (Pix, Hotmart, webhook perdido) não muda nada → site continuava.
2. Ao publicar, o site só era **ligado** se a pessoa podia; nunca **desligado**. E o padrão é ligado.
3. Não havia varredura periódica.
Em 29/10 havia **13 sites no ar**.

## O que foi feito (sem commit, sem aplicar)
- `supabase/migrations/20261029120000_suspend_unpaid_sites.sql`: publicar liga **ou desliga** conforme o plano; função `sync_all_public_sites_access()`; agendamento de hora em hora com pg_cron; roda uma vez ao aplicar.
- Worker: site suspenso/inexistente → **redireciona (302)** para `https://canvaviagem.com/inicio?utm_source=site_suspenso&utm_campaign=<slug>`. 15 testes passando.
- `/inicio`: faixa vermelha para o dono logado — "seu site X está fora do ar… renove e ele volta na hora" (`src/components/SuspendedSiteNotice.tsx`).

## Visitas zeradas na Gestão
- A Gestão conta visitas por `analytics_events` (page_view, `ingestion = validated_v1`) gravados pela função `track-fabrica-event`, chamada pelo próprio site.
- **8 dos 13 sites não têm o contador** (publicados antes dele existir): correiatur, jecce-tour-viagens, ps-conecta-viagens, le-von-d-or-destinos, levondordestinos, runtrips, raquel-sales-travels, enrico-viagens → precisam ser **republicados**.
- **Os 5 que têm estavam com a chave vazia** (agencia-farol-do-cabo, breadi, check-in-travel, carvalho-realiza-viagens, tcaturismo…): o código lia `VITE_SUPABASE_PUBLISHABLE_KEY`, que não existe nesta configuração (a variável chama `VITE_SUPABASE_ANON_KEY`). Contador não enviava nada.
- Correção: `src/lib/supabase-public.ts` (chave pública com reserva segura), usado no HTML do site (PT e ES), na Gestão (`useAdminDashboard.ts`) e nas permissões (`EntitlementsContext.tsx`). Depois do deploy, **todos os sites precisam ser republicados uma vez** para começar a contar.

## Passos para ligar tudo (Lucas)
1. **Antes**, no Supabase → SQL Editor, ver quem vai cair (só leitura):
```sql
SELECT ps.id AS site, p.email, s.status, s.product_id, s.current_period_end,
       public.fabrica_full_access_internal(ps.owner_id) AS pode_ficar_no_ar
FROM public.public_sites ps
LEFT JOIN public.profiles p ON p.user_id = ps.owner_id
LEFT JOIN public.subscriptions s ON s.user_id = ps.owner_id
WHERE ps.is_active
ORDER BY pode_ficar_no_ar, ps.id;
```
   Quem aparecer com `pode_ficar_no_ar = false` vai sair do ar. Se alguém ali **pagou** (erro "paguei e não recebi"), corrigir a assinatura antes.
2. Database → Extensions → ligar **pg_cron**.
3. Colar e rodar o conteúdo de `supabase/migrations/20261029120000_suspend_unpaid_sites.sql`.
4. Publicar o Worker (passo a passo em `cloudflare/agency-router/README.md`, com `wrangler login` e rollback anotado).
5. Push do app (Lovable) → republicar os sites.

## Atenção
- Admin que reativar um site manualmente para alguém sem plano: a varredura de hora em hora desliga de novo. Para manter, dar uma assinatura à pessoa.
- Assinatura com `current_period_end` vazio conta como válida para sempre (clientes antigos Hotmart). Revisar.
- Stripe em `past_due` (1ª cobrança falhou) já tira o site do ar, mesmo se a nova tentativa passar dias depois.
- "Dados incorretos" da Gestão além das visitas ainda **não foram auditados** tela por tela.
