import heroImage from "@/assets/influencers-banner.png";
import { Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-3xl p-8 md:p-12 mb-8 shadow-[var(--shadow-card)]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9ImhzbCgyMDAgOTUlIDQ1JSAvIDAuMDUpIi8+PC9zdmc+')] opacity-50" />
      
      <div className="relative grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Plataforma Completa de Conteúdo</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Materiais Prontos para Agências de Viagens
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Acesse templates, vídeos, artes e ferramentas de IA para criar conteúdo profissional e impulsionar suas vendas. Tudo em um só lugar! ✈️🌴
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
          <img 
            src={heroImage} 
            alt="Influencers de viagens Eva, Mel e Bia" 
            className="relative rounded-2xl shadow-2xl w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};
