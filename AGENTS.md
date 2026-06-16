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
