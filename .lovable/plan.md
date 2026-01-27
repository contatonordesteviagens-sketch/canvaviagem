

# Plano: Adicionar Widget de Chat da Zaia

## Resumo

Adicionar o script do widget de suporte da Zaia no site para que o assistente de IA apareça como botão flutuante em todas as páginas.

---

## Alteração

**Arquivo:** `index.html`

**Adicionar antes de `</body>` (linha 62):**

```html
<!-- Zaia Chat Widget -->
<script>
  window.ZWidget = {
    AgentURL: "https://platform.zaia.app/embed/chat/60844",
  };
</script>
<script src="https://platform.zaia.app/script/widget-loader.js"></script>
```

---

## Resultado

- Botão de chat flutuante aparecerá no canto inferior direito de todas as páginas
- O mesmo agente IA que responde no WhatsApp (85) 9 8641-1294 responderá no site
- Usuários podem tirar dúvidas antes e depois da compra diretamente no site
- Funciona automaticamente em todas as rotas

