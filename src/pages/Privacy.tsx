import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Introdução</h2>
            <p>
              O Canva Viagens respeita a sua privacidade e está comprometido em proteger seus dados pessoais. 
              Esta política de privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações 
              quando você usa nossa plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Dados que Coletamos</h2>
            <p>Podemos coletar os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de identificação:</strong> nome, endereço de e-mail</li>
              <li><strong>Dados de pagamento:</strong> processados de forma segura pelo Stripe</li>
              <li><strong>Dados de uso:</strong> como você interage com nossa plataforma</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Como Usamos Seus Dados</h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e manter nosso serviço</li>
              <li>Processar pagamentos e gerenciar assinaturas</li>
              <li>Enviar comunicações importantes sobre o serviço</li>
              <li>Melhorar nossa plataforma e experiência do usuário</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos seus dados pessoais. Podemos compartilhar informações com:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Processadores de pagamento:</strong> Stripe, para processar transações</li>
              <li><strong>Provedores de serviço:</strong> que nos ajudam a operar a plataforma</li>
              <li><strong>Autoridades legais:</strong> quando exigido por lei</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, 
              incluindo criptografia, controle de acesso e monitoramento de segurança.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Cookies e Tecnologias Similares</h2>
            <p>
              Usamos cookies para melhorar sua experiência, analisar o uso da plataforma e 
              personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas 
              configurações do seu navegador.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Seus Direitos</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Cancelar sua assinatura a qualquer momento</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Contato</h2>
            <p>
              Para dúvidas sobre esta política ou para exercer seus direitos, entre em contato:
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

export default Privacy;
