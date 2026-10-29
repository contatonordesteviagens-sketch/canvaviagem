---
tags: [canva-viagem, fabrica, indice, historico]
criado: 2026-10-29
branch: feat/inicio-quiz-onboarding
status: não commitado (aguardando aprovação do Lucas para rebase + push)
---
# Fábrica, Início e Quiz — rodada de usabilidade (out/2026)

**Objetivo do Lucas:** nenhum assinante renovava porque a ferramenta era difícil. Missão: deixar a Fábrica e o Início tão fáceis que até um leigo gere site, arte e carrossel sozinho, e tornar a plataforma indispensável para quem assina.

## Notas
1. [[01 - Página de vendas e quiz]] — `/inicio` (estilo miqla) + quiz `/onboarding` → Stripe
2. [[02 - Fábrica - correções e facilidades]] — anúncio, carrossel, site, CRM, áudio, pacotes, tutoriais
3. [[03 - Início (home) e mobile]] — busca, círculos, banners, barra inferior, testes iPhone/Android
4. [[04 - Regras, pendências e como publicar]] — o que nunca fazer, o que falta, passo a passo do deploy
5. [[05 - Contexto para nova conversa (Pix Woovi)]] — prompt para adicionar Pix pela Woovi
6. [[06 - Contexto para nova conversa (acesso, assinatura e bloqueio)]] — prompt sobre liberação, vencimento, bloqueio e o erro "paguei e não recebi"
7. [[07 - Sites de quem não paga e visitas na Gestão]] — site sai do ar sem pagamento, redireciona para o Canva Viagem; por que as visitas zeravam
8. [[08 - Página de pagamento (cartão + Pix) e mensagem para o agente da Woovi]] — `/checkout` com abas Cartão (Stripe embutida) e Pix (Woovi), e a mensagem de coordenação

## Em 6 linhas
- 39 arquivos alterados em `src/` + `supabase/functions`, **tudo sem commit** na branch `feat/inicio-quiz-onboarding`.
- `npx tsc --noEmit` = 0 erros; `npx vite build` passa.
- Maior bug encontrado: **presets globais de ajuste da arte** salvos com conteúdo de Noronha quebravam as artes de todos os clientes (preço sumindo, título errado). Corrigido.
- Fábrica ganhou: checklist "Primeiros passos", mini-tutorial por tela, pacote criado em uma frase, quiz que preenche a Fábrica.
- Início: busca no centro com sugestões, 8 círculos + "Mais", 1 banner, barra do celular por prioridade.
- Mobile: 5 bloqueios reais corrigidos (CRM, menu, abas, logo, ampliar).

## Contexto técnico rápido
- Projeto: `c:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26` (React + Vite + TS + Tailwind + Supabase).
- Produção: push na `main` do remote `origin` → Lovable publica. **Nunca Vercel.**
- Teste no navegador: `agent-browser` com conta admin em `canvaviagem.com/admin-login`.
- Nota anterior relacionada: [[historico_06_agosto_2026]].
