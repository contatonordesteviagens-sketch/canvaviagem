import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Termos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Termos de Uso
        </h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Última atualização: Janeiro de 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              1. Aceitação dos Termos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e utilizar o Canva Viagem, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              2. Descrição do Serviço
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              O Canva Viagem é uma plataforma que oferece templates, legendas e ferramentas de marketing para agências de viagens. Nosso serviço inclui acesso a conteúdos exclusivos mediante assinatura.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              3. Uso dos Conteúdos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Os templates e conteúdos disponibilizados são para uso comercial dos assinantes em suas atividades de marketing. É proibida a revenda, redistribuição ou compartilhamento dos materiais com terceiros não autorizados.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              4. Assinaturas e Pagamentos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              As assinaturas são cobradas conforme o plano escolhido. Renovações são automáticas até que o cancelamento seja solicitado. Reembolsos seguem nossa política específica disponível na área do assinante.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              5. Propriedade Intelectual
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo disponibilizado na plataforma, incluindo designs, textos e materiais gráficos, é protegido por direitos autorais e pertence ao Canva Viagem ou seus licenciadores.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              6. Contato
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes termos, entre em contato através do email:{" "}
              <a 
                href="mailto:contato@canvaviagem.com" 
                className="text-primary hover:underline"
              >
                contato@canvaviagem.com
              </a>
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Termos;
