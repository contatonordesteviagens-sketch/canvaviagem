
# Plano: Modo Escuro + Toggle de Tema

## Objetivo
Adicionar modo escuro funcional ao app com um botão minimalista no canto superior direito do header para alternar entre claro/escuro.

## Situação Atual
O projeto já possui:
- `next-themes` instalado (dependência já existe)
- `darkMode: ["class"]` configurado no Tailwind
- Estilos `.dark` completos no `index.css`

Falta apenas ativar o ThemeProvider e adicionar o botão de toggle.

---

## Arquivos a Modificar

### 1. `src/App.tsx`

Adicionar o `ThemeProvider` do `next-themes` envolvendo a aplicação:

```tsx
import { ThemeProvider } from "next-themes";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        {/* ... resto do app */}
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
```

---

### 2. `src/components/Header.tsx`

Adicionar botão de toggle de tema no canto superior direito:

**Imports adicionais:**
```tsx
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
```

**Hook no componente:**
```tsx
const { theme, setTheme } = useTheme();
```

**Botão no Desktop** (antes do botão Entrar/Sair):
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  className="ml-2"
>
  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
  <span className="sr-only">Alternar tema</span>
</Button>
```

**Botão no Mobile** (dentro do Sheet):
```tsx
<Button
  variant="ghost"
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  className="justify-start gap-3 px-3"
>
  {theme === "dark" ? (
    <Sun className="h-5 w-5" />
  ) : (
    <Moon className="h-5 w-5" />
  )}
  {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
</Button>
```

---

## Posicionamento do Botão

```text
┌─────────────────────────────────────────────────────────────┐
│ DESKTOP HEADER                                              │
│ [🔵Logo]  Início  Calendário  Planos  ▾Conteúdos  [🌙] [👤] │
└─────────────────────────────────────────────────────────────┘
                                                  ↑
                                          Botão de tema
                                          (Sol/Lua animado)
```

---

## Comportamento

| Estado | Ícone Visível | Clique Alterna Para |
|--------|---------------|---------------------|
| Modo Claro | ☀️ Sol | Modo Escuro |
| Modo Escuro | 🌙 Lua | Modo Claro |

O ícone terá uma transição suave com rotação (sol → lua e vice-versa).

---

## Resultado Esperado

1. **Toggle funcional**: Clique alterna entre modo claro e escuro
2. **Persistência**: O tema é salvo no localStorage automaticamente pelo `next-themes`
3. **Ícone minimalista**: Sol/Lua com animação de transição
4. **Posição**: Canto superior direito, antes do botão de login
5. **Mobile**: Opção também disponível no menu lateral
