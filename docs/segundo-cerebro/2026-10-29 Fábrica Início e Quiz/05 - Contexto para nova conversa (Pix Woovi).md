---
tags: [canva-viagem, pagamento, pix, woovi, prompt]
criado: 2026-10-29
---
# Contexto para nova conversa: Pix via Woovi
← [[00 - Índice (comece aqui)]]

Cole o bloco abaixo numa conversa nova do Claude (com a extensão Claude in Chrome ativa e o painel da Woovi logado no Chrome).

```
Sou o Lucas, dono do Canva Viagem (canvaviagem.com), um SaaS de marketing para agências de viagens (vídeos Reels, artes, carrosséis e a "Fábrica": gerador de anúncios, sites, carrosséis e CRM de leads). Quero adicionar PIX via WOOVI (OpenPix) como nova forma de pagamento para facilitar as compras. Use a extensão Claude in Chrome para acessar meu painel da Woovi (já estou logado) e me guie/execute a configuração.

PROJETO
- Pasta local: C:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26
- Stack: React + Vite + TypeScript + Tailwind; Supabase (Auth, Postgres com RLS, Edge Functions em Deno).
- Produção: push na branch main do remote "origin" → o Lovable publica. NUNCA fazer deploy pelo Vercel. Commit/push só com minha autorização.
- Antes de qualquer commit: npx tsc --noEmit (0 erros) e npx vite build.

PAGAMENTOS QUE JÁ EXISTEM
- Stripe (cartão) com Payment Links em src/lib/eliteOffer.ts (ELITE_OFFER):
  mensal R$ 97 · semestral R$ 347 · anual R$ 482 (≈ R$ 40,16/mês). Webhook: supabase/functions/stripe-webhook.
- Já existe um Pix antigo pela AbacatePay: supabase/functions/abacatepay-webhook/index.ts. USE COMO MODELO:
  valida assinatura HMAC (segredo em Deno.env), faz upsert em "profiles" (onConflict user_id) e em "subscriptions"
  com product_id "monthly_access_pix" ou "annual_access_pix", e cria magic link (tabela magic_link_tokens) + e-mail via Resend.
- Produtos que liberam o plano Elite estão em src/lib/planAccess.ts e supabase/functions/_shared/planAccess.ts
  (monthly_access_pix e annual_access_pix já estão na lista). Se criar um id novo (ex.: semiannual_access_pix), adicionar nos DOIS arquivos.
- Página de vendas: /inicio (src/pages/InicioCreme.tsx) e quiz /onboarding (src/pages/Onboarding.tsx), que leva ao checkout. Componentes de preço: src/components/PricingAccordion.tsx, src/components/fabrica/FabricaUpgradeBlock.tsx.

O QUE QUERO
1. No painel da Woovi (pelo navegador): criar/pegar o App ID (API), configurar o webhook de cobrança paga (OPENPIX:CHARGE_COMPLETED) apontando para uma nova Edge Function do Supabase, e anotar o segredo/assinatura do webhook. Não me peça para colar chaves no chat se puder configurar direto; segredos vão em Supabase → Edge Functions → Secrets (ex.: WOOVI_APP_ID, WOOVI_WEBHOOK_SECRET).
2. Criar a Edge Function "woovi-create-charge": recebe plano (mensal/semestral/anual) + e-mail do usuário logado, cria a cobrança Pix na API da Woovi (valor em centavos, correlationID único com user_id e plano) e devolve QR Code + copia-e-cola + link de pagamento.
3. Criar "woovi-webhook": valida a assinatura, confirma que a cobrança foi paga, e libera o acesso Elite igual ao abacatepay-webhook (profiles + subscriptions com product_id de Pix e data de expiração conforme o plano: 30, 180 ou 365 dias). Pix não é recorrente: tratar renovação (aviso antes de vencer).
4. No front: botão "Pagar com Pix" ao lado do cartão em /inicio, no fim do quiz e nos blocos de upgrade, abrindo um modal com QR Code, botão "Copiar código Pix", contador de expiração e confirmação automática (polling ou realtime) que leva para /fabrica quando pagar.
5. Testar ponta a ponta no ambiente de testes da Woovi antes de produção.

REGRAS QUE NUNCA PODEM SER QUEBRADAS
- A tabela crm_form_submissions tem leads REAIS: nunca apagar, truncar ou resetar.
- Isolamento por RLS (owner_id = user.id): nunca remover.
- Não mexer nas variantes antigas de arte V0–V5 (src/lib/fabrica-compose-art.ts).
- Há trabalho não commitado na branch feat/inicio-quiz-onboarding (39 arquivos). Não descartar. Pergunte antes de trocar de branch.

Comece verificando o painel da Woovi pelo navegador e me diga o que encontrou antes de alterar código.
```
