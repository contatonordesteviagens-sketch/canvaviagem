import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Rocket, 
  XCircle, 
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  Sparkles
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
        {/* Hero Section - Clean and Minimal */}
        <section className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-br from-primary via-primary to-accent">
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <div className="text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium border border-white/30">
                <Sparkles className="h-4 w-4" />
                MÉTODO VALIDADO
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                AGENTE<br />LUCRATIVO®
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
                O próximo nível para quem quer <span className="font-bold underline decoration-2 underline-offset-4">vender viagens todos os dias</span>, não só criar conteúdo bonito.
              </p>

              {/* CTA Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleCTAClick}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-white text-lg px-8 py-6 h-auto font-bold shadow-xl rounded-full group"
                >
                  ATIVAR AGENTE LUCRATIVO AGORA
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Image/Video Section */}
          <div className="container mx-auto px-4 max-w-lg mt-8 relative z-10">
            <div className="relative">
              {/* Decorative gradient behind video */}
              <div className="absolute -inset-4 bg-gradient-to-br from-white/10 to-transparent rounded-3xl blur-xl" />
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-card">
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
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl" />
        </section>

        {/* Problem vs Solution Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Por que você ainda não<br />
                está <span className="underline decoration-primary decoration-4 underline-offset-4">faturando alto</span>?
              </h2>
            </div>

            {/* Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-6 relative">
              {/* Error Card */}
              <Card className="border-border bg-card shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">O Erro Comum</h3>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive/70 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Posta fotos de destinos sem nenhuma estratégia de conversão.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive/70 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Gasta horas editando vídeos que geram curtidas, mas zero vendas.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive/70 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Prejuízo mensal com ferramentas caras e pouco retorno.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* VS Badge - positioned between cards */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-12 h-12 rounded-full bg-accent text-white font-bold text-sm flex items-center justify-center shadow-lg">
                  VS
                </div>
              </div>

              {/* Mobile VS Badge */}
              <div className="flex md:hidden justify-center -my-3 relative z-10">
                <div className="w-12 h-12 rounded-full bg-accent text-white font-bold text-sm flex items-center justify-center shadow-lg">
                  VS
                </div>
              </div>

              {/* Solution Card */}
              <Card className="border-primary/30 bg-card shadow-lg ring-2 ring-primary/20">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Agente Lucrativo</h3>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">Funis de venda automáticos que trabalham enquanto você viaja.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">Abordagem persuasiva que transforma seguidores em clientes reais.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">Lucro previsível e escala no seu negócio de turismo.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing CTA Section */}
        <section id="pricing" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 max-w-2xl text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Pronto para o próximo nível?
            </h2>

            {/* Pricing */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary">12x</p>
                <p className="text-xl font-semibold text-foreground">de R$ 10</p>
              </div>
              <div className="text-2xl font-light text-muted-foreground">ou</div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary">R$ 97</p>
                <p className="text-lg text-muted-foreground">por ano</p>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={handleCTAClick}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white text-lg px-10 py-7 h-auto font-bold shadow-xl rounded-full w-full max-w-md"
            >
              QUERO SER UM AGENTE LUCRATIVO
            </Button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-2">
              <span>ACESSO IMEDIATO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <span>GARANTIA DE 7 DIAS</span>
            </div>
          </div>
        </section>

        {/* Sticky Bottom CTA - Mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:hidden z-50">
          <Button 
            onClick={handleCTAClick}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-white text-base px-6 py-4 h-auto font-bold shadow-xl rounded-full w-full flex items-center justify-center gap-2"
          >
            <Rocket className="h-5 w-5" />
            Garantir minha vaga com desconto
          </Button>
        </div>

        {/* Spacer for sticky bottom on mobile */}
        <div className="h-20 md:hidden" />
      </main>

      <Footer />
    </div>
  );
};

export default ProximoNivel;
