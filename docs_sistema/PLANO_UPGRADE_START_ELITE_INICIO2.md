# Plano de Upgrade Start -> Elite

Data: 2026-06-20

## Regra comercial validada neste ajuste

- Plano Start: libera Canva Viagem e ferramentas gerais, mas nao libera Fabrica.
- Plano Elite: libera Canva Viagem + Fabrica.
- Hotmart: produto atual tratado como Elite.
- Stripe: Start continua Start; Elite continua Elite.
- Oferta Elite usada no front:
  - Mensal: R$ 97/mes.
  - Anual: R$ 347/ano.
  - Equivalente anual: R$ 28,91/mes.
  - Economia comparada ao mensal por 12 meses: R$ 817.

## Regra de rota

Todo CTA de upgrade dentro dos bloqueios da Fabrica deve apontar para `/inicio2`.

Nao usar `/inicio` para upgrade da Fabrica, porque essa rota ficou como pagina antiga/publica e gera confusao comercial.

## Fluxo de conversao

1. Usuario sem assinatura:
   - Deve ver bloqueio claro do Plano Elite.
   - Nao precisa receber video obrigatorio na primeira abordagem.
   - CTA principal leva para `/inicio2`.

2. Usuario Start tentando acessar Fabrica:
   - Primeira abordagem mostra video da pagina `/inicio2`.
   - O video fica salvo em localStorage por 30 minutos.
   - Dentro desse intervalo, as proximas abordagens mostram versao mais direta, sem video.
   - Objetivo: explicar valor uma vez, depois reduzir atrito.

3. Usuario Elite ou admin:
   - Nao deve ver bloqueio.
   - Deve acessar Fabrica normalmente.

## Arquivo central da oferta

Os valores e URLs ficam centralizados em:

- `src/lib/eliteOffer.ts`

Qualquer mudanca futura de preco, checkout ou video deve ser feita primeiro nesse arquivo e depois revisada nas paginas que exibem texto longo.

## Arquivos ajustados

- `src/components/PremiumGateModal.tsx`
- `src/components/SubscriptionGate.tsx`
- `src/pages/Fabrica.tsx`
- `src/pages/FabricaES.tsx`
- `src/pages/Inicio2.tsx`
- `src/lib/eliteOffer.ts`

## Observacao critica

Este ajuste nao altera banco, RLS, webhook, assinaturas ou dados dos usuarios. Ele altera apenas experiencia de bloqueio, copy, precos exibidos e destino dos CTAs.
