# Diagnóstico: pagamento Pix (Woovi) e Purchase na Meta

Primeiro diagnóstico (deploy): o build passa ("built in 21.53s"), e canvaviagem.com já serve o index.html novo, com cvEhFluxoES. As tags noscript também estão no index.html do repositório. Nenhuma publicação foi recusada. Se você ainda vê a versão antiga, é cache.

## 1. Como o pagamento funciona hoje
- A /black (InicioBlack.tsx) leva para o checkout. Dá para pagar por Pix (Woovi) ou por cartão (Stripe, função create-checkout).
- Pix: a tela PixPanel.tsx / PixCheckout.tsx chama a função woovi-create-charge, e o status é consultado pela woovi-charge-status (com woovi-sync-charges como reserva).
- O webhook da Woovi fica em supabase/functions/woovi-webhook/index.ts. Ele confere a assinatura e consulta a cobrança na Woovi. Depois chama savePixCharge e grantEliteFromCharge, em supabase/functions/_shared/woovi.ts, que liberam o Elite.

## 2. Purchase para a Meta hoje
- Navegador: quando o Pix é confirmado, o PixPanel/PixCheckout dispara fbq trackSingle "Purchase" com event_id `purchase_<correlationID>`. Isso vai para todos os SALES_PIXEL_IDS: 916689227676142, 2120347238758199, 4468467283440792, 1645968187276827 e 1824488118557875.
- Servidor: o woovi-webhook já envia Purchase pela Conversions API, mas só para o pixel 2120347238758199. Ele usa o mesmo event_id, valor e BRL, e manda só o e-mail com hash.
- Tokens salvos (só nomes): META_CAPI_TOKEN_2120347238758199, META_CONVERSIONS_API_TOKEN, META_CONVERSIONS_API_TOKEN_NEW. Não existe token para o 1824488118557875.

## 3. Dados salvos na compra Pix (tabela pix_charges)
- Ficam salvos: correlation_id, user_id, email, plano, valor, status, link de pagamento e datas.
- Não ficam salvos: telefone, nome, fbp/fbc, IP, user agent e UTM. Nome e telefone podem estar no perfil. As UTMs ficam em profiles/traffic_sources, mas não são ligadas à cobrança.

## 4. O que falta para o pixel 1824488118557875
1. Criar o token da Conversions API desse pixel no Gerenciador de Eventos e salvar como segredo (ex.: META_CAPI_TOKEN_1824488118557875).
2. No woovi-webhook, enviar o mesmo evento também para esse pixel. Pode ser uma lista de pixels e tokens, mantendo o event_id `purchase_<correlationID>`, o valor e a moeda BRL. A deduplicação com o navegador já funciona, porque ele usa o mesmo event_id.
3. Opcional, para melhorar a correspondência: guardar fbp/fbc, IP e user agent na hora de criar a cobrança (woovi-create-charge + colunas novas em pix_charges) e mandar tudo no user_data.
4. Publicar o woovi-webhook e conferir o evento em Testar eventos da Meta.
