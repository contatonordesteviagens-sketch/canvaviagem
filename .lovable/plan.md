
# Plano: Remover Link Alternativo do Email

## Objetivo
Remover a seção "Se o botão não funcionar, copie e cole este link" do template de email do Magic Link.

---

## Alteração

**Arquivo:** `supabase/functions/send-magic-link/index.ts`

**Seção a Remover (linhas 71-75):**

```html
<!-- Link alternativo -->
<p style="margin: 30px 0 0; color: #9999b3; font-size: 12px; text-align: center; word-break: break-all;">
  Se o botão não funcionar, copie e cole este link:<br>
  <a href="${magicLink}" style="color: #667eea;">${magicLink}</a>
</p>
```

---

## Resultado

O email ficará mais limpo, mostrando apenas:
- Header com logo Canva Viagem
- Botão "Acessar Minha Conta"
- Info box "Este link expira em 1 hora"
- Footer com aviso de segurança

O link alternativo visível será completamente removido.
