

# Plano: Corrigir Posicionamento do Widget Zaia no Mobile

## Problema Identificado

O widget da Zaia ainda está sobrepondo o botão "Favoritos" na barra de navegação inferior porque:

1. **O widget usa inline styles** com `position: fixed` e valores específicos de `bottom`/`right`
2. **Os seletores CSS atuais não são específicos o suficiente** para sobrescrever os inline styles
3. **O script carrega dinamicamente** e pode criar elementos com IDs/classes diferentes

## Solução

### CSS mais agressivo com múltiplos seletores

Aplicar estilos a todos os possíveis containers do widget usando seletores mais amplos:

```css
@media (max-width: 768px) {
  /* Container principal do widget Zaia */
  #zaia-widget-container,
  [id*="zaia"],
  [class*="zaia"],
  iframe[src*="zaia"],
  /* Widgets de chat genéricos que o Zaia pode criar */
  div[style*="position: fixed"][style*="z-index: 9999"],
  div[style*="position: fixed"][style*="bottom: 20px"],
  div[style*="position: fixed"][style*="bottom: 24px"],
  div[style*="position:fixed"][style*="right: 20px"],
  div[style*="position:fixed"][style*="right: 24px"] {
    bottom: 90px !important;
    right: 16px !important;
    transform: scale(0.8) !important;
    transform-origin: bottom right !important;
  }
}
```

### Valores ajustados

| Propriedade | Valor Anterior | Novo Valor |
|-------------|----------------|------------|
| `bottom` | 80px | **90px** (mais espaço para a barra de 64px + margem) |
| `right` | 12px | **16px** (margem padrão) |
| `scale` | 0.85 | **0.8** (20% menor para ocupar menos espaço) |

---

## Alteração no Arquivo

| Arquivo | Alteração |
|---------|-----------|
| `index.html` | Atualizar bloco `<style>` com seletores mais amplos e valores ajustados |

---

## Código Atualizado

```html
<style>
  /* Ajuste do widget Zaia para não sobrepor navegação mobile */
  @media (max-width: 768px) {
    /* Seletores específicos para Zaia */
    #zaia-widget-container,
    [id*="zaia"],
    [class*="zaia"],
    iframe[src*="zaia"],
    /* Seletores genéricos para widgets de chat fixos no canto inferior direito */
    body > div[style*="position: fixed"][style*="bottom"],
    body > div[style*="position:fixed"][style*="bottom"],
    body > iframe[style*="position: fixed"],
    body > iframe[style*="position:fixed"] {
      bottom: 90px !important;
      right: 16px !important;
      transform: scale(0.8) !important;
      transform-origin: bottom right !important;
    }
  }
</style>
```

---

## Seção Técnica

### Por que os estilos anteriores não funcionaram?

O widget Zaia carrega via JavaScript externo e pode:

1. **Criar elementos dinâmicos** com IDs gerados automaticamente
2. **Aplicar inline styles** que têm alta especificidade
3. **Usar shadow DOM** ou iframes que isolam estilos

### Estratégia de fallback

Os novos seletores usam:

- **Seletores de atributo parcial** (`[id*="zaia"]`) para capturar qualquer ID contendo "zaia"
- **Seletores genéricos** para divs/iframes fixos posicionados no canto inferior
- **`!important`** para sobrescrever inline styles

### Alternativa se não funcionar

Se o CSS ainda não funcionar, a alternativa seria adicionar JavaScript para manipular o DOM após o widget carregar:

```javascript
// Fallback: ajustar widget via JavaScript após carregamento
setTimeout(() => {
  const widgets = document.querySelectorAll('[id*="zaia"], iframe[src*="zaia"]');
  widgets.forEach(w => {
    if (window.innerWidth < 768) {
      w.style.setProperty('bottom', '90px', 'important');
      w.style.setProperty('transform', 'scale(0.8)', 'important');
    }
  });
}, 2000);
```

---

## Resultado Esperado

- Widget Zaia posicionado 90px acima da borda inferior (acima da barra de navegação de 64px)
- Widget 20% menor no mobile para ocupar menos espaço visual
- Botão "Favoritos" totalmente visível e clicável

