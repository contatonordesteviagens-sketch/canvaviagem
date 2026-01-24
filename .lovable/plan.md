
# Plano: Footer Profissional para Canva Viagem

## Objetivo
Criar um rodapé moderno, profissional e visualmente impactante que reflita a identidade da marca Canva Viagem, com redes sociais, navegação rápida e links institucionais.

---

## Design Visual

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FOOTER - DESKTOP                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   [🔵 Logo]                    LINKS RÁPIDOS        REDES SOCIAIS              │
│   Canva Viagem                 • Início             [📸] [📘] [🎵] [▶️]         │
│                                • Calendário                                     │
│   Hub de Conteúdo Profissional • Planos             Siga @canvaviagem          │
│   para Agências de Viagens     • Modelos                                        │
│                                • Contato                                        │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│   © 2026 Canva Viagem. Todos os direitos reservados.                           │
│                                                                                 │
│   Termos de Uso  •  Política de Privacidade                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura do Componente

O footer será dividido em 3 seções verticais:

### Seção 1 - Conteúdo Principal (Grid Responsivo)
Layout em 3 colunas no desktop, empilhado no mobile:

| Coluna | Conteúdo |
|--------|----------|
| **Marca** | Logo (favicon), nome "Canva Viagem", tagline |
| **Links Rápidos** | Início, Calendário, Planos, Modelos (artes), Contato (mailto) |
| **Redes Sociais** | Ícones clicáveis + texto "@canvaviagem" |

### Seção 2 - Separador
Linha divisória sutil com gradiente da marca

### Seção 3 - Rodapé Inferior
- Copyright centralizado
- Links institucionais (Termos, Privacidade)

---

## Redes Sociais

| Rede | Link | Ícone |
|------|------|-------|
| Instagram | instagram.com/canvaviagem | Instagram (lucide) |
| Facebook | facebook.com/canvaviagem | Facebook (lucide) |
| TikTok | tiktok.com/@canvaviagem | Custom SVG (lucide não tem) |
| YouTube | youtube.com/@canvaviagem | Youtube (lucide) |

---

## Arquivos a Criar/Modificar

### 1. `src/components/Footer.tsx`
Reescrever completamente o footer existente com:

```tsx
// Estrutura principal
<footer className="border-t bg-gradient-to-br from-background to-muted/30">
  {/* Seção Principal */}
  <div className="container grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
    
    {/* Coluna 1: Marca */}
    <div>
      <img src="/favicon.webp" alt="Canva Viagem" />
      <h3>Canva Viagem</h3>
      <p>Hub de Conteúdo Profissional para Agências de Viagens</p>
    </div>
    
    {/* Coluna 2: Links Rápidos */}
    <div>
      <h4>Links Rápidos</h4>
      <nav>
        <Link to="/">Início</Link>
        <Link to="/calendar">Calendário</Link>
        <Link to="/planos">Planos</Link>
        <Link to="/" + scroll to artes>Modelos</Link>
        <a href="mailto:contato@canvaviagem.com">Contato</a>
      </nav>
    </div>
    
    {/* Coluna 3: Redes Sociais */}
    <div>
      <h4>Conecte-se</h4>
      <div className="flex gap-3">
        <a href="https://instagram.com/canvaviagem">
          <Instagram />
        </a>
        {/* Facebook, TikTok, YouTube */}
      </div>
      <p>@canvaviagem</p>
    </div>
  </div>
  
  {/* Separador com gradiente */}
  <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
  
  {/* Rodapé Inferior */}
  <div className="container py-6">
    <p>© 2026 Canva Viagem. Todos os direitos reservados.</p>
    <div className="flex gap-4">
      <Link to="/termos">Termos de Uso</Link>
      <Link to="/privacidade">Política de Privacidade</Link>
    </div>
  </div>
</footer>
```

### 2. `src/pages/Termos.tsx` (Novo)
Página de Termos de Uso com conteúdo placeholder editável posteriormente.

### 3. `src/pages/Privacidade.tsx` (Novo)
Página de Política de Privacidade com conteúdo placeholder editável posteriormente.

### 4. `src/App.tsx`
Adicionar rotas para as novas páginas:
```tsx
<Route path="/termos" element={<Termos />} />
<Route path="/privacidade" element={<Privacidade />} />
```

---

## Responsividade

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 768px) | Coluna única, centralizado, ícones sociais maiores |
| Tablet/Desktop (≥ 768px) | Grid de 3 colunas, alinhamento à esquerda |

---

## Detalhes Técnicos

### Ícones Utilizados
- `Instagram`, `Facebook`, `Youtube` do `lucide-react`
- TikTok: SVG customizado inline (lucide não possui este ícone)

### Cores e Estilos
- Background: gradiente sutil `from-background to-muted/30`
- Títulos: `text-foreground font-semibold`
- Links: `text-muted-foreground hover:text-primary transition-colors`
- Ícones sociais: `hover:text-primary hover:scale-110 transition-all`

### Animações
- Hover nos ícones sociais: escala 1.1 + mudança de cor
- Links com transição suave de cor

---

## Resultado Esperado

1. **Identidade forte**: Logo e nome "Canva Viagem" em destaque
2. **Navegação facilitada**: Links rápidos para principais seções
3. **Presença social**: Ícones clicáveis para todas as redes com @canvaviagem
4. **Conformidade legal**: Links para Termos e Privacidade
5. **Design responsivo**: Adaptação perfeita mobile/desktop
6. **Consistência visual**: Uso das cores e gradientes da marca
