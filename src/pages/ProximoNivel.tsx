import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Rocket, 
  XCircle, 
  Flame, 
  Zap, 
  Target, 
  Brain, 
  Users, 
  Check,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Video,
  Megaphone,
  Clock,
  ArrowDown,
  ShieldCheck,
  UserSearch,
  Building2,
  Bot,
  Key
} from "lucide-react";
const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/X100779687E?checkoutMode=10";
const YOUTUBE_VIDEO_ID = "0uPJm4FNRfI";

const ProximoNivel = () => {
  const handleCTAClick = () => {
    window.open(HOTMART_CHECKOUT_URL, "_blank", "noopener,noreferrer");
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Mobile Optimized */}
        <section className="relative py-6 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center space-y-3 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-medium">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                Treinamento Exclusivo
              </div>
              
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AGENTE LUCRATIVO®
                </span>
              </h1>
              
              <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                O próximo nível para quem quer <strong className="text-foreground">vender viagens todos os dias</strong>, não só criar conteúdo bonito
              </p>

              {/* YouTube Video Embed - Smaller on mobile */}
              <div className="max-w-[280px] md:max-w-sm mx-auto pt-2 md:pt-4">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20">
                  <div className="aspect-[9/16]">
                    <iframe
                      src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=0&rel=0`}
                      title="Agente Lucrativo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 md:pt-4 space-y-2 md:space-y-3">
                <p className="text-sm md:text-lg text-muted-foreground">
                  Você já deu o primeiro passo. Agora sua agência tem estrutura, artes, vídeos e materiais profissionais dentro do Canva Viagem.
                </p>
                <p className="text-base md:text-xl font-semibold text-foreground">
                  👉 Mas você sabe exatamente o que postar, anunciar e falar para isso virar venda?
                </p>
              </div>

              {/* CTA Button - Single button on mobile, full-width */}
              <div className="pt-4 md:pt-6">
                <Button 
                  onClick={scrollToPricing}
                  size="lg"
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-sm md:text-lg px-6 md:px-8 py-3 md:py-6 h-12 md:h-auto font-bold shadow-lg"
                >
                  <ArrowDown className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  VER INVESTIMENTO
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section - Mobile Optimized */}
        <section className="py-8 md:py-12 bg-red-50/50 dark:bg-red-950/10 border-y border-red-200/50 dark:border-red-900/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-6 w-6 md:h-8 md:w-8" />
                <h2 className="text-lg md:text-2xl font-bold">
                  O PROBLEMA NÃO É CRIAR CONTEÚDO
                </h2>
              </div>
              <p className="text-base md:text-xl font-semibold text-foreground">
                É não saber o que realmente vende
              </p>
              
              <div className="grid md:grid-cols-2 gap-3 md:gap-4 pt-2 md:pt-4">
                <Card className="border-red-200/50 dark:border-red-900/30 bg-background/50">
                  <CardContent className="p-4 md:p-6 space-y-2 md:space-y-3">
                    <p className="text-sm md:text-base text-muted-foreground">A maioria dos agentes:</p>
                    <ul className="space-y-1.5 md:space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm md:text-base">Posta vídeos sem estratégia</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm md:text-base">Anuncia sem método</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm md:text-base">Gera conversas no WhatsApp...</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm md:text-base">E se perde na hora de fechar a venda</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-red-200/50 dark:border-red-900/30 bg-background/50">
                  <CardContent className="p-4 md:p-6 flex flex-col justify-center h-full">
                    <p className="text-base md:text-lg font-semibold mb-3 md:mb-4">Resultado?</p>
                    <div className="space-y-1.5 md:space-y-2 text-left text-sm md:text-base">
                      <p>💸 Prejuízo</p>
                      <p>😵 Confusão</p>
                      <p>🔁 O mesmo ciclo se repetindo</p>
                    </div>
                    <p className="mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground italic">
                      Criar conteúdo é só o começo. Vender viagem todos os dias exige método.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section - Mobile Optimized */}
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Flame className="h-6 w-6 md:h-8 md:w-8" />
                <h2 className="text-lg md:text-2xl font-bold">
                  É AQUI QUE ENTRA O AGENTE LUCRATIVO®
                </h2>
              </div>
              
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
                O Agente Lucrativo® é um <strong className="text-foreground">treinamento prático de aceleração de vendas online</strong>, criado para agentes e agências de viagem que querem transformar conteúdo e anúncios em vendas reais.
              </p>

              <div className="flex flex-wrap justify-center gap-2 md:gap-4 pt-2 md:pt-4">
                <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-muted rounded-full text-xs md:text-sm">
                  <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                  Não é teoria
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-muted rounded-full text-xs md:text-sm">
                  <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                  Não é curso genérico de marketing
                </div>
              </div>

              <p className="text-sm md:text-lg font-medium text-foreground">
                É um método construído com base em <strong>anos vendendo viagens</strong> e gerenciando agências.
              </p>
            </div>
          </div>
        </section>

        {/* Simple Idea Section - HIDDEN on mobile */}
        <section className="hidden md:block py-12 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-accent">
                <Brain className="h-8 w-8" />
                <h2 className="text-2xl md:text-3xl font-bold">
                  A IDEIA É SIMPLES (E FUNCIONA)
                </h2>
              </div>
              
              <p className="text-lg text-muted-foreground">
                Em vez de tentar descobrir sozinho:
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-background/80">
                  <CardContent className="p-4 text-center">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">O que postar</p>
                  </CardContent>
                </Card>
                <Card className="bg-background/80">
                  <CardContent className="p-4 text-center">
                    <Video className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Que tipo de vídeo funciona</p>
                  </CardContent>
                </Card>
                <Card className="bg-background/80">
                  <CardContent className="p-4 text-center">
                    <Megaphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Como anunciar sem perder dinheiro</p>
                  </CardContent>
                </Card>
              </div>

              <p className="text-xl font-semibold text-foreground pt-4">
                Você copia e aplica estratégias reais que já venderam milhões em viagens na internet usando vídeos e anúncios.
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                  👉 Sem reinventar a roda
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                  👉 Sem depender de sorte
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                  👉 Sem ficar testando no escuro
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Fast Section - Mobile Optimized */}
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Clock className="h-6 w-6 md:h-8 md:w-8" />
                <h2 className="text-lg md:text-2xl font-bold">
                  RÁPIDO DE CONSUMIR. RÁPIDO DE APLICAR.
                </h2>
              </div>
              
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
                O método foi desenhado para quem vende viagem na vida real, não para quem quer virar "expert em marketing".
              </p>

              <div className="grid grid-cols-3 gap-3 md:gap-6 pt-2 md:pt-4">
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                  </div>
                  <p className="text-sm md:text-base font-semibold">Conteúdo direto</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                  </div>
                  <p className="text-sm md:text-base font-semibold">Aplicação prática</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                  </div>
                  <p className="text-sm md:text-base font-semibold">Foco total em resultado</p>
                </div>
              </div>

              <p className="text-sm md:text-lg text-foreground font-medium pt-2 md:pt-4">
                Você assiste, aplica e já sabe o que fazer no mesmo dia.
              </p>
            </div>
          </div>
        </section>

        {/* Modules Section - Mobile Optimized */}
        <section className="py-8 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-4 md:space-y-6">
              {/* Badge */}
              <div className="inline-block">
                <span className="text-primary text-xs md:text-sm font-semibold uppercase tracking-wider">
                  Conteúdo Exclusivo
                </span>
              </div>
              
              {/* Title */}
              <h2 className="text-xl md:text-3xl font-bold">
                O que você vai{" "}
                <span className="text-accent">aprender</span>
              </h2>
              
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                Um passo a passo completo do básico ao avançado para acelerar suas vendas.
              </p>

              {/* Module Cards */}
              <div className="grid gap-4 md:gap-6 pt-2 md:pt-4">
                
                {/* Module 1 - IA */}
                <Card className="text-left border-0 shadow-md bg-card">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 md:h-7 md:w-7 text-white" />
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-accent/10 text-accent text-[10px] md:text-xs font-semibold rounded-full uppercase">
                          Módulo 01
                        </span>
                        <h3 className="text-base md:text-xl font-bold">
                          Inteligência Artificial para Vender Viagens Todos os Dias
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Use I.A como uma equipe de vendas trabalhando para você 24 horas por dia.
                        </p>
                        <ul className="space-y-1.5 md:space-y-2 pt-1 md:pt-2">
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Criar anúncios, roteiros, textos e criativos com IA</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Construir páginas, sistemas e estruturas de venda com IA</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Atender viajantes no WhatsApp com agentes de IA</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Operar como se tivesse vários assistentes vendendo por você</span>
                          </li>
                        </ul>
                        <p className="text-xs md:text-sm font-medium text-primary pt-1 md:pt-2">
                          Com IA é possível ter mais produtividade com menos esforço e mais vendas.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Module 2 - Anúncios */}
                <Card className="text-left border-0 shadow-md bg-card">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Target className="h-5 w-5 md:h-7 md:w-7 text-white" />
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-accent/10 text-accent text-[10px] md:text-xs font-semibold rounded-full uppercase">
                          Módulo 02
                        </span>
                        <h3 className="text-base md:text-xl font-bold">
                          Onde e Para Quem Vender: Precisão Máxima, Menos Desperdício
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Públicos que mais compram viagens pra você parar de gastar dinheiro tentando acertar no escuro. Aqui você aprende a anunciar com estratégia reduzindo erros e economizando verba.
                        </p>
                        <ul className="space-y-1.5 md:space-y-2 pt-1 md:pt-2">
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Como evitar curiosos e focar em quem realmente compra</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Como reduzir desperdício em Meta, Google e outras plataformas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Como anunciar com mais resultado mesmo com orçamento baixo</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Como jogar o jogo das plataformas sem cair na armadilha de gastar cada vez mais</span>
                          </li>
                        </ul>
                        <p className="text-xs md:text-sm font-medium text-primary pt-1 md:pt-2">
                          Menos prejuízo. Mais controle. Mais resultado.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Module 3 - Pilares */}
                <Card className="text-left border-0 shadow-md bg-card">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Key className="h-5 w-5 md:h-7 md:w-7 text-white" />
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-accent/10 text-accent text-[10px] md:text-xs font-semibold rounded-full uppercase">
                          Módulo 03
                        </span>
                        <h3 className="text-base md:text-xl font-bold">
                          Os 3 Pilares da Venda de Viagens no Piloto Automático
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          A estrutura que transforma interesse em confiança, e confiança em vendas, mesmo quando você não está online.
                        </p>
                        <ul className="space-y-1.5 md:space-y-2 pt-1 md:pt-2">
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Como tornar o viajante seguro para comprar pela internet</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Como construir uma presença profissional e confiável</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Como organizar conteúdo, anúncios e atendimento em um único sistema</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Como fazer sua estrutura trabalhar enquanto você foca nas vendas</span>
                          </li>
                        </ul>
                        <p className="text-xs md:text-sm font-medium text-primary pt-1 md:pt-2">
                          Vou te dar uma máquina de vendas rodando todos os dias.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </section>

        {/* Who is it for Section - Mobile Optimized */}
        <section className="py-8 md:py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-4 md:space-y-8">
              <h2 className="text-lg md:text-2xl font-bold text-foreground">
                Para quem é este <span className="underline decoration-primary decoration-2 underline-offset-4">treinamento?</span>
              </h2>

              <div className="flex justify-center gap-4 md:gap-8 pt-2 md:pt-4">
                <div className="flex flex-col items-center gap-2 md:gap-3 p-4 md:p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <UserSearch className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                  </div>
                  <p className="text-sm md:text-base font-semibold text-foreground">Agentes<br/>Autônomos</p>
                </div>
                <div className="flex flex-col items-center gap-2 md:gap-3 p-4 md:p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                  </div>
                  <p className="text-sm md:text-base font-semibold text-foreground">Donos de<br/>Agência</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & CTA Section - Mobile Optimized */}
        <section id="pricing" className="py-10 md:py-24 bg-background">
          <div className="container mx-auto px-4 max-w-[95%] md:max-w-md">
            <Card className="bg-gradient-to-br from-[hsl(220,20%,15%)] to-[hsl(220,20%,10%)] border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-5 md:p-8 text-center space-y-4 md:space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Garante a sua vaga agora
                </h3>

                {/* Price Display */}
                <div className="space-y-1 md:space-y-2">
                  <p className="text-muted-foreground line-through text-base md:text-lg">De R$ 997</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-white text-lg md:text-xl font-medium">12x de</span>
                    <span className="text-4xl md:text-5xl font-bold text-accent">R$ 10</span>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base">ou R$ 97 à vista/ano</p>
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handleCTAClick}
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-base md:text-lg px-6 md:px-8 py-4 md:py-6 h-auto font-bold shadow-lg transition-all hover:scale-105"
                >
                  QUERO GARANTIR MEU ACESSO
                </Button>

                {/* Guarantee */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs md:text-sm pt-1 md:pt-2">
                  <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                  <span>7 DIAS DE GARANTIA INCONDICIONAL</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA - Mobile Optimized */}
        <section className="py-8 md:py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-2xl font-bold">
              🚀 O PRÓXIMO PASSO É SEU
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground">
              Você já tem a ferramenta. Agora precisa do <strong className="text-foreground">método certo</strong> para vender com ela.
            </p>
            <Button 
              onClick={handleCTAClick}
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-sm md:text-lg px-6 md:px-8 py-3 md:py-6 h-12 md:h-auto font-bold shadow-lg"
            >
              <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Ativar Agente Lucrativo® Agora
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProximoNivel;
