import heroImage from "@/assets/influencers-banner.png";
import { Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-3xl p-8 md:p-12 mb-8 shadow-[var(--shadow-card)]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9ImhzbCgyMDAgOTUlIDQ1JSAvIDAuMDUpIi8+PC9zdmc+')] opacity-50" />

      <div className="relative grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          {/* Golden Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs font-semibold uppercase tracking-wider">1° App Travel Marketing Completo do Mundo</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-semibold leading-tight tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Venda Mais Viagens
            </h1>
            <p className="text-2xl md:text-3xl font-light bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              O Ano Inteiro
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Blue Badge */}
            <div className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-md w-fit">
              <span className="text-sm font-medium">📅 2 anos de postagens prontas</span>
            </div>

            <p className="text-lg leading-relaxed max-w-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-medium">
              Usando os vídeos, artes e IA e tudo que precisa pra crescer sua agência de viagens.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
              >
                Começar Agora
              </a>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
          <img
            src={heroImage}
            alt="Influencers de viagens Eva, Mel e Bia"
            className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
};
