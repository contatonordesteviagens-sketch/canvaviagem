---
tags: [canva-viagem, home, mobile, ux]
criado: 2026-10-29
---
# Início (home `/`) e mobile
← [[00 - Índice (comece aqui)]]

Testado em iPhone (390px) e Android (360px), além de desktop (1440px). Sem rolagem horizontal.

## Como o Início ficou organizado
- **Busca é o centro** (`HeroBanner.tsx`): sugestões de um toque (Maragogi, Maldivas, Gramado, Porto de Galinhas, Cancún, Orlando, Jericoacoara) e botão de limpar.
- **Resultados** (`Index.tsx`): título "Resultados para Maragogi · 3 vídeos e 2 legendas"; vídeos com capa primeiro (antes apareciam cartões roxos vazios); sem resultado → botão "Criar anúncio de X" na Fábrica.
- **Círculos** (`CategoryNav.tsx`): de 16 para **8 principais** — Destaques, Fábrica, Vídeos Reels, Feed & Stories, Ofertas & Legendas, Pacotes de Vídeos, Aulas, Favoritos — e o resto atrás de "Mais (N)". Círculos de 56px.
- **Banners:** de 5 para **1** (o da Fábrica). Os 4 "F1–F4" repetiam menu, círculos e atalhos.
- **Barra inferior do celular** (`BottomNav.tsx`), por prioridade: **Início · Fábrica · Vídeos · Artes · Clientes** (ponto vermelho com lead novo). Botões de 52px (`Dock.tsx`).
- **Menu lateral** (`SidebarNav.tsx`) em grupos: Criar com a Fábrica · Clientes · Conteúdo pronto · Aprender · Minha conta.
- Popup de boas-vindas: "Agora não" e fecha com Esc.

## Regra de admin
O único item que vazava para assinantes era a sincronização de migração com aviso técnico — agora só roda para admin e só avisa se atualizou algo.

## 5 bloqueios do celular corrigidos (Fábrica)
1. **CRM:** a tabela tinha 716px e o botão de WhatsApp ficava fora da tela → no celular virou cartões com botão verde "Chamar no WhatsApp" de 44px.
2. **Menu da Fábrica não fechava no X** (fundo escuro por cima do cabeçalho) → corrigido + tecla Esc.
3. **"Meus Pacotes" sumia das abas** no Android → a aba ativa rola sozinha até aparecer; abas de 38px; degradê indica mais à direita.
4. **Anúncio:** "Remover/Trocar logo" só aparecia com mouse → sempre visível; "Excluir esta versão" discreto e com confirmação.
5. **Carrossel:** "Ampliar imagem" só com mouse → sempre visível; zoom só no computador.

Extras: prévia do site abre em "Celular" em tela pequena; chips e seletor de projeto com 36–44px.

## Atritos mobile que ainda restam
- Controles do ajuste fino ficam longe da arte no celular.
- Título do site estoura no modelo "Expedições".
- Campo do link do cliente estreito.
- Histórico de artes geradas some ao recarregar.
- Erro de fonte do Google (SecurityError) no html-to-image (só ruído no console).
- "Voltar ao Canva Viagem" só existe na lateral do desktop.

## Problema de conteúdo (não é código)
O card **"Maragogi - AL"** usa capa de Paris — trocar a imagem no painel de gestão.
