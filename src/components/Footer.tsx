import { Link } from "react-router-dom";
import { Plane, Palmtree, MapPin, Compass } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <Plane className="h-6 w-6 text-primary animate-pulse" />
            <Palmtree className="h-6 w-6 text-accent" />
            <MapPin className="h-6 w-6 text-primary" />
            <Compass className="h-6 w-6 text-accent animate-pulse" />
          </div>
          <p className="text-muted-foreground">
            Hub de Conteúdo Profissional para Agências de Viagens ✈️🌴
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 - Todos os direitos reservados
          </p>
          <div className="flex gap-4 text-sm">
            <Link 
              to="/privacidade" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link 
              to="/termos" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
