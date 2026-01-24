import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacidade = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Política de Privacidade
        </h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Última atualização: Janeiro de 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              1. Coleta de Informações
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Coletamos informações que você nos fornece diretamente, como nome, email e dados de pagamento ao criar uma conta ou assinar nossos serviços. Também coletamos informações automaticamente, como dados de navegação e uso da plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              2. Uso das Informações
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos suas informações para: fornecer e melhorar nossos serviços, processar pagamentos, enviar comunicações sobre sua conta e novidades, e personalizar sua experiência na plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              3. Compartilhamento de Dados
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos suas informações pessoais. Compartilhamos dados apenas com provedores de serviços necessários para operar nossa plataforma (como processadores de pagamento) e quando exigido por lei.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              4. Segurança dos Dados
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              5. Cookies e Tecnologias Similares
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              6. Seus Direitos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Você tem direito a acessar, corrigir ou excluir suas informações pessoais. Para exercer esses direitos ou fazer perguntas sobre nossa política de privacidade, entre em contato conosco.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              7. Contato
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões sobre privacidade, entre em contato através do email:{" "}
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

export default Privacidade;
