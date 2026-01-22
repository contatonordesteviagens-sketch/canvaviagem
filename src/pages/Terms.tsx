import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Canva Viagens, você concorda com estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Descrição do Serviço</h2>
            <p>
              O Canva Viagens é uma plataforma de templates e recursos de marketing digital 
              voltada para profissionais do turismo e agências de viagens. Oferecemos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Templates editáveis para redes sociais</li>
              <li>Vídeos prontos para uso</li>
              <li>Calendário anual de conteúdo</li>
              <li>Ferramentas de IA para criação de conteúdo</li>
              <li>Legendas e textos prontos</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Pagamentos e Assinatura</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>O acesso à plataforma requer uma assinatura mensal paga</li>
              <li>Os pagamentos são processados de forma segura pelo Stripe</li>
              <li>A cobrança é recorrente e renovada automaticamente todo mês</li>
              <li>Você pode cancelar a qualquer momento sem multas ou taxas adicionais</li>
              <li>O acesso permanece ativo até o final do período pago</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Cancelamento e Reembolso</h2>
            <p>
              Você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento. 
              Após o cancelamento:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Seu acesso permanece ativo até o final do período pago</li>
              <li>Não há cobranças adicionais após o cancelamento</li>
              <li>Reembolsos podem ser solicitados dentro de 7 dias após a compra</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Uso Permitido</h2>
            <p>Ao usar nossa plataforma, você concorda em:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar o conteúdo apenas para fins comerciais legítimos</li>
              <li>Não revender ou redistribuir os templates e recursos</li>
              <li>Não compartilhar seu acesso com terceiros</li>
              <li>Respeitar os direitos autorais e marcas registradas</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponível na plataforma, incluindo templates, vídeos, imagens e textos, 
              é de propriedade do Canva Viagens ou licenciado para uso. Você recebe uma licença 
              não-exclusiva para uso comercial do conteúdo enquanto mantiver sua assinatura ativa.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Limitação de Responsabilidade</h2>
            <p>
              O Canva Viagens fornece os recursos "como estão" e não garante resultados específicos 
              de vendas ou marketing. Não nos responsabilizamos por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resultados comerciais obtidos com o uso dos templates</li>
              <li>Interrupções temporárias do serviço</li>
              <li>Uso indevido do conteúdo por parte do usuário</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Modificações dos Termos</h2>
            <p>
              Podemos atualizar estes termos periodicamente. Notificaremos os usuários sobre 
              mudanças significativas por e-mail ou através da plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, entre em contato:
            </p>
            <p>
              <strong>WhatsApp:</strong>{" "}
              <a 
                href="https://wa.me/5585986411294" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                (85) 9 8641-1294
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
