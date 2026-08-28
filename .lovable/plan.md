# Auditoria de liberação de acesso (Canva + Fábrica) e correções

## Resumo em linguagem simples

O servidor está **certo**. Quem manda de verdade (as funções do backend) só libera a Fábrica para **Elite** e admin. Start e grátis são bloqueados lá.

O problema está no **navegador (frontend)**: existem 3 "portas destrancadas" que deixam o usuário ver e usar coisas antes/apesar do servidor dizer não. É por isso que parece que "está liberado pra todo mundo".

## Como está hoje (verificado no código)

Regra de produto (`src/lib/planAccess.ts` + `supabase/functions/_shared/planAccess.ts`):

- **Start**: `prod_TkvaozfpkAcbpM`, `start_ticto`, `monthly_access_ticto`
- **Elite**: `prod_UTFsXcKq8m0mol` (mensal), `prod_UTSmPe3GPt8iHt` (anual), `prod_UTFlCWzNqvqSNx`, `hotmart_elite`, `elite_ticto`, `monthly_access_pix`, `annual_access_pix`

Servidor (`supabase/functions/fabrica-entitlements/index.ts:58-89`):

```text
admin ....... tudo
elite ....... tudo (fabrica.open, ad/carousel export, site.publish, vendedor, crm real)
start ....... só: library.premium.open, premium_content.open, tools.basic.use,
              voice.use, photos.search   -> SEM Fábrica
free/guest .. nada
```

Todas as 9 edge functions da Fábrica (`fabrica-generate-ad`, `fabrica-search-photos`, `fabrica-design-ai`, `fabrica-edit-photo`, `fabrica-transcribe-audio`, `fabrica-extract-business-info(-v2)`, `fabrica-pexels-search`, `vendedor-generate-response`) exigem Elite — inclusive `verifyFabricaAuthenticatedAccess`, que é apenas um apelido de `verifyFabricaEliteAccess` (`_shared/fabricaAccess.ts:14-16`).

Rotas: `/fabrica`, `/fabrica/*`, `/es/fabrica*`, `/vendedor-ia` usam `requireElite`; o resto do Canva usa `requireSubscription` (`src/App.tsx:235-325`).

## Os 3 furos encontrados (frontend)

### Furo 1 — Start baixa arte/carrossel sem limite
`src/contexts/EntitlementsContext.tsx:317-320`

```ts
const entitledLocally = isAdmin
  || snapshot.capabilities.unlimited
  || Boolean(snapshot.capabilities[exportCapability])
  || subscription.subscribed;   // <- qualquer assinante, inclusive Start
```

Como `subscribed` é `true` para Start, o app libera o download **sem nem perguntar ao servidor**. O servidor responderia 403 "Plano Elite necessário".

### Furo 2 — Janela "otimista" libera Fábrica para usuário grátis
`src/contexts/EntitlementsContext.tsx:117-149`

Enquanto a checagem de assinatura está carregando (pode levar 4-5s), **qualquer usuário logado** recebe `fabrica.open`, `ad.export`, `site.publish` = true. Nesse intervalo a Fábrica abre para quem nunca pagou.

### Furo 3 — `can()` re-amplia permissões
`src/contexts/EntitlementsContext.tsx:299-307`

```ts
|| (subscription.subscribed && Boolean(fallback.capabilities[capability]))
```

Qualquer assinante ativo passa a usar o cálculo local em vez do veredito do servidor. Junto com o Furo 2, isso mantém a porta aberta.

Observação: `isLocalPreviewEnabled()` (localhost) ignora todos os guards, mas só funciona em `localhost` — não é furo em produção.

## O que vou corrigir

1. **`reserve()`**: trocar `|| subscription.subscribed` por checagem de Elite de verdade (`hasEliteAccess(subscription)` / `isAdmin`). Start passa a receber o modal de upgrade em vez do download.
2. **Janela otimista**: no estado `subscription.loading`, manter apenas capacidades de nível Start (biblioteca, conteúdo premium, ferramentas básicas) e deixar **todas** as capacidades de Fábrica em `false`. Nada de Fábrica antes do servidor confirmar.
3. **`can()`**: restringir a cláusula de fallback às capacidades compatíveis com o plano real (Elite → tudo; Start → só as de Start), em vez de aceitar qualquer `subscribed`.
4. **Redirecionamento**: garantir que Start/grátis que tentam `/fabrica` caiam no bloqueio com upsell (`FabricaUpgradeBlock` / `UpgradePromptDialog`) em vez de redirecionar direto para `/inicio` sem explicação — `ProtectedRoute` com `requireElite` hoje manda para `/inicio` silenciosamente.
5. **Teste de contrato**: estender `scripts/validate-paid-access-contract.mjs` com casos explícitos:
   - Start `prod_TkvaozfpkAcbpM` → Canva sim, Fábrica não, export não
   - Elite `prod_UTFsXcKq8m0mol` / `prod_UTSmPe3GPt8iHt` → tudo sim
   - Grátis logado → nada

## Detalhes técnicos

- Arquivos alterados: `src/contexts/EntitlementsContext.tsx` (principal), `src/components/ProtectedRoute.tsx` (rota Elite → tela de upsell), `scripts/validate-paid-access-contract.mjs`.
- Nenhuma mudança no backend é necessária: as regras do servidor já estão corretas. Nada de migration.
- Nenhum assinante Elite perde acesso: `hasEliteAccess` cobre os 7 IDs Elite atuais, incluindo Hotmart/Ticto/PIX.
