
# Plano: Botão Flutuante do WhatsApp

## Resumo

Vou criar um botão flutuante pequeno, verde, com o ícone do WhatsApp, posicionado no canto inferior direito da tela. Ao clicar, abrirá o WhatsApp com o número **85 98641-1294** e a mensagem padrão já configurada no projeto.

---

## Componente a Criar

**Arquivo:** `src/components/WhatsAppButton.tsx`

```tsx
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const whatsappUrl = "https://wa.me/5585986411294?text=Ol%C3%A1%20adquiri%20o%20Canva%20Viagem.%20";
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-all hover:scale-110"
      aria-label="Fale conosco no WhatsApp"
    >
      {/* Ícone SVG do WhatsApp */}
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..." />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
```

---

## Integração Global

**Arquivo:** `src/App.tsx`

Adicionar o componente dentro do `BrowserRouter`, logo após o `<UtmTracker />`:

```tsx
import WhatsAppButton from "@/components/WhatsAppButton";

// Dentro do App:
<BrowserRouter>
  <UtmTracker />
  <WhatsAppButton />  {/* ← NOVO */}
  <Routes>
    ...
  </Routes>
</BrowserRouter>
```

---

## Especificações do Design

| Propriedade | Valor |
|-------------|-------|
| Posição | `fixed bottom-6 right-6` |
| Tamanho | `w-12 h-12` (48x48px) |
| Cor | `bg-green-500` (Verde WhatsApp) |
| Hover | `hover:bg-green-600 hover:scale-110` |
| Z-index | `z-50` (acima de outros elementos) |
| Sombra | `shadow-lg` |
| Ícone | SVG oficial do WhatsApp (branco) |

---

## Comportamento

- **Desktop**: Botão pequeno no canto inferior direito
- **Mobile**: Mesmo tamanho e posição (48x48px)
- **Clique**: Abre `wa.me/5585986411294` com mensagem pré-preenchida
- **Acessibilidade**: `aria-label` para leitores de tela

---

## Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `src/components/WhatsAppButton.tsx` | Criar componente |
| `src/App.tsx` | Importar e adicionar o componente |

---

## Nota sobre Conflito com BottomNav (Mobile)

O botão ficará posicionado em `bottom-6 right-6` (~24px do canto). No mobile, onde existe a `BottomNav` fixa, o botão ficará **acima** da barra de navegação para não haver sobreposição. Se necessário, posso ajustar para `bottom-20` no mobile.
