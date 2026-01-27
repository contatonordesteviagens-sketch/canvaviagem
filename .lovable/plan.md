

# Plano: Corrigir Link do WhatsApp na Página Pós-Pagamento

## Problema

O link atual do WhatsApp não contém a mensagem pré-preenchida, dificultando o contato.

**Link atual (linha 229):**
```
https://wa.me/5585986411294
```

**Link correto:**
```
https://wa.me/5585986411294?text=Ol%C3%A1%20adquiri%20o%20Canva%20Viagem.%20
```

---

## Alteração

**Arquivo:** `src/pages/PosPagamento.tsx`

**Linha 229 - Atualizar o href:**

```tsx
// DE:
<a 
  href="https://wa.me/5585986411294" 
  target="_blank" 
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 text-primary hover:underline"
>

// PARA:
<a 
  href="https://wa.me/5585986411294?text=Ol%C3%A1%20adquiri%20o%20Canva%20Viagem.%20" 
  target="_blank" 
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 text-primary hover:underline"
>
```

---

## Resultado

Ao clicar no botão de WhatsApp, o usuário será direcionado para uma conversa com a mensagem pré-preenchida: **"Olá adquiri o Canva Viagem."**

Isso facilita o atendimento ao cliente e mantém o mesmo formato visual do botão existente.

