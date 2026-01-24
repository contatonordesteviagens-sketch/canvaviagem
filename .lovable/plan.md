

# Plano: Footer Profissional para Canva Viagem

## Objetivo
Substituir o footer atual por um rodapé moderno, profissional e completo com redes sociais, navegação rápida e links institucionais.

---

## Alterações Necessárias

### 1. Reescrever `src/components/Footer.tsx`

**Estrutura em 3 colunas (Desktop) / Empilhado (Mobile):**

| Coluna | Conteúdo |
|--------|----------|
| **Marca** | Logo `/favicon.webp`, nome "Canva Viagem", tagline |
| **Links Rápidos** | Início, Calendário, Planos, Modelos, Contato |
| **Redes Sociais** | Instagram, Facebook, TikTok, YouTube + @canvaviagem |

**Rodapé inferior:**
- Copyright: "© 2026 Canva Viagem. Todos os direitos reservados."
- Links: Termos de Uso | Política de Privacidade

---

### 2. Criar `src/pages/Termos.tsx`
Página de Termos de Uso com layout consistente (Header + Footer) e conteúdo placeholder.

### 3. Criar `src/pages/Privacidade.tsx`
Página de Política de Privacidade com layout consistente e conteúdo placeholder.

### 4. Atualizar `src/App.tsx`
Adicionar rotas:
```tsx
<Route path="/termos" element={<Termos />} />
<Route path="/privacidade" element={<Privacidade />} />
```

---

## Redes Sociais

| Rede | URL | Ícone |
|------|-----|-------|
| Instagram | instagram.com/canvaviagem | `Instagram` (lucide) |
| Facebook | facebook.com/canvaviagem | `Facebook` (lucide) |
| TikTok | tiktok.com/@canvaviagem | SVG customizado |
| YouTube | youtube.com/@canvaviagem | `Youtube` (lucide) |

---

## Design Visual

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         FOOTER - DESKTOP                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Logo] Canva Viagem      LINKS RÁPIDOS       CONECTE-SE            │
│  Hub de Conteúdo          • Início            [IG][FB][TT][YT]      │
│  Profissional para        • Calendário        @canvaviagem          │
│  Agências de Viagens      • Planos                                   │
│                           • Modelos                                  │
│                           • Contato                                  │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  © 2026 Canva Viagem. Todos os direitos reservados.                 │
│  Termos de Uso  •  Política de Privacidade                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| Mobile (< 768px) | Coluna única, centralizado, ícones maiores |
| Desktop (≥ 768px) | Grid 3 colunas, alinhado à esquerda |

---

## Detalhes Técnicos

- **TikTok**: SVG inline (lucide não possui)
- **Hover**: Ícones com `scale-110` + mudança de cor
- **Separador**: Linha gradiente `from-transparent via-primary/30 to-transparent`
- **Background**: `bg-gradient-to-br from-background to-muted/30`

