
# Plano: Modo Claro como Padrao + Logo no Footer

## Resumo das Alteracoes

Duas mudancas simples serao feitas:

1. **Modo claro como padrao**: Remover a deteccao automatica de preferencia do sistema (prefers-color-scheme), sempre iniciando em modo claro
2. **Logo no Footer**: Substituir a referencia ao favicon.webp pela mesma logo usada no Header (src/assets/logo.png)

---

## Arquivos a Modificar

### 1. src/contexts/ThemeContext.tsx

**Alteracao**: Remover a verificacao de `window.matchMedia('(prefers-color-scheme: dark)')` para que o modo claro seja sempre o padrao quando nao houver preferencia salva no localStorage.

**Logica atual (linha 14-24):**
```typescript
const [theme, setThemeState] = useState<Theme>(() => {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  
  // REMOVER ESTA PARTE:
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
});
```

**Nova logica:**
```typescript
const [theme, setThemeState] = useState<Theme>(() => {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  
  // Sempre inicia em modo claro por padrao
  return 'light';
});
```

### 2. src/components/Footer.tsx

**Alteracao**: Importar e usar a mesma logo do Header em vez de referenciar o favicon.webp.

**Adicionar import:**
```typescript
import logoImage from "@/assets/logo.png";
```

**Alterar a tag img (linha 56-60):**
```typescript
// DE:
<img
  src="/favicon.webp"
  alt="Canva Viagem"
  className="h-10 w-10 rounded-lg"
/>

// PARA:
<img
  src={logoImage}
  alt="Canva Viagem"
  className="h-10 w-10 rounded-xl shadow-lg object-cover"
/>
```

---

## Comportamento Final

| Situacao | Tema Aplicado |
|----------|---------------|
| Primeiro acesso (sem localStorage) | Claro |
| Usuario com sistema em dark mode | Claro (ignora sistema) |
| Usuario clicou em "modo escuro" | Escuro (salvo no localStorage) |
| Usuario retorna ao site | Mantem escolha anterior |

---

## Secao Tecnica

### ThemeContext.tsx - Codigo Completo da Funcao

```typescript
const [theme, setThemeState] = useState<Theme>(() => {
  if (typeof window === 'undefined') return 'light';
  
  // Apenas verifica localStorage - nao detecta preferencia do sistema
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  
  // Padrao: modo claro
  return 'light';
});
```

### Footer.tsx - Consistencia Visual

A logo tera as mesmas classes do Header (`rounded-xl shadow-lg object-cover`) para manter a consistencia visual em todo o site.
