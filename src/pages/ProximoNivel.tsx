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
  ArrowDown
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
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Treinamento Exclusivo
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AGENTE LUCRATIVO®
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                O próximo nível para quem quer <strong className="text-foreground">vender viagens todos os dias</strong>, não só criar conteúdo bonito
              </p>

              {/* YouTube Video Embed */}
              <div className="max-w-sm mx-auto pt-4">
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

              <div className="pt-4 space-y-3">
                <p className="text-lg text-muted-foreground">
                  Você já deu o primeiro passo. Agora sua agência tem estrutura, artes, vídeos e materiais profissionais dentro do Canva Viagem.
                </p>
                <p className="text-xl font-semibold text-foreground">
                  👉 Mas você sabe exatamente o que postar, anunciar e falar para isso virar venda?
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button 
                  onClick={handleCTAClick}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-lg px-8 py-6 h-auto font-bold shadow-lg"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  ATIVAR AGENTE LUCRATIVO AGORA
                </Button>
                
                <Button 
                  onClick={scrollToPricing}
                  variant="outline"
                  size="lg"
                  className="border-primary/30 text-primary hover:bg-primary/10 text-lg px-8 py-6 h-auto font-semibold"
                >
                  <ArrowDown className="mr-2 h-5 w-5" />
                  VER INVESTIMENTO
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-12 bg-red-50/50 dark:bg-red-950/10 border-y border-red-200/50 dark:border-red-900/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-8 w-8" />
                <h2 className="text-2xl md:text-3xl font-bold">
                  O PROBLEMA NÃO É CRIAR CONTEÚDO
                </h2>
              </div>
              <p className="text-xl md:text-2xl font-semibold text-foreground">
                É não saber o que realmente vende
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <Card className="border-red-200/50 dark:border-red-900/30 bg-background/50">
                  <CardContent className="p-6 space-y-3">
                    <p className="text-muted-foreground">A maioria dos agentes:</p>
                    <ul className="space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>Posta vídeos sem estratégia</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>Anuncia sem método</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>Gera conversas no WhatsApp...</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>E se perde na hora de fechar a venda</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-red-200/50 dark:border-red-900/30 bg-background/50">
                  <CardContent className="p-6 flex flex-col justify-center h-full">
                    <p className="text-lg font-semibold mb-4">Resultado?</p>
                    <div className="space-y-2 text-left">
                      <p>💸 Prejuízo</p>
                      <p>😵 Confusão</p>
                      <p>🔁 O mesmo ciclo se repetindo</p>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground italic">
                      Criar conteúdo é só o começo. Vender viagem todos os dias exige método.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Flame className="h-8 w-8" />
                <h2 className="text-2xl md:text-3xl font-bold">
                  É AQUI QUE ENTRA O AGENTE LUCRATIVO®
                </h2>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                O Agente Lucrativo® é um <strong className="text-foreground">treinamento prático de aceleração de vendas online</strong>, criado para agentes e agências de viagem que querem transformar conteúdo e anúncios em vendas reais.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Não é teoria
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Não é curso genérico de marketing
                </div>
              </div>

              <p className="text-lg font-medium text-foreground">
                É um método construído com base em <strong>anos vendendo viagens</strong> e gerenciando agências.
              </p>
            </div>
          </div>
        </section>

        {/* Simple Idea Section */}
        <section className="py-12 bg-gradient-to-br from-primary/5 to-accent/5">
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

        {/* Fast Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Clock className="h-8 w-8" />
                <h2 className="text-2xl md:text-3xl font-bold">
                  RÁPIDO DE CONSUMIR. RÁPIDO DE APLICAR.
                </h2>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                O método foi desenhado para quem vende viagem na vida real, não para quem quer virar "expert em marketing".
              </p>

              <div className="grid md:grid-cols-3 gap-6 pt-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-semibold">Conteúdo direto</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-semibold">Aplicação prática</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-semibold">Foco total em resultado</p>
                </div>
              </div>

              <p className="text-lg text-foreground font-medium pt-4">
                Você assiste, aplica e já sabe o que fazer no mesmo dia.
              </p>
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Target className="h-8 w-8" />
                <h2 className="text-2xl md:text-3xl font-bold">
                  O QUE VOCÊ VAI APRENDER
                </h2>
              </div>

              <div className="grid gap-6 pt-4">
                {/* Module 1 */}
                <Card className="text-left border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                        01
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Os 3 Códigos da Venda de Viagens Online</h3>
                        <p className="text-muted-foreground">
                          Entenda o que faz um viajante parar, confiar e comprar uma viagem pela internet.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Module 2 */}
                <Card className="text-left border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                        02
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Onde e para quem vender</h3>
                        <p className="text-muted-foreground mb-3">Aprenda a escolher:</p>
                        <ul className="space-y-1">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Destinos certos</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Públicos certos</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Plataformas certas</span>
                          </li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-3">
                          Sem gastar dinheiro com anúncio errado.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Module 3 */}
                <Card className="text-left border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                        03
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Produção 10x mais rápida com IA</h3>
                        <p className="text-muted-foreground mb-3">Use Inteligência Artificial para:</p>
                        <ul className="space-y-1">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Criar vídeos</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Criar anúncios</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Criar mensagens de WhatsApp</span>
                          </li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-3">
                          Ganhar velocidade sem perder qualidade.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Who is it for Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-primary">
                <Users className="h-8 w-8" />
                <h2 className="text-2xl md:text-3xl font-bold">
                  PARA QUEM ESSE TREINAMENTO É IDEAL
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-900/30">
                  <CardContent className="p-6 text-left">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Agentes de viagem autônomos</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Donos de pequenas e médias agências</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-900/30">
                  <CardContent className="p-6 text-left">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Quem já cria conteúdo, mas não vende de forma consistente</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Quem quer parar de perder dinheiro com anúncio mal feito</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <p className="text-xl font-semibold text-foreground pt-4">
                Se você vende viagem, isso é pra você.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing & CTA Section */}
        <section id="pricing" className="py-16 md:py-24 bg-gradient-to-br from-primary to-accent">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center text-white space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                💰 INVESTIMENTO
              </h2>
              <p className="text-lg opacity-90">
                (Upgrade dentro do Canva Viagem)
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-6">
                <div className="text-center">
                  <p className="text-5xl md:text-6xl font-bold">12x</p>
                  <p className="text-2xl md:text-3xl font-semibold">de R$ 10</p>
                </div>
                <div className="text-3xl font-light opacity-60">ou</div>
                <div className="text-center">
                  <p className="text-5xl md:text-6xl font-bold">R$ 97</p>
                  <p className="text-xl">por ano</p>
                </div>
              </div>

              <p className="text-lg opacity-90">
                Um único pacote vendido já paga o acesso.
              </p>

              <div className="pt-4">
                <Button 
                  onClick={handleCTAClick}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  <Rocket className="mr-2 h-6 w-6" />
                  ATIVAR AGENTE LUCRATIVO®
                </Button>
              </div>

              <p className="text-sm opacity-75 pt-4">
                Você já tem a ferramenta. Agora precisa do método certo para vender com ela.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              🚀 O PRÓXIMO PASSO É SEU
            </h2>
            <p className="text-lg text-muted-foreground">
              Você já tem a ferramenta. Agora precisa do <strong className="text-foreground">método certo</strong> para vender com ela.
            </p>
            <Button 
              onClick={handleCTAClick}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-lg px-8 py-6 h-auto font-bold shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
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
