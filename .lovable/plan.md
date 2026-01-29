

# Plano: Landing Page de Alta Conversao - Canva Viagem

## Resumo

Reformulacao completa da pagina `/planos` com foco em conversao, adicionando gatilhos mentais estrategicos (urgencia, escassez, garantia, prova social), design mais impactante com gradientes e animacoes, e uma estrutura otimizada para funil de vendas.

---

## Mudancas Principais

### 1. Hero Section Otimizada
- Badge animado de urgencia com `animate-pulse`
- Headline com gradiente no texto (`bg-clip-text text-transparent`)
- Subheadline com palavras destacadas em cores diferentes
- Badges de prova social abaixo do GIF (R$0,50/video + 500 agencias)

### 2. Grid de GIFs com Hover Effects
- Adicionar `hover:scale-105 transition-transform duration-300`
- Titulo mais impactante: "SEU PERFIL BONITO E PROFISSIONAL EM 1 DIA!"

### 3. Secao "O que voce recebe" Melhorada
- Background gradiente sutil
- Items destacados (Videos Prontos + Agentes IA) com gradiente colorido
- Icons Lucide consistentes

### 4. Videos YouTube com Overlay
- Container preto com shadow
- Overlay gradiente com titulo no bottom

### 5. Card de Preco Aprimorado
- Preco riscado mais visivel
- CTA com icone Sparkles
- Microcopy de seguranca (garantia + pagamento seguro + cancele quando quiser)

### 6. Nova Secao de Garantia
- Background verde claro com borda lateral
- Shield icon grande
- Texto de garantia destacado

### 7. Social Proof CVC/Decolar
- Texto comparativo destacando marcas conhecidas

### 8. FAQ Reduzido (5 perguntas essenciais)
- Foco nas objecoes principais

### 9. CTA Final com Pulse
- Botao gigante com animacao
- Microcopy com emojis

---

## Estrutura do Codigo

### Imports Adicionais
```typescript
import { Shield, Clock, Infinity, Download } from "lucide-react";
```

### Constantes Atualizadas
```typescript
// Beneficios com destaque
const benefits = [
  { icon: Video, text: "+ 250 Videos Prontos", highlight: true },
  { icon: MessageSquare, text: "Suporte WhatsApp", highlight: false },
  { icon: Calendar, text: "Calendario Anual de Posts", highlight: false },
  { icon: FileText, text: "Texto e Legendas", highlight: false },
  { icon: Sparkles, text: "Aula Edicao no Canva", highlight: false },
  { icon: Shield, text: "Livres de direitos autorais", highlight: false },
  { icon: Bot, text: "10 Agentes de I.A de Marketing", highlight: true },
  { icon: Image, text: "Bonus: 200 Artes de Viagens", highlight: false },
  { icon: Users, text: "Bonus: 3 Influenciadoras", highlight: false },
  { icon: Infinity, text: "Atualizacoes e Garantia", highlight: false },
];

// FAQs reduzido
const faqs = [
  {
    question: "Como funciona o acesso?",
    answer: "Apos a confirmacao do pagamento, voce recebe um email com o link de acesso. E instantaneo! Voce entra na plataforma e ja pode baixar todos os 250+ videos."
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim! Nao ha fidelidade. Voce pode cancelar a qualquer momento e continua tendo acesso ate o final do periodo pago."
  },
  {
    question: "Os videos tem direitos autorais?",
    answer: "Nao! Todos os videos sao livres de direitos autorais para uso comercial. Voce pode usar em seus clientes sem problemas."
  },
  {
    question: "Como funciona o suporte?",
    answer: "Voce tem acesso direto ao nosso WhatsApp de suporte. Respondemos em ate 24h uteis e ajudamos com qualquer duvida sobre a plataforma."
  },
  {
    question: "Preciso de conhecimento tecnico?",
    answer: "Nao! Tudo e simples. Baixe os videos, edite no Canva (temos aula ensinando) e poste. Em 2 minutos voce tem conteudo profissional pronto."
  }
];
```

---

## Secoes JSX

### 1. Hero Section
```tsx
<section className="text-center mb-12 md:mb-20">
  {/* Badge de Urgencia */}
  <Badge className="mb-6 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white animate-pulse">
    <Sparkles className="h-4 w-4 mr-2" />
    OFERTA EXCLUSIVA - Apenas R$9,90/mes
  </Badge>
  
  {/* Headline com Gradiente */}
  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4">
    <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
      VENDA + VIAGENS
    </span>
    <br />
    <span className="text-foreground">O ANO INTEIRO!</span>
  </h1>
  
  {/* Subheadline */}
  <p className="text-xl md:text-2xl text-muted-foreground mb-8">
    Tenha acesso a <span className="text-primary font-bold">250 videos de viagens</span>
    <br />e poste em <span className="text-accent font-bold">2 minutos</span>.
  </p>
  
  {/* GIF Hero */}
  <img src={heroGif} className="mx-auto rounded-2xl shadow-2xl md:max-w-2xl mb-6" />
  
  {/* Badges de Prova Social */}
  <div className="flex flex-col md:flex-row items-center justify-center gap-4">
    <Badge variant="outline" className="px-4 py-2">
      <Check className="h-4 w-4 mr-2 text-primary" />
      Menos de R$ 0,50 por video
    </Badge>
    <Badge variant="outline" className="px-4 py-2">
      <Shield className="h-4 w-4 mr-2 text-accent" />
      Aprovado por +500 Agencias
    </Badge>
  </div>
</section>
```

### 2. Grid de GIFs
```tsx
<section className="mb-12 md:mb-20">
  <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
    SEU PERFIL BONITO E PROFISSIONAL EM 1 DIA!
  </h2>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
    {proofGifs.map((gif, index) => (
      <div key={index} className="rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
        <img src={gif} className="w-full h-48 md:h-64 object-cover" />
      </div>
    ))}
  </div>
</section>
```

### 3. Secao de Beneficios
```tsx
<section className="mb-12 md:mb-20">
  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 md:p-12 rounded-3xl">
    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
      O que e o Pack de Videos?
    </h2>
    <p className="text-center text-muted-foreground text-lg mb-8">
      Voce recebe o link para baixar mais de 250 videos de destinos nacionais e internacionais para publicar.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {benefits.map((item, index) => (
        <div 
          key={index} 
          className={`flex items-center gap-3 p-4 rounded-lg ${
            item.highlight 
              ? 'bg-gradient-to-r from-primary to-accent text-white font-semibold' 
              : 'bg-background/50'
          }`}
        >
          <item.icon className={`h-5 w-5 ${item.highlight ? 'text-white' : 'text-primary'}`} />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  </div>
</section>
```

### 4. Videos YouTube com Overlay
```tsx
<section className="mb-12 md:mb-20">
  <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
    Veja Exemplos Reais dos Videos
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {youtubeVideos.map((video) => (
      <div key={video.id} className="bg-black rounded-xl overflow-hidden shadow-xl relative">
        <iframe
          className="w-full aspect-[9/16]"
          src={`https://www.youtube.com/embed/${video.id}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-white text-sm font-medium">{video.title}</p>
        </div>
      </div>
    ))}
  </div>
</section>
```

### 5. Card de Preco
```tsx
<section className="mb-12 md:mb-20">
  <Card className="max-w-2xl mx-auto border-2 border-primary/20">
    <CardContent className="p-8 md:p-12 text-center">
      <p className="text-2xl line-through text-gray-400 mb-2">de R$ 197,00</p>
      <div className="flex items-baseline justify-center mb-6">
        <span className="text-5xl md:text-6xl font-black text-primary">R$ 9,90</span>
        <span className="text-xl text-muted-foreground ml-2">/mes</span>
      </div>
      
      <Button 
        size="lg" 
        onClick={handleCheckout}
        className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg font-bold shadow-lg hover:shadow-xl"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Quero meu acesso!
      </Button>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="h-4 w-4" /> garantia de 7 dias
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" /> pagamento seguro
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Cancele quando quiser - Acesso imediato apos confirmacao
      </p>
    </CardContent>
  </Card>
</section>
```

### 6. Secao de Garantia
```tsx
<section className="mb-12 md:mb-20">
  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-l-4 border-green-500 p-6 md:p-8 rounded-xl">
    <div className="flex flex-col items-center text-center">
      <Shield className="w-16 h-16 text-green-600 mb-4" />
      <h3 className="text-2xl md:text-3xl font-bold mb-4">Garantia Total de 7 Dias</h3>
      <p className="text-lg text-muted-foreground">
        Em 3 dias seu perfil vai ter o dobro de engajamento ou{' '}
        <span className="font-bold text-green-600">devolvo seu dinheiro</span>.
      </p>
    </div>
  </div>
</section>
```

### 7. Social Proof
```tsx
<section className="mb-12 md:mb-20 text-center">
  <p className="text-xl md:text-2xl font-semibold">
    Seu perfil vai ficar parecido com o da{' '}
    <span className="text-primary font-bold">CVC</span> e{' '}
    <span className="text-accent font-bold">Decolar</span>, concorda?
  </p>
</section>
```

### 8. CTA Final
```tsx
<section className="mb-12">
  <div className="text-center">
    <Button 
      size="lg" 
      onClick={handleCheckout}
      className="text-xl px-12 h-16 bg-gradient-to-r from-primary to-accent animate-pulse shadow-2xl hover:shadow-3xl"
    >
      <Sparkles className="mr-2 h-6 w-6" />
      Comecar Agora por R$ 9,90/mes
    </Button>
    <p className="text-sm text-muted-foreground mt-4">
      Acesso imediato - Pagamento 100% seguro - Cancele quando quiser
    </p>
  </div>
</section>
```

---

## Responsividade

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Hero font | text-4xl | text-6xl | text-7xl |
| Grid GIFs | grid-cols-2 | grid-cols-3 | grid-cols-3 |
| Grid YouTube | grid-cols-1 | grid-cols-2 | grid-cols-4 |
| Beneficios | grid-cols-1 | grid-cols-2 | grid-cols-2 |
| Container padding | px-3 | px-4 | px-4 |
| Secao spacing | mb-12 | mb-16 | mb-20 |

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Planos.tsx` | Redesign completo com novos componentes de conversao |

---

## Secoes Mantidas

1. Header e Footer existentes
2. UserInfoCard para usuarios logados
3. Logica de checkout (handleCheckout)
4. Estados de loading
5. View de assinante ativo (sem alteracoes)
6. Meta Pixel tracking existente

---

## Resultado Esperado

Landing page otimizada para conversao com:
- Badge de urgencia animado no topo
- Headline com gradiente impactante
- Prova social forte (500+ agencias, CVC/Decolar)
- Hover effects nos GIFs
- Beneficios com itens destacados em gradiente
- Videos YouTube com overlay de titulo
- Card de preco com microcopy de seguranca
- Secao de garantia verde
- Social proof com marcas conhecidas
- CTA final com pulse animation
- FAQ reduzido focado em objecoes

**Meta**: Aumentar taxa de conversao em 2-3x atraves de gatilhos mentais estrategicos e design otimizado.

