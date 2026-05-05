# 🔍 DIAGNÓSTICO DO SISTEMA DE BUSCA DE FOTOS

Este documento explica como o seu app encontra as fotos reais e como gerenciar as chaves.

### 1. Motor de Busca Atual: PIXABAY
*   **Por que Pixabay?** É mais rápido, livre de restrições de segurança chatas e já vem configurado no seu código com uma chave estável.
*   **Como funciona:** Quando você clica em "Buscar", o app chama o Pixabay filtrando apenas por "tourism" e "landscape".

### 2. Motor Opcional: GOOGLE REAL
*   **Status:** O código está pronto no seu servidor (Edge Function), mas precisa das suas chaves ativadas no Supabase (Secrets).
*   **Chaves necessárias:** `GOOGLE_API_KEY` e `GOOGLE_CX_ID`.
*   **Dica:** Se o Google Imagens real não estiver aparecendo, é porque a opção "Pesquisar na Web Inteira" está desligada no painel do Google.

### 3. Fallback: UNSPLASH
*   **O que é:** Se o Pixabay ou o Google falharem por qualquer motivo, o sistema usa o Unsplash automaticamente para você nunca ficar sem foto.
