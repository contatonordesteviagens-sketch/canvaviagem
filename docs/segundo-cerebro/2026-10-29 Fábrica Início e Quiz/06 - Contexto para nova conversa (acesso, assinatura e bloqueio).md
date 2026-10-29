---
tags: [canva-viagem, pagamento, stripe, acesso, seguranca, prompt]
criado: 2026-10-29
---
# Contexto para nova conversa: liberação de acesso, vencimento e bloqueio
← [[00 - Índice (comece aqui)]] · continuação de [[05 - Contexto para nova conversa (Pix Woovi)]]

```
CONTEXTO 2 — LIBERAÇÃO DE ACESSO, VENCIMENTO E BLOQUEIO (vale para Stripe e para o Pix da Woovi)

OBJETIVO
Liberar a ferramenta SÓ para quem pagou e está com o pagamento em dia, na conta certa, na hora.
1. Quem pagou tem que receber o acesso imediatamente (hoje existe o erro "assinei e não recebi acesso", principalmente na Stripe).
2. Quem não assinou não pode acessar a Fábrica nem o conteúdo premium.
3. Quem pagou o 1º mês e não pagou o 2º deve ser BLOQUEADO.
4. Pix (sem recorrência): acesso vence sozinho no fim do período pago.

PLANOS
- Start (prod_TkvaozfpkAcbpM, start_ticto, monthly_access_ticto): só a biblioteca (vídeos/artes). SEM Fábrica.
- Elite (prod_UTFsXcKq8m0mol, prod_UTSmPe3GPt8iHt, prod_UTFlCWzNqvqSNx, hotmart_elite, elite_ticto, monthly_access_pix, annual_access_pix): tudo, incluindo a Fábrica (anúncios, carrossel, site, CRM).
- Preços atuais: mensal R$ 97, semestral R$ 347, anual R$ 482 (Payment Links em src/lib/eliteOffer.ts).
- Admin (lucashenriquephd@gmail.com e quem tem papel admin) passa por cima de tudo.

COMO O ACESSO É DECIDIDO HOJE (arquivos)
- Listas de produtos: src/lib/planAccess.ts e supabase/functions/_shared/planAccess.ts (manter as DUAS iguais).
- Regra de "pagamento em dia": isPaidSubscriptionCurrent() em _shared/planAccess.ts → só "active" (com current_period_end no futuro) ou "trialing" (trial no futuro). past_due, unpaid, canceled, incomplete = SEM acesso. ⚠ Se current_period_end for NULL e status "active", conta como válido para sempre.
- Tabela "subscriptions" (1 linha por user_id, onConflict user_id): status, product_id, current_period_end, billing_provider (stripe | pix | hotmart...), billing_cycle, stripe_customer_id, stripe_subscription_id.
- supabase/functions/stripe-webhook: checkout.session.completed, customer.subscription.created/updated/deleted, invoice.payment_succeeded, invoice.payment_failed (→ past_due/canceled). Acha o usuário primeiro por client_reference_id, depois por e-mail; se não acha, CRIA conta nova com o e-mail do checkout e manda magic link.
- supabase/functions/check-subscription: chamado pelo app no login. Provedor não-Stripe com linha válida → libera direto. Stripe → confere AO VIVO na Stripe (clientes pelo e-mail logado + stripe_customer_id salvo); se não achar assinatura em dia, marca a linha como canceled. Pagamento único (mode=payment): só olha sessões dos ÚLTIMOS 30 DIAS e dá 30 DIAS de acesso.
- supabase/functions/fabrica-entitlements: lê a tabela subscriptions e devolve as permissões (free/start/elite) para o front.
- Front: src/contexts/EntitlementsContext.tsx (can()), src/components/ProtectedRoute.tsx (requireSubscription / requireElite → manda para /inicio), src/components/fabrica/FabricaUpgradeBlock.tsx (tela de bloqueio).
- localhost libera tudo (isLocalPreviewEnabled) — só para desenvolvimento, não afeta produção.
- Ferramenta de reconciliação: supabase/functions/stripe-reconcile-subscriptions.

JÁ CORRIGIDO (29/10/2026, ainda sem commit, branch feat/inicio-quiz-onboarding)
- Causa nº 1 do "paguei e não recebi": os botões de assinar da página de vendas (src/pages/Inicio2.tsx) e da tela de bloqueio da Fábrica (FabricaUpgradeBlock.tsx) abriam o Payment Link SEM identificar o usuário. Quem entrou com Google num e-mail e digitou outro (ou errado, ex.: "@gmail.con") na Stripe recebia o acesso numa conta nova, não na dele.
- Correção: helper withCheckoutIdentity() em src/lib/eliteOffer.ts adiciona client_reference_id (id do usuário) e prefilled_email em TODOS os links de checkout (Inicio2, FabricaUpgradeBlock, quiz /onboarding). O webhook já usa client_reference_id.

SITES DOS CLIENTES (também já feito em 29/10, sem commit — detalhes em docs/segundo-cerebro/.../07 - Sites de quem não paga e visitas na Gestão.md)
- Site de quem não está com Elite em dia sai do ar (public_sites.is_active = false) e o Worker da Cloudflare (cloudflare/agency-router) redireciona para https://canvaviagem.com/inicio. Nada é apagado; pagou, volta sozinho.
- Migração nova supabase/migrations/20261029120000_suspend_unpaid_sites.sql: publicar liga/desliga conforme o plano + varredura de hora em hora (pg_cron). Precisa ser aplicada no SQL Editor DEPOIS de rodar a consulta de prévia da nota 07 e conferir quem vai sair do ar.
- Faixa vermelha no /inicio avisa o dono que o site está fora do ar (src/components/SuspendedSiteNotice.tsx).
- Visitas na Gestão estavam zeradas porque o HTML do site saía com a chave do Supabase vazia (variável VITE_SUPABASE_PUBLISHABLE_KEY inexistente). Corrigido em src/lib/supabase-public.ts; todos os sites precisam ser republicados uma vez.
- Qualquer mudança na regra de "pode acessar" deve ser espelhada na função SQL public.fabrica_full_access_internal (que decide se o site fica no ar) — ela tem a MESMA lista de produtos Elite.

O QUE FALTA VERIFICAR E CORRIGIR (use o navegador no painel da Stripe)
1. Na Stripe, abrir os 3 Payment Links (buy.stripe.com/fZucN6bma6QEeH96kI8so0c mensal, 8x2cN60HwcaY2Yr38w8so0j semestral, 6oUdRa0Hwa2Qcz1dNa8so0i anual) e anotar: ID do PRODUTO de cada um e se é ASSINATURA (recorrente) ou PAGAMENTO ÚNICO.
   - Se algum produto NÃO estiver em ELITE_PRODUCT_IDS → quem paga não recebe acesso. Adicionar nos dois planAccess.ts.
   - Se semestral/anual forem PAGAMENTO ÚNICO → hoje o cliente perde o acesso depois de 30 dias (check-subscription). Corrigir: ou transformar em assinatura (6 meses / 1 ano), ou no webhook e no check-subscription calcular o vencimento pelo plano (180/365 dias) e olhar sessões de até 366 dias.
2. No webhook, pagamento único grava status "active" com current_period_end NULL (= válido para sempre no fabrica-entitlements). Sempre gravar data de vencimento.
3. Antes de exigir data de vencimento em isPaidSubscriptionCurrent, contar quantas linhas ativas têm current_period_end NULL (SELECT billing_provider, count(*) FROM subscriptions WHERE status='active' AND current_period_end IS NULL GROUP BY 1) e me mostrar, para não bloquear clientes antigos (Hotmart) por engano.
4. Stripe → Configurações → Faturamento → "Gerenciar pagamentos com falha": depois das novas tentativas, CANCELAR a assinatura (ou marcar como não paga). Com isso + past_due já bloqueando, quem não pagou o 2º mês perde o acesso. Confirmar que o webhook recebe invoice.payment_failed e customer.subscription.updated/deleted (Stripe → Desenvolvedores → Webhooks → eventos e entregas com erro).
5. Payment Links → "Após o pagamento" → redirecionar para https://canvaviagem.com/fabrica.
6. Proteção no servidor: as Edge Functions que gastam (fabrica-generate-ad, fabrica-design-ai, fabrica-edit-photo, fabrica-transcribe-audio, fabrica-search-photos, vendedor-generate-response...) NÃO conferem se o usuário é Elite; qualquer logado poderia chamar direto. Criar um guard compartilhado (_shared) que lê subscriptions + isPaidSubscriptionCurrent + isEliteProduct (admin passa) e devolve 403.
7. Páginas antigas src/pages/Planos.tsx e PlanosES.tsx têm links antigos da Stripe (planos Smart/Elite antigos). Ver se ainda estão em rota; se sim, conferir os produtos ou redirecionar para /inicio.
8. Casos já existentes de "paguei e não recebi": rodar stripe-reconcile-subscriptions (ou listar na Stripe assinaturas ativas cujo e-mail não tem linha válida em subscriptions) e me mostrar a lista ANTES de alterar qualquer coisa.

PIX WOOVI (do contexto 1) — MESMAS REGRAS
- Ao pagar: upsert em subscriptions com billing_provider "pix", status "active", product_id de Pix Elite e current_period_end = data do pagamento + 30 / 180 / 365 dias. Sem data = proibido.
- Identificar o usuário pelo user_id enviado na criação da cobrança (correlationID), não só pelo e-mail.
- Vencido = bloqueia sozinho (isPaidSubscriptionCurrent). Mandar aviso 3 dias antes de vencer com novo Pix.

TESTES OBRIGATÓRIOS ANTES DO PUSH
- Conta nova sem pagar → /fabrica bloqueado (vai para /inicio).
- Logado com Google (e-mail A), paga digitando e-mail B → acesso cai na conta A.
- Assinatura em past_due/canceled → bloqueado no próximo login.
- Pix pago → acesso imediato; vencido → bloqueado.
- Plano Start → biblioteca sim, Fábrica não.
- Admin → tudo liberado.

REGRAS
- Nunca apagar/truncar/resetar crm_form_submissions (leads reais). Nunca remover RLS (owner_id = user.id).
- Não apagar linhas de subscriptions; só atualizar status/datas. Mostrar antes qualquer UPDATE em massa.
- Edge Functions alteradas precisam ser publicadas no Supabase (o push do Lovable não publica funções automaticamente — confirme).
- npx tsc --noEmit (0 erros) + npx vite build antes de commit. Commit/push só com minha autorização.

Comece pelo item 1 (painel da Stripe pelo navegador) e me mostre o que encontrou antes de alterar código.
```
