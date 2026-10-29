---
tags: [canva-viagem, checkout, pix, woovi, stripe, prompt]
criado: 2026-10-29
---
# Página de pagamento `/checkout` (Cartão + Pix) e mensagem para o agente da Woovi
← [[00 - Índice (comece aqui)]] · complementa [[05 - Contexto para nova conversa (Pix Woovi)]] e [[06 - Contexto para nova conversa (acesso, assinatura e bloqueio)]]

## O que foi feito (29/10, sem commit)
- **`/checkout?plano=monthly|semiannual|annual&metodo=cartao|pix`** (`src/pages/Checkout.tsx`): duas abas tipo rádio — **Cartão de Crédito** (padrão) e **Pix** —, resumo com preço grande, troca de plano por chips, "Total devido hoje", garantia. Celular primeiro: preço + chips em cima, formulário logo abaixo, detalhes no fim.
- **Cartão** (`src/components/checkout/CardPanel.tsx`): chama `create-checkout` com `ui_mode: "embedded"`. Se vier `clientSecret` → formulário da Stripe **dentro da página**. Se vier só `url` (função ainda não republicada) ou der erro → botão "Continuar para o cartão" com o link da Stripe já identificado (`client_reference_id` + e-mail). Nunca fica sem saída.
- **Pix** (`src/components/checkout/PixPanel.tsx`): CPF/CNPJ com máscara e validação de dígitos → "Gerar Pix de R$ X →" → QR Code + copia-e-cola + contador + confirmação automática a cada 4 s → `/fabrica`. Se a função não responder: aviso âmbar com "Pagar no cartão".
- **Quiz** (`src/pages/Onboarding.tsx`): "Começar com o {plano}" agora vai para `/checkout?plano=…` em vez de abrir a Stripe direto.
- **`create-checkout`** (Edge Function): aceita `ui_mode: "embedded"` → cria sessão `ui_mode: "embedded"` com `return_url` em `/obrigado` e devolve `{ clientSecret }`; hospedado continua igual. **Precisa ser republicada no Supabase.**
- Rota em `src/App.tsx` (sem sidebar). No localhost a tela fica visível mesmo para assinante, para testes.

## Testado no navegador (admin, localhost)
Computador e celular 390px: abas alternam e atualizam a URL; aba Cartão mostra o botão de fallback (função de produção ainda sem modo embutido); aba Pix: CPF inválido bloqueado com mensagem, CPF válido habilita, "Gerar Pix" chama `woovi-create-charge` (ainda não publicada → aviso com "Pagar no cartão"). Sem rolagem lateral, zero erros de console além do esperado da função ausente.

## Mensagem para colar no agente da Woovi
```
Coordenação com o outro agente (Claude, na mesma pasta do projeto). Ele criou a página de pagamento e você só precisa ligar a Woovi por trás. Não mexa nos arquivos dele; ele não mexe nos seus.

ARQUIVOS DELE (não editar): src/pages/Checkout.tsx, src/components/checkout/{CardPanel.tsx, PixPanel.tsx, checkout-plans.ts}, e a mudança de ui_mode em supabase/functions/create-checkout/index.ts.
ARQUIVOS SEUS (ele não toca): src/components/pix/PixCheckout.tsx, src/pages/PixCheckout.tsx, supabase/functions/woovi-*, _shared/woovi*.ts, supabase/config.toml.

COMO A PÁGINA /checkout FALA COM VOCÊ
1. woovi-create-charge — body: { plan: "monthly"|"semiannual"|"annual", taxId: "<11 ou 14 dígitos>" } com Authorization: Bearer <sessão>.
   Resposta esperada: { correlationID, value, brCode, qrCodeImage, paymentLinkUrl, expiresDate }.
   taxId é novo: hoje sua função ignora; use-o para o Pix Automático (mandato recorrente exige CPF/CNPJ do pagador). Valide no servidor também (dígitos verificadores).
2. woovi-charge-status — body: { correlationID } → { status: "COMPLETED" | ... }. A página consulta a cada 4 s e, em COMPLETED, chama refreshSubscription() e vai para /fabrica.
3. Quando o Pix Automático (recorrente) estiver funcionando de verdade, avise: existe a constante PIX_RENOVA_SOZINHO = false em src/components/checkout/PixPanel.tsx; ao virar true a aba passa a se chamar "Pix Automático · paga agora e renova sozinho" e o texto muda. Enquanto for false a página diz a verdade: paga o período e avisamos por e-mail antes de vencer.

O QUE FALTA DO SEU LADO
- Publicar woovi-create-charge, woovi-charge-status, woovi-webhook, woovi-renewal-reminder no Supabase e configurar os secrets (WOOVI_APP_ID, WOOVI_WEBHOOK_SECRET). Hoje a página recebe "Failed to send a request to the Edge Function".
- No webhook: upsert em subscriptions com billing_provider "pix", product_id de Pix Elite, status "active" e current_period_end = pagamento + 30/180/365 dias. Sem data de vencimento é proibido. Identificar o usuário pelo user_id do correlationID, não só pelo e-mail.
- Seu PayWithPixButton (quiz, Inicio2, FabricaUpgradeBlock) pode passar a navegar para /checkout?plano=<plan>&metodo=pix em vez de abrir o modal — assim só existe um lugar de pagamento. Decida com o Lucas.

REGRAS: nunca apagar/truncar crm_form_submissions; nunca remover RLS; npx tsc --noEmit (0 erros) + npx vite build antes de commit; commit/push só com autorização do Lucas; push na main publica (Lovable). Há trabalho dele sem commit na pasta — commitar sempre por caminho (pathspec), nunca `git add -A`.
```

## Para o Lucas
- Republicar a função `create-checkout` no Supabase para o cartão aparecer embutido (até lá o botão de fallback funciona).
- Depois disso, testar em produção: `/onboarding` → "Começar com o Mensal" → `/checkout` → aba Cartão mostra o formulário da Stripe; pagar com cartão de teste **não** é possível em chave live — fazer um pagamento real pequeno ou usar a chave de teste no ambiente local.
- Lovable: um push na `main` atualiza o projeto, mas o site publicado só troca depois de **Publish → Update** no painel do Lovable (20 min após o push, `canvaviagem.com` ainda servia o pacote antigo).
