

# Plano: Sistema de Anuncios Internos "Agente Lucrativo"

## Objetivo

Criar 3 componentes de conversao para promover o curso "Agente Lucrativo" dentro da plataforma, usando o estilo visual do site de referencia (cores dourado/preto, tema premium/escuro).

---

## Paleta de Cores Extraida do Site

| Elemento | Cor |
|----------|-----|
| Fundo | `#0d0d0d` / `#1a1a1a` (preto profundo) |
| Dourado Destaque | `#FFD700` / `#FFC300` |
| Vermelho Urgencia | `#dc2626` |
| Texto Principal | Branco `#ffffff` |
| CTA Botao | Azul `#3b82f6` ou Dourado |

---

## Arquivos a Criar

```text
src/components/canva/
  LevelUpCard.tsx      <-- Card de gamificacao / mini pass
  AdBanner.tsx         <-- Banner horizontal interno
  PromoPopup.tsx       <-- Modal popup com timer
```

---

## Componente 1: LevelUpCard (Gamificacao)

### Estrutura Visual

```text
+---------------------------------------------------------------+
|  🎮 SUA JORNADA DE VENDAS                                     |
+---------------------------------------------------------------+
|                                                               |
|  [ ✔️ ]--------[ 🔒 ]---------[ 🚀 ]                          |
|  Ferramentas   Metodo         Escala 10x                      |
|  ██████████    ▓▓▓▓▓▓         ░░░░░░                          |
|  CONCLUIDO     ATUAL          BLOQUEADO                       |
|                                                               |
|  Voce ja tem as ferramentas.                                  |
|  Agora falta o METODO para escalar suas vendas.               |
|                                                               |
|  [  🔓 DESBLOQUEAR NIVEL 2  ]                                 |
|                                                               |
+---------------------------------------------------------------+
```

### Especificacoes Tecnicas

- **Background:** Gradiente `from-zinc-900 via-zinc-800 to-zinc-900`
- **Borda:** `border border-yellow-500/30`
- **Animacao:** Icone do cadeado com `animate-pulse`
- **Barra de Progresso:** 3 etapas visuais
- **CTA:** Botao dourado com hover effect
- **Link:** `https://rochadigitalmidia.com.br/agente-lucrativo/`

### Copy

```text
Titulo: "Sua Jornada de Vendas"

Fase 1: "Ferramentas" (Concluido)
Fase 2: "Metodo Agente Lucrativo" (Atual - Desbloqueie agora)
Fase 3: "Escala 10x" (Futuro)

Subtitulo: "Voce ja tem o Canva. Agora falta o metodo validado para vender viagens todos os dias."

CTA: "Desbloquear Nivel 2"
```

---

## Componente 2: AdBanner (Banner Horizontal)

### Estrutura Visual

```text
+-----------------------------------------------------------------------+
|  💰                                                              💰   |
|       CANSADO DE POSTAR E NAO VENDER?                                 |
|       Descubra o metodo que transforma posts em vendas reais.         |
|                                                                       |
|       ✓ Anuncios escalados  ✓ Scripts prontos  ✓ IA no WhatsApp      |
|                                                                       |
|       [  QUERO O METODO AGORA  ]              12x R$10 | 75% OFF     |
|  💰                                                              💰   |
+-----------------------------------------------------------------------+
```

### Especificacoes Tecnicas

- **Background:** Gradiente escuro com overlay de elementos flutuantes
- **Elementos Decorativos:** Icones de dinheiro/cifrao em posicoes absolutas com opacidade
- **Badge de Urgencia:** "ULTIMOS DIAS COM 75% OFF!" em vermelho
- **Layout:** Flexbox horizontal, responsivo para coluna em mobile
- **Altura:** `h-auto min-h-[180px]`
- **Link:** `https://rochadigitalmidia.com.br/agente-lucrativo/`

### Copy (extraido do site)

```text
Badge: "🔥 ULTIMOS DIAS COM 75% OFF!"

Titulo: "Cansado de postar e nao vender?"

Subtitulo: "Descubra o metodo validado de grandes agencias de viagens"

Beneficios:
- Anuncios escalados de viagens
- Scripts e publicos que compram
- IA para atendimento no WhatsApp

CTA: "Quero Vender Mais"
Preco: "12x de R$10 ou R$97 anual"
```

---

## Componente 3: PromoPopup (Modal)

### Estrutura Visual

```text
+-----------------------------------------------+
|  [X]                                          |
|                                               |
|  🎁 OPORTUNIDADE EXCLUSIVA                    |
|     PARA AGENTES DE VIAGENS                   |
|                                               |
|  Pare de sofrer com:                          |
|  ❌ Baixas vendas                             |
|  ❌ Depender de indicacoes                    |
|  ❌ Ver agencias piores com mais resultados   |
|                                               |
|  Com o Agente Lucrativo voce recebe:          |
|  ✅ Curso de trafego pago para viagens        |
|  ✅ Robo Chat Viagens (IA para roteiros)      |
|  ✅ Pack 150 videos + 150 artes + 200 legendas|
|                                               |
|  De R$297 por apenas R$97                     |
|  (12x de R$10)                                |
|                                               |
|  [  QUERO VENDER MAIS VIAGENS  ]              |
|                                               |
|  Garantia de 7 dias - Risco Zero              |
+-----------------------------------------------+
```

### Especificacoes Tecnicas

- **Trigger:** `setTimeout` de 3 segundos apos renderizacao
- **Controle localStorage:**
  - Chave: `promoPopup_lastClosed`
  - Verificar: se `Date.now() - lastClosed < 24h`, nao exibir
- **Componentes shadcn:** `Dialog`, `DialogContent`, `DialogHeader`
- **Background:** Escuro premium com borda dourada
- **Animacao de entrada:** `animate-scale-in`
- **Link:** `https://pay.hotmart.com/X100779687E?off=1b820216&checkoutMode=10` (link de checkout direto)

### Logica de Exibicao

```typescript
useEffect(() => {
  const lastClosed = localStorage.getItem('promoPopup_lastClosed');
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  if (!lastClosed || parseInt(lastClosed) < oneDayAgo) {
    const timer = setTimeout(() => setIsOpen(true), 3000);
    return () => clearTimeout(timer);
  }
}, []);

const handleClose = () => {
  localStorage.setItem('promoPopup_lastClosed', Date.now().toString());
  setIsOpen(false);
};
```

---

## Integracao no Index.tsx

### Posicionamento

```text
<Header />

<main>
  <HeroBanner />
  
  <LevelUpCard />          <-- NOVO: Logo abaixo do Hero
  
  <CategoryNav />
  
  {activeCategory === 'videos' && (
    <>
      <SectionHeader />
      <FilterChips />
      
      <AdBanner />         <-- NOVO: Entre filtros e grid
      
      <Grid de Videos />
    </>
  )}
  
  {/* Outras categorias... */}
</main>

<Footer />
<BottomNav />

<PromoPopup />             <-- NOVO: Modal global (renderiza ao final)
```

### Codigo de Integracao

```typescript
// Novos imports
import { LevelUpCard } from "@/components/canva/LevelUpCard";
import { AdBanner } from "@/components/canva/AdBanner";
import { PromoPopup } from "@/components/canva/PromoPopup";

// No JSX principal:
const mainContent = (
  <>
    <HeroBanner 
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    />
    
    {/* Card de Gamificacao - Sempre visivel */}
    <LevelUpCard />
    
    <CategoryNav 
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      showFavorites={!!user}
    />
    
    {renderContent()}
  </>
);

// Na secao de videos (dentro do renderContent):
// Inserir <AdBanner /> entre <FilterChips /> e o grid

// No return final:
return (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Header onCategoryChange={setActiveCategory} />
    
    <main className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
      {isSubscribed ? mainContent : <PremiumGate>{mainContent}</PremiumGate>}
    </main>
    
    <Footer />
    <BottomNav ... />
    
    {/* Popup de Promocao */}
    <PromoPopup />
  </div>
);
```

---

## Secao Tecnica: Implementacao Detalhada

### LevelUpCard.tsx

```typescript
import { Check, Lock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COURSE_URL = "https://rochadigitalmidia.com.br/agente-lucrativo/";

export const LevelUpCard = () => {
  return (
    <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-yellow-500/30 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎮</span>
        <h3 className="text-lg font-bold text-white">Sua Jornada de Vendas</h3>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {/* Step 1 - Completed */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-400 mt-2">Ferramentas</span>
          <span className="text-[10px] text-green-500 font-medium">CONCLUIDO</span>
        </div>
        
        {/* Connector */}
        <div className="h-1 flex-1 bg-gradient-to-r from-green-500 to-yellow-500 mx-2" />
        
        {/* Step 2 - Current/Locked */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center animate-pulse">
            <Lock className="w-6 h-6 text-yellow-500" />
          </div>
          <span className="text-xs text-yellow-500 mt-2 font-medium">Metodo</span>
          <span className="text-[10px] text-yellow-500">DESBLOQUEAR</span>
        </div>
        
        {/* Connector */}
        <div className="h-1 flex-1 bg-gray-700 mx-2" />
        
        {/* Step 3 - Future */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center opacity-50">
            <Rocket className="w-6 h-6 text-gray-500" />
          </div>
          <span className="text-xs text-gray-500 mt-2">Escala 10x</span>
          <span className="text-[10px] text-gray-600">BLOQUEADO</span>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-4 text-center">
        Voce ja tem o Canva. Agora falta o <span className="text-yellow-500 font-bold">metodo validado</span> para vender viagens todos os dias.
      </p>
      
      <Button
        asChild
        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 rounded-xl"
      >
        <a href={COURSE_URL} target="_blank" rel="noopener noreferrer">
          <Lock className="w-4 h-4 mr-2" />
          Desbloquear Nivel 2
        </a>
      </Button>
    </div>
  );
};
```

### AdBanner.tsx

```typescript
import { Button } from "@/components/ui/button";
import { Check, TrendingUp } from "lucide-react";

const COURSE_URL = "https://rochadigitalmidia.com.br/agente-lucrativo/";

export const AdBanner = () => {
  return (
    <div className="relative my-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-yellow-500/20 overflow-hidden">
      {/* Elementos decorativos flutuantes */}
      <div className="absolute top-4 left-4 text-3xl opacity-20">💰</div>
      <div className="absolute bottom-4 right-4 text-3xl opacity-20">💰</div>
      <div className="absolute top-1/2 right-1/4 text-2xl opacity-10">📈</div>
      
      {/* Badge de urgencia */}
      <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
        🔥 75% OFF
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            Cansado de postar e <span className="text-yellow-500">nao vender?</span>
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Descubra o metodo validado de grandes agencias de viagens
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs">
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" /> Anuncios escalados
            </span>
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" /> Scripts prontos
            </span>
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" /> IA no WhatsApp
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Button
            asChild
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-xl"
          >
            <a href={COURSE_URL} target="_blank" rel="noopener noreferrer">
              <TrendingUp className="w-4 h-4 mr-2" />
              Quero Vender Mais
            </a>
          </Button>
          <span className="text-gray-500 text-xs">12x R$10 | R$97 anual</span>
        </div>
      </div>
    </div>
  );
};
```

### PromoPopup.tsx

```typescript
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check, Gift } from "lucide-react";

const CHECKOUT_URL = "https://pay.hotmart.com/X100779687E?off=1b820216&checkoutMode=10";
const STORAGE_KEY = "promoPopup_lastClosed";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem(STORAGE_KEY);
    const oneDayAgo = Date.now() - ONE_DAY_MS;

    if (!lastClosed || parseInt(lastClosed) < oneDayAgo) {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-b from-zinc-900 to-black border border-yellow-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-500">
            <Gift className="w-6 h-6" />
            Oportunidade Exclusiva
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Pare de sofrer com:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-red-400">
              <X className="w-4 h-4" /> Baixas vendas
            </li>
            <li className="flex items-center gap-2 text-red-400">
              <X className="w-4 h-4" /> Depender de indicacoes
            </li>
            <li className="flex items-center gap-2 text-red-400">
              <X className="w-4 h-4" /> Ver agencias piores vendendo mais
            </li>
          </ul>

          <p className="text-gray-300 text-sm pt-2">
            Com o Agente Lucrativo voce recebe:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" /> Curso de trafego pago para viagens
            </li>
            <li className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" /> Robo Chat Viagens (IA para roteiros)
            </li>
            <li className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" /> Pack 150 videos + artes + legendas
            </li>
          </ul>

          <div className="text-center pt-4">
            <p className="text-gray-500 text-sm line-through">De R$297</p>
            <p className="text-3xl font-bold text-yellow-500">R$ 97</p>
            <p className="text-gray-400 text-xs">ou 12x de R$10</p>
          </div>

          <Button
            asChild
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 rounded-xl"
          >
            <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
              Quero Vender Mais Viagens
            </a>
          </Button>

          <p className="text-center text-gray-500 text-xs">
            Garantia de 7 dias - Risco Zero
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## Resumo Final

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/canva/LevelUpCard.tsx` | Criar | Card de gamificacao com 3 fases |
| `src/components/canva/AdBanner.tsx` | Criar | Banner horizontal com oferta |
| `src/components/canva/PromoPopup.tsx` | Criar | Modal popup com timer 3s + localStorage |
| `src/pages/Index.tsx` | Modificar | Integrar os 3 componentes |

