# 📋 RELATÓRIO TÉCNICO DE ERROS DE GERAÇÃO

Este documento lista os erros que a IA cometeu repetidamente e que devem ser erradicados.

### 1. Letras e Títulos (Truncamento)
*   **Problema:** Títulos como "Pacote para..." sem o nome do destino.
*   **Causa:** Prompt mal formatado que corta o texto no meio da geração.
*   **Solução:** Forçar a IA a receber a string completa do destino no prompt principal.

### 2. Ícones e Poluição (Redundância)
*   **Problema:** Múltiplos ícones de avião/ônibus dentro do card amarelo.
*   **Causa:** Instruções duplicadas em diferentes camadas do prompt mestre.
*   **Solução:** Unificar a instrução do card para "Clean Design - No Icons".

### 3. Falta de Variação (Artes Gêmeas)
*   **Problema:** Gerar a mesma imagem 3 vezes seguidas.
*   **Causa:** O campo 'variation' (seed) não está mudando entre os cliques.
*   **Solução:** Implementar Math.random() no backend para cada requisição.

### 4. Presença Humana (Modelos)
*   **Problema:** Fotos com pessoas e casais em vez de focar no destino.
*   **Causa:** A IA assume que "turismo" envolve pessoas.
*   **Solução:** Injetar prompt negativo rigoroso de "No People".

### 5. Enquadramento (Safe Zone)
*   **Problema:** Preço e títulos cortados nas bordas do Story.
*   **Causa:** Falta de margens de segurança no layout vertical.
*   **Solução:** Recalcular o centro do layout para o formato 9:16.
