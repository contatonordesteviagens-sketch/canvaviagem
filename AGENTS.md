# Canva Viagem — Master Context & Project Unification

> **IMPORTANTE PARA A INTELIGÊNCIA ARTIFICIAL:** Este arquivo unifica o projeto principal do Canva Viagem com o Painel de Marketing. Sempre que o usuário falar em "email marketing", "painel de mkt" ou "campanhas de e-mail", consulte os caminhos e regras listados aqui.

---

## 📁 Projetos Vinculados

### 🖥️ 1. Canva Viagem — Portal SaaS (Workspace Ativo)
*   **Caminho Local:** `c:\Users\win 10\Desktop\CANVA_VIAGEM_ESTAVEL_24_ABRIL`
*   **Tecnologia:** React + Vite + TypeScript + Tailwind CSS.
*   **Comando de Desenvolvimento:** `npm run dev`
*   **Comando de Build (Produção):** `npm run build` (Flawless compile: 0 errors).
*   **Última Modificação:** Adicionadas colunas automáticas de **Plano** e **Valor** na visualização da tela de usuários e no arquivo CSV exportado em `useActiveUsers.ts` e `UsersSection.tsx`.

### 📧 2. Central de Email Marketing / Painel de Mkt
*   **Caminho Local:** `C:\Users\win 10\email marketing`
*   **Tecnologia:** HTML5/CSS3 (Painel Estático Vercel) + NodeJS/ESM (Scripts de API).
*   **URL de Produção:** `https://painel-marketing-lf.vercel.app/`
*   **Deploy para Produção:** `cd "C:\Users\win 10\email marketing" && npx vercel --prod`
*   **Servidor Local (Dashboard + Edição de Templates):**
    *   **Comando:** `node "C:\Users\win 10\email marketing\server.mjs"`
    *   **Endereço:** `http://localhost:3000` (Iniciado em segundo plano e testado com sucesso).

---

## 📊 Campanhas de E-mail & Segmentações Integradas

Os dados do Stripe (faturamento e clientes) foram cruzados com o Banco de Dados do Canva Viagem e importados com sucesso na API da **Brevo** (limite diário de 100 envios seguros na conta gratuita).

### 📈 Campanha 1: Upgrade Start para Elite
*   **Brevo List ID:** `43`
*   **Total de Contatos:** `33 contatos` (Assinantes ativos do Plano Start R$97 para upgrade ao Elite R$197).
*   **Planilha em Downloads:** `lista_1_upgrade_start.csv`

### 🚨 Campanha 2: Recuperação de Carrinhos Abandonados
*   **Brevo List ID:** `44`
*   **Total de Contatos:** `20 leads` (Abandonos de carrinho antigos).
*   **Planilha em Downloads:** `lista_2_recuperacao_abandonos.csv`

### 🔍 Destaque de Bug: Sidney de Oliveira
*   O e-mail digitado no Stripe foi `aerodestinosbr@gmail.con` (com N no final). O e-mail correto é `.com`, justificando a perda de acesso. A nova aba de buscas do painel destaca este e-mail em vermelho para contato ativo.

---

## 🛠️ Comandos Rápidos do Painel de Mkt

Rode os comandos abaixo diretamente a partir do terminal (ou informando à IA):

| Comando | O que faz |
|---------|-----------|
| `node "C:\Users\win 10\email marketing\importar-listas-novas.mjs"` | Puxa planilhas de Downloads, segmenta, cria as listas no Brevo, importa os contatos e gera o JSON do Painel. |
| `node "C:\Users\win 10\email marketing\server.mjs"` | Inicializa o painel local na porta 3000. |
| `node "C:\Users\win 10\email marketing\gerar-recuperacao-json.mjs"` | Atualiza o arquivo de recuperação de checkout da Hotmart. |
| `cd "C:\Users\win 10\email marketing" && npx vercel --prod` | Envia as alterações salvas para o painel de produção da Vercel. |

---

## 🎨 Fábrica de Anúncios, Carrosséis e Variantes — Conhecimento & Skills

> **REGRA DE ROTEAMENTO INSTANTÂNEO:** Sempre que o usuário mencionar **"criação de artes"**, **"criação de anúncios"**, **"carrosséis"**, **"variantes"**, **"imagens"** ou **"ajustes finos"**, consulte imediatamente os diretórios e manuais abaixo antes de alterar o código (`src/lib/fabrica-compose-art.ts`, `Phase3ArtFactory.tsx` ou `F1CarouselBuilder.tsx`):

### 📂 Manuais Mestres e Skills Operacionais
1. **Manual Mestre de Replicação e Anatomia:** `docs/fabrica/AGENTE_VARIANTES_IMAGENS.md` (Explica como replicar referências visuais por foto, mapeamento de campos no formulário e anatomia V0-V8).
2. **Skill Operacional de Ajustes Finos:** `docs/fabrica/skills/variant-agent-training.md` (Protocolo exato para traduzir prints/pedidos em tokens de `Y` em px, auto-shrink, nomes compostos sem quebra ruim e regras anti-sobreposição).
3. **Bíblia Técnica do Motor Canvas:** `C:\Users\win 10\Desktop\FABRICA_ISOLADA\geração de imagens engenharia como funciona\DOC_ENGENHARIA_MOTOR_CANVAS.md` (Leis da física do Canvas, sistema de tokens, cálculo `TOTAL_VARIANTS` e roteamento puro).
4. **Raio-X de Ramos V0-V5:** `C:\Users\win 10\Desktop\FABRICA_ISOLADA\geração de imagens engenharia como funciona\GERAÇÃO IMAGENS  FABRICA  - 16_06.md` e `docs/fabrica/KNOWLEDGE_AD_FACTORY.md` (Zonas de segurança de 580px no Story, rodapés escuros com texto branco em negrito e ícones com recorte real `cutout`).
5. **Carrosséis F1 (`F1CarouselBuilder.tsx`):** Criação sequencial de 3 a 7 slides (Feed 4:5 ou Story 9:16) nos modelos *Impacto*, *Roteiro* e *Editorial*, consumindo exclusivamente os fatos do `Pacote`.

### ⚡ Regras de Ouro (Invioláveis)
* **Nunca refatore V0-V5 para corrigir V6+ ou novas variantes.** Altere somente o branch específico `if (variant === N)`.
* **TOTAL_VARIANTS é a única fonte de verdade:** Mudar sem implementar o branch faz o índice cair em V0.
* **Preços Varejistas e Faixas PIX:** Símbolo `R$` no topo esquerdo e centavos `,90` no topo direito em fonte menor; número principal gigante auto-reduzível em loop `while`. A faixa PIX só existe se `showPixBanner` for verdadeiro.

