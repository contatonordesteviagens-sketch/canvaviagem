import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TemplateCardProps {
  title: string;
  url: string;
  icon: string;
  category?: string;
  isNew?: boolean;
}

export const TemplateCard = ({ title, url, icon, category, isNew }: TemplateCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, 'canva-editor');
  };

  return (
    <Card className="group hover:shadow-[var(--shadow-hover)] transition-all duration-300 border-border/50 overflow-hidden relative">
      {isNew && (
        <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
          Novo
        </span>
      )}
      <CardHeader className="bg-gradient-to-br from-primary/5 to-accent/5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <CardTitle className="text-base leading-tight">{title}</CardTitle>
          </div>
          {category && (
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground whitespace-nowrap">
              {category}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Button
          asChild
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md"
        >
          <a href={url} rel="noopener noreferrer" onClick={handleClick} className="flex items-center justify-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Editar no Canva
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
