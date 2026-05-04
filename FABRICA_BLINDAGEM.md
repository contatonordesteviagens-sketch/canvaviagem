# 🛡️ Relatório de Blindagem: Fábrica de Anúncios Canva Viagem

Este documento registra as medidas técnicas de "blindagem" (hardening) implementadas para garantir a estabilidade definitiva do motor de renderização de anúncios e evitar falhas recorrentes.

## 1. Blindagem de Dados (Data Guardrails)
O motor `composeTravelAd` agora possui uma camada de **higienização imutável** na entrada. 
- **O que faz:** Se o modo `isExperience` estiver ativo, o sistema anula automaticamente qualquer dado de preço, parcelamento ou banners de oferta (Pix, Total).
- **Por que:** Impede que "restos" de estado de uma geração anterior (ex: um pacote de oferta) vazem para um anúncio de experiência de luxo. Mesmo que o frontend envie o dado por erro, o motor o ignora.

## 2. Blindagem Visual (Safe Zone Enforcement)
Centralização das regras de layout em um objeto `RULES` imutável.
- **Story (9:16):**
  - `SAFE_BOTTOM`: 480px (Proteção contra barra de resposta do Instagram).
  - `SAFE_TOP`: 280px (Proteção contra header de Stories).
- **Square (1:1):**
  - `SAFE_BOTTOM`: 120px.
- **Ação:** Todas as variantes (V0-V4) utilizam agora o `panelBottom` derivado destas regras, tornando impossível que o conteúdo dinâmico colida com elementos de interface do Instagram.

## 3. Blindagem de Roteamento (Logic Isolation)
O roteamento de variantes foi movido para o topo da função principal.
- **Impacto:** Eliminamos múltiplos `if (isExperience)` espalhados pelo código. Agora existe um "Gatekeeper" único que decide se o anúncio segue o fluxo de **LUXO (Experiência)** ou **CONVERSÃO (Oferta)**.

## 4. Histórico de Versões da Blindagem
- **v1.0 (Atual):** Implementação de sanitização de estado e centralização de regras de segurança. Estabilização das variantes V0-V4.

---
*Assinado: Antigravity AI Engine (Google DeepMind Team)*
