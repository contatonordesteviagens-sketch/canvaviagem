
# Plano: Reformular Pagina de Planos com Novo Conteudo

## Resumo

Redesign completo da pagina `/planos` mantendo o design system existente (cores, tipografia, componentes), substituindo o conteudo atual por novas secoes com GIFs, videos do YouTube e proposta de valor mais impactante.

---

## Estrutura Nova da Pagina

### Secao 1: Hero Principal
- **Titulo**: "VENDA + VIAGENS O ANO INTEIRO!"
- **Subtitulo**: "Tenha acesso a 250 videos de viagens e poste em 2 minutos."
- **GIF Hero**: giphy.com/6osnZ6joYcPfERZsaE (animacao principal)
- **Badge**: "Menos de R$ 0,5 centavos por video"

### Secao 2: Prova Social com GIFs
- **Titulo**: "Mais de 500 midias e Videos Aprovados por Agencias de Viagens"
- **Grid 3x2** (3 colunas desktop, 2 colunas mobile):
  - GIF 1: tJPdq4gvTvr8CgIyWI
  - GIF 2: ZQZVm01DFW3qHY0ZKs
  - GIF 3: mbylDFYWSU46XeLcsS
  - GIF 4: VcFJaM72FG76eG75In
  - GIF 5: 22QqF0ECtSnOvpiQLZ
  - GIF 6: VVMI7dobalrJhKmQOZ

### Secao 3: Perfil Profissional
- **Titulo**: "SEU PERFIL BONITO E PROFISSIONAL EM 1 DIA!"
- **GIF existente** (manter o que ja tem na pagina)

### Secao 4: O que e o Pack
- **Titulo**: "O que e o Pack de Videos?"
- **Descricao**: "Voce recebe o link para baixar mais de 250 videos de destinos nacionais e internacionais para publicar"

### Secao 5: Lista de Entregaveis
- **Titulo**: "O que voce vai receber:"
- Lista completa:
  - + 250 Videos Prontos
  - Suporte Whatsapp
  - Calendario Anual de Posts
  - Texto e Legendas
  - Aula Edicao no Canva
  - Livres de direitos autorais
  - 10 Agentes de I.A de Marketing
  - Bonus: 200 Artes de Viagens
  - Bonus: 3 Influenciadoras
  - Atualizacoes e Garantia

### Secao 6: Preco
- **De**: R$ 197 (riscado)
- **Por**: R$ 9,90/mes
- **Badges**: Garantia 7 dias | Pagamento seguro
- **Imagem selo de garantia**: Copiar imagem enviada para src/assets/garantia-7-dias.png
- **CTA**: Botao laranja pulsante

### Secao 7: Videos YouTube
- **Titulo**: "Veja exemplos de videos inclusos"
- **Grid 2x2** (2 colunas mobile, 4 desktop):
  - Fernando de Noronha Takes: dvInvZZ7fLY
  - Veneza Italia: vUgCtB-yUPg
  - Fernando de Noronha: KsGg1kWgFjA
  - Jalapao: QcwzHP3Y3Nc
- Aspect ratio vertical (9:16 proporcao)

### Secao 8: FAQ (manter existente)
- Manter os 12 itens de FAQ atuais

### Secao 9: CTA Final
- Manter estrutura atual com gradiente e botao

---

## Componentes a Remover

1. Video Wistia inicial (linhas 327-342)
2. Imagens promocionais estaticas (planos-hero, planos-voce-recebe, planos-features, planos-pro) (linhas 345-361)
3. Secao de comparacao "Com vs Sem" (ja removida)

---

## Componentes a Manter

1. Header e Footer
2. UserInfoCard para usuarios logados
3. Logica de checkout (handleCheckout, handleManageSubscription)
4. Estados de loading
5. Accordion FAQ
6. Design system (cores, sombras, gradientes)
7. Fluxo de assinante ativo (linhas 253-319)
8. Alerta para usuarios logados sem assinatura

---

## Alteracoes no Codigo

### Arquivo: `src/pages/Planos.tsx`

#### Remover imports nao utilizados
```typescript
// REMOVER:
import planosHero from "@/assets/planos-hero.webp";
import planosVoceRecebe from "@/assets/planos-voce-recebe.webp";
import planosFeatures from "@/assets/planos-features.webp";
import planosPro from "@/assets/planos-pro.webp";

// ADICIONAR:
import garantia7dias from "@/assets/garantia-7-dias.png";
```

#### Novas constantes para GIFs e Videos
```typescript
const heroGif = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm5kcmcybmE2aTFkOTU3ZDNqYmZkbHQ2YjRibjB1NjFtN2RoNWdrMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6osnZ6joYcPfERZsaE/giphy.gif";

const proofGifs = [
  "https://media4.giphy.com/media/tJPdq4gvTvr8CgIyWI/giphy.gif",
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWt3MGhsd3g1MnJtbzlkMDloczlhdTJvNWhubjZ4Z3FtNnJkeDd1aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZQZVm01DFW3qHY0ZKs/giphy.gif",
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3J2anV0aTVkYWowbDl1ZXFtNnB4ZWUwcnVnZTVzOW91ZzNncGNvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mbylDFYWSU46XeLcsS/giphy.gif",
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXQ1dHAxM2JxcWM0N3VqdWhibnBtcDR5eWVmNTZwaGI1NTJjeml3diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VcFJaM72FG76eG75In/giphy.gif",
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa24wbWJoa2swZXVyY3h5eDgxY3FhdWR2cHg5MDhrN3p2ZGExYWtpNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/22QqF0ECtSnOvpiQLZ/giphy.gif",
  "https://media4.giphy.com/media/VVMI7dobalrJhKmQOZ/giphy.gif",
];

const youtubeVideos = [
  { id: "dvInvZZ7fLY", title: "Fernando de Noronha Takes" },
  { id: "vUgCtB-yUPg", title: "Veneza Italia" },
  { id: "KsGg1kWgFjA", title: "Fernando de Noronha" },
  { id: "QcwzHP3Y3Nc", title: "Jalapao" },
];
```

#### Nova lista de entregaveis
```typescript
const deliverables = [
  { icon: Video, text: "+ 250 Videos Prontos" },
  { icon: MessageSquare, text: "Suporte Whatsapp" },
  { icon: Calendar, text: "Calendario Anual de Posts" },
  { icon: FileText, text: "Texto e Legendas" },
  { icon: Image, text: "Aula Edicao no Canva" },
  { icon: Check, text: "Livres de direitos autorais" },
  { icon: Bot, text: "10 Agentes de I.A de Marketing" },
  { icon: Sparkles, text: "Bonus: 200 Artes de Viagens" },
  { icon: Users, text: "Bonus: 3 Influenciadoras" },
  { icon: RefreshCw, text: "Atualizacoes e Garantia" },
];
```

#### Nova estrutura do JSX (return principal para nao-assinantes)

```tsx
return (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-5xl">
      {user && <UserInfoCard />}

      {/* SECAO 1: Hero Principal */}
      <section className="text-center mb-10 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
          <span className="text-primary">VENDA + VIAGENS</span>
          <br />
          O ANO INTEIRO!
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          Tenha acesso a 250 videos de viagens e poste em 2 minutos.
        </p>
        <img 
          src={heroGif} 
          alt="Videos de viagens" 
          className="mx-auto rounded-2xl shadow-lg max-w-xs md:max-w-md"
        />
        <Badge className="mt-4 bg-green-100 text-green-800 border-green-200">
          Menos de R$ 0,50 centavos por video
        </Badge>
      </section>

      {/* SECAO 2: Prova Social GIFs */}
      <section className="mb-10 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Mais de 500 midias e Videos Aprovados
          <span className="block text-primary">por Agencias de Viagens</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {proofGifs.map((gif, index) => (
            <img 
              key={index}
              src={gif} 
              alt={`Exemplo de video ${index + 1}`}
              className="w-full rounded-xl shadow-md aspect-[9/16] object-cover"
            />
          ))}
        </div>
      </section>

      {/* SECAO 3: Perfil Profissional */}
      <section className="text-center mb-10 md:mb-16 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-6 md:p-10">
        <h2 className="text-2xl md:text-4xl font-bold mb-2">
          SEU PERFIL BONITO
        </h2>
        <h3 className="text-xl md:text-3xl font-bold text-primary mb-6">
          E PROFISSIONAL EM 1 DIA!
        </h3>
        <img 
          src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmo1NGh5cGxiZG1vdHl3bmZxNTBxd2h0aDBsbXkxa2xhNWk4bmE4aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MpVJ9IjphA5p6sO8Zr/giphy.gif"
          alt="Perfil profissional"
          className="mx-auto rounded-xl shadow-lg max-w-[200px] md:max-w-[280px]"
        />
      </section>

      {/* SECAO 4: O que e o Pack */}
      <section className="mb-10 md:mb-16">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">
              O que e o Pack de Videos?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground text-lg mb-8">
              Voce recebe o link para baixar mais de 250 videos de destinos nacionais 
              e internacionais para publicar.
            </p>
            
            {/* Lista de entregaveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliverables.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SECAO 5: Preco com Garantia */}
      <section className="mb-10 md:mb-16 text-center">
        <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-white">
          <p className="text-lg opacity-80 line-through mb-2">de R$ 197</p>
          <p className="text-xl mb-2">por apenas</p>
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-3xl font-bold">R$</span>
            <span className="text-7xl md:text-8xl font-extrabold mx-1">9</span>
            <span className="text-3xl font-bold">,90</span>
            <span className="text-xl opacity-80 ml-2">/mes</span>
          </div>
          
          {/* Selo de garantia */}
          <img 
            src={garantia7dias}
            alt="Garantia 7 dias incondicional"
            className="mx-auto w-24 md:w-32 mb-4"
          />
          
          <div className="flex items-center justify-center gap-4 text-sm opacity-80 mb-6">
            <span>garantia de 7 dias</span>
            <span>|</span>
            <span>pagamento seguro</span>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleCheckout} 
            disabled={checkoutLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white pulse px-8 py-6 text-xl"
          >
            {checkoutLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "Quero meu acesso!"
            )}
          </Button>
        </div>
      </section>

      {/* SECAO 6: Videos YouTube */}
      <section className="mb-10 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Veja exemplos de videos inclusos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {youtubeVideos.map((video) => (
            <div key={video.id} className="aspect-[9/16] rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </section>

      {/* Alert para usuarios logados sem assinatura */}
      {user && (
        <div className="bg-amber-50 ... "> {/* manter codigo existente */}
        </div>
      )}

      {/* SECAO 7: FAQ - manter existente */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
        <Accordion ...>
          {/* manter codigo existente */}
        </Accordion>
      </div>

      {/* SECAO 8: CTA Final - manter estrutura existente */}
      <Card className="bg-gradient-to-r from-primary to-accent text-white">
        ...
      </Card>
    </div>
    <Footer />
  </div>
);
```

---

## Assets

### Copiar imagem do selo de garantia
- **Origem**: `user-uploads://image-36.png`
- **Destino**: `src/assets/garantia-7-dias.png`
- **Uso**: Import ES6 no componente

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Planos.tsx` | Redesign completo da estrutura para nao-assinantes |
| `src/assets/garantia-7-dias.png` | Copiar imagem do selo de garantia |

---

## Secoes Mantidas do Codigo Original

1. Imports de hooks e utilitarios (linhas 1-18)
2. Estados e logica de negocio (linhas 29-106)
3. Funcoes handleCheckout, handleManageSubscription, handleRefreshSubscription
4. Array faqs completo (linhas 205-241)
5. Tela de loading (linhas 242-250)
6. Tela de assinante ativo (linhas 253-319)
7. Footer e Header

---

## Responsividade

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| Grid GIFs prova social | 2 colunas | 3 colunas |
| Grid YouTube | 2 colunas | 4 colunas |
| Lista entregaveis | 1 coluna | 2 colunas |
| Preco fonte | text-7xl | text-8xl |
| Espacamento | py-6, mb-10 | py-8, mb-16 |

---

## Resultado Esperado

Pagina mais visual e impactante com:
- GIF animado no hero chamando atencao
- Prova social com grid de 6 GIFs mostrando exemplos reais
- Secao de valor "Perfil Profissional em 1 dia"
- Lista clara de 10 entregaveis com icones
- Preco destacado com selo de garantia
- 4 videos YouTube embutidos verticais
- FAQ mantido
- CTA final mantido
