---
name: anuncio-f1-carrossel
description: Ajustes e criação de slides nos carrosséis da Fábrica F1 do Canva Viagem (F1CarouselBuilder). Ative quando o usuário falar em "carrossel", "slides", "modelo Impacto/Roteiro/Editorial" dentro do F1 / anúncio F1.
---

# Carrossel F1 — F1CarouselBuilder

Arquivo único: `src/components/fabrica/F1CarouselBuilder.tsx`.
**Não confundir com as variantes V0–V8** de `src/lib/fabrica-compose-art.ts` — são motores separados. Pedido sobre "variação/V1/V8" → skill `anuncio-f1-ajustes`. Pedido sobre "slides/carrossel" → aqui.

## Regras
- 3 a 7 slides, formatos Feed 4:5 e Story 9:16.
- Modelos: **Impacto**, **Roteiro**, **Editorial**.
- O conteúdo vem exclusivamente dos fatos do `Pacote` — nunca inventar destino, preço, data ou cidade de origem.
- Cada modelo tem seu bloco próprio: altere só o modelo pedido, os outros ficam intactos.
- Todo texto de usuário passa por utilitário de auto-shrink; nunca `ctx.fillText` cru.
- Safe zones: laterais mín. 65px; no Story, 250px livres no topo e na base.
- Props de preview (`ScaledSlidePreview`) precisam receber tudo que o slide usa (ex.: `showPixBanner`, `pixBannerText`) — prop faltando quebra o build.
- Este arquivo já sofreu corrupção de JSX no passado: ao editar, confira o pareamento de tags (`</div>` vs `</button>`) antes de finalizar.

## Procedimento
1. Localizar o modelo e o índice de slide alvo com `rg -n` antes de editar.
2. Reescrever o pedido: `MODELO / FORMATO / SLIDE / ELEMENTO / MUDANÇA / NÃO ALTERAR`.
3. Edição mínima, entregar diff.
4. `npx tsc --noEmit`.
5. Validar visualmente 3, 5 e 7 slides nos dois formatos.

Conversão de medidas e vocabulário ("sobe 2px", "1 cm = 40px", "espaçar") seguem a skill `anuncio-f1-ajustes`.
