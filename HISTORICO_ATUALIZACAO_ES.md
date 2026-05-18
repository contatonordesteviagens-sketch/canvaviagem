# 📝 Histórico de Atualizações - Canva Viagem (Localização ES & Sincronização)

Este documento registra as modificações, correções e melhorias de infraestrutura realizadas para o lançamento internacional da plataforma **Canva Viagem** no mercado da América Latina (LATAM).

---

## 🚀 1. Localização e Correção de Preços (Espanhol)

Realizamos uma faxina e tradução completa na página de vendas em espanhol ([SalesPageES.tsx](file:///c:/Users/win%2010/Desktop/CANVA_VIAGEM_ESTAVEL_24_ABRIL/src/pages/SalesPageES.tsx)), que serve a rota `/es/planos`.

### 💵 Padronização Monetária (USD)
*   Substituímos todos os valores e símbolos em Real brasileiro (`R$`) por Dólar americano (`$`), alinhando o checkout com as ofertas internacionais.
*   **Novas Tarifas Aplicadas:**
    *   **Plano Elite Anual:** de `R$ 28,91/mês` para **`$ 17.33 USD/mes`** (faturado anualmente a `$ 208.00 USD`).
    *   **Plano Elite Mensal:** de `R$ 97,00/mês` para **`$ 29.90 USD/mes`**.
    *   **Plano Start Anual:** de `R$ 16,41/mês` para **`$ 9.83 USD/mes`** (faturado anualmente a `$ 118.00 USD`).
    *   **Plano Start Mensal:** de `R$ 29,90/mês` para **`$ 17.00 USD/mes`**.

### ✍️ Tradução Completa do FAQ e Ancoragem
*   **FAQ Localizado:** Todas as perguntas e respostas frequentes que ainda estavam em português foram traduzidas para o espanhol nativo.
*   **Caixa de Ancoragem de Preço:** Traduzido o bloco de valor percebido de português para espanhol, ajustando também os valores de ganho estimado para dólares:
    *   *Antes:* *"1 pacote vendido pelo feed: R$ 3.500 a R$ 8.000 de lucro"*
    *   *Depois:* *"1 paquete vendido por el feed: $ 700 a $ 1,500 USD de ganancia"*
*   **Remoção de Dados Regionais:** O CNPJ brasileiro (`CNPJ: 45.312.876/0001-22`) foi removido do banner de pagamento do Stripe, substituído por um padrão internacional limpo de segurança SSL.

---

## 🔀 2. Sincronização de Branches e Deploy

Identificamos que o serviço **Lovable** e a pipeline de deploy na nuvem utilizam a branch **`main`** como base, enquanto as atualizações locais estavam sendo commitadas na branch **`master`**.

### 🛠️ Ações de Sincronização Executadas:
1.  Salvamento e commit das alterações locais na branch `master`.
2.  Transição segura para a branch `main`: `git checkout main`.
3.  Mesclagem rápida das novidades: `git merge master`.
4.  Envio e deploy imediato: `git push origin main` atualizando o repositório remoto.
5.  Retorno ao ambiente original: `git checkout master`.

Agora, as novidades estão publicadas em tempo real tanto no GitHub quanto no painel do Lovable!

---

## 🔊 3. Setup de Pareamento de Voz (Microsoft Daniel 2x)

Para melhorar a dinâmica de pair programming, criamos um script auxiliar de síntese de voz nativo do Windows PowerShell em [speak.ps1](file:///C:/Users/win%2010/.gemini/antigravity/brain/9d76eedd-9c45-4ad5-910e-067300efd19c/scratch/speak.ps1).

*   **Voz Ativa:** `Microsoft Daniel` (pt-BR).
*   **Velocidade:** Configurada em taxa de reprodução de `5` (equivalente ao dobro da velocidade normal - 2x).
*   **Fallback:** O script possui tratamento de erros e fallback automático para qualquer voz em português ou padrão do sistema disponível.

---

> [!NOTE]
> Todos os arquivos de código-fonte foram verificados através de testes estáticos com `npx tsc --noEmit` e compilados em ambiente de produção via `npm run build` com **sucesso absoluto (zero erros)**.
