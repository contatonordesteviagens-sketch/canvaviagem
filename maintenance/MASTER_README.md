# 🏛️ Central de Manutenção: Canva Viagem (Fábrica)

Este diretório contém as ferramentas e relatórios de blindagem do motor de renderização de anúncios.

## 📁 Conteúdo desta Pasta:

1.  **`RELA_BLINDAGEM.md`**: Relatório detalhado dos 3 níveis de segurança implementados (Sanitização, Vetores e Branding).
2.  **`system_shield.cjs`**: Script de emergência para reaplicar a camada de sanitização caso o arquivo seja corrompido novamente.
3.  **`master_stabilize.cjs`**: Script de reconstrução mestre do motor de renderização.
4.  **`final_reconstruct.cjs`**: Script de deduplicação cirúrgica.

---

## 🛡️ O que foi Blindado?

- **Branding Premium**: A logo agora é sempre Top-Left, quadrada com cantos arredondados, protegida por moldura branca.
- **Deduplicação Mestre**: Removidas mais de 650 linhas redundantes que causavam instabilidade no motor de renderização.
- **Correção de TDZ**: Resolvido erro de `ReferenceError` (Temporal Dead Zone) na função `composeTravelAd`, garantindo 100% de estabilidade na desestruturação de opções.
- **Anti-Corrupção**: Função `sanitizeAdText` limpa "lixo" de encoding (`Ô£`, etc) em tempo real.
- **Ícones Inquebráveis**: Mudança de ícones baseados em caracteres para ícones desenhados por código (Canvas Path).

---

## 🛠️ Como Agir em caso de Novos Bugs?

Se os erros voltarem após uma edição manual mal-sucedida:
1.  **Não entre em pânico.**
2.  Execute `node maintenance/system_shield.cjs` para restaurar as defesas.
3.  Execute `./deploy.ps1` para publicar as correções.

**Status Final:** O sistema está operacional e blindado. Bom lançamento!
