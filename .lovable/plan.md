
# Plano: Atualizar Favicon

## Objetivo
Substituir o favicon atual do Lovable pelo novo ícone de anéis azuis enviado.

## Passos

### 1. Copiar a imagem para o projeto
O arquivo `user-uploads://favicon.webp` será copiado para `public/favicon.webp`

### 2. Atualizar o `index.html`
Modificar a referência do favicon de `/favicon.png` para `/favicon.webp`:

```html
<!-- Antes -->
<link rel="icon" type="image/png" href="/favicon.png" />

<!-- Depois -->
<link rel="icon" type="image/webp" href="/favicon.webp" />
```

## Resultado
O novo ícone azul com anéis interconectados aparecerá na aba do navegador em vez do favicon do Lovable.
