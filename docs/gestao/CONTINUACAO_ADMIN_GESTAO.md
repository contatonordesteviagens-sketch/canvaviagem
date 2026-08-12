# Continuação — administração unificada em `/gestao`

## Fonte de verdade

- Produção: Lovable Cloud `zdjtcwtakgizbsbbwtgc`.
- RPC administrativa: `admin_user_intelligence`.
- Controle reversível de site: `admin_set_public_site_status`.
- Assinatura: `public.subscriptions`; sites: `public.public_sites`.

## Feito em 12/08/2026

- `/gestao?tab=sites` agora lista sites de **todos os usuários**, não apenas do administrador logado.
- Cada site mostra dono, email, plano, ciclo, status da assinatura, data, link e status do site.
- A ação destrutiva virou suspender/reativar, preservando histórico e leads.
- `/admin/users` redireciona para `/gestao?tab=users`.
- Abas de `/gestao` aceitam URL direta via `?tab=`.
- Dashboard usa a RPC real para ativos, cancelados e inadimplentes. Valores financeiros continuam vindo da função server-side `stripe-dashboard`.

## Arquivos principais

- `src/pages/Gestao.tsx` — shell e tabs.
- `src/components/gestao/SitesSection.tsx` — inventário administrativo dos sites.
- `src/components/gestao/UsersSection.tsx` — tabela atual de usuários.
- `src/components/gestao/DashboardSection.tsx` — KPIs.
- `src/hooks/useAdminUserIntelligence.ts` — hook compartilhado novo.
- `src/pages/admin/UserIntelligence.tsx` — implementação anterior; usar como referência para portar filtros, alertas e telemetria à aba Usuários.
- `supabase/migrations/20260812120000_revenue_guard_admin_intelligence.sql` — RPCs e segurança.

## Próximas tarefas, em ordem

1. Substituir `useActiveUsers` em `UsersSection.tsx` por `useAdminUserIntelligence`; portar filtros “tem site”, “tem lead”, “alerta”, plano e ciclo.
2. Adicionar no topo do Dashboard cartões “Novos no mês” e “Trials”; manter dinheiro exclusivamente em `stripe-dashboard`.
3. Conferir `stripe-dashboard` contra Stripe: MRR deve considerar só assinaturas `active/trialing`, normalizando anual e semestral para mês; receita deve usar invoices pagas, nunca valor inventado por plano.
4. Acrescentar paginação server-side à RPC antes de crescer além de alguns milhares de usuários.
5. Após validar `/gestao`, remover o componente antigo `src/pages/admin/UserIntelligence.tsx`.

## Validação

- `npm run build` passou em 12/08/2026.
- Testar autenticado como administrador: `/gestao?tab=sites`, suspensão, reativação, link público e `/gestao?tab=users`.
