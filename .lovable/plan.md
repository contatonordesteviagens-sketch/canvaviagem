

# Plano: Melhorar Descrições dos Entregáveis e Resumo no Card de Preço

## Resumo

Atualizar a página de planos em espanhol (`/es/planos`) para:
1. **Adicionar descrições** detalhadas em cada benefício na seção "¿Qué recibes?"
2. **Adicionar resumo com ícones de verificação** no card de preço com os principais entregáveis

---

## Arquivos a Serem Modificados

### src/pages/PlanosES.tsx

---

## Mudança 1: Adicionar descrições aos benefícios (Linhas 65-76)

Atualizar o array `benefits` para incluir uma propriedade `description` em cada item:

```typescript
const benefits = [
  { 
    icon: Video, 
    text: "+250 plantillas de videos editables", 
    description: "Videos profesionales listos para editar en Canva con música y transiciones",
    highlight: true 
  },
  { 
    icon: MessageSquare, 
    text: "Soporte por WhatsApp", 
    description: "Resuelve tus dudas directamente con nuestro equipo",
    highlight: false 
  },
  { 
    icon: Calendar, 
    text: "Calendario de publicaciones", 
    description: "Planifica tu contenido con fechas especiales y festivos",
    highlight: false 
  },
  { 
    icon: FileText, 
    text: "Subtítulos listos para copiar", 
    description: "Textos optimizados para Instagram, Facebook y TikTok",
    highlight: false 
  },
  { 
    icon: Sparkles, 
    text: "Integración con Canva Pro", 
    description: "Compatibilidad total con Canva para edición fácil",
    highlight: false 
  },
  { 
    icon: Shield, 
    text: "Sin derechos de autor", 
    description: "Usa todo el contenido sin preocupaciones legales",
    highlight: false 
  },
  { 
    icon: Bot, 
    text: "Herramientas de IA exclusivas", 
    description: "Crea subtítulos y descripciones automáticamente con IA",
    highlight: true 
  },
  { 
    icon: Image, 
    text: "Artes para feed y stories", 
    description: "Diseños estáticos para complementar tus videos",
    highlight: false 
  },
  { 
    icon: Users, 
    text: "Contenido con influencers", 
    description: "Videos con creadores de viajes reconocidos",
    highlight: false 
  },
  { 
    icon: Infinity, 
    text: "Actualizaciones semanales", 
    description: "Nuevo contenido cada semana para mantenerte actualizado",
    highlight: false 
  },
];
```

---

## Mudança 2: Atualizar layout dos benefícios (Linhas 368-381)

Modificar o grid para mostrar a descrição abaixo de cada item:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {benefits.map((item, index) => (
    <div 
      key={index} 
      className={`flex flex-col gap-2 p-4 rounded-lg transition-all duration-200 ${
        item.highlight 
          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' 
          : 'bg-background/50 hover:bg-background/80'
      }`}
    >
      <div className="flex items-center gap-3">
        <item.icon className={`h-5 w-5 shrink-0 ${item.highlight ? 'text-white' : 'text-primary'}`} />
        <span className="font-semibold">{item.text}</span>
      </div>
      <p className={`text-sm pl-8 ${item.highlight ? 'text-white/90' : 'text-muted-foreground'}`}>
        {item.description}
      </p>
    </div>
  ))}
</div>
```

---

## Mudança 3: Adicionar resumo no Card de Preço (Linhas 409-447)

Adicionar uma lista de entregáveis resumidos com ícones de check antes do botão:

```tsx
<section className="mb-12 md:mb-20">
  <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-xl">
    <CardContent className="p-8 md:p-12 text-center">
      <p className="text-2xl line-through text-muted-foreground mb-2">$29,90</p>
      <div className="flex items-baseline justify-center mb-6">
        <span className="text-5xl md:text-6xl font-black text-primary">$9,09</span>
        <span className="text-xl text-muted-foreground ml-2">/mes</span>
      </div>
      
      {/* NOVO: Resumo de entregáveis */}
      <div className="text-left bg-muted/30 rounded-xl p-4 mb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-primary shrink-0" />
          <span>+250 videos editables en Canva</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-primary shrink-0" />
          <span>Herramientas de IA exclusivas</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-primary shrink-0" />
          <span>Calendario con fechas especiales</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-primary shrink-0" />
          <span>Subtítulos listos para copiar</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-primary shrink-0" />
          <span>Actualizaciones semanales</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-primary shrink-0" />
          <span>Soporte por WhatsApp</span>
        </div>
      </div>
      
      <Button 
        size="lg" 
        onClick={handleCheckout}
        disabled={checkoutLoading}
        className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* ... botão existente */}
      </Button>
      
      {/* ... badges de segurança existentes */}
    </CardContent>
  </Card>
</section>
```

---

## Resumo Visual das Mudanças

```text
┌─────────────────────────────────────────────────────────────┐
│                    ANTES → DEPOIS                           │
├─────────────────────────────────────────────────────────────┤
│ SEÇÃO "¿Qué recibes?":                                      │
│                                                             │
│ ANTES:                                                      │
│ ┌────────────────────────────────────┐                      │
│ │ 📹 +250 plantillas de videos       │                      │
│ └────────────────────────────────────┘                      │
│                                                             │
│ DEPOIS:                                                     │
│ ┌────────────────────────────────────┐                      │
│ │ 📹 +250 plantillas de videos       │                      │
│ │    Videos profesionales listos     │                      │
│ │    para editar en Canva...         │                      │
│ └────────────────────────────────────┘                      │
├─────────────────────────────────────────────────────────────┤
│ CARD DE PREÇO:                                              │
│                                                             │
│ ANTES:           DEPOIS:                                    │
│ ┌────────────┐   ┌────────────────────────┐                 │
│ │  $9,09/mes │   │      $9,09/mes         │                 │
│ │            │   │ ✓ +250 videos          │                 │
│ │ [BOTÃO]    │   │ ✓ Herramientas de IA   │                 │
│ └────────────┘   │ ✓ Calendario           │                 │
│                  │ ✓ Subtítulos           │                 │
│                  │ ✓ Actualizaciones      │                 │
│                  │ ✓ Soporte WhatsApp     │                 │
│                  │                        │                 │
│                  │ [BOTÃO]                │                 │
│                  └────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquivo Afetado

- `src/pages/PlanosES.tsx` (3 blocos de código modificados)

