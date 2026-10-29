---
tags: [canva-viagem, vendas, quiz, onboarding]
criado: 2026-10-29
---
# Página de vendas `/inicio` e quiz `/onboarding`
← [[00 - Índice (comece aqui)]]

## O que foi criado
- **`/inicio`** (`src/pages/InicioCreme.tsx`, `InicioEntry.tsx`, `src/components/cv-cream/`) — página de vendas no estilo miqla.app (tons creme), comunicação adaptada para agências de viagens.
- **Login com Google** (`src/components/auth/GoogleSignInButton.tsx`, usado em `Auth.tsx` e `Login.tsx`).
- **Quiz de 18 etapas** em `/onboarding` (`src/pages/Onboarding.tsx`) que termina no checkout Stripe.
  - Respostas salvas em `localStorage` → `cv-onboarding-v1`; destino digitado em `sessionStorage` → `cv-onboarding-destino`.
  - Ofertas (`ELITE_OFFER`): mensal **R$97**, semestral **R$347**, anual **R$482** (≈ R$40,16/mês). Preços do FAQ de SEO da home atualizados para os mesmos valores.

## Ponte quiz → Fábrica (`src/lib/onboarding-bridge.ts`)
Para o assinante não começar do zero:
- O destino do quiz vira o primeiro destino da Fábrica (só se ela estiver vazia). Grupos: praia → Porto de Galinhas, serra → Gramado, internacional → Cancún, cruzeiro → "Cruzeiro pelo litoral", excursão → "Excursão de fim de semana".
- O "momento da agência" vira `agencyType`: começando/pouco → `autonoma`, todo mês → `pequena`, equipe → `media`.
- Aplica uma vez só (marca `cv-onboarding-aplicado`) e mostra o toast *"Trouxemos X do seu quiz…"*.
- Quem **já assina** e entra em `/inicio`, `/onboarding` ou na home com quiz pendente é levado direto para `/fabrica`.

## Pendências desta parte (do lado do Lucas)
- Configurar a URL de retorno dos Payment Links do Stripe para `https://canvaviagem.com/fabrica`.
- Ativar o provedor Google no Supabase Auth (OAuth).
