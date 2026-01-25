
# Plano: Implementacao Definitiva do Toggle de Tema + Verificacao de Seguranca RLS

## Parte 1: Analise de Seguranca RLS

### Situacao Atual das Politicas

Verificacao via SQL revela que as politicas ja estao **corretamente configuradas**:

```text
+----------------+--------------------------------+---------+------------------------+
| Tabela         | Politica                       | Comando | Condicao               |
+----------------+--------------------------------+---------+------------------------+
| profiles       | Users can view their own       | SELECT  | auth.uid() = user_id   |
| profiles       | Block anonymous access         | ALL     | auth.uid() IS NOT NULL |
| profiles       | Admins can view all profiles   | SELECT  | is_admin()             |
| subscriptions  | Users can view their own       | SELECT  | auth.uid() = user_id   |
| subscriptions  | Admins can view all            | SELECT  | is_admin()             |
| subscriptions  | Block direct inserts/updates   | *       | false                  |
+----------------+--------------------------------+---------+------------------------+
```

### Conclusao de Seguranca

Os alertas de "Customer Email Addresses Could Be Stolen" e "Payment Data Could Be Accessed" sao **falsos positivos** porque:

1. A politica `auth.uid() = user_id` ja garante que usuarios so veem seus proprios dados
2. Usuarios anonimos sao bloqueados pela politica `auth.uid() IS NOT NULL`
3. A funcao `is_admin()` e SECURITY DEFINER e valida sessao autenticada
4. Nao ha como "enumerar" user_ids porque a query retorna vazio para qualquer id que nao seja o proprio

**Acao Recomendada:** Marcar estes findings como "ignore" com justificativa tecnica, pois as politicas ja estao no modo mais restritivo possivel.

---

## Parte 2: Implementacao do Toggle de Tema

### Arquivos a Criar/Modificar

```text
src/
  contexts/
    ThemeContext.tsx          <-- CRIAR: Provider com localStorage + prefers-color-scheme
  components/
    ThemeToggle.tsx           <-- CRIAR: Botao com icones Sun/Moon
    Header.tsx                <-- MODIFICAR: Adicionar ThemeToggle no desktop e mobile
  App.tsx                     <-- MODIFICAR: Envolver com ThemeProvider
```

### Implementacao Tecnica

**1. ThemeContext.tsx - Provider de Tema**

```typescript
// Funcionalidades:
// - Estado: 'light' | 'dark' | 'system'
// - Persistencia: localStorage com chave 'theme'
// - Deteccao inicial: window.matchMedia('(prefers-color-scheme: dark)')
// - Aplicacao: adiciona/remove classe 'dark' no document.documentElement
// - Hook useTheme() para acesso ao estado e funcao de toggle
```

**2. ThemeToggle.tsx - Componente do Botao**

```typescript
// Caracteristicas:
// - Icone Sun (modo claro ativo) / Moon (modo escuro ativo)
// - Tamanho: w-5 h-5 (sutil e pequeno)
// - Animacao suave de transicao entre icones
// - Botao ghost/transparente para nao conflitar com o design
// - Acessibilidade: aria-label e title descritivos
```

**3. Header.tsx - Posicionamento**

Desktop:
```text
+-----------------------------------------------------------------------------------+
| [Logo] [Canva Viagens]   [Inicio] [Calendario] [Planos] [Conteudos v]   [Sun] [Sair] |
+-----------------------------------------------------------------------------------+
                                                                          ^^^^^^^^
                                                                          Toggle aqui
```

Mobile (dentro do Sheet):
```text
+------------------------+
| [X]                    |
| [Sun/Moon] Alterar tema|  <-- No topo do menu
|------------------------|
| Navegacao              |
| ...                    |
+------------------------+
```

**4. App.tsx - Provider**

```typescript
<QueryClientProvider client={queryClient}>
  <ThemeProvider>           // <-- Adicionar aqui
    <TooltipProvider>
      <AuthProvider>
        {/* resto da app */}
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
```

### Fluxo de Funcionamento

```text
1. Usuario acessa o site
      |
      v
2. ThemeProvider inicializa
      |
      +---> Verifica localStorage('theme')
      |           |
      |     +-----+-----+
      |     |           |
      |   Existe    Nao existe
      |     |           |
      |     v           v
      |   Usa valor   Verifica prefers-color-scheme
      |     |           |
      |     +-----+-----+
      |           |
      v           v
3. Aplica classe 'dark' no <html> se necessario
      |
      v
4. Usuario clica no toggle
      |
      v
5. Alterna tema + salva no localStorage + atualiza classe
```

---

## Resumo das Alteracoes

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/contexts/ThemeContext.tsx` | Criar | Provider completo com logica de tema |
| `src/components/ThemeToggle.tsx` | Criar | Componente de botao toggle |
| `src/components/Header.tsx` | Modificar | Adicionar toggle no desktop (direita) e mobile (menu) |
| `src/App.tsx` | Modificar | Envolver app com ThemeProvider |
| Security Findings | Atualizar | Marcar alertas RLS como falsos positivos |

---

## Secao Tecnica: Detalhes de Implementacao

### ThemeContext.tsx

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Verificar localStorage
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    
    // 2. Verificar preferencia do sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Aplicar classe no elemento raiz
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

### ThemeToggle.tsx

```typescript
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 z-50"
      aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 transition-transform" />
      ) : (
        <Moon className="h-5 w-5 transition-transform" />
      )}
    </Button>
  );
}
```

### Verificacao de Compatibilidade

- Tailwind ja tem `darkMode: ["class"]` configurado
- CSS ja define variaveis `.dark` em `src/index.css`
- Componente Sonner ja usa `useTheme` do next-themes (sera atualizado para usar nosso contexto)
